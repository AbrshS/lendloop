'use client';

import React, { useState } from 'react';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { Phone, Menu, X, Wrench, Sparkles } from 'lucide-react';
import type { MainTab } from '@/components/Header';

interface LandingHeaderProps {
  onOpenApp: (tab?: MainTab) => void;
  onOpenNewTool?: () => void;
}

export function LandingHeader({ onOpenApp, onOpenNewTool }: LandingHeaderProps) {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E9E9E5] bg-[#F4F4F1]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark & Dot */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#151514] text-[#F4F4F1] shadow-sm">
            <Wrench className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F7D4F] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2F7D4F]" />
            </span>
          </div>
          <div className="flex flex-col">
            <a
              href="#"
              className="font-display text-xl font-bold tracking-tight text-[#151514] hover:opacity-90 transition-opacity"
            >
              LendLoop
            </a>
            <span className="text-[10px] uppercase tracking-widest text-[#78716C] -mt-1 font-medium hidden sm:inline">
              Brooklyn · Block by block
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#4A4C48]">
          <a
            href="#tools"
            className="transition-colors hover:text-[#151514]"
          >
            Tools
          </a>
          <a
            href="#neighborhoods"
            className="transition-colors hover:text-[#151514]"
          >
            Neighborhoods
          </a>
          <button
            onClick={() => {
              if (onOpenNewTool) onOpenNewTool();
              else onOpenApp('listings');
            }}
            className="transition-colors hover:text-[#151514]"
          >
            Lend a tool
          </button>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[#151514]"
          >
            About
          </a>
        </nav>

        {/* Right CTA & Profile */}
        <div className="flex items-center gap-3">
          <a
            href="tel:7185550144"
            className="hidden lg:flex items-center gap-1.5 text-xs text-[#4A4C48] hover:text-[#151514] px-2 py-1.5 transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-[#151514]" />
            <span>(718) 555-0144</span>
          </a>

          {/* Borrow a tool black pill */}
          <button
            onClick={() => onOpenApp('tools')}
            className="flex items-center gap-1.5 rounded-full bg-[#151514] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#262624]"
          >
            <span>Borrow a tool</span>
          </button>

          {/* Auth Button */}
          {isSignedIn ? (
            <div className="ml-1 flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="hidden sm:inline-flex rounded-full border border-[#D6D6D1] bg-white px-3 py-1.5 text-xs font-medium text-[#151514] hover:bg-[#E9E9E5] transition-colors">
                Sign in
              </button>
            </SignInButton>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-[#E9E9E5] text-[#151514] hover:bg-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E9E9E5] bg-[#F4F4F1] px-4 pt-4 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-[#151514]">
            <a
              href="#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E9E9E5]/60"
            >
              Tools & Inventory
            </a>
            <a
              href="#neighborhoods"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E9E9E5]/60"
            >
              Neighborhoods
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E9E9E5]/60"
            >
              How It Works
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E9E9E5]/60"
            >
              The Last 12 Months
            </a>
            <a
              href="#tags"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#E9E9E5]/60"
            >
              Written on the Tool Tag
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApp('tools');
              }}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#151514] py-2.5 text-xs font-semibold text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#F5C518]" />
              <span>Launch Live Tool Board</span>
            </button>
            <a
              href="tel:7185550144"
              className="flex items-center justify-center gap-2 text-xs text-[#78716C] py-2"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Questions? Call Dana: (718) 555-0144</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
