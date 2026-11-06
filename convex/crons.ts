/**
 * crons.ts — optional outbox retry sweep.
 *
 * A failed/pending webhook delivery shouldn't be lost. This cron periodically
 * reschedules stuck outbox rows for delivery, with a next-retry backoff so we
 * don't hammer n8n. For a production setup see docs/PRODUCTION_NOTES.md
 * (backoff caps, max attempts, alerting).
 */
import { cronJobs } from 'convex/server';
import { internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';

/** Max rows to retry per sweep. */
const RETRY_BATCH = 25;
/** Backoff between retries (ms). */
const RETRY_BACKOFF_MS = 5 * 60 * 1000;

/**
 * Find outbox rows still pending/failed that are eligible for retry.
 * (Defined here as an internal query so the sweep mutation can read it.)
 */
export const getStuckOutbox = internalQuery({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const now = BigInt(Date.now());
    const rows = await ctx.db
      .query('webhookOutbox')
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'pending'),
          q.eq(q.field('status'), 'failed'),
        ),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field('nextRetryAt'), undefined),
          q.lt(q.field('nextRetryAt'), now),
        ),
      )
      .take(RETRY_BATCH);
    return rows.map((r) => r._id as string);
  },
});

/** Reschedule delivery for a batch of stuck rows. */
export const retryStuckOutbox = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ rescheduled: number }> => {
    const ids: string[] = await ctx.runQuery(internal.crons.getStuckOutbox, {});
    const nextRetryAt = BigInt(Date.now() + RETRY_BACKOFF_MS);
    for (const id of ids) {
      await ctx.db.patch(id as any, { nextRetryAt });
      await ctx.scheduler.runAfter(0, internal.automation.deliverWebhook, {
        outboxId: id as any,
      });
    }
    return { rescheduled: ids.length };
  },
});

const crons = cronJobs();
crons.interval(
  'retry-stuck-outbox',
  { minutes: 60 },
  internal.crons.retryStuckOutbox,
);
export default crons;
