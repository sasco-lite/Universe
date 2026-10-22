import React, { useState, useRef } from 'react';
import { Rocket, RotateCcw, X, Target, Zap } from 'lucide-react';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import { triggerHaptic } from '../../audio/BlackHoleAudio';

export const StarLauncherModal: React.FC = () => {
  const {
    showLauncherTool,
    setShowLauncherTool,
    launchStar,
    launchedStars,
    clearLaunchedStars,
  } = useBlackHoleStore();

  const [altitude, setAltitude] = useState(16.0); // r / rs
  const [speed, setSpeed] = useState(1.4); // orbital speed factor
  const [angleDeg, setAngleDeg] = useState(90); // launch angle degrees

  if (!showLauncherTool) return null;

  const handleFireStar = () => {
    triggerHaptic(30);
    const rad = (angleDeg * Math.PI) / 180;
    // Initial position on equatorial disk plane
    const px = Math.cos(rad) * altitude;
    const py = (Math.random() - 0.5) * 1.5;
    const pz = Math.sin(rad) * altitude;

    // Tangent orbital velocity vector
    const vx = -Math.sin(rad) * speed * 2.8;
    const vy = (Math.random() - 0.5) * 0.4;
    const vz = Math.cos(rad) * speed * 2.8;

    launchStar([px, py, pz], [vx, vy, vz]);
  };

  const activeCount = launchedStars.filter((s) => s.status === 'orbiting').length;
  const plungedCount = launchedStars.filter((s) => s.status === 'plunged').length;
  const escapedCount = launchedStars.filter((s) => s.status === 'escaped').length;

  return (
    <div className="fixed bottom-24 right-6 z-40 w-80 p-4 rounded-xl bg-slate-950/90 border border-white/15 backdrop-blur-md shadow-2xl pointer-events-auto space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <Rocket className="w-4 h-4" />
          <span>Orbital Slingshot</span>
        </div>
        <button
          onClick={() => setShowLauncherTool(false)}
          className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sliders for launch parameters */}
      <div className="space-y-2 text-[11px]">
        <div>
          <div className="flex justify-between text-slate-300">
            <span>Altitude r₀</span>
            <span className="text-amber-400 tabular-nums">{altitude.toFixed(1)} rs</span>
          </div>
          <input
            type="range"
            min={4.0}
            max={32.0}
            step={0.5}
            value={altitude}
            onChange={(e) => setAltitude(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300">
            <span>Velocity v₀</span>
            <span className="text-blue-400 tabular-nums">{speed.toFixed(2)}x circular</span>
          </div>
          <input
            type="range"
            min={0.3}
            max={3.0}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-blue-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300">
            <span>Heading θ</span>
            <span className="text-purple-400 tabular-nums">{angleDeg}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={angleDeg}
            onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
            className="w-full accent-purple-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Fire Button */}
      <button
        onClick={handleFireStar}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs cursor-pointer transition-colors shadow-lg"
      >
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span>Inject Star into Spacetime</span>
      </button>

      {/* Stats summary */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
        <div>
          <span>Orbiting: </span>
          <span className="text-blue-300 font-bold tabular-nums">{activeCount}</span>
        </div>
        <div>
          <span>Plunged: </span>
          <span className="text-rose-400 font-bold tabular-nums">{plungedCount}</span>
        </div>
        <div>
          <span>Escaped: </span>
          <span className="text-emerald-400 font-bold tabular-nums">{escapedCount}</span>
        </div>
        {launchedStars.length > 0 && (
          <button
            onClick={clearLaunchedStars}
            className="text-slate-500 hover:text-slate-300 cursor-pointer ml-1"
            title="Clear launched stars"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
