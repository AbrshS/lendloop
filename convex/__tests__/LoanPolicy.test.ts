import { describe, it, expect } from 'vitest';
import { LoanPolicy } from '../domain/LoanPolicy';
import { DateRange } from '../domain/DateRange';
import { FixedClock } from '../domain/Clock';
import { Conflict } from '../domain/errors';

const d = (iso: string) => new Date(iso + 'T00:00:00Z');

describe('LoanPolicy.canTransition', () => {
  const cases: Array<[string, string, 'borrower' | 'lender' | 'admin', boolean]> = [
    // allowed
    ['pending', 'approved', 'lender', true],
    ['pending', 'declined', 'lender', true],
    ['pending', 'cancelled', 'borrower', true],
    ['approved', 'cancelled', 'borrower', true],
    ['approved', 'active', 'lender', true],
    ['active', 'returned', 'lender', true],
    ['active', 'returned', 'borrower', true],
    ['active', 'returned', 'admin', true],
    // disallowed
    ['pending', 'approved', 'borrower', false], // borrower can't approve
    ['pending', 'declined', 'borrower', false],
    ['approved', 'cancelled', 'lender', false], // lender can't cancel
    ['active', 'returned', 'lender', true],
    ['declined', 'pending', 'lender', false], // no revives
    ['returned', 'active', 'lender', false],
    ['pending', 'active', 'lender', false], // must approve first
    ['declined', 'approved', 'lender', false],
  ];

  for (const [from, to, actor, expected] of cases) {
    it(`${actor} ${from} -> ${to} = ${expected}`, () => {
      expect(LoanPolicy.canTransition(from as any, to as any, actor)).toBe(expected);
    });
  }
});

describe('LoanPolicy.assertCanTransition', () => {
  it('throws Conflict on a disallowed move', () => {
    expect(() =>
      LoanPolicy.assertCanTransition('pending', 'approved', 'borrower'),
    ).toThrow(Conflict);
  });

  it('throws Conflict when already in the target state', () => {
    expect(() =>
      LoanPolicy.assertCanTransition('approved', 'approved', 'lender'),
    ).toThrow(Conflict);
  });
});

describe('LoanPolicy.isCancellable / isActionable', () => {
  it('cancellable when pending or approved', () => {
    expect(LoanPolicy.isCancellable('pending')).toBe(true);
    expect(LoanPolicy.isCancellable('approved')).toBe(true);
    expect(LoanPolicy.isCancellable('active')).toBe(false);
    expect(LoanPolicy.isCancellable('returned')).toBe(false);
  });

  it('actionable only when pending', () => {
    expect(LoanPolicy.isActionable('pending')).toBe(true);
    expect(LoanPolicy.isActionable('approved')).toBe(false);
  });
});

describe('LoanPolicy.isOverdue', () => {
  const clock = new FixedClock(Date.parse('2026-06-10T12:00:00Z'));

  it('is overdue when active and end date is before today', () => {
    const range = DateRange.create(d('2026-06-01'), d('2026-06-05'));
    expect(LoanPolicy.isOverdue('active', range, clock)).toBe(true);
  });

  it('is not overdue when end date is today', () => {
    const range = DateRange.create(d('2026-06-05'), d('2026-06-10'));
    expect(LoanPolicy.isOverdue('active', range, clock)).toBe(false);
  });

  it('is not overdue when not active', () => {
    const range = DateRange.create(d('2026-06-01'), d('2026-06-05'));
    expect(LoanPolicy.isOverdue('pending', range, clock)).toBe(false);
    expect(LoanPolicy.isOverdue('returned', range, clock)).toBe(false);
  });
});
