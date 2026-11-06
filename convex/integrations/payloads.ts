/**
 * payloads.ts — minimized webhook payload builders.
 *
 * Data minimization lives here: each builder accepts ONLY the fields it needs
 * and returns an object with EXACTLY those fields — nothing more. The builder
 * cannot leak the owner's address or the borrower's email because it is never
 * given them. payloads.test.ts asserts the exact key set per event.
 */

import { WEBHOOK_EVENTS, type WebhookEvent } from '../domain/constants';
import { DateRange } from '../domain/DateRange';

/** Format a UTC-midnight ms value as an ISO date string. */
function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export interface RequestedPayload {
  event: 'loan.requested';
  loanId: string;
  toolName: string;
  borrowerName: string;
  startDate: string;
  endDate: string;
  requestNote?: string;
}

export interface ApprovedPayload {
  event: 'loan.approved';
  loanId: string;
  toolName: string;
  lenderName: string;
  startDate: string;
  endDate: string;
}

export interface DeclinedPayload {
  event: 'loan.declined';
  loanId: string;
  toolName: string;
  lenderName: string;
  declinedReason?: string;
}

export interface CancelledPayload {
  event: 'loan.cancelled';
  loanId: string;
  toolName: string;
  borrowerName: string;
}

export interface ReturnedPayload {
  event: 'loan.returned';
  loanId: string;
  toolName: string;
  borrowerName: string;
}

export interface ReminderPayload {
  event: 'reminder.sent';
  loanId: string;
  toolName: string;
  borrowerName: string;
  dueDate: string;
  daysOverdue: number;
}

export type AnyPayload =
  | RequestedPayload
  | ApprovedPayload
  | DeclinedPayload
  | CancelledPayload
  | ReturnedPayload
  | ReminderPayload;

/** Build the payload for a new loan request (sent to the lender). */
export function buildRequested(input: {
  loanId: string;
  toolName: string;
  borrowerName: string;
  range: DateRange;
  requestNote?: string;
}): RequestedPayload {
  const payload: RequestedPayload = {
    event: WEBHOOK_EVENTS.loanRequested,
    loanId: input.loanId,
    toolName: input.toolName,
    borrowerName: input.borrowerName,
    startDate: isoDate(input.range.startDate.getTime()),
    endDate: isoDate(input.range.endDate.getTime()),
  };
  if (input.requestNote) payload.requestNote = input.requestNote;
  return payload;
}

/** Build the payload for an approval (sent to the borrower). */
export function buildApproved(input: {
  loanId: string;
  toolName: string;
  lenderName: string;
  range: DateRange;
}): ApprovedPayload {
  return {
    event: WEBHOOK_EVENTS.loanApproved,
    loanId: input.loanId,
    toolName: input.toolName,
    lenderName: input.lenderName,
    startDate: isoDate(input.range.startDate.getTime()),
    endDate: isoDate(input.range.endDate.getTime()),
  };
}

/** Build the payload for a decline (sent to the borrower). */
export function buildDeclined(input: {
  loanId: string;
  toolName: string;
  lenderName: string;
  declinedReason?: string;
}): DeclinedPayload {
  const payload: DeclinedPayload = {
    event: WEBHOOK_EVENTS.loanDeclined,
    loanId: input.loanId,
    toolName: input.toolName,
    lenderName: input.lenderName,
  };
  if (input.declinedReason) payload.declinedReason = input.declinedReason;
  return payload;
}

/** Build the payload for a cancellation (sent to the lender). */
export function buildCancelled(input: {
  loanId: string;
  toolName: string;
  borrowerName: string;
}): CancelledPayload {
  return {
    event: WEBHOOK_EVENTS.loanCancelled,
    loanId: input.loanId,
    toolName: input.toolName,
    borrowerName: input.borrowerName,
  };
}

/** Build the payload for a return (sent to the lender). */
export function buildReturned(input: {
  loanId: string;
  toolName: string;
  borrowerName: string;
}): ReturnedPayload {
  return {
    event: WEBHOOK_EVENTS.loanReturned,
    loanId: input.loanId,
    toolName: input.toolName,
    borrowerName: input.borrowerName,
  };
}

/** Build the payload for an overdue reminder (sent to the borrower). */
export function buildReminder(input: {
  loanId: string;
  toolName: string;
  borrowerName: string;
  dueDate: number; // UTC midnight ms
  daysOverdue: number;
}): ReminderPayload {
  return {
    event: WEBHOOK_EVENTS.reminderSent,
    loanId: input.loanId,
    toolName: input.toolName,
    borrowerName: input.borrowerName,
    dueDate: isoDate(input.dueDate),
    daysOverdue: input.daysOverdue,
  };
}

/** Map an event name to the type tag (used by the client to route). */
export function eventTag(event: WebhookEvent): string {
  return event;
}
