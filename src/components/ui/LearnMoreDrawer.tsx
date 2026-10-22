import React from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';

export const LearnMoreDrawer: React.FC = () => {
  const { activeLearnMore, setActiveLearnMore, currentPage } = useBlackHoleStore();

  if (!activeLearnMore) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 border-l border-white/15 backdrop-blur-xl shadow-2xl p-6 overflow-y-auto pointer-events-auto transition-transform duration-300 ease-out font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Scientific Deep Dive</span>
        </div>
        <button
          onClick={() => setActiveLearnMore(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-light">
        <div>
          <h4 className="font-semibold text-white font-mono text-sm mb-1">
            General Relativity & Sgr A*
          </h4>
          <p>
            Sagittarius A* is the compact astronomical radio source at the Galactic Center of the
            Milky Way. High-precision astrometric measurements by the UCLA Galactic Center Group
            and Max Planck Institute have established a mass of 4.154 million solar masses enclosed
            within an area smaller than the orbit of Mercury.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white font-mono text-sm mb-1">
            Kerr Metric & Frame Dragging
          </h4>
          <p>
            Because Sagittarius A* possesses rotational angular momentum, the spacetime surrounding
            it is described by the exact Kerr metric in Boyer-Lindquist coordinates. Inertial
            frames are continuously dragged in the direction of rotation (the Lense-Thirring
            effect), producing an ergosphere outside the horizon where particles can extract
            rotational kinetic energy via the Penrose mechanism.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white font-mono text-sm mb-1">
            Doppler Beaming & Gravitational Lensing
          </h4>
          <p>
            The accretion flow orbiting in the equatorial plane reaches relativistic speeds up to
            half the speed of light. Special relativistic beaming boosts the apparent luminosity of
            the gas flowing toward the observer by the Lorentz factor power δ⁴, while gravitational
            redshift dims and cools radiation emerging from the deep potential well.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white font-mono text-sm mb-1">
            S-Cluster Star Dynamics
          </h4>
          <p>
            Stars orbiting in the S-cluster (such as S2 and S4714) follow non-closed rosette paths.
            The Schwarzschild periapsis precession of 12.1 arcminutes per orbit was verified by the
            VLTI GRAVITY instrument in 2020, matching general relativistic predictions with extreme
            precision.
          </p>
        </div>
      </div>
    </div>
  );
};
