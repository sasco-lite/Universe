# Sagittarius A* — Relativistic Supermassive Black Hole Simulation

An interactive 3D WebGL and General Relativity simulation of Sagittarius A*, the rotating Kerr supermassive black hole at the center of the Milky Way galaxy, surrounded by 15,000 relativistic S-cluster stars.

---

## What's New in this Release

1. **Enhanced Real-Time Interactivity**:
   - **Inertial Camera**: Drag-to-orbit and scroll-to-zoom with spring-damped rotational inertia and momentum decay.
   - **Interactive Gravity Well Spawner**: Click or hold anywhere on the canvas to spawn a transient gravitational attractor that visibly bends light rays and pulls nearby stars.
   - **Star Slingshot Launcher**: Interactive orbital injection tool to fire custom stars into spacetime at customizable altitude $r_0$, velocity $v_0$, and heading $\theta$ (watch them orbit, plunge into the horizon, or escape).
   - **Star Hover & Tracking**: Hovering any star highlights it and anchors a lightweight 3D name and velocity badge; click to follow its orbital journey in real time.
   - **Interactive Descent Probe**: In the Spacetime Lab and Time Dilation pages, a draggable probe falls along radial geodesics towards the event horizon with live readouts of $d\tau/dt$, redshift $1+z$, and orbital speed $v/c$.
   - **Keyboard Shortcuts & Onboarding**: `[Space]` pause/resume, `[R]` reset simulation, `[H]` toggle minimal UI (hide all text), `[L]` deep dive learn-more drawer, and `[1-6]` to jump between pages.
   - **Subtle Mobile Haptics**: Tactile feedback on touch interactions via `navigator.vibrate`.

2. **60% Text Reduction & Peripheral Clean UI**:
   - Central 3D viewport remains 100% unobstructed.
   - Dense paragraphs replaced with compact 3–5 word labels and real-time numeric badges.
   - Information positioned at the peripheral edges or projected in 3D next to celestial bodies.
   - Deep mathematical and physical theory moved into a collapsible "Learn More" drawer (`L` key).
   - Zen / Minimal UI mode (`H` key) hides all DOM text for pure cinematic inspection.

3. **Audio Boost & Acoustic Dilation**:
   - Output volume increased significantly with richer sub-bass resonance and accretion turbulence.
   - Interactive acoustic cues for gravity well spawning, star slingshot launches, and star hovering.
   - Real-time pitch-shifting tied to observer gravitational time dilation $\sqrt{1 - r_s/r}$.

4. **Engine & Stability Hardening**:
   - `webglcontextlost` and `webglcontextrestored` event handlers.
   - Full shader NaN guards across mathematical square roots, powers, and division operations.
   - Comprehensive resource disposal on unmount for zero memory leaks.

---

## Keyboard Shortcuts

- `[Space]` — Pause / Resume orbital simulation
- `[R]` — Reset camera, mass, spin, and probe coordinates
- `[H]` — Toggle Minimal UI (Hide all text overlays)
- `[L]` — Open Scientific Deep Dive drawer
- `[1 - 6]` — Jump between pages (1: Overview, 2: Anatomy, 3: S-Stars, 4: Lab, 5: Dilation, 6: Physics)
- `[Hold Left Click]` — Spawn and drag a transient gravity well

---

## Local Development & Deployment

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build
```

Deployable to Vercel and GitHub without any environment variable requirements.
