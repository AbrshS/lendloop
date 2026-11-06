/**
 * AdminService — admin-only operations that span all users.
 *
 * `requireAdmin` is the real guard; the UI admin layout is cosmetic. Admins can
 * see all loans, remove any tool, and promote/demote a trusted-lender role.
 */
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { LoanRepository, type LoanDoc, type ILoanRepository } from '../repositories/LoanRepository';
import { ToolRepository, type IToolRepository } from '../repositories/ToolRepository';
import { UserRepository, type IUserRepository } from '../repositories/UserRepository';
import { AccessControl, type Actor } from '../security/AccessControl';
import { ToolPolicy } from '../domain/ToolPolicy';
import { NotFound, ValidationError } from '../domain/errors';

export class AdminService {
  private loans: ILoanRepository;
  private tools: IToolRepository;
  private users: IUserRepository;

  constructor(
    private readonly ctx: MutationCtx | QueryCtx,
    private readonly actor: Actor,
  ) {
    AccessControl.requireAdmin(this.actor);
    this.loans = new LoanRepository(ctx);
    this.tools = new ToolRepository(ctx);
    this.users = new UserRepository(ctx);
  }

  /** Every loan in the system, for the admin dashboard. */
  async listAllLoans(): Promise<LoanDoc[]> {
    return this.loans.listAll();
  }

  /** Force-remove any tool listing, regardless of outstanding loans. */
  async removeAnyTool(toolId: string): Promise<void> {
    ToolPolicy.assertCanRemove(this.actor);
    const tool = await this.tools.byId(toolId);
    if (!tool) throw new NotFound('Tool', toolId);
    await this.tools.remove(toolId);
  }

  /** Promote or demote a user's trusted-lender role. */
  async setTrustedLender(targetUserId: string, enabled: boolean): Promise<void> {
    const target = await this.users.getByUserId(targetUserId);
    if (!target) throw new NotFound('User', targetUserId);
    // Never silently strip an admin role via this path.
    if (target.role === 'admin') {
      throw new ValidationError('Cannot change an admin via this action.');
    }
    await this.users.setRole(targetUserId, enabled ? 'trusted_lender' : 'member');
  }
}
