# Sagittarius A* — Interactivity, Text Reduction & Hardening Plan

Revised architectural blueprint incorporating heightened real-time interactions, aggressive text reduction, boosted audio presence, and comprehensive error/performance hardening.

---

> [!IMPORTANT]
> **Key Refinement Goals**
> - **Interaction Upgrades**:
>   1. Drag-to-orbit and scroll-to-zoom with spring-damped rotational inertia.
>   2. Click/hold to spawn a transient gravity well that bends nearby stars and dynamically curves the raymarched light.
>   3. Hover-to-highlight stars with 3D tooltip names; click to lock/follow orbit.
>   4. Interactive "Launch a Star" tool: drag-to-aim slingshot vector with velocity preview to fling stars into orbit, plunge into horizon, or escape to infinity.
>   5. Interactive Draggable Probe in Spacetime Lab / Time Dilation with live physical readout of local $\frac{d\tau}{dt}$, redshift $\lambda_{\text{obs}}$, and fall trajectory.
>   6. Keyboard shortcuts (`Space` to pause, `R` to reset camera/simulation, `1-6` for pages, `H` for minimal UI / hide all text) with subtle fading onboarding hint.
>   7. Haptic feedback on mobile (`navigator.vibrate`) and distinct soft audio feedback for every interaction.
> - **Text & UI Diet (60% Reduction)**:
>   1. Eliminate dense copy blocks; replace with short 3–6 word metrics and clean numbers.
>   2. Keep screen center 100% clear. Position data at peripheral edges or anchored in 3D space near relevant features.
>   3. Context-sensitive reveals: text only displays when looking at a feature or hovering, fading out when the moment passes.
>   4. Deep explanations relegated to a clean collapsible "Learn More" sheet (closed by default).
>   5. "Minimal UI" toggle (`H` key or top-right toggle) that vanishes all HUD text for pure cinematic inspection.
> - **Sound & Stability Hardening**:
>   1. Boost audio output volume, add richer harmonic sub-bass resonance and interactive slingshot / gravity well acoustic cues.
>   2. Audio initiation guard strictly on first user interaction to comply with browser autoplay policies.
>   3. Full WebGL context loss / restore handling (`webglcontextlost` / `webglcontextrestored`).
>   4. Protect shaders against NaN and divide-by-zero near horizons.
>   5. Complete memory leak audit (geometry, material, and event listener disposal).

---

## 1. Interaction Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                          INTERACTION PIPELINE                          │
│                                                                        │
│   [ Mouse / Touch Input ]                                              │
│          │                                                             │
│          ├─► Orbit Drag & Wheel Zoom ──► Spring Inertia Damper         │
│          │                                                             │
│          ├─► Click / Hold ─────────────► Transient Gravity Well        │
│          │                               (Bends rays & GPU stars)      │
│          │                                                             │
│          ├─► Star Launcher Drag ───────► Slingshot Vector              │
│          │                               (Spawns new live star orbit)  │
│          │                                                             │
│          ├─► Draggable Probe ──────────► Geodesic Descent Solver       │
│          │                               (Local dτ/dt & Redshift)      │
│          │                                                             │
│          └─► Star Hover / Raycast ─────► 3D Floating Name Anchor       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Order of Execution

1. **Phase 1: Error & Engine Hardening (Fix First)**
   - Audit `blackHoleRaymarch.ts` for potential shader NaNs (ensure `max(0.0001, ...)` everywhere, especially in sqrt and division by $r$).
   - Add `webglcontextlost` and `webglcontextrestored` handlers to prevent canvas crash.
   - Boost Web Audio gain levels by +6dB, add transient gravity well audio frequency drops and slingshot whoosh.
   - Add mobile haptic feedback helper (`navigator.vibrate([15])`).
   - Audit all geometries/materials for disposal.

2. **Phase 2: Advanced Interaction Systems**
   - **Inertial Spring Camera**: Upgrade pointer handling with momentum decay when released.
   - **Gravity Well Spawner**: Allow user to click/hold anywhere to generate a secondary attractor $(x, y, z)$ that perturbs star positions and feeds a uniform `uPerturber` into the raymarch shader.
   - **Interactive Star Launcher**: Slingshot drag UI on the Star Cluster page to inject custom test stars with initial velocity vector $\mathbf{v}_0$.
   - **Draggable Probe**: Interactive slider and 3D draggable probe widget in Spacetime Lab / Time Dilation.
   - **Star Hover Tooltip**: High-performance raycasting on pointer move displaying a lightweight 3D anchored name badge.
   - **Global Shortcuts**: `Space` (pause), `R` (reset), `H` (minimal UI toggle), `1-6` (pages), with an auto-fading helper pill.

3. **Phase 3: Text Reduction & Smarter Reveals**
   - Cut all paragraph copy by 60%.
   - Redesign `TopNav`, `BottomDock`, `HomePage`, `AnatomyPage`, `StarClusterPage`, `SpacetimeLabPage`, `TimeDilationPage`, and `AboutPage` to use compact tabular metrics.
   - Add collapsible "Learn More" drawer for deep theory and math.
   - Support `minimalUI` mode where all DOM text fades to 0% opacity on pressing `H` or toggling Zen mode.
