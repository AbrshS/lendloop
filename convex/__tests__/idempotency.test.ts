import { describe, it, expect } from 'vitest';
import { AutomationEventRepository } from '../repositories/AutomationEventRepository';

/**
 * An in-memory stand-in for the Convex `ctx.db` API, limited to the calls the
 * repository uses: query(table).withIndex(...).first()/.collect(),
 * insert(table, doc), and get(id). This lets us exercise the *real*
 * recordIdempotent logic without a deployment.
 */
class FakeDb {
  private rows: Record<string, unknown>[] = [];
  private nextId = 0;

  query(_table: string) {
    const rows = this.rows;
    const makeBuilder = () => {
      let pred = (_r: Record<string, unknown>) => true;
      const builder = {
        eq(field: string, value: unknown) {
          const prev = pred;
          pred = (r) => prev(r) && r[field] === value;
          return builder;
        },
        lt(field: string, value: unknown) {
          const prev = pred;
          pred = (r) => prev(r) && Number(r[field]) < Number(value);
          return builder;
        },
        first() {
          return rows.find(pred) ?? null;
        },
        collect() {
          return rows.filter(pred);
        },
        filter() {
          return builder;
        },
        take(n: number) {
          return rows.filter(pred).slice(0, n);
        },
      };
      return builder;
    };
    return {
      withIndex(_name: string, fn: (q: ReturnType<typeof makeBuilder>) => unknown) {
        const builder = makeBuilder();
        fn(builder); // fn calls builder.eq(...) which sets the predicate
        return builder;
      },
      filter(fn: (q: unknown) => unknown) {
        const builder = makeBuilder();
        fn(builder);
        return builder;
      },
      first() {
        return rows[0] ?? null;
      },
      collect() {
        return rows;
      },
    };
  }

  insert(_table: string, doc: Record<string, unknown>) {
    const id = `id-${++this.nextId}`;
    this.rows.push({ _id: id, ...doc });
    return id;
  }

  get(id: string) {
    return this.rows.find((r) => r._id === id) ?? null;
  }
}

describe('idempotency: recordReminder (same key twice -> one record)', () => {
  it('deduplicates by idempotencyKey', async () => {
    const db = new FakeDb();
    const repo = new AutomationEventRepository({ db } as any);

    const first = await repo.recordIdempotent({
      loanId: 'L1',
      type: 'reminder',
      idempotencyKey: 'K-2026-06-05',
      payload: { toolName: 'Drill' },
    });
    const second = await repo.recordIdempotent({
      loanId: 'L1',
      type: 'reminder',
      idempotencyKey: 'K-2026-06-05', // same key
      payload: { toolName: 'Drill' },
    });

    expect(second._id).toBe(first._id);
    expect((db as unknown as FakeDb).query('x').collect()).toHaveLength(1);
  });

  it('a different key creates a new record', async () => {
    const db = new FakeDb();
    const repo = new AutomationEventRepository({ db } as any);

    await repo.recordIdempotent({
      loanId: 'L1',
      type: 'reminder',
      idempotencyKey: 'K-1',
      payload: {},
    });
    const second = await repo.recordIdempotent({
      loanId: 'L1',
      type: 'reminder',
      idempotencyKey: 'K-2',
      payload: {},
    });

    expect((db as unknown as FakeDb).query('x').collect()).toHaveLength(2);
    expect(second._id).toBeDefined();
  });

  it('listActivityForLoan returns all events for a loan', async () => {
    const db = new FakeDb();
    const repo = new AutomationEventRepository({ db } as any);

    await repo.recordIdempotent({ loanId: 'L1', type: 'reminder', idempotencyKey: 'K-1', payload: {} });
    await repo.recordIdempotent({ loanId: 'L2', type: 'reminder', idempotencyKey: 'K-2', payload: {} });
    await repo.recordIdempotent({ loanId: 'L1', type: 'reminder', idempotencyKey: 'K-3', payload: {} });

    const activity = await repo.listActivityForLoan('L1');
    expect(activity).toHaveLength(2);
    expect(activity.every((e) => e.loanId === 'L1')).toBe(true);
  });
});
