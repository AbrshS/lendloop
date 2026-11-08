'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { MainTab } from '@/components/Header';

interface LandingProcessProps {
  onOpenApp: (tab?: MainTab) => void;
  onOpenNewTool?: () => void;
}

export function LandingProcess({ onOpenApp, onOpenNewTool }: LandingProcessProps) {
  const [mode, setMode] = useState<'borrowing' | 'lending'>('borrowing');

  const borrowingSteps = [
    {
      step: 'Step 1',
      title: 'Browse & Request',
      timing: 'Under 2 minutes',
      description:
        'Search our 48-block catalog. Pick your project dates, read the tool specifications, and send a request with a short note. No deposit or credit card required.',
      highlight: 'Instant notification sent to the tool owner',
    },
    {
      step: 'Step 2',
      title: 'Porch Handover',
      timing: 'Friday evening or Saturday morning',
      description:
        'Meet your neighbor on their stoop or retrieve the tool from a coded keyless porch locker. Quick 2-minute greeting and safe operating tips.',
      highlight: 'Eye protection and spare blades included',
    },
    {
      step: 'Step 3',
      title: 'Build & Create',
      timing: '1 to 7 day loan period',
      description:
        'Tackle your project with high-grade commercial tools. Build raised garden beds, hang crown molding, or strip a pre-war deck without buying throwaway hardware.',
      highlight: 'Full community trust and insurance coverage',
    },
    {
      step: 'Step 4',
      title: 'Return & Tag It',
      timing: 'On or before scheduled return',
      description:
        'Wipe the tool clean, return it to the neighbor’s stoop, and write a quick one-line note on the canvas LendLoop tag for the next neighbor.',
      highlight: 'Keep the neighborhood loop spinning',
    },
  ];

  const lendingSteps = [
    {
      step: 'Step 1',
      title: 'List in 60 Seconds',
      timing: 'One-time setup',
      description:
        'Snap a quick photo of the tool sitting in your basement, shed, or closet. Set your pickup preferences (stoop greeting, garden gate, or lockbox).',
      highlight: 'Free up space while helping nearby blocks',
    },
    {
      step: 'Step 2',
      title: 'Approve with 1 Tap',
      timing: 'At your convenience',
      description:
        'Receive automated alerts when a verified neighbor requests your tool. Review their project note and approve or decline with a single tap.',
      highlight: 'Automated reminders keep returns prompt',
    },
    {
      step: 'Step 3',
      title: 'Hassle-Free Handover',
      timing: 'Porch or locker',
      description:
        'Leave the tool in your front-porch storage or hand it over directly. You never have to leave your block or ship anything.',
      highlight: 'Meet lovely neighbors living 2 blocks away',
    },
    {
      step: 'Step 4',
      title: 'Welcomed Home Clean',
      timing: 'Cleaned and tagged',
      description:
        'Your tool returns freshly cleaned and blown free of sawdust, accompanied by a handwritten note on the tool tag sharing what got built.',
      highlight: '100% on-time return rate across our community',
    },
  ];

  const currentSteps = mode === 'borrowing' ? borrowingSteps : lendingSteps;

  return (
    <section id="how-it-works" className="py-20 md:py-28 border-b border-[#E9E9E5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col space-y-4 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#78716C]">
            03 / How it Works
          </span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#151514]">
                From first request to return
              </h2>
              <p className="mt-2 text-sm text-[#4A4C48] max-w-xl">
                Lending with LendLoop takes about two minutes before your Saturday project begins. Here is what happens in each step.
              </p>
            </div>

            {/* Rowe-style Segmented Switch */}
            <div className="inline-flex rounded-full border border-[#D6D6D1] bg-[#E9E9E5] p-1 self-start">
              <button
                onClick={() => setMode('borrowing')}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  mode === 'borrowing'
                    ? 'bg-[#151514] text-white shadow-sm'
                    : 'text-[#4A4C48] hover:text-[#151514]'
                }`}
              >
                Borrowing a tool
              </button>
              <button
                onClick={() => setMode('lending')}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  mode === 'lending'
                    ? 'bg-[#151514] text-white shadow-sm'
                    : 'text-[#4A4C48] hover:text-[#151514]'
                }`}
              >
                Sharing your tools
              </button>
            </div>
          </div>
        </div>

        {/* 4 Horizontal Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl border border-[#E9E9E5] bg-white p-6 shadow-sm hover:shadow-md hover:border-[#151514]/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#F4F4F1] px-3 py-1 text-xs font-mono font-semibold text-[#151514]">
                    {step.step}
                  </span>
                  <span className="text-[11px] text-[#78716C] font-medium">
                    {step.timing}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl font-bold text-[#151514]">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#4A4C48] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E9E9E5]">
                <div className="flex items-start gap-2 text-[11px] text-[#0F766E] font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#2F7D4F]" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="mt-12 flex justify-center">
          {mode === 'borrowing' ? (
            <button
              onClick={() => onOpenApp('tools')}
              className="flex items-center gap-2 rounded-full bg-[#151514] px-6 py-3 text-xs font-medium text-white hover:bg-[#262624] transition-all shadow-sm"
            >
              <span>Explore tools available this weekend</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (onOpenNewTool) onOpenNewTool();
                else onOpenApp('listings');
              }}
              className="flex items-center gap-2 rounded-full bg-[#151514] px-6 py-3 text-xs font-medium text-white hover:bg-[#262624] transition-all shadow-sm"
            >
              <span>List your first neighborhood tool</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
