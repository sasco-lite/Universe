import { create } from 'zustand';
import { AppPage, CameraPreset, StarOrbitData } from '../types';
import { soundEngine } from '../audio/BlackHoleAudio';

interface BlackHoleState {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;

  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;

  targetCameraPos: [number, number, number];
  targetCameraLookAt: [number, number, number];
  setCameraTarget: (pos: [number, number, number], lookAt: [number, number, number]) => void;

  // Real relativistic parameters
  massSolar: number; // e.g. 4.154e6
  setMassSolar: (mass: number) => void;

  spinParameter: number; // Dimensionless a in [-0.998, 0.998]
  setSpinParameter: (spin: number) => void;

  diskBrightness: number;
  setDiskBrightness: (brightness: number) => void;

  diskTemperature: number; // Kelvin
  setDiskTemperature: (temp: number) => void;

  dopplerBeaming: boolean;
  setDopplerBeaming: (enabled: boolean) => void;

  gravitationalLensing: boolean;
  setGravitationalLensing: (enabled: boolean) => void;

  showSpacetimeGrid: boolean;
  setShowSpacetimeGrid: (show: boolean) => void;

  gridDepth: number;
  setGridDepth: (depth: number) => void;

  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;

  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;

  starCount: number;
  setStarCount: (count: number) => void;

  selectedStar: StarOrbitData | null;
  setSelectedStar: (star: StarOrbitData | null) => void;
  followSelectedStar: boolean;
  setFollowSelectedStar: (follow: boolean) => void;

  // Time dilation live demo
  probeDistanceRs: number;
  setProbeDistanceRs: (dist: number) => void;
  probeCoordinateTime: number;
  probeProperTime: number;
  infinityTime: number;
  advanceDilationTime: (dt: number) => void;
  resetDilationExperiment: () => void;

  // Active camera telemetry
  currentCameraDistanceRs: number;
  setCurrentCameraDistanceRs: (dist: number) => void;

  // UI state
  hudCollapsed: boolean;
  toggleHudCollapsed: () => void;

  audioEnabled: boolean;
  toggleAudio: () => void;

  qualityMode: 'high' | 'medium' | 'low';
  setQualityMode: (mode: 'high' | 'medium' | 'low') => void;
}

export const useBlackHoleStore = create<BlackHoleState>((set, get) => ({
  currentPage: 'home',
  setCurrentPage: (page) => {
    // Determine smart camera choreography based on target page
    let targetPos: [number, number, number] = [0, 8, 28];
    let targetLook: [number, number, number] = [0, 0, 0];

    switch (page) {
      case 'home':
        targetPos = [0, 6, 26];
        targetLook = [0, 0, 0];
        break;
      case 'anatomy':
        targetPos = [4, 3, 14];
        targetLook = [0, 0, 0];
        break;
      case 'cluster':
        targetPos = [0, 24, 48];
        targetLook = [0, 0, 0];
        break;
      case 'lab':
        targetPos = [0, 16, 28];
        targetLook = [0, -1, 0];
        break;
      case 'dilation':
        targetPos = [3, 1.5, 9];
        targetLook = [0, 0, 0];
        break;
      case 'about':
        targetPos = [-8, 12, 34];
        targetLook = [0, 0, 0];
        break;
    }

    soundEngine.playChirp(page === 'home' ? 520 : 640);
    set({
      currentPage: page,
      targetCameraPos: targetPos,
      targetCameraLookAt: targetLook,
      followSelectedStar: page === 'cluster' ? get().followSelectedStar : false,
      showSpacetimeGrid: page === 'lab' ? true : get().showSpacetimeGrid,
    });
  },

  cameraPreset: 'hero',
  setCameraPreset: (preset) => {
    let pos: [number, number, number] = [0, 6, 26];
    let look: [number, number, number] = [0, 0, 0];

    switch (preset) {
      case 'hero':
        pos = [0, 6, 26];
        break;
      case 'orbital':
        pos = [20, 10, 24];
        break;
      case 'top':
        pos = [0, 42, 0.01];
        break;
      case 'close':
        pos = [2, 1.2, 7.5];
        break;
      case 'equatorial':
        pos = [22, 0.2, 0];
        break;
      case 'polar':
        pos = [0, 28, 6];
        break;
    }

    soundEngine.playChirp(700);
    set({
      cameraPreset: preset,
      targetCameraPos: pos,
      targetCameraLookAt: look,
      followSelectedStar: false,
    });
  },

  targetCameraPos: [0, 6, 26],
  targetCameraLookAt: [0, 0, 0],
  setCameraTarget: (pos, lookAt) => set({ targetCameraPos: pos, targetCameraLookAt: lookAt }),

  // Relativistic parameters
  massSolar: 4.154e6, // 4.154 million solar masses
  setMassSolar: (mass) => set({ massSolar: mass }),

  spinParameter: 0.85, // Sgr A* dimensionless spin
  setSpinParameter: (spin) => set({ spinParameter: spin }),

  diskBrightness: 1.0,
  setDiskBrightness: (brightness) => set({ diskBrightness: brightness }),

  diskTemperature: 8500,
  setDiskTemperature: (temp) => set({ diskTemperature: temp }),

  dopplerBeaming: true,
  setDopplerBeaming: (enabled) => set({ dopplerBeaming: enabled }),

  gravitationalLensing: true,
  setGravitationalLensing: (enabled) => set({ gravitationalLensing: enabled }),

  showSpacetimeGrid: false,
  setShowSpacetimeGrid: (show) => set({ showSpacetimeGrid: show }),

  gridDepth: 1.0,
  setGridDepth: (depth) => set({ gridDepth: depth }),

  simulationSpeed: 1.0,
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  isPaused: false,
  setIsPaused: (paused) => set({ isPaused: paused }),

  starCount: 15000,
  setStarCount: (count) => set({ starCount: count }),

  selectedStar: null,
  setSelectedStar: (star) => {
    if (star) soundEngine.playChirp(880);
    set({ selectedStar: star });
  },

  followSelectedStar: false,
  setFollowSelectedStar: (follow) => set({ followSelectedStar: follow }),

  // Time dilation experiment
  probeDistanceRs: 2.2,
  setProbeDistanceRs: (dist) => set({ probeDistanceRs: Math.max(1.05, Math.min(20, dist)) }),
  probeCoordinateTime: 0,
  probeProperTime: 0,
  infinityTime: 0,
  advanceDilationTime: (dt) => {
    const { probeDistanceRs, infinityTime, probeProperTime, probeCoordinateTime } = get();
    // d\tau = dt_inf * sqrt(1 - 1 / r)
    const dilationRate = Math.sqrt(Math.max(0, 1 - 1.0 / probeDistanceRs));
    set({
      infinityTime: infinityTime + dt,
      probeCoordinateTime: probeCoordinateTime + dt,
      probeProperTime: probeProperTime + dt * dilationRate,
    });
  },
  resetDilationExperiment: () =>
    set({
      probeCoordinateTime: 0,
      probeProperTime: 0,
      infinityTime: 0,
    }),

  currentCameraDistanceRs: 18.0,
  setCurrentCameraDistanceRs: (dist) => set({ currentCameraDistanceRs: dist }),

  hudCollapsed: false,
  toggleHudCollapsed: () => set((s) => ({ hudCollapsed: !s.hudCollapsed })),

  audioEnabled: false,
  toggleAudio: () => {
    const next = !get().audioEnabled;
    soundEngine.toggle(next);
    set({ audioEnabled: next });
  },

  qualityMode: 'high',
  setQualityMode: (mode) => set({ qualityMode: mode }),
}));
