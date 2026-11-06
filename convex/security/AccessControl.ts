/**
 * AccessControl — identity resolution and authorization guards.
 *
 * This is the real security boundary. Every mutating handler resolves an actor
 * here and the service asserts ownership/admin before touching data.
 *
 * Decoupled from generated Convex types: we accept a minimal `AuthIdentity`
 * shape (which Convex's `UserIdentity` satisfies structurally), so the guards
 * are unit-testable without a deployment.
 */

import { UserRole } from '../domain/constants';
import { Forbidden, Unauthenticated } from '../domain/errors';

/** The Clerk identity as exposed by Convex `ctx.auth.getUserIdentity()`. */
export interface AuthIdentity {
  /** Clerk user id, stable. */
  subject: string;
  email?: string;
  name?: string;
}

/** The resolved actor passed into services as `(ctx, actor)`. */
export interface Actor {
  /** Clerk subject id — matches the `userId` field stored on tools/loans. */
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Minimal user record shape AccessControl needs to resolve a role. */
export interface UserRecord {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
}

export class AccessControl {
  /**
   * Require an authenticated identity. Throws Unauthenticated if absent.
   * Returns the identity for the handler to resolve a full actor from the db.
   */
  static requireUser(identity: AuthIdentity | null): AuthIdentity {
    if (!identity || !identity.subject) {
      throw new Unauthenticated();
    }
    return identity;
  }

  /**
   * Build an Actor from a Clerk identity + the user's stored record.
   * Falls back to 'member' role if the record isn't found yet (the service
   * will sync the user before proceeding).
   */
  static toActor(identity: AuthIdentity, user: UserRecord | null): Actor {
    return {
      userId: identity.subject,
      email: user?.email ?? identity.email ?? '',
      name: user?.name ?? identity.name ?? '',
      role: user?.role ?? 'member',
    };
  }

  /** Throw Forbidden unless the actor is an admin. */
  static requireAdmin(actor: Actor): void {
    if (actor.role !== 'admin') {
      throw new Forbidden('This action requires admin privileges.');
    }
  }

  /** Throw Forbidden unless the actor owns the resource (admins always pass). */
  static assertOwner(actor: Actor, ownerId: string): void {
    if (actor.role === 'admin') return;
    if (actor.userId !== ownerId) {
      throw new Forbidden('You can only access your own resources.');
    }
  }

  /** Explicit "owner or admin" guard, same result as assertOwner. */
  static assertOwnerOrAdmin(actor: Actor, ownerId: string): void {
    AccessControl.assertOwner(actor, ownerId);
  }

  /** Whether an actor owns a resource (no throw). */
  static isOwner(actor: Actor, ownerId: string): boolean {
    return actor.role === 'admin' || actor.userId === ownerId;
  }
}
