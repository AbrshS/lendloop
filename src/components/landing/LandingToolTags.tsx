'use client';

import React from 'react';
import { Quote } from 'lucide-react';

export function LandingToolTags() {
  const tags = [
    {
      quote:
        'Mark told us the 1/2-inch carbide masonry bit would bite right through pre-war limestone without cracking it. He was 100% right. Shelves are rock solid.',
      author: 'Priya & Sam',
      details: 'Borrowed Bosch Rotary Hammer · Built floating parlor library',
      location: 'Prospect Heights · 2026',
      tagNumber: 'TAG #0142',
    },
    {
      quote:
        'Why pay $350 for a tile saw you use for one weekend? Borrowed from David on Tuesday, cut our subway tile backsplash, returned it with warm cinnamon rolls.',
      author: 'Marion Ellis',
      details: 'Borrowed DeWalt Wet Tile Saw · Kitchen backsplash remodel',
      location: 'Fort Greene · 2026',
      tagNumber: 'TAG #0089',
    },
    {
      quote:
        'Met two families on our block we had lived next to for three years without ever speaking. Now our kids play together on the stoop and we share a lawnmower.',
      author: 'The Okafor family',
      details: 'Borrowed Honda Mower & Stihl Blower · Porch & tree pit planting',
      location: 'Park Slope · 2025',
      tagNumber: 'TAG #0205',
    },
    {
      quote:
        'Tool was cleaner, sharper, and better tuned than anything you’d get at a commercial rental counter. Saved $180 on a 1-day cedar deck project.',
      author: 'Daniel Lee',
      details: 'Borrowed DeWalt 12" Miter Saw · Red cedar deck planter boxes',
      location: 'Gowanus · 2026',
      tagNumber: 'TAG #0314',
    },
  ];

  return (
    <section id="tags" className="py-20 md:py-28 border-b border-[#E9E9E5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col space-y-2 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#78716C]">
            06 / Neighbor Stories
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#151514]">
              Written on the tool tag
            </h2>
            <p className="text-sm text-[#4A4C48] max-w-md">
              Every tool in LendLoop carries a canvas tag. We ask neighbors to write one honest line on the back when returning it. These are a few.
            </p>
          </div>
        </div>

        {/* 4 Tool Tags Grid (Styled like physical tags with punched grommet hole) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tags.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-3xl border border-[#D6D6D1] bg-[#FCFCF9] p-8 shadow-sm hover:shadow-md transition-all tool-tag"
            >
              {/* Punched brass grommet hole from LendLoop UI spec */}
              <div className="absolute top-4 left-4 h-5 w-5 rounded-full border-2 border-[#A8A29E] bg-[#E9E9E5] flex items-center justify-center shadow-inner">
                <div className="h-2 w-2 rounded-full bg-[#151514]/20" />
              </div>

              <div className="pt-3">
                <div className="flex items-center justify-between pl-8 pb-4 border-b border-[#E9E9E5]">
                  <span className="font-mono text-[11px] font-semibold text-[#78716C] tracking-wider">
                    {item.tagNumber}
                  </span>
                  <span className="rounded-full bg-[#F4F4F1] px-2.5 py-0.5 text-[10px] font-medium text-[#151514]">
                    Verified Loan Tag
                  </span>
                </div>

                <div className="mt-6 flex gap-3">
                  <Quote className="h-6 w-6 text-[#0F766E]/40 shrink-0 mt-1" />
                  <p className="font-serif text-lg sm:text-xl italic text-[#151514] leading-relaxed">
                    “{item.quote}”
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E9E9E5] flex items-end justify-between">
                <div>
                  <h4 className="font-display text-base font-bold text-[#151514]">
                    {item.author}
                  </h4>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    {item.details}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#A8A29E]">
                  {item.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

