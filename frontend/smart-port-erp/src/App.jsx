import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import GlobeViewer from './components/GlobeViewer';
import CustomsKanban from './components/CustomsKanban';
import CrisisConsole from './components/CrisisConsole';
import {
  Activity,
  Compass,
  ClipboardCheck,
  ShieldAlert,
  Terminal,
  Droplet,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  FileCode,
  BookOpen
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'customs', 'crisis', 'api'
  const [ships, setShips] = useState([]);
  const [manifests, setManifests] = useState([]);
  const [activeCrises, setActiveCrises] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [kpis, setKpis] = useState({
    fuelSpentTotal: 0,
    customsPenalties: 0,
    delayLosses: 0,
    logisticsCostKPI: 0
  });
  const [logs, setLogs] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      text: 'Simulador Smart Port ERP iniciado. Conectando al servicio de telemetría...'
    }
  ]);

  // Add entry to real-time events log
  const addLog = (text) => {
    setLogs((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), text },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      // 1. Ships
      const shipsRes = await fetch('/api/port/ships');
      if (shipsRes.ok) {
        const shipsData = await shipsRes.json();
        setShips(shipsData);
      }

      // 2. Manifests
      const manifestsRes = await fetch('/api/port/manifests');
      if (manifestsRes.ok) {
        const manifestsData = await manifestsRes.json();
        setManifests(manifestsData);
      }

      // 3. Consolidated State & KPIs
      const stateRes = await fetch('/api/port/current-state');
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setActiveCrises(stateData.activeCrises || []);
        setKpis({
          fuelSpentTotal: stateData.fuelSpentTotal || 0,
          customsPenalties: stateData.customsPenalties || 0,
          delayLosses: stateData.delayLosses || 0,
          logisticsCostKPI: stateData.logisticsCostKPI || 0
        });
      }
    } catch (err) {
      console.error('Error fetching initial state:', err);
      addLog('Error de conexión al cargar datos iniciales del puerto.');
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Socket.io client
    // By default, io() points to the host that served the page
    const socket = io();

    socket.on('connect', () => {
      setIsConnected(true);
      addLog('Enlace de Telemetría GPS Establecido (WebSocket: Activo).');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addLog('Advertencia: Conexión de telemetría perdida.');
    });

    // Handle real-time shipping ticks
    socket.on('ship-gps-update', (data) => {
      if (data.ships) {
        // Overlay socket coordinates onto existing ships data
        setShips((prevShips) => {
          const shipMap = new Map(data.ships.map((s) => [s.id, s]));
          return prevShips.map((ship) => {
            const update = shipMap.get(ship.id);
            if (update) {
              return {
                ...ship,
                currentLat: update.lat,
                currentLng: update.lng,
                status: update.status,
                fuelLevel: update.fuel,
                dailyFuelCost: update.dailyCost
              };
            }
            return ship;
          });
        });
      }

      if (data.activeCrises) {
        setActiveCrises(data.activeCrises);
      }

      setKpis({
        fuelSpentTotal: data.fuelSpentTotal || 0,
        customsPenalties: data.customsPenalties || 0,
        delayLosses: data.delayLosses || 0,
        logisticsCostKPI: data.logisticsCostKPI || 0
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // API actions triggered by user
  const handleRerouteShip = async (shipId, routeOption) => {
    try {
      const res = await fetch('/api/port/reroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipId, routeOption })
      });
      if (res.ok) {
        // Refresh local state
        fetchData();
      }
    } catch (err) {
      console.error(err);
      addLog(`Error al redirigir buque ${shipId}`);
    }
  };

  const handleUpdateManifestStatus = async (manifestId, status) => {
    try {
      const res = await fetch(`/api/port/manifests/${manifestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Refresh manifests & KPIs
        fetchData();
      }
    } catch (err) {
      console.error(err);
      addLog(`Error al actualizar estado de manifiesto ${manifestId}`);
    }
  };

  const handleTriggerEvent = async (eventData) => {
    try {
      const res = await fetch('/api/port/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
      addLog(`Error al inyectar crisis global`);
    }
  };

  const handleResolveAllCrises = async () => {
    try {
      const res = await fetch('/api/port/events/resolve', {
        method: 'POST'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
      addLog(`Error al resolver las crisis`);
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header className="glass-header">
        <div className="header-content">
          <div className="header-brand">
            <Compass className="header-logo" size={32} />
            <div className="header-title-wrapper">
              <span className="header-title">Smart Port ERP</span>
              <span className="header-subtitle">Simulador de Logística y Cadena de Suministro</span>
            </div>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.65rem',
                background: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                color: isConnected ? 'var(--color-approved)' : 'var(--color-held)',
                border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                padding: '2px 8px',
                borderRadius: '20px',
                fontWeight: 'bold',
                marginLeft: '0.5rem'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isConnected ? 'var(--color-approved)' : 'var(--color-held)',
                  display: 'inline-block',
                  boxShadow: isConnected ? '0 0 6px var(--color-approved)' : 'none'
                }}
              ></span>
              {isConnected ? 'STREAM ACTIVO' : 'DESCONECTADO'}
            </span>
          </div>

          {/* Role / View Tabs Navigation */}
          <nav className="role-tabs">
            <button
              className={`role-btn ${activeTab === 'tracking' ? 'active tracking' : ''}`}
              onClick={() => setActiveTab('tracking')}
            >
              <Compass size={14} />
              <span>Telemetría de Flota</span>
            </button>
            <button
              className={`role-btn ${activeTab === 'customs' ? 'active customs' : ''}`}
              onClick={() => setActiveTab('customs')}
            >
              <ClipboardCheck size={14} />
              <span>Kanban Aduana</span>
            </button>
            <button
              className={`role-btn ${activeTab === 'crisis' ? 'active crisis' : ''}`}
              onClick={() => setActiveTab('crisis')}
            >
              <ShieldAlert size={14} />
              <span>Consola Docente</span>
            </button>
            <button
              className={`role-btn ${activeTab === 'api' ? 'active api-docs' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              <Terminal size={14} />
              <span>API / Solver</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Master KPIs Banner (Function Objective KPI Scoring) */}
      <section className="master-kpis-banner">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}
            >
              <Droplet size={18} color="var(--accent-cyan)" />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Costo Combustible</span>
              <span className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>
                $
                {kpis.fuelSpentTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.2)'
              }}
            >
              <DollarSign size={18} color="var(--color-anchor)" />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Penalizaciones Aduana</span>
              <span className="kpi-value" style={{ color: 'var(--color-anchor)' }}>
                ${kpis.customsPenalties.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <Clock size={18} color="var(--color-held)" />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Costos por Demora</span>
              <span className="kpi-value" style={{ color: 'var(--color-held)' }}>
                ${kpis.delayLosses.toLocaleString()}
              </span>
            </div>
          </div>

          <div
            className="kpi-card"
            style={{
              border: '1px solid var(--accent-cyan)',
              background: 'rgba(6, 182, 212, 0.03)',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.08)'
            }}
          >
            <div className="kpi-icon-container" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
              <TrendingUp size={18} color="var(--accent-cyan)" />
            </div>
            <div className="kpi-content">
              <span
                className="kpi-title"
                style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
              >
                Costo Logístico Total
              </span>
              <span className="kpi-value" style={{ color: '#fff', fontSize: '1.25rem' }}>
                $
                {kpis.logisticsCostKPI.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Workspace Area */}
      <main className="main-view">
        {/* Dynamic Tab Views */}
        {activeTab === 'tracking' && (
          <GlobeViewer
            ships={ships}
            activeCrises={activeCrises}
            onRerouteShip={handleRerouteShip}
            onTriggerAlert={addLog}
          />
        )}

        {activeTab === 'customs' && (
          <CustomsKanban
            manifests={manifests}
            onUpdateManifestStatus={handleUpdateManifestStatus}
            onTriggerAlert={addLog}
          />
        )}

        {activeTab === 'crisis' && (
          <CrisisConsole
            activeCrises={activeCrises}
            onTriggerEvent={handleTriggerEvent}
            onResolveAll={handleResolveAllCrises}
            onTriggerAlert={addLog}
          />
        )}

        {activeTab === 'api' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* API Endpoints & Docs */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <FileCode size={18} color="var(--accent-cyan)" /> API Abierta para Modelos
                  Matemáticos
                </div>
              </div>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  lineHeight: '1.45'
                }}
              >
                <p>
                  El simulador portuario expone endpoints REST abiertos para que los estudiantes de
                  semestres avanzados o materias de Investigación de Operaciones / Ingeniería de
                  Métodos puedan programar sus propios solvers en{' '}
                  <strong>Python, R, MATLAB o Excel (Solver VBA)</strong>.
                </p>
                <p>
                  Esto les permite leer periódicamente la telemetría del puerto y automatizar
                  decisiones de ruteo y liberación documental para minimizar la función de costo
                  objetivo:
                </p>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-glass)',
                    padding: '0.8rem',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    color: 'var(--accent-cyan)'
                  }}
                >
                  Minimizar Z = (Combustible * Días) + (Multas Aduaneras) + (Pérdidas por Retraso)
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      GET /api/port/current-state
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Retorna el estado de todos los buques, sus coordenadas, y la lista de crisis
                      meteorológicas/huelgas activas.
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>POST /api/port/reroute</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Cuerpo:{' '}
                      <code>{`{ "shipId": "ship-xxxx", "routeOption": "DETOUR" | "DEFAULT" }`}</code>
                      . Permite desviar un barco por la ruta del Cabo (+35% combustible) o retornar
                      a la ruta de canal normal.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Python Solver Example Code */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <Terminal size={18} color="var(--accent-purple)" /> Plantilla del Script Solver
                  (Python)
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Copia este script para conectar tu optimizador matemático:
                </span>
                <pre
                  style={{
                    background: 'rgba(5, 7, 12, 0.95)',
                    border: '1px solid var(--border-glass)',
                    padding: '1rem',
                    borderRadius: '8px',
                    color: '#10b981',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    overflowX: 'auto',
                    lineHeight: '1.4',
                    maxHeight: '350px'
                  }}
                >
                  {`import requests
import time

API_URL = "http://localhost:20001/api/port"

def optimize_logistics():
    # 1. Obtener estado consolidado del simulador
    response = requests.get(f"{API_URL}/current-state")
    if response.status_code != 200:
        return
    
    state = response.json()
    print(f"Costo Logístico Actual: ${state['logisticsCostKPI']}")
    
    # 2. Identificar si hay canales bloqueados
    active_crises = state['activeCrises']
    suez_blocked = any("Suez" in c for c in active_crises)
    
    # 3. Tomar decisiones de desvío para evitar fondeo
    for ship in state['ships']:
        # Si Suez está bloqueado y el barco va por esa ruta
        if suez_blocked and ship['imo'].endswith(('1', '6')): 
            if ship['status'] != 'FONDEADO':
                print(f"Desviando buque {ship['name']} por Cabo de Buena Esperanza...")
                requests.post(f"{API_URL}/reroute", json={
                    "shipId": ship['id'],
                    "routeOption": "DETOUR"
                })

if __name__ == "__main__":
    while True:
        optimize_logistics()
        time.sleep(5)  # Re-evaluar decisiones cada 5 segundos`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 4. Real-time Micro Log Feed (Console footer of active view) */}
        <div className="glass-panel" style={{ padding: '1rem', marginTop: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <Terminal size={14} color="var(--accent-cyan)" /> Registro de Operaciones del Terminal
              (Live Feed)
            </span>
            {activeCrises.length > 0 && (
              <span
                style={{
                  color: 'var(--color-held)',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 'bold'
                }}
              >
                <AlertCircle size={12} /> {activeCrises.length} Crisis Activa(s)
              </span>
            )}
          </div>
          <div className="event-log-container">
            {logs.map((log) => (
              <div key={log.id} className="event-log-entry">
                <span className="event-log-time">[{log.time}]</span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <footer className="app-footer">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            maxW: '1600px',
            margin: '0 auto',
            opacity: 0.6
          }}
        >
          <span>
            © {new Date().getFullYear()} HUB-Arquímedes - Licenciado para Entornos Universitarios
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <BookOpen size={12} /> Laboratorio de Comercio Internacional y Operaciones Industriales
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
