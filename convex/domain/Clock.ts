/**
 * Clock — a thin abstraction over "what is today".
 *
 * The domain rules (overdue detection, date validation) need a notion of
 * "now". By injecting the clock instead of calling `Date.now()` directly,
 * tests can freeze time and assert behavior deterministically.
 *
 * This is the only place the domain touches time, which keeps it pure and
 * testable without a Convex context.
 */

export interface Clock {
  /** Current instant as milliseconds since epoch. */
  now(): number;
}

/** Real wall-clock implementation for production. */
export const systemClock: Clock = {
  now: () => Date.now(),
};

/**
 * Fixed clock for tests. Returns the same instant every time, or advances
 * explicitly via `advance(ms)`.
 */
export class FixedClock implements Clock {
  private current: number;

  constructor(initialNow = Date.parse('2026-06-01T12:00:00Z')) {
    this.current = initialNow;
  }

  now(): number {
    return this.current;
  }

  advance(ms: number): void {
    this.current += ms;
  }

  /** Set the clock to a specific instant. */
  set(instant: number): void {
    this.current = instant;
  }
}

/** "today" as a date at midnight UTC, for day-granularity comparisons. */
export function today(clock: Clock): Date {
  const d = new Date(clock.now());
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Add a number of whole days to a date, returning a new Date. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** Whole days between two dates (b - a). Negative if b is before a. */
export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}
