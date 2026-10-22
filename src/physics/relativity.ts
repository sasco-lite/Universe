/**
 * Exact Relativistic Equations and Physical Constants
 * Governs Sagittarius A* black hole simulation, Kerr spacetime metrics,
 * accretion thermodynamics, and S-cluster stellar dynamics.
 */

export const CONSTANTS = {
  G: 6.67430e-11, // m^3 kg^-1 s^-2
  C: 299792458, // m/s
  SOLAR_MASS_KG: 1.98847e30, // kg
  SGR_A_MASS_SOLAR: 4.154e6, // M_sun
  AU_METERS: 1.495978707e11, // m
  LIGHT_YEAR_METERS: 9.4607e15, // m
};

/**
 * Calculates physical Schwarzschild radius in meters and Astronomical Units.
 * r_s = 2GM / c^2
 */
export function calculateSchwarzschildRadius(massSolar: number): { meters: number; au: number } {
  const massKg = massSolar * CONSTANTS.SOLAR_MASS_KG;
  const meters = (2 * CONSTANTS.G * massKg) / (CONSTANTS.C * CONSTANTS.C);
  const au = meters / CONSTANTS.AU_METERS;
  return { meters, au };
}

/**
 * Kerr Event Horizon Radius r_+ (in units of r_s):
 * r_+ = M (1 + sqrt(1 - a^2)) = 0.5 * r_s * (1 + sqrt(1 - a^2))
 * where a = J / (M * c) in dimensionless range [-0.998, 0.998]
 */
export function calculateKerrHorizonRs(spinA: number): number {
  const clampedA = Math.max(-0.998, Math.min(0.998, spinA));
  const innerSqrt = Math.sqrt(Math.max(0, 1 - clampedA * clampedA));
  return 0.5 * (1 + innerSqrt); // in units of r_s
}

/**
 * Kerr Ergosphere Radius r_E(theta) at colatitude theta (in units of r_s):
 * r_E(theta) = 0.5 * r_s * (1 + sqrt(1 - a^2 * cos^2(theta)))
 */
export function calculateKerrErgosphereRs(spinA: number, thetaRad: number): number {
  const clampedA = Math.max(-0.998, Math.min(0.998, spinA));
  const cosTheta = Math.cos(thetaRad);
  const innerSqrt = Math.sqrt(Math.max(0, 1 - clampedA * clampedA * cosTheta * cosTheta));
  return 0.5 * (1 + innerSqrt);
}

/**
 * Photon Sphere radius in units of r_s.
 * For Schwarzschild (a=0), r_ph = 1.5 r_s.
 * For Kerr, differs for prograde and retrograde light rays.
 */
export function calculatePhotonSphereRs(spinA: number): { prograde: number; retrograde: number; mean: number } {
  const a = Math.max(-0.998, Math.min(0.998, spinA));
  const thetaPro = Math.acos(-a) / 3;
  const thetaRetro = Math.acos(a) / 3;

  // In units of M = r_s / 2:
  const rProM = 2 * (1 + Math.cos(2 * thetaPro));
  const rRetroM = 2 * (1 + Math.cos(2 * thetaRetro));

  const prograde = rProM * 0.5; // in r_s
  const retrograde = rRetroM * 0.5;
  return { prograde, retrograde, mean: (prograde + retrograde) * 0.5 };
}

/**
 * Innermost Stable Circular Orbit (ISCO) in units of r_s (Bardeen, Press & Teukolsky 1972)
 * For Schwarzschild: r_isco = 3.0 r_s (6M).
 * For maximal prograde Kerr (a=1): r_isco = 0.5 r_s (1M).
 * For maximal retrograde Kerr (a=-1): r_isco = 4.5 r_s (9M).
 */
export function calculateIscoRs(spinA: number): number {
  const a = Math.max(-0.998, Math.min(0.998, spinA));
  const sign = a >= 0 ? 1 : -1;
  const absA = Math.abs(a);

  const z1 = 1 + Math.cbrt(1 - absA * absA) * (Math.cbrt(1 + absA) + Math.cbrt(1 - absA));
  const z2 = Math.sqrt(3 * absA * absA + z1 * z1);
  const term = Math.sqrt(Math.max(0, (3 - z1) * (3 + z1 + 2 * z2)));

  const rIscoM = 3 + z2 - sign * term;
  return rIscoM * 0.5; // in units of r_s
}

/**
 * Gravitational Time Dilation / Redshift factor:
 * d\tau / dt = sqrt(1 - r_s / r)
 * Evaluates proper time passage rate for static observer at distance r (in r_s).
 */
export function calculateTimeDilationRate(rOverRs: number): number {
  if (rOverRs <= 1.0) return 0.0;
  return Math.sqrt(1 - 1.0 / rOverRs);
}

/**
 * Relativistic Doppler beaming boost factor \delta^4
 * \delta = 1 / (\gamma * (1 - \beta * cos(\theta)))
 * \beta = sqrt(r_s / (2r)) for Keplerian-relativistic circular speed
 */
export function calculateDopplerBoost(rOverRs: number, cosTheta: number): number {
  if (rOverRs <= 1.0) return 0.0;
  const beta = Math.min(0.95, Math.sqrt(0.5 / rOverRs));
  const gamma = 1.0 / Math.sqrt(Math.max(0.001, 1.0 - beta * beta));
  const delta = 1.0 / (gamma * (1.0 - beta * cosTheta));
  return Math.pow(Math.max(0.01, delta), 3.5);
}

/**
 * Flamm's Paraboloid embedding height z(r) = 2 * sqrt(r_s * (r - r_s))
 * Spatial geometry of equatorial Schwarzschild spacetime slice.
 */
export function calculateFlammHeight(rOverRs: number): number {
  if (rOverRs <= 1.0) return 0.0;
  return 2.0 * Math.sqrt(rOverRs - 1.0);
}

/**
 * Relativistic Precession (Rosette orbit shift per revolution in arcseconds):
 * \Delta\phi = 6\pi GM / (c^2 a (1 - e^2))
 */
export function calculateGeneralRelativisticPrecession(
  semiMajorAxisAU: number,
  eccentricity: number,
  massSolar: number
): number {
  const { au: rsAU } = calculateSchwarzschildRadius(massSolar);
  const denom = semiMajorAxisAU * (1 - eccentricity * eccentricity);
  if (denom <= 0) return 0;
  const deltaPhiRad = (3 * Math.PI * rsAU) / denom;
  const arcSecPerRad = (180 / Math.PI) * 3600;
  return deltaPhiRad * arcSecPerRad;
}

/**
 * Convert Blackbody temperature in Kelvin to RGB hex color representation
 * based on Planckian locus approximations.
 */
export function blackbodyKelvinToRGB(kelvin: number): { r: number; g: number; b: number; hex: string } {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.min(255, Math.max(0, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.min(255, Math.max(0, g));
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.min(255, Math.max(0, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.min(255, Math.max(0, b));
  }

  const red = Math.round(r);
  const green = Math.round(g);
  const blue = Math.round(b);
  const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;

  return { r: red / 255, g: green / 255, b: blue / 255, hex };
}
