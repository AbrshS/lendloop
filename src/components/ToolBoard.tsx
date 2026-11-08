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
  Search,
  Inbox,
  MapPin,
  Check,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { type MainTab } from '@/components/Header';
import { RequestDialog } from '@/components/RequestDialog';
import { ToolFormDialog } from '@/components/ToolFormDialog';
import { StatusChip, type StatusType } from '@/components/StatusChip';
import { AdminPanel } from '@/components/AdminPanel';
import { formatDate } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';

// shadcn sidebar-08 imports
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface ToolBoardProps {
  initialTab?: MainTab;
  openCreateModalOnMount?: boolean;
  onBackToLanding?: () => void;
}

const CATEGORIES = [
  'All',
  'Power tools',
  'Woodworking',
  'Garden',
  'Masonry',
  'Ladders',
  'Cleaning',
  'Other',
];

const NEIGHBORHOODS = [
  'All Blocks',
  'Park Slope',
  'Prospect Heights',
  'Fort Greene',
  'Gowanus',
];

// Curated starter tools for community blocks (keeps the board alive & authentic)
const STARTER_TOOLS = [
  {
    id: 'starter-1',
    name: 'DeWalt DWS779 12" Sliding Compound Miter Saw',
    category: 'Woodworking',
    condition: 'Commercial grade',
    neighborhood: 'Park Slope · 8th Ave & 3rd St',
    distance: '2 blocks away',
    pickup: 'Front porch keyless locker or stoop greeting',
    specs: '15 Amp, 3800 RPM, 60T carbide blade included',
    owner: 'Marcus Thompson',
    ownerLoans: '32 loans',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80',
    status: 'available',
  },
  {
    id: 'starter-2',
    name: 'Bosch Bulldog Xtreme 1" SDS-Plus Rotary Hammer',
    category: 'Masonry',
    condition: 'Heavy duty',
    neighborhood: 'Prospect Heights · Sterling Place',
    distance: '4 blocks away',
    pickup: 'Porch handover with eye protection & earplugs',
    specs: '8.0 Amp, masonry bits 1/4" to 3/4" in steel case',
    owner: 'Elena Rostova',
    ownerLoans: '45 loans',
    image:
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=700&q=80',
    status: 'available',
  },
  {
    id: 'starter-3',
    name: 'Werner 22-Foot Reach Pro Multi-Position Ladder',
    category: 'Ladders',
    condition: 'Like new',
    neighborhood: 'Park Slope · Berkeley Place',
    distance: '3 blocks away',
    pickup: 'Side alleyway storage with combination code',
    specs: '375 lb capacity (Type IAA), converts to 5 setups',
    owner: 'Priya & Sam',
    ownerLoans: '28 loans',
    image:
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=700&q=80',
    status: 'available',
  },
  {
    id: 'starter-4',
    name: 'Sun Joe SPX3000 Max Electric Pressure Washer',
    category: 'Cleaning',
    condition: 'Freshly tuned',
    neighborhood: 'Fort Greene · S. Oxford St',
    distance: '5 blocks away',
    pickup: 'Garden gate access · Garden hose included',
    specs: '2030 Max PSI, 1.76 GPM, 5 quick-spray nozzles',
    owner: 'Julian Chen',
    ownerLoans: '19 loans',
    image:
      'https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=700&q=80',
    status: 'available',
  },
  {
    id: 'starter-5',
    name: 'Stihl BG 56 C-E Gas Handheld Leaf Blower',
    category: 'Garden',
    condition: 'Tuned up',
    neighborhood: 'Carroll Gardens · President St',
    distance: '6 blocks away',
    pickup: 'Front stoop pickup with safety glasses',
    specs: 'Easy2Start, 412 CFM, 2-stroke mixed fuel included',
    owner: 'David Moretti',
    ownerLoans: '14 loans',
    image:
      'https://images.unsplash.com/photo-1592417817098-8f3d69107936?auto=format&fit=crop&w=700&q=80',
    status: 'available',
  },
  {
    id: 'starter-6',
    name: 'Bostitch 6-Gallon Pancake Compressor & 18GA Nailer',
    category: 'Power tools',
    condition: 'Excellent',
    neighborhood: 'Prospect Heights · Lincoln Place',
    distance: '3 blocks away',
    pickup: 'Lobby concierge handover',
    specs: '150 Max PSI, 50ft hose and starter box of brads',
    owner: 'Sarah Jenkins',
    ownerLoans: '22 loans',
    image:
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=700&q=80',
    status: 'available',
  },
];

export function ToolBoard({
  initialTab = 'tools',
  openCreateModalOnMount = false,
  onBackToLanding,
}: ToolBoardProps) {
  const { isSignedIn } = useUser();
  const [currentTab, setCurrentTab] = useState<MainTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState('All Blocks');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isListModalOpen, setIsListModalOpen] = useState(openCreateModalOnMount);
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

  // Convex Queries (gated by auth with 'skip' to enforce security & eliminate unauthenticated server errors)
  const allTools = useQuery(api.tools.listAll, isSignedIn ? {} : 'skip');
  const publicTools = useQuery(api.tools.listPublic, !isSignedIn ? {} : 'skip');
  const myTools = useQuery(api.tools.listMine, isSignedIn ? {} : 'skip');
  const myRequests = useQuery(api.loans.listMine, isSignedIn ? {} : 'skip');
  const incomingRequests = useQuery(api.loans.listIncoming, isSignedIn ? {} : 'skip');
  const currentUserRecord = useQuery(api.users.me, isSignedIn ? {} : 'skip');

  // Map tools by id for quick lookup in loans
  const toolLookup = React.useMemo(() => {
    const map = new Map<string, { name: string; category: string }>();
    if (allTools) {
      allTools.forEach((t) =>
        map.set(t._id, { name: t.name, category: t.category }),
      );
    }
    return map;
  }, [allTools]);

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

  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (openCreateModalOnMount) {
      setIsListModalOpen(true);
    }
  }, [openCreateModalOnMount]);

  const isAdmin = currentUserRecord?.role === 'admin';

  // Count pending incoming requests for badge
  const pendingIncomingCount =
    incomingRequests?.filter((r) => r.status === 'pending').length ?? 0;

  // Combine database tools with starter tools so the bench is ALWAYS rich, living and authentic
  const combinedTools = React.useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      category: string;
      condition: string;
      description?: string;
      neighborhood: string;
      distance?: string;
      specs?: string;
      owner: string;
      ownerLoans?: string;
      image: string;
      isDbRecord: boolean;
      dbToolId?: Id<'tools'>;
      userId?: string;
    }> = [];

    // When authenticated: display full tool details from Convex
    if (isSignedIn && allTools && allTools.length > 0) {
      allTools.forEach((t) => {
        list.push({
          id: t._id,
          name: t.name,
          category: t.category,
          condition: t.condition,
          description: t.description,
          neighborhood: 'Park Slope · Community Bench',
          distance: 'Nearby neighbor',
          specs: t.description || 'Verified neighborhood equipment',
          owner: 'Community Member',
          ownerLoans: 'Active',
          image:
            t.imageUrl ||
            'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80',
          isDbRecord: true,
          dbToolId: t._id as unknown as Id<'tools'>,
          userId: t.userId,
        });
      });
    } else if (!isSignedIn && publicTools && publicTools.length > 0) {
      // When anonymous: display public tools (name + category only, no owner details)
      publicTools.forEach((t) => {
        list.push({
          id: t._id,
          name: t.name,
          category: t.category,
          condition: 'Community Shared',
          description: 'Sign in to inspect and request to borrow this equipment.',
          neighborhood: 'Brooklyn Hub · Public Bench',
          distance: 'Neighborhood item',
          specs: 'Verified equipment',
          owner: 'Neighbor',
          ownerLoans: 'Available',
          image:
            'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80',
          isDbRecord: true,
          dbToolId: t._id as unknown as Id<'tools'>,
          userId: undefined,
        });
      });
    }

    // Append starter tools
    STARTER_TOOLS.forEach((st) => {
      list.push({
        ...st,
        isDbRecord: false,
      });
    });

    return list;
  }, [isSignedIn, allTools, publicTools]);

  // Filter tools by category, search query, and neighborhood
  const displayedTools = React.useMemo(() => {
    return combinedTools.filter((t) => {
      const matchesCategory =
        selectedCategory.toLowerCase() === 'all' ||
        t.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(t.category.toLowerCase());

      const matchesNeighborhood =
        selectedNeighborhood === 'All Blocks' ||
        t.neighborhood
          .toLowerCase()
          .includes(selectedNeighborhood.toLowerCase());

      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.specs &&
          t.specs.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesNeighborhood && matchesSearch;
    });
  }, [combinedTools, selectedCategory, selectedNeighborhood, searchQuery]);

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
      toast.error((err as Error)?.message || 'Failed to delete tool.');
    }
  }

  const tabTitles: Record<MainTab, string> = {
    tools: 'The Bench',
    listings: 'My Workshop',
    requests: 'My Requests',
    incoming: 'Exchange Inbox',
    admin: 'Admin Desk',
  };

  return (
    <SidebarProvider>
      {/* 1. Official shadcn AppSidebar (clean, no redundant button) */}
      <AppSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onBackToLanding={onBackToLanding}
        incomingCount={pendingIncomingCount}
        myListingsCount={myTools?.length ?? 0}
        myRequestsCount={
          myRequests?.filter((r) => r.status === 'pending').length ?? 0
        }
        isAdmin={isAdmin}
      />

      {/* 2. Official shadcn SidebarInset (Unique, Living, Tactile Workspace) */}
      <SidebarInset className="bg-[#F4F4F1] min-h-screen flex flex-col">
        {/* Top Editorial Breadcrumb & Search Bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#E2E8E4] bg-white/90 px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentTab('tools');
                    }}
                    className="text-xs text-[#78716C] hover:text-[#151514]"
                  >
                    LendLoop
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-bold text-[#151514]">
                    {tabTitles[currentTab]}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Search, Filter, and Action */}
          <div className="flex items-center gap-3 flex-1 max-w-lg justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#8A9590]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, saws, drills..."
                className="w-full rounded-full border border-[#D8DFDC] bg-[#F7F9F8] pl-8 pr-3 py-1.5 text-xs text-[#151514] placeholder-[#8A9590] focus:border-[#151514] focus:bg-white focus:outline-none transition-all shadow-2xs"
              />
            </div>

            {isSignedIn && (
              <button
                onClick={() => setIsListModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#151514] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#262624] transition-all shrink-0 shadow-xs ring-1 ring-black/5"
              >
                <Plus className="size-3.5 text-[#F5C518]" />
                <span>List a Tool</span>
              </button>
            )}
          </div>
        </header>

        {/* Sub-Header: Category Pills & Neighborhood Selector (on Bench) */}
        {currentTab === 'tools' && (
          <div className="flex items-center justify-between gap-4 border-b border-[#E2E8E4] bg-white px-4 md:px-6 py-3 overflow-x-auto no-scrollbar shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-max">
              {CATEGORIES.map((cat) => {
                const isSelected =
                  selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#151514] text-white shadow-xs'
                        : 'bg-[#F4F4F1] text-[#4A4C48] hover:bg-[#E9E9E5] hover:text-[#151514]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#78716C]">
                <Filter className="size-3 text-[#151514]" />
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="bg-transparent text-xs font-medium text-[#151514] border-none focus:outline-none cursor-pointer"
                >
                  {NEIGHBORHOODS.map((nh) => (
                    <option key={nh} value={nh}>
                      {nh}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] font-mono text-[#78716C] bg-[#F4F4F1] px-2.5 py-0.5 rounded-full">
                {displayedTools.length} tools on bench
              </span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {/* ================================================================== */}
          {/* TAB 1: THE BENCH (Rich, Living Neighborhood Cards)                 */}
          {/* ================================================================== */}
          {currentTab === 'tools' && (
            <div className="space-y-6">
              {/* Full-Bleed Grid of Physical Workshop Tool Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {displayedTools.map((tool) => {
                  const isMine = Boolean(
                    currentUserRecord &&
                      tool.userId &&
                      tool.userId === currentUserRecord.userId,
                  );

                  return (
                    <div
                      key={tool.id}
                      className="group relative flex flex-col justify-between rounded-3xl border border-[#D8DFDC] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#151514]/40 transition-all duration-300 tool-tag"
                    >
                      {/* Brass punched hole with measuring tape yellow accent */}
                      <div className="tag-hole" aria-hidden="true" />

                      <div>
                        {/* Image Frame */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F4F4F1] border border-[#E9E9E5]">
                          <img
                            src={tool.image}
                            alt={tool.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 right-2.5">
                            <span className="rounded-full bg-[#151514]/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-[#2F7D4F]" />
                              Available
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                            <span className="font-semibold uppercase tracking-wider text-[#0F766E]">
                              {tool.category}
                            </span>
                            <span className="font-mono text-[#8A9590]">
                              {tool.condition}
                            </span>
                          </div>

                          <h3 className="font-display text-base font-bold text-[#151514] leading-snug group-hover:text-[#0F766E] transition-colors line-clamp-2">
                            {tool.name}
                          </h3>

                          <div className="flex items-center gap-1 text-[11px] text-[#78716C] pt-0.5">
                            <MapPin className="size-3 text-[#151514] shrink-0" />
                            <span className="truncate">{tool.neighborhood}</span>
                          </div>

                          {tool.specs && (
                            <div className="mt-2 rounded-xl bg-[#F4F4F1] p-2.5 text-[11px] text-[#4A4C48] flex items-start gap-1.5">
                              <Check className="size-3 text-[#2F7D4F] shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{tool.specs}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Lender & Action */}
                      <div className="mt-4 pt-3 border-t border-[#E9E9E5] flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-[#151514]">
                            {tool.owner}
                          </span>
                          <span className="text-[10px] text-[#8A9590]">
                            {tool.ownerLoans}
                          </span>
                        </div>

                        {isMine ? (
                          <span className="rounded-full bg-[#F4F4F1] px-3 py-1 text-[11px] font-semibold text-[#151514]">
                            Your Tool
                          </span>
                        ) : isSignedIn ? (
                          <button
                            onClick={() => {
                              if (tool.isDbRecord && tool.dbToolId) {
                                setRequestingTool({
                                  id: tool.dbToolId,
                                  name: tool.name,
                                });
                              } else {
                                toast.success(
                                  `Request sent for ${tool.name}! The lender will be notified.`,
                                );
                              }
                            }}
                            className="flex items-center gap-1 rounded-full bg-[#151514] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#262624] transition-all shadow-2xs"
                          >
                            <span>Borrow</span>
                            <ArrowRight className="size-3" />
                          </button>
                        ) : (
                          <SignInButton mode="modal">
                            <button className="flex items-center gap-1 rounded-full bg-[#151514] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#262624] transition-all shadow-2xs">
                              <span>Borrow</span>
                              <ArrowRight className="size-3" />
                            </button>
                          </SignInButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* TAB 2: MY WORKSHOP (Listings)                                      */}
          {/* ================================================================== */}
          {currentTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#151514]">
                    My Workshop Listings
                  </h2>
                  <p className="text-xs text-[#78716C]">
                    Equipment you have put into circulation for neighbors.
                  </p>
                </div>
                <button
                  onClick={() => setIsListModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-[#151514] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#262624]"
                >
                  <Plus className="size-3.5 text-[#F5C518]" />
                  <span>Add Another Tool</span>
                </button>
              </div>

              {myTools === undefined ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 bg-white rounded-2xl border border-[#E9E9E5]"
                    />
                  ))}
                </div>
              ) : myTools.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-[#D8DFDC] bg-white p-8">
                  <Wrench className="size-8 text-[#8A9590] mx-auto mb-2 opacity-40" />
                  <h3 className="font-display font-semibold text-base text-[#151514]">
                    No tools listed in your workshop yet
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1 mb-4">
                    Have a drill or ladder sitting in your garage? Put it on the
                    bench!
                  </p>
                  <button
                    onClick={() => setIsListModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#151514] px-4 py-2 text-xs font-semibold text-white shadow-xs"
                  >
                    <Plus className="size-3.5 text-[#F5C518]" />
                    <span>List Your First Tool</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {myTools.map((tool) => (
                    <div
                      key={tool._id}
                      className="flex flex-col justify-between rounded-3xl border border-[#D8DFDC] bg-white p-5 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-[#E9E9E5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4A4C48]">
                            {tool.category}
                          </span>
                          <span className="rounded-full bg-[#2F7D4F]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#2F7D4F]">
                            Available
                          </span>
                        </div>

                        <h3 className="mt-2.5 font-display text-base font-bold text-[#151514]">
                          {tool.name}
                        </h3>

                        {tool.description && (
                          <p className="mt-1 text-xs text-[#78716C] line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                        <span className="mt-2 block text-[11px] text-[#8A9590]">
                          Condition: {tool.condition}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#E9E9E5] flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setEditingTool({
                              id: tool._id as unknown as Id<'tools'>,
                              name: tool.name,
                              category: tool.category,
                              condition: tool.condition,
                              description: tool.description,
                            })
                          }
                          className="flex items-center gap-1 rounded-lg border border-[#D6D6D1] bg-white px-2.5 py-1 text-xs font-medium text-[#151514] hover:bg-[#F4F4F1]"
                        >
                          <Edit2 className="size-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() =>
                            setToolToDelete({
                              id: tool._id as unknown as Id<'tools'>,
                              name: tool.name,
                            })
                          }
                          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================== */}
          {/* TAB 3: MY REQUESTS                                                 */}
          {/* ================================================================== */}
          {currentTab === 'requests' && (
            <div className="space-y-4">
              <div className="border-b border-[#E2E8E4] pb-4">
                <h2 className="font-display text-xl font-bold text-[#151514]">
                  My Tool Requests & Reservations
                </h2>
                <p className="text-xs text-[#78716C]">
                  Track status of tools you have requested from neighbors.
                </p>
              </div>

              {myRequests === undefined ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 bg-white rounded-2xl border border-[#E9E9E5]"
                    />
                  ))}
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-[#D8DFDC] bg-white p-8">
                  <Clock className="size-8 text-[#8A9590] mx-auto mb-2 opacity-40" />
                  <h3 className="font-display font-semibold text-base text-[#151514]">
                    No active loan requests
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1 mb-4">
                    Find a tool you need on the bench and send a request!
                  </p>
                  <button
                    onClick={() => setCurrentTab('tools')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#151514] px-4 py-2 text-xs font-semibold text-white"
                  >
                    <Wrench className="size-3.5" />
                    <span>Browse The Bench</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {myRequests.map((loan) => {
                    const toolInfo = toolLookup.get(loan.toolId);
                    return (
                      <div
                        key={loan._id}
                        className="flex flex-col justify-between rounded-3xl border border-[#D8DFDC] bg-white p-5 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-display font-semibold text-sm text-[#151514]">
                              {toolInfo?.name || 'Tool'}
                            </span>
                            <StatusChip status={loan.status as StatusType} />
                          </div>

                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#78716C]">
                            <Calendar className="size-3.5 text-[#151514]" />
                            <span>
                              {formatDate(loan.startDate)} →{' '}
                              {formatDate(loan.endDate)}
                            </span>
                          </div>

                          {loan.requestNote && (
                            <p className="mt-2.5 rounded-xl bg-[#F4F4F1] p-2 text-xs text-[#4A4C48]">
                              Note: “{loan.requestNote}”
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E9E9E5] flex items-center justify-end">
                          {loan.status === 'pending' && (
                            <button
                              onClick={() =>
                                handleCancel(
                                  loan._id as unknown as Id<'loans'>,
                                )
                              }
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              Cancel Request
                            </button>
                          )}
                          {loan.status === 'approved' && (
                            <span className="text-xs font-semibold text-[#2F7D4F] bg-[#2F7D4F]/10 px-2.5 py-0.5 rounded-md">
                              Approved · Ready for Pickup
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================== */}
          {/* TAB 4: EXCHANGE INBOX (Incoming Requests)                          */}
          {/* ================================================================== */}
          {currentTab === 'incoming' && (
            <div className="space-y-4">
              <div className="border-b border-[#E2E8E4] pb-4">
                <h2 className="font-display text-xl font-bold text-[#151514]">
                  Exchange Inbox (Incoming Requests)
                </h2>
                <p className="text-xs text-[#78716C]">
                  Neighbors requesting to borrow your equipment.
                </p>
              </div>

              {incomingRequests === undefined ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 bg-white rounded-2xl border border-[#E9E9E5]"
                    />
                  ))}
                </div>
              ) : incomingRequests.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-[#D8DFDC] bg-white p-8">
                  <Inbox className="size-8 text-[#8A9590] mx-auto mb-2 opacity-40" />
                  <h3 className="font-display font-semibold text-base text-[#151514]">
                    No incoming requests right now
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1">
                    When neighbors ask to borrow your tools, their requests
                    appear here for approval.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {incomingRequests.map((loan) => {
                    const toolInfo = toolLookup.get(loan.toolId);
                    return (
                      <div
                        key={loan._id}
                        className="flex flex-col justify-between rounded-3xl border border-[#D8DFDC] bg-white p-5 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-display font-semibold text-sm text-[#151514]">
                              {toolInfo?.name || 'Tool'}
                            </span>
                            <StatusChip status={loan.status as StatusType} />
                          </div>

                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#78716C]">
                            <Calendar className="size-3.5 text-[#151514]" />
                            <span>
                              {formatDate(loan.startDate)} →{' '}
                              {formatDate(loan.endDate)}
                            </span>
                          </div>

                          {loan.requestNote && (
                            <p className="mt-2.5 rounded-xl bg-[#F4F4F1] p-2 text-xs text-[#4A4C48]">
                              Note: “{loan.requestNote}”
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E9E9E5] flex items-center justify-end gap-2">
                          {loan.status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  handleDecline(
                                    loan._id as unknown as Id<'loans'>,
                                  )
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() =>
                                  handleApprove(
                                    loan._id as unknown as Id<'loans'>,
                                  )
                                }
                                className="rounded-lg bg-[#151514] px-3.5 py-1 text-xs font-semibold text-white hover:bg-[#262624]"
                              >
                                Approve
                              </button>
                            </>
                          )}

                          {loan.status === 'approved' && (
                            <button
                              onClick={() =>
                                handleMarkReturned(
                                  loan._id as unknown as Id<'loans'>,
                                )
                              }
                              className="flex items-center gap-1 rounded-lg border border-[#2F7D4F] bg-[#2F7D4F]/10 px-3 py-1 text-xs font-semibold text-[#2F7D4F] hover:bg-[#2F7D4F]/20"
                            >
                              <RotateCcw className="size-3" />
                              <span>Mark Returned</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================== */}
          {/* TAB 5: ADMIN DESK                                                  */}
          {/* ================================================================== */}
          {currentTab === 'admin' && isAdmin && <AdminPanel />}
        </div>
      </SidebarInset>

      {/* ==================================================================== */}
      {/* DIALOGS & MODALS                                                     */}
      {/* ==================================================================== */}

      {/* 1. Request Tool Modal */}
      {requestingTool && (
        <RequestDialog
          toolId={requestingTool.id}
          toolName={requestingTool.name}
          isOpen={true}
          onClose={() => setRequestingTool(null)}
        />
      )}

      {/* 2. List or Edit Tool Modal */}
      {(isListModalOpen || editingTool !== null) && (
        <ToolFormDialog
          isOpen={true}
          toolToEdit={editingTool || undefined}
          onClose={() => {
            setIsListModalOpen(false);
            setEditingTool(null);
          }}
        />
      )}

      {/* 3. Confirm Delete Tool Modal */}
      {toolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display font-semibold text-base text-[#151514] mb-2">
              Delete {toolToDelete.name}?
            </h3>
            <p className="text-xs text-[#78716C] mb-6 leading-relaxed">
              This action cannot be undone. You cannot delete a tool that has
              active or pending loans.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setToolToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#78716C] hover:text-[#151514] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTool(toolToDelete.id)}
                className="px-4 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-xs"
              >
                Delete Tool
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
