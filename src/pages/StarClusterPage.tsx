import React, { useState } from 'react';
import { Orbit, Compass, Focus, ChevronRight, Activity, Zap } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import { REAL_S_STARS } from '../components/canvas/StarClusterScene';
import { calculateGeneralRelativisticPrecession } from '../physics/relativity';

export const StarClusterPage: React.FC = () => {
  const {
    selectedStar,
    setSelectedStar,
    followSelectedStar,
    setFollowSelectedStar,
    massSolar,
    simulationSpeed,
  } = useBlackHoleStore();

  const [activeTab, setActiveTab] = useState<'real' | 'dense'>('real');

  const handleSelectRealStar = (starId: number) => {
    const s = REAL_S_STARS.find((st) => st.id === starId) || REAL_S_STARS[0];
    const precession = calculateGeneralRelativisticPrecession(
      s.semiMajorAxisAU,
      s.eccentricity,
      massSolar
    );

    setSelectedStar({
      ...s,
      currentDistanceRs: Number((s.semiMajorAxisAU / 140).toFixed(2)),
      currentVelocityKmS: s.periapsisVelocityKmS,
      timeDilationGamma: 1.042,
      precessionRateArcsecPerOrbit: Number(precession.toFixed(1)),
    });
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-36 pointer-events-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: S-Stars Catalog */}
        <div className="lg:col-span-5 pointer-events-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
              <Orbit className="w-3.5 h-3.5" />
              <span>Relativistic S-Cluster (15,000 Stars)</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white">
              Galactic Center Stellar Swarm
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-light">
              Within 0.05 parsecs of Sagittarius A*, thousands of high-velocity stars orbit in
              extreme Keplerian-relativistic potential wells, experiencing measurable Schwarzschild
              precession.
            </p>
          </div>

          {/* S-Star List */}
          <div className="space-y-2">
            {REAL_S_STARS.map((star) => {
              const isSelected = selectedStar?.id === star.id;
              return (
                <button
                  key={star.id}
                  onClick={() => handleSelectRealStar(star.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950/70 border-white/10 hover:bg-slate-900/80 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: star.colorHex }}
                      />
                      <span className="text-sm font-semibold text-white font-mono">
                        {star.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-amber-400 tabular-nums">
                      v = {star.periapsisVelocityKmS.toLocaleString()} km/s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                    <span>a = {star.semiMajorAxisAU} AU</span>
                    <span>e = {star.eccentricity}</span>
                    <span>T = {star.orbitalPeriodYears} yrs</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-400">
            <span className="text-slate-300 font-semibold block mb-1">
              Interactive 3D Viewport Tip:
            </span>
            Click directly on any star in the 3D canvas to select it and compute its instantaneous
            relativistic orbital trajectory.
          </div>
        </div>

        {/* Right Column: Selected Star Telemetry Deck */}
        <div className="lg:col-span-7 pointer-events-auto">
          {selectedStar ? (
            <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedStar.colorHex }}
                    />
                    <h3 className="text-2xl font-bold font-display text-white">
                      {selectedStar.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 block mt-1">
                    {selectedStar.spectralType}
                  </span>
                </div>

                {/* Follow Star Button */}
                <button
                  onClick={() => setFollowSelectedStar(!followSelectedStar)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                    followSelectedStar
                      ? 'bg-blue-500 text-white border-blue-400'
                      : 'bg-white/10 text-blue-300 border-white/15 hover:bg-white/15'
                  }`}
                >
                  <Focus className="w-3.5 h-3.5" />
                  <span>{followSelectedStar ? 'Locked in Tracking' : 'Track Orbit with Camera'}</span>
                </button>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">
                    Semi-Major Axis a
                  </span>
                  <span className="text-base font-bold text-white tabular-nums">
                    {selectedStar.semiMajorAxisAU}{' '}
                    <span className="text-xs text-slate-400">AU</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ≈ {(selectedStar.semiMajorAxisAU * 149.6).toFixed(0)}M km
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">
                    Orbital Eccentricity e
                  </span>
                  <span className="text-base font-bold text-amber-400 tabular-nums">
                    {selectedStar.eccentricity}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Extreme elliptic orbit
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">
                    Orbital Period T
                  </span>
                  <span className="text-base font-bold text-white tabular-nums">
                    {selectedStar.orbitalPeriodYears}{' '}
                    <span className="text-xs text-slate-400">years</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Keplerian period
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">
                    Periapsis Velocity
                  </span>
                  <span className="text-base font-bold text-amber-300 tabular-nums">
                    {selectedStar.periapsisVelocityKmS.toLocaleString()}{' '}
                    <span className="text-xs text-slate-400">km/s</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ≈ {((selectedStar.periapsisVelocityKmS / 299792) * 100).toFixed(1)}% speed of
                    light
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">
                    Periapsis Precession
                  </span>
                  <span className="text-base font-bold text-blue-400 tabular-nums">
                    {selectedStar.precessionRateArcsecPerOrbit}{' '}
                    <span className="text-xs text-slate-400">″ / rev</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Schwarzschild Rosette
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">
                    Dilation Factor γ
                  </span>
                  <span className="text-base font-bold text-emerald-400 tabular-nums">
                    {selectedStar.timeDilationGamma}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Lorentz + gravitational
                  </span>
                </div>
              </div>

              {/* Physical Context Note */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 leading-relaxed font-light">
                <span className="text-blue-300 font-semibold block mb-1">
                  Nobel Prize Discovery Verification:
                </span>
                In 2018–2020, the GRAVITY interferometer tracked star S2 during its close periapsis
                passage (120 AU from Sgr A*), conclusively detecting gravitational redshift and the
                relativistic Schwarzschild periapsis advance (12.1 arcminutes per orbit), directly
                confirming Einstein's General Relativity in a supermassive field.
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950/70 border border-white/10 text-center space-y-3">
              <Focus className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-lg font-semibold text-white">No Star Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-light">
                Select a star from the catalog on the left, or click on any star particle in the 3D
                space to compute its orbital parameters.
              </p>
              <button
                onClick={() => handleSelectRealStar(1)}
                className="px-4 py-2 text-xs font-mono font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg cursor-pointer transition-colors"
              >
                Inspect Relativistic Benchmark Star S2
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
