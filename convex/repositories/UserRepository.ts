/**
 * UserRepository — the only place that reads/writes the `users` table.
 *
 * Exposes a structural interface so services (and tests) can depend on a
 * contract, not a concrete class. All `ctx.db` access lives here.
 */
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { UserRole } from '../domain/constants';

export interface UserDoc {
  _id: string;
  userId: string; // Clerk subject
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

/** Minimal interface the UserService needs — fakes can implement this in tests. */
export interface IUserRepository {
  getByUserId(userId: string): Promise<UserDoc | null>;
  getByEmail(email: string): Promise<UserDoc | null>;
  upsert(identity: {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
  }): Promise<UserDoc>;
  setRole(userId: string, role: UserRole): Promise<void>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly ctx: MutationCtx | QueryCtx) {}

  async getByUserId(userId: string): Promise<UserDoc | null> {
    const row = await this.ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    return row ? toDoc(row) : null;
  }

  async getByEmail(email: string): Promise<UserDoc | null> {
    const row = await this.ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
      .first();
    return row ? toDoc(row) : null;
  }

  async upsert(identity: {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
  }): Promise<UserDoc> {
    const existing = await this.getByUserId(identity.userId);
    if (existing) {
      // Update mutable display fields; role is managed separately.
      await (this.ctx as MutationCtx).db.patch(existing._id as any, {
        name: identity.name,
        email: identity.email.toLowerCase(),
      });
      return { ...existing, name: identity.name, email: identity.email.toLowerCase() };
    }
    const id = await (this.ctx as MutationCtx).db.insert('users', {
      userId: identity.userId,
      name: identity.name,
      email: identity.email.toLowerCase(),
      role: identity.role,
      createdAt: BigInt(Date.now()),
    });
    return {
      _id: id as unknown as string,
      userId: identity.userId,
      name: identity.name,
      email: identity.email.toLowerCase(),
      role: identity.role,
      createdAt: Date.now(),
    };
  }

  async setRole(userId: string, role: UserRole): Promise<void> {
    const row = await this.getByUserId(userId);
    if (!row) return;
    await (this.ctx as MutationCtx).db.patch(row._id as any, { role });
  }
}

/** Map a Convex row to our plain UserDoc (bigints -> numbers). */
function toDoc(row: any): UserDoc {
  return {
    _id: row._id as string,
    userId: row.userId,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: Number(row.createdAt),
  };
}
