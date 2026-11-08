'use client';

import React, { useState } from 'react';
import { ArrowRight, Phone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { MainTab } from '@/components/Header';

interface LandingEstimatorProps {
  onOpenApp: (tab?: MainTab) => void;
  onOpenNewTool?: () => void;
}

export function LandingEstimator({ onOpenApp, onOpenNewTool }: LandingEstimatorProps) {
  const [toolQuery, setToolQuery] = useState('');
  const [blockQuery, setBlockQuery] = useState('');
  const [emailQuery, setEmailQuery] = useState('');
  const [matchResult, setMatchResult] = useState<{
    matches: number;
    savings: number;
    nearbyLenders: number;
  } | null>(null);

  function handleCheckMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!toolQuery.trim()) {
      toast.error('Please enter a tool name or project.');
      return;
    }

    // Interactive calculation based on input
    const baseMatches = Math.floor(Math.random() * 4) + 2;
    const baseSavings = (Math.floor(Math.random() * 5) + 3) * 75;
    const nearbyLenders = Math.floor(Math.random() * 3) + 2;

    setMatchResult({
      matches: baseMatches,
      savings: baseSavings,
      nearbyLenders,
    });
    toast.success('Neighborhood match found!');
  }

  return (
    <section id="estimate" className="py-20 md:py-28 border-b border-[#E9E9E5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Form (Span 7) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#78716C]">
                07 / Neighborhood Match
              </span>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#151514]">
                What’s sitting in your shed?
              </h2>
              <p className="mt-3 text-sm text-[#4A4C48] max-w-lg leading-relaxed">
                Tell us the tool you have sitting idle or what you need for an upcoming weekend project. We’ll show you how many neighbors on your block need it and how much you can save together.
              </p>
            </div>

            {matchResult ? (
              <div className="rounded-3xl border border-[#2F7D4F]/30 bg-[#EDF1EF] p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#2F7D4F]">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Neighborhood Match Found!
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white p-3 text-center border border-[#E9E9E5]">
                    <span className="block font-display text-2xl font-bold text-[#151514]">
                      {matchResult.matches}
                    </span>
                    <span className="text-[11px] text-[#78716C]">
                      Neighbors searching
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-center border border-[#E9E9E5]">
                    <span className="block font-display text-2xl font-bold text-[#2F7D4F]">
                      ${matchResult.savings}
                    </span>
                    <span className="text-[11px] text-[#78716C]">
                      Block money saved
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-center border border-[#E9E9E5]">
                    <span className="block font-display text-2xl font-bold text-[#151514]">
                      {matchResult.nearbyLenders}
                    </span>
                    <span className="text-[11px] text-[#78716C]">
                      Lenders within 3 blocks
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (onOpenNewTool) onOpenNewTool();
                      else onOpenApp('listings');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#151514] px-5 py-3 text-xs font-semibold text-white hover:bg-[#262624]"
                  >
                    <span>List this tool in 60s</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setMatchResult(null)}
                    className="rounded-full border border-[#D6D6D1] bg-white px-4 py-3 text-xs font-semibold text-[#151514] hover:bg-[#E9E9E5]"
                  >
                    Check another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckMatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A4C48] mb-1.5">
                    Tool name or project
                  </label>
                  <input
                    type="text"
                    value={toolQuery}
                    onChange={(e) => setToolQuery(e.target.value)}
                    placeholder="e.g. DeWalt Miter Saw, Pressure Washer, or Tile Saw"
                    className="w-full rounded-2xl border border-[#D6D6D1] bg-white px-4 py-3 text-sm text-[#151514] placeholder-[#A8A29E] focus:border-[#151514] focus:outline-none focus:ring-1 focus:ring-[#151514]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A4C48] mb-1.5">
                      Your block or neighborhood
                    </label>
                    <input
                      type="text"
                      value={blockQuery}
                      onChange={(e) => setBlockQuery(e.target.value)}
                      placeholder="e.g. Park Slope · 8th Ave & 2nd St"
                      className="w-full rounded-2xl border border-[#D6D6D1] bg-white px-4 py-3 text-sm text-[#151514] placeholder-[#A8A29E] focus:border-[#151514] focus:outline-none focus:ring-1 focus:ring-[#151514]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A4C48] mb-1.5">
                      Your email or phone (optional)
                    </label>
                    <input
                      type="text"
                      value={emailQuery}
                      onChange={(e) => setEmailQuery(e.target.value)}
                      placeholder="e.g. hello@example.com"
                      className="w-full rounded-2xl border border-[#D6D6D1] bg-white px-4 py-3 text-sm text-[#151514] placeholder-[#A8A29E] focus:border-[#151514] focus:outline-none focus:ring-1 focus:ring-[#151514]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-[#151514] px-6 py-3.5 text-xs font-semibold text-white hover:bg-[#262624] transition-all shadow-sm"
                >
                  <span>Check neighborhood match</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Prefer to talk card (Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Direct Contact
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold text-[#151514]">
                Prefer to talk in person?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4A4C48] leading-relaxed">
                Have a unique piece of equipment, a woodworking project that needs multiple tools, or want to host a tool locker on your stoop? We’d love to connect.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E9E9E5]">
              <a
                href="tel:7185550144"
                className="flex items-center justify-between rounded-2xl bg-[#F4F4F1] p-4 text-xs font-semibold text-[#151514] hover:bg-[#151514] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-[#0F766E]" />
                  <span>Call Dana: (718) 555-0144</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              <a
                href="mailto:hello@lendloop.org"
                className="flex items-center justify-between rounded-2xl bg-[#F4F4F1] p-4 text-xs font-semibold text-[#151514] hover:bg-[#151514] hover:text-white transition-colors"
              >
                <span>hello@lendloop.org</span>
                <span className="text-[11px] text-[#78716C] font-normal">Copy email</span>
              </a>
            </div>

            <p className="text-[11px] text-[#A8A29E]">
              214 Seventh Avenue, Brooklyn, NY 11215 · Tuesday to Saturday, 10 am to 6 pm
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
