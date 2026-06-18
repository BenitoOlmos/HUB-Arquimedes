import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Navigation, 
  Settings, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Map, 
  Play, 
  Square,
  Sparkles,
  Info,
  Timer
} from 'lucide-react';
import GisCanvasMap from './components/GisCanvasMap';
import TrafficLightController from './components/TrafficLightController';
import OdMatrixChart from './components/OdMatrixChart';

export default function App() {
  const [activeTab, setActiveTab] = useState('gis');
  const [routes, setRoutes] = useState([]);
  const [intersections, setIntersections] = useState([]);
  const [odMatrix, setOdMatrix] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [activeEvent, setActiveEvent] = useState('NORMAL');
  const [liveLogs, setLiveLogs] = useState([]);

  const socketRef = useRef(null);

  // Load initial data
  useEffect(() => {
    fetchInitialData();

    // Socket.io stream subscription
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to Smart City WebSockets stream');
    });

    socketRef.current.on('mobility-telemetry-update', (payload) => {
      if (payload.routes) setRoutes(payload.routes);
      if (payload.intersections) setIntersections(payload.intersections);
      if (payload.kpis) {
        setKpis(payload.kpis);
        setActiveEvent(payload.kpis.activeEvent);
      }

      if (payload.stepTelemetry && payload.stepTelemetry.length > 0) {
        // Pick one random bus update to log in console
        const randomUpdate = payload.stepTelemetry[Math.floor(Math.random() * payload.stepTelemetry.length)];
        const matchedRoute = payload.routes?.find(r => r.buses.some(b => b.id === randomUpdate.busId));
        
        if (randomUpdate && matchedRoute) {
          const logMsg = `🚌 Bus ${randomUpdate.busId.substring(0, 5)}... (${matchedRoute.routeCode}) avanza a ${randomUpdate.speed} km/h con ${randomUpdate.passengerCount} pasajeros.`;
          setLiveLogs(prev => [
            { id: Date.now(), msg: logMsg, timestamp: new Date().toLocaleTimeString() },
            ...prev.slice(0, 15)
          ]);
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [routesRes, intersRes, kpisRes, odRes, statusRes] = await Promise.all([
        fetch('/api/mobility/routes'),
        fetch('/api/mobility/intersections'),
        fetch('/api/mobility/analytics/kpis'),
        fetch('/api/mobility/analytics/od-matrix'),
        fetch('/api/mobility/simulation/status')
      ]);

      setRoutes(await routesRes.json());
      setIntersections(await intersRes.json());
      setKpis(await kpisRes.json());
      setOdMatrix(await odRes.json());
      const status = await statusRes.json();
      setSimulationActive(status.simulationActive);
      setActiveEvent(status.activeEvent);
    } catch (err) {
      console.error('Error fetching smart city initial values:', err);
    }
  };

  const handleToggleSimulation = async () => {
    const nextState = !simulationActive;
    try {
      const res = await fetch('/api/mobility/simulation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState })
      });
      const data = await res.json();
      setSimulationActive(data.simulationActive);

      setLiveLogs(prev => [
        { id: Date.now(), msg: nextState ? '🚀 Simulación Urbana INICIADA' : '⏹️ Simulación Urbana DETENIDA', timestamp: new Date().toLocaleTimeString() },
        ...prev
      ]);
    } catch (err) {
      console.error('Error toggling simulation:', err);
    }
  };

  const handleTriggerCrisis = async (eventCode) => {
    try {
      const res = await fetch('/api/mobility/simulation/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventCode })
      });
      const data = await res.json();
      setActiveEvent(data.activeEvent);
      
      let crisisMsg = '';
      if (eventCode === 'MARATON_ALAMEDA') crisisMsg = '🚨 ALERTA: Maratón Alameda activa. Tráfico cortado en Santa Lucía.';
      else if (eventCode === 'PARTIDO_ESTADIO') crisisMsg = '🚨 ALERTA: Partido en el Estadio Nacional. Demanda duplicada en Grecia y Providencia.';
      else crisisMsg = '✅ Tránsito urbano reestablecido a estado Normal.';

      setLiveLogs(prev => [
        { id: Date.now(), msg: crisisMsg, timestamp: new Date().toLocaleTimeString() },
        ...prev
      ]);
    } catch (err) {
      console.error('Error triggering crisis event:', err);
    }
  };

  const handleUpdateIntersection = async (id, greenPhase, redPhase, offset) => {
    const res = await fetch('/api/mobility/intersections/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, greenPhase, redPhase, offset })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update timing parameters');
    }

    // Refresh configurations
    await fetchInitialData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Header bar */}
      <header className="app-header">
        <div className="logo-container">
          <Navigation className="logo-icon" size={28} />
          <div>
            <span className="logo-text">Smart City Hub</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Centro de Control de Movilidad</span>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={simulationActive ? "pulse-dot" : ""} style={{ backgroundColor: simulationActive ? 'var(--color-green)' : 'var(--text-muted)' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: simulationActive ? 'var(--color-green)' : 'var(--text-secondary)' }}>
              {simulationActive ? "Simulador Activo" : "Simulación Detenida"}
            </span>
          </div>

          <button 
            onClick={handleToggleSimulation} 
            className={simulationActive ? "btn-secondary" : "btn-primary"}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {simulationActive ? <Square size={16} /> : <Play size={16} />}
            {simulationActive ? "Detener Simulación" : "Iniciar Simulación"}
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="main-content">
        
        {/* Navigation Tabs */}
        <div className="tab-bar">
          <button 
            className={`tab-btn ${activeTab === 'gis' ? 'active' : ''}`}
            onClick={() => setActiveTab('gis')}
          >
            <Map size={18} />
            Visualizador GIS
          </button>
          <button 
            className={`tab-btn ${activeTab === 'semaphores' ? 'active' : ''}`}
            onClick={() => setActiveTab('semaphores')}
          >
            <Settings size={18} />
            Sincronización de Semáforos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'od' ? 'active' : ''}`}
            onClick={() => setActiveTab('od')}
          >
            <Users size={18} />
            Matriz Origen-Destino
          </button>
        </div>

        {/* Tab 1: GIS Map & KPIs */}
        {activeTab === 'gis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Crisis Alerts Banner */}
            {activeEvent !== 'NORMAL' && (
              <div className="glass-card" style={{ display: 'flex', gap: '1rem', borderLeft: '4px solid var(--color-red)', backgroundColor: 'rgba(244, 63, 94, 0.05)', alignItems: 'center' }}>
                <ShieldAlert size={28} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#ff8a9a', marginBottom: '0.25rem' }}>
                    {activeEvent === 'MARATON_ALAMEDA' ? "CRISIS ACTIVA: Maratón Santiago de Chile" : "EVENTO MASIVO: Encuentro en Estadio Nacional"}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {activeEvent === 'MARATON_ALAMEDA' 
                      ? "La Alameda se encuentra cerrada a nivel de Santa Lucía y Estación Central. Los buses desvían su recorrido hacia el sur. Configure desfases de semáforos para absorber la carga."
                      : "Se registra una afluencia masiva de pasajeros. El tiempo de embarque y la congestión en Pedro de Valdivia ha aumentado."}
                  </p>
                </div>
              </div>
            )}

            {/* KPIs Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '50%', display: 'flex' }}>
                  <Timer size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tiempo Promedio de Viaje</p>
                  <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{kpis ? `${kpis.avgCommuteTimeMin} min` : '...'}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Trayecto centro-periferia</span>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-green)', borderRadius: '50%', display: 'flex' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Velocidad Comercial Promedio</p>
                  <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{kpis ? `${kpis.avgSpeed} km/h` : '...'}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flota Red Bus Metropolitana</span>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-red)', borderRadius: '50%', display: 'flex' }}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Buses Hacinados (&gt;90% Cap.)</p>
                  <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0', color: kpis?.overcrowdedBuses > 0 ? 'var(--color-red)' : 'var(--text-primary)' }}>
                    {kpis ? `${kpis.overcrowdedBuses} buses` : '...'}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Capacidad de transporte excedida</span>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'var(--color-yellow)', borderRadius: '50%', display: 'flex' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Emisiones de CO2 Est.</p>
                  <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{kpis ? `${kpis.co2EmissionsKg} kg/h` : '...'}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vehículos detenidos en ralentí</span>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-blue)', borderRadius: '50%', display: 'flex' }}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sincronización Onda Verde</p>
                  <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0', color: kpis?.greenWaveSyncPct > 80 ? 'var(--color-green)' : 'var(--color-yellow)' }}>
                    {kpis ? `${kpis.greenWaveSyncPct}%` : '...'}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Eficiencia de desfases Alameda</span>
                </div>
              </div>
            </div>

            {/* Map and Side Console Grid */}
            <div className="grid-cols-12">
              <div style={{ gridColumn: 'span 8' }}>
                <GisCanvasMap 
                  routes={routes} 
                  intersections={intersections} 
                  kpis={kpis} 
                  activeEvent={activeEvent}
                />
              </div>

              {/* Console & Teacher Event Trigger */}
              <div className="glass-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Panel Docente (Control de Escenarios)</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Inyecte perturbaciones a la grilla en tiempo real.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleTriggerCrisis('NORMAL')} 
                    className={`btn-secondary ${activeEvent === 'NORMAL' ? 'active' : ''}`}
                    style={{ justifyContent: 'center', width: '100%', borderColor: activeEvent === 'NORMAL' ? 'var(--color-cyan)' : 'var(--border-color)' }}
                  >
                    Escenario Normal (Base)
                  </button>

                  <button 
                    onClick={() => handleTriggerCrisis('MARATON_ALAMEDA')} 
                    className="btn-danger"
                    style={{ justifyContent: 'center', width: '100%' }}
                  >
                    Bloqueo Maratón Alameda
                  </button>

                  <button 
                    onClick={() => handleTriggerCrisis('PARTIDO_ESTADIO')} 
                    className="btn-primary"
                    style={{ justifyContent: 'center', width: '100%', color: '#000' }}
                  >
                    Evento Convocatoria Estadio
                  </button>
                </div>

                {/* Console Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Consola de Eventos Recientes</h4>
                  <div style={{ 
                    flex: 1, 
                    backgroundColor: '#05070a', 
                    borderRadius: '8px', 
                    padding: '0.75rem', 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem', 
                    maxHeight: '180px', 
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    color: '#a5b4fc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    {liveLogs.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        Esperando señal de telemetría...
                      </div>
                    ) : (
                      liveLogs.map(log => (
                        <div key={log.id} style={{ borderBottom: '1px solid #111827', paddingBottom: '0.2rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span> {log.msg}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Sincronización Semáforos */}
        {activeTab === 'semaphores' && (
          <TrafficLightController 
            intersections={intersections} 
            onUpdateIntersection={handleUpdateIntersection} 
          />
        )}

        {/* Tab 3: Matriz Origen-Destino */}
        {activeTab === 'od' && (
          <OdMatrixChart matrixData={odMatrix} />
        )}

      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} HUB-Arquímedes. Centro de Control Urbano y Gemelos Digitales de Alta Performance.
      </footer>
    </div>
  );
}
