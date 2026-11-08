'use client';

import * as React from 'react';
import {
  Wrench,
  Layers,
  Send,
  Inbox,
  ShieldAlert,
  ArrowLeft,
  Coffee,
  Sparkles,
  MapPin,
  Compass,
} from 'lucide-react';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import type { MainTab } from '@/components/Header';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from '@/components/ui/sidebar';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onBackToLanding?: () => void;
  incomingCount?: number;
  myListingsCount?: number;
  myRequestsCount?: number;
  isAdmin?: boolean;
}

export function AppSidebar({
  currentTab,
  onTabChange,
  onBackToLanding,
  incomingCount = 0,
  myListingsCount = 0,
  myRequestsCount = 0,
  isAdmin = false,
  ...props
}: AppSidebarProps) {
  const { isSignedIn, user } = useUser();

  const mainNav = [
    {
      id: 'tools' as MainTab,
      title: 'The Bench',
      subtitle: 'Neighborhood catalog',
      icon: Layers,
      count: undefined,
    },
    {
      id: 'listings' as MainTab,
      title: 'My Workshop',
      subtitle: 'Tools you are sharing',
      icon: Wrench,
      count: myListingsCount > 0 ? myListingsCount : undefined,
      requireAuth: true,
    },
    {
      id: 'requests' as MainTab,
      title: 'My Requests',
      subtitle: 'Tools you requested',
      icon: Send,
      count: myRequestsCount > 0 ? myRequestsCount : undefined,
      requireAuth: true,
    },
    {
      id: 'incoming' as MainTab,
      title: 'Exchange Inbox',
      subtitle: 'Requests to borrow',
      icon: Inbox,
      count: incomingCount > 0 ? incomingCount : undefined,
      highlightBadge: incomingCount > 0,
      requireAuth: true,
    },
  ];

  if (isAdmin) {
    mainNav.push({
      id: 'admin' as MainTab,
      title: 'Admin Desk',
      subtitle: 'Neighborhood stewards',
      icon: ShieldAlert,
      count: undefined,
      requireAuth: true,
    });
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-[#E2E8E4] bg-[#F7F9F8]" {...props}>
      {/* 1. Header: Tactile Workshop Emblem & Identity */}
      <SidebarHeader className="border-b border-[#E2E8E4]/80 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/80 transition-colors">
              <button
                onClick={() => onTabChange('tools')}
                className="flex items-center gap-3 text-left w-full group"
              >
                <div className="relative flex aspect-square size-9 items-center justify-center rounded-xl bg-[#151514] text-white shadow-sm ring-1 ring-black/10">
                  <Wrench className="size-4 text-[#F5C518] group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-1 -right-1 flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#2F7D4F] opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-[#2F7D4F]" />
                  </span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-display text-base font-bold text-[#151514] tracking-tight">
                    LendLoop
                  </span>
                  <span className="truncate text-[10px] uppercase tracking-wider text-[#78716C] font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="size-2.5 text-[#2F7D4F]" />
                    Brooklyn · 48 Blocks
                  </span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. Content: Curated Sections (NO redundant + List button!) */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-[#8A9590] px-3">
            Community Loop
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNav.map((item) => {
                if (item.requireAuth && !isSignedIn) return null;
                const isActive = currentTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={() => onTabChange(item.id)}
                      className={`h-11 rounded-xl px-3 transition-all ${
                        isActive
                          ? 'bg-[#151514] text-white font-semibold shadow-xs hover:bg-[#151514] hover:text-white'
                          : 'text-[#3D4743] hover:bg-white hover:text-[#151514]'
                      }`}
                    >
                      <item.icon className={`size-4 ${isActive ? 'text-[#F5C518]' : 'text-[#6C7873]'}`} />
                      <div className="flex flex-col text-left leading-tight flex-1">
                        <span className="text-xs font-semibold">{item.title}</span>
                        <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-[#8A9590]'}`}>
                          {item.subtitle}
                        </span>
                      </div>
                      {item.count !== undefined && (
                        <span
                          className={`ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 ${
                            isActive
                              ? 'bg-white text-[#151514]'
                              : item.highlightBadge
                              ? 'bg-[#F5C518] text-[#151514]'
                              : 'bg-[#E2E8E4] text-[#4A4C48]'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-[#E2E8E4]" />

        {/* Tactile Community Mini-Card in Sidebar */}
        <div className="px-2 pt-2">
          <div className="rounded-2xl border border-[#D8DFDC] bg-white p-3.5 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#0F766E] text-xs font-bold uppercase tracking-wider">
              <Coffee className="size-3.5 text-[#F5C518]" />
              <span>Saturday Stoop</span>
            </div>
            <p className="mt-1 text-[11px] text-[#4A4C48] leading-snug">
              Every Saturday 10 AM – 12 PM: Pour-over coffee & blade sharpening station on 7th Ave.
            </p>
            <a
              href="tel:7185550144"
              className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#151514] hover:underline"
            >
              <span>RSVP or Ask Dana</span>
              <Compass className="size-2.5" />
            </a>
          </div>
        </div>

        {/* Secondary Links */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-[#8A9590] px-3">
            Quick Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {onBackToLanding && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="View Editorial Landing"
                    onClick={onBackToLanding}
                    className="text-[#6C7873] hover:text-[#151514] hover:bg-white rounded-xl"
                  >
                    <ArrowLeft className="size-4" />
                    <span className="text-xs font-medium">Editorial Landing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer: Authenticated Neighbor Badge */}
      <SidebarFooter className="border-t border-[#E2E8E4] p-3 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            {isSignedIn ? (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F7F9F8] border border-[#E2E8E4]">
                <UserButton afterSignOutUrl="/" />
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="truncate text-xs font-bold text-[#151514]">
                    {user?.fullName || user?.username || 'Neighbor'}
                  </span>
                  <span className="truncate text-[10px] text-[#2F7D4F] font-semibold flex items-center gap-1 mt-0.5">
                    <span className="size-1.5 rounded-full bg-[#2F7D4F]" />
                    Verified Lender #10491
                  </span>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#D6D6D1] bg-[#151514] py-2 text-xs font-semibold text-white hover:bg-[#262624] transition-colors shadow-xs">
                  <Sparkles className="size-3.5 text-[#F5C518]" />
                  <span>Sign in to Borrow</span>
                </button>
              </SignInButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
