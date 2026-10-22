import React from 'react';
import { ArrowRight, Orbit, Sliders, Clock, MousePointer } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import { calculateSchwarzschildRadius } from '../physics/relativity';

export const HomePage: React.FC = () => {
  const { setCurrentPage, massSolar, spinParameter, minimalUI, setActiveLearnMore } =
    useBlackHoleStore();
  const { meters } = calculateSchwarzschildRadius(massSolar);

  if (minimalUI) return null;

  return (
    <div className="relative z-10 w-full min-h-screen pointer-events-none p-6 pt-20 flex flex-col justify-between">
      {/* Top-Left Peripheral Header (Center completely clear) */}
      <div className="max-w-md pointer-events-auto p-4 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md shadow-2xl space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400">
          <span>Galactic Core</span>
          <span>·</span>
          <span>26,670 ly</span>
          <span>·</span>
          <span>Kerr Metric</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
          Sagittarius A*
        </h1>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Mass M</span>
            <span className="text-amber-300 font-bold tabular-nums">4.15M M☉</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Radius rₛ</span>
            <span className="text-white font-bold tabular-nums">{(meters / 1e9).toFixed(1)}M km</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Spin a</span>
            <span className="text-blue-400 font-bold tabular-nums">+{spinParameter.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Floating Center-Bottom Peripheral Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto pb-16">
        {/* Interaction hints */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
          <MousePointer className="w-3.5 h-3.5 text-amber-400" />
          <span>Drag orbit · Scroll zoom · Hold to bend gravity</span>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentPage('anatomy')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-black font-semibold text-xs cursor-pointer hover:bg-amber-300 transition-colors shadow-lg"
          >
            <span>Anatomy</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setCurrentPage('cluster')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white font-medium text-xs border border-white/15 cursor-pointer transition-colors backdrop-blur-sm"
          >
            <Orbit className="w-3 h-3 text-blue-400" />
            <span>S-Stars</span>
          </button>

          <button
            onClick={() => setCurrentPage('lab')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 cursor-pointer transition-colors"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Lab</span>
          </button>

          <button
            onClick={() => setActiveLearnMore(true)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs border border-white/10 cursor-pointer transition-colors"
          >
            Deep Dive
          </button>
        </div>
      </div>
    </div>
  );
};
