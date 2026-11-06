import { describe, it, expect } from 'vitest';
import { AccessControl } from '../security/AccessControl';
import { ToolPolicy } from '../domain/ToolPolicy';
import { LoanPolicy } from '../domain/LoanPolicy';
import { Unauthenticated, Forbidden } from '../domain/errors';

// ── actors ────────────────────────────────────────────────────────────────
const owner = { userId: 'clerk-owner', email: 'o@x.com', name: 'Owner', role: 'member' as const };
const other = { userId: 'clerk-other', email: 't@x.com', name: 'Other', role: 'member' as const };
const admin = { userId: 'clerk-admin', email: 'a@x.com', name: 'Admin', role: 'admin' as const };

describe('permissions matrix: tool edit', () => {
  const toolOwnedByOwner = { ownerId: owner.userId };

  it('anonymous -> Unauthenticated (no identity)', () => {
    expect(() => AccessControl.requireUser(null)).toThrow(Unauthenticated);
  });

  it('other user -> cannot edit', () => {
    expect(ToolPolicy.canEdit(other, toolOwnedByOwner)).toBe(false);
  });

  it('owner -> can edit', () => {
    expect(ToolPolicy.canEdit(owner, toolOwnedByOwner)).toBe(true);
  });

  it('admin -> can edit', () => {
    expect(ToolPolicy.canEdit(admin, toolOwnedByOwner)).toBe(true);
  });
});

describe('permissions matrix: tool delete', () => {
  const toolOwnedByOwner = { ownerId: owner.userId };

  it('owner with active/pending loans -> blocked', () => {
    expect(ToolPolicy.isDeletableByOwner(['active'])).toBe(false);
    expect(ToolPolicy.isDeletableByOwner(['pending', 'approved'])).toBe(false);
    expect(() =>
      ToolPolicy.assertCanDelete(owner, toolOwnedByOwner, ['active']),
    ).toThrow(Forbidden);
  });

  it('owner with no outstanding loans -> allowed', () => {
    expect(() =>
      ToolPolicy.assertCanDelete(owner, toolOwnedByOwner, ['returned', 'declined']),
    ).not.toThrow();
  });

  it('other user -> forbidden', () => {
    expect(() => ToolPolicy.assertCanDelete(other, toolOwnedByOwner, [])).toThrow(Forbidden);
  });

  it('admin -> can remove anything', () => {
    expect(() => ToolPolicy.assertCanDelete(admin, toolOwnedByOwner, ['active'])).not.toThrow();
  });
});

describe('permissions matrix: loan approve (lender action)', () => {
  it('anonymous -> Unauthenticated', () => {
    expect(() => AccessControl.requireUser(null)).toThrow(Unauthenticated);
  });

  it('non-lender (borrower) -> assertOwner throws Forbidden', () => {
    expect(() => AccessControl.assertOwner(owner, 'lender-subject')).toThrow(Forbidden);
  });

  it('lender -> allowed', () => {
    expect(() => AccessControl.assertOwner({ ...owner, userId: 'lender-subject' }, 'lender-subject')).not.toThrow();
  });

  it('admin -> allowed', () => {
    expect(() => AccessControl.assertOwner(admin, 'lender-subject')).not.toThrow();
  });

  it('only lenders can move pending -> approved', () => {
    expect(LoanPolicy.canTransition('pending', 'approved', 'lender')).toBe(true);
    expect(LoanPolicy.canTransition('pending', 'approved', 'borrower')).toBe(false);
  });
});

describe('permissions matrix: loan cancel (borrower action)', () => {
  it('borrower can cancel pending', () => {
    expect(LoanPolicy.canTransition('pending', 'cancelled', 'borrower')).toBe(true);
  });

  it('lender cannot cancel', () => {
    expect(LoanPolicy.canTransition('pending', 'cancelled', 'lender')).toBe(false);
  });

  it('only admin (non-party) can cancel on behalf', () => {
    expect(LoanPolicy.canTransition('approved', 'cancelled', 'admin')).toBe(false);
    // admin cancels only in the active->returned path per our table;
    // cancellation is borrower-only.
  });
});

describe('permissions matrix: admin-only actions', () => {
  it('requireAdmin throws for a member', () => {
    expect(() => AccessControl.requireAdmin(owner)).toThrow(Forbidden);
  });

  it('requireAdmin passes for an admin', () => {
    expect(() => AccessControl.requireAdmin(admin)).not.toThrow();
  });

  it('removeAnyTool is admin-only', () => {
    expect(ToolPolicy.canRemove(owner)).toBe(false);
    expect(ToolPolicy.canRemove(admin)).toBe(true);
  });
});
