import React from 'react';
import { Clock, Radio, RotateCcw, ArrowDownRight, Compass, Volume2 } from 'lucide-react';
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
    audioEnabled,
    toggleAudio,
  } = useBlackHoleStore();

  const dilationRate = calculateTimeDilationRate(probeDistanceRs);

  // Formatter for seconds to minutes:seconds.milliseconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${parseFloat(secs) < 10 ? '0' : ''}${secs}s`;
  };

  const jumpToProbeView = () => {
    // Position camera just above probe altitude
    setCameraTarget([probeDistanceRs * 0.9, 1.2, probeDistanceRs * 1.1], [0, 0, 0]);
  };

  // Gravitational redshift wavelength shift: lambda_obs = lambda_emit / sqrt(1 - rs/r)
  const baseWavelengthNm = 450; // Cyan blue
  const shiftedWavelengthNm =
    dilationRate > 0.001 ? Math.min(2400, Math.round(baseWavelengthNm / dilationRate)) : 9999;

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-36 pointer-events-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Probe Experiment Console */}
        <div className="lg:col-span-7 pointer-events-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>General Relativistic Time Dilation</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white">
              Gravitational Clock Divergence
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-light">
              According to Einstein's field equations, time passes at different rates depending on
              gravitational potential. As an observer nears the Schwarzschild horizon, proper time
              slows relative to coordinate time at infinity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-2xl space-y-6">
            {/* Clocks Comparison Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clock 1: Observer at Infinity */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>Distant Observer (r → ∞)</span>
                  <span className="text-[10px] text-slate-500">Coordinate Time t</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                  {formatTime(infinityTime)}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Rate: 1.0000 s/s (Standard Baseline)
                </div>
              </div>

              {/* Clock 2: Descent Probe near Horizon */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2">
                  <span>Descent Probe (r = {probeDistanceRs.toFixed(2)} rs)</span>
                  <span className="text-[10px] text-amber-400/80">Proper Time τ</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300 tabular-nums">
                  {formatTime(probeProperTime)}
                </div>
                <div className="text-[11px] font-mono text-amber-400 mt-1">
                  Rate: {dilationRate.toFixed(4)} s/s ({(dilationRate * 100).toFixed(1)}% of normal)
                </div>
              </div>
            </div>

            {/* Probe Altitude Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">
                  Probe Orbital Distance r / r<sub>s</sub>
                </span>
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
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1.05 rs (Just above Horizon)</span>
                <span>1.5 rs (Photon Sphere)</span>
                <span>3.0 rs (ISCO)</span>
                <span>15.0 rs (Weak Field)</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                onClick={jumpToProbeView}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg cursor-pointer transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Fly Camera to Probe Altitude</span>
              </button>

              <button
                onClick={resetDilationExperiment}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Clocks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Relativistic Shift & Audio Physics */}
        <div className="lg:col-span-5 pointer-events-auto space-y-4">
          <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-2xl space-y-5">
            <h3 className="text-lg font-bold font-display text-white border-b border-white/10 pb-3">
              Gravitational Redshift Spectrum
            </h3>

            {/* Wavelength Spectrum Meter */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Observed Wavelength λ_obs</span>
                  <span className="text-amber-400 font-bold tabular-nums">
                    {shiftedWavelengthNm > 2000 ? '>2000 nm (Infrared)' : `${shiftedWavelengthNm} nm`}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative mt-2">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, (1 - dilationRate) * 100)}%`,
                      background: 'linear-gradient(to right, #60a5fa, #f59e0b, #ef4444, #7f1d1d)',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                  <span>450 nm (Blue)</span>
                  <span>700 nm (Red)</span>
                  <span>1400 nm (Infrared)</span>
                </div>
              </div>

              {/* Exact Formula Display */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                <span className="text-slate-400 text-[10px] uppercase block mb-1">
                  Schwarzschild Time Dilation Formula:
                </span>
                <span className="text-amber-300 font-semibold text-sm">
                  dτ / dt = √(1 - r_s / r)
                </span>
                <p className="text-[11px] text-slate-400 font-sans mt-1.5 leading-relaxed font-light">
                  When r = r_s, dτ/dt = 0. From the perspective of an external observer at
                  infinity, an object falling into the black hole appears to slow down exponentially
                  and asymptotically freeze on the event horizon, its light redshifting to infinite
                  wavelength.
                </p>
              </div>

              {/* Acoustic Dilation Synthesizer Card */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-semibold text-amber-300">
                      Acoustic Dilation Synthesizer
                    </span>
                  </div>
                  <button
                    onClick={toggleAudio}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400 text-black font-medium hover:bg-amber-300 cursor-pointer"
                  >
                    {audioEnabled ? 'Active' : 'Unmute'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed font-light">
                  The Web Audio engine continually modulates oscillator frequencies and filter
                  harmonics based on current observer time dilation ({(dilationRate * 100).toFixed(0)}% base pitch).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
