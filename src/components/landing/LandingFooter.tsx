'use client';

import React from 'react';
import { Wrench, ArrowUpRight } from 'lucide-react';
import type { MainTab } from '@/components/Header';

interface LandingFooterProps {
  onOpenApp: (tab?: MainTab) => void;
}

export function LandingFooter({ onOpenApp }: LandingFooterProps) {
  return (
    <footer className="bg-[#151514] text-[#F4F4F1] pt-16 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Address Column (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#151514]">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                LendLoop
              </span>
            </div>

            <p className="text-xs text-[#A8A29E] leading-relaxed max-w-sm">
              A neighborhood tool-lending library for Brooklyn. Borrow high-grade equipment from neighbors within walking distance. Keep tools out of landfills, save closet space, and build community block by block.
            </p>

            <div className="pt-2 text-xs space-y-1 text-[#D6D6D1]">
              <p>214 Seventh Avenue, Brooklyn, NY 11215</p>
              <p>Tuesday to Saturday, 10 am to 6 pm</p>
              <p className="font-mono pt-1 text-white">(718) 555-0144 · hello@lendloop.org</p>
            </div>
          </div>

          {/* Quick Links (Span 7) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <span className="block font-semibold uppercase tracking-wider text-[#A8A29E]">
                Tools
              </span>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onOpenApp('tools')} className="hover:text-white transition-colors">
                    Power & Cordless
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenApp('tools')} className="hover:text-white transition-colors">
                    Woodworking
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenApp('tools')} className="hover:text-white transition-colors">
                    Lawn & Garden
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenApp('tools')} className="hover:text-white transition-colors">
                    Ladders & Scaffolding
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenApp('tools')} className="hover:text-white transition-colors">
                    Masonry & Concrete
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="block font-semibold uppercase tracking-wider text-[#A8A29E]">
                Hubs
              </span>
              <ul className="space-y-2">
                <li>
                  <a href="#neighborhoods" className="hover:text-white transition-colors">
                    Park Slope
                  </a>
                </li>
                <li>
                  <a href="#neighborhoods" className="hover:text-white transition-colors">
                    Prospect Heights
                  </a>
                </li>
                <li>
                  <a href="#neighborhoods" className="hover:text-white transition-colors">
                    Fort Greene
                  </a>
                </li>
                <li>
                  <a href="#neighborhoods" className="hover:text-white transition-colors">
                    Gowanus
                  </a>
                </li>
                <li>
                  <a href="#neighborhoods" className="hover:text-white transition-colors">
                    Carroll Gardens
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="block font-semibold uppercase tracking-wider text-[#A8A29E]">
                Safety & Trust
              </span>
              <ul className="space-y-2 text-[#A8A29E]">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Tool Safety Charter
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Fair Sharing Rules
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Stoop Lockbox Guidelines
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Clerk Identity Verification
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Terms & Privacy
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <p>
            © {new Date().getFullYear()} LendLoop Community Initiative · Brooklyn Tool Library #10491
          </p>

          <button
            onClick={() => onOpenApp('tools')}
            className="flex items-center gap-1.5 text-white underline underline-offset-4 hover:text-[#2F7D4F] transition-colors"
          >
            <span>Launch Community Board</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
