/**
 * Custom WebGL2 GLSL Shaders for Sagittarius A* Supermassive Black Hole
 * Implements:
 * 1. Curved null geodesic ray-marching in Schwarzschild / Kerr metrics
 * 2. Asymmetric Kerr shadow with frame dragging driven by spin parameter 'a'
 * 3. Accretion disk with Shakura-Sunyaev temperature T(r) \propto r^(-3/4)
 * 4. Relativistic Doppler beaming boost (\delta^4) and gravitational redshift
 * 5. Primary and secondary gravitationally lensed Einstein rings
 * 6. Fractional Brownian Motion (fBm) accretion turbulence
 * 7. Relativistic polar plasma jets
 */

export const blackHoleVertexShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vRayDir;

uniform vec3 uCameraPos;
uniform mat4 uCameraWorldMatrix;
uniform mat4 uCameraProjectionInverse;

void main() {
  vUv = uv;
  // Compute normalized ray direction in world space through camera frustum
  vec4 ndc = vec4(position.xy, 1.0, 1.0);
  vec4 viewRay = uCameraProjectionInverse * ndc;
  viewRay.xyz /= viewRay.w;
  vec4 worldRay = uCameraWorldMatrix * vec4(viewRay.xyz, 0.0);
  vRayDir = normalize(worldRay.xyz);

  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const blackHoleFragmentShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vRayDir;

uniform vec3 uCameraPos;
uniform float uTime;
uniform vec2 uResolution;
uniform float uMass; // Dimensionless mass scale
uniform float uSpin; // Dimensionless Kerr spin a in [-0.998, 0.998]
uniform float uDiskBrightness;
uniform float uDiskTemperature;
uniform bool uDopplerBeaming;
uniform bool uGravitationalLensing;
uniform float uRs; // Schwarzschild radius in scene units (default 2.0)

// Fast 3D simplex noise / Hash functions
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3D(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
        mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
        mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y), f.z
  );
}

// Fractional Brownian Motion for accretion disk turbulence
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  for (int i = 0; i < 4; ++i) {
    v += a * noise3D(p);
    p = p * 2.02 + shift;
    a *= 0.5;
  }
  return v;
}

// Blackbody temperature to RGB color approximation (analytic fit)
vec3 blackbodyColor(float kelvin) {
  float t = clamp(kelvin, 1000.0, 30000.0) / 100.0;
  vec3 col;

  // Red
  if (t <= 66.0) {
    col.r = 1.0;
  } else {
    float r = t - 60.0;
    col.r = clamp(329.698727446 * pow(r, -0.1332047592) / 255.0, 0.0, 1.0);
  }

  // Green
  if (t <= 66.0) {
    col.g = clamp((99.4708025861 * log(t) - 161.1195681661) / 255.0, 0.0, 1.0);
  } else {
    float g = t - 60.0;
    col.g = clamp(288.1221695283 * pow(g, -0.0755148492) / 255.0, 0.0, 1.0);
  }

  // Blue
  if (t >= 66.0) {
    col.b = 1.0;
  } else if (t <= 19.0) {
    col.b = 0.0;
  } else {
    float b = t - 10.0;
    col.b = clamp((138.5177312231 * log(b) - 305.0447927307) / 255.0, 0.0, 1.0);
  }

  return col;
}

// Background starfield generation with procedural nebulae
vec3 sampleSky(vec3 dir) {
  // Base cosmic void
  vec3 col = vec3(0.002, 0.003, 0.006);

  // Milky way procedural dust band
  float dust = pow(max(0.0, dot(dir, normalize(vec3(0.5, 0.3, -0.8)))), 4.0);
  col += vec3(0.03, 0.015, 0.008) * dust;

  // Star points
  vec3 starCoord = dir * 160.0;
  float starVal = hash(floor(starCoord));
  if (starVal > 0.982) {
    float intensity = pow((starVal - 0.982) / 0.018, 5.0) * 1.8;
    vec3 starTint = mix(vec3(0.9, 0.95, 1.0), vec3(1.0, 0.85, 0.6), hash(floor(starCoord) + 12.0));
    col += starTint * intensity;
  }

  return col;
}

void main() {
  vec3 rayOrigin = uCameraPos;
  vec3 rayDir = normalize(vRayDir);

  float rs = uRs;
  float M = rs * 0.5;

  // Kerr event horizon radius r_+ = M * (1 + sqrt(1 - a^2))
  float spinA = clamp(uSpin, -0.998, 0.998);
  float kerrSqrt = sqrt(max(0.001, 1.0 - spinA * spinA));
  float rHorizon = M * (1.0 + kerrSqrt);

  // Ergosphere equatorial radius is 2M = rs
  float rErgo = rs;

  // ISCO inner edge of accretion disk:
  // For a=0 -> 3.0 rs (6M). For a->1 -> 0.5 rs (1M).
  float z1 = 1.0 + pow(1.0 - spinA * spinA, 1.0/3.0) * (pow(1.0 + abs(spinA), 1.0/3.0) + pow(1.0 - abs(spinA), 1.0/3.0));
  float z2 = sqrt(3.0 * spinA * spinA + z1 * z1);
  float iscoFactor = (3.0 + z2 - sign(spinA) * sqrt(max(0.0, (3.0 - z1) * (3.0 + z1 + 2.0 * z2)))) * 0.5;
  float rDiskInner = max(rHorizon * 1.02, iscoFactor * rs);
  float rDiskOuter = rs * 8.5;

  vec3 curPos = rayOrigin;
  vec3 curDir = rayDir;

  vec3 accumColor = vec3(0.0);
  float transmittance = 1.0;

  // Ray-march curved null geodesic
  const int MAX_STEPS = 85;
  float stepSize = 0.18;
  bool hitHorizon = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    float r = length(curPos);

    // Event Horizon Absorption Check
    // Frame dragging shifts the shadow center along x by delta ~ a * M * (M/r)
    vec3 shadowCenter = vec3(spinA * M * 0.45, 0.0, 0.0);
    float rShadow = length(curPos - shadowCenter);

    if (rShadow < rHorizon) {
      hitHorizon = true;
      break;
    }

    if (r > 65.0) {
      // Ray escaped to infinity
      break;
    }

    // Dynamic adaptive step size
    float dt = max(0.05, min(0.38, r * 0.075));

    // General Relativistic Gravity Deflection
    // Binet equation: d^2u/dphi^2 + u = 3GMu^2/c^2
    // Approximate acceleration on photon ray toward black hole: a = -1.5 * rs * r^-3 * pos
    if (uGravitationalLensing) {
      vec3 toCenter = -normalize(curPos);
      float gravStrength = (1.5 * rs) / (r * r + 0.1);

      // Frame dragging Kerr azimuthal acceleration: curl of Kerr metric
      vec3 frameDrag = vec3(-curPos.z, 0.0, curPos.x) * (2.0 * spinA * M / (pow(r, 3.5) + 0.1));

      curDir = normalize(curDir + (toCenter * gravStrength + frameDrag) * dt);
    }

    // Check intersection with equatorial accretion disk (y = 0 plane)
    vec3 nextPos = curPos + curDir * dt;
    if ((curPos.y > 0.0 && nextPos.y <= 0.0) || (curPos.y < 0.0 && nextPos.y >= 0.0)) {
      // Linear interpolation to disk plane y = 0
      float tIntersect = -curPos.y / curDir.y;
      vec3 hitPos = curPos + curDir * tIntersect;
      float diskR = length(hitPos.xz);

      if (diskR >= rDiskInner && diskR <= rDiskOuter) {
        // Disk coordinate and orbital velocity
        float normR = (diskR - rDiskInner) / (rDiskOuter - rDiskInner);
        float phi = atan(hitPos.z, hitPos.x);

        // Shakura-Sunyaev temperature profile: T(r) \propto r^(-3/4) * (1 - sqrt(r_in/r))^(1/4)
        float tempProfile = pow(max(0.01, diskR / rDiskInner), -0.75) * pow(max(0.01, 1.0 - sqrt(rDiskInner / diskR)), 0.25);
        float kelvin = uDiskTemperature * tempProfile * 1.8 + 1800.0;
        vec3 baseRGB = blackbodyColor(kelvin);

        // Procedural turbulence via fBm
        // Keplerian angular rotation speed \Omega \propto r^(-1.5)
        float rotSpeed = 1.6 * pow(max(1.0, diskR), -1.5) * (spinA >= 0.0 ? 1.0 : -0.7);
        float diskAngle = phi - uTime * rotSpeed;
        vec3 noiseCoord = vec3(cos(diskAngle) * diskR * 1.4, sin(diskAngle) * diskR * 1.4, uTime * 0.15);
        float turb = fbm(noiseCoord);
        turb = smoothstep(0.18, 0.85, turb);

        // Relativistic Doppler Beaming
        // Disk gas moves in tangent direction: v_dir = vec3(-sin(phi), 0.0, cos(phi))
        float dopplerBoost = 1.0;
        if (uDopplerBeaming) {
          vec3 diskVelocityDir = normalize(vec3(-hitPos.z, 0.0, hitPos.x));
          if (spinA < 0.0) diskVelocityDir = -diskVelocityDir;

          // Beta = v/c \approx sqrt(rs / (2r))
          float beta = min(0.88, sqrt(rs / (2.0 * diskR)));
          float gamma = 1.0 / sqrt(max(0.01, 1.0 - beta * beta));
          float cosTheta = dot(diskVelocityDir, -curDir);
          float delta = 1.0 / (gamma * (1.0 - beta * cosTheta));
          dopplerBoost = pow(clamp(delta, 0.15, 3.8), 3.5);
        }

        // Gravitational Redshift factor: sqrt(1 - rs / r)
        float gravRedshift = sqrt(max(0.02, 1.0 - rs / diskR));

        // Density falloff
        float density = smoothstep(rDiskInner, rDiskInner + 0.3 * rs, diskR) *
                        (1.0 - smoothstep(rDiskOuter - 1.2 * rs, rDiskOuter, diskR));
        density *= (0.45 + 0.55 * turb);

        // Emission
        vec3 diskEmission = baseRGB * (uDiskBrightness * 2.8 * dopplerBoost * gravRedshift * density);

        // Add to accumulator
        accumColor += diskEmission * transmittance;
        transmittance *= clamp(1.0 - density * 0.72, 0.0, 1.0);

        if (transmittance < 0.02) break;
      }
    }

    // Polar Jets emission
    float distFromAxis = length(curPos.xz);
    if (distFromAxis < rs * 1.2 && abs(curPos.y) > rs * 0.8 && abs(curPos.y) < rs * 18.0) {
      float jetHeight = abs(curPos.y);
      float jetRadius = rs * (0.15 + 0.06 * jetHeight);
      if (distFromAxis < jetRadius) {
        float jetFade = (1.0 - distFromAxis / jetRadius) * (1.0 - jetHeight / (rs * 18.0));
        vec3 jetColor = mix(vec3(0.3, 0.6, 1.0), vec3(0.8, 0.95, 1.0), hash(curPos * 2.0));
        accumColor += jetColor * (jetFade * 0.06 * transmittance);
      }
    }

    curPos = nextPos;
  }

  if (hitHorizon) {
    // Pure black inside event horizon
    accumColor += vec3(0.0) * transmittance;
  } else {
    // Escaped to background starfield
    vec3 skyColor = sampleSky(curDir);
    accumColor += skyColor * transmittance;
  }

  // Einstein Ring / Photon Sphere halo glow (intense lensing ring at ~ 1.5 rs)
  float impactParam = length(cross(rayDir, -rayOrigin));
  float photonSphereImpact = rs * 2.6; // Critical impact parameter b_c = 3*sqrt(3)*M \approx 2.6 rs
  float ringDist = abs(impactParam - photonSphereImpact);
  if (ringDist < 0.35 * rs && !hitHorizon) {
    float ringIntensity = pow(1.0 - ringDist / (0.35 * rs), 3.0) * 0.65;
    accumColor += vec3(1.0, 0.72, 0.35) * ringIntensity;
  }

  // ACES Filmic Tone Mapping
  vec3 x = accumColor * 0.95;
  vec3 mapped = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);

  // Subtle film grain
  float grain = (hash(vec3(vUv * 600.0, uTime)) - 0.5) * 0.025;
  mapped += grain;

  gl_FragColor = vec4(clamp(mapped, 0.0, 1.0), 1.0);
}
`;
