'use client';

import React, { useState } from 'react';
import { Coffee, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

export function LandingSaturdayWalk() {
  const [rsvped, setRsvped] = useState(false);

  function handleRsvp() {
    setRsvped(true);
    toast.success('See you this Saturday at 10 AM on 7th Ave!');
  }

  return (
    <section className="py-20 md:py-28 border-b border-[#E9E9E5] bg-[#E9E9E5]/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#D6D6D1] bg-[#151514] p-8 sm:p-14 text-white relative overflow-hidden shadow-xl">
          {/* Subtle ambient light */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0F766E]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#F4F4F1] backdrop-blur-md">
              <Coffee className="h-3.5 w-3.5 text-[#F5C518]" />
              <span>Saturday Stoop & Sharpener · Every weekend</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Walk the blocks with us this Saturday.
            </h2>

            <p className="text-sm sm:text-base text-[#D6D6D1] leading-relaxed">
              Every Saturday morning from 10 am to 12 pm, we host a tool drop, blade sharpening, and pour-over coffee station on 7th Avenue. Bring a dull lawn blade or chisel, meet fellow makers, and pick up weekend gear in person.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              {rsvped ? (
                <div className="flex items-center gap-2 rounded-full bg-[#2F7D4F] px-5 py-3 text-xs font-semibold text-white">
                  <Check className="h-4 w-4" />
                  <span>You&apos;re on the Saturday list · 214 7th Ave @ 10 AM</span>
                </div>
              ) : (
                <button
                  onClick={handleRsvp}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-semibold text-[#151514] hover:bg-[#F4F4F1] transition-all shadow-sm"
                >
                  <span>RSVP for Saturday Coffee</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}

              <a
                href="tel:7185550144"
                className="text-xs font-medium text-[#D6D6D1] hover:text-white underline underline-offset-4"
              >
                Questions? Call (718) 555-0144
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

