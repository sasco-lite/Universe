import React from 'react';
import { Sliders, Grid, Sun, Zap, RefreshCw, Eye } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import {
  calculateSchwarzschildRadius,
  calculateKerrHorizonRs,
  calculateKerrErgosphereRs,
  calculateIscoRs,
  calculatePhotonSphereRs,
} from '../physics/relativity';

export const SpacetimeLabPage: React.FC = () => {
  const {
    massSolar,
    setMassSolar,
    spinParameter,
    setSpinParameter,
    diskBrightness,
    setDiskBrightness,
    diskTemperature,
    setDiskTemperature,
    dopplerBeaming,
    setDopplerBeaming,
    gravitationalLensing,
    setGravitationalLensing,
    showSpacetimeGrid,
    setShowSpacetimeGrid,
    gridDepth,
    setGridDepth,
  } = useBlackHoleStore();

  const { meters, au } = calculateSchwarzschildRadius(massSolar);
  const kerrHorizon = calculateKerrHorizonRs(spinParameter);
  const kerrErgo = calculateKerrErgosphereRs(spinParameter, Math.PI / 2);
  const isco = calculateIscoRs(spinParameter);
  const photonSpheres = calculatePhotonSphereRs(spinParameter);

  const resetToSgrA = () => {
    setMassSolar(4.154e6);
    setSpinParameter(0.85);
    setDiskBrightness(1.0);
    setDiskTemperature(8500);
    setDopplerBeaming(true);
    setGravitationalLensing(true);
    setShowSpacetimeGrid(true);
    setGridDepth(1.0);
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-36 pointer-events-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Physics Sliders */}
        <div className="lg:col-span-7 pointer-events-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>General Relativistic Spacetime Laboratory</span>
              </div>
              <h2 className="text-3xl font-bold font-display text-white">
                Metric Parameters
              </h2>
            </div>

            <button
              onClick={resetToSgrA}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors"
              title="Reset parameters to calibrated Sgr A* values"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Sgr A*</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-2xl space-y-6">
            {/* Slider 1: Black Hole Mass M */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Central Mass M</span>
                <span className="text-amber-400 font-bold tabular-nums">
                  {(massSolar / 1e6).toFixed(2)} × 10⁶ M☉
                </span>
              </div>
              <input
                type="range"
                min={1.0e6}
                max={25.0e6}
                step={0.1e6}
                value={massSolar}
                onChange={(e) => setMassSolar(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1.0M M☉ (Compact SMBH)</span>
                <span>4.15M (Sgr A*)</span>
                <span>25.0M M☉ (Supergiant)</span>
              </div>
            </div>

            {/* Slider 2: Kerr Spin Parameter a */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">
                  Dimensionless Kerr Spin a = J / (Mc)
                </span>
                <span className="text-blue-400 font-bold tabular-nums">
                  {spinParameter >= 0 ? `+${spinParameter.toFixed(3)}` : spinParameter.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min={-0.998}
                max={0.998}
                step={0.01}
                value={spinParameter}
                onChange={(e) => setSpinParameter(parseFloat(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-0.998 (Max Retrograde)</span>
                <span>0.0 (Schwarzschild)</span>
                <span>+0.998 (Max Prograde)</span>
              </div>
            </div>

            {/* Slider 3: Accretion Disk Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Inner Disk Peak Temperature</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  {diskTemperature.toLocaleString()} K
                </span>
              </div>
              <input
                type="range"
                min={2500}
                max={25000}
                step={250}
                value={diskTemperature}
                onChange={(e) => setDiskTemperature(parseFloat(e.target.value))}
                className="w-full accent-amber-300 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>2,500 K (Infrared Warm)</span>
                <span>8,500 K (Synchrotron Gold)</span>
                <span>25,000 K (Ultra-Hot Cobalt)</span>
              </div>
            </div>

            {/* Toggles Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setDopplerBeaming(!dopplerBeaming)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  dopplerBeaming
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold">Doppler Beaming</span>
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] block opacity-80 font-light">
                  Boost approaching side (δ⁴)
                </span>
              </button>

              <button
                onClick={() => setGravitationalLensing(!gravitationalLensing)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  gravitationalLensing
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold">Lensing Rays</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] block opacity-80 font-light">
                  Geodesic light deflection
                </span>
              </button>

              <button
                onClick={() => setShowSpacetimeGrid(!showSpacetimeGrid)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  showSpacetimeGrid
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold">Flamm 3D Grid</span>
                  <Grid className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] block opacity-80 font-light">
                  Spacetime embedding
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculated Kerr Metric Elements */}
        <div className="lg:col-span-5 pointer-events-auto space-y-4">
          <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-display text-white border-b border-white/10 pb-3">
              Calculated Metric Radii
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-black/50 border border-white/10">
                <div>
                  <span className="text-slate-300 block font-semibold">Event Horizon r₊</span>
                  <span className="text-[10px] text-slate-500">M(1 + √(1 - a²))</span>
                </div>
                <span className="text-base font-bold text-amber-400 tabular-nums">
                  {kerrHorizon.toFixed(3)} rs
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-black/50 border border-white/10">
                <div>
                  <span className="text-slate-300 block font-semibold">Equatorial Ergosphere r_E</span>
                  <span className="text-[10px] text-slate-500">Static limit at equator</span>
                </div>
                <span className="text-base font-bold text-blue-400 tabular-nums">
                  {kerrErgo.toFixed(3)} rs
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-black/50 border border-white/10">
                <div>
                  <span className="text-slate-300 block font-semibold">Stable Orbit Boundary ISCO</span>
                  <span className="text-[10px] text-slate-500">Accretion inner edge</span>
                </div>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {isco.toFixed(3)} rs
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-black/50 border border-white/10">
                <div>
                  <span className="text-slate-300 block font-semibold">Photon Orbit r_ph</span>
                  <span className="text-[10px] text-slate-500">Light ring radius</span>
                </div>
                <span className="text-base font-bold text-purple-400 tabular-nums">
                  {photonSpheres.mean.toFixed(3)} rs
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 leading-relaxed font-light">
              <span className="text-amber-300 font-semibold block mb-1">
                Kerr Metric Distortion Note:
              </span>
              As spin a approaches 1, the event horizon contracts while the ISCO moves from 3.0 rs
              all the way in to 0.5 rs. This allows the accretion disk to orbit dramatically closer
              and hotter, converting up to 42% of infalling mass directly into radiant energy
              (compared to only 5.7% for a non-rotating Schwarzschild hole).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
