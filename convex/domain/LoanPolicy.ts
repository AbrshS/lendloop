/**
 * LoanPolicy — the loan state machine and overdue rule.
 *
 * Pure: no Convex, no I/O. `canTransition` answers "may this actor move this
 * loan to that state?", and `isOverdue` answers "is this active loan past
 * its end date?". Both are exhaustively unit-tested.
 */

import { ACTIONABLE_STATUSES, CANCELLABLE_STATUSES, LoanStatus } from './constants';
import { Clock, today } from './Clock';
import { DateRange } from './DateRange';
import { Conflict, ValidationError } from './errors';

/** Who is performing an action on a loan. */
export type LoanActor = 'borrower' | 'lender' | 'admin';

/** The full set of allowed (from -> to) transitions. */
const TRANSITIONS: ReadonlyArray<{
  from: LoanStatus;
  to: LoanStatus;
  actor: LoanActor;
}> = [
  // Lender decides on a pending request.
  { from: 'pending', to: 'approved', actor: 'lender' },
  { from: 'pending', to: 'declined', actor: 'lender' },
  // Borrower backs out before it becomes active.
  { from: 'pending', to: 'cancelled', actor: 'borrower' },
  { from: 'approved', to: 'cancelled', actor: 'borrower' },
  // Lender hands the tool over.
  { from: 'approved', to: 'active', actor: 'lender' },
  // Tool comes back; either party can mark returned (lender confirms).
  { from: 'active', to: 'returned', actor: 'lender' },
  { from: 'active', to: 'returned', actor: 'borrower' },
  // Admin override force-returns an active loan (kept narrow on purpose).
  { from: 'active', to: 'returned', actor: 'admin' },
];

export class LoanPolicy {
  /** Whether `actor` may move a loan from `from` to `to`. */
  static canTransition(from: LoanStatus, to: LoanStatus, actor: LoanActor): boolean {
    return TRANSITIONS.some(
      (t) => t.from === from && t.to === to && t.actor === actor,
    );
  }

  /**
   * Assert a transition is allowed, throwing a domain error otherwise.
   * Services call this before persisting a status change.
   */
  static assertCanTransition(
    from: LoanStatus,
    to: LoanStatus,
    actor: LoanActor,
  ): void {
    if (from === to) {
      throw new Conflict(`Loan is already ${from}.`);
    }
    if (!LoanPolicy.canTransition(from, to, actor)) {
      throw new Conflict(
        `Cannot move a loan from ${from} to ${to} as ${actor}.`,
      );
    }
  }

  /** Whether a borrower may still cancel a loan in its current state. */
  static isCancellable(status: LoanStatus): boolean {
    return CANCELLABLE_STATUSES.includes(status);
  }

  /** Whether a lender can approve/decline a loan in its current state. */
  static isActionable(status: LoanStatus): boolean {
    return ACTIONABLE_STATUSES.includes(status);
  }

  /**
   * Whether a loan is overdue: it must be *active* and its end date must be
   * strictly before today. A loan whose endDate is today is not yet overdue
   * (today is the last day to return it).
   */
  static isOverdue(
    status: LoanStatus,
    range: DateRange,
    clock: Clock,
  ): boolean {
    if (status !== 'active') return false;
    return range.isBefore(today(clock));
  }

  /**
   * Validate that a new request's range is sound and not self-conflicting.
   * (Cross-loan overlap is checked by the service via the repository.)
   */
  static validateRequestRange(range: DateRange): void {
    // DateRange.create already enforces min/max span; this is the explicit
    // policy hook in case we add request-specific rules later.
    if (range.days <= 0) {
      throw new ValidationError('Loan range must span at least one day.');
    }
  }
}
