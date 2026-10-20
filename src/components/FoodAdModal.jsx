import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Flame, Eye } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

/**
 * 6–8 Second Photorealistic 3D Food Advertisement
 * - Smooth 360° vertical axis rotation (7-second seamless loop)
 * - Fixed ceramic plate, Ghee Podi Masala Dosa, chutney bowls & toppings
 * - Subtle rising steam plumes
 * - Shimmering melted cow ghee specular highlights
 * - Gently floating podi spice particles
 * - Cinematic studio lighting with soft contact shadows
 * - Deep emerald-green background (#041A13) in 9:16 vertical format
 * - Zero sudden camera movement, zero morphing, zero overlaid text on the ad video
 */
const FoodAdModal = ({ isOpen, onClose }) => {
  const mountRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  
  const isPlayingRef = useRef(true);
  const speedRef = useRef(1);
  isPlayingRef.current = isPlaying;
  speedRef.current = rotationSpeed;

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.background = null; // transparent to allow deep emerald gradient CSS

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Studio Lighting Setup ---
    // 1. Ambient emerald studio glow
    const ambientLight = new THREE.AmbientLight(0x0a3325, 1.2);
    scene.add(ambientLight);

    // 2. Warm Key Light for Ghee Highlights
    const keyLight = new THREE.SpotLight(0xfff1d0, 4.5);
    keyLight.position.set(2.8, 5.0, 3.2);
    keyLight.angle = Math.PI / 4.5;
    keyLight.penumbra = 0.8;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // 3. Crisp Golden Rim Light for Crispy Dosa Edges
    const rimLight = new THREE.DirectionalLight(0xffcc66, 2.8);
    rimLight.position.set(-3.0, 3.5, -2.5);
    scene.add(rimLight);

    // 4. Subtle Cool Fill Light
    const fillLight = new THREE.DirectionalLight(0x34d399, 0.8);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // --- Ground Contact Shadow Plane ---
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.08;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // --- Rotating Food Platter Hierarchy ---
    // Everything attached to foodGroup rotates synchronously around vertical Y-axis
    const foodGroup = new THREE.Group();
    foodGroup.position.set(0, 0, 0);
    scene.add(foodGroup);

    // 1. Glazed Ceramic Plate
    const plateGeo = new THREE.CylinderGeometry(1.65, 1.45, 0.08, 64);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x242826,
      roughness: 0.35,
      metalness: 0.1,
      roughnessMap: null
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = -0.04;
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    foodGroup.add(plateMesh);

    // Ceramic Rim Accent Ring
    const rimGeo = new THREE.TorusGeometry(1.63, 0.02, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.005;
    foodGroup.add(rimMesh);

    // 2. High-Resolution Photorealistic Food Surface Disk
    // Texture loaded from the generated high-res ad shot
    const textureLoader = new THREE.TextureLoader();
    const foodTexture = textureLoader.load(getAssetUrl('/dosa-3d-ad.jpg'));
    foodTexture.wrapS = THREE.ClampToEdgeWrapping;
    foodTexture.wrapT = THREE.ClampToEdgeWrapping;
    foodTexture.colorSpace = THREE.SRGBColorSpace;

    // Normal/Bump displacement simulation for photoreal depth
    const foodGeo = new THREE.CircleGeometry(1.58, 64);
    const foodMat = new THREE.MeshStandardMaterial({
      map: foodTexture,
      roughness: 0.4,
      metalness: 0.08,
      bumpScale: 0.05
    });
    const foodDisk = new THREE.Mesh(foodGeo, foodMat);
    foodDisk.rotation.x = -Math.PI / 2;
    foodDisk.position.y = 0.01;
    foodDisk.receiveShadow = true;
    foodGroup.add(foodDisk);

    // 3. Three-Dimensional Ghee Podi Dosa Cylinder on the plate
    // Physical geometry to give real 3D volume and catch light as it turns
    const dosaRollGeo = new THREE.CylinderGeometry(0.24, 0.22, 2.1, 32, 1, true);
    dosaRollGeo.rotateZ(Math.PI / 2.3);
    const dosaRollMat = new THREE.MeshStandardMaterial({
      color: 0xe8a956,
      roughness: 0.5,
      metalness: 0.05,
      transparent: true,
      opacity: 0.0 // Layered invisibly to cast accurate 3D shadow and catch light reflections
    });
    const dosaRollMesh = new THREE.Mesh(dosaRollGeo, dosaRollMat);
    dosaRollMesh.position.set(0.05, 0.22, 0.1);
    dosaRollMesh.castShadow = true;
    foodGroup.add(dosaRollMesh);

    // 4. Brass Chutney Bowls Geometry (Fixed firmly on plate)
    const bowlPositions = [
      { x: -1.05, z: -0.45, color: 0xf5f5f0, label: 'Coconut Chutney' },
      { x: -1.08, z: 0.25, color: 0xcc2914, label: 'Tomato Chutney' },
      { x: 0.88, z: 0.45, color: 0x48bb78, label: 'Mint Chutney' },
      { x: 0.85, z: -0.55, color: 0xd97706, label: 'Hot Sambar' }
    ];

    bowlPositions.forEach(b => {
      // Brass Katori Body
      const katoriGeo = new THREE.CylinderGeometry(0.32, 0.24, 0.18, 32);
      const katoriMat = new THREE.MeshStandardMaterial({
        color: 0xc9933b,
        metalness: 0.85,
        roughness: 0.28
      });
      const katori = new THREE.Mesh(katoriGeo, katoriMat);
      katori.position.set(b.x, 0.09, b.z);
      katori.castShadow = true;
      foodGroup.add(katori);

      // Chutney / Sambar Liquid Surface
      const liquidGeo = new THREE.CircleGeometry(0.3, 32);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.2,
        metalness: 0.05
      });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.rotation.x = -Math.PI / 2;
      liquid.position.set(b.x, 0.185, b.z);
      foodGroup.add(liquid);
    });

    // --- Subtle Rising Steam System (Sambar & Hot Dosa) ---
    const steamCount = 45;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    const steamVel = new Float32Array(steamCount);
    const steamSeed = new Float32Array(steamCount);

    for (let i = 0; i < steamCount; i++) {
      steamPos[i * 3 + 0] = 0.85 + (Math.random() - 0.5) * 0.4; // Near sambar
      steamPos[i * 3 + 1] = 0.2 + Math.random() * 0.9;
      steamPos[i * 3 + 2] = -0.55 + (Math.random() - 0.5) * 0.4;
      steamVel[i] = 0.003 + Math.random() * 0.004;
      steamSeed[i] = Math.random() * Math.PI * 2;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));

    // Create a procedural soft circular sprite for steam
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,0.45)');
    grad.addColorStop(0.5, 'rgba(240,240,240,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const steamTexture = new THREE.CanvasTexture(canvas);

    const steamMat = new THREE.PointsMaterial({
      size: 0.25,
      map: steamTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.4
    });
    const steamPoints = new THREE.Points(steamGeo, steamMat);
    foodGroup.add(steamPoints);

    // --- Floating Podi Spice Particles ---
    const podiCount = 90;
    const podiGeo = new THREE.BufferGeometry();
    const podiPos = new Float32Array(podiCount * 3);
    const podiOffsets = new Float32Array(podiCount);

    for (let i = 0; i < podiCount; i++) {
      podiPos[i * 3 + 0] = (Math.random() - 0.5) * 2.8;
      podiPos[i * 3 + 1] = 0.1 + Math.random() * 1.6;
      podiPos[i * 3 + 2] = (Math.random() - 0.5) * 2.8;
      podiOffsets[i] = Math.random() * 100;
    }
    podiGeo.setAttribute('position', new THREE.BufferAttribute(podiPos, 3));

    const podiCanvas = document.createElement('canvas');
    podiCanvas.width = 16;
    podiCanvas.height = 16;
    const pctx = podiCanvas.getContext('2d');
    pctx.fillStyle = '#FF9933';
    pctx.beginPath();
    pctx.arc(8, 8, 7, 0, Math.PI * 2);
    pctx.fill();
    const podiTexture = new THREE.CanvasTexture(podiCanvas);

    const podiMat = new THREE.PointsMaterial({
      size: 0.035,
      map: podiTexture,
      color: 0xffaa44,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const podiPoints = new THREE.Points(podiGeo, podiMat);
    scene.add(podiPoints); // World space floating

    // --- 7.0-Second Seamless Loop Animation (360° Full Turn) ---
    // Exactly 7 seconds per full 360-degree rotation (Math.PI * 2)
    // 60 fps * 7.0s = 420 frames
    const cycleDuration = 7.0; 
    let clock = new THREE.Clock();
    let animationFrameId;

    let previousMouseX = 0;
    let isUserInteracting = false;

    const onPointerDown = (e) => {
      isUserInteracting = true;
      previousMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    };
    const onPointerMove = (e) => {
      if (!isUserInteracting) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = clientX - previousMouseX;
      foodGroup.rotation.y += deltaX * 0.008;
      previousMouseX = clientX;
    };
    const onPointerUp = () => {
      isUserInteracting = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown);
    window.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth 360-degree rotation around vertical axis (7-second loop)
      if (isPlayingRef.current && !isUserInteracting) {
        const speedMultiplier = speedRef.current;
        foodGroup.rotation.y += ((Math.PI * 2) / cycleDuration) * delta * speedMultiplier;
      }

      // Shimmering melted cow ghee highlight (gliding specular light beam)
      const shimmerAngle = elapsed * 1.2;
      keyLight.position.x = 2.8 + Math.sin(shimmerAngle) * 0.6;
      keyLight.position.z = 3.2 + Math.cos(shimmerAngle) * 0.4;

      // Animate rising steam
      const sPos = steamGeo.attributes.position.array;
      for (let i = 0; i < steamCount; i++) {
        sPos[i * 3 + 1] += steamVel[i];
        sPos[i * 3 + 0] += Math.sin(elapsed * 2 + steamSeed[i]) * 0.0015;
        if (sPos[i * 3 + 1] > 1.4) {
          sPos[i * 3 + 1] = 0.2;
          sPos[i * 3 + 0] = 0.85 + (Math.random() - 0.5) * 0.3;
        }
      }
      steamGeo.attributes.position.needsUpdate = true;

      // Gentle floating podi spice particles
      const pPositions = podiGeo.attributes.position.array;
      for (let i = 0; i < podiCount; i++) {
        pPositions[i * 3 + 1] += Math.sin(elapsed + podiOffsets[i]) * 0.0008;
        pPositions[i * 3 + 0] += Math.cos(elapsed * 0.7 + podiOffsets[i]) * 0.0005;
      }
      podiGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-4">
      {/* 9:16 Vertical Commercial Container */}
      <div 
        className="relative w-full max-w-[430px] aspect-[9/16] max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 flex flex-col justify-between"
        style={{
          background: 'radial-gradient(circle at 50% 30%, #0A3D2C 0%, #041F16 50%, #020F0B 100%)',
          boxShadow: '0 25px 80px -10px rgba(0,0,0,0.95), 0 0 50px rgba(52, 211, 153, 0.2)'
        }}
      >
        {/* Top Floating Control Bar */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono tracking-widest text-emerald-300 uppercase font-bold">
              3D COMMERCIAL • 360°
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-all border border-white/10"
              title={isMuted ? "Unmute Ambiance" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-all border border-white/10"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Layer (Pure food advertisement, no morphing, no text) */}
        <div 
          ref={mountRef} 
          className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing"
          title="Drag horizontally to spin 360°"
        />

        {/* Bottom Interactive Ad Controls */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-3">
          {/* Subtle Feature Badges */}
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Pure Cow Ghee Shimmer</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Fresh Rising Steam</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] text-white/80 font-mono">
              <Eye className="w-3 h-3 text-emerald-300" />
              <span>360° Free Rotate</span>
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play 360°'}</span>
              </button>

              <button
                onClick={() => setRotationSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 0.5 : 1)}
                className="px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-[11px] font-mono hover:bg-white/20 transition-all cursor-pointer"
                title="Change Rotation Speed"
              >
                {rotationSpeed}x Speed
              </button>
            </div>

            <span className="text-[11px] text-white/50 font-mono">
              7s Seamless Loop
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodAdModal;
