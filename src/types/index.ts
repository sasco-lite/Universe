export type AppPage = 'home' | 'anatomy' | 'cluster' | 'lab' | 'dilation' | 'about';

export type CameraPreset = 'hero' | 'orbital' | 'top' | 'close' | 'equatorial' | 'polar';

export interface StarOrbitData {
  id: number;
  name: string;
  spectralType: string;
  colorHex: string;
  semiMajorAxisAU: number; // Astronomical Units
  eccentricity: number; // 0 to 0.99
  orbitalPeriodYears: number;
  inclinationDeg: number;
  periapsisVelocityKmS: number;
  apoapsisAU: number;
  periapsisAU: number;
  precessionRateArcsecPerOrbit: number;
  currentDistanceRs: number;
  currentVelocityKmS: number;
  timeDilationGamma: number;
}

export interface AnatomyZone {
  id: string;
  name: string;
  radiusFormula: string;
  radiusRs: number;
  shortLabel: string;
  description: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface GravityWellState {
  x: number;
  y: number;
  z: number;
  strength: number;
  active: boolean;
}

export interface LaunchedStar {
  id: number;
  pos: [number, number, number];
  vel: [number, number, number];
  color: string;
  size: number;
  trail: [number, number, number][];
  status: 'orbiting' | 'plunged' | 'escaped';
}
