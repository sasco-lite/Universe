import React from 'react';
import { ArrowRight, Orbit, Compass, Sliders, Clock, Sparkles } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import { calculateSchwarzschildRadius } from '../physics/relativity';

export const HomePage: React.FC = () => {
  const { setCurrentPage, massSolar, spinParameter } = useBlackHoleStore();
  const { meters, au } = calculateSchwarzschildRadius(massSolar);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-36 pointer-events-none">
      {/* Hero Headline & Intro */}
      <div className="max-w-3xl pointer-events-auto">
        {/* Unboxed Metadata (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mb-4">
          <span className="text-amber-400 font-semibold">Milky Way Galactic Core</span>
          <span aria-hidden="true">·</span>
          <span>RA 17h 45m 40s</span>
          <span aria-hidden="true">·</span>
          <span>Dec -29° 0′ 28″</span>
          <span aria-hidden="true">·</span>
          <span>26,673 Light-Years</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-display text-balance leading-none mb-6">
          The Gravitational Engine of Our Galaxy
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8 font-light">
          Sagittarius A* is a rotating Kerr supermassive black hole with a mass of 4.15 million suns.
          Travel through curved spacetime, observe relativistic Doppler beaming across the accretion
          disk, and track 15,000 stars locked in relativistic rosette orbits.
        </p>

        {/* Primary Interactive CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setCurrentPage('anatomy')}
            className="flex items-center gap-2.5 px-5 py-3 text-sm font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Explore Metric Anatomy</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentPage('cluster')}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-slate-900/80 hover:bg-slate-800 border border-white/15 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 backdrop-blur-sm"
          >
            <Orbit className="w-4 h-4 text-blue-400" />
            <span>Track 15,000 S-Stars</span>
          </button>

          <button
            onClick={() => setCurrentPage('lab')}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Spacetime Lab</span>
          </button>
        </div>
      </div>

      {/* Real Quantitative Physical Metric Cards (Single-elevation, hairline borders) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pointer-events-auto">
        <div className="p-4 rounded-xl bg-slate-950/75 border border-white/10 backdrop-blur-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Black Hole Mass M
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            4.154 <span className="text-xs font-normal text-amber-400 ml-1">× 10⁶ M☉</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-light">
            ≈ 8.26 × 10³⁶ kg
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/75 border border-white/10 backdrop-blur-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Schwarzschild Radius r<sub>s</sub>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {(meters / 1e9).toFixed(2)} <span className="text-xs font-normal text-amber-400 ml-1">M km</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-light">
            ≈ {au.toFixed(3)} AU (17 Solar radii)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/75 border border-white/10 backdrop-blur-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Kerr Spin Parameter a
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {spinParameter.toFixed(2)} <span className="text-xs font-normal text-blue-400 ml-1">c J/GM²</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-light">
            Rapid prograde frame dragging
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/75 border border-white/10 backdrop-blur-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Max Orbital Speed
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            24,000 <span className="text-xs font-normal text-amber-400 ml-1">km/s</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-light">
            ≈ 8.0% speed of light (S4714)
          </div>
        </div>
      </div>
    </div>
  );
};
