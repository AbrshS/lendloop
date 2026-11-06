'use client';

import React, { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import {
  Wrench,
  Calendar,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Header, type MainTab } from '@/components/Header';
import { ToolTag } from '@/components/ToolTag';
import { CategoryChips } from '@/components/CategoryChips';
import { RequestDialog } from '@/components/RequestDialog';
import { ToolFormDialog } from '@/components/ToolFormDialog';
import { StatusChip, type StatusType } from '@/components/StatusChip';
import { LoanActivityFeed } from '@/components/LoanActivityFeed';
import { AdminPanel } from '@/components/AdminPanel';
import { formatDate } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [currentTab, setCurrentTab] = useState<MainTab>('tools');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dialog states
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<{
    id: Id<'tools'>;
    name: string;
    category: string;
    condition: string;
    description?: string;
  } | null>(null);

  const [requestingTool, setRequestingTool] = useState<{
    id: Id<'tools'>;
    name: string;
  } | null>(null);

  const [toolToDelete, setToolToDelete] = useState<{
    id: Id<'tools'>;
    name: string;
  } | null>(null);

  // Convex Queries
  const publicTools = useQuery(api.tools.listPublic);
  const allTools = useQuery(api.tools.listAll);
  const myTools = useQuery(api.tools.listMine);
  const myRequests = useQuery(api.loans.listMine);
  const incomingRequests = useQuery(api.loans.listIncoming);
  const currentUserRecord = useQuery(api.users.me);

  // Convex Mutations
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const approveLoan = useMutation(api.loans.approve);
  const declineLoan = useMutation(api.loans.decline);
  const cancelLoan = useMutation(api.loans.cancel);
  const markReturned = useMutation(api.loans.markReturned);
  const deleteTool = useMutation(api.tools.remove);

  // Sync user record on sign-in
  useEffect(() => {
    if (isSignedIn) {
      syncCurrentUser().catch(() => {});
    }
  }, [isSignedIn, syncCurrentUser]);

  const isAdmin = currentUserRecord?.role === 'admin';

  // Count pending incoming requests for badge
  const pendingIncomingCount =
    incomingRequests?.filter((r) => r.status === 'pending').length ?? 0;

  // Filter tools by category
  const filteredTools = React.useMemo(() => {
    if (!allTools) return [];
    if (selectedCategory.toLowerCase() === 'all') return allTools;
    return allTools.filter(
      (t) => t.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [allTools, selectedCategory]);

  const filteredPublicTools = React.useMemo(() => {
    if (!publicTools) return [];
    if (selectedCategory.toLowerCase() === 'all') return publicTools;
    return publicTools.filter(
      (t) => t.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [publicTools, selectedCategory]);

  // Handle loan actions with toast
  async function handleApprove(loanId: Id<'loans'>) {
    try {
      await approveLoan({ loanId });
      toast.success('Request approved.');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to approve request.');
    }
  }

  async function handleDecline(loanId: Id<'loans'>) {
    try {
      await declineLoan({ loanId });
      toast.success('Request declined.');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to decline request.');
    }
  }

  async function handleCancel(loanId: Id<'loans'>) {
    try {
      await cancelLoan({ loanId });
      toast.success('Request cancelled.');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to cancel request.');
    }
  }

  async function handleMarkReturned(loanId: Id<'loans'>) {
    try {
      await markReturned({ loanId });
      toast.success('Tool marked as returned.');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to mark as returned.');
    }
  }

  async function handleDeleteTool(toolId: Id<'tools'>) {
    try {
      await deleteTool({ id: toolId });
      toast.success('Tool deleted.');
      setToolToDelete(null);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Could not delete tool. Check for active loans.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bench">
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenListTool={() => {
          setEditingTool(null);
          setIsListModalOpen(true);
        }}
        incomingCount={pendingIncomingCount}
        isAdmin={isAdmin}
      />

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* ── 1. SIGNED OUT PUBLIC HERO & LIVE TOOL BOARD ── */}
        {!isSignedIn && (
          <div className="space-y-12">
            <section className="pt-6 pb-4 max-w-2xl">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-loop bg-loop/10 px-3 py-1 rounded-full mb-3">
                Neighborhood Tool-Lending
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight leading-[1.15] mb-4">
                Borrow what you need. <br />
                Lend what you don’t.
              </h1>
              <p className="text-ink-soft text-base md:text-lg mb-6 leading-relaxed">
                Connect with neighbors to borrow lawn mowers, drills, camping gear,
                and kitchen appliances. Safe, simple, and free.
              </p>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-6 py-3 bg-ink text-white font-medium rounded-xl hover:bg-ink/90 active:scale-95 transition-all shadow-md text-sm md:text-base"
                >
                  Sign in to lend or borrow
                </button>
              </SignInButton>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h2 className="font-display font-semibold text-xl text-ink">
                    Available near you
                  </h2>
                  <p className="text-xs text-ink-soft">
                    Browse neighborhood tools. Sign in to see conditions and request dates.
                  </p>
                </div>
              </div>

              <CategoryChips
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />

              {!publicTools ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-surface/50 border border-line/60 rounded-xl animate-pulse tool-tag"
                    />
                  ))}
                </div>
              ) : filteredPublicTools.length === 0 ? (
                <div className="bg-surface border border-line rounded-xl p-8 text-center text-ink-soft">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-ink">No tools available in this category yet.</p>
                  <p className="text-xs text-ink-soft mt-1">Check back later or sign in to list one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {filteredPublicTools.map((t) => (
                    <ToolTag
                      key={t._id}
                      id={t._id}
                      name={t.name}
                      category={t.category}
                      publicOnly
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── 2. AUTHENTICATED VIEWS ── */}
        {isSignedIn && (
          <div>
            {/* VIEW A: ALL TOOLS */}
            {currentTab === 'tools' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <h1 className="font-display font-semibold text-2xl text-ink">
                      Community Tools
                    </h1>
                    <p className="text-xs md:text-sm text-ink-soft">
                      Borrow tools listed by neighbors in your area.
                    </p>
                  </div>
                  <CategoryChips
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>

                {!allTools ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-44 bg-surface/50 border border-line/60 rounded-xl animate-pulse tool-tag"
                      />
                    ))}
                  </div>
                ) : filteredTools.length === 0 ? (
                  <div className="bg-surface border border-line rounded-xl p-10 text-center">
                    <Wrench className="w-10 h-10 mx-auto text-ink-soft/40 mb-3" />
                    <h3 className="font-display font-semibold text-base text-ink mb-1">
                      No tools in this category yet.
                    </h3>
                    <p className="text-sm text-ink-soft mb-5">
                      Be the first neighbor to list one!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTool(null);
                        setIsListModalOpen(true);
                      }}
                      className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
                    >
                      List a tool
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredTools.map((t) => (
                      <ToolTag
                        key={t._id}
                        id={t._id}
                        name={t.name}
                        category={t.category}
                        condition={t.condition}
                        description={t.description}
                        isOwner={t.userId === user?.id}
                        onRequest={() =>
                          setRequestingTool({
                            id: t._id as Id<'tools'>,
                            name: t.name,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW B: MY LISTINGS */}
            {currentTab === 'listings' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <h1 className="font-display font-semibold text-2xl text-ink">
                      My Listings
                    </h1>
                    <p className="text-xs md:text-sm text-ink-soft">
                      Tools you are currently sharing with the neighborhood.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTool(null);
                      setIsListModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>List a tool</span>
                  </button>
                </div>

                {!myTools ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-surface/50 border border-line rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : myTools.length === 0 ? (
                  <div className="bg-surface border border-line rounded-xl p-10 text-center">
                    <Wrench className="w-10 h-10 mx-auto text-ink-soft/40 mb-3" />
                    <h3 className="font-display font-semibold text-base text-ink mb-1">
                      You haven’t listed any tools.
                    </h3>
                    <p className="text-sm text-ink-soft mb-5">
                      Got a drill, ladder, or lawn mower sitting idle? Share it with neighbors!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTool(null);
                        setIsListModalOpen(true);
                      }}
                      className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
                    >
                      List your first tool
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myTools.map((t) => {
                      // Count pending incoming requests on this tool
                      const pendingOnThisTool =
                        incomingRequests?.filter(
                          (req) => req.toolId === t._id && req.status === 'pending',
                        ).length ?? 0;

                      return (
                        <div
                          key={t._id}
                          className="bg-surface border border-line rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-display font-semibold text-lg text-ink">
                                {t.name}
                              </h3>
                              {pendingOnThisTool > 0 && (
                                <span className="px-2 py-0.5 bg-tape text-ink text-xs font-semibold rounded-full shrink-0">
                                  {pendingOnThisTool} pending
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-ink-soft mb-2">
                              <span className="capitalize bg-bench px-2 py-0.5 rounded">
                                {t.category}
                              </span>
                              <span>• condition: <span className="capitalize">{t.condition}</span></span>
                            </div>
                            {t.description && (
                              <p className="text-xs text-ink-soft line-clamp-2">
                                {t.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line/50">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTool({
                                  id: t._id as Id<'tools'>,
                                  name: t.name,
                                  category: t.category,
                                  condition: t.condition,
                                  description: t.description,
                                });
                                setIsListModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg border border-line hover:bg-bench transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setToolToDelete({
                                  id: t._id as Id<'tools'>,
                                  name: t.name,
                                })
                              }
                              className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW C: MY REQUESTS */}
            {currentTab === 'requests' && (
              <div className="space-y-5">
                <div className="border-b border-line pb-4">
                  <h1 className="font-display font-semibold text-2xl text-ink">
                    My Borrow Requests
                  </h1>
                  <p className="text-xs md:text-sm text-ink-soft">
                    Tools you have requested or currently have checked out.
                  </p>
                </div>

                {!myRequests ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-surface/50 border border-line rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : myRequests.length === 0 ? (
                  <div className="bg-surface border border-line rounded-xl p-10 text-center">
                    <Calendar className="w-10 h-10 mx-auto text-ink-soft/40 mb-3" />
                    <h3 className="font-display font-semibold text-base text-ink mb-1">
                      No borrow requests yet.
                    </h3>
                    <p className="text-sm text-ink-soft mb-5">
                      Need a tool for an upcoming project? Browse community listings!
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('tools')}
                      className="px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
                    >
                      Browse tools
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map((req) => {
                      const isOverdue =
                        req.status === 'approved' &&
                        req.endDate < Date.now() &&
                        !req.returnedAt;

                      return (
                        <div
                          key={req._id}
                          className="bg-surface border border-line rounded-xl p-4 md:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-display font-semibold text-base text-ink">
                                Tool Request
                              </h3>
                              <StatusChip
                                status={isOverdue ? 'overdue' : (req.status as StatusType)}
                              />
                            </div>
                            <div className="text-xs text-ink-soft flex items-center gap-2">
                              <span>
                                Dates: {formatDate(req.startDate)} – {formatDate(req.endDate)}
                              </span>
                            </div>
                            {req.requestNote && (
                              <p className="text-xs text-ink-soft mt-1 italic">
                                “{req.requestNote}”
                              </p>
                            )}
                            {/* Bonus Activity feed */}
                            <LoanActivityFeed loanId={req._id as Id<'loans'>} />
                          </div>

                          {req.status === 'pending' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCancel(req._id as Id<'loans'>)}
                                className="px-3 py-1.5 text-xs font-medium text-danger border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                Cancel request
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW D: INCOMING REQUESTS */}
            {currentTab === 'incoming' && (
              <div className="space-y-6">
                <div className="border-b border-line pb-4">
                  <h1 className="font-display font-semibold text-2xl text-ink">
                    Incoming Requests
                  </h1>
                  <p className="text-xs md:text-sm text-ink-soft">
                    Review and approve borrow requests from neighbors for your tools.
                  </p>
                </div>

                {!incomingRequests ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-surface/50 border border-line rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <div className="bg-surface border border-line rounded-xl p-10 text-center">
                    <Clock className="w-10 h-10 mx-auto text-ink-soft/40 mb-3" />
                    <h3 className="font-display font-semibold text-base text-ink mb-1">
                      No incoming requests.
                    </h3>
                    <p className="text-sm text-ink-soft">
                      When neighbors request to borrow your tools, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* SECTION 1: Needs your answer (pending) */}
                    {incomingRequests.filter((r) => r.status === 'pending').length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
                          <span>Needs your answer</span>
                          <span className="px-2 py-0.5 text-xs bg-tape text-ink font-bold rounded-full">
                            {incomingRequests.filter((r) => r.status === 'pending').length}
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {incomingRequests
                            .filter((r) => r.status === 'pending')
                            .map((req) => (
                              <div
                                key={req._id}
                                className="bg-surface border-2 border-tape/40 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-display font-semibold text-base text-ink">
                                      Borrow Request
                                    </h4>
                                    <StatusChip status="pending" />
                                  </div>
                                  <p className="text-xs text-ink-soft mb-1">
                                    Requested: {formatDate(req.startDate)} – {formatDate(req.endDate)}
                                  </p>
                                  {req.requestNote && (
                                    <p className="text-xs text-ink bg-bench/50 p-2 rounded-md border border-line/40 max-w-lg mb-1">
                                      Note: “{req.requestNote}”
                                    </p>
                                  )}
                                  <LoanActivityFeed loanId={req._id as Id<'loans'>} />
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleDecline(req._id as Id<'loans'>)}
                                    className="px-4 py-2 text-xs font-medium text-ink-soft hover:text-ink border border-line rounded-lg hover:bg-bench transition-colors min-h-[40px]"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(req._id as Id<'loans'>)}
                                    className="px-5 py-2 text-xs font-medium bg-ink text-white rounded-lg hover:bg-ink/90 active:scale-95 transition-all shadow-xs min-h-[40px]"
                                  >
                                    Approve request
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: Active loans (approved) */}
                    {incomingRequests.filter((r) => r.status === 'approved').length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display font-semibold text-base text-ink">
                          Active Loans
                        </h3>
                        <div className="space-y-3">
                          {incomingRequests
                            .filter((r) => r.status === 'approved')
                            .map((req) => {
                              const isOverdue = req.endDate < Date.now();
                              return (
                                <div
                                  key={req._id}
                                  className="bg-surface border border-line rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-display font-semibold text-base text-ink">
                                        Active Loan
                                      </h4>
                                      <StatusChip
                                        status={isOverdue ? 'overdue' : 'approved'}
                                      />
                                    </div>
                                    <p className="text-xs text-ink-soft">
                                      Due date: {formatDate(req.endDate)}
                                    </p>
                                    <LoanActivityFeed loanId={req._id as Id<'loans'>} />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleMarkReturned(req._id as Id<'loans'>)}
                                    className="px-4 py-2 text-xs font-medium bg-bench hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Mark as returned</span>
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 3: Loan History */}
                    {incomingRequests.filter(
                      (r) => r.status !== 'pending' && r.status !== 'approved',
                    ).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display font-semibold text-base text-ink-soft">
                          History
                        </h3>
                        <div className="space-y-2 opacity-80">
                          {incomingRequests
                            .filter(
                              (r) => r.status !== 'pending' && r.status !== 'approved',
                            )
                            .map((req) => (
                              <div
                                key={req._id}
                                className="bg-surface border border-line rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-ink-soft"
                              >
                                <div>
                                  <span className="font-medium text-ink">
                                    Loan {req.status}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>{formatDate(req.startDate)} – {formatDate(req.endDate)}</span>
                                </div>
                                <StatusChip status={req.status as StatusType} />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VIEW E: ADMIN DASHBOARD */}
            {currentTab === 'admin' && isAdmin && <AdminPanel />}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {/* 1. Request to borrow modal */}
      {requestingTool && (
        <RequestDialog
          toolId={requestingTool.id}
          toolName={requestingTool.name}
          isOpen={!!requestingTool}
          onClose={() => setRequestingTool(null)}
        />
      )}

      {/* 2. List / Edit Tool modal */}
      {isListModalOpen && (
        <ToolFormDialog
          toolToEdit={editingTool ?? undefined}
          isOpen={isListModalOpen}
          onClose={() => {
            setIsListModalOpen(false);
            setEditingTool(null);
          }}
        />
      )}

      {/* 3. Confirm Delete Tool Modal */}
      {toolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-line p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-display font-semibold text-lg text-ink mb-2">
              Delete {toolToDelete.name}?
            </h3>
            <p className="text-sm text-ink-soft mb-6">
              This action cannot be undone. You cannot delete a tool that has active or pending loans.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setToolToDelete(null)}
                className="px-4 py-2 text-sm text-ink-soft hover:text-ink rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTool(toolToDelete.id)}
                className="px-4 py-2 text-sm font-medium bg-danger text-white rounded-lg hover:bg-danger/90 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
