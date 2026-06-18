import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Zap, 
  Activity, 
  AlertTriangle, 
  Settings, 
  Compass, 
  Cpu, 
  Sliders, 
  HelpCircle,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react';
import UnifilarDiagram from './components/UnifilarDiagram';
import PlantViewer3D from './components/PlantViewer3D';
import TrendCharts from './components/TrendCharts';

export default function App() {
  const [activeTab, setActiveTab] = useState('diagram'); // diagram, gemelo, trends
  
  // SCADA states
  const [assets, setAssets] = useState([]);
  const [breakers, setBreakers] = useState({
    "WTG-01": true, "WTG-02": true, "PV-ARRAY-01": true, "PV-ARRAY-02": true, 
    "INV-01": true, "INV-02": true, "TRAFO-01": true
  });
  const [pitchAngles, setPitchAngles] = useState({
    "WTG-01": 0, "WTG-02": 0
  });
  const [alarms, setAlarms] = useState([]);
  const [scenarios, setScenarios] = useState({
    transmissionLineFault: false,
    voltageSagActive: false
  });

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [ackModal, setAckModal] = useState(null); // id of alarm being acknowledged

  // 1. Fetch initial states
  const fetchInitialData = async () => {
    try {
      const resAssets = await fetch('/api/scada/assets');
      if (resAssets.ok) {
        const data = await resAssets.json();
        setAssets(data);
      }
      
      const resAlarms = await fetch('/api/scada/alarms');
      if (resAlarms.ok) {
        const data = await resAlarms.json();
        setAlarms(data);
      }
    } catch (err) {
      console.error("Error fetching SCADA initial states:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // 2. WebSockets Connection
    const socket = io(); // Connects via Vite proxy

    socket.on('scada-telemetry-update', (data) => {
      // { assets, alarms, scenarios, breakers, pitch }
      setAssets(data.assets);
      setAlarms(data.alarms);
      setScenarios(data.scenarios);
      setBreakers(data.breakers);
      setPitchAngles(data.pitch);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Play alarm sound if enabled and there are unacknowledged alarms
  useEffect(() => {
    if (!soundEnabled || alarms.length === 0) return;
    const hasUnack = alarms.some(a => !a.isAck);
    if (!hasUnack) return;

    const interval = setInterval(() => {
      playIndustrialBeep();
    }, 1500);

    return () => clearInterval(interval);
  }, [alarms, soundEnabled]);

  const playIndustrialBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note for SCADA alarm
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  };

  // 3. Toggle Breaker Control
  const handleToggleBreaker = async (tagId, value) => {
    try {
      const res = await fetch('/api/scada/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId, parameter: 'BREAKER', value })
      });
      if (res.ok) {
        setBreakers(prev => ({ ...prev, [tagId]: value }));
      }
    } catch (err) {
      console.error("Error toggling circuit breaker:", err);
    }
  };

  // 4. Adjust Turbine Blade Pitch Angle
  const handleAdjustPitch = async (tagId, value) => {
    try {
      const res = await fetch('/api/scada/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId, parameter: 'PITCH', value: parseFloat(value) })
      });
      if (res.ok) {
        setPitchAngles(prev => ({ ...prev, [tagId]: parseFloat(value) }));
      }
    } catch (err) {
      console.error("Error adjusting wind turbine pitch:", err);
    }
  };

  // 5. Acknowledge Alarm
  const handleAckAlarm = async (alarmId, priority) => {
    try {
      const res = await fetch(`/api/scada/alarms/${alarmId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      if (res.ok) {
        const data = await res.json();
        setAlarms(data.alarms);
        setAckModal(null);
      }
    } catch (err) {
      console.error("Error acknowledging SCADA alarm:", err);
    }
  };

  // 6. Trigger Induced Fault Scenario
  const handleToggleScenario = async (scenario, active) => {
    try {
      const res = await fetch('/api/scada/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, active })
      });
      if (res.ok) {
        const data = await res.json();
        setScenarios(prev => ({
          ...prev,
          transmissionLineFault: data.transmissionLineFault,
          voltageSagActive: data.voltageSagActive
        }));
        setAlarms(data.activeAlarms);
      }
    } catch (err) {
      console.error("Error setting scenario:", err);
    }
  };

  // Calculate grid total active power injection
  const gridAsset = assets.find(a => a.tagId === "TRAFO-01");
  const gridPowerMW = gridAsset?.telemetry["POWER"] || 0;
  const gridVoltagekV = gridAsset?.telemetry["VOLTAGE"] || 0;
  const gridCurrentkA = gridAsset?.telemetry["CURRENT"] || 0;
  const gridFreqHz = gridAsset && breakers["TRAFO-01"] 
    ? (scenarios.transmissionLineFault ? 47.8 : 50.0 + (Math.sin(Date.now() / 4000) * 0.04))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. Header HMI Console */}
      <header className="scada-header">
        <div className="scada-brand">
          <Cpu size={24} style={{ color: 'var(--hmi-cyan)' }} />
          <div>
            <h1 className="scada-title">SISTEMA SCADA HMI</h1>
            <div className="scada-subtitle">Planta Híbrida Renovables | HUB-Arquímedes</div>
          </div>
        </div>

        <nav className="scada-nav">
          <button 
            className={`scada-nav-btn ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            <Zap size={14} /> UNIFILAR 2D
          </button>
          <button 
            className={`scada-nav-btn ${activeTab === 'gemelo' ? 'active' : ''}`}
            onClick={() => setActiveTab('gemelo')}
          >
            <Compass size={14} /> GEMELO 3D
          </button>
          <button 
            className={`scada-nav-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <TrendingUp size={14} /> HISTÓRICOS Y TENDENCIAS
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {soundEnabled ? <Volume2 size={16} style={{ color: 'var(--hmi-cyan)' }} /> : <VolumeX size={16} />}
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>SONIDO</span>
          </button>

          <span className={`status-pill ${breakers["TRAFO-01"] ? 'online' : 'fault'}`}>
            <span className="status-pill-dot"></span>
            {breakers["TRAFO-01"] ? 'GRID CONECTADO' : 'GRID CAÍDO'}
          </span>
        </div>
      </header>

      {/* 2. Workspace Split (Main view & control sidebar) */}
      <div className="scada-workspace">
        
        {/* Main interactive screen (dynamic tabs) */}
        <div className="scada-main-panel">
          
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {activeTab === 'diagram' && (
              <UnifilarDiagram 
                assets={assets}
                breakers={breakers}
                onToggleBreaker={handleToggleBreaker}
              />
            )}

            {activeTab === 'gemelo' && (
              <PlantViewer3D 
                assets={assets}
                breakers={breakers}
              />
            )}

            {activeTab === 'trends' && (
              <TrendCharts />
            )}
          </div>

          {/* Bandeja de Alarmas ISA 18.2 (Always positioned at the bottom) */}
          <div className="hmi-card" style={{ height: '220px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="hmi-card-title" style={{ color: 'var(--hmi-fault)', borderBottomColor: 'rgba(255, 0, 85, 0.2)' }}>
              <AlertTriangle size={16} /> Bandeja de Alarmas Activas (Norma ISA 18.2)
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="hmi-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, background: 'var(--hmi-panel)' }}>
                    <th>Marca Temporal</th>
                    <th>Tag Equipo</th>
                    <th>Código Alarma</th>
                    <th>Descripción</th>
                    <th>Severidad</th>
                    <th>Estado / ACK</th>
                  </tr>
                </thead>
                <tbody>
                  {alarms.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '24px' }}>
                        [ NO HAY ALARMAS ACTIVAS EN EL SISTEMA ]
                      </td>
                    </tr>
                  ) : (
                    alarms.map(alarm => {
                      const isUnack = !alarm.isAck;
                      const isCleared = alarm.clearedAt !== null;
                      
                      let rowClass = 'active-ack';
                      let statusText = 'Activa Reconocida (ACK)';
                      if (isUnack && !isCleared) {
                        rowClass = 'active-unack';
                        statusText = 'Activa No Reconocida';
                      } else if (isUnack && isCleared) {
                        rowClass = 'inactive-unack';
                        statusText = 'Inactiva No Reconocida';
                      }

                      return (
                        <tr key={alarm.id} className={rowClass}>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {new Date(alarm.triggeredAt).toLocaleTimeString('es-ES')}
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{alarm.assetId}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{alarm.alarmCode}</td>
                          <td>{alarm.description}</td>
                          <td>
                            <span className={`status-pill ${alarm.severity === 'CRITICAL' ? 'fault' : 'maintenance'}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                              {alarm.severity}
                            </span>
                          </td>
                          <td>
                            {isUnack ? (
                              <button 
                                className="hmi-button danger" 
                                onClick={() => setAckModal(alarm.id)}
                                style={{ padding: '2px 8px', fontSize: '9px' }}
                              >
                                Reconocer
                              </button>
                            ) : (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                ACK ({alarm.priority})
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Panel: Instrumentation & Docent Control */}
        <aside className="scada-console-panel">
          
          {/* Dispatch Metrics */}
          <div className="hmi-card highlight">
            <div className="hmi-card-title">
              <Activity size={14} /> Telemetría del Grid Red
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="instrument-gauge">
                <span className="instrument-label">Inyección Potencia</span>
                <span className="instrument-value" style={{ color: gridPowerMW > 0 ? 'var(--hmi-cyan)' : 'var(--text-muted)' }}>
                  {gridPowerMW.toFixed(3)} <span className="instrument-unit">MW</span>
                </span>
              </div>
              <div className="instrument-gauge">
                <span className="instrument-label">Frecuencia Grid</span>
                <span className="instrument-value" style={{ color: gridFreqHz > 49.0 ? 'var(--hmi-online)' : 'var(--hmi-fault)' }}>
                  {gridFreqHz.toFixed(2)} <span className="instrument-unit">Hz</span>
                </span>
              </div>
              <div className="instrument-gauge">
                <span className="instrument-label">Tensión Conexión</span>
                <span className="instrument-value">
                  {gridVoltagekV.toFixed(1)} <span className="instrument-unit">kV</span>
                </span>
              </div>
              <div className="instrument-gauge">
                <span className="instrument-label">Corriente Inyectada</span>
                <span className="instrument-value">
                  {gridCurrentkA.toFixed(2)} <span className="instrument-unit">kA</span>
                </span>
              </div>
            </div>
          </div>

          {/* Plant control slider (Pitch adjustment) */}
          <div className="hmi-card">
            <div className="hmi-card-title">
              <Sliders size={14} /> Paso de Pala Aerogenerador (Pitch)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Modifica el pitch de los álabes para regular el coeficiente de potencia ($Cp$) y equilibrar la caída de generación.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="slider-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span>WTG-01 Pitch:</span>
                  <span style={{ color: 'var(--hmi-cyan)', fontWeight: 'bold' }}>{pitchAngles["WTG-01"]}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={pitchAngles["WTG-01"]}
                  className="cyber-slider"
                  onChange={(e) => handleAdjustPitch("WTG-01", e.target.value)}
                />
              </div>

              <div className="slider-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span>WTG-02 Pitch:</span>
                  <span style={{ color: 'var(--hmi-cyan)', fontWeight: 'bold' }}>{pitchAngles["WTG-02"]}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={pitchAngles["WTG-02"]}
                  className="cyber-slider"
                  onChange={(e) => handleAdjustPitch("WTG-02", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Induced Faults Console (Teacher Command) */}
          <div className="hmi-card">
            <div className="hmi-card-title" style={{ color: 'var(--hmi-fault)' }}>
              <Settings size={14} /> Consola de Fallas Docente
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Induce fallas o cortocircuitos eléctricos para evaluar las destrezas de diagnóstico y aislamiento del alumno.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => handleToggleScenario('LINE_FAULT', !scenarios.transmissionLineFault)} 
                className={`hmi-button danger ${scenarios.transmissionLineFault ? 'active' : ''}`}
                style={{ width: '100%', fontSize: '10px' }}
              >
                {scenarios.transmissionLineFault ? 'Eliminar Cortocircuito Red' : 'Inducir Cortocircuito Línea'}
              </button>

              <button 
                onClick={() => handleToggleScenario('VOLTAGE_SAG', !scenarios.voltageSagActive)} 
                className={`hmi-button danger ${scenarios.voltageSagActive ? 'active' : ''}`}
                style={{ width: '100%', fontSize: '10px' }}
              >
                {scenarios.voltageSagActive ? 'Estabilizar Tensión Red' : 'Inducir Sag de Tensión (30%)'}
              </button>
            </div>
          </div>

        </aside>

      </div>

      {/* 3. ISA 18.2 ALARM ACK MODAL */}
      {ackModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div className="hmi-card" style={{ width: '360px', background: 'var(--hmi-panel)' }}>
            <div className="hmi-card-title">
              Clasificar Alarma (Norma ISA)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Selecciona la prioridad y tipo de incidente para registrar el reconocimiento (ACK) formal del operador.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="hmi-button" onClick={() => handleAckAlarm(ackModal, 'Hardware')} style={{ width: '100%', textAlign: 'left' }}>
                Falla Física (Hardware)
              </button>
              <button className="hmi-button" onClick={() => handleAckAlarm(ackModal, 'Comunicación')} style={{ width: '100%', textAlign: 'left' }}>
                Falla de Enlace (Comunicación)
              </button>
              <button className="hmi-button" onClick={() => handleAckAlarm(ackModal, 'Seguridad')} style={{ width: '100%', textAlign: 'left' }}>
                Inseguridad Operativa (Seguridad)
              </button>
              <button 
                className="hmi-button" 
                onClick={() => setAckModal(null)} 
                style={{ width: '100%', borderColor: '#888', color: '#888', marginTop: '8px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
