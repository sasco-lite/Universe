import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useBlackHoleStore } from '../../store/useBlackHoleStore';
import {
  blackHoleVertexShader,
  blackHoleFragmentShader,
} from '../../shaders/blackHoleRaymarch';
import { StarClusterScene } from './StarClusterScene';
import { FlammParaboloidGrid } from './FlammParaboloidGrid';
import { soundEngine } from '../../audio/BlackHoleAudio';

// Pre-allocated math helpers for zero GC in animation loop
const _camPos = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();
const _desiredLookAt = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export const BlackHoleCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store access
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
    setCurrentCameraDistanceRs,
    advanceDilationTime,
  } = useBlackHoleStore();

  // Mutable refs to prevent React state re-renders from restarting the loop
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
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL to adapt quality gracefully
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

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      200.0
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

    // 3. Black Hole Raymarching Quad
    const rs = 2.0; // Schwarzschild radius in scene units
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
      },
      depthWrite: false,
      depthTest: false,
    });
    const raymarchQuad = new THREE.Mesh(quadGeo, quadMat);
    // Put quad in background plane
    raymarchQuad.renderOrder = -10;
    scene.add(raymarchQuad);

    // 4. 15,000 GPU Stars Simulation
    const starCluster = new StarClusterScene(15000, rs);
    scene.add(starCluster.points);
    scene.add(starCluster.orbitTrailMesh);

    // 5. Flamm's Paraboloid Spacetime Grid
    const flammGrid = new FlammParaboloidGrid(rs, 36.0, 48, 64);
    scene.add(flammGrid.mesh);

    // 6. Camera spring physics state (second-order critically damped system)
    const spring = {
      pos: new THREE.Vector3().copy(camera.position),
      vel: new THREE.Vector3(0, 0, 0),
      targetPos: new THREE.Vector3().copy(camera.position),
      lookAt: new THREE.Vector3(0, 0, 0),
      lookVel: new THREE.Vector3(0, 0, 0),
      targetLookAt: new THREE.Vector3(0, 0, 0),
      omega: 3.8, // Angular frequency of spring
    };

    // Orbit controls / mouse drag state
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let azimuthAngle = 0;
    let elevationAngle = 0.22;
    let cameraOrbitDist = 26;

    const onPointerDown = (e: PointerEvent) => {
      // Only drag if left click and not interacting with UI
      if (e.button === 0) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      azimuthAngle -= dx * 0.005;
      elevationAngle = Math.max(-1.45, Math.min(1.45, elevationAngle - dy * 0.005));

      // Calculate manual orbital offset
      const cosEl = Math.cos(elevationAngle);
      spring.targetPos.set(
        Math.sin(azimuthAngle) * cosEl * cameraOrbitDist,
        Math.sin(elevationAngle) * cameraOrbitDist,
        Math.cos(azimuthAngle) * cosEl * cameraOrbitDist
      );
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      cameraOrbitDist = Math.max(4.5, Math.min(55, cameraOrbitDist + e.deltaY * 0.02));
      const cosEl = Math.cos(elevationAngle);
      spring.targetPos.set(
        Math.sin(azimuthAngle) * cosEl * cameraOrbitDist,
        Math.sin(elevationAngle) * cameraOrbitDist,
        Math.cos(azimuthAngle) * cosEl * cameraOrbitDist
      );
    };

    // Star Selection Raycasting
    const onCanvasClick = (e: MouseEvent) => {
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

    // 7. Animation Loop with Spring Physics
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
      }

      // Check if following a selected star
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
      } else if (!isDragging) {
        // Track target from active page preset
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

      // Critically damped spring simulation for camera position:
      // acceleration = -2 * omega * vel - omega^2 * (pos - target)
      const omega = spring.omega;
      const posDiff = new THREE.Vector3().subVectors(spring.pos, spring.targetPos);
      const accel = new THREE.Vector3()
        .copy(spring.vel)
        .multiplyScalar(-2.0 * omega)
        .sub(posDiff.multiplyScalar(omega * omega));

      spring.vel.addScaledVector(accel, dt);
      spring.pos.addScaledVector(spring.vel, dt);
      camera.position.copy(spring.pos);

      // Critically damped spring for camera lookAt
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

      // Audio engine frequency & noise modulation
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

      // Update GPU Star Cluster
      starCluster.update(totalTime, state.simulationSpeed, state.isPaused);

      // Update Flamm Grid
      flammGrid.update(rs, state.gridDepth, state.showSpacetimeGrid);

      // Render Scene
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Resize listener
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
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', onCanvasClick);

      starCluster.dispose();
      flammGrid.dispose();
      quadGeo.dispose();
      quadMat.dispose();
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
    />
  );
};
