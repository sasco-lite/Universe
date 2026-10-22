import * as THREE from 'three';

/**
 * 3D Flamm's Paraboloid Spacetime Embedding Grid
 * Visualizes equatorial spatial curvature of Schwarzschild / Kerr metric:
 * z(r) = -2 * sqrt(r_s * (r - r_s))
 */
export class FlammParaboloidGrid {
  public mesh: THREE.LineSegments;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;

  constructor(rs = 2.0, maxR = 28.0, radialSteps = 48, angularSteps = 64) {
    const vertices: number[] = [];
    const colors: number[] = [];

    const minR = rs * 1.02;

    // 1. Concentric circular rings
    for (let i = 0; i < radialSteps; i++) {
      const frac = i / (radialSteps - 1);
      const r = minR + Math.pow(frac, 1.35) * (maxR - minR);
      const z = -2.0 * Math.sqrt(Math.max(0, rs * (r - rs)));

      for (let j = 0; j < angularSteps; j++) {
        const phi1 = (j / angularSteps) * Math.PI * 2;
        const phi2 = ((j + 1) / angularSteps) * Math.PI * 2;

        const x1 = r * Math.cos(phi1);
        const y1 = z;
        const z1 = r * Math.sin(phi1);

        const x2 = r * Math.cos(phi2);
        const y2 = z;
        const z2 = r * Math.sin(phi2);

        vertices.push(x1, y1, z1, x2, y2, z2);

        // Color gradient: deep cyan to electric blue, fading at edges
        const depthIntensity = Math.min(1.0, (r - minR) / (maxR - minR));
        const alpha = Math.max(0.1, 1.0 - depthIntensity * 0.7);

        // Near horizon: brighter amber-cyan
        const rCol = 0.2 + (1.0 - depthIntensity) * 0.6;
        const gCol = 0.5 + (1.0 - depthIntensity) * 0.3;
        const bCol = 0.95;

        colors.push(rCol * alpha, gCol * alpha, bCol * alpha);
        colors.push(rCol * alpha, gCol * alpha, bCol * alpha);
      }
    }

    // 2. Radial geodesic lines
    for (let j = 0; j < angularSteps; j += 2) {
      const phi = (j / angularSteps) * Math.PI * 2;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      for (let i = 0; i < radialSteps - 1; i++) {
        const frac1 = i / (radialSteps - 1);
        const frac2 = (i + 1) / (radialSteps - 1);

        const r1 = minR + Math.pow(frac1, 1.35) * (maxR - minR);
        const r2 = minR + Math.pow(frac2, 1.35) * (maxR - minR);

        const z1 = -2.0 * Math.sqrt(Math.max(0, rs * (r1 - rs)));
        const z2 = -2.0 * Math.sqrt(Math.max(0, rs * (r2 - rs)));

        vertices.push(r1 * cosPhi, z1, r1 * sinPhi, r2 * cosPhi, z2, r2 * sinPhi);

        const depthIntensity = Math.min(1.0, (r1 - minR) / (maxR - minR));
        const alpha = Math.max(0.08, 0.75 - depthIntensity * 0.6);

        colors.push(0.15 * alpha, 0.45 * alpha, 0.9 * alpha);
        colors.push(0.15 * alpha, 0.45 * alpha, 0.9 * alpha);
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        varying float vHeight;
        uniform float uScaleY;

        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y *= uScaleY;
          vHeight = pos.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vColor;
        varying float vHeight;
        uniform float uOpacity;

        void main() {
          gl_FragColor = vec4(vColor, uOpacity);
        }
      `,
      uniforms: {
        uScaleY: { value: 1.0 },
        uOpacity: { value: 0.65 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.LineSegments(this.geometry, this.material);
    this.mesh.position.y = -0.05; // Slightly below disk
  }

  public update(rs: number, scaleY: number, visible: boolean) {
    this.mesh.visible = visible;
    if (visible && this.material.uniforms) {
      this.material.uniforms.uScaleY.value = scaleY;
    }
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
