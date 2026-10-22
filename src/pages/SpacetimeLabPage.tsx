import React from 'react';
import { Sliders, RefreshCw, Zap, Eye, Grid } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import { DraggableProbeWidget } from '../components/ui/DraggableProbeWidget';
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
    diskTemperature,
    setDiskTemperature,
    dopplerBeaming,
    setDopplerBeaming,
    gravitationalLensing,
    setGravitationalLensing,
    showSpacetimeGrid,
    setShowSpacetimeGrid,
    minimalUI,
  } = useBlackHoleStore();

  if (minimalUI) return null;

  const kerrHorizon = calculateKerrHorizonRs(spinParameter);
  const kerrErgo = calculateKerrErgosphereRs(spinParameter, Math.PI / 2);
  const isco = calculateIscoRs(spinParameter);
  const photonSpheres = calculatePhotonSphereRs(spinParameter);

  return (
    <div className="relative z-10 w-full min-h-screen pointer-events-none p-6 pt-20 flex flex-col lg:flex-row items-start justify-between gap-6">
      {/* Left Peripheral Edge: Compact Sliders Panel */}
      <div className="w-full lg:w-80 pointer-events-auto p-4 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Spacetime Lab</span>
          </div>
          <button
            onClick={() => {
              setMassSolar(4.154e6);
              setSpinParameter(0.85);
              setDiskTemperature(8500);
            }}
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Mass Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Mass M</span>
            <span className="text-amber-400 font-bold tabular-nums">
              {(massSolar / 1e6).toFixed(2)}M M☉
            </span>
          </div>
          <input
            type="range"
            min={1.0e6}
            max={20.0e6}
            step={0.1e6}
            value={massSolar}
            onChange={(e) => setMassSolar(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Kerr Spin Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Kerr Spin a</span>
            <span className="text-blue-400 font-bold tabular-nums">
              {spinParameter >= 0 ? `+${spinParameter.toFixed(2)}` : spinParameter.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-0.998}
            max={0.998}
            step={0.02}
            value={spinParameter}
            onChange={(e) => setSpinParameter(parseFloat(e.target.value))}
            className="w-full accent-blue-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Disk Temperature */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Temperature</span>
            <span className="text-amber-300 font-bold tabular-nums">
              {diskTemperature.toLocaleString()} K
            </span>
          </div>
          <input
            type="range"
            min={3000}
            max={22000}
            step={500}
            value={diskTemperature}
            onChange={(e) => setDiskTemperature(parseFloat(e.target.value))}
            className="w-full accent-amber-300 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10 text-[10px]">
          <button
            onClick={() => setDopplerBeaming(!dopplerBeaming)}
            className={`p-1.5 rounded border text-center cursor-pointer transition-colors ${
              dopplerBeaming
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 font-semibold'
                : 'bg-black/40 border-white/10 text-slate-400'
            }`}
          >
            Doppler δ⁴
          </button>
          <button
            onClick={() => setGravitationalLensing(!gravitationalLensing)}
            className={`p-1.5 rounded border text-center cursor-pointer transition-colors ${
              gravitationalLensing
                ? 'bg-blue-400/20 border-blue-400/40 text-blue-300 font-semibold'
                : 'bg-black/40 border-white/10 text-slate-400'
            }`}
          >
            Lensing
          </button>
          <button
            onClick={() => setShowSpacetimeGrid(!showSpacetimeGrid)}
            className={`p-1.5 rounded border text-center cursor-pointer transition-colors ${
              showSpacetimeGrid
                ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300 font-semibold'
                : 'bg-black/40 border-white/10 text-slate-400'
            }`}
          >
            3D Grid
          </button>
        </div>

        {/* Quick Radii Badges */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
          <div className="p-1.5 rounded bg-black/40 border border-white/10">
            <span className="text-slate-500 block">Horizon r₊</span>
            <span className="text-amber-400 font-bold">{kerrHorizon.toFixed(2)} rs</span>
          </div>
          <div className="p-1.5 rounded bg-black/40 border border-white/10">
            <span className="text-slate-500 block">ISCO</span>
            <span className="text-emerald-400 font-bold">{isco.toFixed(2)} rs</span>
          </div>
        </div>
      </div>

      {/* Right Peripheral Edge: Interactive Draggable Infall Probe */}
      <div className="w-full lg:w-80 pointer-events-auto">
        <DraggableProbeWidget />
      </div>
    </div>
  );
};
