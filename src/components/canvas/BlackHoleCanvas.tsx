import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import {
  blackHoleVertexShader,
  blackHoleFragmentShader,
} from '../../shaders/blackHoleRaymarch';
import { StarClusterScene } from './StarClusterScene';
import { FlammParaboloidGrid } from './FlammParaboloidGrid';
import { soundEngine, triggerHaptic } from '../../audio/BlackHoleAudio';

// Pre-allocated math helpers for zero GC
const _camPos = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();
const _desiredLookAt = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _planeIntersect = new THREE.Vector3();
const _dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export const BlackHoleCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoverBadge, setHoverBadge] = useState<{ name: string; x: number; y: number; vel: number } | null>(null);

  const {
    targetCameraPos,
    targetCameraLookAt,
    massSolar,
    spinParameter,
    diskBrightness,
    diskTemperature,
    dopplerBeaming,
    gravitationalLensing,
    showSpacetimeGrid,
    gridDepth,
    simulationSpeed,
    isPaused,
    starCount,
    followSelectedStar,
    selectedStar,
    setSelectedStar,
    setHoveredStar,
    setCurrentCameraDistanceRs,
    advanceDilationTime,
    gravityWell,
    setGravityWell,
    launchedStars,
    updateLaunchedStars,
  } = useBlackHoleStore();

  const stateRef = useRef({
    targetCameraPos,
    targetCameraLookAt,
    massSolar,
    spinParameter,
    diskBrightness,
    diskTemperature,
    dopplerBeaming,
    gravitationalLensing,
    showSpacetimeGrid,
    gridDepth,
    simulationSpeed,
    isPaused,
    starCount,
    followSelectedStar,
    selectedStar,
    gravityWell,
    launchedStars,
  });

  useEffect(() => {
    stateRef.current = {
      targetCameraPos,
      targetCameraLookAt,
      massSolar,
      spinParameter,
      diskBrightness,
      diskTemperature,
      dopplerBeaming,
      gravitationalLensing,
      showSpacetimeGrid,
      gridDepth,
      simulationSpeed,
      isPaused,
      starCount,
      followSelectedStar,
      selectedStar,
      gravityWell,
      launchedStars,
    };
  }, [
    targetCameraPos,
    targetCameraLookAt,
    massSolar,
    spinParameter,
    diskBrightness,
    diskTemperature,
    dopplerBeaming,
    gravitationalLensing,
    showSpacetimeGrid,
    gridDepth,
    simulationSpeed,
    isPaused,
    starCount,
    followSelectedStar,
    selectedStar,
    gravityWell,
    launchedStars,
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      250.0
    );
    camera.position.set(0, 6, 26);
    _camPos.copy(camera.position);
    _camTarget.set(0, 0, 0);

    // 2. WebGL2 Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    // Context loss & restore handlers
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animId);
    };
    const onContextRestored = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      animId = requestAnimationFrame(animate);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // 3. Black Hole Raymarching Quad
    const rs = 2.0;
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadMat = new THREE.ShaderMaterial({
      vertexShader: blackHoleVertexShader,
      fragmentShader: blackHoleFragmentShader,
      uniforms: {
        uCameraPos: { value: camera.position },
        uCameraWorldMatrix: { value: camera.matrixWorld },
        uCameraProjectionInverse: { value: camera.projectionMatrixInverse },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        uMass: { value: 1.0 },
        uSpin: { value: 0.85 },
        uDiskBrightness: { value: 1.0 },
        uDiskTemperature: { value: 8500.0 },
        uDopplerBeaming: { value: true },
        uGravitationalLensing: { value: true },
        uRs: { value: rs },
        uGravityWell: { value: new THREE.Vector4(0, 0, 0, 0) },
      },
      depthWrite: false,
      depthTest: false,
    });
    const raymarchQuad = new THREE.Mesh(quadGeo, quadMat);
    raymarchQuad.renderOrder = -10;
    scene.add(raymarchQuad);

    // 4. 15,000 GPU Stars Simulation
    const starCluster = new StarClusterScene(15000, rs);
    scene.add(starCluster.points);
    scene.add(starCluster.orbitTrailMesh);

    // 5. Flamm's Paraboloid Spacetime Grid
    const flammGrid = new FlammParaboloidGrid(rs, 36.0, 48, 64);
    scene.add(flammGrid.mesh);

    // 6. Launched Stars Rendering Object
    const launchedGeo = new THREE.BufferGeometry();
    const launchedMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 6.0,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const launchedPoints = new THREE.Points(launchedGeo, launchedMat);
    scene.add(launchedPoints);

    // 7. Camera Inertia & Spring State
    const spring = {
      pos: new THREE.Vector3().copy(camera.position),
      vel: new THREE.Vector3(0, 0, 0),
      targetPos: new THREE.Vector3().copy(camera.position),
      lookAt: new THREE.Vector3(0, 0, 0),
      lookVel: new THREE.Vector3(0, 0, 0),
      targetLookAt: new THREE.Vector3(0, 0, 0),
      omega: 4.2,
    };

    // Rotational inertia system
    let isDragging = false;
    let isHoldingGravityWell = false;
    let holdTimer = 0;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let azimuthAngle = 0;
    let elevationAngle = 0.22;
    let azimuthVel = 0;
    let elevationVel = 0;
    let cameraOrbitDist = 26;
    let targetOrbitDist = 26;

    const gravityWellWorldPos = new THREE.Vector3();
    let currentWellStrength = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      azimuthVel = 0;
      elevationVel = 0;

      // Unproject pointer for gravity well
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_mouse, camera);

      _raycaster.ray.intersectPlane(_dragPlane, _planeIntersect);
      if (_planeIntersect) {
        gravityWellWorldPos.copy(_planeIntersect);
      } else {
        _raycaster.ray.at(18, gravityWellWorldPos);
      }

      holdTimer = window.setTimeout(() => {
        isHoldingGravityWell = true;
        currentWellStrength = 1.0;
        soundEngine.playGravityWellHum(1.0);
        triggerHaptic(30);
        setGravityWell({
          x: gravityWellWorldPos.x,
          y: gravityWellWorldPos.y,
          z: gravityWellWorldPos.z,
          strength: 1.0,
          active: true,
        });
      }, 260);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const moveDist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      if (moveDist > 6 && !isHoldingGravityWell) {
        clearTimeout(holdTimer);
      }

      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        if (isHoldingGravityWell) {
          // Drag gravity well in real time
          _raycaster.setFromCamera(_mouse, camera);
          _raycaster.ray.at(18, gravityWellWorldPos);
          setGravityWell({
            x: gravityWellWorldPos.x,
            y: gravityWellWorldPos.y,
            z: gravityWellWorldPos.z,
            strength: currentWellStrength,
            active: true,
          });
        } else {
          // Camera orbit drag with momentum tracking
          const deltaAz = -dx * 0.005;
          const deltaEl = -dy * 0.005;

          azimuthAngle += deltaAz;
          elevationAngle = Math.max(-1.45, Math.min(1.45, elevationAngle + deltaEl));

          azimuthVel = deltaAz;
          elevationVel = deltaEl;
        }
      } else {
        // Hover raycast for star highlighting (when not dragging)
        _raycaster.setFromCamera(_mouse, camera);
        const closestStarId = starCluster.findClosestStar(
          _raycaster.ray,
          clock.getElapsedTime(),
          stateRef.current.simulationSpeed,
          1.4
        );

        if (closestStarId !== null) {
          const starData = starCluster.getStarData(
            closestStarId,
            clock.getElapsedTime(),
            stateRef.current.simulationSpeed,
            stateRef.current.massSolar
          );
          setHoveredStar(starData);

          // Project star position into 2D screen coordinate
          const starPos = starCluster.getStarPositionAtTime(
            closestStarId,
            clock.getElapsedTime(),
            stateRef.current.simulationSpeed
          );
          const screenPos = starPos.clone().project(camera);
          const sx = ((screenPos.x + 1) / 2) * rect.width;
          const sy = ((-screenPos.y + 1) / 2) * rect.height;
          setHoverBadge({
            name: starData.name,
            x: sx,
            y: sy,
            vel: starData.currentVelocityKmS,
          });
        } else {
          setHoveredStar(null);
          setHoverBadge(null);
        }
      }
    };

    const onPointerUp = () => {
      clearTimeout(holdTimer);
      isDragging = false;
      if (isHoldingGravityWell) {
        isHoldingGravityWell = false;
        currentWellStrength = 0;
        setGravityWell({
          x: gravityWellWorldPos.x,
          y: gravityWellWorldPos.y,
          z: gravityWellWorldPos.z,
          strength: 0,
          active: false,
        });
      }
    };

    const onWheel = (e: WheelEvent) => {
      targetOrbitDist = Math.max(4.5, Math.min(55, targetOrbitDist + e.deltaY * 0.025));
    };

    const onCanvasClick = (e: MouseEvent) => {
      const moveDist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      if (moveDist > 5) return; // was a drag, ignore click

      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_mouse, camera);

      const closestStarId = starCluster.findClosestStar(
        _raycaster.ray,
        clock.getElapsedTime(),
        stateRef.current.simulationSpeed,
        1.8
      );

      if (closestStarId !== null) {
        const starData = starCluster.getStarData(
          closestStarId,
          clock.getElapsedTime(),
          stateRef.current.simulationSpeed,
          stateRef.current.massSolar
        );
        setSelectedStar(starData);
        starCluster.updateOrbitTrail(
          closestStarId,
          clock.getElapsedTime(),
          stateRef.current.simulationSpeed
        );
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: true });
    domElement.addEventListener('click', onCanvasClick);

    // 8. Animation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.1);
      const totalTime = clock.getElapsedTime();
      const state = stateRef.current;

      // Update simulation time
      if (!state.isPaused) {
        advanceDilationTime(dt * state.simulationSpeed);
        updateLaunchedStars(dt * state.simulationSpeed, rs);
      }

      // Smooth camera orbit distance spring
      cameraOrbitDist += (targetOrbitDist - cameraOrbitDist) * (1 - Math.exp(-8.0 * dt));

      // Rotational inertia decay when not dragging
      if (!isDragging && !state.followSelectedStar) {
        azimuthAngle += azimuthVel;
        elevationAngle = Math.max(-1.45, Math.min(1.45, elevationAngle + elevationVel));
        azimuthVel *= Math.pow(0.92, dt * 60);
        elevationVel *= Math.pow(0.92, dt * 60);
      }

      // Check camera target
      if (state.followSelectedStar && state.selectedStar) {
        const starIndex = state.selectedStar.id - 1;
        const starPos = starCluster.getStarPositionAtTime(
          starIndex,
          totalTime,
          state.simulationSpeed
        );
        _desiredLookAt.copy(starPos);
        _desiredPos.copy(starPos).add(new THREE.Vector3(2.5, 1.8, 3.5));
        spring.targetPos.copy(_desiredPos);
        spring.targetLookAt.copy(_desiredLookAt);
      } else if (isDragging || Math.abs(azimuthVel) > 0.0001 || Math.abs(elevationVel) > 0.0001) {
        const cosEl = Math.cos(elevationAngle);
        spring.targetPos.set(
          Math.sin(azimuthAngle) * cosEl * cameraOrbitDist,
          Math.sin(elevationAngle) * cameraOrbitDist,
          Math.cos(azimuthAngle) * cosEl * cameraOrbitDist
        );
      } else {
        spring.targetPos.set(
          state.targetCameraPos[0],
          state.targetCameraPos[1],
          state.targetCameraPos[2]
        );
        spring.targetLookAt.set(
          state.targetCameraLookAt[0],
          state.targetCameraLookAt[1],
          state.targetCameraLookAt[2]
        );
      }

      // Critically damped spring simulation for camera
      const omega = spring.omega;
      const posDiff = new THREE.Vector3().subVectors(spring.pos, spring.targetPos);
      const accel = new THREE.Vector3()
        .copy(spring.vel)
        .multiplyScalar(-2.0 * omega)
        .sub(posDiff.multiplyScalar(omega * omega));

      spring.vel.addScaledVector(accel, dt);
      spring.pos.addScaledVector(spring.vel, dt);
      camera.position.copy(spring.pos);

      const lookDiff = new THREE.Vector3().subVectors(spring.lookAt, spring.targetLookAt);
      const lookAccel = new THREE.Vector3()
        .copy(spring.lookVel)
        .multiplyScalar(-2.0 * omega)
        .sub(lookDiff.multiplyScalar(omega * omega));

      spring.lookVel.addScaledVector(lookAccel, dt);
      spring.lookAt.addScaledVector(spring.lookVel, dt);
      camera.lookAt(spring.lookAt);

      camera.updateMatrixWorld();
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

      // Telemetry update
      const camDist = camera.position.length();
      const camDistRs = camDist / rs;
      setCurrentCameraDistanceRs(Number(camDistRs.toFixed(2)));

      // Sound update
      const dilationFactor = camDistRs <= 1.0 ? 0.05 : Math.sqrt(1 - 1.0 / camDistRs);
      soundEngine.updatePhysics(camDistRs, dilationFactor, state.spinParameter);

      // Update Raymarch Quad uniforms
      quadMat.uniforms.uCameraPos.value.copy(camera.position);
      quadMat.uniforms.uCameraWorldMatrix.value.copy(camera.matrixWorld);
      quadMat.uniforms.uCameraProjectionInverse.value.copy(camera.projectionMatrixInverse);
      quadMat.uniforms.uTime.value = totalTime;
      quadMat.uniforms.uSpin.value = state.spinParameter;
      quadMat.uniforms.uDiskBrightness.value = state.diskBrightness;
      quadMat.uniforms.uDiskTemperature.value = state.diskTemperature;
      quadMat.uniforms.uDopplerBeaming.value = state.dopplerBeaming;
      quadMat.uniforms.uGravitationalLensing.value = state.gravitationalLensing;

      // Update transient gravity well uniform
      if (state.gravityWell.active) {
        quadMat.uniforms.uGravityWell.value.set(
          state.gravityWell.x,
          state.gravityWell.y,
          state.gravityWell.z,
          state.gravityWell.strength
        );
      } else {
        quadMat.uniforms.uGravityWell.value.set(0, 0, 0, 0);
      }

      // Update Launched Stars geometry
      if (state.launchedStars.length > 0) {
        const activeStars = state.launchedStars.filter((s) => s.status === 'orbiting');
        const starPositions = new Float32Array(activeStars.length * 3);
        activeStars.forEach((s, idx) => {
          starPositions[idx * 3] = s.pos[0];
          starPositions[idx * 3 + 1] = s.pos[1];
          starPositions[idx * 3 + 2] = s.pos[2];
        });
        launchedGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        launchedPoints.visible = true;
      } else {
        launchedPoints.visible = false;
      }

      // Update GPU Stars & Grid
      starCluster.update(totalTime, state.simulationSpeed, state.isPaused);
      flammGrid.update(rs, state.gridDepth, state.showSpacetimeGrid);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      quadMat.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', onCanvasClick);

      starCluster.dispose();
      flammGrid.dispose();
      quadGeo.dispose();
      quadMat.dispose();
      launchedGeo.dispose();
      launchedMat.dispose();
      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden select-none bg-black"
      style={{ touchAction: 'none' }}
    >
      {/* 3D-Anchored Hover Badge on Stars */}
      {hoverBadge && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-md bg-slate-900/90 border border-blue-400/50 text-[11px] font-mono text-blue-200 shadow-xl backdrop-blur-sm z-20 flex items-center gap-1.5 transition-opacity duration-150"
          style={{
            left: `${hoverBadge.x}px`,
            top: `${hoverBadge.y - 10}px`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="font-semibold text-white">{hoverBadge.name}</span>
          <span className="text-slate-400">·</span>
          <span className="text-amber-300 tabular-nums">{hoverBadge.vel.toLocaleString()} km/s</span>
        </div>
      )}

      {/* Transient Gravity Well Ring Visualizer */}
      {gravityWell.active && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-amber-400/60 animate-ping opacity-60" />
        </div>
      )}
    </div>
  );
};
