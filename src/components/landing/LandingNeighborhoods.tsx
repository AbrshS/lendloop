'use client';

import React, { useState } from 'react';
import { MapPin, ArrowRight, Coffee } from 'lucide-react';
import type { MainTab } from '@/components/Header';

interface LandingNeighborhoodsProps {
  onOpenApp: (tab?: MainTab) => void;
}

export function LandingNeighborhoods({ onOpenApp }: LandingNeighborhoodsProps) {
  const [openIndex, setOpenIndex] = useState(0);

  const neighborhoods = [
    {
      name: 'Park Slope',
      stat: '48 active tools · 1.8 hr avg pickup',
      role: 'Brownstone Restoration & Heavy Woodcraft',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description:
        'From 1st to 8th Avenue. Dense historic brownstone blocks where pre-war plaster, cedar deck builds, and spring stoop landscaping require high-torque hammer drills, compound miter saws, and long ladders.',
      hubMorning: 'Gorilla Coffee stoop pickups on 5th Ave · Keyless lockers on 2nd St.',
      popularTools: ['DeWalt 12" Sliding Miter Saw', 'Werner 22ft Multi-Ladder', 'Bosch Rotary Hammer'],
    },
    {
      name: 'Prospect Heights',
      stat: '36 active tools · 2.1 hr avg pickup',
      role: 'Community Gardens & Balcony Woodworking',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      description:
        'Underwood Park to Vanderbilt. Compact co-ops, active tree-pit stewards, and rooftop gardeners sharing compact tile saws, electric pressure washers, compost aerators, and cordless finish nailers.',
      hubMorning: 'Underwest front-garden tool chest on Sterling Place · Saturday 9:30 AM coffee.',
      popularTools: ['Sun Joe Electric Pressure Washer', 'Bostitch Pancake Compressor', 'Milwaukee M18 Compact Drill'],
    },
    {
      name: 'Fort Greene',
      stat: '42 active tools · 1.5 hr avg pickup',
      role: 'Historic Millwork & Porch Craftsmanship',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      description:
        'Lafayette Avenue to Myrtle. Restoring 1890s pocket doors, porch spindles, and tree pits. Home to our largest collection of heavy-duty pipe clamps, hand planes, and electric paint strippers.',
      hubMorning: 'South Oxford stoop drop · Bit sharpening station at Saturday market.',
      popularTools: ['Festool Track Saw & Guide Rail', 'Stihl Gas Leaf Blower', 'Bessey Heavy-Duty Bar Clamps (Set of 6)'],
    },
  ];

  return (
    <section id="neighborhoods" className="py-20 md:py-28 border-b border-[#E9E9E5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col space-y-2 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#78716C]">
            02 / Neighborhoods
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#151514]">
              Three neighborhoods, known well
            </h2>
            <p className="text-sm text-[#4A4C48] max-w-md">
              Each guide follows one ordinary Saturday: where people get coffee, which block is building planter boxes, and where the heavy tools live.
            </p>
          </div>
        </div>

        {/* 3 Interactive Accordion / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {neighborhoods.map((n, idx) => {
            const isSelected = openIndex === idx;
            return (
              <div
                key={n.name}
                onClick={() => setOpenIndex(idx)}
                className={`flex flex-col rounded-3xl border bg-white overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-[#151514] shadow-md ring-1 ring-[#151514]'
                    : 'border-[#E9E9E5] hover:border-[#151514]/40 hover:shadow-sm'
                }`}
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#F4F4F1]">
                  <img
                    src={n.image}
                    alt={n.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#151514] flex items-center gap-1.5 shadow-sm">
                      <MapPin className="h-3 w-3 text-[#0F766E]" />
                      {n.name}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="block rounded-lg bg-[#151514]/80 backdrop-blur-sm px-2.5 py-1 text-[11px] text-white font-mono">
                      {n.stat}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col p-6 space-y-4 flex-1 justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                      {n.role}
                    </span>
                    <h3 className="mt-1 font-display text-2xl font-bold text-[#151514]">
                      {n.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#4A4C48] leading-relaxed">
                      {n.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#E9E9E5]">
                    <div className="flex items-start gap-2 text-xs text-[#78716C]">
                      <Coffee className="h-3.5 w-3.5 text-[#151514] shrink-0 mt-0.5" />
                      <span>{n.hubMorning}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {n.popularTools.map((t, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-[#F4F4F1] border border-[#E9E9E5] px-2 py-0.5 text-[10px] font-medium text-[#151514]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('tools');
                      }}
                      className="w-full mt-2 flex items-center justify-between rounded-full bg-[#F4F4F1] hover:bg-[#151514] hover:text-white px-4 py-2 text-xs font-semibold text-[#151514] transition-colors"
                    >
                      <span>Explore {n.name} tools</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
