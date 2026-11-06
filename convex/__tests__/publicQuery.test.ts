import { describe, it, expect } from 'vitest';
import { toPublicTool, type ToolDoc } from '../repositories/ToolRepository';

/** A full tool row with lots of fields a public query must NOT expose. */
const fullTool: ToolDoc = {
  _id: 'tools/123',
  userId: 'clerk-owner-secret',
  name: 'Cordless Drill',
  category: 'power tools',
  condition: 'good',
  description: '18V with two batteries',
  imageUrl: 'https://example.com/img.png',
  createdAt: 1_730_000_000_000,
};

describe('public query data minimization', () => {
  it('toPublicTool exposes only { _id, name, category }', () => {
    const pub = toPublicTool(fullTool);
    expect(Object.keys(pub).sort()).toEqual(['_id', 'category', 'name']);
  });

  it('never exposes the owner id', () => {
    const pub = toPublicTool(fullTool);
    expect((pub as unknown as Record<string, unknown>).userId).toBeUndefined();
  });

  it('never exposes description, image, condition, or createdAt', () => {
    const pub = toPublicTool(fullTool) as unknown as Record<string, unknown>;
    expect(pub.description).toBeUndefined();
    expect(pub.imageUrl).toBeUndefined();
    expect(pub.condition).toBeUndefined();
    expect(pub.createdAt).toBeUndefined();
  });

  it('preserves the correct values for the allowed fields', () => {
    const pub = toPublicTool(fullTool);
    expect(pub).toEqual({
      _id: 'tools/123',
      name: 'Cordless Drill',
      category: 'power tools',
    });
  });

  it('works across multiple tools (a list stays minimized)', () => {
    const list = [fullTool, { ...fullTool, _id: 'tools/456', name: 'Hammer', category: 'hand tools' }];
    const pubs = list.map(toPublicTool);
    for (const p of pubs) {
      expect(Object.keys(p).sort()).toEqual(['_id', 'category', 'name']);
    }
  });
});
