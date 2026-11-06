/**
 * DateRange — an immutable value object for a loan's requested date span.
 *
 * Responsibilities:
 *  - validate that (start <= end) and the span respects MIN/MAX loan days
 *  - test whether two ranges overlap (exclusive end — return day is free)
 *  - test whether a range contains a given day
 *
 * Overlap semantics: a loan is considered to occupy [startDate, endDate). The
 * return date is the day the tool comes back, so another loan starting on the
 * same day as this one's end is *not* a conflict. This matches "I need it
 * Monday–Wednesday" being compatible with "I need it Wednesday–Friday".
 */

import { MAX_LOAN_DAYS, MIN_LOAN_DAYS } from './constants';
import { ValidationError } from './errors';
import { addDays, daysBetween } from './Clock';

export class DateRange {
  /** Start of the loan, inclusive (UTC midnight). */
  readonly startDate: Date;
  /** End of the loan, inclusive (UTC midnight). */
  readonly endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  /** Number of days spanned, inclusive of both endpoints. */
  get days(): number {
    return daysBetween(this.startDate, this.endDate) + 1;
  }

  /**
   * Create and validate a date range.
   * @throws ValidationError if end < start, the span is too short, or too long.
   */
  static create(startDate: Date, endDate: Date): DateRange {
    const start = toUtcMidnight(startDate);
    const end = toUtcMidnight(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new ValidationError('Start and end dates must be valid dates.');
    }

    const span = daysBetween(start, end) + 1;

    if (span < MIN_LOAN_DAYS) {
      throw new ValidationError(
        `A loan must be at least ${MIN_LOAN_DAYS} day long.`,
      );
    }
    if (span > MAX_LOAN_DAYS) {
      throw new ValidationError(
        `A loan cannot exceed ${MAX_LOAN_DAYS} days (requested ${span}).`,
      );
    }

    return new DateRange(start, end);
  }

  /** Build a range that starts `start` and lasts `lengthDays`. */
  static fromDuration(start: Date, lengthDays: number): DateRange {
    return DateRange.create(start, addDays(toUtcMidnight(start), lengthDays - 1));
  }

  /**
   * Whether this range overlaps another.
   * End-exclusive: ranges meeting at a boundary (this.end == other.start)
   * do NOT overlap.
   */
  overlaps(other: DateRange): boolean {
    return this.startDate < other.endDate && other.startDate < this.endDate;
  }

  /** Whether a given day falls inside [start, end] (inclusive). */
  contains(day: Date): boolean {
    const d = toUtcMidnight(day);
    return d >= this.startDate && d <= this.endDate;
  }

  /** Whether this range is entirely before a given day. */
  isBefore(day: Date): boolean {
    return this.endDate < toUtcMidnight(day);
  }

  /** Whether this range is entirely after a given day. */
  isAfter(day: Date): boolean {
    return this.startDate > toUtcMidnight(day);
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }

  /** Stable string key, useful for dedup keys and logging. */
  toKey(): string {
    return `${iso(this.startDate)}..${iso(this.endDate)}`;
  }
}

/** Normalize any date to UTC midnight for day-granularity comparison. */
export function toUtcMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** ISO date-only string (UTC). */
function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
