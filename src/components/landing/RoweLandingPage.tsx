'use client';

import React from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingInventory } from './LandingInventory';
import { LandingNeighborhoods } from './LandingNeighborhoods';
import { LandingProcess } from './LandingProcess';
import { LandingImpactBento } from './LandingImpactBento';
import { LandingRecentlyLoaned } from './LandingRecentlyLoaned';
import { LandingToolTags } from './LandingToolTags';
import { LandingEstimator } from './LandingEstimator';
import { LandingSaturdayWalk } from './LandingSaturdayWalk';
import { LandingFooter } from './LandingFooter';
import type { MainTab } from '@/components/Header';

interface RoweLandingPageProps {
  onOpenApp: (tab?: MainTab) => void;
  onOpenNewTool?: () => void;
}

export function RoweLandingPage({ onOpenApp, onOpenNewTool }: RoweLandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F4F4F1] text-[#151514] selection:bg-[#F6E3D6] selection:text-[#151514]">
      {/* Top Header */}
      <LandingHeader onOpenApp={onOpenApp} onOpenNewTool={onOpenNewTool} />

      {/* Main Content */}
      <main>
        {/* 1. Hero */}
        <LandingHero onOpenApp={onOpenApp} onOpenNewTool={onOpenNewTool} />

        {/* 2. On the Market Now -> In the Neighborhood Now */}
        <LandingInventory onOpenApp={onOpenApp} />

        {/* 3. Three Neighborhoods, Known Well */}
        <LandingNeighborhoods onOpenApp={onOpenApp} />

        {/* 4. From First Visit to Open House -> From First Request to Return */}
        <LandingProcess onOpenApp={onOpenApp} onOpenNewTool={onOpenNewTool} />

        {/* 5. The Last 12 Months (Bento Grid) */}
        <LandingImpactBento />

        {/* 6. Recently Sold -> Recently Borrowed */}
        <LandingRecentlyLoaned onOpenApp={onOpenApp} />

        {/* 7. Written on the Key Tag -> Written on the Tool Tag */}
        <LandingToolTags />

        {/* 8. What's Your Home Worth? -> What's Sitting in Your Shed? */}
        <LandingEstimator onOpenApp={onOpenApp} onOpenNewTool={onOpenNewTool} />

        {/* 9. Walk the Blocks with Me this Saturday */}
        <LandingSaturdayWalk />
      </main>

      {/* 10. Footer */}
      <LandingFooter onOpenApp={onOpenApp} />
    </div>
  );
}
