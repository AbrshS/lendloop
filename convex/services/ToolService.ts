/**
 * ToolService — tool listing, creation, editing, and deletion use cases.
 *
 * `listPublic` returns only the fields safe for anonymous browsing; that's
 * the data-minimization seam (the public handler calls only this). Owned tools
 * require an authenticated actor; deletion is blocked while active/pending
 * loans exist (ToolPolicy).
 */
import type { MutationCtx, QueryCtx } from '../_generated/server';
import {
  ToolRepository,
  type ToolDoc,
  type ToolInsert,
  type ToolPatch,
  type PublicTool,
  type IToolRepository,
} from '../repositories/ToolRepository';
import { LoanRepository } from '../repositories/LoanRepository';
import { ToolPolicy } from '../domain/ToolPolicy';
import { ValidationError } from '../domain/errors';
import { AccessControl, type Actor } from '../security/AccessControl';
import { CATEGORIES, CONDITIONS } from '../domain/constants';

export type ToolCreateInput = Omit<ToolInsert, 'userId'>;

export class ToolService {
  private tools: IToolRepository;

  constructor(
    private readonly ctx: MutationCtx | QueryCtx,
    private readonly actor: Actor,
  ) {
    this.tools = new ToolRepository(ctx);
  }

  /** Anonymous-safe public browse list: only { name, category }. */
  async listPublic(): Promise<PublicTool[]> {
    return this.tools.listPublic();
  }

  /** All tools with full detail — requires a signed-in user. */
  async listAll(): Promise<ToolDoc[]> {
    return this.tools.listAll();
  }

  /** The current user's own listings. */
  async listMine(): Promise<ToolDoc[]> {
    return this.tools.listByOwner(this.actor.userId);
  }

  /** Create a tool owned by the current user. */
  async create(input: ToolCreateInput): Promise<ToolDoc> {
    validateToolInput(input);
    return this.tools.insert({ ...input, userId: this.actor.userId });
  }

  /** Edit a tool — owner or admin only. */
  async update(id: string, patch: ToolPatch): Promise<void> {
    const tool = await this.tools.byId(id);
    if (!tool) throw new ValidationError('Tool not found.');
    ToolPolicy.assertCanEdit(this.actor, { ownerId: tool.userId });
    validateToolPatch(patch);
    await this.tools.update(id, patch);
  }

  /**
   * Delete a tool owned by the current user. Blocked if the tool has
   * active/pending loans. Admins use AdminService.removeAnyTool instead.
   */
  async remove(id: string): Promise<void> {
    const tool = await this.tools.byId(id);
    if (!tool) throw new ValidationError('Tool not found.');
    const conflicts = await new LoanRepository(this.ctx).nonTerminalStatusesForTool(id);
    ToolPolicy.assertCanDelete(this.actor, { ownerId: tool.userId }, conflicts);
    await this.tools.remove(id);
  }
}

/** Validate category + condition against the domain constants. */
function validateToolInput(input: ToolCreateInput): void {
  if (!input.name?.trim()) throw new ValidationError('Name is required.');
  if (!isCategory(input.category)) throw new ValidationError('Unknown category.');
  if (!isCondition(input.condition)) throw new ValidationError('Unknown condition.');
}

function validateToolPatch(patch: ToolPatch): void {
  if (patch.name !== undefined && !patch.name.trim()) {
    throw new ValidationError('Name cannot be empty.');
  }
  if (patch.category !== undefined && !isCategory(patch.category)) {
    throw new ValidationError('Unknown category.');
  }
  if (patch.condition !== undefined && !isCondition(patch.condition)) {
    throw new ValidationError('Unknown condition.');
  }
}

function isCategory(value: string): boolean {
  return (CATEGORIES as readonly string[]).includes(value);
}
function isCondition(value: string): boolean {
  return (CONDITIONS as readonly string[]).includes(value);
}
