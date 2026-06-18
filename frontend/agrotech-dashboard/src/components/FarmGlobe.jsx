import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Droplet, Thermometer, Sun, Activity, Settings, Eye } from 'lucide-react';

const FarmGlobe = ({ zones, onToggleValve, onTriggerAlert }) => {
  const containerRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // Auto-select first zone if none selected
  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0]);
    } else if (zones.length > 0 && selectedZone) {
      // Keep selected zone updated with live data
      const updated = zones.find((z) => z.id === selectedZone.id);
      if (updated) setSelectedZone(updated);
    }
  }, [zones]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020804, 0.01);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 75, 110);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // 3. Draw Farm Quadrants
    // 4 quadrants arranged in a 2x2 grid
    // Zone A (-15, -15), Zone B (15, -15), Zone C (-15, 15), Zone D (15, 15)
    const quadrantsGroup = new THREE.Group();
    scene.add(quadrantsGroup);

    const quadrantMeshes = [];

    const getMoistureColor = (val) => {
      // Red/Brown (dry) -> Yellow (moderate) -> Emerald Green (wet)
      if (val < 20) return 0xef4444; // Dry red
      if (val < 40) return 0xeab308; // Normal amber
      return 0x10b981; // Healthy green
    };

    zones.forEach((zone, index) => {
      // Determine offsets
      const xOffset = index % 2 === 0 ? -22 : 22;
      const zOffset = index < 2 ? -22 : 22;

      // Base quadrant ground mesh
      const qGeom = new THREE.BoxGeometry(38, 3, 38);
      const moistureSensor = zone.sensors.find((s) => s.type === 'SOIL_MOISTURE');
      const moistureVal = moistureSensor ? moistureSensor.currentValue : 40;
      const qMat = new THREE.MeshStandardMaterial({
        color: getMoistureColor(moistureVal),
        roughness: 0.8,
        metalness: 0.1
      });
      const qMesh = new THREE.Mesh(qGeom, qMat);
      qMesh.position.set(xOffset, -1.5, zOffset);
      qMesh.userData = { zoneId: zone.id };
      quadrantsGroup.add(qMesh);
      quadrantMeshes.push(qMesh);

      // Render simple procedural plant model
      // Stem
      const stemGeom = new THREE.CylinderGeometry(0.5, 0.8, 12, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 }); // Brown stem
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.set(xOffset, 6, zOffset);
      quadrantsGroup.add(stem);

      // Foliage (Leaves)
      // Size scales with crop health (simulated via soil moisture health)
      const leavesGeom = new THREE.SphereGeometry(6, 12, 12);
      const leavesMat = new THREE.MeshStandardMaterial({
        color: moistureVal < 20 ? 0x854d0e : 0x22c55e, // Wilted brown or green
        roughness: 0.6
      });
      const leaves = new THREE.Mesh(leavesGeom, leavesMat);
      leaves.position.set(xOffset, 12, zOffset);
      quadrantsGroup.add(leaves);

      // Sprinkler model
      const sprinklerGeom = new THREE.CylinderGeometry(0.8, 0.8, 4, 8);
      const sprinklerMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const sprinkler = new THREE.Mesh(sprinklerGeom, sprinklerMat);
      sprinkler.position.set(xOffset + 12, 2, zOffset + 12);
      quadrantsGroup.add(sprinkler);

      // Sprinkler water spray lines (rendered if valve status is ABIERTA)
      const valve = zone.valves[0];
      if (valve && valve.status === 'ABIERTA') {
        const sprayGroup = new THREE.Group();
        const sprayMat = new THREE.LineBasicMaterial({
          color: 0x0ea5e9,
          transparent: true,
          opacity: 0.6
        });

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const points = [];
          points.push(new THREE.Vector3(xOffset + 12, 4, zOffset + 12));
          points.push(
            new THREE.Vector3(xOffset + Math.cos(angle) * 12, 1, zOffset + Math.sin(angle) * 12)
          );

          const curve = new THREE.CatmullRomCurve3(points);
          const sprayGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(10));
          const sprayLine = new THREE.Line(sprayGeom, sprayMat);
          sprayGroup.add(sprayLine);
        }
        quadrantsGroup.add(sprayGroup);
      }
    });

    // 4. Grid helper over quadrants
    const gridHelper = new THREE.GridHelper(90, 15, 0x10b981, 0x10b981);
    gridHelper.position.y = 0.1;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 5. Interactive Raycaster for quadrant clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(quadrantMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const clickedZoneId = clickedMesh.userData.zoneId;
        const matchedZone = zones.find((z) => z.id === clickedZoneId);
        if (matchedZone) {
          setSelectedZone(matchedZone);
          onTriggerAlert(`Predio Seleccionado: ${matchedZone.name}`);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 6. Animation and rotation loop
    let animationFrameId;
    let angle = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate scene slowly
      angle += 0.0015;
      quadrantsGroup.rotation.y = Math.sin(angle) * 0.18;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleCanvasClick);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [zones]);

  const handleToggleValveState = (valveId, currentStatus) => {
    const nextStatus = currentStatus === 'ABIERTA' ? 'CERRADA' : 'ABIERTA';
    onToggleValve(valveId, nextStatus);
    onTriggerAlert(`Comando Domótico: Válvula ${valveId} establecida en ${nextStatus}`);
  };

  const getSensorIcon = (type) => {
    if (type === 'SOIL_MOISTURE') return <Droplet size={14} color="var(--color-moisture)" />;
    if (type === 'PH') return <Activity size={14} color="var(--color-ph)" />;
    if (type === 'TEMPERATURE') return <Thermometer size={14} color="var(--color-temp)" />;
    return <Sun size={14} color="var(--color-radiation)" />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.5rem' }}>
      {/* 3D Topographical Heatmap viewport */}
      <div className="glass-panel" style={{ padding: 0, position: 'relative' }}>
        <div className="topography-container" ref={containerRef}>
          <div className="map-overlay-hud">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
                color: 'var(--accent-emerald)'
              }}
            >
              <Eye size={14} /> Gemelo Digital de Suelo (3D)
            </div>
            <div>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'inline-block',
                  marginRight: '4px'
                }}
              ></span>
              Estrés Hídrico (&lt;20%)
            </div>
            <div>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#eab308',
                  display: 'inline-block',
                  marginRight: '4px'
                }}
              ></span>
              Humedad Normal (20% - 40%)
            </div>
            <div>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'inline-block',
                  marginRight: '4px'
                }}
              ></span>
              Humedad Óptima (&gt;40%)
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              * Haz clic en los cuadrantes 3D para inspeccionar telemetrías y aspersores.
            </div>
          </div>
        </div>
      </div>

      {/* Selected quadrant sensors detail */}
      <div
        className="glass-panel"
        style={{ display: 'flex', flexDirection: 'column', height: '480px' }}
      >
        {selectedZone ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header" style={{ marginBottom: '0.8rem' }}>
              <div className="panel-title" style={{ fontSize: '1rem' }}>
                <Settings size={18} color="var(--accent-emerald)" /> {selectedZone.name}
              </div>
            </div>

            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem'
              }}
            >
              Variedad de Cultivo: <strong>{selectedZone.cropType}</strong>
            </div>

            {/* Live Sensors Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.6rem',
                marginBottom: '1rem'
              }}
            >
              {selectedZone.sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '0.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {getSensorIcon(sensor.type)}
                    {sensor.type.replace('_', ' ')}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {sensor.currentValue.toFixed(1)}
                    {sensor.type === 'SOIL_MOISTURE' && '%'}
                    {sensor.type === 'TEMPERATURE' && '°C'}
                    {sensor.type === 'RADIATION' && ' W/m²'}
                    {sensor.type === 'PH' && ' pH'}
                  </span>
                </div>
              ))}
            </div>

            {/* Domotics Irrigation electrovalve controls */}
            {selectedZone.valves.map((valve) => (
              <div
                key={valve.id}
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem'
                  }}
                >
                  <span>Aspersores Domóticos:</span>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color:
                        valve.status === 'ABIERTA'
                          ? 'var(--color-valve-open)'
                          : 'var(--color-valve-closed)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {valve.status}
                  </span>
                </div>

                <button
                  className={valve.status === 'ABIERTA' ? 'btn-danger' : 'btn-primary'}
                  style={{ justifyContent: 'center' }}
                  onClick={() => handleToggleValveState(valve.id, valve.status)}
                >
                  {valve.status === 'ABIERTA' ? 'Cerrar Electroválvula' : 'Abrir Electroválvula'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '6rem 0',
              fontSize: '0.8rem'
            }}
          >
            Cargando cuadrantes del terreno...
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmGlobe;
