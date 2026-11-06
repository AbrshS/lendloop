/**
 * loans.ts — thin handlers for the loan lifecycle.
 *
 * Each mutating handler resolves the actor and hands the generated
 * `internal.automation.deliverWebhook` reference to LoanService so enqueued
 * notifications are delivered out of band (the mutation itself can't fetch).
 */
import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { AccessControl, type Actor } from './security/AccessControl';
import { LoanService } from './services/LoanService';
import { UserRepository } from './repositories/UserRepository';
import type { LoanDoc } from './repositories/LoanRepository';

async function resolveActor(ctx: QueryCtx | MutationCtx): Promise<Actor> {
  const identity = await ctx.auth.getUserIdentity();
  const auth = AccessControl.requireUser(identity);
  const user = await new UserRepository(ctx).getByUserId(auth.subject);
  return AccessControl.toActor(auth, user);
}

export const request = mutation({
  args: {
    toolId: v.id('tools'),
    startDate: v.int64(),
    endDate: v.int64(),
    requestNote: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<LoanDoc> => {
    const actor = await resolveActor(ctx);
    return new LoanService(ctx, actor, internal.automation.deliverWebhook).request({
      toolId: args.toolId,
      startDate: Number(args.startDate),
      endDate: Number(args.endDate),
      requestNote: args.requestNote,
    });
  },
});

export const approve = mutation({
  args: { loanId: v.id('loans') },
  handler: async (ctx, args): Promise<LoanDoc> => {
    const actor = await resolveActor(ctx);
    return new LoanService(ctx, actor, internal.automation.deliverWebhook).approve(args.loanId);
  },
});

export const decline = mutation({
  args: {
    loanId: v.id('loans'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<LoanDoc> => {
    const actor = await resolveActor(ctx);
    return new LoanService(ctx, actor, internal.automation.deliverWebhook).decline(
      args.loanId,
      args.reason,
    );
  },
});

export const cancel = mutation({
  args: { loanId: v.id('loans') },
  handler: async (ctx, args): Promise<LoanDoc> => {
    const actor = await resolveActor(ctx);
    return new LoanService(ctx, actor, internal.automation.deliverWebhook).cancel(args.loanId);
  },
});

export const markReturned = mutation({
  args: { loanId: v.id('loans') },
  handler: async (ctx, args): Promise<LoanDoc> => {
    const actor = await resolveActor(ctx);
    return new LoanService(ctx, actor, internal.automation.deliverWebhook).markReturned(
      args.loanId,
    );
  },
});

/** Loans the current user has requested (as borrower). */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const actor = await resolveActor(ctx);
    return new LoanService(ctx, actor).listMine();
  },
});

/** Loan requests the current user has received (as lender). */
export const listIncoming = query({
  args: {},
  handler: async (ctx) => {
    const actor = await resolveActor(ctx);
    return new LoanService(ctx, actor).listIncoming();
  },
});
