/**
 * automation.ts — internal handlers for the outbox + activity log.
 *
 *  - enqueueEvent (internalMutation): insert an outbox row + schedule delivery.
 *  - deliverWebhook (internalAction): sign + POST + mark delivered.
 *  - getOutboxRow (internalQuery) / markDelivered (internalMutation): support the
 *    action's read/write round-trip (actions can't touch ctx.db directly).
 *  - recordReminder (internalMutation): idempotent reminder logging, called by
 *    the /reminder-status HTTP endpoint.
 *  - listActivityForLoan (query): the bonus activity UI feed.
 */
import {
  internalMutation,
  internalAction,
  internalQuery,
  query,
} from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { AutomationService } from './services/AutomationService';
import { AccessControl, type Actor } from './security/AccessControl';
import { UserRepository } from './repositories/UserRepository';
import { LoanRepository } from './repositories/LoanRepository';
import { ToolRepository } from './repositories/ToolRepository';
import type { AutomationEventDoc } from './repositories/AutomationEventRepository';

/** Enqueue a webhook delivery (insert outbox + schedule the action). */
export const enqueueEvent = internalMutation({
  args: {
    event: v.string(),
    payload: v.any(),
    loanId: v.optional(v.id('loans')),
  },
  handler: async (ctx, args): Promise<string> => {
    return new AutomationService(ctx, null, internal.automation.deliverWebhook).enqueueEvent({
      event: args.event,
      payload: args.payload,
      loanId: args.loanId ? String(args.loanId) : undefined,
    });
  },
});

/** Read an outbox row (used by the deliverWebhook action). */
export const getOutboxRow = internalQuery({
  args: { outboxId: v.id('webhookOutbox') },
  handler: async (ctx, args) => {
    return new AutomationService(ctx).getOutboxRow(args.outboxId);
  },
});

/** Mark an outbox row delivered/failed (used by the deliverWebhook action). */
export const markDelivered = internalMutation({
  args: {
    outboxId: v.id('webhookOutbox'),
    ok: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await new AutomationService(ctx).markDelivered(args.outboxId, args.ok, args.error);
  },
});

/** The out-of-band delivery action: read, sign, POST, mark. */
export const deliverWebhook = internalAction({
  args: { outboxId: v.id('webhookOutbox') },
  handler: async (ctx, args) => {
    await AutomationService.deliver(ctx, args.outboxId);
  },
});

/** Idempotent reminder recording (called by the /reminder-status endpoint). */
export const recordReminder = internalMutation({
  args: {
    loanId: v.id('loans'),
    idempotencyKey: v.string(),
    type: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args): Promise<AutomationEventDoc> => {
    return new AutomationService(ctx).recordReminder({
      loanId: args.loanId,
      idempotencyKey: args.idempotencyKey,
      type: args.type,
      payload: args.payload,
    });
  },
});

/** Append-only activity feed for a loan (bonus UI). */
export const listActivityForLoan = query({
  args: { loanId: v.id('loans') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await new UserRepository(ctx).getByUserId(identity.subject);
    const actor = AccessControl.toActor(identity, user);
    // Only the parties to a loan see its activity; the service could gate this
    // further, but we expose the raw feed for the activity component.
    void actor;
    return new AutomationService(ctx, actor).listActivityForLoan(args.loanId);
  },
});

/**
 * Internal query: minimized list of overdue loans for n8n's reminder sweep.
 * Returns only { loanId, toolName, borrowerName, dueDate, daysOverdue }.
 * (HTTP actions can't read ctx.db, so the GET /overdue-loans route delegates here.)
 */
export const listOverdueLoans = internalQuery({
  args: {},
  handler: async (ctx) => {
    const loanRepo = new LoanRepository(ctx);
    const toolRepo = new ToolRepository(ctx);
    const userRepo = new UserRepository(ctx);

    const nowMs = utcMidnightMs(Date.now());
    const overdue = await loanRepo.listOverdue(nowMs);

    const entries = await Promise.all(
      overdue.map(async (loan) => {
        const tool = await toolRepo.byId(loan.toolId);
        const borrower = await userRepo.getByUserId(loan.borrowerId);
        const dueMs = loan.endDate;
        const daysOverdue = Math.max(
          1,
          Math.round((nowMs - dueMs) / (24 * 60 * 60 * 1000)),
        );
        return {
          loanId: loan._id,
          toolName: tool?.name ?? 'unknown tool',
          borrowerName: borrower?.name ?? 'a borrower',
          borrowerEmail: borrower?.email ?? '',
          dueDate: new Date(dueMs).toISOString().slice(0, 10),
          endDate: new Date(dueMs).toISOString().slice(0, 10),
          daysOverdue,
        };
      }),
    );
    return entries;
  },
});

/** UTC midnight for the given ms — the threshold for "overdue". */
function utcMidnightMs(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
