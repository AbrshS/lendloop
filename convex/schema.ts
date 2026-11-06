/**
 * Convex schema for LendLoop.
 *
 * Tables: users, tools, loans, automationEvents, webhookOutbox.
 * Dates for loans are stored as int64 milliseconds (UTC midnight) for cheap
 * range comparisons; the repository layer converts to/from DateRange.
 *
 * @see convex/domain/DateRange.ts
 */
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ── users ────────────────────────────────────────────────────────────────
  // One row per Clerk user. `userId` is the Clerk subject (stable).
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal('member'),
      v.literal('admin'),
      v.literal('trusted_lender'),
    ),
    createdAt: v.int64(),
  })
    .index('by_userId', ['userId'])
    .index('by_email', ['email']),

  // ── tools ───────────────────────────────────────────────────────────────
  // `userId` is the owner's Clerk subject.
  tools: defineTable({
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    condition: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.int64(),
  })
    .index('by_owner', ['userId'])
    .index('by_category', ['category']),

  // ── loans ────────────────────────────────────────────────────────────────
  // borrowerId / lenderId are Clerk subjects, denormalized so incoming/outgoing
  // views can query by either side without a join.
  loans: defineTable({
    toolId: v.id('tools'),
    borrowerId: v.string(),
    lenderId: v.string(),
    status: v.string(),
    startDate: v.int64(), // UTC midnight ms, inclusive
    endDate: v.int64(), // UTC midnight ms, inclusive
    requestNote: v.optional(v.string()),
    declinedReason: v.optional(v.string()),
    actedAt: v.optional(v.int64()), // when lender decided
    returnedAt: v.optional(v.int64()),
    overdueNotifiedAt: v.optional(v.int64()),
    createdAt: v.int64(),
  })
    .index('by_tool', ['toolId'])
    .index('by_borrower', ['borrowerId'])
    .index('by_lender', ['lenderId'])
    .index('by_status', ['status'])
    // For overlap checks: range on startDate within a tool.
    .index('by_tool_start', ['toolId', 'startDate'])
    // For overdue sweeps: active loans ordered by endDate.
    .index('by_status_end', ['status', 'endDate'])
    // For overlap checks: find loans for a tool in a non-terminal state.
    .index('by_tool_status', ['toolId', 'status']),

  // ── automationEvents ────────────────────────────────────────────────────
  // Append-only log of notifications/reminders sent. `idempotencyKey` makes
  // retries safe — a duplicate key returns the existing row, never a new one.
  automationEvents: defineTable({
    loanId: v.id('loans'),
    type: v.string(), // event name or "reminder"
    idempotencyKey: v.string(),
    payload: v.any(),
    createdAt: v.int64(),
  })
    .index('by_loan', ['loanId'])
    .index('by_idempotency', ['idempotencyKey']),

  // ── webhookOutbox ───────────────────────────────────────────────────────
  // Pending outbound webhook deliveries. A mutation inserts a row; the
  // `deliverWebhook` action signs + posts it and marks it delivered.
  webhookOutbox: defineTable({
    loanId: v.optional(v.id('loans')),
    event: v.string(),
    payload: v.any(),
    status: v.string(), // "pending" | "delivered" | "failed"
    attempts: v.int64(),
    lastError: v.optional(v.string()),
    nextRetryAt: v.optional(v.int64()),
    createdAt: v.int64(),
    deliveredAt: v.optional(v.int64()),
  })
    .index('by_status', ['status'])
    .index('by_nextRetry', ['nextRetryAt']),
});
