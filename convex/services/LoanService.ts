/**
 * LoanService — the loan lifecycle use cases.
 *
 * Central rules:
 *  - request: validate the range, reject if it overlaps an *approved/active*
 *    loan (the tool is already committed), auto-decline the borrower's own
 *    overlapping *pending* requests, then insert as pending. All in one mutation.
 *  - approve: move pending -> approved, then auto-decline other borrowers'
 *    pending requests that overlap (one tool, one loan at a time).
 *  - decline / cancel / markReturned: state-machine guarded, each enqueues a
 *    minimized notification payload.
 *
 * Scheduling: each enqueue happens in the same transaction; the AutomationService
 * schedules the (out-of-band) delivery action via the passed `deliverRef`.
 */
import type { FunctionReference } from 'convex/server';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { LoanRepository, type LoanDoc, type ILoanRepository } from '../repositories/LoanRepository';
import { ToolRepository, type IToolRepository } from '../repositories/ToolRepository';
import { UserRepository, type IUserRepository } from '../repositories/UserRepository';
import { AutomationService } from './AutomationService';
import { DateRange } from '../domain/DateRange';
import { LoanPolicy, type LoanActor } from '../domain/LoanPolicy';
import { Clock, today, daysBetween } from '../domain/Clock';
import { Conflict, NotFound, ValidationError } from '../domain/errors';
import { AccessControl, type Actor } from '../security/AccessControl';
import {
  buildRequested,
  buildApproved,
  buildDeclined,
  buildCancelled,
  buildReturned,
  type AnyPayload,
} from '../integrations/payloads';
import { WEBHOOK_EVENTS } from '../domain/constants';

const SUPERSEDED_REASON = 'Superseded by a newer request.';

export class LoanService {
  private loans: ILoanRepository;
  private tools: IToolRepository;
  private users: IUserRepository;
  private automation: AutomationService;

  constructor(
    private readonly ctx: MutationCtx | QueryCtx,
    private readonly actor: Actor,
    deliverRef: FunctionReference<'action', 'public' | 'internal'> | null = null,
    private readonly clock: Clock = { now: () => Date.now() },
  ) {
    this.loans = new LoanRepository(ctx);
    this.tools = new ToolRepository(ctx);
    this.users = new UserRepository(ctx);
    this.automation = new AutomationService(ctx, actor, deliverRef);
  }

  // ── request ──────────────────────────────────────────────────────────────
  async request(input: {
    toolId: string;
    startDate: number;
    endDate: number;
    requestNote?: string;
  }): Promise<LoanDoc> {
    const tool = await this.tools.byId(input.toolId);
    if (!tool) throw new NotFound('Tool', input.toolId);

    if (tool.userId === this.actor.userId) {
      throw new ValidationError("You can't request your own tool.");
    }

    const range = DateRange.create(
      new Date(input.startDate),
      new Date(input.endDate),
    );
    LoanPolicy.validateRequestRange(range);

    const overlaps = await this.loans.findOverlapping(
      tool._id,
      range.startDate.getTime(),
      range.endDate.getTime(),
    );

    // Approved/active loans block the new range entirely.
    const committed = overlaps.filter((l) => l.status === 'approved' || l.status === 'active');
    if (committed.length > 0) {
      throw new Conflict(
        'That tool is already booked for part of the requested dates.',
      );
    }

    // The borrower's own pending requests for this range are superseded.
    const superseded = overlaps.filter(
      (l) => l.status === 'pending' && l.borrowerId === this.actor.userId,
    );
    await this.declineMany(
      superseded.map((l) => l._id),
      SUPERSEDED_REASON,
    );

    const loan = await this.loans.insert({
      toolId: tool._id,
      borrowerId: this.actor.userId,
      lenderId: tool.userId,
      startDate: range.startDate.getTime(),
      endDate: range.endDate.getTime(),
      requestNote: input.requestNote,
    });

    await this.notify(WEBHOOK_EVENTS.loanRequested, (loanId) =>
      buildRequested({
        loanId,
        toolName: tool.name,
        borrowerName: this.actor.name,
        range,
        requestNote: input.requestNote,
      }),
      loan._id,
    );

    return loan;
  }

  // ── approve ──────────────────────────────────────────────────────────────
  async approve(loanId: string): Promise<LoanDoc> {
    const loan = await this.requireLoan(loanId);
    AccessControl.assertOwner(this.actor, loan.lenderId);
    LoanPolicy.assertCanTransition(loan.status, 'approved', 'lender');

    const nowMs = this.clock.now();
    await this.loans.update(loanId, { status: 'approved', actedAt: nowMs });

    // Auto-decline other borrowers' pending requests that overlap this loan.
    const overlaps = await this.loans.findOverlapping(
      loan.toolId,
      loan.startDate,
      loan.endDate,
    );
    const rivals = overlaps.filter(
      (l) => l.status === 'pending' && l.borrowerId !== loan.borrowerId,
    );
    await this.declineMany(
      rivals.map((l) => l._id),
      'Another request for these dates was approved.',
    );

    const tool = await this.tools.byId(loan.toolId);
    await this.notify(WEBHOOK_EVENTS.loanApproved, () =>
      buildApproved({
        loanId,
        toolName: tool?.name ?? 'your tool',
        lenderName: this.actor.name,
        range: DateRange.create(new Date(loan.startDate), new Date(loan.endDate)),
      }),
      loanId,
    );

    return { ...loan, status: 'approved', actedAt: nowMs };
  }

  // ── decline ──────────────────────────────────────────────────────────────
  async decline(loanId: string, reason?: string): Promise<LoanDoc> {
    const loan = await this.requireLoan(loanId);
    AccessControl.assertOwner(this.actor, loan.lenderId);
    LoanPolicy.assertCanTransition(loan.status, 'declined', 'lender');

    const nowMs = this.clock.now();
    await this.loans.update(loanId, {
      status: 'declined',
      declinedReason: reason,
      actedAt: nowMs,
    });

    const tool = await this.tools.byId(loan.toolId);
    await this.notify(WEBHOOK_EVENTS.loanDeclined, () =>
      buildDeclined({
        loanId,
        toolName: tool?.name ?? 'your tool',
        lenderName: this.actor.name,
        declinedReason: reason,
      }),
      loanId,
    );

    return { ...loan, status: 'declined', declinedReason: reason, actedAt: nowMs };
  }

  // ── cancel ───────────────────────────────────────────────────────────────
  async cancel(loanId: string): Promise<LoanDoc> {
    const loan = await this.requireLoan(loanId);
    if (loan.borrowerId !== this.actor.userId && this.actor.role !== 'admin') {
      throw new ValidationError('Only the borrower can cancel a request.');
    }
    if (!LoanPolicy.isCancellable(loan.status)) {
      throw new Conflict('This request can no longer be cancelled.');
    }
    const actorType: LoanActor = this.actor.role === 'admin' ? 'admin' : 'borrower';
    LoanPolicy.assertCanTransition(loan.status, 'cancelled', actorType);

    await this.loans.update(loanId, { status: 'cancelled' });

    const tool = await this.tools.byId(loan.toolId);
    const borrowerName =
      loan.borrowerId === this.actor.userId
        ? this.actor.name
        : (await this.users.getByUserId(loan.borrowerId))?.name ?? 'A borrower';
    await this.notify(WEBHOOK_EVENTS.loanCancelled, () =>
      buildCancelled({ loanId, toolName: tool?.name ?? 'your tool', borrowerName }),
      loanId,
    );

    return { ...loan, status: 'cancelled' };
  }

  // ── markReturned ─────────────────────────────────────────────────────────
  async markReturned(loanId: string): Promise<LoanDoc> {
    const loan = await this.requireLoan(loanId);
    const isLender = loan.lenderId === this.actor.userId;
    const isBorrower = loan.borrowerId === this.actor.userId;
    if (!isLender && !isBorrower && this.actor.role !== 'admin') {
      throw new ValidationError('Only the parties to this loan can return it.');
    }
    const actorType: LoanActor =
      this.actor.role === 'admin'
        ? 'admin'
        : isLender
          ? 'lender'
          : 'borrower';
    LoanPolicy.assertCanTransition(loan.status, 'returned', actorType);

    const nowMs = this.clock.now();
    await this.loans.update(loanId, { status: 'returned', returnedAt: nowMs });

    const tool = await this.tools.byId(loan.toolId);
    const borrowerName = isBorrower
      ? this.actor.name
      : (await this.users.getByUserId(loan.borrowerId))?.name ?? 'A borrower';
    await this.notify(WEBHOOK_EVENTS.loanReturned, () =>
      buildReturned({ loanId, toolName: tool?.name ?? 'your tool', borrowerName }),
      loanId,
    );

    return { ...loan, status: 'returned', returnedAt: nowMs };
  }

  // ── queries ──────────────────────────────────────────────────────────────
  async listMine(): Promise<LoanDoc[]> {
    return this.loans.listByBorrower(this.actor.userId);
  }

  async listIncoming(): Promise<LoanDoc[]> {
    return this.loans.listByLender(this.actor.userId);
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  private async requireLoan(loanId: string): Promise<LoanDoc> {
    const loan = await this.loans.byId(loanId);
    if (!loan) throw new NotFound('Loan', loanId);
    return loan;
  }

  /** Decline a set of loans in bulk (used for auto-decline). */
  private async declineMany(loanIds: string[], reason: string): Promise<void> {
    for (const id of loanIds) {
      await this.loans.update(id, {
        status: 'declined',
        declinedReason: reason,
        actedAt: this.clock.now(),
      });
    }
  }

  /** Enqueue a minimized notification payload for a loan. */
  private async notify(
    event: string,
    build: (loanId: string) => AnyPayload,
    loanId: string,
  ): Promise<void> {
    const payload = build(loanId);
    await this.automation.enqueueEvent({ event, payload, loanId });
  }

  /** Whole days a loan is overdue (used by the activity UI / reminders). */
  daysOverdue(loan: LoanDoc): number {
    const due = new Date(loan.endDate);
    return Math.max(0, daysBetween(due, today(this.clock)));
  }
}
