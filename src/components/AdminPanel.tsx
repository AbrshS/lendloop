'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ShieldCheck, Trash2, ShieldAlert } from 'lucide-react';
import { StatusChip, type StatusType } from './StatusChip';
import { formatDate } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';

export function AdminPanel() {
  const [adminTab, setAdminTab] = useState<'loans' | 'listings' | 'lenders'>('loans');
  const allLoans = useQuery(api.admin.listAllLoans);
  const allTools = useQuery(api.tools.listAll);
  const removeAnyTool = useMutation(api.admin.removeAnyTool);
  const setTrustedLender = useMutation(api.admin.setTrustedLender);

  const [toolToRemove, setToolToRemove] = useState<Id<'tools'> | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemoveTool(toolId: Id<'tools'>) {
    try {
      setIsRemoving(true);
      await removeAnyTool({ toolId });
      toast.success('Listing removed by admin.');
      setToolToRemove(null);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to remove listing.');
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleToggleTrusted(userId: string, current: boolean) {
    try {
      await setTrustedLender({
        targetUserId: userId,
        enabled: !current,
      });
      toast.success(!current ? 'User marked as Trusted Lender.' : 'Trusted Lender badge removed.');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to update user.');
    }
  }

  // Extract unique users across tools and loans
  const uniqueLenders = React.useMemo(() => {
    if (!allTools) return [];
    const map = new Map<string, { userId: string; toolCount: number }>();
    for (const t of allTools) {
      const existing = map.get(t.userId);
      if (existing) {
        existing.toolCount += 1;
      } else {
        map.set(t.userId, { userId: t.userId, toolCount: 1 });
      }
    }
    return Array.from(map.values());
  }, [allTools]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h2 className="font-display font-semibold text-2xl text-ink">
            Admin Dashboard
          </h2>
          <p className="text-sm text-ink-soft">
            Community moderation, loan oversight, and lender trust management.
          </p>
        </div>

        <div className="flex bg-white border border-line rounded-lg p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setAdminTab('loans')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              adminTab === 'loans' ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            All Loans ({allLoans?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('listings')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              adminTab === 'listings' ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            All Listings ({allTools?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('lenders')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              adminTab === 'lenders' ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            Lenders ({uniqueLenders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ALL LOANS */}
      {adminTab === 'loans' && (
        <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bench/60 text-xs font-semibold text-ink-soft border-b border-line uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Lender</th>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {!allLoans ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-soft">
                      Loading loans...
                    </td>
                  </tr>
                ) : allLoans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-soft">
                      No loans found in the system.
                    </td>
                  </tr>
                ) : (
                  allLoans.map((loan) => {
                    const isOverdue =
                      loan.status === 'approved' && loan.endDate < Date.now();
                    return (
                      <tr key={loan._id} className="hover:bg-bench/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-ink">
                          {loan.toolId.slice(0, 12)}...
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-ink-soft">
                          {loan.borrowerId.slice(0, 12)}...
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-ink-soft">
                          {loan.lenderId.slice(0, 12)}...
                        </td>
                        <td className="py-3 px-4 text-ink-soft">
                          {formatDate(loan.startDate)} – {formatDate(loan.endDate)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusChip
                            status={isOverdue ? 'overdue' : (loan.status as StatusType)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALL LISTINGS */}
      {adminTab === 'listings' && (
        <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bench/60 text-xs font-semibold text-ink-soft border-b border-line uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Owner ID</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {!allTools ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-soft">
                      Loading listings...
                    </td>
                  </tr>
                ) : allTools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-soft">
                      No tools listed.
                    </td>
                  </tr>
                ) : (
                  allTools.map((t) => (
                    <tr key={t._id} className="hover:bg-bench/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-ink">{t.name}</td>
                      <td className="py-3 px-4 text-ink-soft capitalize">{t.category}</td>
                      <td className="py-3 px-4 text-ink-soft capitalize">{t.condition}</td>
                      <td className="py-3 px-4 text-xs font-mono text-ink-soft">
                        {t.userId.slice(0, 16)}...
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setToolToRemove(t._id as Id<'tools'>)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline px-2 py-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LENDERS (TRUSTED LENDER TOGGLE) */}
      {adminTab === 'lenders' && (
        <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bench/60 text-xs font-semibold text-ink-soft border-b border-line uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Lender Subject / ID</th>
                  <th className="py-3 px-4">Tools Listed</th>
                  <th className="py-3 px-4 text-right">Trusted Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {uniqueLenders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-ink-soft">
                      No active lenders found.
                    </td>
                  </tr>
                ) : (
                  uniqueLenders.map((l) => (
                    <tr key={l.userId} className="hover:bg-bench/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-ink">{l.userId}</td>
                      <td className="py-3 px-4 text-ink-soft">{l.toolCount} tools</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleTrusted(l.userId, false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-bench hover:bg-tape hover:text-ink text-xs font-medium rounded-lg border border-line transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-tape" />
                          Toggle Trusted
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation modal for admin deletion */}
      {toolToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-line p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 text-danger mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-display font-semibold text-lg text-ink">
                Remove Listing?
              </h3>
            </div>
            <p className="text-sm text-ink-soft mb-6">
              As an admin, this will permanently remove the tool from the board and cancel any non-completed loans.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setToolToRemove(null)}
                className="px-4 py-2 text-sm text-ink-soft hover:text-ink rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => handleRemoveTool(toolToRemove)}
                className="px-4 py-2 text-sm font-medium bg-danger text-white rounded-lg hover:bg-danger/90 transition-all"
              >
                {isRemoving ? 'Removing...' : 'Remove listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
