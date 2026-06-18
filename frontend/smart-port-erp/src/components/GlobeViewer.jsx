import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Navigation, Anchor, Compass, Info } from 'lucide-react';

const PORT_LOCATIONS = [
  { name: 'Shanghai', lat: 31.2, lng: 121.5, color: '#10b981' },
  { name: 'Singapore', lat: 1.3, lng: 103.8, color: '#10b981' },
  { name: 'Rotterdam', lat: 51.9, lng: 4.4, color: '#10b981' },
  { name: 'Los Angeles', lat: 33.7, lng: -118.2, color: '#10b981' },
  { name: 'New York', lat: 40.7, lng: -74.0, color: '#10b981' },
  { name: 'Valparaíso', lat: -33.0, lng: -71.6, color: '#10b981' },
  { name: 'Cabo', lat: -33.9, lng: 18.4, color: '#a855f7' }
];

const PORT_COORDINATES = {
  Shanghai: { lat: 31.2, lng: 121.5 },
  Singapore: { lat: 1.3, lng: 103.8 },
  Rotterdam: { lat: 51.9, lng: 4.4 },
  'Los Angeles': { lat: 33.7, lng: -118.2 },
  'New York': { lat: 40.7, lng: -74.0 },
  Valparaíso: { lat: -33.0, lng: -71.6 },
  Cabo: { lat: -33.9, lng: 18.4 }
};

const GlobeViewer = ({ ships, activeCrises, onRerouteShip, onTriggerAlert }) => {
  const containerRef = useRef(null);
  const [selectedShip, setSelectedShip] = useState(null);
  const [hoveredPort, setHoveredPort] = useState(null);

  // Convert lat/lng to 3D Cartesian coordinates on a sphere of radius R
  const latLngToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040810, 0.005);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Earth Globe
    const globeRadius = 50;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 40, 40);

    // Grid wireframe material for futuristic sci-fi feel
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0f2040,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Add a solid inner core with a dark blue glow
    const innerGeometry = new THREE.SphereGeometry(globeRadius - 0.5, 30, 30);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x050a15,
      transparent: true,
      opacity: 0.85
    });
    const innerGlobe = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerGlobe);

    // 3. Port Markers
    const portGroup = new THREE.Group();
    PORT_LOCATIONS.forEach((port) => {
      const pos = latLngToVector3(port.lat, port.lng, globeRadius + 0.5);
      const markerGeom = new THREE.SphereGeometry(1.2, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({
        color: port.name === 'Cabo' ? 0xa855f7 : 0x10b981,
        transparent: true,
        opacity: 0.9
      });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.copy(pos);
      portGroup.add(marker);
    });
    scene.add(portGroup);

    // 4. Shipping route lines (Arc splines)
    const routesGroup = new THREE.Group();

    const drawRouteArc = (start, end, colorHex) => {
      const startVec = latLngToVector3(start.lat, start.lng, globeRadius);
      const endVec = latLngToVector3(end.lat, end.lng, globeRadius);

      // Create a Bezier control point arched outward
      const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
      const dist = startVec.distanceTo(endVec);
      midPoint.normalize().multiplyScalar(globeRadius + dist * 0.18); // Arched height

      const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
      const points = curve.getPoints(50);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.35,
        linewidth: 1
      });
      const line = new THREE.Line(lineGeom, lineMat);
      routesGroup.add(line);
    };

    // Plot major routes
    drawRouteArc(PORT_COORDINATES['Shanghai'], PORT_COORDINATES['Los Angeles'], 0x06b6d4);
    drawRouteArc(PORT_COORDINATES['Rotterdam'], PORT_COORDINATES['New York'], 0x06b6d4);
    drawRouteArc(PORT_COORDINATES['Valparaíso'], PORT_COORDINATES['Shanghai'], 0x06b6d4);
    drawRouteArc(PORT_COORDINATES['Singapore'], PORT_COORDINATES['Rotterdam'], 0x06b6d4);
    drawRouteArc(PORT_COORDINATES['Singapore'], PORT_COORDINATES['Valparaíso'], 0x06b6d4);

    scene.add(routesGroup);

    // 5. Live Ships Markers Group
    const shipsGroup = new THREE.Group();
    scene.add(shipsGroup);

    const updateShipMarkers = () => {
      // Clear old markers
      while (shipsGroup.children.length > 0) {
        shipsGroup.remove(shipsGroup.children[0]);
      }

      // Draw active coordinates
      ships.forEach((ship) => {
        const lat = ship.currentLat !== undefined ? ship.currentLat : ship.lat;
        const lng = ship.currentLng !== undefined ? ship.currentLng : ship.lng;
        const pos = latLngToVector3(lat, lng, globeRadius + 1.0);

        const isDetoured = ship.dailyFuelCost > 20000; // Tracked by daily fuel cost increase
        const color = ship.status === 'FONDEADO' ? 0xeab308 : isDetoured ? 0xa855f7 : 0x00e5ff;

        const shipGeom = new THREE.BoxGeometry(0.9, 0.9, 1.8);
        const shipMat = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(shipGeom, shipMat);

        mesh.position.copy(pos);
        mesh.lookAt(new THREE.Vector3(0, 0, 0)); // Look inwards to sphere
        shipsGroup.add(mesh);
      });
    };

    updateShipMarkers();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 6. Interactive Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = () => {
      isDragging = true;
    };

    const handleMouseMove = (e) => {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      if (isDragging) {
        globe.rotation.y += deltaMove.x * 0.005;
        globe.rotation.x += deltaMove.y * 0.005;
        innerGlobe.rotation.y += deltaMove.x * 0.005;
        innerGlobe.rotation.x += deltaMove.y * 0.005;
        portGroup.rotation.y += deltaMove.x * 0.005;
        portGroup.rotation.x += deltaMove.y * 0.005;
        routesGroup.rotation.y += deltaMove.x * 0.005;
        routesGroup.rotation.x += deltaMove.y * 0.005;
        shipsGroup.rotation.y += deltaMove.x * 0.005;
        shipsGroup.rotation.x += deltaMove.y * 0.005;
      }

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 7. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotate very slowly if not dragging
      if (!isDragging) {
        globe.rotation.y += 0.0008;
        innerGlobe.rotation.y += 0.0008;
        portGroup.rotation.y += 0.0008;
        routesGroup.rotation.y += 0.0008;
        shipsGroup.rotation.y += 0.0008;
      }

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
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      globeGeometry.dispose();
      globeMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
    };
  }, [ships]);

  const handleRerouteClick = (ship) => {
    const isDetoured = ship.dailyFuelCost > 20000;
    const targetOption = isDetoured ? 'DEFAULT' : 'DETOUR';
    onRerouteShip(ship.id, targetOption);

    const alertMsg =
      targetOption === 'DETOUR'
        ? `Buque ${ship.name} desviado vía Cabo de Buena Esperanza para evitar bloqueo. Combustible diario +35%`
        : `Buque ${ship.name} retornado a ruta predeterminada (Canal).`;

    onTriggerAlert(alertMsg);

    // Update local select state
    setSelectedShip((prev) =>
      prev
        ? {
            ...prev,
            dailyFuelCost:
              targetOption === 'DETOUR' ? prev.dailyFuelCost * 1.35 : prev.dailyFuelCost / 1.35
          }
        : null
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      {/* 3D Viewport container */}
      <div className="glass-panel" style={{ padding: 0, position: 'relative' }}>
        <div className="globe-visualizer-container" ref={containerRef}>
          {/* Overlay HUD indicators */}
          <div className="globe-overlay-hud">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold',
                color: 'var(--accent-cyan)'
              }}
            >
              <Compass size={14} className="header-logo" /> Telemetría GPS Global (3D)
            </div>
            <div>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-route)',
                  display: 'inline-block',
                  marginRight: '4px'
                }}
              ></span>
              Ruta Convencional (Canal)
            </div>
            <div>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-detour)',
                  display: 'inline-block',
                  marginRight: '4px'
                }}
              ></span>
              Ruta Alterna (Desvío Cabo)
            </div>
            <div>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-anchor)',
                  display: 'inline-block',
                  marginRight: '4px'
                }}
              ></span>
              Fondeado / Puerto
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              * Arrastra el globo para rotar y haz clic en barcos de la lista para desviar.
            </div>
          </div>
        </div>
      </div>

      {/* Fleets Rerouting Panel */}
      <div
        className="glass-panel"
        style={{ display: 'flex', flexDirection: 'column', height: '480px' }}
      >
        <div className="panel-header" style={{ marginBottom: '0.85rem' }}>
          <div className="panel-title">
            <Navigation size={18} color="var(--accent-cyan)" /> Flota Activa ({ships.length} Buques)
          </div>
        </div>

        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            paddingRight: '4px'
          }}
        >
          {ships.slice(0, 45).map((ship) => {
            const isDetoured = ship.dailyFuelCost > 20000;
            const isSuezApproaching = ship.imoNumber.includes('1') || ship.imoNumber.includes('6'); // Simple heuristic matching service
            const isPanamaApproaching =
              ship.imoNumber.includes('3') || ship.imoNumber.includes('8');

            return (
              <div
                key={ship.id}
                onClick={() => setSelectedShip(ship)}
                style={{
                  background:
                    selectedShip?.id === ship.id
                      ? 'rgba(6, 182, 212, 0.06)'
                      : 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid',
                  borderColor:
                    selectedShip?.id === ship.id ? 'var(--accent-cyan)' : 'var(--border-glass)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <strong>{ship.name}</strong>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color:
                        ship.status === 'FONDEADO'
                          ? 'var(--color-anchor)'
                          : isDetoured
                            ? 'var(--color-detour)'
                            : 'var(--color-route)',
                      fontWeight: 'bold'
                    }}
                  >
                    {ship.status} {isDetoured && '(DESVÍO)'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '4px',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    marginTop: '4px'
                  }}
                >
                  <div>
                    IMO: {ship.imoNumber || ship.imo} ({ship.capacityTEU} TEU)
                  </div>
                  <div>Combustible: {ship.fuelLevel}%</div>
                  <div>
                    GPS: {ship.currentLat !== undefined ? ship.currentLat : ship.lat},{' '}
                    {ship.currentLng !== undefined ? ship.currentLng : ship.lng}
                  </div>
                  <div>Cost/Día: ${ship.dailyFuelCost.toLocaleString()}</div>
                </div>

                {selectedShip?.id === ship.id && (
                  <div
                    style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      gap: '6px'
                    }}
                  >
                    <button
                      className="btn-primary"
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.7rem',
                        flex: 1,
                        justifyContent: 'center'
                      }}
                      onClick={() => handleRerouteClick(ship)}
                    >
                      <Anchor size={12} /> {isDetoured ? 'Restablecer Ruta' : 'Desviar Buque'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobeViewer;
