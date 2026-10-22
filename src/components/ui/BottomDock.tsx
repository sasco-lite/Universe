import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Focus,
  RotateCcw,
} from 'lucide-react';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import { CameraPreset } from '../../types';
import { calculateTimeDilationRate } from '../../physics/relativity';

const CAMERA_PRESETS: { id: CameraPreset; label: string }[] = [
  { id: 'hero', label: 'Cinematic' },
  { id: 'orbital', label: 'Orbital' },
  { id: 'top', label: 'Polar' },
  { id: 'close', label: 'Horizon' },
  { id: 'equatorial', label: 'Equator' },
];

export const BottomDock: React.FC = () => {
  const {
    hudCollapsed,
    toggleHudCollapsed,
    minimalUI,
    toggleMinimalUI,
    cameraPreset,
    setCameraPreset,
    simulationSpeed,
    setSimulationSpeed,
    isPaused,
    setIsPaused,
    currentCameraDistanceRs,
    selectedStar,
    followSelectedStar,
    setFollowSelectedStar,
    spinParameter,
    resetSimulation,
    setActiveLearnMore,
    dismissShortcutHint,
  } = useBlackHoleStore();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      dismissShortcutHint();

      if (e.key === 'h' || e.key === 'H') {
        toggleMinimalUI();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(!isPaused);
      } else if (e.key === 'r' || e.key === 'R') {
        resetSimulation();
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveLearnMore(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMinimalUI, isPaused, setIsPaused, resetSimulation, setActiveLearnMore, dismissShortcutHint]);

  const dilationRate = calculateTimeDilationRate(currentCameraDistanceRs);

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-out pointer-events-auto ${
        minimalUI
          ? 'opacity-0 pointer-events-none'
          : hudCollapsed
          ? 'translate-y-[calc(100%-36px)]'
          : 'translate-y-0'
      }`}
      style={{ bottom: '14px', width: 'min(880px, 94vw)' }}
    >
      {/* Tab toggle button */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={toggleHudCollapsed}
          className="flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-mono text-slate-400 hover:text-white bg-black/80 hover:bg-slate-900 border border-white/10 rounded-t-lg backdrop-blur-md cursor-pointer transition-colors shadow-lg"
          title="Toggle Controls [H]"
        >
          {hudCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3 text-amber-400" />
              <span>Flight Deck</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 text-slate-500" />
              <span>Hide [H]</span>
            </>
          )}
        </button>
      </div>

      {/* Dock Bar */}
      <div className="p-3 bg-slate-950/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Camera Presets */}
          <div className="flex items-center gap-1">
            {CAMERA_PRESETS.map((p) => {
              const active = cameraPreset === p.id && !followSelectedStar;
              return (
                <button
                  key={p.id}
                  onClick={() => setCameraPreset(p.id)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Star Tracking */}
          {selectedStar && (
            <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-500/15 border border-blue-500/30 rounded-md">
              <Focus className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="font-mono text-blue-200 text-[11px] truncate max-w-[100px]">
                {selectedStar.name}
              </span>
              <button
                onClick={() => setFollowSelectedStar(!followSelectedStar)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
                  followSelectedStar ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-300'
                }`}
              >
                {followSelectedStar ? 'Locked' : 'Follow'}
              </button>
            </div>
          )}

          {/* Play / Speed */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded cursor-pointer"
              title="Pause [Space]"
            >
              {isPaused ? <Play className="w-3 h-3 text-amber-400 fill-current" /> : <Pause className="w-3 h-3" />}
            </button>

            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimulationSpeed(s)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    simulationSpeed === s ? 'bg-amber-400/20 text-amber-300 font-bold' : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={resetSimulation}
              className="p-1 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded cursor-pointer"
              title="Reset simulation [R]"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Real-time telemetry */}
          <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[11px] border-l border-white/10 pl-3">
            <div>
              <span className="text-slate-500">r: </span>
              <span className="text-slate-200 tabular-nums">{currentCameraDistanceRs}</span> rs
            </div>
            <div>
              <span className="text-slate-500">dτ/dt: </span>
              <span className="text-amber-300 tabular-nums">{(dilationRate * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-slate-500">a: </span>
              <span className="text-slate-200 tabular-nums">{spinParameter.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
