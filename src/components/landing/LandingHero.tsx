'use client';

import React, { useState } from 'react';
import type { MainTab } from '@/components/Header';

interface LandingHeroProps {
  onOpenApp: (tab?: MainTab) => void;
  onOpenNewTool?: () => void;
}

export function LandingHero({ onOpenApp }: LandingHeroProps) {
  // Center card is index 2 by default
  const [activeIndex, setActiveIndex] = useState(2);

  const cards = [
    {
      id: 0,
      title: '412 Sterling Place',
      area: 'Prospect Heights',
      tool: 'Werner 22ft Multi-Position Ladder',
      price: 'Free to borrow',
      image:
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 1,
      title: '77 Berkeley Place, 2F',
      area: 'Park Slope',
      tool: 'Bosch Bulldog Xtreme Rotary Hammer',
      price: 'Free to borrow',
      image:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: '179 South Oxford Street',
      area: 'Fort Greene',
      tool: 'DeWalt 12" Sliding Compound Miter Saw',
      price: 'Free to borrow',
      image:
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 3,
      title: '214 Lafayette Avenue',
      area: 'Fort Greene',
      tool: 'Sun Joe 2030 PSI Pressure Washer',
      price: 'Free to borrow',
      image:
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      title: '843 Union Street',
      area: 'Park Slope',
      tool: 'Stihl Easy2Start Handheld Gas Blower',
      price: 'Free to borrow',
      image:
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const activeCard = cards[activeIndex] || cards[2]!;

  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-14 md:pb-28 bg-[#F4F4F1] select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Top Line 1: Headline */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[104px] font-bold tracking-tight text-[#151514] text-center leading-[0.95] mb-6 md:mb-10">
          Brooklyn tools,
        </h1>

        {/* Fanned Cards Showcase (Pixel-perfect replica of Rowe Hero fan) */}
        <div className="relative w-full max-w-5xl py-4 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full">
            {cards.map((card, idx) => {
              const isCenter = idx === activeIndex;
              const distance = idx - activeIndex;

              // Compute natural arc transforms based on distance from active center
              let rotation = 0;
              let translateY = 0;
              let scale = 1;
              let zIndex = 10;
              let opacity = 'opacity-90';

              if (distance === 0) {
                // Active center card
                rotation = 0;
                translateY = 0;
                scale = 1.05;
                zIndex = 30;
                opacity = 'opacity-100';
              } else if (distance === -1) {
                // Immediate left
                rotation = -4;
                translateY = 14;
                scale = 0.94;
                zIndex = 20;
                opacity = 'opacity-90';
              } else if (distance === 1) {
                // Immediate right
                rotation = 4;
                translateY = 14;
                scale = 0.94;
                zIndex = 20;
                opacity = 'opacity-90';
              } else if (distance === -2) {
                // Far left
                rotation = -9;
                translateY = 32;
                scale = 0.86;
                zIndex = 10;
                opacity = 'opacity-75';
              } else if (distance === 2) {
                // Far right
                rotation = 9;
                translateY = 32;
                scale = 0.86;
                zIndex = 10;
                opacity = 'opacity-75';
              }

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => onOpenApp('tools')}
                  style={{
                    transform: `translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
                    zIndex,
                  }}
                  className={`group relative flex-shrink-0 cursor-pointer transition-all duration-400 ease-out origin-bottom ${
                    isCenter
                      ? 'w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px]'
                      : 'w-[120px] sm:w-[160px] md:w-[190px] lg:w-[210px]'
                  }`}
                >
                  <div
                    className={`relative w-full aspect-[3/4] overflow-hidden bg-[#E9E9E5] transition-all duration-300 ${
                      isCenter
                        ? 'rounded-3xl shadow-2xl ring-1 ring-black/5'
                        : 'rounded-2xl sm:rounded-3xl shadow-md hover:opacity-100 hover:scale-100'
                    } ${opacity}`}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Card Label (Directly beneath the center card) */}
          <div className="mt-8 md:mt-10 text-center flex flex-col items-center min-h-[50px] transition-all">
            <h4
              onClick={() => onOpenApp('tools')}
              className="font-display text-base sm:text-lg font-bold text-[#151514] cursor-pointer hover:text-[#0F766E] transition-colors"
            >
              {activeCard.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              <span>{activeCard.area}</span>
              <span className="mx-1.5 text-[#D6D6D1]">·</span>
              <span className="font-medium text-[#2F7D4F]">{activeCard.price}</span>
              <span className="mx-1.5 text-[#D6D6D1] hidden sm:inline">·</span>
              <span className="text-[#4A4C48] hidden sm:inline">{activeCard.tool}</span>
            </p>
          </div>
        </div>

        {/* Bottom Line 2: Headline */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[104px] font-bold tracking-tight text-[#151514] text-center leading-[0.95] mt-6 md:mt-8">
          block by block
        </h1>
      </div>
    </section>
  );
}
