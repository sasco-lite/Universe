import React, { useState } from 'react';
import { ChevronRight, Eye, BookOpen } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import {
  calculateKerrHorizonRs,
  calculateKerrErgosphereRs,
  calculatePhotonSphereRs,
  calculateIscoRs,
} from '../physics/relativity';

const ANATOMY_ZONES = [
  {
    id: 'horizon',
    name: 'Event Horizon',
    shortLabel: 'Point of no return',
    radiusFormula: 'r₊ = M(1 + √(1 - a²))',
    radiusRs: 0.85,
    cameraPosition: [1.8, 0.8, 6.5] as [number, number, number],
    cameraTarget: [0, 0, 0] as [number, number, number],
    metricValue: '0.76 rs',
  },
  {
    id: 'ergosphere',
    name: 'Ergosphere',
    shortLabel: 'Spacetime dragged faster than light',
    radiusFormula: 'r_E(θ) = M(1 + √(1 - a²cos²θ))',
    radiusRs: 1.0,
    cameraPosition: [3.5, 2.0, 9.0] as [number, number, number],
    cameraTarget: [0, 0, 0] as [number, number, number],
    metricValue: '1.00 rs',
  },
  {
    id: 'photonsphere',
    name: 'Photon Sphere',
    shortLabel: 'Trapped light rings & mirages',
    radiusFormula: 'r_ph = 1.5 rs',
    radiusRs: 1.5,
    cameraPosition: [4.8, 2.8, 11.5] as [number, number, number],
    cameraTarget: [0, 0, 0] as [number, number, number],
    metricValue: '1.42 rs',
  },
  {
    id: 'isco',
    name: 'ISCO Disk Edge',
    shortLabel: 'Innermost stable circular orbit',
    radiusFormula: 'r_isco(a)',
    radiusRs: 2.2,
    cameraPosition: [6.5, 3.5, 14.0] as [number, number, number],
    cameraTarget: [0, 0, 0] as [number, number, number],
    metricValue: '2.15 rs',
  },
  {
    id: 'jets',
    name: 'Relativistic Jets',
    shortLabel: 'Blandford-Znajek magnetic outflow',
    radiusFormula: 'Blandford-Znajek',
    radiusRs: 5.0,
    cameraPosition: [0.5, 16.0, 18.0] as [number, number, number],
    cameraTarget: [0, 2.0, 0] as [number, number, number],
    metricValue: 'Bipolar',
  },
];

export const AnatomyPage: React.FC = () => {
  const { setCameraTarget, spinParameter, minimalUI, setActiveLearnMore } = useBlackHoleStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('horizon');

  if (minimalUI) return null;

  const activeZone = ANATOMY_ZONES.find((z) => z.id === selectedZoneId) || ANATOMY_ZONES[0];

  const handleSelectZone = (zone: (typeof ANATOMY_ZONES)[0]) => {
    setSelectedZoneId(zone.id);
    setCameraTarget(zone.cameraPosition, zone.cameraTarget);
  };

  const kerrHorizon = calculateKerrHorizonRs(spinParameter);
  const kerrErgo = calculateKerrErgosphereRs(spinParameter, Math.PI / 2);
  const isco = calculateIscoRs(spinParameter);
  const photonSpheres = calculatePhotonSphereRs(spinParameter);

  return (
    <div className="relative z-10 w-full min-h-screen pointer-events-none p-6 pt-20 flex items-start justify-between">
      {/* Left Peripheral Edge: Clean Zone List */}
      <div className="w-72 pointer-events-auto space-y-2">
        <div className="p-3 rounded-xl bg-slate-950/75 border border-white/10 backdrop-blur-md mb-2">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
            Relativistic Metric Zones
          </span>
          <h2 className="text-lg font-bold font-display text-white">Anatomy Tour</h2>
        </div>

        {ANATOMY_ZONES.map((zone) => {
          const isActive = selectedZoneId === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => handleSelectZone(zone)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-black font-semibold border-amber-300 shadow-lg'
                  : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span>{zone.name}</span>
                <span className={`font-mono text-[10px] ${isActive ? 'text-black' : 'text-slate-400'}`}>
                  {zone.id === 'horizon'
                    ? `${kerrHorizon.toFixed(2)} rs`
                    : zone.id === 'ergosphere'
                    ? `${kerrErgo.toFixed(2)} rs`
                    : zone.id === 'photonsphere'
                    ? `${photonSpheres.mean.toFixed(2)} rs`
                    : zone.id === 'isco'
                    ? `${isco.toFixed(2)} rs`
                    : 'Jets'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Peripheral Edge: Compact HUD Badge */}
      <div className="w-72 pointer-events-auto p-4 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-white font-bold">{activeZone.name}</span>
          <span className="text-amber-400 font-bold">{activeZone.radiusFormula}</span>
        </div>

        <p className="text-[11px] text-slate-300 font-sans font-light leading-relaxed">
          {activeZone.shortLabel}
        </p>

        <button
          onClick={() => setActiveLearnMore(true)}
          className="w-full py-1.5 rounded bg-white/10 hover:bg-white/15 text-slate-200 text-[10px] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-3 h-3 text-blue-400" />
          <span>Full Theory & Equations</span>
        </button>
      </div>
    </div>
  );
};
