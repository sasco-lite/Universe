/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBlackHoleStore } from './store/useBlackHoleStore';
import { BlackHoleCanvas } from './components/canvas/BlackHoleCanvas';
import { TopNav } from './components/ui/TopNav';
import { BottomDock } from './components/ui/BottomDock';
import { HomePage } from './pages/HomePage';
import { AnatomyPage } from './pages/AnatomyPage';
import { StarClusterPage } from './pages/StarClusterPage';
import { SpacetimeLabPage } from './pages/SpacetimeLabPage';
import { TimeDilationPage } from './pages/TimeDilationPage';
import { AboutPage } from './pages/AboutPage';
import { AppPage } from './types';

export default function App() {
  const { currentPage, setCurrentPage } = useBlackHoleStore();
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial loader fade-out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation for pages (Keys 1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentPage]);

  return (
    <div className="relative w-screen min-h-screen bg-black text-slate-100 overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* Persistent WebGL Canvas (Shared across all pages, never remounts) */}
      <BlackHoleCanvas />

      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <TopNav />

      {/* Main Page Content Layer with subtle gravitational transitions */}
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

      {/* Initial Pre-Warm Loading Curtain */}
      <div
        className={`fixed inset-0 z-50 bg-[#030508] flex flex-col items-center justify-center transition-opacity duration-700 pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
          <h2 className="text-lg font-bold font-display text-white tracking-widest uppercase">
            Sagittarius A*
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Initializing Relativistic Null Geodesic Shaders & 15,000 S-Stars...
          </p>
        </div>
      </div>
    </div>
  );
}
