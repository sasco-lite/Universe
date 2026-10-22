import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import { AppPage } from '../../types';

interface NavItem {
  id: AppPage;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Overview' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'cluster', label: 'Star Cluster' },
  { id: 'lab', label: 'Spacetime Lab' },
  { id: 'dilation', label: 'Time Dilation' },
  { id: 'about', label: 'Physics' },
];

export const TopNav: React.FC = () => {
  const { currentPage, setCurrentPage, audioEnabled, toggleAudio, currentCameraDistanceRs } =
    useBlackHoleStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-8 px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-md pointer-events-auto">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => setCurrentPage('home')}
        className="text-left group cursor-pointer focus:outline-none"
      >
        <span className="text-base md:text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 group-hover:text-amber-400 transition-colors">
          SAGITTARIUS A*
        </span>
        <span className="hidden sm:inline-block ml-3 text-xs text-slate-400 font-mono tabular-nums">
          r = {currentCameraDistanceRs} r<sub className="text-[10px]">s</sub>
        </span>
      </button>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action & Audio control */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleAudio}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
            audioEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10'
          }`}
          title={audioEnabled ? 'Mute gravitational hum' : 'Enable procedural gravitational audio'}
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{audioEnabled ? 'Audio 55Hz' : 'Muted'}</span>
        </button>

        {/* Mobile menu link selector */}
        <select
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value as AppPage)}
          className="md:hidden bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/20 focus:outline-none"
        >
          {NAV_ITEMS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
