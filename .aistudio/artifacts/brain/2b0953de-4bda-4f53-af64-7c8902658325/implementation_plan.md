# Sagittarius A* Supermassive Black Hole Experience

An immersive, cinematic, mathematically grounded 3D WebGL journey around Sagittarius A*, the supermassive black hole at the center of the Milky Way, surrounded by 15,000 relativistic stars.

---

> [!IMPORTANT]
> **Confirmed Design & Architecture Decisions**
> - **Astrophysical Anchor**: Sagittarius A* (Milky Way supermassive core) featuring a warm golden-amber synchrotron accretion disk, compact shadow, and relativistic beaming.
> - **Audio Architecture**: Procedural Web Audio API synthesizer generating a deep 40–80 Hz gravitational hum, stellar radio whispers, and acoustic time dilation shifts with zero external audio assets.
> - **Simulation Scale**: 15,000 GPU-simulated S-cluster stars driven by a GPGPU ping-pong Verlet symplectic integrator with dynamic LOD scaling.
> - **Route Architecture**: Single persistent Three.js WebGL canvas shared across all routes with smooth camera spline transitions and gravitational lens page warps.

---

## 1. Overview & Core Concept

### What It Delivers
A production-grade, 60fps interactive simulation and exploratory laboratory of a supermassive black hole ($M \approx 4.15 \times 10^6\,M_\odot$, with adjustable mass $M$ and dimensionless spin parameter $a \in [0, 0.998]$). The experience merges authentic general relativistic physics with high-end editorial web design.

### Core Pages
1. **Home (The Singularity)**: Hero fly-in into the galactic center with real-time gravitational lensing, Doppler-beamed accretion disk, and dynamic orbital camera.
2. **Anatomy (Event Horizon & Metric Structure)**: Interactive scroll-driven guided tour through the 5 critical relativistic zones: Event Horizon ($r_+$), Ergosphere, Photon Sphere ($r_{\text{ph}}$), Innermost Stable Circular Orbit ($\text{ISCO}$), and Relativistic Plasma Jets. Includes 3D screen-projected spatial markers.
3. **Star Cluster (S-Star Dynamics)**: 15,000 GPU-simulated stars obeying central Keplerian-Schwarzschild potentials. Click any star to lock camera tracking, view its orbital eccentricity $e$, semi-major axis $a$, orbital period $T$, and periapsis precession.
4. **Spacetime Lab**: Interactive laboratory with real-time sliders for Mass ($M/M_\odot$) and Spin parameter ($a/M$). Displays both the ray-marched asymmetric Kerr shadow and a 3D Flamm paraboloid spacetime embedding mesh ($z = 2\sqrt{r_s(r - r_s)}$).
5. **Time Dilation**: Live comparative experiment comparing an observer at infinity with a descent probe nearing the horizon. Demonstrates gravitational redshift factor $\alpha = \sqrt{1 - r_s/r}$ on probe clocks, visual frequency shifting, and acoustic pitch drop.
6. **Physics & Research (About / Field Guide)**: Rigorous mathematical derivations, tensor equations, astrophysical citations (Event Horizon Telescope, Genzel/Ghez Nobel research), and an interactive contact & researcher inquiry terminal.

---

## 2. User Experience & Visual Design

### Aesthetic Direction & Visual Identity
- **Canvas Atmosphere**: Obsidian void (`#030508` to `#070A10`) layered with procedural nebula dust and 15,000 stars.
- **Accretion Disk Palette**: Blackbody synchrotron emission gradient from 1,800 K (deep infrared amber `#7C2D12`) through 6,500 K (bright gold `#F59E0B`) up to 25,000 K (hot white `#FEF08A` and Doppler-boosted cobalt `#93C5FD`).
- **Typography**:
  - Display / Hero: `Plus Jakarta Sans` & `Space Grotesk` (clean, authoritative modern sans).
  - Data / Telemetry: `JetBrains Mono` / `tabular-nums` for coordinates, metric tensors, and time values.
- **Top Bar Contract**:
  - Zone 1: Wordmark `SAGITTARIUS A*` with astronomical designation (`Sgr A* · $4.15 \times 10^6 M_\odot$`).
  - Zone 2: Single-line navigation links (`Overview`, `Anatomy`, `Star Cluster`, `Spacetime Lab`, `Time Dilation`, `Physics`).
  - Zone 3: Audio synthesis toggle (`Audio: Active/Muted`) and quick action.
- **Viewport Ergonomics**:
  - 100% unobstructed central 3D viewport.
  - Collapsible bottom control dock (`▾ Controls / ▴ Hide`) with tabbed panels for camera presets, simulation speed, and metrics.
  - Zero pulsating dot anti-slop rules; static clean text telemetry.

---

## 3. Mathematical Implementations (Grounded in Relativity)

| Phenomenon | Formula / Implementation | Visual Expression |
| :--- | :--- | :--- |
| **Gravitational Lensing** | Null geodesic integration: $\frac{d^2u}{d\phi^2} + u = \frac{3GM}{c^2}u^2$; deflection $\hat{\alpha} \approx \frac{4GM}{c^2b}$ | Ray-marched light warping creating primary and secondary Einstein rings and inverted starfield behind black hole. |
| **Kerr Shadow & Frame Dragging** | Horizon $r_+ = \frac{GM}{c^2}(1 + \sqrt{1 - a^2})$; Ergosphere $r_E(\theta) = \frac{GM}{c^2}(1 + \sqrt{1 - a^2\cos^2\theta})$ | Asymmetric, D-shaped shadow shifted toward retrograde side as spin $a \to 1$. |
| **Accretion Disk Thermodynamics** | Shakura-Sunyaev temperature profile: $T(r) \propto r^{-3/4}\left[1 - \left(\frac{r_{\text{in}}}{r}\right)^{1/2}\right]^{1/4}$ | Inner disk shines with extreme hot white-blue; outer disk cools into deep infrared-gold. |
| **Relativistic Doppler Beaming** | $\delta = \frac{1}{\gamma(1 - \beta \cos\theta)}$, intensity $I_{\text{obs}} = I_{\text{emit}} \delta^4$, $\beta = \sqrt{r_s/(2r)}$ | Approaching side of disk is blindingly bright and blue-shifted; receding side is dimmed and redshifted. |
| **Gravitational Time Dilation** | Redshift factor $\frac{d\tau}{dt} = \sqrt{1 - \frac{r_s}{r}}$ | Clocks near horizon freeze; light shifts into deep red infrared; Web Audio pitch drops by octave. |
| **Spacetime Curvature Embedding** | Flamm paraboloid metric: $z(r) = 2\sqrt{r_s(r - r_s)}$ | 3D wireframe grid drawn below black hole dipping infinitely into the horizon throat. |
| **GPU Star Dynamics** | Symplectic Velocity-Verlet leapfrog: $\mathbf{a}_i = -\frac{GM \mathbf{r}_i}{(r_i^2 + \epsilon^2)^{3/2}} - \frac{3GM L_i^2}{c^2 r_i^5}\mathbf{r}_i$ | 15,000 stars orbit in high-eccentricity rosette orbits demonstrating Schwarzschild periapsis precession. |

---

## 4. Technical Architecture & System Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SAGITTARIUS A* PLATFORM                         │
│                                                                        │
│  ┌───────────────────────┐          ┌───────────────────────────────┐  │
│  │   Zustand Store       │          │   Web Audio Engine            │  │
│  │   - Mass & Spin       │◄────────►│   - Sub-bass 55Hz drone       │  │
│  │   - Camera Targets    │          │   - Synchrotron noise filter  │  │
│  │   - Star Selection    │          │   - Dilation pitch-shifter    │  │
│  │   - Time Dilation Tau │          └───────────────────────────────┘  │
│  └──────────┬────────────┘                                             │
│             │                                                          │
│  ┌──────────▼───────────────────────────────────────────────────────┐  │
│  │               Persistent WebGL / Three.js Canvas                 │  │
│  │                                                                  │  │
│  │  ┌─────────────────────┐  ┌──────────────────┐  ┌─────────────┐  │  │
│  │  │ Raymarching Shader  │  │ 15k GPGPU Stars  │  │ Flamm Grid  │  │  │
│  │  │ - Null geodesics    │  │ - Ping-pong FBO  │  │ - 3D funnel │  │  │
│  │  │ - Doppler beaming   │  │ - Verlet orbits  │  │ - Curvature │  │  │
│  │  │ - Kerr shadow       │  │ - Rosette motion │  │   mesh      │  │  │
│  │  └─────────────────────┘  └──────────────────┘  └─────────────┘  │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ Camera Spline Controller (Critically Damped Springs)       │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌─────────────────────────────────▼───────────────────────────────┐  │
│  │                      React Application Router                    │  │
│  │                                                                  │  │
│  │   /           /anatomy     /cluster     /lab      /dilation  /about │
│  │  (Hero)      (5 Zones)    (Inspect)   (Sliders)   (Clocks)  (Math)  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ Ergonomic Collapsible Bottom Control Dock & Top Bar        │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Phased Execution Plan

- **Phase 1: Dependencies & Mathematical Core**:
  - Install `three`, `@types/three`, `zustand`, `lucide-react`, and math utilities.
  - Configure central simulation state store (`useBlackHoleStore`).
  - Implement Web Audio synthesizer for gravitational hum and pitch-shifting dilation.
- **Phase 2: Persistent WebGL Scene & Relativistic Shaders**:
  - Create persistent Three.js canvas with GLSL WebGL2 shaders for gravitational lensing, null geodesics, blackbody radiation, and Doppler beaming.
  - Implement Kerr frame-dragging parameter to warp shadow geometry dynamically.
  - Construct 3D Flamm paraboloid spacetime curvature grid with dynamic vertex displacement.
- **Phase 3: 15,000 GPGPU Star Orbit Simulation**:
  - Implement double-buffered ping-pong float textures (position & velocity) with symplectic Verlet integration.
  - Add rosette precession and relativistic orbit decay.
  - Implement raycasting star selection to track individual stars and show real-time orbital elements.
- **Phase 4: Multi-Page Views & Spring Choreography**:
  - Build the 6 complete views: Home, Anatomy, Star Cluster, Spacetime Lab, Time Dilation, and About/Math.
  - Smooth camera spline choreography that seamlessly moves the viewpoint between pages without re-rendering the canvas.
  - Gravitational lens page warp transition effect.
- **Phase 5: Responsive Polish, Accessibility & Verification**:
  - Collapsible bottom control dock with keyboard shortcuts (`H` to hide, `Space` to pause, `1-6` for pages).
  - Software WebGL detection and adaptive resolution scaling for 60fps performance.
  - Compilation and verification.
