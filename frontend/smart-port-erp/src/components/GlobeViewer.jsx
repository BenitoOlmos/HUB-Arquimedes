import React, { useState, useEffect } from 'react';
import { Navigation, Anchor, Compass } from 'lucide-react';

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
  const [selectedShip, setSelectedShip] = useState(null);

  // Auto-sync selected ship state with live data changes
  useEffect(() => {
    if (selectedShip && ships.length > 0) {
      const match = ships.find((s) => s.id === selectedShip.id);
      if (match) setSelectedShip(match);
    }
  }, [ships]);

  // Map dimensions for the 2D SVG
  const mapWidth = 600;
  const mapHeight = 300;

  // Convert lat/lng to 2D SVG coordinates
  const getXY = (lat, lng) => {
    const x = ((lng + 180) * mapWidth) / 360;
    const y = ((90 - lat) * mapHeight) / 180;
    return { x, y };
  };

  const handleRerouteClick = (ship) => {
    const isDetoured = ship.dailyFuelCost > 20000;
    const targetOption = isDetoured ? 'DEFAULT' : 'DETOUR';
    onRerouteShip(ship.id, targetOption);

    const alertMsg =
      targetOption === 'DETOUR'
        ? `Buque ${ship.name} desviado vía Cabo de Buena Esperanza para evitar bloqueo. Combustible diario +35%`
        : `Buque ${ship.name} retornado a ruta predeterminada (Canal).`;

    onTriggerAlert(alertMsg);
  };

  const routes = [
    { from: 'Shanghai', to: 'Los Angeles' },
    { from: 'Rotterdam', to: 'New York' },
    { from: 'Valparaíso', to: 'Shanghai' },
    { from: 'Singapore', to: 'Rotterdam' },
    { from: 'Singapore', to: 'Valparaíso' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      {/* 2D Map Viewport Container */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              color: 'var(--accent-blue)'
            }}
          >
            <Compass size={18} />
            <span>Monitoreo de Rutas de Navegación 2D</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#06b6d4' }}
              ></span>
              Ruta Canal
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a855f7' }}
              ></span>
              Desvío Cabo
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#eab308' }}
              ></span>
              Fondeado
            </span>
          </div>
        </div>

        {/* 2D SVG Map */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            overflow: 'hidden',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            width="100%"
            height="auto"
            style={{ display: 'block', backgroundColor: 'transparent' }}
          >
            {/* Grid network background lines */}
            {Array.from({ length: 12 }).map((_, i) => {
              const x = (mapWidth / 12) * i;
              return (
                <line
                  key={`gx-${i}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={mapHeight}
                  stroke="rgba(15, 23, 42, 0.03)"
                  strokeWidth="1"
                />
              );
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const y = (mapHeight / 6) * i;
              return (
                <line
                  key={`gy-${i}`}
                  x1={0}
                  y1={y}
                  x2={mapWidth}
                  y2={y}
                  stroke="rgba(15, 23, 42, 0.03)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Draw route lines */}
            {routes.map((route, idx) => {
              const startCoords = PORT_COORDINATES[route.from];
              const endCoords = PORT_COORDINATES[route.to];
              if (!startCoords || !endCoords) return null;

              const p1 = getXY(startCoords.lat, startCoords.lng);
              const p2 = getXY(endCoords.lat, endCoords.lng);

              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2 - 40;

              return (
                <path
                  key={`route-${idx}`}
                  d={`M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke="rgba(14, 165, 233, 0.15)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Draw ports */}
            {PORT_LOCATIONS.map((port, idx) => {
              const { x, y } = getXY(port.lat, port.lng);
              return (
                <g key={`port-${idx}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={port.color}
                    opacity="0.8"
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="9"
                    fill="none"
                    stroke={port.color}
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="animate-ping"
                  />
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="8"
                    fontWeight="800"
                  >
                    {port.name}
                  </text>
                </g>
              );
            })}

            {/* Draw live ships */}
            {ships.map((ship) => {
              const lat = ship.currentLat !== undefined ? ship.currentLat : ship.lat;
              const lng = ship.currentLng !== undefined ? ship.currentLng : ship.lng;
              const { x, y } = getXY(lat, lng);

              const isDetoured = ship.dailyFuelCost > 20000;
              const color =
                ship.status === 'FONDEADO' ? '#eab308' : isDetoured ? '#a855f7' : '#06b6d4';
              const isSelected = selectedShip?.id === ship.id;

              return (
                <g
                  key={ship.id}
                  onClick={() => setSelectedShip(ship)}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="none"
                      stroke="var(--accent-blue)"
                      strokeWidth="2"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '6' : '4.5'}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.3))' }}
                  />
                  {isSelected && (
                    <text
                      x={x}
                      y={y + 16}
                      textAnchor="middle"
                      fill="var(--accent-blue)"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {ship.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Fleets Rerouting Panel */}
      <div
        className="glass-panel"
        style={{ display: 'flex', flexDirection: 'column', height: '480px' }}
      >
        <div className="panel-header" style={{ marginBottom: '0.85rem' }}>
          <div className="panel-title" style={{ fontSize: '1rem', fontWeight: 800 }}>
            <Navigation size={18} color="var(--accent-blue)" />
            <span>Flota Activa ({ships.length} Buques)</span>
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
            const isSelected = selectedShip?.id === ship.id;

            return (
              <div
                key={ship.id}
                onClick={() => setSelectedShip(ship)}
                style={{
                  background: isSelected ? 'rgba(14, 165, 233, 0.06)' : 'rgba(15, 23, 42, 0.01)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-glass)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.25s ease'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>{ship.name}</strong>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color:
                        ship.status === 'FONDEADO' ? '#d97706' : isDetoured ? '#7e22ce' : '#0284c7',
                      fontWeight: 'bold',
                      backgroundColor:
                        ship.status === 'FONDEADO' ? '#fef3c7' : isDetoured ? '#f3e8ff' : '#e0f2fe',
                      padding: '2px 6px',
                      borderRadius: '20px',
                      border: `1px solid ${ship.status === 'FONDEADO' ? '#f59e0b' : isDetoured ? '#c084fc' : '#38bdf8'}`
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
                    marginTop: '6px'
                  }}
                >
                  <div>
                    IMO: {ship.imoNumber || ship.imo} ({ship.capacityTEU} TEU)
                  </div>
                  <div>Combustible: {ship.fuelLevel}%</div>
                  <div>
                    GPS:{' '}
                    {ship.currentLat !== undefined
                      ? ship.currentLat.toFixed(2)
                      : ship.lat.toFixed(2)}
                    ,{' '}
                    {ship.currentLng !== undefined
                      ? ship.currentLng.toFixed(2)
                      : ship.lng.toFixed(2)}
                  </div>
                  <div>Cost/Día: ${ship.dailyFuelCost.toLocaleString()}</div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-glass)',
                      display: 'flex',
                      gap: '6px'
                    }}
                  >
                    <button
                      className="premium-btn active"
                      style={{
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.75rem',
                        flex: 1,
                        justifyContent: 'center',
                        borderRadius: '6px'
                      }}
                      onClick={() => handleRerouteClick(ship)}
                    >
                      <span>{isDetoured ? 'Restablecer Ruta' : 'Desviar Buque'}</span>
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
