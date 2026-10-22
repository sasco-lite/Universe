import React, { useState } from 'react';
import { BookOpen, Send, CheckCircle2 } from 'lucide-react';
import { useBlackHoleStore } from '../store/useBlackHoleStore';
import { triggerHaptic } from '../audio/BlackHoleAudio';

export const AboutPage: React.FC = () => {
  const { minimalUI } = useBlackHoleStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  if (minimalUI) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    triggerHaptic(25);
    setSubmitted(true);
  };

  return (
    <div className="relative z-10 w-full min-h-screen pointer-events-none p-6 pt-20 flex flex-col lg:flex-row items-start justify-between gap-6">
      {/* Left Peripheral Edge: Key Equations */}
      <div className="w-full lg:w-96 pointer-events-auto p-4 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-semibold border-b border-white/10 pb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Core General Relativity Formulas</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="p-2 rounded bg-black/50 border border-white/10">
            <span className="text-slate-400 block text-[9px] uppercase">Null Geodesic Deflection</span>
            <span className="text-amber-300 font-semibold">d²u/dϕ² + u = (3GM/c²) u²</span>
          </div>

          <div className="p-2 rounded bg-black/50 border border-white/10">
            <span className="text-slate-400 block text-[9px] uppercase">Doppler Beaming Boost</span>
            <span className="text-blue-300 font-semibold">I_obs = I_emit × [γ(1 - β cosθ)]⁻⁴</span>
          </div>

          <div className="p-2 rounded bg-black/50 border border-white/10">
            <span className="text-slate-400 block text-[9px] uppercase">Flamm Curvature Funnel</span>
            <span className="text-emerald-300 font-semibold">z(r) = -2 √(rₛ (r - rₛ))</span>
          </div>

          <div className="p-2 rounded bg-black/50 border border-white/10">
            <span className="text-slate-400 block text-[9px] uppercase">S-Star Rosette Precession</span>
            <span className="text-purple-300 font-semibold">Δϕ = 6πGM / [c² a (1 - e²)]</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 pt-1 border-t border-white/10">
          Nobel Prize in Physics 2020: Reinhard Genzel, Andrea Ghez & Roger Penrose.
        </div>
      </div>

      {/* Right Peripheral Edge: Inquiry Console */}
      <div className="w-full lg:w-80 pointer-events-auto p-4 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-md space-y-3 font-mono text-xs">
        <h3 className="font-bold text-white border-b border-white/10 pb-2">Astrophysics Inquiry</h3>

        {submitted ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <span className="text-emerald-300 font-bold block">Inquiry Dispatched</span>
            <span className="text-[10px] text-slate-400">Ref: SGR-A-{Math.random().toString(36).substring(2, 7).toUpperCase()}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Researcher Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Eleanor Arroway"
                className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Institutional Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="astronomy@institute.edu"
                className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Note</label>
              <textarea
                rows={2}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Query constraints or dataset notes..."
                className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xs font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Send Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
