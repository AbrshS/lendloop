'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ArrowRight, Check, MapPin, ShieldCheck, User } from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  neighborhood: string;
  category: string;
  condition: string;
  specs: string;
  pickup: string;
  owner: string;
  ownerSince: string;
  imageUrl: string;
  badge: string;
}

interface LandingInventoryProps {
  onOpenApp: (tab?: 'tools' | 'listings' | 'requests' | 'incoming' | 'admin') => void;
}

const STARTER_TOOLS: ToolItem[] = [
  {
    id: 'tool-1',
    name: 'DeWalt DWS779 12" Sliding Compound Miter Saw',
    neighborhood: 'Park Slope · 8th Ave & 3rd St',
    category: 'Woodworking',
    condition: 'Excellent',
    specs: '15 Amp, 3,800 RPM, dual horizontal steel rails, 60T carbide blade included',
    pickup: 'Front porch keyless locker or stoop greeting',
    owner: 'Marcus Thompson',
    ownerSince: 'Member since May 2024 · 32 loans completed',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    badge: 'Free community loan',
  },
  {
    id: 'tool-2',
    name: 'Bosch Bulldog Xtreme 1" SDS-Plus Rotary Hammer',
    neighborhood: 'Prospect Heights · Sterling Place',
    category: 'Masonry & Concrete',
    condition: 'Heavy duty',
    specs: '8.0 Amp motor, 0-2.6 ft-lbs impact energy, masonry bits 1/4" to 3/4" in case',
    pickup: 'Porch handover with eye protection and earplugs',
    owner: 'Elena Rostova',
    ownerSince: 'Member since Nov 2023 · 45 loans completed',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
    badge: 'Free community loan',
  },
  {
    id: 'tool-3',
    name: 'Sun Joe SPX3000 Max Electric Pressure Washer',
    neighborhood: 'Fort Greene · S. Oxford St',
    category: 'Outdoor & Patio',
    condition: 'Like new',
    specs: '2030 Max PSI, 1.76 GPM, 5 quick-connect spray tips, 34-inch extension wand',
    pickup: 'Garden gate access · Garden hose included if needed',
    owner: 'Julian Chen',
    ownerSince: 'Member since Mar 2025 · 19 loans completed',
    imageUrl: 'https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=800&q=80',
    badge: 'Free community loan',
  },
  {
    id: 'tool-4',
    name: 'Werner 22-Foot Reach Pro Multi-Position Ladder',
    neighborhood: 'Park Slope · Berkeley Place',
    category: 'Home Maintenance',
    condition: 'Excellent',
    specs: '375 lb load capacity (Type IAA), converts to stepladder, extension & stairway',
    pickup: 'Side alleyway storage with combination code',
    owner: 'Priya & Sam',
    ownerSince: 'Member since Jan 2024 · 28 loans completed',
    imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    badge: 'Free community loan',
  },
  {
    id: 'tool-5',
    name: 'Stihl BG 56 C-E Gas Handheld Leaf Blower',
    neighborhood: 'Carroll Gardens · President St',
    category: 'Lawn & Garden',
    condition: 'Freshly serviced',
    specs: 'Easy2Start system, 412 CFM, 143 MPH air velocity, 2-stroke mixed fuel provided',
    pickup: 'Front stoop pickup with safety glasses',
    owner: 'David Moretti',
    ownerSince: 'Member since Aug 2024 · 14 loans completed',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69107936?auto=format&fit=crop&w=800&q=80',
    badge: 'Free community loan',
  },
  {
    id: 'tool-6',
    name: 'Bostitch 6-Gallon Pancake Compressor & 18GA Nailer',
    neighborhood: 'Prospect Heights · Lincoln Place',
    category: 'Trim & Carpentry',
    condition: 'Excellent',
    specs: '150 Max PSI, 2.6 SCFM, oil-free high-efficiency pump, 50ft hose and nails',
    pickup: 'Lobby concierge handover',
    owner: 'Sarah Jenkins',
    ownerSince: 'Member since Oct 2024 · 22 loans completed',
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
    badge: 'Free community loan',
  },
];

export function LandingInventory({ onOpenApp }: LandingInventoryProps) {
  // Query anonymous-safe tools directly from Convex (name & category only)
  const publicTools = useQuery(api.tools.listPublic);

  const tools: ToolItem[] = useMemo(() => {
    const list: ToolItem[] = [];

    // Prepend database items from Convex
    if (publicTools && publicTools.length > 0) {
      publicTools.forEach((t) => {
        list.push({
          id: t._id,
          name: t.name,
          neighborhood: 'Brooklyn Hub · Public Bench',
          category: t.category,
          condition: 'Community Shared',
          specs: 'Verified equipment shared by neighbors',
          pickup: 'Stoop pickup or keyless lockbox',
          owner: 'Community Member',
          ownerSince: 'Active lender',
          imageUrl:
            'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
          badge: 'Available now',
        });
      });
    }

    STARTER_TOOLS.forEach((st) => list.push(st));
    return list;
  }, [publicTools]);

  const [activeTool, setActiveTool] = useState<ToolItem>(STARTER_TOOLS[0]!);

  useEffect(() => {
    if (tools.length > 0 && !tools.some((t) => t.id === activeTool.id)) {
      setActiveTool(tools[0]!);
    }
  }, [tools, activeTool.id]);

  return (
    <section id="tools" className="py-20 md:py-28 border-b border-[#E9E9E5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col space-y-2 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#78716C]">
            01 / Inventory
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#151514]">
              In the neighborhood now
            </h2>
            <p className="text-sm text-[#4A4C48] max-w-md">
              Every tool available to borrow right now. Hover an item and the tool details float up beside it.
            </p>
          </div>
        </div>

        {/* 2-Column Interactive List & Floating Preview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Rows */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-[#E9E9E5] border-y border-[#E9E9E5]">
            {tools.map((item, index) => {
              const isActive = activeTool.id === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveTool(item)}
                  onClick={() => {
                    setActiveTool(item);
                    onOpenApp('tools');
                  }}
                  className={`group flex items-center justify-between py-5 px-3 transition-all cursor-pointer rounded-xl ${
                    isActive ? 'bg-white shadow-sm -mx-2 px-5 border border-[#E9E9E5]' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-xs font-mono text-[#A8A29E] mt-1">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-base sm:text-lg font-semibold text-[#151514] group-hover:text-[#0F766E] transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#78716C]">
                        <span className="flex items-center gap-1 font-medium text-[#151514]">
                          <MapPin className="h-3 w-3 text-[#78716C]" />
                          {item.neighborhood.split('·')[0]?.trim() || item.neighborhood}
                        </span>
                        <span>·</span>
                        <span className="rounded bg-[#E9E9E5] px-2 py-0.5 text-[11px] font-medium text-[#4A4C48]">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end pl-4">
                    <span className="text-xs font-bold text-[#2F7D4F] bg-[#2F7D4F]/10 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-[#A8A29E] mt-1">
                      {item.condition}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Floating Tool Showcase Card */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-3xl border border-[#E9E9E5] bg-white p-5 shadow-lg shadow-black/5 transition-all">
              <div className="relative overflow-hidden rounded-2xl bg-[#F4F4F1] aspect-[4/3]">
                <img
                  src={activeTool.imageUrl}
                  alt={activeTool.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-[#151514]/80 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2F7D4F]" />
                    Ready for pickup
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                      {activeTool.category}
                    </span>
                    <span className="text-xs font-medium text-[#2F7D4F] bg-[#2F7D4F]/10 px-2.5 py-0.5 rounded-full">
                      Community loan
                    </span>
                  </div>
                  <h4 className="mt-1 font-display text-xl font-bold text-[#151514]">
                    {activeTool.name}
                  </h4>
                  <p className="mt-1 text-xs text-[#78716C]">
                    {activeTool.neighborhood}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F4F4F1] p-3.5 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-[#2F7D4F] shrink-0 mt-0.5" />
                    <span className="text-[#4A4C48]">{activeTool.specs}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                    <span className="text-[#4A4C48]">{activeTool.pickup}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E9E9E5]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#151514] text-white text-xs font-medium">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#151514]">
                        {activeTool.owner}
                      </span>
                      <span className="text-[10px] text-[#78716C]">
                        {activeTool.ownerSince}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenApp('tools')}
                    className="flex items-center gap-1.5 rounded-full bg-[#151514] px-4 py-2 text-xs font-medium text-white hover:bg-[#262624] transition-all"
                  >
                    <span>Borrow</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Catalog Link */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => onOpenApp('tools')}
            className="flex items-center gap-2 rounded-full border border-[#151514] bg-transparent px-6 py-3 text-xs font-semibold text-[#151514] hover:bg-[#151514] hover:text-white transition-all"
          >
            <span>Browse all 48 tools in live inventory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
