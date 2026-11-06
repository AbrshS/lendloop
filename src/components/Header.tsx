'use client';

import React from 'react';
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MainTab = 'tools' | 'listings' | 'requests' | 'incoming' | 'admin';

interface HeaderProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenListTool: () => void;
  incomingCount?: number;
  isAdmin?: boolean;
}

export function Header({
  currentTab,
  onTabChange,
  onOpenListTool,
  incomingCount = 0,
  isAdmin = false,
}: HeaderProps) {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line">
      <div className="max-w-[1120px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange('tools')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center text-white font-display font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="font-display font-bold text-xl text-ink tracking-tight">
              LendLoop
            </span>
          </button>

          {/* Navigation tabs for signed-in users */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={() => onTabChange('tools')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  currentTab === 'tools'
                    ? 'bg-bench text-ink font-semibold'
                    : 'text-ink-soft hover:text-ink hover:bg-bench/50',
                )}
              >
                All tools
              </button>
              <button
                type="button"
                onClick={() => onTabChange('listings')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  currentTab === 'listings'
                    ? 'bg-bench text-ink font-semibold'
                    : 'text-ink-soft hover:text-ink hover:bg-bench/50',
                )}
              >
                My listings
              </button>
              <button
                type="button"
                onClick={() => onTabChange('requests')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  currentTab === 'requests'
                    ? 'bg-bench text-ink font-semibold'
                    : 'text-ink-soft hover:text-ink hover:bg-bench/50',
                )}
              >
                My requests
              </button>
              <button
                type="button"
                onClick={() => onTabChange('incoming')}
                className={cn(
                  'relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5',
                  currentTab === 'incoming'
                    ? 'bg-bench text-ink font-semibold'
                    : 'text-ink-soft hover:text-ink hover:bg-bench/50',
                )}
              >
                <span>Incoming</span>
                {incomingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-tape text-ink leading-tight">
                    {incomingCount}
                  </span>
                )}
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onTabChange('admin')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    currentTab === 'admin'
                      ? 'bg-bench text-ink font-semibold'
                      : 'text-ink-soft hover:text-ink hover:bg-bench/50',
                  )}
                >
                  Admin
                </button>
              )}
            </nav>
          )}
        </div>

        {/* Right side CTA & Auth */}
        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn && (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-ink bg-bench hover:bg-bench/80 rounded-lg transition-colors"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-ink hover:bg-ink/90 rounded-lg transition-colors shadow-xs"
                >
                  Get started
                </button>
              </SignUpButton>
            </div>
          )}

          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenListTool}
                className="inline-flex items-center gap-1.5 bg-ink text-white hover:bg-ink/90 px-3.5 py-2 rounded-lg text-sm font-medium shadow-xs transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">List a tool</span>
              </button>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-8 h-8 rounded-full border border-line',
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile sub-nav tab bar */}
      {isSignedIn && (
        <div className="md:hidden flex items-center justify-around border-t border-line/50 bg-surface px-2 py-1.5 text-xs font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => onTabChange('tools')}
            className={cn(
              'px-2.5 py-1.5 rounded-md',
              currentTab === 'tools' ? 'bg-bench text-ink font-bold' : 'text-ink-soft',
            )}
          >
            Tools
          </button>
          <button
            type="button"
            onClick={() => onTabChange('listings')}
            className={cn(
              'px-2.5 py-1.5 rounded-md',
              currentTab === 'listings' ? 'bg-bench text-ink font-bold' : 'text-ink-soft',
            )}
          >
            Listings
          </button>
          <button
            type="button"
            onClick={() => onTabChange('requests')}
            className={cn(
              'px-2.5 py-1.5 rounded-md',
              currentTab === 'requests' ? 'bg-bench text-ink font-bold' : 'text-ink-soft',
            )}
          >
            Requests
          </button>
          <button
            type="button"
            onClick={() => onTabChange('incoming')}
            className={cn(
              'px-2.5 py-1.5 rounded-md flex items-center gap-1',
              currentTab === 'incoming' ? 'bg-bench text-ink font-bold' : 'text-ink-soft',
            )}
          >
            <span>Incoming</span>
            {incomingCount > 0 && (
              <span className="px-1 text-[10px] rounded-full bg-tape text-ink font-bold">
                {incomingCount}
              </span>
            )}
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onTabChange('admin')}
              className={cn(
                'px-2.5 py-1.5 rounded-md',
                currentTab === 'admin' ? 'bg-bench text-ink font-bold' : 'text-ink-soft',
              )}
            >
              Admin
            </button>
          )}
        </div>
      )}
    </header>
  );
}
