import { create } from 'zustand';
import { AppPage, CameraPreset, StarOrbitData, GravityWellState, LaunchedStar } from '../types';
import { soundEngine, triggerHaptic } from '../audio/BlackHoleAudio';

interface BlackHoleState {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;

  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;

  targetCameraPos: [number, number, number];
  targetCameraLookAt: [number, number, number];
  setCameraTarget: (pos: [number, number, number], lookAt: [number, number, number]) => void;

  // Relativistic parameters
  massSolar: number;
  setMassSolar: (mass: number) => void;

  spinParameter: number;
  setSpinParameter: (spin: number) => void;

  diskBrightness: number;
  setDiskBrightness: (brightness: number) => void;

  diskTemperature: number;
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
  hoveredStar: StarOrbitData | null;
  setHoveredStar: (star: StarOrbitData | null) => void;

  followSelectedStar: boolean;
  setFollowSelectedStar: (follow: boolean) => void;

  // Interactive transient gravity well
  gravityWell: GravityWellState;
  setGravityWell: (gw: GravityWellState) => void;

  // Star Launcher
  showLauncherTool: boolean;
  setShowLauncherTool: (show: boolean) => void;
  launchedStars: LaunchedStar[];
  launchStar: (pos: [number, number, number], vel: [number, number, number]) => void;
  updateLaunchedStars: (dt: number, rs: number) => void;
  clearLaunchedStars: () => void;

  // Time dilation experiment
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

  // UI state & Minimalism
  hudCollapsed: boolean;
  toggleHudCollapsed: () => void;
  minimalUI: boolean;
  toggleMinimalUI: () => void;

  shortcutHintVisible: boolean;
  dismissShortcutHint: () => void;

  activeLearnMore: boolean;
  setActiveLearnMore: (open: boolean) => void;

  audioEnabled: boolean;
  toggleAudio: () => void;

  qualityMode: 'high' | 'medium' | 'low';
  setQualityMode: (mode: 'high' | 'medium' | 'low') => void;

  resetSimulation: () => void;
}

export const useBlackHoleStore = create<BlackHoleState>((set, get) => ({
  currentPage: 'home',
  setCurrentPage: (page) => {
    let targetPos: [number, number, number] = [0, 6, 26];
    let targetLook: [number, number, number] = [0, 0, 0];

    switch (page) {
      case 'home':
        targetPos = [0, 6, 26];
        targetLook = [0, 0, 0];
        break;
      case 'anatomy':
        targetPos = [4, 2.5, 13];
        targetLook = [0, 0, 0];
        break;
      case 'cluster':
        targetPos = [0, 22, 45];
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

  massSolar: 4.154e6,
  setMassSolar: (mass) => set({ massSolar: mass }),

  spinParameter: 0.85,
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

  hoveredStar: null,
  setHoveredStar: (star) => {
    if (star && get().hoveredStar?.id !== star.id) {
      soundEngine.playStarHover();
    }
    set({ hoveredStar: star });
  },

  followSelectedStar: false,
  setFollowSelectedStar: (follow) => set({ followSelectedStar: follow }),

  // Transient interactive gravity well
  gravityWell: { x: 0, y: 0, z: 0, strength: 0, active: false },
  setGravityWell: (gw) => set({ gravityWell: gw }),

  // Star launcher
  showLauncherTool: false,
  setShowLauncherTool: (show) => set({ showLauncherTool: show }),
  launchedStars: [],
  launchStar: (pos, vel) => {
    soundEngine.playStarLaunch();
    const newStar: LaunchedStar = {
      id: Date.now(),
      pos,
      vel,
      color: '#38BDF8',
      size: 4.5,
      trail: [pos],
      status: 'orbiting',
    };
    set((s) => ({ launchedStars: [...s.launchedStars.slice(-25), newStar] }));
  },
  updateLaunchedStars: (dt, rs) => {
    set((s) => {
      const updated = s.launchedStars.map((st) => {
        if (st.status !== 'orbiting') return st;

        let [px, py, pz] = st.pos;
        let [vx, vy, vz] = st.vel;

        // Gravity pull toward central black hole: a = -GM * pos / r^3
        const rSq = px * px + py * py + pz * pz;
        const r = Math.sqrt(rSq);

        if (r < rs) {
          return { ...st, status: 'plunged' as const };
        }
        if (r > 80) {
          return { ...st, status: 'escaped' as const };
        }

        const accelMag = (3.5 * rs) / (rSq * r + 0.05);
        vx -= (px / r) * accelMag * dt;
        vy -= (py / r) * accelMag * dt;
        vz -= (pz / r) * accelMag * dt;

        px += vx * dt;
        py += vy * dt;
        pz += vz * dt;

        const newTrail = [...st.trail.slice(-45), [px, py, pz] as [number, number, number]];
        return {
          ...st,
          pos: [px, py, pz] as [number, number, number],
          vel: [vx, vy, vz] as [number, number, number],
          trail: newTrail,
        };
      });
      return { launchedStars: updated };
    });
  },
  clearLaunchedStars: () => set({ launchedStars: [] }),

  // Time dilation experiment
  probeDistanceRs: 2.2,
  setProbeDistanceRs: (dist) => set({ probeDistanceRs: Math.max(1.05, Math.min(20, dist)) }),
  probeCoordinateTime: 0,
  probeProperTime: 0,
  infinityTime: 0,
  advanceDilationTime: (dt) => {
    const { probeDistanceRs, infinityTime, probeProperTime, probeCoordinateTime } = get();
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

  minimalUI: false,
  toggleMinimalUI: () => set((s) => ({ minimalUI: !s.minimalUI })),

  shortcutHintVisible: true,
  dismissShortcutHint: () => set({ shortcutHintVisible: false }),

  activeLearnMore: false,
  setActiveLearnMore: (open) => set({ activeLearnMore: open }),

  audioEnabled: false,
  toggleAudio: () => {
    const next = !get().audioEnabled;
    soundEngine.toggle(next);
    triggerHaptic(20);
    set({ audioEnabled: next });
  },

  qualityMode: 'high',
  setQualityMode: (mode) => set({ qualityMode: mode }),

  resetSimulation: () => {
    soundEngine.playChirp(480);
    set({
      massSolar: 4.154e6,
      spinParameter: 0.85,
      diskBrightness: 1.0,
      diskTemperature: 8500,
      simulationSpeed: 1.0,
      isPaused: false,
      followSelectedStar: false,
      targetCameraPos: [0, 6, 26],
      targetCameraLookAt: [0, 0, 0],
      launchedStars: [],
      probeDistanceRs: 2.2,
    });
  },
}));
