import React, { useState } from 'react';
import { ChevronRight, Radio, Eye, Info } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import { AnatomyZone } from '../types';
import {
  calculateKerrHorizonRs,
  calculateKerrErgosphereRs,
  calculatePhotonSphereRs,
  calculateIscoRs,
} from '../physics/relativity';

const ANATOMY_ZONES: AnatomyZone[] = [
  {
    id: 'horizon',
    name: 'Event Horizon (r₊)',
    radiusFormula: 'r₊ = M(1 + √(1 - a²))',
    radiusRs: 0.85,
    description:
      'The boundary where escape velocity equals the speed of light. Inside r₊, all light cones tilt inward toward the central singularity, making outward travel physically impossible.',
    physicsDetails:
      'For a non-rotating Schwarzschild hole (a=0), r₊ = 1.0 r_s (2M). For a rapidly spinning Kerr hole like Sgr A* (a ≈ 0.85), the horizon contracts to ≈ 0.76 r_s, increasing gravitational field density.',
    keyPhenomenon: 'Infinite gravitational time dilation (dτ/dt = 0) and total redshift to zero frequency.',
    cameraPosition: [1.8, 0.8, 6.5],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 'ergosphere',
    name: 'Ergosphere & Frame Dragging',
    radiusFormula: 'r_E(θ) = M(1 + √(1 - a²cos²θ))',
    radiusRs: 1.0,
    description:
      'An oblate ellipsoidal region bounded between the static limit and the event horizon where the Kerr metric drags the fabric of spacetime faster than light (Lense-Thirring effect).',
    physicsDetails:
      'Objects in the ergosphere cannot remain stationary relative to infinity; they are forced to co-rotate with the black hole. Energy can be extracted via the Penrose mechanism.',
    keyPhenomenon: 'Spacetime vorticity and frame dragging creating an asymmetric shadow profile.',
    cameraPosition: [3.5, 2.0, 9.0],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 'photonsphere',
    name: 'Photon Sphere & Einstein Rings',
    radiusFormula: 'r_ph = 1.5 r_s (for a = 0)',
    radiusRs: 1.5,
    description:
      'The unstable spherical shell where photons orbit the black hole in endless circles before falling into the horizon or escaping to infinity, producing the bright photon ring.',
    physicsDetails:
      'In a Kerr metric, the photon sphere splits into a prograde photon orbit closer to the horizon and a retrograde orbit farther out. Light looping around multiple times creates nested sub-rings.',
    keyPhenomenon: 'Strong gravitational lensing producing primary and secondary mirage copies of the accretion disk.',
    cameraPosition: [4.8, 2.8, 11.5],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 'isco',
    name: 'Innermost Stable Circular Orbit (ISCO)',
    radiusFormula: 'r_isco = 3.0 r_s (Schwarzschild) → 0.5 r_s (Prograde Kerr)',
    radiusRs: 2.2,
    description:
      'The innermost radius at which matter can orbit stably without plunging inward. It marks the inner edge of the viscous Shakura-Sunyaev accretion disk.',
    physicsDetails:
      'Inside the ISCO, circular orbits become dynamically unstable. Gas transitions from Keplerian viscous rotation to free-fall plunge along null and timelike geodesics into the horizon.',
    keyPhenomenon: 'Peak viscous heating and extreme relativistic orbital velocity up to 50% c.',
    cameraPosition: [6.5, 3.5, 14.0],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 'jets',
    name: 'Relativistic Polar Jets',
    radiusFormula: 'Blandford-Znajek Poynting Outflow',
    radiusRs: 5.0,
    description:
      'Highly collimated beams of ultra-relativistic magnetohydrodynamic plasma expelled along the black hole rotation axis at near light speed.',
    physicsDetails:
      'Powered by magnetic field lines anchored in the accretion disk that thread the ergosphere, extracting rotational kinetic energy from the black hole itself via the Blandford-Znajek mechanism.',
    keyPhenomenon: 'Synchrotron radiation emitting high-energy gamma rays and radio emission.',
    cameraPosition: [0.5, 16.0, 18.0],
    cameraTarget: [0, 2.0, 0],
  },
];

export const AnatomyPage: React.FC = () => {
  const { setCameraTarget, spinParameter } = useBlackHoleStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('horizon');

  const activeZone = ANATOMY_ZONES.find((z) => z.id === selectedZoneId) || ANATOMY_ZONES[0];

  const handleSelectZone = (zone: AnatomyZone) => {
    setSelectedZoneId(zone.id);
    setCameraTarget(zone.cameraPosition, zone.cameraTarget);
  };

  const kerrHorizon = calculateKerrHorizonRs(spinParameter);
  const kerrErgoEquator = calculateKerrErgosphereRs(spinParameter, Math.PI / 2);
  const isco = calculateIscoRs(spinParameter);
  const photonSpheres = calculatePhotonSphereRs(spinParameter);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-36 pointer-events-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Zone Selector Navigation */}
        <div className="lg:col-span-5 pointer-events-auto space-y-3">
          <div className="mb-4">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              Relativistic Metric Anatomy
            </span>
            <h2 className="text-3xl font-bold font-display text-white mt-1">
              Structure of Curved Spacetime
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-light">
              Select an anatomical region to navigate the 3D camera and inspect the exact general
              relativistic solutions.
            </p>
          </div>

          <div className="space-y-2">
            {ANATOMY_ZONES.map((zone) => {
              const isActive = selectedZoneId === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/70 border-white/10 hover:bg-slate-900/80 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? 'text-amber-300' : 'text-slate-200'
                      }`}
                    >
                      {zone.name}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-amber-400 translate-x-1' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                    {zone.radiusFormula}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Mathematical & Physical Inspector */}
        <div className="lg:col-span-7 pointer-events-auto">
          <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                  Active Focus Zone
                </span>
                <h3 className="text-2xl font-bold font-display text-white mt-0.5">
                  {activeZone.name}
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block uppercase">Metric Radius</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">
                  {activeZone.id === 'horizon'
                    ? `${kerrHorizon.toFixed(2)} rs`
                    : activeZone.id === 'ergosphere'
                    ? `${kerrErgoEquator.toFixed(2)} rs`
                    : activeZone.id === 'photonsphere'
                    ? `${photonSpheres.mean.toFixed(2)} rs`
                    : activeZone.id === 'isco'
                    ? `${isco.toFixed(2)} rs`
                    : '1.0–20 rs'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-300 font-light">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Physical Mechanism
                </h4>
                <p>{activeZone.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  General Relativity & Kerr Solution
                </h4>
                <p className="text-slate-300">{activeZone.physicsDetails}</p>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25">
                <h4 className="text-xs font-mono text-amber-300 font-semibold mb-1">
                  Key Relativistic Phenomenon
                </h4>
                <p className="text-xs text-amber-200/90">{activeZone.keyPhenomenon}</p>
              </div>

              {/* Exact Formula Box */}
              <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">
                  Analytical Coordinate Radius:
                </span>
                <span className="text-amber-400 font-medium">{activeZone.radiusFormula}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
