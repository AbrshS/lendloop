import { describe, it, expect } from 'vitest';
import {
  buildRequested,
  buildApproved,
  buildDeclined,
  buildCancelled,
  buildReturned,
  buildReminder,
} from '../integrations/payloads';
import { DateRange } from '../domain/DateRange';

const d = (iso: string) => new Date(iso + 'T00:00:00Z');
const range = DateRange.create(d('2026-06-01'), d('2026-06-05'));

/** Assert the payload has exactly these keys — data minimization. */
function expectKeys(obj: object, keys: string[]) {
  expect(Object.keys(obj).sort()).toEqual([...keys].sort());
}

describe('payloads are minimized (no extra fields)', () => {
  it('requested includes only the lender-need-to-know fields', () => {
    const p = buildRequested({
      loanId: 'L1',
      toolName: 'Drill',
      borrowerName: 'Ana',
      range,
    });
    expectKeys(p, ['event', 'loanId', 'toolName', 'borrowerName', 'startDate', 'endDate']);
  });

  it('requested adds requestNote only when provided', () => {
    const p = buildRequested({
      loanId: 'L1',
      toolName: 'Drill',
      borrowerName: 'Ana',
      range,
      requestNote: 'for a shelf',
    });
    expectKeys(p, ['event', 'loanId', 'toolName', 'borrowerName', 'startDate', 'endDate', 'requestNote']);
  });

  it('approved includes only borrower-need-to-know fields', () => {
    const p = buildApproved({ loanId: 'L1', toolName: 'Drill', lenderName: 'Bob', range });
    expectKeys(p, ['event', 'loanId', 'toolName', 'lenderName', 'startDate', 'endDate']);
  });

  it('declined omits declinedReason when not given', () => {
    const p = buildDeclined({ loanId: 'L1', toolName: 'Drill', lenderName: 'Bob' });
    expectKeys(p, ['event', 'loanId', 'toolName', 'lenderName']);
  });

  it('declined includes declinedReason when given', () => {
    const p = buildDeclined({ loanId: 'L1', toolName: 'Drill', lenderName: 'Bob', declinedReason: 'busy' });
    expectKeys(p, ['event', 'loanId', 'toolName', 'lenderName', 'declinedReason']);
  });

  it('cancelled has exactly four fields', () => {
    const p = buildCancelled({ loanId: 'L1', toolName: 'Drill', borrowerName: 'Ana' });
    expectKeys(p, ['event', 'loanId', 'toolName', 'borrowerName']);
  });

  it('returned has exactly four fields', () => {
    const p = buildReturned({ loanId: 'L1', toolName: 'Drill', borrowerName: 'Ana' });
    expectKeys(p, ['event', 'loanId', 'toolName', 'borrowerName']);
  });

  it('reminder has exactly six fields', () => {
    const p = buildReminder({
      loanId: 'L1',
      toolName: 'Drill',
      borrowerName: 'Ana',
      dueDate: d('2026-06-05').getTime(),
      daysOverdue: 3,
    });
    expectKeys(p, ['event', 'loanId', 'toolName', 'borrowerName', 'dueDate', 'daysOverdue']);
  });

  it('dates are ISO date-only strings', () => {
    const p = buildApproved({ loanId: 'L1', toolName: 'Drill', lenderName: 'Bob', range });
    expect(p.startDate).toBe('2026-06-01');
    expect(p.endDate).toBe('2026-06-05');
  });
});
