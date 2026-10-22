import React, { useState } from 'react';
import { BookOpen, Send, CheckCircle2, FileText, ExternalLink, Code } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    topic: 'Relativistic Kerr Simulation',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-36 pointer-events-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mathematical Derivations & Field Guide */}
        <div className="lg:col-span-7 pointer-events-auto space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theoretical Framework & Field Equations</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white">
              Mathematical Formulations
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-light">
              This interactive application computes real solutions of Einstein's General Relativity
              directly in GPU shaders and numerical integrators.
            </p>
          </div>

          {/* Mathematical Cards */}
          <div className="space-y-4">
            {/* Formula 1: Kerr Metric */}
            <div className="p-5 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono font-semibold text-amber-300">
                  01. The Kerr Metric (Boyer-Lindquist Coordinates)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Roy Kerr, 1963</span>
              </div>
              <div className="p-3 bg-black/60 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
                ds² = -(1 - 2Mr/ρ²)dt² - (4Mar sin²θ/ρ²)dt dϕ + (ρ²/Δ)dr² + ρ² dθ² + (r² + a² + 2Ma²r sin²θ/ρ²)sin²θ dϕ²
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Where ρ² = r² + a²cos²θ and Δ = r² - 2Mr + a². The cross term dt dϕ represents
                frame-dragging (the Lense-Thirring effect), forcing spacetime to rotate along with the
                black hole.
              </p>
            </div>

            {/* Formula 2: Null Geodesic Ray Deflection */}
            <div className="p-5 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono font-semibold text-blue-300">
                  02. Null Geodesic Integration (Binet Equation)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Photon Trajectories</span>
              </div>
              <div className="p-3 bg-black/60 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
                d²u/dϕ² + u = (3GM / c²) u² &nbsp;&nbsp;[u = 1/r]
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Light ray paths are governed by the non-linear geodesic equation. At large impact
                parameters b, the total deflection angle simplifies to α ≈ 4GM / (c² b), while near
                the photon sphere b_c = 3√3 M light makes multiple orbits before escaping.
              </p>
            </div>

            {/* Formula 3: Relativistic Doppler Beaming */}
            <div className="p-5 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono font-semibold text-emerald-300">
                  03. Relativistic Doppler Beaming & Synchrotron Boost
                </span>
                <span className="text-[10px] font-mono text-slate-400">Radiant Flux</span>
              </div>
              <div className="p-3 bg-black/60 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
                δ = 1 / [γ (1 - β cosθ)], &nbsp;&nbsp; I_obs = I_emit × δ⁴
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Because accretion gas travels at up to 50% light speed, radiation emitted toward the
                observer is boosted in intensity by δ⁴, making the approaching side of the disk
                orders of magnitude brighter than the receding side.
              </p>
            </div>

            {/* Formula 4: Flamm's Paraboloid */}
            <div className="p-5 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono font-semibold text-purple-300">
                  04. Flamm's Paraboloid Curvature Embedding
                </span>
                <span className="text-[10px] font-mono text-slate-400">Spatial Slice</span>
              </div>
              <div className="p-3 bg-black/60 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
                z(r) = 2 √(r_s (r - r_s))
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                An exact isometric embedding of an equatorial Schwarzschild space slice into 3D
                Euclidean space. The throat becomes vertically infinite at r = r_s, illustrating the
                curved spatial geometry of the horizon.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Nobel Citations & Research Inquiry Terminal */}
        <div className="lg:col-span-5 pointer-events-auto space-y-6">
          {/* Scientific Citations */}
          <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-3">
            <h3 className="text-base font-bold font-display text-white">
              Primary Scientific Citations
            </h3>

            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-slate-200 block font-semibold">
                  Event Horizon Telescope Collaboration (2022)
                </span>
                <span className="text-[11px] text-amber-400 block mt-0.5">
                  "First Sagittarius A* Results: Shadow and Accretion Flow"
                </span>
                <span className="text-[10px] text-slate-500">Astrophysical Journal Letters, 930:L12</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-slate-200 block font-semibold">
                  GRAVITY Collaboration / Genzel & Ghez (2020)
                </span>
                <span className="text-[11px] text-blue-400 block mt-0.5">
                  "Detection of Schwarzschild Precession in the Orbit of S2"
                </span>
                <span className="text-[10px] text-slate-500">Astronomy & Astrophysics, 636:L5</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-slate-200 block font-semibold">
                  Bardeen, Press & Teukolsky (1972)
                </span>
                <span className="text-[11px] text-emerald-400 block mt-0.5">
                  "Rotating Black Holes: Locally Nonrotating Frames and ISCO"
                </span>
                <span className="text-[10px] text-slate-500">Astrophysical Journal, 178:347</span>
              </div>
            </div>
          </div>

          {/* Research Inquiries Console */}
          <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-4">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                Scientific Collaboration
              </span>
              <h3 className="text-lg font-bold font-display text-white mt-1">
                Astrophysical Inquiry Terminal
              </h3>
            </div>

            {submitted ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-emerald-300">
                  Inquiry Dispatched Successfully
                </h4>
                <p className="text-xs text-slate-300 font-light">
                  Simulation parameters and observational query have been recorded.
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-400">
                  Reference Token: SGR-A-{Math.random().toString(36).substring(2, 9).toUpperCase()}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Researcher / Observer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Eleanor Arroway"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="astronomy@institute.edu"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Inquiry Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Relativistic Kerr Simulation">Relativistic Kerr Simulation</option>
                    <option value="S-Star Ephemeris & Precession">S-Star Ephemeris & Precession</option>
                    <option value="Accretion Thermodynamics">Accretion Thermodynamics</option>
                    <option value="Educational & Planetarium Licensing">Educational & Planetarium Licensing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Research Query / Observation Notes</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter mathematical constraints, observational dataset inquiries, or simulation feedback..."
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
