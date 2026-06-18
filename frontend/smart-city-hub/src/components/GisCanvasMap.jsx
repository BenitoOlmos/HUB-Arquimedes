import React, { useRef, useEffect, useState } from 'react';
import { Play, Square, Layers, Navigation } from 'lucide-react';

export default function GisCanvasMap({ routes, intersections, kpis, activeEvent }) {
  const canvasRef = useRef(null);
  const [hoveredEntity, setHoveredEntity] = useState(null);

  // Coordinate mapping bounds
  const latMin = -33.62;
  const latMax = -33.35;
  const lngMin = -70.82;
  const lngMax = -70.52;

  const getCanvasCoords = (lat, lng, width, height) => {
    const x = 50 + ((lng - lngMin) / (lngMax - lngMin)) * (width - 100);
    const y = height - 50 - ((lat - latMin) / (latMax - latMin)) * (height - 100);
    return { x, y };
  };

  // Main arterial roads coordinates in Santiago to draw background network grid
  const roads = [
    // 1. Alameda/Providencia/Apoquindo (West-East Corridor)
    {
      name: "Alameda - Av. Providencia - Av. Apoquindo",
      points: [
        { lat: -33.485, lng: -70.757 }, // Maipú
        { lat: -33.453, lng: -70.709 }, // Las Rejas
        { lat: -33.452, lng: -70.692 }, // General Velásquez
        { lat: -33.451, lng: -70.678 }, // Estación Central
        { lat: -33.444, lng: -70.647 }, // Santa Lucía (Centro)
        { lat: -33.424, lng: -70.612 }, // Pedro de Valdivia (Providencia)
        { lat: -33.412, lng: -70.578 }  // Las Condes
      ]
    },
    // 2. Vicuña Mackenna (South Corridor)
    {
      name: "Av. Vicuña Mackenna - Av. La Florida",
      points: [
        { lat: -33.444, lng: -70.647 }, // Plaza Italia / Santa Lucía
        { lat: -33.468, lng: -70.625 }, // Ñuble
        { lat: -33.512, lng: -70.598 }, // La Florida
        { lat: -33.595, lng: -70.578 }  // Puente Alto
      ]
    },
    // 3. Av. Grecia (South-East Corridor)
    {
      name: "Av. Grecia",
      points: [
        { lat: -33.468, lng: -70.625 }, // Ñuble
        { lat: -33.463, lng: -70.620 }, // Grecia / Ñuñoa
        { lat: -33.475, lng: -70.555 }  // Peñalolén
      ]
    },
    // 4. Av. Independencia (North Corridor)
    {
      name: "Av. Independencia",
      points: [
        { lat: -33.444, lng: -70.647 }, // Centro
        { lat: -33.415, lng: -70.665 }, // Independencia
        { lat: -33.375, lng: -70.675 }  // Huechuraba
      ]
    }
  ];

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = '#121b2d';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 1. Draw Arterial Roads (Transit Corridors)
    roads.forEach(road => {
      ctx.beginPath();
      road.points.forEach((pt, idx) => {
        const coords = getCanvasCoords(pt.lat, pt.lng, width, height);
        if (idx === 0) ctx.moveTo(coords.x, coords.y);
        else ctx.lineTo(coords.x, coords.y);
      });

      // Congestion levels: red if marathon event is on and it's Alameda
      const isAlameda = road.name.includes("Alameda");
      if (activeEvent === 'MARATON_ALAMEDA' && isAlameda) {
        ctx.strokeStyle = '#ef4444'; // Red jam
        ctx.lineWidth = 8;
      } else {
        ctx.strokeStyle = '#1e2d4a'; // normal dark-blue transit path
        ctx.lineWidth = 6;
      }
      ctx.stroke();

      // Draw dashed inner divider
      ctx.strokeStyle = '#2c416b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 2. Draw Traffic Intersections (Semaphores)
    intersections.forEach(inter => {
      const coords = getCanvasCoords(inter.lat, inter.lng, width, height);
      
      // Calculate light state (nominal or current time green/red indicator)
      // We read offset score or toggle color based on system ticks
      const sec = Math.floor(Date.now() / 1000);
      const cycle = inter.greenPhase + inter.redPhase;
      const isGreen = ((sec + inter.offset) % cycle) < inter.greenPhase;

      // Draw light halo glow
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 14, 0, 2 * Math.PI);
      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
      ctx.fill();

      // Draw light center circle
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = isGreen ? '#10b981' : '#f43f5e';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Intersection labels
      ctx.fillStyle = '#9ca3af';
      ctx.font = '9px sans-serif';
      ctx.fillText(inter.name.split('/')[1] || inter.name, coords.x - 20, coords.y - 18);
    });

    // 3. Draw Bus Units (Particles)
    routes.forEach(route => {
      route.buses.forEach(bus => {
        const telemetry = bus.telemetry[0];
        if (!telemetry) return;

        const coords = getCanvasCoords(telemetry.lat, telemetry.lng, width, height);

        // Draw bus particle glow
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fill();

        // Draw bus dot center
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#22d3ee'; // Cyan glow
        ctx.fill();
        ctx.strokeStyle = '#04060b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Route code Label next to bus
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(route.routeCode, coords.x + 8, coords.y + 3);
      });
    });

    // 4. Draw Marathon blocked area if active
    if (activeEvent === 'MARATON_ALAMEDA') {
      const midCoords = getCanvasCoords(-33.4440, -70.6470, width, height);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
      ctx.beginPath();
      ctx.arc(midCoords.x, midCoords.y, 60, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText("🚫 ALAMEDA CERRADA (MARATÓN)", midCoords.x - 70, midCoords.y + 4);
    }
  }, [routes, intersections, activeEvent]);

  // Handle canvas mouse move for interactive tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    // Check if mouse is near any bus unit
    for (const route of routes) {
      for (const bus of route.buses) {
        const telemetry = bus.telemetry[0];
        if (!telemetry) continue;
        const coords = getCanvasCoords(telemetry.lat, telemetry.lng, width, height);
        const dist = Math.sqrt(Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2));
        
        if (dist < 10) {
          setHoveredEntity({
            type: 'BUS',
            plateNumber: bus.plateNumber,
            routeCode: route.routeCode,
            speed: telemetry.speed,
            passengers: telemetry.passengerCount,
            capacity: bus.capacity
          });
          return;
        }
      }
    }

    // Check if mouse is near any intersection
    for (const inter of intersections) {
      const coords = getCanvasCoords(inter.lat, inter.lng, width, height);
      const dist = Math.sqrt(Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2));

      if (dist < 12) {
        setHoveredEntity({
          type: 'INTERSECTION',
          name: inter.name,
          green: inter.greenPhase,
          red: inter.redPhase,
          offset: inter.offset
        });
        return;
      }
    }

    setHoveredEntity(null);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      
      {/* Map controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation className="logo-icon" size={20} />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Visor Espacial GIS Metropolitano</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Partículas de buses Red Bus en vivo</p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22d3ee' }}></span>
            Bus Transantiago
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            Semáforo Verde
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f43f5e' }}></span>
            Semáforo Rojo
          </span>
        </div>
      </div>

      {/* Main Canvas view */}
      <div style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={480} 
          onMouseMove={handleMouseMove}
          style={{ display: 'block', width: '100%', height: 'auto', cursor: hoveredEntity ? 'pointer' : 'default' }}
        />

        {/* Dynamic Tooltip inside the canvas card */}
        {hoveredEntity && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10,
            maxWidth: '260px'
          }}>
            {hoveredEntity.type === 'BUS' ? (
              <div>
                <h4 style={{ color: '#22d3ee', marginBottom: '0.25rem' }}>Bus {hoveredEntity.plateNumber}</h4>
                <p><strong>Recorrido:</strong> {hoveredEntity.routeCode}</p>
                <p><strong>Velocidad:</strong> {hoveredEntity.speed} km/h</p>
                <p>
                  <strong>Ocupación:</strong> {hoveredEntity.passengers} / {hoveredEntity.capacity} pasajeros
                  <span style={{ display: 'block', height: '4px', backgroundColor: '#1f2937', borderRadius: '2px', marginTop: '0.25rem', overflow: 'hidden' }}>
                    <span style={{
                      display: 'block',
                      height: '100%',
                      width: `${(hoveredEntity.passengers / hoveredEntity.capacity) * 100}%`,
                      backgroundColor: hoveredEntity.passengers >= hoveredEntity.capacity * 0.9 ? '#f43f5e' : '#10b981'
                    }}></span>
                  </span>
                </p>
              </div>
            ) : (
              <div>
                <h4 style={{ color: '#eab308', marginBottom: '0.25rem' }}>Semáforo Intersección</h4>
                <p><strong>Ubicación:</strong> {hoveredEntity.name}</p>
                <p><strong>Fase Verde:</strong> {hoveredEntity.green}s</p>
                <p><strong>Fase Roja:</strong> {hoveredEntity.red}s</p>
                <p><strong>Sincro (Offset):</strong> {hoveredEntity.offset}s</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
