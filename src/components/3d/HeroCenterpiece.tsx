"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";
import type { ThreeDVisualConfig } from "@/types/visual-config";
import { DEFAULT_THREED_CONFIG } from "@/types/visual-config";

interface HeroCenterpieceProps {
  photoUrl?: string | null;
  displayName?: string;
  config?: ThreeDVisualConfig;
  onPhotoClick?: () => void;
}

export default function HeroCenterpiece({
  photoUrl = "/uploads/Screenshot_2026-11-06_123841_1794398898180.png",
  displayName = "Kartik Khajuria",
  config,
  onPhotoClick,
}: HeroCenterpieceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { currentTheme, animations } = useTheme();

  const activeConfig = config || DEFAULT_THREED_CONFIG;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, activeConfig.cameraDistance || 7.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);

    // --- Dynamic Theme Colors Extraction ---
    const primaryHex = currentTheme.colors.primary || "#873EFF";
    const secondaryHex = currentTheme.colors.secondary || "#FF5A1F";
    const accentHex = currentTheme.colors.accent || "#00D9FF";

    const primaryColor = new THREE.Color(primaryHex);
    const secondaryColor = new THREE.Color(secondaryHex);
    const accentColor = new THREE.Color(accentHex);

    const lightMultiplier = (activeConfig.lightingIntensity ?? 1.2) / 1.2;

    // --- Multi-Point Cinematic Studio Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0e0d16, 2.8 * lightMultiplier);
    scene.add(ambientLight);

    // Key Light (Primary theme color)
    const keyLight = new THREE.DirectionalLight(primaryColor, 5.5 * lightMultiplier);
    keyLight.position.set(-5, 6, 5);
    scene.add(keyLight);

    // Fill Light (Secondary theme color)
    const fillLight = new THREE.DirectionalLight(secondaryColor, 4.8 * lightMultiplier);
    fillLight.position.set(6, -4, 4);
    scene.add(fillLight);

    // Back Rim Light (Accent cyan/neon for edge highlight)
    const rimLight = new THREE.PointLight(accentColor, 6.0 * lightMultiplier, 22);
    rimLight.position.set(0, 5, -3.5);
    scene.add(rimLight);

    // Interactive Cursor Following Spotlight
    const cursorLight = new THREE.PointLight(0xffffff, 3.5 * lightMultiplier, 14);
    cursorLight.position.set(0, 0, 4);
    scene.add(cursorLight);

    // Soft Bottom Bounce Light
    const bounceLight = new THREE.PointLight(secondaryColor, 3.0 * lightMultiplier, 12);
    bounceLight.position.set(0, -4.5, 2);
    scene.add(bounceLight);

    // --- Master 3D Group ---
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Floating subtle halo behind the composition
    const haloGeo = new THREE.RingGeometry(2.0, 3.8, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0, -2.0);
    scene.add(haloMesh);

    // --- Centerpiece: Holographic 3D Portrait Monolith ---
    const portraitGroup = new THREE.Group();
    masterGroup.add(portraitGroup);

    // Elegant proportional card dimensions
    const cardWidth = 2.05;
    const cardHeight = 2.75;
    const cardDepth = 0.12;

    // Outer Chrome & Obsidian Bevel Frame
    const frameGeo = new THREE.BoxGeometry(
      cardWidth + 0.14,
      cardHeight + 0.14,
      cardDepth
    );
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a14,
      metalness: 0.95,
      roughness: 0.12,
      emissive: primaryColor,
      emissiveIntensity: 0.25,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    portraitGroup.add(frameMesh);

    // Holographic Edge Glow Wireframe Rim
    const wireframeGeo = new THREE.BoxGeometry(
      cardWidth + 0.18,
      cardHeight + 0.18,
      cardDepth + 0.03
    );
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    portraitGroup.add(wireframeMesh);

    // Front Portrait Plane with actual profile photo
    const portraitPlaneGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);

    const textureLoader = new THREE.TextureLoader();
    const effectivePhoto = photoUrl || "/uploads/Screenshot_2026-11-06_123841_1794398898180.png";

    const portraitTex = textureLoader.load(
      effectivePhoto,
      () => {
        setImageLoaded(true);
      },
      undefined,
      () => {
        setImageLoaded(false);
      }
    );
    portraitTex.generateMipmaps = true;
    portraitTex.minFilter = THREE.LinearMipmapLinearFilter;

    const portraitMat = new THREE.MeshStandardMaterial({
      map: portraitTex,
      metalness: 0.2,
      roughness: 0.35,
      side: THREE.FrontSide,
    });

    const portraitMesh = new THREE.Mesh(portraitPlaneGeo, portraitMat);
    portraitMesh.position.set(0, 0, cardDepth / 2 + 0.005);
    portraitGroup.add(portraitMesh);

    // Back Surface: Futuristic Cybernetic Plate
    const backPlaneGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x090710,
      metalness: 0.9,
      roughness: 0.2,
      emissive: secondaryColor,
      emissiveIntensity: 0.2,
      side: THREE.BackSide,
    });
    const backMesh = new THREE.Mesh(backPlaneGeo, backMat);
    backMesh.position.set(0, 0, -cardDepth / 2 - 0.005);
    portraitGroup.add(backMesh);

    // Holographic Glass Reflection Overlay on Front of Portrait
    const glassOverlayGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const glassOverlayMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      roughness: 0.06,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.45,
      blending: THREE.AdditiveBlending,
    });
    const glassOverlayMesh = new THREE.Mesh(glassOverlayGeo, glassOverlayMat);
    glassOverlayMesh.position.set(0, 0, cardDepth / 2 + 0.015);
    portraitGroup.add(glassOverlayMesh);

    // Initial graceful perspective tilt & visual config bindings
    portraitGroup.rotation.y = 0.15;
    portraitGroup.rotation.x = 0.04;
    portraitGroup.visible = activeConfig.monolithVisible !== false;
    portraitGroup.scale.setScalar(activeConfig.monolithScale || 1.0);
    wireframeMesh.visible = activeConfig.monolithWireframe !== false;

    // --- Orbiting Element 1: Concentric Metallic Gimbal Rings ---
    const gimbalGroup = new THREE.Group();
    gimbalGroup.visible = activeConfig.ringsVisible !== false;
    masterGroup.add(gimbalGroup);

    // Ring 1 (Primary Electric Orbit)
    const ring1Geo = new THREE.TorusGeometry(2.15, 0.02, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.95,
      roughness: 0.1,
      emissive: primaryColor,
      emissiveIntensity: 0.65,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    gimbalGroup.add(ring1);

    // Ring 2 (Secondary Molten Accent)
    const ring2Geo = new THREE.TorusGeometry(2.45, 0.018, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      metalness: 0.92,
      roughness: 0.12,
      emissive: secondaryColor,
      emissiveIntensity: 0.7,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    gimbalGroup.add(ring2);

    // Ring 3 (Outer Cyan Gyroscope)
    const ring3Geo = new THREE.TorusGeometry(2.78, 0.015, 16, 120);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.98,
      roughness: 0.08,
      emissive: accentColor,
      emissiveIntensity: 0.55,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.z = Math.PI / 6;
    ring3.rotation.y = -Math.PI / 3;
    gimbalGroup.add(ring3);

    // --- Orbiting Element 2: Floating Translucent Glass Spheres ---
    const spheresGroup = new THREE.Group();
    spheresGroup.visible = activeConfig.glassSpheresVisible !== false;
    masterGroup.add(spheresGroup);

    const glassSphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.04,
      transmission: 0.92,
      ior: 1.52,
      transparent: true,
      opacity: 0.65,
    });

    const floatingSpheres: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; yOffset: number }[] = [];
    const sphereConfigs = [
      { r: 0.22, dist: 2.35, speed: 0.45, y: 0.6 },
      { r: 0.15, dist: 2.65, speed: -0.35, y: -0.7 },
      { r: 0.18, dist: 2.2, speed: 0.55, y: -0.25 },
      { r: 0.12, dist: 2.85, speed: -0.28, y: 0.9 },
      { r: 0.2, dist: 2.5, speed: 0.38, y: 0.15 },
    ];

    sphereConfigs.forEach((cfg, idx) => {
      const geo = new THREE.SphereGeometry(cfg.r, 32, 32);
      const mesh = new THREE.Mesh(geo, glassSphereMat);
      spheresGroup.add(mesh);
      floatingSpheres.push({
        mesh,
        angle: (idx / sphereConfigs.length) * Math.PI * 2,
        speed: cfg.speed,
        radius: cfg.dist,
        yOffset: cfg.y,
      });
    });

    // --- Orbiting Element 3: 3D Floating Geometric Polyhedra ---
    const polyhedraGroup = new THREE.Group();
    polyhedraGroup.visible = activeConfig.floatingPolyhedraVisible !== false;
    masterGroup.add(polyhedraGroup);

    const polyMat = new THREE.MeshStandardMaterial({
      color: 0x14101e,
      metalness: 0.96,
      roughness: 0.15,
      flatShading: true,
      emissive: primaryColor,
      emissiveIntensity: 0.3,
    });

    const floatingPolys: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number } }[] = [];
    const polyGeos = [
      new THREE.IcosahedronGeometry(0.18, 0),
      new THREE.OctahedronGeometry(0.16, 0),
      new THREE.DodecahedronGeometry(0.15, 0),
      new THREE.TetrahedronGeometry(0.19, 0),
    ];

    polyGeos.forEach((geo, idx) => {
      const mesh = new THREE.Mesh(geo, polyMat);
      const angle = (idx / polyGeos.length) * Math.PI * 2 + 0.5;
      const dist = 2.55 + (idx % 2) * 0.3;
      mesh.position.set(
        Math.cos(angle) * dist,
        Math.sin(angle * 1.5) * 1.1,
        Math.sin(angle) * dist
      );
      polyhedraGroup.add(mesh);
      floatingPolys.push({
        mesh,
        rotSpeed: {
          x: 0.3 + Math.random() * 0.4,
          y: 0.2 + Math.random() * 0.5,
        },
      });
    });

    // --- Orbiting Element 4: Stardust Particle Swarm ---
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.8 + Math.random() * 3.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);

      const roll = Math.random();
      if (roll < 0.4) {
        particleColors[i] = primaryColor.r;
        particleColors[i + 1] = primaryColor.g;
        particleColors[i + 2] = primaryColor.b;
      } else if (roll < 0.7) {
        particleColors[i] = secondaryColor.r;
        particleColors[i + 1] = secondaryColor.g;
        particleColors[i + 2] = secondaryColor.b;
      } else {
        particleColors[i] = accentColor.r;
        particleColors[i + 1] = accentColor.g;
        particleColors[i + 2] = accentColor.b;
      }
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    particleField.visible = activeConfig.stardustParticlesVisible !== false;
    scene.add(particleField);

    // --- Mouse Parallax & Dynamic Tracking ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const sensitivity = activeConfig.mouseTrackingSensitivity ?? 1.0;
      targetMouseX = ((x / rect.width) * 2 - 1) * 1.3 * sensitivity;
      targetMouseY = -((y / rect.height) * 2 - 1) * 1.3 * sensitivity;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // --- Hidden Trigger: Detect genuine clicks/taps specifically on the portrait mesh ---
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = performance.now();
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      const duration = performance.now() - pointerDownTime;

      // Genuine click/tap: moved < 12px and held < 600ms (not dragging/orbiting)
      if (dist < 12 && duration < 600) {
        const rect = mount.getBoundingClientRect();
        const mouseCoords = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseCoords, camera);
        const intersects = raycaster.intersectObjects(
          [portraitMesh, glassOverlayMesh, frameMesh],
          true
        );
        if (intersects.length > 0) {
          onPhotoClick?.();
        }
      }
    };

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointerup", onPointerUp);

    // --- Visibility & GPU Throttling with IntersectionObserver ---
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(mount);

    // --- High Precision Delta (Replaces deprecated THREE.Clock) ---
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || document.hidden) return;

      const now = performance.now();
      const elapsedTime = (now - startTime) / 1000;
      const motionFactor = prefersReducedMotion ? 0.2 : 1.0;

      // Smooth mouse lerp damping
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Dynamic cursor light follow
      cursorLight.position.x = mouseX * 3.0;
      cursorLight.position.y = mouseY * 3.0;

      // Centerpiece portrait responds to mouse tilt and gentle floating bob
      portraitGroup.rotation.y = (0.15 + mouseX * 0.3 + Math.sin(elapsedTime * 0.8) * 0.05) * motionFactor;
      portraitGroup.rotation.x = (0.04 - mouseY * 0.3 + Math.cos(elapsedTime * 0.7) * 0.03) * motionFactor;
      portraitGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.07 * motionFactor;

      // Master 3D Group subtle perspective orbit
      masterGroup.rotation.y = (elapsedTime * 0.1 + mouseX * 0.35) * motionFactor;
      masterGroup.rotation.x = (-mouseY * 0.25) * motionFactor;

      // Wireframe overlay subtle breathing
      const breath = 1.0 + Math.sin(elapsedTime * 2.0) * 0.015;
      wireframeMesh.scale.set(breath, breath, breath);

      // Gimbal Rings Independent Rotations
      const speedMult = activeConfig.ringsSpeed || 1.0;
      ring1.rotation.z = elapsedTime * 0.26 * motionFactor * speedMult;
      ring2.rotation.z = -elapsedTime * 0.2 * motionFactor * speedMult;
      ring3.rotation.x = elapsedTime * 0.16 * motionFactor * speedMult;

      // Floating Glass Spheres Kinetics
      floatingSpheres.forEach((sph) => {
        const angle = sph.angle + elapsedTime * sph.speed * motionFactor * speedMult;
        sph.mesh.position.set(
          Math.cos(angle) * sph.radius,
          sph.yOffset + Math.sin(elapsedTime * 1.5 + sph.angle) * 0.2 * motionFactor,
          Math.sin(angle) * sph.radius
        );
      });

      // Floating Polyhedra Rotations
      floatingPolys.forEach((p) => {
        p.mesh.rotation.x = elapsedTime * p.rotSpeed.x * motionFactor;
        p.mesh.rotation.y = elapsedTime * p.rotSpeed.y * motionFactor;
      });

      // Particle Field slow drift
      particleField.rotation.y = elapsedTime * 0.025 * motionFactor;
      particleField.rotation.x = elapsedTime * 0.012 * motionFactor;

      // Halo pulse
      haloMesh.scale.set(
        1 + Math.sin(elapsedTime * 0.7) * 0.05,
        1 + Math.cos(elapsedTime * 0.7) * 0.05,
        1
      );

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mount) {
        mount.removeEventListener("pointerdown", onPointerDown);
        mount.removeEventListener("pointerup", onPointerUp);
        if (renderer.domElement) {
          mount.removeChild(renderer.domElement);
        }
      }
      frameGeo.dispose();
      frameMat.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      portraitPlaneGeo.dispose();
      portraitMat.dispose();
      backPlaneGeo.dispose();
      backMat.dispose();
      glassOverlayGeo.dispose();
      glassOverlayMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      glassSphereMat.dispose();
      polyMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      portraitTex.dispose();
      renderer.dispose();
    };
  }, [photoUrl, currentTheme, animations, onPhotoClick]);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="relative w-64 h-80 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-[var(--theme-secondary)] via-[var(--theme-primary)] to-[var(--theme-accent)] shadow-2xl">
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-[var(--theme-bg)] flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                onClick={onPhotoClick}
                className="w-full h-full object-cover cursor-pointer"
              />
            ) : (
              <span
                onClick={onPhotoClick}
                className="text-4xl font-black font-mono theme-gradient-text cursor-pointer"
              >
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`Interactive 3D portrait presentation of ${displayName}`}
      className="relative w-full h-full min-h-[460px] sm:min-h-[540px] lg:min-h-[640px] flex items-center justify-center pointer-events-auto"
    >
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      />

      {/* Invisible Portrait Hit-Area for Genuine Direct Clicks & Mobile Taps */}
      <div
        data-hero-profile-photo="true"
        aria-label={`Profile photograph of ${displayName}`}
        onClick={onPhotoClick}
        className="absolute inset-0 m-auto w-56 h-72 sm:w-64 sm:h-80 z-10 cursor-pointer pointer-events-auto select-none"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
