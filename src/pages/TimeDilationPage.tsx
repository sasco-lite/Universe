import React from 'react';
import { Clock, RotateCcw, Compass } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import { calculateTimeDilationRate } from '../physics/relativity';

export const TimeDilationPage: React.FC = () => {
  const {
    probeDistanceRs,
    setProbeDistanceRs,
    infinityTime,
    probeProperTime,
    resetDilationExperiment,
    setCameraTarget,
    minimalUI,
  } = useBlackHoleStore();

  if (minimalUI) return null;

  const dilationRate = calculateTimeDilationRate(probeDistanceRs);

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = (s % 60).toFixed(1);
    return `${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
  };

  const baseWavelength = 450;
  const shiftedWavelength =
    dilationRate > 0.001 ? Math.min(2400, Math.round(baseWavelength / dilationRate)) : 9999;

  return (
    <div className="relative z-10 w-full min-h-screen pointer-events-none p-6 pt-20 flex flex-col lg:flex-row items-start justify-between gap-6">
      {/* Left Peripheral Edge: Dual Clocks */}
      <div className="w-full lg:w-80 pointer-events-auto p-4 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Gravitational Dilation</span>
          </div>
          <button
            onClick={resetDilationExperiment}
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Dual Clocks */}
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-black/60 border border-white/10 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Observer at Infinity</span>
              <span className="text-xl font-bold text-white tabular-nums">
                {formatSecs(infinityTime)}s
              </span>
            </div>
            <span className="text-[10px] text-slate-400">1.000 s/s</span>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-400 uppercase block">
                Probe at {probeDistanceRs.toFixed(1)} rs
              </span>
              <span className="text-xl font-bold text-amber-300 tabular-nums">
                {formatSecs(probeProperTime)}s
              </span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold tabular-nums">
              {(dilationRate * 100).toFixed(0)}% rate
            </span>
          </div>
        </div>

        {/* Altitude Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Probe Altitude</span>
            <span className="text-amber-400 font-bold tabular-nums">
              {probeDistanceRs.toFixed(2)} rs
            </span>
          </div>
          <input
            type="range"
            min={1.05}
            max={15.0}
            step={0.05}
            value={probeDistanceRs}
            onChange={(e) => setProbeDistanceRs(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        <button
          onClick={() =>
            setCameraTarget([probeDistanceRs * 0.9, 1.2, probeDistanceRs * 1.1], [0, 0, 0])
          }
          className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Fly to Probe View</span>
        </button>
      </div>

      {/* Right Peripheral Edge: Redshift Meter */}
      <div className="w-full lg:w-72 pointer-events-auto p-4 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-white font-semibold">Redshift λ_obs</span>
          <span className="text-amber-400 font-bold tabular-nums">
            {shiftedWavelength > 2000 ? '>2000 nm' : `${shiftedWavelength} nm`}
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${Math.min(100, (1 - dilationRate) * 100)}%`,
              background: 'linear-gradient(to right, #60a5fa, #f59e0b, #ef4444)',
            }}
          />
        </div>

        <div className="text-[10px] text-slate-400 leading-tight font-sans">
          Formula: dτ/dt = √(1 - rₛ / r). Clocks freeze at r = rₛ for external observers.
        </div>
      </div>
    </div>
  );
};
