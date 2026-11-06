/**
 * Domain constants for LendLoop.
 *
 * Pure data — no functions that touch Convex. These are the canonical source
 * of truth for allowed categories, conditions, statuses, and limits. The UI
 * mirrors them via src/lib/constants.ts (UI labels) and feature schemas (Zod).
 */

/** Tool categories a lender can choose from. */
export const CATEGORIES = [
  'power tools',
  'hand tools',
  'garden',
  'kitchen',
  'sports',
  'music',
  'electronics',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Physical condition of a tool at listing time. */
export const CONDITIONS = ['new', 'good', 'fair', 'worn'] as const;

export type Condition = (typeof CONDITIONS)[number];

/**
 * Loan lifecycle states.
 *
 * Transitions are governed by LoanPolicy.canTransition — this list defines the
 * valid values, not the allowed moves.
 */
export const LOAN_STATUSES = [
  'pending', // borrower requested, awaiting lender decision
  'approved', // lender accepted; not yet active
  'declined', // lender refused
  'active', // borrower has the tool
  'returned', // tool returned and confirmed
  'cancelled', // borrower cancelled their own request
] as const;

export type LoanStatus = (typeof LOAN_STATUSES)[number];

/** A loan that the borrower can still cancel themselves. */
export const CANCELLABLE_STATUSES: LoanStatus[] = ['pending', 'approved'];

/** A loan that the lender can act on (approve/decline). */
export const ACTIONABLE_STATUSES: LoanStatus[] = ['pending'];

/** Maximum loan duration in days. Enforced by DateRange.validate. */
export const MAX_LOAN_DAYS = 14;

/** Minimum loan duration — a request must span at least one day. */
export const MIN_LOAN_DAYS = 1;

/** Actor roles, derived from Clerk identity + ADMIN_EMAILS bootstrap. */
export const ROLES = ['member', 'admin', 'trusted_lender'] as const;

export type Role = (typeof ROLES)[number];

/** User role stored on the users table. */
export type UserRole = 'member' | 'admin' | 'trusted_lender';

/**
 * Outbound webhook event names. Keeping these as a union makes the
 * integrations/payloads.ts builders exhaustive.
 */
export const WEBHOOK_EVENTS = {
  loanRequested: 'loan.requested',
  loanApproved: 'loan.approved',
  loanDeclined: 'loan.declined',
  loanCancelled: 'loan.cancelled',
  loanReturned: 'loan.returned',
  reminderSent: 'reminder.sent',
} as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[keyof typeof WEBHOOK_EVENTS];
