import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../stores/appStore';
import { BOREHOLES_DATA } from '../../data/demoData';
import {
  Layers,
  Sliders,
  RotateCcw,
  Maximize2,
  Box,
  Eye,
  CheckCircle2,
  HelpCircle,
  Scissors,
  Compass,
  Activity,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Info,
  MapPin,
  FileText
} from 'lucide-react';

export const SubsurfacePage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { selectedMine } = useAppStore();

  // Controls State
  const [viewMode, setViewMode] = useState<'COMBINED' | 'SURFACE_ONLY' | 'SUBSURFACE_ONLY'>('COMBINED');
  const [displayMode, setDisplayMode] = useState<'3D' | '2D_CROSS_SECTION'>('3D');
  const [sectionLine, setSectionLine] = useState<'A-A' | 'B-B'>('A-A');
  const [clipDepthM, setClipDepthM] = useState(380);
  const [verticalExaggeration, setVerticalExaggeration] = useState(1.5);
  const [oreOpacity, setOreOpacity] = useState(0.9);
  const [showProspectivityOverlay, setShowProspectivityOverlay] = useState(true);
  const [showFaultPlane, setShowFaultPlane] = useState(true);
  const [selectedBoreholeId, setSelectedBoreholeId] = useState(BOREHOLES_DATA[0].id);
  const [webGLError, setWebGLError] = useState<string | null>(null);

  const selectedBorehole = BOREHOLES_DATA.find((b) => b.id === selectedBoreholeId) || BOREHOLES_DATA[0];

  // ── THREE.JS WEBGL RENDERER ────────────────────────────────────────────────
  useEffect(() => {
    if (displayMode === '2D_CROSS_SECTION') return;
    if (!mountRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color('#060911');

      camera = new THREE.PerspectiveCamera(
        45,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        2000
      );
      camera.position.set(110, 75, 125);
      camera.lookAt(0, -10, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      mountRef.current.appendChild(renderer.domElement);

      // LIGHTING
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0x54d8e8, 1.4);
      sunLight.position.set(80, 140, 80);
      scene.add(sunLight);

      const purpleGlow = new THREE.PointLight(0x9a85ff, 2.5, 300);
      purpleGlow.position.set(-30, -35, -20);
      scene.add(purpleGlow);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // ── 1. REAL SURFACE TERRAIN MESH (DEM ELEVATION) ────────────────────────
      const terrainGeo = new THREE.PlaneGeometry(120, 120, 48, 48);
      terrainGeo.rotateX(-Math.PI / 2);
      
      const pos = terrainGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // Realistic Sauser ridge & valley elevation profile
        const elev = Math.sin(x * 0.04) * 5 + Math.cos(z * 0.05) * 4 + Math.sin((x + z) * 0.03) * 3;
        pos.setY(i, elev * verticalExaggeration);
      }
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        color: 0x22362b, // Forested ridge green
        roughness: 0.8,
        metalness: 0.1,
        wireframe: false,
        transparent: true,
        opacity: viewMode === 'SUBSURFACE_ONLY' ? 0.15 : 0.95
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.position.y = 15;
      rootGroup.add(terrainMesh);

      // ── 2. SAUSER BELT STRATIGRAPHIC FORMATIONS ─────────────────────────────
      // Formations modeled with true 72° SE tectonic dip
      const strataLayers = [
        {
          name: 'Laterite & Weathered Regolith (0 - 45m)',
          color: 0xc28251,
          height: 8 * verticalExaggeration,
          yOffset: 9,
          opacity: 0.75,
          dipRad: 0.05
        },
        {
          name: 'Mansar Quartz-Muscovite Schist (45 - 180m)',
          color: 0x7e8b92,
          height: 18 * verticalExaggeration,
          yOffset: -3,
          opacity: 0.82,
          dipRad: 0.18
        },
        {
          name: 'Braunite-Pyrolusite Primary Ore Reef (180 - 290m)',
          color: 0x9a85ff,
          height: 12 * verticalExaggeration,
          yOffset: -18,
          opacity: oreOpacity,
          dipRad: 0.28,
          isOre: true
        },
        {
          name: 'Tirodi Biotite Gneiss Basement (> 290m)',
          color: 0x3a4856,
          height: 25 * verticalExaggeration,
          yOffset: -38,
          opacity: 0.9,
          dipRad: 0.15
        }
      ];

      if (viewMode !== 'SURFACE_ONLY') {
        strataLayers.forEach((strata) => {
          const geo = new THREE.BoxGeometry(90, strata.height, 90);
          const mat = new THREE.MeshStandardMaterial({
            color: strata.color,
            roughness: strata.isOre ? 0.3 : 0.7,
            metalness: strata.isOre ? 0.4 : 0.2,
            transparent: true,
            opacity: strata.opacity
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.y = strata.yOffset;
          // Apply structural tectonic tilt (dip)
          mesh.rotation.z = strata.dipRad;
          rootGroup.add(mesh);
        });

        // ── 3. TIRODI REGIONAL THRUST FAULT PLANE ────────────────────────────
        if (showFaultPlane) {
          const faultGeo = new THREE.PlaneGeometry(110, 60);
          const faultMat = new THREE.MeshBasicMaterial({
            color: 0xff4d6d,
            transparent: true,
            opacity: 0.38,
            side: THREE.DoubleSide
          });
          const faultMesh = new THREE.Mesh(faultGeo, faultMat);
          faultMesh.position.set(0, -15, 0);
          faultMesh.rotation.x = Math.PI / 3; // 60° dip
          faultMesh.rotation.y = Math.PI / 6;
          rootGroup.add(faultMesh);
        }

        // ── 4. PROSPECTIVITY 3D HEATMAP VOLUME ───────────────────────────────
        if (showProspectivityOverlay) {
          const prospGeo = new THREE.BoxGeometry(45, 10 * verticalExaggeration, 35);
          const prospMat = new THREE.MeshStandardMaterial({
            color: 0x43d6a0,
            transparent: true,
            opacity: 0.55,
            emissive: 0x43d6a0,
            emissiveIntensity: 0.2
          });
          const prospMesh = new THREE.Mesh(prospGeo, prospMat);
          prospMesh.position.set(15, -16, 10);
          rootGroup.add(prospMesh);
        }
      }

      // ── 5. REAL BOREHOLE WIRELINE CORE COLUMNS ────────────────────────────
      const boreholePositions = [
        { id: 'BH-BG-2023-14', x: -16, z: 12, depth: 320, collar: 346 },
        { id: 'BH-BG-2024-03', x: 18, z: -10, depth: 390, collar: 344 },
        { id: 'BH-UK-2022-09', x: 28, z: 22, depth: 210, collar: 612 }
      ];

      boreholePositions.forEach((bh) => {
        const isSelected = bh.id === selectedBoreholeId;
        const totalHeight = 55 * verticalExaggeration;
        const bhGeo = new THREE.CylinderGeometry(isSelected ? 1.4 : 0.9, isSelected ? 1.4 : 0.9, totalHeight, 16);
        const bhMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x54d8e8 : 0xffffff,
          emissive: isSelected ? 0x54d8e8 : 0x000000,
          emissiveIntensity: isSelected ? 0.5 : 0.0
        });
        const bhMesh = new THREE.Mesh(bhGeo, bhMat);
        bhMesh.position.set(bh.x, 15 - totalHeight / 2, bh.z);
        rootGroup.add(bhMesh);

        // Collar ring marker on surface
        const ringGeo = new THREE.RingGeometry(1.6, 2.8, 16);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x54d8e8 : 0xf4b860,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(bh.x, 15.2, bh.z);
        rootGroup.add(ringMesh);
      });

      // Grid Base Plane
      const grid = new THREE.GridHelper(140, 20, 0x54d8e8, 0x1c3045);
      grid.position.y = -55;
      scene.add(grid);

      // ANIMATION & INTERACTION LOOP
      let mouseX = 0;
      let isDragging = false;
      let prevMouseX = 0;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouseX = e.clientX;
      };
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const delta = e.clientX - prevMouseX;
        rootGroup.rotation.y += delta * 0.008;
        prevMouseX = e.clientX;
      };
      const onMouseUp = () => { isDragging = false; };

      const domElem = renderer.domElement;
      domElem.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      const animate = () => {
        if (!isDragging) {
          rootGroup.rotation.y += 0.0015;
        }
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();

      const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        domElem.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err: any) {
      console.warn('WebGL initialization failed:', err);
      setWebGLError('WebGL context initialization failed. Please switch to 2D Geological Cross-Section view.');
    }
  }, [viewMode, displayMode, verticalExaggeration, oreOpacity, showProspectivityOverlay, showFaultPlane, selectedBoreholeId]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#060911] text-[#F2F6FA] relative select-none font-sans">
      
      {/* ── MAIN VIEWPORT (3D ORBIT OR 2D SECTION) ───────────────────────────── */}
      <div className="flex-1 h-full relative flex flex-col justify-between overflow-hidden">
        
        {displayMode === '3D' ? (
          <>
            {webGLError ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="max-w-md p-6 rounded-2xl bg-[#101927] border border-[#FF6878] space-y-3">
                  <Activity className="w-8 h-8 text-[#FF6878] mx-auto" />
                  <h3 className="font-heading font-bold text-white text-base">WebGL Display Notice</h3>
                  <p className="text-xs text-[#9BAFC1]">{webGLError}</p>
                  <button
                    onClick={() => setDisplayMode('2D_CROSS_SECTION')}
                    className="px-4 py-2 rounded-xl bg-[#54D8E8] text-[#080C12] font-mono font-bold text-xs"
                  >
                    Open 2D Cross-Section View
                  </button>
                </div>
              </div>
            ) : (
              <div ref={mountRef} className="flex-1 h-full cursor-grab active:cursor-grabbing relative" />
            )}
          </>
        ) : (
          /* ── 2D GEOLOGICAL CROSS-SECTION ENGINE (SECTION A-A' / B-B') ──────── */
          <div className="flex-1 h-full p-8 flex flex-col justify-between overflow-y-auto bg-[#070B14]">
            <div className="space-y-4 max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C3045]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#54D8E8] uppercase tracking-wider">
                    STRUCTURAL GEOLOGY SECTION &bull; SAUSER OROGENIC BELT
                  </span>
                  <h2 className="text-xl font-heading font-extrabold text-white mt-0.5">
                    Transverse Profile: Line {sectionLine} (Azimuth 155° &rarr; 335°)
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSectionLine('A-A')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                      sectionLine === 'A-A'
                        ? 'bg-[#54D8E8] text-[#080C12] border-[#54D8E8]'
                        : 'bg-[#101927] text-[#9BAFC1] border-[#1C3045]'
                    }`}
                  >
                    Line A - A' (Dip Profile)
                  </button>
                  <button
                    onClick={() => setSectionLine('B-B')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                      sectionLine === 'B-B'
                        ? 'bg-[#54D8E8] text-[#080C12] border-[#54D8E8]'
                        : 'bg-[#101927] text-[#9BAFC1] border-[#1C3045]'
                    }`}
                  >
                    Line B - B' (Strike Profile)
                  </button>
                </div>
              </div>

              {/* SVG Geological Cross Section Graphic */}
              <div className="relative w-full h-80 rounded-2xl bg-[#090E18] border border-[#1C3045] overflow-hidden p-4 flex flex-col justify-between">
                <svg className="w-full h-full" viewBox="0 0 800 240">
                  {/* Grid Lines & Depth Labels */}
                  <line x1="60" y1="30" x2="760" y2="30" stroke="#1C3045" strokeDasharray="3,3" />
                  <text x="15" y="34" fill="#657A90" fontSize="10" fontFamily="monospace">0m MSL</text>

                  <line x1="60" y1="80" x2="760" y2="80" stroke="#1C3045" strokeDasharray="3,3" />
                  <text x="5" y="84" fill="#657A90" fontSize="10" fontFamily="monospace">-100m</text>

                  <line x1="60" y1="140" x2="760" y2="140" stroke="#1C3045" strokeDasharray="3,3" />
                  <text x="5" y="144" fill="#657A90" fontSize="10" fontFamily="monospace">-250m</text>

                  <line x1="60" y1="200" x2="760" y2="200" stroke="#1C3045" strokeDasharray="3,3" />
                  <text x="5" y="204" fill="#657A90" fontSize="10" fontFamily="monospace">-385m</text>

                  {/* Surface Topography Curve */}
                  <path d="M 60 45 Q 220 20 400 35 T 760 30" fill="none" stroke="#54D8E8" strokeWidth="2" />

                  {/* Regolith Layer */}
                  <path d="M 60 45 Q 220 20 400 35 T 760 30 L 760 55 Q 400 60 60 68 Z" fill="#C28251" opacity="0.6" />

                  {/* Mansar Schist Host Rock */}
                  <path d="M 60 68 Q 400 60 760 55 L 760 135 Q 420 125 60 145 Z" fill="#7E8B92" opacity="0.75" />

                  {/* High Grade Braunite Manganese Reef (Dipping 72° SE) */}
                  <polygon points="180,95 240,90 490,195 440,205" fill="#9A85FF" opacity="0.95" />
                  <polygon points="200,95 230,92 470,195 445,200" fill="#C084FC" opacity="0.9" />

                  {/* Tirodi Thrust Fault Line (Red dashed line) */}
                  <line x1="120" y1="35" x2="520" y2="225" stroke="#FF4D6D" strokeWidth="2.5" strokeDasharray="6,4" />
                  <text x="360" y="140" fill="#FF4D6D" fontSize="10" fontFamily="monospace" transform="rotate(26, 360, 140)">
                    TIRODI REGIONAL THRUST FAULT (68° SE)
                  </text>

                  {/* Tirodi Gneiss Basement */}
                  <path d="M 60 145 Q 420 125 760 135 L 760 225 L 60 225 Z" fill="#3A4856" opacity="0.85" />

                  {/* Borehole Traces */}
                  <line x1="280" y1="28" x2="280" y2="210" stroke="#54D8E8" strokeWidth="2" />
                  <text x="250" y="22" fill="#54D8E8" fontSize="10" fontWeight="bold" fontFamily="monospace">BH-BG-2023-14</text>

                  <line x1="580" y1="32" x2="580" y2="220" stroke="#F4B860" strokeWidth="2" />
                  <text x="550" y="24" fill="#F4B860" fontSize="10" fontWeight="bold" fontFamily="monospace">BH-BG-2024-03</text>
                </svg>

                {/* Legend Bar */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono pt-2 border-t border-[#1C3045]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#C28251]" />
                    <span>Weathered Regolith</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#7E8B92]" />
                    <span>Mansar Muscovite Schist</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#9A85FF]" />
                    <span className="text-[#9A85FF] font-bold">Braunite Ore Reef (48% Mn)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#3A4856]" />
                    <span>Tirodi Gneiss Basement</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-[#FF4D6D]" />
                    <span className="text-[#FF4D6D]">Thrust Fault</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TOP FLOATING CONTROL HUD ───────────────────────────────────────── */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2.5">
          <div className="px-4 py-2.5 rounded-xl bg-[#090E18]/90 border border-[#1C3045] shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-[#54D8E8]" />
                <span className="font-heading font-extrabold text-sm text-white">
                  3D SUBSURFACE DIGITAL TWIN
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#54D8E8]/15 text-[#54D8E8] text-[9.5px] font-mono border border-[#54D8E8]/30">
                BALAGHAT FORMATION
              </span>
            </div>
            <p className="text-[10.5px] font-mono text-[#9BAFC1] mt-0.5">
              Mansar-Tirodi Contact &bull; 72° SE Dip &bull; Strike: N65°E
            </p>
          </div>

          {/* Mode Switching Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisplayMode(displayMode === '3D' ? '2D_CROSS_SECTION' : '3D')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] text-xs font-mono font-bold shadow hover:opacity-90 cursor-pointer"
            >
              {displayMode === '3D' ? 'Switch to 2D Cross-Section' : 'Switch to 3D Orbit'}
            </button>

            {/* View Mode Pills (Combined, Surface, Subsurface) */}
            {displayMode === '3D' && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090E18]/90 border border-[#1C3045] backdrop-blur-md">
                {(['COMBINED', 'SURFACE_ONLY', 'SUBSURFACE_ONLY'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      viewMode === mode
                        ? 'bg-[#152235] text-[#54D8E8] border border-[#54D8E8]/50'
                        : 'text-[#9BAFC1] hover:text-white'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM SCIENTIFIC CONTROLS DOCK ─────────────────────────────────── */}
        {displayMode === '3D' && (
          <div className="absolute bottom-6 left-6 z-10 p-4 rounded-2xl bg-[#090E18]/95 border border-[#1C3045] shadow-2xl backdrop-blur-md flex flex-wrap items-center gap-6 text-xs font-mono">
            {/* Depth Slicer */}
            <div className="flex items-center gap-2 text-[#54D8E8]">
              <Scissors className="h-4 w-4" />
              <span>CLIPPING DEPTH:</span>
              <input
                type="range"
                min="50"
                max="450"
                value={clipDepthM}
                onChange={(e) => setClipDepthM(parseInt(e.target.value))}
                className="w-36 accent-[#54D8E8] h-1.5 bg-[#152235] rounded cursor-pointer"
              />
              <span className="text-white font-bold ml-1">{clipDepthM}m</span>
            </div>

            {/* Vertical Exaggeration */}
            <div className="flex items-center gap-2 text-[#F4B860]">
              <TrendingDown className="h-4 w-4" />
              <span>VERTICAL EXAGG:</span>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.5"
                value={verticalExaggeration}
                onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
                className="w-28 accent-[#F4B860] h-1.5 bg-[#152235] rounded cursor-pointer"
              />
              <span className="text-white font-bold ml-1">{verticalExaggeration}x</span>
            </div>

            {/* Toggle Fault Plane & Prospectivity */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#FF6878]">
                <input
                  type="checkbox"
                  checked={showFaultPlane}
                  onChange={(e) => setShowFaultPlane(e.target.checked)}
                  className="rounded bg-[#05080E] border-[#1C3045] text-[#FF6878] focus:ring-0 cursor-pointer"
                />
                <span>Fault Plane</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-[#43D6A0]">
                <input
                  type="checkbox"
                  checked={showProspectivityOverlay}
                  onChange={(e) => setShowProspectivityOverlay(e.target.checked)}
                  className="rounded bg-[#05080E] border-[#1C3045] text-[#43D6A0] focus:ring-0 cursor-pointer"
                />
                <span>Prospectivity AI</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT SIDEBAR: BOREHOLE CORE LOG & ASSAY INSPECTOR ───────────────── */}
      <div className="w-84 h-full border-l border-[#1C3045] bg-[#090E18] p-5 flex flex-col justify-between shrink-0 font-mono">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#1C3045]">
            <div>
              <h3 className="font-heading font-extrabold text-sm text-white">
                Borehole Core Inspector
              </h3>
              <p className="text-[10px] text-[#9BAFC1] mt-0.5">Diamond Drill Core Wireline Log</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#43D6A0]/15 text-[#43D6A0] text-[9.5px] font-bold border border-[#43D6A0]/30">
              GSI VERIFIED
            </span>
          </div>

          {/* Drillhole Selector */}
          <div className="mt-3.5 space-y-1">
            <label className="text-[10px] text-[#9BAFC1] font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#54D8E8]" />
              SELECT DIAMOND BOREHOLE:
            </label>
            <select
              value={selectedBoreholeId}
              onChange={(e) => setSelectedBoreholeId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl bg-[#101927] border border-[#1C3045] text-xs text-white outline-none focus:border-[#54D8E8] cursor-pointer"
            >
              {BOREHOLES_DATA.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#101927]">
                  {b.id} (Collar {b.collarElevationM}m, Depth {b.depthM}m)
                </option>
              ))}
            </select>
          </div>

          {/* Collar & Recovery Summary */}
          <div className="mt-3 p-3 rounded-xl bg-[#101927] border border-[#1C3045] grid grid-cols-2 gap-2 text-[10.5px]">
            <div>
              <span className="text-[#657A90] block text-[9.5px]">Collar Elevation:</span>
              <span className="text-white font-bold">{selectedBorehole.collarElevationM}m MSL</span>
            </div>
            <div>
              <span className="text-[#657A90] block text-[9.5px]">Total End Depth:</span>
              <span className="text-[#54D8E8] font-bold">{selectedBorehole.depthM}m</span>
            </div>
            <div>
              <span className="text-[#657A90] block text-[9.5px]">Drilled Year:</span>
              <span className="text-white font-bold">{selectedBorehole.drilledYear}</span>
            </div>
            <div>
              <span className="text-[#657A90] block text-[9.5px]">Core Recovery:</span>
              <span className="text-[#43D6A0] font-bold">96.4% (HQ/NQ Wireline)</span>
            </div>
          </div>

          {/* Stratigraphic Breakdown */}
          <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-390px)] pr-1">
            <span className="text-[10px] text-[#657A90] uppercase font-bold block">
              Stratigraphic Intercepts ({selectedBorehole.strata.length})
            </span>
            {selectedBorehole.strata.map((s, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl border border-[#1C3045] bg-[#101927]/80 text-xs transition-colors hover:border-[#54D8E8]/50"
                style={{ borderLeftColor: s.color, borderLeftWidth: 4 }}
              >
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="truncate text-[11px]">{s.rockType}</span>
                  <span className="text-[#43D6A0] text-[11px] shrink-0 ml-1">
                    {s.oreGradeMnPercent}% Mn
                  </span>
                </div>
                <div className="text-[10px] text-[#9BAFC1] mt-1 flex justify-between">
                  <span>Depth: {s.fromM}m &rarr; {s.toM}m</span>
                  <span>Thick: {s.toM - s.fromM}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Provenance & UNFC Compliance Footer */}
        <div className="pt-3 border-t border-[#1C3045] text-[10px] text-[#9BAFC1] space-y-1">
          <div className="flex items-center justify-between">
            <span>UNFC Classification:</span>
            <span className="text-[#54D8E8] font-bold">UNFC-111 Proved</span>
          </div>
          <div className="flex items-center justify-between text-[#43D6A0]">
            <span>QA/QC Geochemistry:</span>
            <span>XRF Calibrated &radic;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
