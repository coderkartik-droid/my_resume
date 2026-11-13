"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface LoadingSceneProps {
  onLoaded: () => void;
  brandName?: string;
}

export default function LoadingScene({
  onLoaded,
  brandName = "KARTIK KHAJURIA",
}: LoadingSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("INITIALIZING 3D WEBGL CORE");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08070d, 0.12);

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Multi-Source Volcanic Aurora Lighting
    const ambientLight = new THREE.AmbientLight(0x100c17, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff5a1f, 5.0);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x873eff, 5.5, 18);
    rimLight.position.set(-4, -3, 3);
    scene.add(rimLight);

    const cyanLight = new THREE.PointLight(0x00d9ff, 3.5, 14);
    cyanLight.position.set(0, 4, -2);
    scene.add(cyanLight);

    // --- Centerpiece: Obsidian Crystal with Iridescent Reflections ---
    const crystalGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a14,
      metalness: 0.95,
      roughness: 0.1,
      flatShading: true,
      emissive: 0x240e30,
      emissiveIntensity: 0.45,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    scene.add(crystalMesh);

    // Wireframe overlay cage (Aurora Cyan)
    const cageGeo = new THREE.IcosahedronGeometry(1.55, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cageMesh);

    // Circular Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.018, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x873eff,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.35, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.75,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    scene.add(ring2);

    // Floating Atmospheric Particle Swarm
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 9;
      positions[i + 1] = (Math.random() - 0.5) * 9;
      positions[i + 2] = (Math.random() - 0.5) * 7;

      const isEmber = Math.random() > 0.5;
      if (isEmber) {
        colors[i] = 1.0;
        colors[i + 1] = 0.4;
        colors[i + 2] = 0.15;
      } else {
        colors[i] = 0.53;
        colors[i + 1] = 0.24;
        colors[i + 2] = 1.0;
      }
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation Loop with Performance Delta (replaces deprecated THREE.Clock)
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      crystalMesh.rotation.x = elapsedTime * 0.45;
      crystalMesh.rotation.y = elapsedTime * 0.55;

      cageMesh.rotation.x = -elapsedTime * 0.35;
      cageMesh.rotation.y = -elapsedTime * 0.45;

      ring1.rotation.z = elapsedTime * 0.4;
      ring2.rotation.z = -elapsedTime * 0.35;

      particles.rotation.y = elapsedTime * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // Actual Document & Asset Readiness Tracking
    let currentPct = 10;
    setProgress(10);

    const checkReadiness = async () => {
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
          currentPct = Math.max(currentPct, 55);
          setProgress(currentPct);
          setLoadingPhase("FONTS & SHADERS SYNTHESIZED");
        } catch {
          // Continue
        }
      }

      const progressTimer = setInterval(() => {
        currentPct += 15;
        if (currentPct >= 100) {
          clearInterval(progressTimer);
          setProgress(100);
          setLoadingPhase("ENVIRONMENT CALIBRATED");
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              onLoaded();
            }, 500);
          }, 150);
        } else {
          setProgress(currentPct);
          if (currentPct > 60) setLoadingPhase("CALIBRATING 3D ENVIRONMENT");
        }
      }, 35);
    };

    checkReadiness();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      crystalGeo.dispose();
      crystalMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [onLoaded]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08070D] transition-opacity duration-700 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center select-none mt-48 sm:mt-56">
        <div className="w-28 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF5A1F] via-[#873EFF] to-transparent mb-6" />

        <div className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-[#F5F7FF] font-mono drop-shadow-[0_0_25px_rgba(255,90,31,0.5)] uppercase">
          {brandName}
        </div>
        <div className="text-[11px] text-[#00D9FF] font-mono tracking-[0.35em] uppercase mt-2 mb-8 font-semibold flex items-center gap-1.5">
          <span>Spatial 3D Digital Experience</span>
        </div>

        <div className="w-64 h-1.5 bg-[#100C17] rounded-full overflow-hidden p-[1px] border border-white/10 backdrop-blur-md mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#FF5A1F] via-[#FF3CAC] via-[#873EFF] to-[#00D9FF] rounded-full transition-all duration-150 ease-out shadow-[0_0_15px_rgba(135,62,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-64 text-xs font-mono">
          <span className="text-[#A4ADBD] text-[10px] tracking-wider truncate max-w-[170px] uppercase">
            {loadingPhase}
          </span>
          <span className="text-[#FF5A1F] font-bold">{progress}%</span>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-ping" />
          <span className="text-[10px] text-[#A4ADBD] font-mono tracking-widest uppercase">
            WebGL 3D Environment Calibrated
          </span>
        </div>
      </div>
    </div>
  );
}
