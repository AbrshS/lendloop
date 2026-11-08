'use client';

import React from 'react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import type { MainTab } from '@/components/Header';

interface LandingRecentlyLoanedProps {
  onOpenApp: (tab?: MainTab) => void;
}

export function LandingRecentlyLoaned({ onOpenApp }: LandingRecentlyLoanedProps) {
  const recentLoans = [
    {
      speed: 'Picked up in 15 mins',
      address: '12 Garfield Place',
      neighborhood: 'Park Slope',
      tool: 'DeWalt 12" Sliding Compound Miter Saw',
      project: 'Built a red cedar library bookshelf',
      date: 'September 2026 · 2-day loan',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    },
    {
      speed: 'Picked up in 12 mins',
      address: '301 Lincoln Place, 4B',
      neighborhood: 'Prospect Heights',
      tool: 'Werner 22ft Telescoping Multi-Ladder',
      project: 'Gutter clearing & pre-winter window insulation',
      date: 'September 2026 · 1-day loan',
      image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
    },
    {
      speed: 'Picked up in 21 mins',
      address: '88 South Portland Ave',
      neighborhood: 'Fort Greene',
      tool: 'Bosch Bulldog Xtreme Rotary Hammer',
      project: 'Anchored solid steel cargo bike rack into brick',
      date: 'August 2026 · 4-hour loan',
      image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    },
    {
      speed: 'Picked up in 9 mins',
      address: '29 President Street, 3',
      neighborhood: 'Gowanus',
      tool: 'Sun Joe 2030 PSI Pressure Washer',
      project: 'Deep cleaned bluestone garden patio & stoop steps',
      date: 'August 2026 · Weekend loan',
      image: 'https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-b border-[#E9E9E5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col space-y-2 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#78716C]">
            05 / Recent Activity
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#151514]">
              Recently borrowed
            </h2>
            <p className="text-sm text-[#4A4C48] max-w-md">
              The last tools borrowed on our blocks, how quickly they were handed over, and what got built.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentLoans.map((loan, idx) => (
            <div
              key={idx}
              onClick={() => onOpenApp('requests')}
              className="group flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-[#151514] transition-all cursor-pointer"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-[#F4F4F1]">
                  <img
                    src={loan.image}
                    alt={loan.tool}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-[#151514]/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#2F7D4F]" />
                      {loan.speed}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
                    <MapPin className="h-3 w-3" />
                    <span>{loan.address} · {loan.neighborhood}</span>
                  </div>

                  <h3 className="mt-2 font-display text-base font-bold text-[#151514] group-hover:text-[#0F766E] transition-colors leading-snug">
                    {loan.tool}
                  </h3>

                  <p className="mt-2 text-xs text-[#4A4C48] bg-[#F4F4F1] p-2.5 rounded-xl border border-[#E9E9E5]">
                    “{loan.project}”
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 border-t border-[#E9E9E5]/60 flex items-center justify-between text-[11px] text-[#A8A29E]">
                <span>{loan.date}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-[#151514]" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Loans */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => onOpenApp('requests')}
            className="flex items-center gap-2 rounded-full border border-[#D6D6D1] bg-white px-6 py-3 text-xs font-semibold text-[#151514] hover:bg-[#E9E9E5] transition-all"
          >
            <span>See all recent community loans & returns</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
