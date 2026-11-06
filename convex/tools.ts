/**
 * tools.ts — thin handlers for tool listing and CRUD.
 *
 * `listPublic` is anonymous-safe (no auth) and returns only { name, category }.
 * Everything else requires a signed-in user.
 */
import { query, mutation, type QueryCtx, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { AccessControl, type Actor } from './security/AccessControl';
import { ToolService } from './services/ToolService';
import { ToolRepository } from './repositories/ToolRepository';
import { UserRepository } from './repositories/UserRepository';

/** Resolve a signed-in Clerk identity + stored role into a service Actor. */
async function resolveActor(ctx: QueryCtx | MutationCtx): Promise<Actor> {
  const identity = await ctx.auth.getUserIdentity();
  const auth = AccessControl.requireUser(identity);
  const user = await new UserRepository(ctx).getByUserId(auth.subject);
  return AccessControl.toActor(auth, user);
}

/** Anonymous browse: only { _id, name, category }. */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return new ToolRepository(ctx).listPublic();
  },
});

/** All tools, full detail (signed-in users only). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const actor = await resolveActor(ctx);
    return new ToolService(ctx, actor).listAll();
  },
});

/** The current user's own listings. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const actor = await resolveActor(ctx);
    return new ToolService(ctx, actor).listMine();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    condition: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await resolveActor(ctx);
    return new ToolService(ctx, actor).create(args);
  },
});

export const update = mutation({
  args: {
    id: v.id('tools'),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    condition: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const actor = await resolveActor(ctx);
    await new ToolService(ctx, actor).update(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id('tools') },
  handler: async (ctx, args) => {
    const actor = await resolveActor(ctx);
    await new ToolService(ctx, actor).remove(args.id);
  },
});
