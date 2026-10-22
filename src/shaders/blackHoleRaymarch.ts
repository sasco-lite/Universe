/**
 * Custom WebGL2 GLSL Shaders for Sagittarius A* Supermassive Black Hole
 * Hardened against NaNs, with transient interactive gravity-well ray bending.
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
  vec4 ndc = vec4(position.xy, 1.0, 1.0);
  vec4 viewRay = uCameraProjectionInverse * ndc;
  viewRay.xyz /= max(0.00001, viewRay.w);
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
uniform float uMass;
uniform float uSpin;
uniform float uDiskBrightness;
uniform float uDiskTemperature;
uniform bool uDopplerBeaming;
uniform bool uGravitationalLensing;
uniform float uRs;
uniform vec4 uGravityWell; // xyz: 3D position, w: strength (0 to 1)

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

vec3 blackbodyColor(float kelvin) {
  float t = clamp(kelvin, 1000.0, 30000.0) / 100.0;
  vec3 col;

  if (t <= 66.0) {
    col.r = 1.0;
  } else {
    float r = t - 60.0;
    col.r = clamp(329.698727446 * pow(max(0.01, r), -0.1332047592) / 255.0, 0.0, 1.0);
  }

  if (t <= 66.0) {
    col.g = clamp((99.4708025861 * log(max(0.01, t)) - 161.1195681661) / 255.0, 0.0, 1.0);
  } else {
    float g = t - 60.0;
    col.g = clamp(288.1221695283 * pow(max(0.01, g), -0.0755148492) / 255.0, 0.0, 1.0);
  }

  if (t >= 66.0) {
    col.b = 1.0;
  } else if (t <= 19.0) {
    col.b = 0.0;
  } else {
    float b = t - 10.0;
    col.b = clamp((138.5177312231 * log(max(0.01, b)) - 305.0447927307) / 255.0, 0.0, 1.0);
  }

  return col;
}

vec3 sampleSky(vec3 dir) {
  vec3 col = vec3(0.002, 0.003, 0.006);
  float dust = pow(max(0.0, dot(dir, normalize(vec3(0.5, 0.3, -0.8)))), 4.0);
  col += vec3(0.03, 0.015, 0.008) * dust;

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

  float rs = max(0.5, uRs);
  float M = rs * 0.5;

  float spinA = clamp(uSpin, -0.998, 0.998);
  float kerrSqrt = sqrt(max(0.001, 1.0 - spinA * spinA));
  float rHorizon = M * (1.0 + kerrSqrt);

  float z1 = 1.0 + pow(max(0.001, 1.0 - spinA * spinA), 1.0/3.0) * (pow(max(0.001, 1.0 + abs(spinA)), 1.0/3.0) + pow(max(0.001, 1.0 - abs(spinA)), 1.0/3.0));
  float z2 = sqrt(max(0.001, 3.0 * spinA * spinA + z1 * z1));
  float iscoFactor = (3.0 + z2 - sign(spinA) * sqrt(max(0.001, (3.0 - z1) * (3.0 + z1 + 2.0 * z2)))) * 0.5;
  float rDiskInner = max(rHorizon * 1.02, iscoFactor * rs);
  float rDiskOuter = rs * 8.5;

  vec3 curPos = rayOrigin;
  vec3 curDir = rayDir;

  vec3 accumColor = vec3(0.0);
  float transmittance = 1.0;

  const int MAX_STEPS = 85;
  bool hitHorizon = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    float r = max(0.01, length(curPos));

    vec3 shadowCenter = vec3(spinA * M * 0.45, 0.0, 0.0);
    float rShadow = length(curPos - shadowCenter);

    if (rShadow < rHorizon) {
      hitHorizon = true;
      break;
    }

    if (r > 65.0) break;

    float dt = max(0.05, min(0.38, r * 0.075));

    // General Relativistic Gravity Deflection
    if (uGravitationalLensing) {
      vec3 toCenter = -normalize(curPos);
      float gravStrength = (1.5 * rs) / (r * r + 0.1);
      vec3 frameDrag = vec3(-curPos.z, 0.0, curPos.x) * (2.0 * spinA * M / (pow(r, 3.5) + 0.1));
      vec3 deflection = (toCenter * gravStrength + frameDrag) * dt;

      // Transient user-spawned gravity well deflection
      if (uGravityWell.w > 0.01) {
        vec3 toWell = uGravityWell.xyz - curPos;
        float wellDistSq = dot(toWell, toWell) + 0.8;
        deflection += normalize(toWell) * (uGravityWell.w * 3.5 / wellDistSq) * dt;
      }

      curDir = normalize(curDir + deflection);
    }

    // Check intersection with equatorial accretion disk (y = 0 plane)
    vec3 nextPos = curPos + curDir * dt;
    if ((curPos.y > 0.0 && nextPos.y <= 0.0) || (curPos.y < 0.0 && nextPos.y >= 0.0)) {
      float tIntersect = -curPos.y / (abs(curDir.y) > 0.0001 ? curDir.y : 0.0001);
      vec3 hitPos = curPos + curDir * tIntersect;
      float diskR = length(hitPos.xz);

      if (diskR >= rDiskInner && diskR <= rDiskOuter) {
        float phi = atan(hitPos.z, hitPos.x);

        float tempProfile = pow(max(0.01, diskR / rDiskInner), -0.75) * pow(max(0.01, 1.0 - sqrt(rDiskInner / diskR)), 0.25);
        float kelvin = uDiskTemperature * tempProfile * 1.8 + 1800.0;
        vec3 baseRGB = blackbodyColor(kelvin);

        float rotSpeed = 1.6 * pow(max(1.0, diskR), -1.5) * (spinA >= 0.0 ? 1.0 : -0.7);
        float diskAngle = phi - uTime * rotSpeed;
        vec3 noiseCoord = vec3(cos(diskAngle) * diskR * 1.4, sin(diskAngle) * diskR * 1.4, uTime * 0.15);
        float turb = fbm(noiseCoord);
        turb = smoothstep(0.18, 0.85, turb);

        float dopplerBoost = 1.0;
        if (uDopplerBeaming) {
          vec3 diskVelocityDir = normalize(vec3(-hitPos.z, 0.0, hitPos.x));
          if (spinA < 0.0) diskVelocityDir = -diskVelocityDir;

          float beta = min(0.88, sqrt(rs / (2.0 * max(0.1, diskR))));
          float gamma = 1.0 / sqrt(max(0.01, 1.0 - beta * beta));
          float cosTheta = dot(diskVelocityDir, -curDir);
          float delta = 1.0 / (gamma * max(0.01, 1.0 - beta * cosTheta));
          dopplerBoost = pow(clamp(delta, 0.15, 3.8), 3.5);
        }

        float gravRedshift = sqrt(max(0.02, 1.0 - rs / max(0.01, diskR)));

        float density = smoothstep(rDiskInner, rDiskInner + 0.3 * rs, diskR) *
                        (1.0 - smoothstep(rDiskOuter - 1.2 * rs, rDiskOuter, diskR));
        density *= (0.45 + 0.55 * turb);

        vec3 diskEmission = baseRGB * (uDiskBrightness * 2.8 * dopplerBoost * gravRedshift * density);

        accumColor += diskEmission * transmittance;
        transmittance *= clamp(1.0 - density * 0.72, 0.0, 1.0);

        if (transmittance < 0.02) break;
      }
    }

    // Polar Jets
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

  if (!hitHorizon) {
    vec3 skyColor = sampleSky(curDir);
    accumColor += skyColor * transmittance;
  }

  // Einstein Ring halo
  float impactParam = length(cross(rayDir, -rayOrigin));
  float photonSphereImpact = rs * 2.6;
  float ringDist = abs(impactParam - photonSphereImpact);
  if (ringDist < 0.35 * rs && !hitHorizon) {
    float ringIntensity = pow(1.0 - ringDist / (0.35 * rs), 3.0) * 0.65;
    accumColor += vec3(1.0, 0.72, 0.35) * ringIntensity;
  }

  // ACES Filmic Tone Mapping
  vec3 x = accumColor * 0.95;
  vec3 mapped = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  float grain = (hash(vec3(vUv * 600.0, uTime)) - 0.5) * 0.025;
  mapped += grain;

  gl_FragColor = vec4(clamp(mapped, 0.0, 1.0), 1.0);
}
`;
