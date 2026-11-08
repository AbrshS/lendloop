'use client';

import React from 'react';
import { Star, ShieldCheck, Wrench, Clock, DollarSign } from 'lucide-react';

export function LandingImpactBento() {
  return (
    <section id="impact" className="py-20 md:py-28 border-b border-[#E9E9E5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col space-y-2 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#78716C]">
            04 / Community Impact
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#151514]">
              The last 12 months
            </h2>
            <p className="text-sm text-[#4A4C48] max-w-md">
              Neighborhood lending records from October 2025 to September 2026, across Park Slope, Prospect Heights, and Fort Greene.
            </p>
          </div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: Total Loans & Glyphs (Span 7) */}
          <div className="md:col-span-7 flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white p-8 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  Total Equipment Loans
                </span>
                <span className="rounded-full bg-[#F4F4F1] px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#151514]">
                  One wrench = 20 loans
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-6xl sm:text-7xl font-bold text-[#151514] tracking-tight">
                  540+
                </span>
                <span className="text-sm font-medium text-[#4A4C48]">
                  tools shared across 42 blocks
                </span>
              </div>
            </div>

            {/* Rowe-style Visual Silhouette Grid */}
            <div className="mt-8 pt-6 border-t border-[#E9E9E5]">
              <div className="grid grid-cols-9 sm:grid-cols-14 gap-2 text-[#0F766E]/70">
                {Array.from({ length: 27 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDF1EF] hover:bg-[#0F766E] hover:text-white transition-colors cursor-pointer"
                    title={`Loan cluster #${i + 1}: 20 loans`}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                  </div>
                ))}
              </div>
              <span className="mt-3 block text-[11px] text-[#A8A29E]">
                Active lending volume across Park Slope, Prospect Heights & Fort Greene
              </span>
            </div>
          </div>

          {/* Tile 2: Median Response Time (Span 5) */}
          <div className="md:col-span-5 flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white p-8 shadow-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Speed to Pickup
              </span>
              <div className="mt-3">
                <span className="font-display text-6xl sm:text-7xl font-bold text-[#151514] tracking-tight">
                  3.8 hrs
                </span>
                <p className="mt-2 text-sm text-[#4A4C48]">
                  median time from neighbor request to porch pickup approval
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E9E5] flex items-center gap-2 text-xs text-[#2F7D4F]">
              <Clock className="h-4 w-4" />
              <span className="font-medium">84% of weekend requests approved within 90 minutes</span>
            </div>
          </div>

          {/* Tile 3: Money Saved (Span 4) */}
          <div className="md:col-span-4 flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white p-8 shadow-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Community Savings
              </span>
              <div className="mt-3">
                <span className="font-display text-5xl sm:text-6xl font-bold text-[#151514] tracking-tight">
                  $64,800
                </span>
                <p className="mt-2 text-xs sm:text-sm text-[#4A4C48]">
                  kept in neighbors&apos; pockets vs buying retail tools that sit in closets
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E9E5] flex items-center gap-2 text-xs text-[#0F766E]">
              <DollarSign className="h-4 w-4" />
              <span>Average neighbor saves $380/year</span>
            </div>
          </div>

          {/* Tile 4: Return Rate (Span 4) */}
          <div className="md:col-span-4 flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white p-8 shadow-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Reliability & Trust
              </span>
              <div className="mt-3">
                <span className="font-display text-5xl sm:text-6xl font-bold text-[#151514] tracking-tight">
                  100%
                </span>
                <p className="mt-2 text-xs sm:text-sm text-[#4A4C48]">
                  on-time return rate with zero lost or damaged tools
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E9E5] flex items-center gap-2 text-xs text-[#2F7D4F]">
              <ShieldCheck className="h-4 w-4" />
              <span>Backed by neighbor address verification</span>
            </div>
          </div>

          {/* Tile 5: Rating & Star Breakdown (Span 4) */}
          <div className="md:col-span-4 flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white p-8 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  Neighbor Reviews
                </span>
                <div className="flex items-center gap-1 text-[#F5C518]">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold text-[#151514]">4.9</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-[#78716C]">5 stars</span>
                  <div className="h-2 flex-1 rounded-full bg-[#F4F4F1] overflow-hidden">
                    <div className="h-full w-[96%] rounded-full bg-[#151514]" />
                  </div>
                  <span className="w-8 text-right font-mono font-medium text-[#151514]">
                    298
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-[#78716C]">4 stars</span>
                  <div className="h-2 flex-1 rounded-full bg-[#F4F4F1] overflow-hidden">
                    <div className="h-full w-[4%] rounded-full bg-[#151514]" />
                  </div>
                  <span className="w-8 text-right font-mono font-medium text-[#151514]">
                    12
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-[#78716C]">3 stars</span>
                  <div className="h-2 flex-1 rounded-full bg-[#F4F4F1] overflow-hidden">
                    <div className="h-full w-[0%] rounded-full bg-[#151514]" />
                  </div>
                  <span className="w-8 text-right font-mono font-medium text-[#A8A29E]">
                    0
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E9E5] text-[11px] text-[#78716C]">
              From 310 project feedback notes left on tool tags
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="mt-6 text-center text-xs text-[#A8A29E]">
          Community data verified through LendLoop loan logs and automated return confirmations.
        </p>
      </div>
    </section>
  );
}

