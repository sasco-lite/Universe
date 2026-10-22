import React from 'react';
import { Orbit, Focus, Rocket, BookOpen } from 'lucide-react';
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
    minimalUI,
    setShowLauncherTool,
    showLauncherTool,
    setActiveLearnMore,
  } = useBlackHoleStore();

  if (minimalUI) return null;

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
    <div className="relative z-10 w-full min-h-screen pointer-events-none p-6 pt-20 flex items-start justify-between">
      {/* Left Peripheral Edge: Quick S-Star Selector */}
      <div className="w-72 pointer-events-auto space-y-2">
        <div className="p-3 rounded-xl bg-slate-950/75 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
              15,000 S-Stars
            </span>
            <button
              onClick={() => setShowLauncherTool(!showLauncherTool)}
              className="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
            >
              <Rocket className="w-2.5 h-2.5" />
              <span>Launch</span>
            </button>
          </div>
          <h2 className="text-lg font-bold font-display text-white mt-0.5">S-Star Catalog</h2>
        </div>

        <div className="space-y-1.5">
          {REAL_S_STARS.map((star) => {
            const isSelected = selectedStar?.id === star.id;
            return (
              <button
                key={star.id}
                onClick={() => handleSelectRealStar(star.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer font-mono text-xs ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-400/50 text-white shadow-lg'
                    : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: star.colorHex }}
                    />
                    <span className="font-semibold">{star.name}</span>
                  </div>
                  <span className="text-amber-400 text-[11px] tabular-nums">
                    {star.periapsisVelocityKmS.toLocaleString()} km/s
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Peripheral Edge: Compact Selected Star Telemetry */}
      {selectedStar ? (
        <div className="w-72 pointer-events-auto p-4 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="font-bold text-white text-sm">{selectedStar.name}</h3>
              <span className="text-[10px] text-slate-400 block">{selectedStar.spectralType}</span>
            </div>
            <button
              onClick={() => setFollowSelectedStar(!followSelectedStar)}
              className={`p-1.5 rounded cursor-pointer ${
                followSelectedStar
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-blue-300 hover:bg-white/15'
              }`}
              title="Track orbit with camera"
            >
              <Focus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-black/50 border border-white/10">
              <span className="text-slate-500 block text-[9px] uppercase">Semi-Major a</span>
              <span className="text-white font-bold tabular-nums">
                {selectedStar.semiMajorAxisAU} AU
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/10">
              <span className="text-slate-500 block text-[9px] uppercase">Eccentricity e</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {selectedStar.eccentricity}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/10">
              <span className="text-slate-500 block text-[9px] uppercase">Period T</span>
              <span className="text-white font-bold tabular-nums">
                {selectedStar.orbitalPeriodYears} yrs
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/10">
              <span className="text-slate-500 block text-[9px] uppercase">Precession</span>
              <span className="text-blue-400 font-bold tabular-nums">
                {selectedStar.precessionRateArcsecPerOrbit}″/rev
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-sans leading-tight">
            Schwarzschild periapsis advance confirmed by ESO GRAVITY (2020).
          </div>
        </div>
      ) : (
        <div className="w-72 pointer-events-auto p-3 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-slate-400 font-mono">
          Hover or click any star to inspect orbital elements.
        </div>
      )}
    </div>
  );
};
