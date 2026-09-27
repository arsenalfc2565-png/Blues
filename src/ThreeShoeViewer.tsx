import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Layers, RefreshCw, Eye, Sparkles, Activity, ShieldCheck } from 'lucide-react';

interface ThreeShoeViewerProps {
  primaryColor?: string;
  accentColor?: string;
  soleColor?: string;
  fallbackImageUrl?: string;
  productTitle?: string;
  onColorChange?: (color: string) => void;
  availableColors?: { name: string; hex: string; accent: string }[];
}

export const DEFAULT_SHOE_COLORS = [
  { name: 'Royal Kisumu Blue', hex: '#1d4ed8', accent: '#38bdf8' },
  { name: 'Obsidian Black', hex: '#18181b', accent: '#f59e0b' },
  { name: 'White & Crimson', hex: '#f8fafc', accent: '#ef4444' },
  { name: 'Forest Emerald', hex: '#065f46', accent: '#34d399' },
  { name: 'Safari Tan', hex: '#78350f', accent: '#fbbf24' },
];

export const ThreeShoeViewer: React.FC<ThreeShoeViewerProps> = ({
  primaryColor: initialColor = '#1d4ed8',
  accentColor: initialAccent = '#38bdf8',
  soleColor = '#f8fafc',
  fallbackImageUrl,
  productTitle = 'Blues Velocity Aerodynamic Runner',
  onColorChange,
  availableColors = DEFAULT_SHOE_COLORS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [currentAccent, setCurrentAccent] = useState(initialAccent);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [flexSoleMode, setFlexSoleMode] = useState(false);
  const [webGLError, setWebGLError] = useState(false);

  // Synchronized refs for 60fps animation loop
  const autoRotateRef = useRef(autoRotate);
  const flexSoleModeRef = useRef(flexSoleMode);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    flexSoleModeRef.current = flexSoleMode;
  }, [flexSoleMode]);

  // References for Three.js animation loop & objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shoeGroupRef = useRef<THREE.Group | null>(null);
  const upperMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const accentMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const soleMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const soleMeshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const initialWidth = container.clientWidth || 600;
      const initialHeight = container.clientHeight || 460;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        42,
        initialWidth / initialHeight,
        0.1,
        1000
      );
      camera.position.set(4.5, 2.2, 4.5);
      camera.lookAt(0, 0.2, 0);
      cameraRef.current = camera;

      // WebGL Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(initialWidth, initialHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      rendererRef.current = renderer;

      // Clear any previous child nodes
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
      mainLight.position.set(5, 8, 5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
      fillLight.position.set(-5, 4, -4);
      scene.add(fillLight);

      const rimLight = new THREE.PointLight(0x38bdf8, 0.9, 10);
      rimLight.position.set(0, -2, 2);
      scene.add(rimLight);

      // Create Shoe Geometry Group
      const shoeGroup = new THREE.Group();
      shoeGroupRef.current = shoeGroup;
      shoeGroup.position.set(0, -0.35, 0);

      // Materials
      const upperMat = new THREE.MeshStandardMaterial({
        color: currentColor,
        roughness: 0.45,
        metalness: 0.15,
        wireframe,
      });
      upperMaterialRef.current = upperMat;

      const accentMat = new THREE.MeshStandardMaterial({
        color: currentAccent,
        roughness: 0.3,
        metalness: 0.35,
        wireframe,
      });
      accentMaterialRef.current = accentMat;

      const soleMat = new THREE.MeshStandardMaterial({
        color: soleColor,
        roughness: 0.75,
        metalness: 0.05,
        wireframe,
      });
      soleMaterialRef.current = soleMat;

      const laceMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        wireframe,
      });

      // 1. Outer Sole Rubber Cushion
      const soleGeo = new THREE.BoxGeometry(4.4, 0.36, 1.7);
      const soleMesh = new THREE.Mesh(soleGeo, soleMat);
      soleMesh.position.set(0, 0.18, 0);
      soleMesh.castShadow = true;
      soleMesh.receiveShadow = true;
      soleMeshRef.current = soleMesh;
      shoeGroup.add(soleMesh);

      // 2. Midsole EVA Layer
      const midGeo = new THREE.BoxGeometry(4.25, 0.28, 1.62);
      const midMesh = new THREE.Mesh(midGeo, soleMat);
      midMesh.position.set(0.05, 0.45, 0);
      midMesh.castShadow = true;
      shoeGroup.add(midMesh);

      // 3. Main Upper Body (Shoe Base)
      const upperGeo = new THREE.BoxGeometry(3.2, 0.9, 1.55);
      const upperMesh = new THREE.Mesh(upperGeo, upperMat);
      upperMesh.position.set(-0.2, 0.92, 0);
      upperMesh.castShadow = true;
      shoeGroup.add(upperMesh);

      // 4. Front Toe Cap (Curved ergonomics)
      const toeGeo = new THREE.CylinderGeometry(0.74, 0.8, 1.4, 16);
      const toeMesh = new THREE.Mesh(toeGeo, upperMat);
      toeMesh.rotation.z = -0.35;
      toeMesh.position.set(1.5, 0.74, 0);
      toeMesh.castShadow = true;
      shoeGroup.add(toeMesh);

      // 5. Toe Guard Accent Cap
      const toeGuardGeo = new THREE.BoxGeometry(0.6, 0.4, 1.5);
      const toeGuardMesh = new THREE.Mesh(toeGuardGeo, accentMat);
      toeGuardMesh.position.set(1.9, 0.58, 0);
      toeGuardMesh.castShadow = true;
      shoeGroup.add(toeGuardMesh);

      // 6. Heel Counter Support
      const heelGeo = new THREE.BoxGeometry(0.75, 1.15, 1.48);
      const heelMesh = new THREE.Mesh(heelGeo, upperMat);
      heelMesh.position.set(-1.7, 1.05, 0);
      heelMesh.castShadow = true;
      shoeGroup.add(heelMesh);

      // 7. Ankle Collar & Tongue
      const collarGeo = new THREE.CylinderGeometry(0.7, 0.78, 0.85, 16);
      const collarMesh = new THREE.Mesh(collarGeo, upperMat);
      collarMesh.rotation.z = 0.15;
      collarMesh.position.set(-0.6, 1.45, 0);
      collarMesh.castShadow = true;
      shoeGroup.add(collarMesh);

      // 8. Tongue Cushion
      const tongueGeo = new THREE.BoxGeometry(1.5, 0.2, 0.9);
      const tongueMesh = new THREE.Mesh(tongueGeo, accentMat);
      tongueMesh.rotation.z = -0.45;
      tongueMesh.position.set(0.2, 1.42, 0);
      shoeGroup.add(tongueMesh);

      // 9. Side Speed Stripes (Wholesale Blues Emblem)
      const stripeGeo = new THREE.BoxGeometry(2.2, 0.22, 0.08);
      const stripeR = new THREE.Mesh(stripeGeo, accentMat);
      stripeR.position.set(-0.1, 0.95, 0.8);
      stripeR.rotation.z = -0.2;
      shoeGroup.add(stripeR);

      const stripeL = new THREE.Mesh(stripeGeo, accentMat);
      stripeL.position.set(-0.1, 0.95, -0.8);
      stripeL.rotation.z = -0.2;
      shoeGroup.add(stripeL);

      // 10. Laces
      const laceBarGeo = new THREE.BoxGeometry(0.12, 0.06, 0.95);
      const l1 = new THREE.Mesh(laceBarGeo, laceMat);
      l1.position.set(0.4, 1.35, 0);
      l1.rotation.z = -0.3;
      shoeGroup.add(l1);

      const l2 = new THREE.Mesh(laceBarGeo, laceMat);
      l2.position.set(0.8, 1.15, 0);
      l2.rotation.z = -0.3;
      shoeGroup.add(l2);

      const l3 = new THREE.Mesh(laceBarGeo, laceMat);
      l3.position.set(1.15, 0.95, 0);
      l3.rotation.z = -0.3;
      shoeGroup.add(l3);

      // Shadow Floor Plane
      const planeGeo = new THREE.PlaneGeometry(12, 12);
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
      const plane = new THREE.Mesh(planeGeo, shadowMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -0.22;
      plane.receiveShadow = true;
      scene.add(plane);

      scene.add(shoeGroup);

      // Mouse Drag / Orbit Controls
      let previousMousePosition = { x: 0, y: 0 };

      const onMouseDown = (e: MouseEvent) => {
        isDraggingRef.current = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !shoeGroup) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        shoeGroup.rotation.y += deltaX * 0.01;
        shoeGroup.rotation.x = Math.max(-0.5, Math.min(0.5, shoeGroup.rotation.x + deltaY * 0.01));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
      };

      // Touch handlers for mobile
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          isDraggingRef.current = true;
          previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDraggingRef.current || !shoeGroup || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        shoeGroup.rotation.y += deltaX * 0.012;
        shoeGroup.rotation.x = Math.max(-0.5, Math.min(0.5, shoeGroup.rotation.x + deltaY * 0.012));

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      // Zoom via Mouse Wheel
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        camera.position.z = Math.max(3.2, Math.min(8.0, camera.position.z + e.deltaY * 0.005));
        camera.position.x = Math.max(3.2, Math.min(8.0, camera.position.x + e.deltaY * 0.005));
      };

      const domElem = renderer.domElement;
      domElem.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      domElem.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onMouseUp);
      domElem.addEventListener('wheel', onWheel, { passive: false });

      // Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 50 && height > 50) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        }
      });
      resizeObserver.observe(container);

      // Animation Loop
      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        if (shoeGroup) {
          if (autoRotateRef.current && !isDraggingRef.current) {
            shoeGroup.rotation.y += 0.008;
          }

          // Sole flexion bounce simulation mode
          if (flexSoleModeRef.current) {
            const flexWave = Math.sin(elapsedTime * 4) * 0.08;
            shoeGroup.position.y = -0.35 + Math.abs(Math.sin(elapsedTime * 4) * 0.15);
            if (soleMeshRef.current) {
              soleMeshRef.current.scale.y = 1 + flexWave * 1.5;
            }
          } else {
            shoeGroup.position.y = -0.35;
            if (soleMeshRef.current) {
              soleMeshRef.current.scale.y = 1;
            }
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        resizeObserver.disconnect();
        domElem.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        domElem.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onMouseUp);
        domElem.removeEventListener('wheel', onWheel);
        if (container.contains(domElem)) {
          container.removeChild(domElem);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.error('WebGL Initialization error in ThreeShoeViewer:', err);
      setWebGLError(true);
    }
  }, []);

  // Update materials when color or wireframe changes
  useEffect(() => {
    if (upperMaterialRef.current) {
      upperMaterialRef.current.color.set(currentColor);
      upperMaterialRef.current.wireframe = wireframe;
      upperMaterialRef.current.needsUpdate = true;
    }
    if (accentMaterialRef.current) {
      accentMaterialRef.current.color.set(currentAccent);
      accentMaterialRef.current.wireframe = wireframe;
      accentMaterialRef.current.needsUpdate = true;
    }
    if (soleMaterialRef.current) {
      soleMaterialRef.current.wireframe = wireframe;
      soleMaterialRef.current.needsUpdate = true;
    }
  }, [currentColor, currentAccent, wireframe]);

  const handleColorSelect = (c: { name: string; hex: string; accent: string }) => {
    setCurrentColor(c.hex);
    setCurrentAccent(c.accent);
    if (onColorChange) {
      onColorChange(c.hex);
    }
  };

  const handleResetCamera = () => {
    if (shoeGroupRef.current) {
      shoeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  if (webGLError && fallbackImageUrl) {
    return (
      <div className="relative w-full h-[460px] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
        <img src={fallbackImageUrl} alt={productTitle} className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-white">
          2D High-Resolution Photo View
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[460px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 shadow-2xl flex flex-col">
      {/* 3D Viewport Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-neutral-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-200 tracking-wide">
            3D WebGL Studio
          </span>
          <span className="text-neutral-500 text-xs">·</span>
          <span className="text-xs text-neutral-400 hidden sm:inline">360° Interactive</span>
        </div>

        {/* Viewport Control Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Sole Flex Mode Button */}
          <button
            onClick={() => setFlexSoleMode(!flexSoleMode)}
            title="Inspect Sole Cushion Flexing & Tread Shock Absorption"
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              flexSoleMode
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                : 'bg-neutral-900/90 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sole Flex</span>
          </button>

          {/* Auto-Spin Button */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360° Auto-Rotation"
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              autoRotate
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-neutral-900/90 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Auto-Spin</span>
          </button>

          {/* Wireframe Mesh Button */}
          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe Mesh Geometry"
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              wireframe
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-neutral-900/90 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mesh</span>
          </button>

          {/* Reset Angle Button */}
          <button
            onClick={handleResetCamera}
            title="Reset Angle"
            className="p-2 rounded-lg border bg-neutral-900/90 border-neutral-700 text-neutral-300 hover:text-white transition-all text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      />

      {/* Floating Bottom Bar: Color Swatches & Interaction Guidance */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-neutral-950/85 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-xl">
          <span className="text-xs font-medium text-neutral-300 whitespace-nowrap flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Finish & Leather Tone:
          </span>
          <div className="flex items-center gap-2">
            {availableColors.map((c) => (
              <button
                key={c.name}
                onClick={() => handleColorSelect(c)}
                title={c.name}
                className={`w-6 h-6 rounded-full border-2 transition-all transform hover:scale-115 ${
                  currentColor === c.hex
                    ? 'border-white ring-2 ring-blue-500 scale-110 shadow-md'
                    : 'border-neutral-600 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-neutral-950/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-xs text-neutral-400">
          <Eye className="w-3.5 h-3.5 text-neutral-300" />
          <span>Click & drag to rotate 360° · Tap Sole Flex for bounce</span>
        </div>
      </div>
    </div>
  );
};
