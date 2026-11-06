import { describe, it, expect } from 'vitest';
import { DateRange } from '../domain/DateRange';

const d = (iso: string) => new Date(iso + 'T00:00:00Z');

describe('DateRange.create', () => {
  it('creates a valid range', () => {
    const r = DateRange.create(d('2026-06-01'), d('2026-06-05'));
    expect(r.days).toBe(5);
    expect(r.toKey()).toBe('2026-06-01..2026-06-05');
  });

  it('rejects end before start', () => {
    expect(() => DateRange.create(d('2026-06-05'), d('2026-06-01'))).toThrow();
  });

  it('allows a one-day range', () => {
    const r = DateRange.create(d('2026-06-01'), d('2026-06-01'));
    expect(r.days).toBe(1);
  });

  it('rejects a range longer than MAX_LOAN_DAYS (14)', () => {
    expect(() => DateRange.create(d('2026-06-01'), d('2026-06-16'))).toThrow();
  });

  it('accepts exactly the max span', () => {
    const r = DateRange.create(d('2026-06-01'), d('2026-06-14'));
    expect(r.days).toBe(14);
  });

  it('normalizes dates to UTC midnight', () => {
    const r = DateRange.create(d('2026-06-01'), d('2026-06-03'));
    expect(r.startDate.getUTCHours()).toBe(0);
  });
});

describe('DateRange.overlaps (end-exclusive boundary)', () => {
  it('overlapping ranges conflict', () => {
    const a = DateRange.create(d('2026-06-01'), d('2026-06-05'));
    const b = DateRange.create(d('2026-06-03'), d('2026-06-08'));
    expect(a.overlaps(b)).toBe(true);
  });

  it('touching at a boundary does NOT overlap', () => {
    const a = DateRange.create(d('2026-06-01'), d('2026-06-05'));
    const b = DateRange.create(d('2026-06-05'), d('2026-06-08'));
    expect(a.overlaps(b)).toBe(false);
  });

  it('fully disjoint ranges do not overlap', () => {
    const a = DateRange.create(d('2026-06-01'), d('2026-06-03'));
    const b = DateRange.create(d('2026-06-10'), d('2026-06-12'));
    expect(a.overlaps(b)).toBe(false);
  });

  it('a range contained within another overlaps', () => {
    const outer = DateRange.create(d('2026-06-01'), d('2026-06-10'));
    const inner = DateRange.create(d('2026-06-03'), d('2026-06-05'));
    expect(outer.overlaps(inner)).toBe(true);
  });
});

describe('DateRange.contains / isBefore / isAfter', () => {
  const r = DateRange.create(d('2026-06-01'), d('2026-06-05'));

  it('contains an inner day', () => {
    expect(r.contains(d('2026-06-03'))).toBe(true);
  });

  it('contains both endpoints', () => {
    expect(r.contains(d('2026-06-01'))).toBe(true);
    expect(r.contains(d('2026-06-05'))).toBe(true);
  });

  it('does not contain outside days', () => {
    expect(r.contains(d('2026-05-31'))).toBe(false);
    expect(r.contains(d('2026-06-06'))).toBe(false);
  });

  it('isBefore / isAfter', () => {
    expect(r.isBefore(d('2026-06-06'))).toBe(true);
    expect(r.isAfter(d('2026-05-31'))).toBe(true);
  });
});
