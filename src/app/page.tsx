'use client';

import React, { useState } from 'react';
import { RoweLandingPage } from '@/components/landing/RoweLandingPage';
import { ToolBoard } from '@/components/ToolBoard';
import type { MainTab } from '@/components/Header';
import { Sparkles, Layout } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [initialAppTab, setInitialAppTab] = useState<MainTab>('tools');
  const [openCreateOnLaunch, setOpenCreateOnLaunch] = useState(false);

  function handleOpenApp(tab: MainTab = 'tools') {
    setInitialAppTab(tab);
    setOpenCreateOnLaunch(false);
    setView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenNewTool() {
    setInitialAppTab('listings');
    setOpenCreateOnLaunch(true);
    setView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToLanding() {
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {view === 'landing' ? (
        <RoweLandingPage
          onOpenApp={handleOpenApp}
          onOpenNewTool={handleOpenNewTool}
        />
      ) : (
        <ToolBoard
          initialTab={initialAppTab}
          openCreateModalOnMount={openCreateOnLaunch}
          onBackToLanding={handleBackToLanding}
        />
      )}

      {/* Floating View Switcher Pill */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-1 rounded-full border border-[#151514]/20 bg-[#151514] p-1.5 text-white shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setView('landing')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              view === 'landing'
                ? 'bg-white text-[#151514] shadow-xs'
                : 'text-[#A8A29E] hover:text-white'
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Editorial Landing</span>
          </button>

          <button
            onClick={() => setView('app')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              view === 'app'
                ? 'bg-[#2F7D4F] text-white shadow-xs'
                : 'text-[#A8A29E] hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#F5C518]" />
            <span>Live Tool Board</span>
          </button>
        </div>
      </div>
    </div>
  );
}
