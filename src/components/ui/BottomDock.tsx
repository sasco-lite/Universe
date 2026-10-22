import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  Compass,
  ChevronDown,
  ChevronUp,
  Focus,
  Eye,
  Sliders,
  Radio,
} from 'lucide-react';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import { CameraPreset } from '../../types';
import { calculateTimeDilationRate } from '../../physics/relativity';

const CAMERA_PRESETS: { id: CameraPreset; label: string }[] = [
  { id: 'hero', label: 'Cinematic' },
  { id: 'orbital', label: 'Orbital' },
  { id: 'top', label: 'Polar Top' },
  { id: 'close', label: 'Near Horizon' },
  { id: 'equatorial', label: 'Equator' },
];

export const BottomDock: React.FC = () => {
  const {
    hudCollapsed,
    toggleHudCollapsed,
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
  } = useBlackHoleStore();

  // Keyboard shortcut listener ('H' to toggle HUD, 'Space' to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H') {
        toggleHudCollapsed();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(!isPaused);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHudCollapsed, isPaused, setIsPaused]);

  const dilationRate = calculateTimeDilationRate(currentCameraDistanceRs);

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 ease-out pointer-events-auto ${
        hudCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
      }`}
      style={{ bottom: '16px', width: 'min(920px, 94vw)' }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={toggleHudCollapsed}
          className="flex items-center gap-1.5 px-4 py-1 text-xs font-mono text-slate-300 bg-black/80 hover:bg-slate-900 border border-white/10 rounded-t-lg backdrop-blur-md cursor-pointer transition-colors shadow-lg"
          title="Toggle HUD (Keyboard: H)"
        >
          {hudCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Show Flight Deck</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide Flight Deck [H]</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="p-3.5 bg-slate-950/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Section 1: Camera Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              View
            </span>
            {CAMERA_PRESETS.map((p) => {
              const active = cameraPreset === p.id && !followSelectedStar;
              return (
                <button
                  key={p.id}
                  onClick={() => setCameraPreset(p.id)}
                  className={`px-2.5 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white bg-white/5 border border-transparent'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Section 2: Star Tracking Affordance (if star selected) */}
          {selectedStar && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md">
              <Focus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="font-mono text-blue-200 truncate max-w-[120px]">
                {selectedStar.name}
              </span>
              <button
                onClick={() => setFollowSelectedStar(!followSelectedStar)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer transition-colors ${
                  followSelectedStar
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-300 hover:bg-white/20'
                }`}
              >
                {followSelectedStar ? 'Tracking' : 'Follow'}
              </button>
            </div>
          )}

          {/* Section 3: Simulation Playback Speed */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-md cursor-pointer transition-colors"
              title="Pause / Resume (Space)"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <span className="hidden sm:inline">Speed:</span>
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimulationSpeed(s)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    simulationSpeed === s
                      ? 'bg-amber-400/20 text-amber-300 font-semibold'
                      : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Live Relativistic Telemetry Readout */}
          <div className="hidden lg:flex items-center gap-4 text-slate-400 font-mono text-[11px] border-l border-white/10 pl-3">
            <div>
              <span className="text-slate-500">DIST: </span>
              <span className="text-slate-200 tabular-nums">{currentCameraDistanceRs}</span> r
              <sub className="text-[9px]">s</sub>
            </div>
            <div>
              <span className="text-slate-500">DILATION: </span>
              <span className="text-amber-300 tabular-nums">{(dilationRate * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500">SPIN a: </span>
              <span className="text-slate-200 tabular-nums">{spinParameter.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
