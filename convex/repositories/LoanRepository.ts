/**
 * LoanRepository — the only place that reads/writes the `loans` table.
 *
 * Overlap detection: a loan occupies [startDate, endDate] (end-inclusive day,
 * but DateRange treats the boundary as free). Two loans conflict when
 * `loan.startDate < other.endDate && other.startDate < loan.endDate`.
 *
 * Dates are stored as int64 UTC-midnight ms; this layer converts bigint <-> number.
 */
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { LoanStatus } from '../domain/constants';

export interface LoanDoc {
  _id: string;
  toolId: string;
  borrowerId: string;
  lenderId: string;
  status: LoanStatus;
  startDate: number; // UTC midnight ms
  endDate: number; // UTC midnight ms
  requestNote?: string;
  declinedReason?: string;
  actedAt?: number;
  returnedAt?: number;
  overdueNotifiedAt?: number;
  createdAt: number;
}

export interface LoanInsert {
  toolId: string;
  borrowerId: string;
  lenderId: string;
  startDate: number;
  endDate: number;
  requestNote?: string;
}

export interface LoanPatch {
  status?: LoanStatus;
  declinedReason?: string;
  actedAt?: number;
  returnedAt?: number;
  overdueNotifiedAt?: number;
}

/** Statuses that block a new request for the same range. */
const COMMITTED: LoanStatus[] = ['approved', 'active'];

export interface ILoanRepository {
  byId(id: string): Promise<LoanDoc | null>;
  insert(loan: LoanInsert): Promise<LoanDoc>;
  update(id: string, patch: LoanPatch): Promise<void>;
  listByBorrower(userId: string): Promise<LoanDoc[]>;
  listByLender(userId: string): Promise<LoanDoc[]>;
  listAll(): Promise<LoanDoc[]>;
  /** Loans for a tool overlapping [startMs, endMs) in a non-terminal state. */
  findOverlapping(
    toolId: string,
    startMs: number,
    endMs: number,
  ): Promise<LoanDoc[]>;
  /** Active loans whose end date is strictly before `nowMs`. */
  listOverdue(nowMs: number): Promise<LoanDoc[]>;
  /** Non-terminal loan statuses for a tool (for delete-blocking checks). */
  nonTerminalStatusesForTool(toolId: string): Promise<LoanStatus[]>;
}

export class LoanRepository implements ILoanRepository {
  constructor(private readonly ctx: MutationCtx | QueryCtx) {}

  async byId(id: string): Promise<LoanDoc | null> {
    const row = await this.ctx.db.get(id as any);
    return row ? toDoc(row) : null;
  }

  async insert(loan: LoanInsert): Promise<LoanDoc> {
    const id = await (this.ctx as MutationCtx).db.insert('loans', {
      toolId: loan.toolId as any,
      borrowerId: loan.borrowerId,
      lenderId: loan.lenderId,
      status: 'pending',
      startDate: BigInt(loan.startDate),
      endDate: BigInt(loan.endDate),
      requestNote: loan.requestNote,
      createdAt: BigInt(Date.now()),
    });
    const row = await this.ctx.db.get(id);
    return toDoc(row!);
  }

  async update(id: string, patch: LoanPatch): Promise<void> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.declinedReason !== undefined)
      dbPatch.declinedReason = patch.declinedReason;
    if (patch.actedAt !== undefined) dbPatch.actedAt = BigInt(patch.actedAt);
    if (patch.returnedAt !== undefined)
      dbPatch.returnedAt = BigInt(patch.returnedAt);
    if (patch.overdueNotifiedAt !== undefined)
      dbPatch.overdueNotifiedAt = BigInt(patch.overdueNotifiedAt);
    await (this.ctx as MutationCtx).db.patch(id as any, dbPatch);
  }

  async listByBorrower(userId: string): Promise<LoanDoc[]> {
    const rows = await this.ctx.db
      .query('loans')
      .withIndex('by_borrower', (q) => q.eq('borrowerId', userId))
      .collect();
    return rows.map(toDoc);
  }

  async listByLender(userId: string): Promise<LoanDoc[]> {
    const rows = await this.ctx.db
      .query('loans')
      .withIndex('by_lender', (q) => q.eq('lenderId', userId))
      .collect();
    return rows.map(toDoc);
  }

  async listAll(): Promise<LoanDoc[]> {
    const rows = await this.ctx.db.query('loans').collect();
    return rows.map(toDoc);
  }

  /**
   * Find loans for `toolId` that overlap [startMs, endMs) (end-exclusive) and
   * are not terminal. Uses the by_tool_start index to bound the scan, then
   * filters the end side in memory.
   */
  async findOverlapping(
    toolId: string,
    startMs: number,
    endMs: number,
  ): Promise<LoanDoc[]> {
    const rows = await this.ctx.db
      .query('loans')
      .withIndex('by_tool_start', (q) =>
        q.eq('toolId', toolId as any).lt('startDate', BigInt(endMs)),
      )
      .collect();

    return rows
      .filter((r) => Number(r.endDate) > startMs) // end-exclusive overlap
      .filter((r) => !TERMINAL.has(r.status as LoanStatus))
      .map(toDoc);
  }

  /** Active loans past their end date (end date strictly before nowMs). */
  async listOverdue(nowMs: number): Promise<LoanDoc[]> {
    const rows = await this.ctx.db
      .query('loans')
      .withIndex('by_status_end', (q) =>
        q.eq('status', 'active').lt('endDate', BigInt(nowMs)),
      )
      .collect();
    return rows.map(toDoc);
  }

  /** Non-terminal loan statuses for a tool (for delete-blocking checks). */
  async nonTerminalStatusesForTool(toolId: string): Promise<LoanStatus[]> {
    const rows = await this.ctx.db
      .query('loans')
      .withIndex('by_tool', (q) => q.eq('toolId', toolId as any))
      .collect();
    return rows
      .filter((r) => !TERMINAL.has(r.status as LoanStatus))
      .map((r) => r.status as LoanStatus);
  }
}

const TERMINAL = new Set<LoanStatus>(['declined', 'returned', 'cancelled']);

/** Commit status check helper, exported for the service. */
export function isCommitted(status: LoanStatus): boolean {
  return COMMITTED.includes(status);
}

function toDoc(row: any): LoanDoc {
  return {
    _id: row._id as string,
    toolId: row.toolId as string,
    borrowerId: row.borrowerId,
    lenderId: row.lenderId,
    status: row.status,
    startDate: Number(row.startDate),
    endDate: Number(row.endDate),
    requestNote: row.requestNote,
    declinedReason: row.declinedReason,
    actedAt: row.actedAt !== undefined ? Number(row.actedAt) : undefined,
    returnedAt: row.returnedAt !== undefined ? Number(row.returnedAt) : undefined,
    overdueNotifiedAt:
      row.overdueNotifiedAt !== undefined
        ? Number(row.overdueNotifiedAt)
        : undefined,
    createdAt: Number(row.createdAt),
  };
}
