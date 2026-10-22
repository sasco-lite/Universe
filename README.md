# Sagittarius A* — Relativistic Supermassive Black Hole Simulation

An interactive 3D WebGL and General Relativity simulation of Sagittarius A*, the rotating Kerr supermassive black hole at the center of the Milky Way galaxy, surrounded by 15,000 relativistic S-cluster stars.

---

## Technical Stack & Architecture

- **Core Engine**: Vite + React 19 + TypeScript + Three.js
- **Shaders**: WebGL2 GLSL Custom Ray-Marching & Vertex shaders
- **State Management**: Zustand reactive physics store
- **Audio Synthesis**: Zero-dependency Web Audio API procedural synthesizer (gravitational sub-bass hum, accretion turbulence, and time dilation pitch-shifting)
- **Styling**: Tailwind CSS v4 with glassmorphism architecture and zero-pill typography discipline
- **Performance**: Single persistent WebGL canvas shared across all routes, critically damped spring physics for camera transitions, GPU-instanced star computing, and automatic software WebGL detection with adaptive scaling.

---

## Mathematical Formulations & Screen Mappings

| Mathematical Phenomenon | Governing Equation | Visual / Screen Expression |
| :--- | :--- | :--- |
| **Null Geodesic Ray Deflection** | $\frac{d^2u}{d\phi^2} + u = \frac{3GM}{c^2}u^2$; deflection $\hat{\alpha} \approx \frac{4GM}{c^2b}$ | Ray-marched in `src/shaders/blackHoleRaymarch.ts`. Photon rays bend around the event horizon, forming primary and secondary Einstein rings and inverted starfield mirages. |
| **Kerr Shadow & Frame Dragging** | $r_+ = M(1 + \sqrt{1 - a^2})$; $r_E(\theta) = M(1 + \sqrt{1 - a^2\cos^2\theta})$ | As spin parameter $a$ varies from $-0.998$ to $+0.998$, the shadow contracts and shifts horizontally, forming the authentic asymmetric D-shaped Kerr shadow. |
| **Accretion Disk Thermodynamics** | $T(r) \propto r^{-3/4} \left[1 - \left(\frac{r_{\text{in}}}{r}\right)^{1/2}\right]^{1/4}$ | Shakura-Sunyaev temperature gradient mapped via Planckian locus to blackbody colors: ultra-hot cobalt/white interior ($>20,000\text{ K}$) transitioning to golden synchrotron amber and deep infrared at outer radii. |
| **Relativistic Doppler Beaming** | $\delta = \frac{1}{\gamma(1 - \beta \cos\theta)}$; $I_{\text{obs}} = I_{\text{emit}} \delta^4$; $\beta = \sqrt{\frac{r_s}{2r}}$ | Relativistic beaming amplifies emission on the disk side approaching the observer ($\delta^4$ flux increase) and dims the receding side, creating the signature asymmetric brightness observed by the Event Horizon Telescope. |
| **Gravitational Time Dilation** | $\frac{d\tau}{dt} = \sqrt{1 - \frac{r_s}{r}}$ | Demonstrates proper time $\tau$ vs coordinate time $t$ on the Time Dilation page. Clocks asymptotically freeze at the horizon, light shifts into deep infrared, and the Web Audio engine pitch-bends down by up to 2 octaves. |
| **Flamm's Paraboloid Curvature** | $z(r) = -2\sqrt{r_s(r - r_s)}$ | 3D wireframe mesh in `src/components/canvas/FlammParaboloidGrid.ts` visualizes the spatial embedding of the equatorial Schwarzschild slice dipping into the singularity throat. |
| **GPU Symplectic Rosette Orbits** | $\Delta\phi = \frac{6\pi GM}{c^2 a (1 - e^2)} = \frac{3\pi r_s}{a (1 - e^2)}$ | 15,000 S-cluster stars orbit under central relativistic gravity. The periapsis advances every revolution, generating authentic rosette orbits for benchmark stars like S2, S62, and S4714. |

---

## Pages Included

1. **Overview (Home)**: Cinematic hero fly-in, key astrophysical telemetry cards, and immediate route portals.
2. **Anatomy**: Guided 5-zone relativistic tour through the Event Horizon ($r_+$), Ergosphere, Photon Sphere ($r_{\text{ph}}$), ISCO, and Relativistic Jets with 3D camera choreography.
3. **Star Cluster**: Real-time inspection of 15,000 GPU stars. Click on any star in 3D space to follow its orbit and inspect eccentricity, semi-major axis, apoapsis/periapsis speed, and Schwarzschild precession.
4. **Spacetime Lab**: Real-time sliders for Mass ($M$), Kerr Spin ($a$), Disk Temperature, Doppler Beaming toggle, Gravitational Lensing toggle, and 3D Flamm paraboloid grid depth.
5. **Time Dilation**: Comparative clock experiment: Observer at infinity vs. descent probe nearing the horizon, with proper time integration, gravitational redshift meter, and acoustic pitch modulation.
6. **Physics & Research**: Full mathematical derivations, tensor equations, Nobel Prize citations (EHT, Genzel & Ghez 2020), and functional researcher inquiry console.

---

## Setup & Deployment Instructions

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

### GitHub & Vercel Deployment
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Sagittarius A* relativistic simulation"
   ```
2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/your-username/your-repo.git
   git branch -M main
   git push -u origin main
   ```
3. Deploy to **Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Click **Deploy** (No environment variables required).
