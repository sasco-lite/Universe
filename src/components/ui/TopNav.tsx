import React from 'react';
import { Volume2, VolumeX, Eye, EyeOff, Rocket, BookOpen } from 'lucide-react';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import { AppPage } from '../../types';

interface NavItem {
  id: AppPage;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Overview' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'cluster', label: 'S-Stars' },
  { id: 'lab', label: 'Spacetime Lab' },
  { id: 'dilation', label: 'Time Dilation' },
  { id: 'about', label: 'Physics' },
];

export const TopNav: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    audioEnabled,
    toggleAudio,
    currentCameraDistanceRs,
    minimalUI,
    toggleMinimalUI,
    showLauncherTool,
    setShowLauncherTool,
    setActiveLearnMore,
  } = useBlackHoleStore();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-6 px-6 py-3.5 border-b border-white/10 bg-black/65 backdrop-blur-md pointer-events-auto transition-opacity duration-300 ${
        minimalUI ? 'opacity-0 hover:opacity-100 pointer-events-none hover:pointer-events-auto' : 'opacity-100'
      }`}
    >
      {/* Zone 1: Wordmark */}
      <button
        onClick={() => setCurrentPage('home')}
        className="text-left group cursor-pointer focus:outline-none flex items-center gap-3"
      >
        <span className="text-base font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 group-hover:text-amber-400 transition-colors">
          SAGITTARIUS A*
        </span>
        <span className="hidden sm:inline-block text-xs text-slate-400 font-mono tabular-nums">
          {currentCameraDistanceRs} rs
        </span>
      </button>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-mono">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Interactive Affordances */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Star Launcher Quick Toggle */}
        <button
          onClick={() => setShowLauncherTool(!showLauncherTool)}
          className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
            showLauncherTool
              ? 'bg-amber-400 text-black border-amber-300 font-semibold'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
          title="Launch test star (Slingshot)"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Slingshot</span>
        </button>

        {/* Minimal UI Toggle */}
        <button
          onClick={toggleMinimalUI}
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
          title="Toggle Minimal UI [H]"
        >
          {minimalUI ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* Audio Synthesizer */}
        <button
          onClick={toggleAudio}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
            audioEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
          }`}
          title="Toggle Gravitational Audio"
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{audioEnabled ? 'Audio On' : 'Muted'}</span>
        </button>

        {/* Learn More Drawer Button */}
        <button
          onClick={() => setActiveLearnMore(true)}
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
          title="Scientific Deep Dive [L]"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
        </button>

        {/* Mobile select */}
        <select
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value as AppPage)}
          className="md:hidden bg-slate-900 text-white text-xs px-2 py-1 rounded border border-white/20 focus:outline-none"
        >
          {NAV_ITEMS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
