import React, { useState, useEffect } from 'react';
import { Compass, Play, Pause, RotateCcw, ArrowDown } from 'lucide-react';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import { calculateTimeDilationRate } from '../../physics/relativity';
import { triggerHaptic } from '../../audio/BlackHoleAudio';

export const DraggableProbeWidget: React.FC = () => {
  const {
    probeDistanceRs,
    setProbeDistanceRs,
    probeProperTime,
    infinityTime,
    setCameraTarget,
    isPaused,
  } = useBlackHoleStore();

  const [isFalling, setIsFalling] = useState(false);

  const dilation = calculateTimeDilationRate(probeDistanceRs);
  const infallVelocityFrac = Math.min(0.98, Math.sqrt(1.0 / Math.max(1.01, probeDistanceRs)));
  const redshiftFactor = dilation > 0.001 ? (1.0 / dilation).toFixed(2) : '∞';

  // Free fall geodesic integration loop
  useEffect(() => {
    if (!isFalling || isPaused) return;
    const interval = setInterval(() => {
      const curr = useBlackHoleStore.getState().probeDistanceRs;
      if (curr <= 1.05) {
        setIsFalling(false);
        triggerHaptic(50);
        setProbeDistanceRs(1.05);
        return;
      }
      const v = Math.sqrt(1.0 / curr) * (1.0 - 1.0 / curr);
      setProbeDistanceRs(Math.max(1.05, curr - v * 0.12));
    }, 40);
    return () => clearInterval(interval);
  }, [isFalling, isPaused, setProbeDistanceRs]);

  const handleSliderChange = (val: number) => {
    setIsFalling(false);
    setProbeDistanceRs(val);
  };

  const handleHopCamera = () => {
    triggerHaptic(20);
    setCameraTarget([probeDistanceRs * 0.85, 1.2, probeDistanceRs * 1.05], [0, 0, 0]);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-950/85 border border-white/15 backdrop-blur-md font-mono text-xs space-y-3 pointer-events-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Geodesic Infall Probe</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic(20);
              setIsFalling(!isFalling);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
              isFalling
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-amber-400 text-black hover:bg-amber-300'
            }`}
          >
            {isFalling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isFalling ? 'Halt Plunge' : 'Release Free Fall'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Drag Track */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Altitude r / rₛ</span>
          <span className="text-amber-300 font-bold tabular-nums">
            {probeDistanceRs.toFixed(2)} rs
          </span>
        </div>
        <input
          type="range"
          min={1.05}
          max={18.0}
          step={0.05}
          value={probeDistanceRs}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-slate-500">
          <span>Horizon (1.0 rs)</span>
          <span>Photon Sphere (1.5)</span>
          <span>ISCO (3.0)</span>
          <span>Deep Space (18.0)</span>
        </div>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div className="p-2 rounded bg-black/50 border border-white/10">
          <span className="text-slate-500 block text-[9px] uppercase">Clock Rate dτ/dt</span>
          <span className="text-amber-400 font-bold tabular-nums">
            {(dilation * 100).toFixed(1)}%
          </span>
        </div>
        <div className="p-2 rounded bg-black/50 border border-white/10">
          <span className="text-slate-500 block text-[9px] uppercase">Redshift 1+z</span>
          <span className="text-blue-400 font-bold tabular-nums">{redshiftFactor}x</span>
        </div>
        <div className="p-2 rounded bg-black/50 border border-white/10">
          <span className="text-slate-500 block text-[9px] uppercase">Infall Speed v/c</span>
          <span className="text-emerald-400 font-bold tabular-nums">
            {(infallVelocityFrac * 100).toFixed(1)}% c
          </span>
        </div>
        <div className="p-2 rounded bg-black/50 border border-white/10">
          <span className="text-slate-500 block text-[9px] uppercase">Proper Time τ</span>
          <span className="text-white font-bold tabular-nums">
            {probeProperTime.toFixed(1)}s
          </span>
        </div>
      </div>

      <button
        onClick={handleHopCamera}
        className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
      >
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>Align Camera with Probe</span>
      </button>
    </div>
  );
};
