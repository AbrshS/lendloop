/**
 * UserService — sync a Clerk identity into our users table + admin bootstrap.
 *
 * The first time a Clerk user is seen, we create a row. If their email is in
 * ADMIN_EMAILS, they become an admin. `role` is otherwise left untouched on
 * subsequent logins so an admin can't accidentally lose the role.
 *
 * Constructed with (ctx, actor) per the layering rules.
 */
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { UserRepository, type UserDoc, type IUserRepository } from '../repositories/UserRepository';
import type { Actor } from '../security/AccessControl';
import { UserRole } from '../domain/constants';

export class UserService {
  private users: IUserRepository;

  constructor(
    private readonly ctx: MutationCtx | QueryCtx,
    private readonly actor: Actor | null,
    private readonly adminEmails: string[] = [],
  ) {
    this.users = new UserRepository(ctx);
  }

  /**
   * Sync the current Clerk identity into the users table.
   * Returns the canonical user record (with resolved role).
   */
  async syncCurrentUser(identity: {
    subject: string;
    name: string;
    email: string;
  }): Promise<UserDoc> {
    const existing = await this.users.getByUserId(identity.subject);
    const isAdminEmail = this.adminEmails.includes(identity.email.toLowerCase());

    // Bootstrap: a brand-new user whose email is in ADMIN_EMAILS becomes admin.
    // Existing users keep their stored role (so a manual demotion sticks).
    const role: UserRole =
      !existing && isAdminEmail ? 'admin' : existing?.role ?? 'member';

    const user = await this.users.upsert({
      userId: identity.subject,
      name: identity.name,
      email: identity.email,
      role,
    });

    // Ensure an admin flagged in ADMIN_EMAILS keeps the role even on later
    // logins (idempotent guard so we don't fight manual admin changes elsewhere).
    if (isAdminEmail && user.role !== 'admin') {
      await this.users.setRole(identity.subject, 'admin');
      user.role = 'admin';
    }

    return user;
  }

  /** Resolve the actor's own user record. */
  async me(): Promise<UserDoc | null> {
    if (!this.actor) return null;
    return this.users.getByUserId(this.actor.userId);
  }
}
