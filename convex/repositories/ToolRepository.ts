/**
 * ToolRepository — the only place that reads/writes the `tools` table.
 *
 * `listPublic` returns ONLY the fields safe for anonymous browsing
 * ({ name, category }). This is the data-minimization seam; the public query
 * handler calls only this method. See publicQuery.test.ts.
 */
import type { MutationCtx, QueryCtx } from '../_generated/server';

export interface ToolDoc {
  _id: string;
  userId: string;
  name: string;
  category: string;
  condition: string;
  description?: string;
  imageUrl?: string;
  createdAt: number;
}

/** The shape exposed to anonymous users — nothing more. */
export interface PublicTool {
  _id: string;
  name: string;
  category: string;
}

/**
 * Pure mapper: project a full tool row down to the anonymous-safe view.
 * This is the data-minimization primitive; publicQuery.test.ts asserts the
 * output has EXACTLY these keys and nothing more.
 */
export function toPublicTool(tool: ToolDoc): PublicTool {
  return {
    _id: tool._id,
    name: tool.name,
    category: tool.category,
  };
}

export interface ToolInsert {
  userId: string;
  name: string;
  category: string;
  condition: string;
  description?: string;
  imageUrl?: string;
}

export interface ToolPatch {
  name?: string;
  category?: string;
  condition?: string;
  description?: string;
  imageUrl?: string;
}

export interface IToolRepository {
  byId(id: string): Promise<ToolDoc | null>;
  listAll(): Promise<ToolDoc[]>;
  listByOwner(userId: string): Promise<ToolDoc[]>;
  listPublic(): Promise<PublicTool[]>;
  insert(tool: ToolInsert): Promise<ToolDoc>;
  update(id: string, patch: ToolPatch): Promise<void>;
  remove(id: string): Promise<void>;
}

export class ToolRepository implements IToolRepository {
  constructor(private readonly ctx: MutationCtx | QueryCtx) {}

  async byId(id: string): Promise<ToolDoc | null> {
    const row = await this.ctx.db.get(id as any);
    return row ? toDoc(row) : null;
  }

  async listAll(): Promise<ToolDoc[]> {
    const rows = await this.ctx.db.query('tools').collect();
    return rows.map(toDoc);
  }

  async listByOwner(userId: string): Promise<ToolDoc[]> {
    const rows = await this.ctx.db
      .query('tools')
      .withIndex('by_owner', (q) => q.eq('userId', userId))
      .collect();
    return rows.map(toDoc);
  }

  /**
   * Anonymous-safe list: only { _id, name, category }.
   * This is the ONLY method the public query handler may call.
   */
  async listPublic(): Promise<PublicTool[]> {
    const rows = await this.ctx.db.query('tools').collect();
    return rows.map((r) => toPublicTool(toDoc(r)));
  }

  async insert(tool: ToolInsert): Promise<ToolDoc> {
    const id = await (this.ctx as MutationCtx).db.insert('tools', {
      userId: tool.userId,
      name: tool.name,
      category: tool.category,
      condition: tool.condition,
      description: tool.description,
      imageUrl: tool.imageUrl,
      createdAt: BigInt(Date.now()),
    });
    const row = await this.ctx.db.get(id);
    return toDoc(row!);
  }

  async update(id: string, patch: ToolPatch): Promise<void> {
    await (this.ctx as MutationCtx).db.patch(id as any, patch);
  }

  async remove(id: string): Promise<void> {
    await (this.ctx as MutationCtx).db.delete(id as any);
  }
}

function toDoc(row: any): ToolDoc {
  return {
    _id: row._id as string,
    userId: row.userId,
    name: row.name,
    category: row.category,
    condition: row.condition,
    description: row.description,
    imageUrl: row.imageUrl,
    createdAt: Number(row.createdAt),
  };
}
