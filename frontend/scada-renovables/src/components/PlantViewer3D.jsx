import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function PlantViewer3D({ assets, breakers }) {
  const containerRef = useRef(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Store turbine rotation angles in ref
  const rotationAnglesRef = useRef({
    'WTG-01': 0,
    'WTG-02': 0
  });

  useEffect(() => {
    if (!containerRef.current || assets.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050608');
    scene.fog = new THREE.FogExp2('#050608', 0.01);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 40, 85);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#00f0ff', 0.8);
    mainLight.position.set(50, 80, 50);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight('#ff0055', 0.5);
    fillLight.position.set(-50, 40, -50);
    scene.add(fillLight);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.maxDistance = 150;
    controls.minDistance = 15;

    // 5. Technical Grid Floor
    const gridHelper = new THREE.GridHelper(160, 40, '#2b3047', '#141722');
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Helper: Get color based on asset status
    const getStatusColorHex = (tagId, status) => {
      if (!breakers[tagId]) return 0x718096; // Offline (gray)
      if (status === 'FAULT') return 0xff0055; // Fault (red)
      if (status === 'MAINTENANCE') return 0xffcc00; // Maintenance (yellow)
      return 0x00ff66; // Online (green)
    };

    const assetGroup = new THREE.Group();
    scene.add(assetGroup);

    // Interactive mesh registry for raycasting
    const interactiveMeshes = [];

    // Procedural Wind Turbine Creator
    const createWindTurbine = (tagId, x, z, status) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.userData = { tagId };

      const color = getStatusColorHex(tagId, status);

      // Tower
      const towerGeo = new THREE.CylinderGeometry(0.6, 1.2, 25, 12);
      const towerMat = new THREE.MeshPhongMaterial({ color: 0x4a5568, shininess: 30 });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = 12.5;
      g.add(tower);

      // Nacelle
      const nacelleGeo = new THREE.BoxGeometry(2, 2, 4);
      const nacelleMat = new THREE.MeshPhongMaterial({ color: 0x2d3748 });
      const nacelle = new THREE.Mesh(nacelleGeo, nacelleMat);
      nacelle.position.set(0, 25, 0.5);
      g.add(nacelle);

      // Rotor Hub
      const hubGeo = new THREE.SphereGeometry(1.0, 16, 16);
      const hubMat = new THREE.MeshPhongMaterial({ color });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.position.set(0, 25, 2.6);
      g.add(hub);

      // Blades Sub-Group
      const bladesSubGroup = new THREE.Group();
      bladesSubGroup.position.set(0, 25, 2.7);

      const bladeGeo = new THREE.BoxGeometry(0.5, 12, 0.1);
      const bladeMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });

      for (let i = 0; i < 3; i++) {
        const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
        bladeMesh.position.y = 6; // Pivot around the end

        const rotationPivot = new THREE.Group();
        rotationPivot.rotation.z = (i * 2 * Math.PI) / 3;
        rotationPivot.add(bladeMesh);

        bladesSubGroup.add(rotationPivot);
      }
      g.add(bladesSubGroup);

      // Fault indicator beacon
      const beaconGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 33, 0);
      g.add(beacon);

      assetGroup.add(g);
      interactiveMeshes.push(tower);
      tower.userData = { tagId };

      return { group: g, blades: bladesSubGroup, beacon };
    };

    // Procedural Solar Array Creator
    const createSolarArray = (tagId, startX, startZ, rows, cols, status) => {
      const g = new THREE.Group();
      g.userData = { tagId };

      const color = getStatusColorHex(tagId, status);
      const panelMat = new THREE.MeshPhongMaterial({ color: 0x1a202c, shininess: 80 });
      const frameMat = new THREE.MeshPhongMaterial({ color: 0x4a5568 });

      const panelGeo = new THREE.BoxGeometry(2.5, 0.1, 1.5);

      const panelsList = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const panelGroup = new THREE.Group();
          panelGroup.position.set(startX + c * 4, 0.5, startZ + r * 3);

          // Support pole
          const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
          const pole = new THREE.Mesh(poleGeo, frameMat);
          pole.position.y = 0.5;
          panelGroup.add(pole);

          // Tilted solar surface
          const panelMesh = new THREE.Mesh(panelGeo, panelMat);
          panelMesh.position.y = 1.0;
          panelMesh.rotation.x = 0.35; // Fixed solar tilt angle
          panelGroup.add(panelMesh);

          g.add(panelGroup);
          panelsList.push(panelMesh);
        }
      }

      // Main outline box for selection/status highlight
      const baseGeo = new THREE.BoxGeometry(cols * 4, 1.5, rows * 3);
      const baseMat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(startX + (cols - 1) * 2, 0.5, startZ + (rows - 1) * 1.5);
      g.add(base);

      // Fault indicator beacon
      const beaconGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(startX + (cols - 1) * 2, 6, startZ + (rows - 1) * 1.5);
      g.add(beacon);

      assetGroup.add(g);
      interactiveMeshes.push(base);
      base.userData = { tagId };

      return { group: g, beacon };
    };

    // Procedural Inverter / Transformer Station Creator
    const createStation = (tagId, x, z, status, isTrafo = false) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.userData = { tagId };

      const color = getStatusColorHex(tagId, status);

      // Box body
      const bodyGeo = new THREE.BoxGeometry(6, 4, 6);
      const bodyMat = new THREE.MeshPhongMaterial({
        color: isTrafo ? 0x2d3748 : 0x718096,
        shininess: 20
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 2.0;
      g.add(body);

      // Details (ventilation slits / decals)
      const detailGeo = new THREE.BoxGeometry(4, 2, 0.2);
      const detailMat = new THREE.MeshPhongMaterial({ color: 0x1a202c });
      const detail1 = new THREE.Mesh(detailGeo, detailMat);
      detail1.position.set(0, 2.0, 3.01);
      g.add(detail1);

      // Fault indicator beacon
      const beaconGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 6, 0);
      g.add(beacon);

      assetGroup.add(g);
      interactiveMeshes.push(body);
      body.userData = { tagId };

      return { group: g, beacon };
    };

    // Instantiate Plant Assets procedural meshes
    const wtgs = [
      createWindTurbine('WTG-01', -35, -20, assets.find((a) => a.tagId === 'WTG-01')?.status),
      createWindTurbine('WTG-02', -35, 20, assets.find((a) => a.tagId === 'WTG-02')?.status)
    ];

    const pvs = [
      createSolarArray(
        'PV-ARRAY-01',
        10,
        -30,
        4,
        6,
        assets.find((a) => a.tagId === 'PV-ARRAY-01')?.status
      ),
      createSolarArray(
        'PV-ARRAY-02',
        10,
        10,
        4,
        6,
        assets.find((a) => a.tagId === 'PV-ARRAY-02')?.status
      )
    ];

    const inverters = [
      createStation('INV-01', 15, -5, assets.find((a) => a.tagId === 'INV-01')?.status),
      createStation('INV-02', 25, -5, assets.find((a) => a.tagId === 'INV-02')?.status)
    ];

    const trafo = createStation(
      'TRAFO-01',
      -5,
      0,
      assets.find((a) => a.tagId === 'TRAFO-01')?.status,
      true
    );

    // 6. Mouse Raycasting Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const tagId = hitMesh.userData.tagId;
        const match = assets.find((a) => a.tagId === tagId);
        if (match) {
          setSelectedAsset(match);
        }
      } else {
        setSelectedAsset(null);
      }
    };
    renderer.domElement.addEventListener('click', handleMouseClick);

    // 7. Animation Loop
    let lastTime = performance.now();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const time = performance.now();
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Rotate Turbine blades based on their live RPM telemetry
      wtgs.forEach((wtg) => {
        const assetData = assets.find((a) => a.tagId === wtg.group.userData.tagId);
        if (assetData) {
          const rpm = assetData.telemetry['RPM'] || 0;
          const speedRad = (rpm * 2 * Math.PI) / 60; // rad/s
          rotationAnglesRef.current[assetData.tagId] += speedRad * deltaTime;
          wtg.blades.rotation.z = rotationAnglesRef.current[assetData.tagId];
        }
      });

      // Pulse fault/online beacons above assets
      const pulseFactor = 0.7 + 0.3 * Math.sin(time * 0.005);

      // Update beacons
      wtgs.forEach((wtg) => wtg.beacon.scale.set(pulseFactor, pulseFactor, pulseFactor));
      pvs.forEach((pv) => pv.beacon.scale.set(pulseFactor, pulseFactor, pulseFactor));
      inverters.forEach((inv) => inv.beacon.scale.set(pulseFactor, pulseFactor, pulseFactor));
      trafo.beacon.scale.set(pulseFactor, pulseFactor, pulseFactor);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.removeEventListener('click', handleMouseClick);
        renderer.dispose();
      }
    };
  }, [assets, breakers]);

  return (
    <div className="viewer-3d-container">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Selected Asset Overlay Details panel */}
      {selectedAsset && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(10, 11, 16, 0.9)',
            border: '1px solid var(--hmi-border)',
            borderRadius: '4px',
            width: '200px',
            padding: '12px',
            zIndex: 20,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              color: 'var(--text-bright)',
              marginBottom: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: '4px'
            }}
          >
            {selectedAsset.tagId}
          </div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>
            Tipo: {selectedAsset.assetType}
          </div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>
            Ubicación: {selectedAsset.location}
          </div>

          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--hmi-cyan)', marginBottom: '4px' }}>
              TELEMETRÍA:
            </div>
            {Object.entries(selectedAsset.telemetry).map(([param, val]) => (
              <div
                key={param}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span>{param}:</span>
                <span style={{ color: 'var(--text-bright)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          pointerEvents: 'none',
          background: 'rgba(10, 11, 16, 0.55)',
          padding: '6px 10px',
          borderRadius: '3px',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)'
        }}
      >
        [ CLICK EN EQUIPO PARA INSPECCIÓN ]
      </div>
    </div>
  );
}
