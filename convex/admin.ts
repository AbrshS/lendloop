/**
 * admin.ts — admin-only handlers. AdminService asserts admin in its
 * constructor, so these handlers are safe even if the UI guard is bypassed.
 */
import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { AccessControl, type Actor } from './security/AccessControl';
import { AdminService } from './services/AdminService';
import { UserRepository } from './repositories/UserRepository';

async function resolveActor(ctx: QueryCtx | MutationCtx): Promise<Actor> {
  const identity = await ctx.auth.getUserIdentity();
  const auth = AccessControl.requireUser(identity);
  const user = await new UserRepository(ctx).getByUserId(auth.subject);
  return AccessControl.toActor(auth, user);
}

export const listAllLoans = query({
  args: {},
  handler: async (ctx) => {
    const actor = await resolveActor(ctx);
    return new AdminService(ctx, actor).listAllLoans();
  },
});

export const removeAnyTool = mutation({
  args: { toolId: v.id('tools') },
  handler: async (ctx, args) => {
    const actor = await resolveActor(ctx);
    await new AdminService(ctx, actor).removeAnyTool(args.toolId);
  },
});

export const setTrustedLender = mutation({
  args: {
    targetUserId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actor = await resolveActor(ctx);
    await new AdminService(ctx, actor).setTrustedLender(args.targetUserId, args.enabled);
  },
});
