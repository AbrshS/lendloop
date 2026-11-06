/**
 * users.ts — thin handlers for user sync + current-user query.
 *
 * Handlers validate input, resolve the actor, and delegate to UserService.
 */
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { AccessControl, type Actor } from './security/AccessControl';
import { UserService } from './services/UserService';
import { optionalEnv } from './security/secrets';

/** Sync the signed-in Clerk user into our users table. Call after sign-in. */
export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const auth = AccessControl.requireUser(identity);
    const adminEmails = optionalEnv('ADMIN_EMAILS')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return new UserService(ctx, null, adminEmails).syncCurrentUser({
      subject: auth.subject,
      name: auth.name ?? auth.subject,
      email: auth.email ?? '',
    });
  },
});

/** Current user's stored record (role, name). */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await new UserService(ctx, null).me();
    return user;
  },
});
