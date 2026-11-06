/**
 * AutomationEventRepository — the append-only event log + idempotency.
 *
 * `recordIdempotent` looks up an existing row by `idempotencyKey` first; if
 * found, it returns the existing record instead of inserting a duplicate.
 * This makes n8n retries safe. See idempotency.test.ts.
 */
import type { MutationCtx, QueryCtx } from '../_generated/server';

export interface AutomationEventDoc {
  _id: string;
  loanId: string;
  type: string;
  idempotencyKey: string;
  payload: unknown;
  createdAt: number;
}

export interface IAutomationEventRepository {
  /** Insert unless a row with this key already exists; returns the canonical row. */
  recordIdempotent(input: {
    loanId: string;
    type: string;
    idempotencyKey: string;
    payload: unknown;
  }): Promise<AutomationEventDoc>;
  listActivityForLoan(loanId: string): Promise<AutomationEventDoc[]>;
}

export class AutomationEventRepository implements IAutomationEventRepository {
  constructor(private readonly ctx: MutationCtx | QueryCtx) {}

  async recordIdempotent(input: {
    loanId: string;
    type: string;
    idempotencyKey: string;
    payload: unknown;
  }): Promise<AutomationEventDoc> {
    // Idempotency: return existing row if the key is already present.
    const existing = await this.ctx.db
      .query('automationEvents')
      .withIndex('by_idempotency', (q) => q.eq('idempotencyKey', input.idempotencyKey))
      .first();
    if (existing) {
      return toDoc(existing);
    }

    const id = await (this.ctx as MutationCtx).db.insert('automationEvents', {
      loanId: input.loanId as any,
      type: input.type,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload,
      createdAt: BigInt(Date.now()),
    });
    const row = await this.ctx.db.get(id);
    return toDoc(row!);
  }

  async listActivityForLoan(loanId: string): Promise<AutomationEventDoc[]> {
    const rows = await this.ctx.db
      .query('automationEvents')
      .withIndex('by_loan', (q) => q.eq('loanId', loanId as any))
      .collect();
    return rows.map(toDoc);
  }
}

function toDoc(row: any): AutomationEventDoc {
  return {
    _id: row._id as string,
    loanId: row.loanId as string,
    type: row.type,
    idempotencyKey: row.idempotencyKey,
    payload: row.payload,
    createdAt: Number(row.createdAt),
  };
}
