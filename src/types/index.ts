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
  description: string;
  physicsDetails: string;
  keyPhenomenon: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface SimulationParams {
  massSolar: number; // e.g. 4.15 million M_sun
  spinParameter: number; // Dimensionless a in [-0.998, 0.998]
  diskBrightness: number;
  diskTemperature: number;
  dopplerBeaming: boolean;
  gravitationalLensing: boolean;
  showSpacetimeGrid: boolean;
  gridDepth: number;
  simulationSpeed: number;
  isPaused: boolean;
  starCount: number;
}
