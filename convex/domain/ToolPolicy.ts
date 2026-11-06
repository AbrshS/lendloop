/**
 * ToolPolicy — who may edit, delete, or remove a tool.
 *
 * Distinction: "delete" is the owner removing their own listing; "remove" is
 * an admin forcibly taking down any listing. The owner cannot delete a tool
 * that has active/pending loans against it; an admin can remove anything
 * (with appropriate downstream handling by the service).
 *
 * Pure: takes only primitives/value objects, no Convex.
 */

import { LoanStatus } from './constants';
import { Forbidden } from './errors';

/** The actor's relationship to a tool. */
export type ToolActor = {
  userId: string;
  role: 'member' | 'admin' | 'trusted_lender';
};

/** A tool's owner id, or undefined for a not-yet-saved tool. */
export type ToolOwnership = {
  ownerId: string | undefined;
};

export class ToolPolicy {
  /** Whether the actor may edit a tool's fields. */
  static canEdit(actor: ToolActor, ownership: ToolOwnership): boolean {
    if (actor.role === 'admin') return true;
    return ownership.ownerId === actor.userId;
  }

  /** Whether the owner may delete their own tool (no active/pending loans). */
  static isDeletableByOwner(conflictingLoanStatuses: LoanStatus[]): boolean {
    return !conflictingLoanStatuses.some(
      (s) => s === 'pending' || s === 'approved' || s === 'active',
    );
  }

  /** An admin can remove any tool regardless of outstanding loans. */
  static canRemove(actor: ToolActor): boolean {
    return actor.role === 'admin';
  }

  /** Assert the actor may edit; throw Forbidden otherwise. */
  static assertCanEdit(actor: ToolActor, ownership: ToolOwnership): void {
    if (!ToolPolicy.canEdit(actor, ownership)) {
      throw new Forbidden('You can only edit your own tools.');
    }
  }

  /** Assert the actor may delete; considers both ownership and loan state. */
  static assertCanDelete(
    actor: ToolActor,
    ownership: ToolOwnership,
    conflictingLoanStatuses: LoanStatus[],
  ): void {
    if (actor.role === 'admin') return;
    if (ownership.ownerId !== actor.userId) {
      throw new Forbidden('You can only delete your own tools.');
    }
    if (!ToolPolicy.isDeletableByOwner(conflictingLoanStatuses)) {
      throw new Forbidden(
        'This tool has active or pending loans and cannot be deleted.',
      );
    }
  }

  /** Assert the actor is an admin (used by removeAnyTool). */
  static assertCanRemove(actor: ToolActor): void {
    if (!ToolPolicy.canRemove(actor)) {
      throw new Forbidden('Only admins can remove any tool.');
    }
  }
}
