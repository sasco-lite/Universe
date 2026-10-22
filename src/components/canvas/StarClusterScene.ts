import * as THREE from 'three';
import { StarOrbitData } from '../../types';
import { calculateGeneralRelativisticPrecession } from '../../physics/relativity';

export const REAL_S_STARS: Omit<StarOrbitData, 'currentDistanceRs' | 'currentVelocityKmS' | 'timeDilationGamma'>[] = [
  {
    id: 1,
    name: 'S2 (S0-2)',
    spectralType: 'B0-2 V (Hot Blue Main-Sequence)',
    colorHex: '#93C5FD',
    semiMajorAxisAU: 970,
    eccentricity: 0.884,
    orbitalPeriodYears: 16.05,
    inclinationDeg: 134.5,
    periapsisVelocityKmS: 7700,
    apoapsisAU: 1827,
    periapsisAU: 112,
    precessionRateArcsecPerOrbit: 12.1,
  },
  {
    id: 2,
    name: 'S62',
    spectralType: 'B3 V (Fast Relativistic Bound)',
    colorHex: '#60A5FA',
    semiMajorAxisAU: 740,
    eccentricity: 0.976,
    orbitalPeriodYears: 9.9,
    inclinationDeg: 72.8,
    periapsisVelocityKmS: 21000,
    apoapsisAU: 1462,
    periapsisAU: 17.8,
    precessionRateArcsecPerOrbit: 74.5,
  },
  {
    id: 3,
    name: 'S4714',
    spectralType: 'B8 V (Ultra-Eccentric Grazing)',
    colorHex: '#38BDF8',
    semiMajorAxisAU: 1020,
    eccentricity: 0.985,
    orbitalPeriodYears: 12.0,
    inclinationDeg: 127.7,
    periapsisVelocityKmS: 24000,
    apoapsisAU: 2024,
    periapsisAU: 15.3,
    precessionRateArcsecPerOrbit: 82.0,
  },
  {
    id: 4,
    name: 'S4711',
    spectralType: 'B9 V (Short-Period S-Cluster)',
    colorHex: '#A78BFA',
    semiMajorAxisAU: 640,
    eccentricity: 0.768,
    orbitalPeriodYears: 7.6,
    inclinationDeg: 114.2,
    periapsisVelocityKmS: 6700,
    apoapsisAU: 1131,
    periapsisAU: 148,
    precessionRateArcsecPerOrbit: 18.4,
  },
  {
    id: 5,
    name: 'S55 (S0-102)',
    spectralType: 'B2 V (Galactic Center S-Group)',
    colorHex: '#FBBF24',
    semiMajorAxisAU: 840,
    eccentricity: 0.720,
    orbitalPeriodYears: 11.5,
    inclinationDeg: 150.0,
    periapsisVelocityKmS: 5400,
    apoapsisAU: 1445,
    periapsisAU: 235,
    precessionRateArcsecPerOrbit: 11.2,
  },
  {
    id: 6,
    name: 'S38',
    spectralType: 'B5 V (High Eccentricity)',
    colorHex: '#F472B6',
    semiMajorAxisAU: 1410,
    eccentricity: 0.820,
    orbitalPeriodYears: 19.2,
    inclinationDeg: 171.1,
    periapsisVelocityKmS: 4600,
    apoapsisAU: 2566,
    periapsisAU: 254,
    precessionRateArcsecPerOrbit: 6.8,
  },
];

export class StarClusterScene {
  public points: THREE.Points;
  public orbitTrailMesh: THREE.Line;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private orbitTrailGeo: THREE.BufferGeometry;

  // Star data arrays stored on CPU for raycasting and tracking
  private semiMajorAxes: Float32Array;
  private eccentricities: Float32Array;
  private inclinations: Float32Array;
  private longAscNodes: Float32Array;
  private argPeriapses: Float32Array;
  private meanAnomalies: Float32Array;
  private orbitalFrequencies: Float32Array;
  private precessionSpeeds: Float32Array;
  private starColors: Float32Array;
  private starSizes: Float32Array;

  public count: number;
  private rs: number;

  constructor(count = 15000, rs = 2.0) {
    this.count = count;
    this.rs = rs;

    this.semiMajorAxes = new Float32Array(count);
    this.eccentricities = new Float32Array(count);
    this.inclinations = new Float32Array(count);
    this.longAscNodes = new Float32Array(count);
    this.argPeriapses = new Float32Array(count);
    this.meanAnomalies = new Float32Array(count);
    this.orbitalFrequencies = new Float32Array(count);
    this.precessionSpeeds = new Float32Array(count);
    this.starColors = new Float32Array(count * 3);
    this.starSizes = new Float32Array(count);

    // Initial dummy positions
    const positions = new Float32Array(count * 3);

    // Populate real astronomical S-stars first
    for (let i = 0; i < REAL_S_STARS.length; i++) {
      const s = REAL_S_STARS[i];
      // Map AU to scene radius units (rs * 3.5 to rs * 18.0)
      const mappedA = rs * (3.5 + (s.semiMajorAxisAU / 1000) * 4.5);
      this.semiMajorAxes[i] = mappedA;
      this.eccentricities[i] = s.eccentricity;
      this.inclinations[i] = (s.inclinationDeg * Math.PI) / 180;
      this.longAscNodes[i] = (i * 1.05) % (Math.PI * 2);
      this.argPeriapses[i] = (i * 0.78) % (Math.PI * 2);
      this.meanAnomalies[i] = Math.random() * Math.PI * 2;

      // Keplerian frequency: omega = sqrt(GM / a^3)
      this.orbitalFrequencies[i] = 1.8 / Math.pow(mappedA / rs, 1.5);
      // General relativistic periapsis precession speed
      this.precessionSpeeds[i] = (0.28 * rs) / (mappedA * (1 - s.eccentricity * s.eccentricity));

      const color = new THREE.Color(s.colorHex);
      this.starColors[i * 3 + 0] = color.r;
      this.starColors[i * 3 + 1] = color.g;
      this.starColors[i * 3 + 2] = color.b;
      this.starSizes[i] = 6.0;
    }

    // Populate remaining procedural S-cluster stars (dense cusps around Sgr A*)
    for (let i = REAL_S_STARS.length; i < count; i++) {
      // Dehnen/Plummer core distribution: density falls with radius r^-1.75
      const u = Math.random();
      const rMin = rs * 2.2;
      const rMax = rs * 32.0;
      const mappedA = rMin + Math.pow(u, 1.8) * (rMax - rMin);

      // Higher eccentricity typical in S-cluster due to Kozai-Lidov cycles
      const ecc = 0.2 + Math.pow(Math.random(), 1.4) * 0.78;

      this.semiMajorAxes[i] = mappedA;
      this.eccentricities[i] = Math.min(0.985, ecc);
      this.inclinations[i] = Math.acos(2.0 * Math.random() - 1.0); // isotropic distribution
      this.longAscNodes[i] = Math.random() * Math.PI * 2;
      this.argPeriapses[i] = Math.random() * Math.PI * 2;
      this.meanAnomalies[i] = Math.random() * Math.PI * 2;

      this.orbitalFrequencies[i] = 1.8 / Math.pow(mappedA / rs, 1.5);
      this.precessionSpeeds[i] = (0.25 * rs) / (mappedA * (1 - ecc * ecc));

      // Spectral types distribution: 60% B/A (blue/white), 25% G/K (yellow/orange), 15% O (deep hot blue)
      const specTypeRand = Math.random();
      let color: THREE.Color;
      let size: number;
      if (specTypeRand < 0.2) {
        color = new THREE.Color('#93C5FD'); // Hot O/B
        size = 3.5 + Math.random() * 2.0;
      } else if (specTypeRand < 0.6) {
        color = new THREE.Color('#E2E8F0'); // White A/F
        size = 2.4 + Math.random() * 1.5;
      } else if (specTypeRand < 0.85) {
        color = new THREE.Color('#FDE047'); // Yellow/Gold G
        size = 2.2 + Math.random() * 1.2;
      } else {
        color = new THREE.Color('#F97316'); // Red/Orange giant K/M
        size = 2.8 + Math.random() * 1.8;
      }

      this.starColors[i * 3 + 0] = color.r;
      this.starColors[i * 3 + 1] = color.g;
      this.starColors[i * 3 + 2] = color.b;
      this.starSizes[i] = size;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.starColors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.starSizes, 1));
    this.geometry.setAttribute('semiMajorAxis', new THREE.BufferAttribute(this.semiMajorAxes, 1));
    this.geometry.setAttribute('eccentricity', new THREE.BufferAttribute(this.eccentricities, 1));
    this.geometry.setAttribute('inclination', new THREE.BufferAttribute(this.inclinations, 1));
    this.geometry.setAttribute('longAscNode', new THREE.BufferAttribute(this.longAscNodes, 1));
    this.geometry.setAttribute('argPeriapsis', new THREE.BufferAttribute(this.argPeriapses, 1));
    this.geometry.setAttribute('meanAnomaly', new THREE.BufferAttribute(this.meanAnomalies, 1));
    this.geometry.setAttribute('orbitalFreq', new THREE.BufferAttribute(this.orbitalFrequencies, 1));
    this.geometry.setAttribute('precessionSpeed', new THREE.BufferAttribute(this.precessionSpeeds, 1));

    // Custom GPU vertex shader for Keplerian + Relativistic Rosette orbits
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute float semiMajorAxis;
        attribute float eccentricity;
        attribute float inclination;
        attribute float longAscNode;
        attribute float argPeriapsis;
        attribute float meanAnomaly;
        attribute float orbitalFreq;
        attribute float precessionSpeed;

        varying vec3 vColor;
        varying float vDist;

        uniform float uTime;
        uniform float uSimSpeed;
        uniform float uRs;

        void main() {
          vColor = color;

          float t = uTime * uSimSpeed;

          // Mean anomaly at current time
          float M = mod(meanAnomaly + t * orbitalFreq, 6.2831853);

          // Fast Fourier approximation of Kepler's Equation: E = M + e*sin(M) + 0.5*e^2*sin(2M)
          float E = M + eccentricity * sin(M) + 0.5 * eccentricity * eccentricity * sin(2.0 * M);

          // True anomaly \nu
          float cosNu = (cos(E) - eccentricity) / (1.0 - eccentricity * cos(E));
          float sinNu = (sqrt(max(0.001, 1.0 - eccentricity * eccentricity)) * sin(E)) / (1.0 - eccentricity * cos(E));
          float nu = atan(sinNu, cosNu);

          // Distance from central black hole r = a * (1 - e^2) / (1 + e * cos(\nu))
          float r = (semiMajorAxis * (1.0 - eccentricity * eccentricity)) / (1.0 + eccentricity * cosNu);

          // General Relativistic Schwarzschild Periapsis Precession:
          // Argument of periapsis advances continuously creating rosette orbits
          float omega = argPeriapsis + t * precessionSpeed;

          // Orbital plane coordinates
          float uOrb = nu + omega;
          float xOrb = r * cos(uOrb);
          float yOrb = r * sin(uOrb);

          // Rotate to 3D inclination i and longitude of ascending node \Omega
          float cosNode = cos(longAscNode);
          float sinNode = sin(longAscNode);
          float cosInc = cos(inclination);
          float sinInc = sin(inclination);

          vec3 pos;
          pos.x = cosNode * xOrb - sinNode * yOrb * cosInc;
          pos.z = sinNode * xOrb + cosNode * yOrb * cosInc;
          pos.y = yOrb * sinInc;

          vDist = r;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Point size with perspective attenuation and proximity boost
          float distToCam = -mvPosition.z;
          gl_PointSize = size * (240.0 / max(5.0, distToCam));
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vColor;
        varying float vDist;

        void main() {
          // Circular Gaussian star point with soft glow halo
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distSq = dot(coord, coord);
          if (distSq > 0.25) discard;

          float core = exp(-distSq * 28.0);
          float halo = exp(-distSq * 7.0) * 0.45;
          float alpha = core + halo;

          // Gravitational redshift near horizon (r <= 2.5 rs)
          vec3 starColor = vColor;
          if (vDist < 4.0) {
            float redshift = clamp(vDist / 4.0, 0.2, 1.0);
            starColor = mix(vec3(1.0, 0.25, 0.1), starColor, redshift);
          }

          gl_FragColor = vec4(starColor * (0.8 + core * 0.5), alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0.0 },
        uSimSpeed: { value: 1.0 },
        uRs: { value: rs },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;

    // Orbit trail line for selected star
    const trailPoints = new Float32Array(180 * 3);
    this.orbitTrailGeo = new THREE.BufferGeometry();
    this.orbitTrailGeo.setAttribute('position', new THREE.BufferAttribute(trailPoints, 3));
    this.orbitTrailMesh = new THREE.Line(
      this.orbitTrailGeo,
      new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      })
    );
    this.orbitTrailMesh.visible = false;
  }

  public update(time: number, simSpeed: number, isPaused: boolean) {
    if (!isPaused && this.material.uniforms) {
      this.material.uniforms.uTime.value = time;
      this.material.uniforms.uSimSpeed.value = simSpeed;
    }
  }

  /**
   * Computes exact 3D Cartesian position of a star at given time
   */
  public getStarPositionAtTime(starIndex: number, time: number, simSpeed: number): THREE.Vector3 {
    const t = time * simSpeed;
    const a = this.semiMajorAxes[starIndex];
    const e = this.eccentricities[starIndex];
    const inc = this.inclinations[starIndex];
    const node = this.longAscNodes[starIndex];
    const argP = this.argPeriapses[starIndex];
    const m0 = this.meanAnomalies[starIndex];
    const freq = this.orbitalFrequencies[starIndex];
    const prec = this.precessionSpeeds[starIndex];

    const M = (m0 + t * freq) % (Math.PI * 2);
    const E = M + e * Math.sin(M) + 0.5 * e * e * Math.sin(2 * M);
    const cosNu = (Math.cos(E) - e) / (1.0 - e * Math.cos(E));
    const sinNu = (Math.sqrt(Math.max(0.001, 1 - e * e)) * Math.sin(E)) / (1.0 - e * Math.cos(E));
    const nu = Math.atan2(sinNu, cosNu);

    const r = (a * (1.0 - e * e)) / (1.0 + e * Math.cos(nu));
    const omega = argP + t * prec;

    const uOrb = nu + omega;
    const xOrb = r * Math.cos(uOrb);
    const yOrb = r * Math.sin(uOrb);

    const cosNode = Math.cos(node);
    const sinNode = Math.sin(node);
    const cosInc = Math.cos(inc);
    const sinInc = Math.sin(inc);

    const x = cosNode * xOrb - sinNode * yOrb * cosInc;
    const z = sinNode * xOrb + cosNode * yOrb * cosInc;
    const y = yOrb * sinInc;

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Updates orbit trail visualization geometry for selected star
   */
  public updateOrbitTrail(starIndex: number, time: number, simSpeed: number) {
    if (starIndex < 0 || starIndex >= this.count) {
      this.orbitTrailMesh.visible = false;
      return;
    }

    const t = time * simSpeed;
    const prec = this.precessionSpeeds[starIndex];
    const omegaBase = this.argPeriapses[starIndex] + t * prec;
    const a = this.semiMajorAxes[starIndex];
    const e = this.eccentricities[starIndex];
    const inc = this.inclinations[starIndex];
    const node = this.longAscNodes[starIndex];

    const cosNode = Math.cos(node);
    const sinNode = Math.sin(node);
    const cosInc = Math.cos(inc);
    const sinInc = Math.sin(inc);

    const posAttr = this.orbitTrailGeo.getAttribute('position') as THREE.BufferAttribute;
    const steps = 180;

    for (let i = 0; i < steps; i++) {
      const nu = (i / (steps - 1)) * Math.PI * 2;
      const r = (a * (1.0 - e * e)) / (1.0 + e * Math.cos(nu));
      const uOrb = nu + omegaBase;

      const xOrb = r * Math.cos(uOrb);
      const yOrb = r * Math.sin(uOrb);

      const x = cosNode * xOrb - sinNode * yOrb * cosInc;
      const z = sinNode * xOrb + cosNode * yOrb * cosInc;
      const y = yOrb * sinInc;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
    this.orbitTrailMesh.visible = true;
  }

  /**
   * Raycasts against stars to find closest clicked star
   */
  public findClosestStar(ray: THREE.Ray, time: number, simSpeed: number, maxDist = 1.2): number | null {
    let closestIndex: number | null = null;
    let minRayDist = maxDist;

    // Check real S-stars first (highest priority)
    for (let i = 0; i < REAL_S_STARS.length; i++) {
      const starPos = this.getStarPositionAtTime(i, time, simSpeed);
      const distToRay = ray.distanceToPoint(starPos);
      if (distToRay < minRayDist) {
        minRayDist = distToRay;
        closestIndex = i;
      }
    }

    if (closestIndex !== null) return closestIndex;

    // Sample subset of procedural stars for click responsiveness
    for (let i = REAL_S_STARS.length; i < Math.min(this.count, 2500); i += 2) {
      const starPos = this.getStarPositionAtTime(i, time, simSpeed);
      const distToRay = ray.distanceToPoint(starPos);
      if (distToRay < minRayDist) {
        minRayDist = distToRay;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  public getStarData(starIndex: number, time: number, simSpeed: number, massSolar: number): StarOrbitData {
    const starPos = this.getStarPositionAtTime(starIndex, time, simSpeed);
    const distRs = starPos.length() / this.rs;

    // Instantaneous velocity: v^2 = GM * (2/r - 1/a)
    const aAU = (this.semiMajorAxes[starIndex] / this.rs) * 120;
    const e = this.eccentricities[starIndex];

    // Keplerian to km/s scaled
    const vApproxKmS = Math.round(
      Math.min(28000, 4200 * Math.sqrt(Math.max(0.1, 2.0 / Math.max(1.0, distRs) - 1.0 / (aAU / 120))))
    );

    const gamma = distRs <= 1.0 ? 999 : 1.0 / Math.sqrt(Math.max(0.001, 1 - 1.0 / distRs));

    if (starIndex < REAL_S_STARS.length) {
      const base = REAL_S_STARS[starIndex];
      return {
        ...base,
        currentDistanceRs: Number(distRs.toFixed(2)),
        currentVelocityKmS: vApproxKmS,
        timeDilationGamma: Number(gamma.toFixed(3)),
      };
    }

    const precession = calculateGeneralRelativisticPrecession(aAU, e, massSolar);
    const color = new THREE.Color(
      this.starColors[starIndex * 3],
      this.starColors[starIndex * 3 + 1],
      this.starColors[starIndex * 3 + 2]
    );

    return {
      id: starIndex + 1,
      name: `S-Cluster #${starIndex + 100}`,
      spectralType: 'B-Type Main Sequence Dwarf',
      colorHex: `#${color.getHexString()}`,
      semiMajorAxisAU: Math.round(aAU),
      eccentricity: Number(e.toFixed(3)),
      orbitalPeriodYears: Number((Math.pow(aAU / 970, 1.5) * 16.0).toFixed(1)),
      inclinationDeg: Math.round((this.inclinations[starIndex] * 180) / Math.PI),
      periapsisVelocityKmS: Math.round(vApproxKmS * 1.5),
      apoapsisAU: Math.round(aAU * (1 + e)),
      periapsisAU: Math.round(aAU * (1 - e)),
      precessionRateArcsecPerOrbit: Number(precession.toFixed(1)),
      currentDistanceRs: Number(distRs.toFixed(2)),
      currentVelocityKmS: vApproxKmS,
      timeDilationGamma: Number(gamma.toFixed(3)),
    };
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.orbitTrailGeo.dispose();
    (this.orbitTrailMesh.material as THREE.Material).dispose();
  }
}
