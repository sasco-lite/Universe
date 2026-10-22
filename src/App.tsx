/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBlackHoleStore } from './store/useBlackHoleStore';
import { BlackHoleCanvas } from './components/canvas/BlackHoleCanvas';
import { TopNav } from './components/ui/TopNav';
import { BottomDock } from './components/ui/BottomDock';
import { StarLauncherModal } from './components/ui/StarLauncherModal';
import { LearnMoreDrawer } from './components/ui/LearnMoreDrawer';
import { HomePage } from './pages/HomePage';
import { AnatomyPage } from './pages/AnatomyPage';
import { StarClusterPage } from './pages/StarClusterPage';
import { SpacetimeLabPage } from './pages/SpacetimeLabPage';
import { TimeDilationPage } from './pages/TimeDilationPage';
import { AboutPage } from './pages/AboutPage';
import { AppPage } from './types';
import { X, Sparkles } from 'lucide-react';

export default function App() {
  const {
    currentPage,
    setCurrentPage,
    minimalUI,
    toggleMinimalUI,
    isPaused,
    setIsPaused,
    resetSimulation,
    setActiveLearnMore,
    shortcutHintVisible,
    dismissShortcutHint,
  } = useBlackHoleStore();

  const [isLoaded, setIsLoaded] = useState(false);

  // Initial loader fade-out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      dismissShortcutHint();

      const keyMap: Record<string, AppPage> = {
        '1': 'home',
        '2': 'anatomy',
        '3': 'cluster',
        '4': 'lab',
        '5': 'dilation',
        '6': 'about',
      };

      if (keyMap[e.key]) {
        setCurrentPage(keyMap[e.key]);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(!isPaused);
      } else if (e.key === 'r' || e.key === 'R') {
        resetSimulation();
      } else if (e.key === 'h' || e.key === 'H') {
        toggleMinimalUI();
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveLearnMore(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentPage, isPaused, setIsPaused, resetSimulation, toggleMinimalUI, setActiveLearnMore, dismissShortcutHint]);

  // Auto-fade shortcut hint after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dismissShortcutHint();
    }, 7000);
    return () => clearTimeout(timer);
  }, [dismissShortcutHint]);

  return (
    <div className="relative w-screen min-h-screen bg-black text-slate-100 overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* Persistent WebGL Canvas (Shared across all pages, never remounts) */}
      <BlackHoleCanvas />

      {/* Top Navigation Bar */}
      <TopNav />

      {/* Main Page Content Layer */}
      <main className="relative z-10 min-h-screen">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'anatomy' && <AnatomyPage />}
        {currentPage === 'cluster' && <StarClusterPage />}
        {currentPage === 'lab' && <SpacetimeLabPage />}
        {currentPage === 'dilation' && <TimeDilationPage />}
        {currentPage === 'about' && <AboutPage />}
      </main>

      {/* Collapsible Unified Bottom Flight Deck */}
      <BottomDock />

      {/* Star Launcher Slingshot Modal */}
      <StarLauncherModal />

      {/* Deep Dive Learn More Drawer */}
      <LearnMoreDrawer />

      {/* Auto-fading Keyboard Shortcuts Hint Pill */}
      {shortcutHintVisible && !minimalUI && (
        <div className="fixed top-18 right-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/85 border border-white/15 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur-md pointer-events-auto animate-fade-in transition-all">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>[Space] Pause · [R] Reset · [H] Zen UI · [1-6] Pages · [Hold] Gravity Well</span>
          <button
            onClick={dismissShortcutHint}
            className="text-slate-500 hover:text-white p-0.5 rounded cursor-pointer ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Initial Pre-Warm Loading Curtain */}
      <div
        className={`fixed inset-0 z-50 bg-[#030508] flex flex-col items-center justify-center transition-opacity duration-600 pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
          <h2 className="text-lg font-bold font-display text-white tracking-widest uppercase">
            Sagittarius A*
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Compiling Relativistic Geodesics & 15,000 S-Stars...
          </p>
        </div>
      </div>
    </div>
  );
}
