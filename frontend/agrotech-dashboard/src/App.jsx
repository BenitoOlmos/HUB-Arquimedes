import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import FarmGlobe from './components/FarmGlobe';
import RulesManager from './components/RulesManager';
import PestPredictor from './components/PestPredictor';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  CartesianGrid
} from 'recharts';
import {
  Sprout,
  Activity,
  ToggleLeft,
  Brain,
  Flame,
  Droplet,
  Heart,
  Terminal,
  Sun,
  XCircle,
  HelpCircle,
  TrendingUp,
  FileCode,
  BookOpen
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry', 'rules', 'pests', 'teacher'
  const [zones, setZones] = useState([]);
  const [rules, setRules] = useState([]);
  const [pestHistory, setPestHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [kpis, setKpis] = useState({
    waterConsumed: 0,
    cropHealth: 100,
    activeEvent: 'NORMAL',
    activeEventSeverity: 0
  });
  const [logs, setLogs] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      text: 'Simulador AgroTech IoT iniciado. Conectando al servicio de telemetría...'
    }
  ]);

  const generateMoistureHistory = () => {
    const data = [];
    const baseTime = new Date();
    for (let i = 10; i >= 0; i--) {
      const timeLabel = new Date(baseTime.getTime() - i * 60 * 60 * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      data.push({
        time: timeLabel,
        'Cuadrante Norte': Math.round(35 + Math.sin(i * 0.5) * 15 + Math.random() * 5),
        'Cuadrante Sur': Math.round(42 + Math.cos(i * 0.5) * 10 + Math.random() * 4),
        'Cuadrante Este': Math.round(28 + Math.sin(i * 0.8) * 8 + Math.random() * 6),
        'Cuadrante Oeste': Math.round(48 - Math.sin(i * 0.3) * 12 + Math.random() * 5)
      });
    }
    return data;
  };

  const addLog = (text) => {
    setLogs((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), text },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  const fetchData = async () => {
    try {
      // 1. Zones & current values
      const zonesRes = await fetch('/api/agrotech/zones');
      if (zonesRes.ok) {
        const zonesData = await zonesRes.json();
        setZones(zonesData);
      }

      // 2. Rules
      const rulesRes = await fetch('/api/agrotech/rules');
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData);
      }

      // 3. Pest outbreaks
      const pestsRes = await fetch('/api/agrotech/pests/history');
      if (pestsRes.ok) {
        const pestsData = await pestsRes.json();
        setPestHistory(pestsData);
      }

      // 4. KPIs
      const kpiRes = await fetch('/api/agrotech/kpis');
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData);
      }
    } catch (err) {
      console.error(err);
      addLog('Error de conexión al cargar datos iniciales del predio agrícola.');
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 400);

    // Establish WebSocket stream
    const socket = io();

    socket.on('connect', () => {
      setIsConnected(true);
      addLog('Enlace de Telemetría IoT Establecido (WebSocket: Activo).');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addLog('Advertencia: Conexión con los sensores IoT perdida.');
    });

    socket.on('agrotech-telemetry-update', (data) => {
      if (data.zones) {
        setZones(data.zones);
      }
      if (data.kpis) {
        setKpis(data.kpis);
      }
    });

    return () => {
      socket.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleToggleValve = async (valveId, status) => {
    try {
      const res = await fetch('/api/agrotech/valves/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valveId, status })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
      addLog(`Error al conmutar electroválvula ${valveId}`);
    }
  };

  const handleCreateRule = async (ruleData) => {
    try {
      const res = await fetch('/api/agrotech/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
      addLog('Error al crear regla de automatización');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      const res = await fetch(`/api/agrotech/rules/${ruleId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
      addLog('Error al eliminar regla de automatización');
    }
  };

  const handleTriggerEvent = async (eventType, severity) => {
    try {
      const res = await fetch('/api/agrotech/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, severity })
      });
      if (res.ok) {
        fetchData();
        if (eventType === 'NORMAL') {
          addLog(
            'Docente: Todas las crisis climáticas resueltas. Volviendo a condiciones normales.'
          );
        } else {
          addLog(`Docente: Crisis inyectada -> ${eventType} (Severidad: ${severity}/5).`);
        }
      }
    } catch (err) {
      console.error(err);
      addLog('Error al comunicar evento docente al servidor.');
    }
  };

  const handleResetSimulation = async () => {
    try {
      const res = await fetch('/api/agrotech/reset', {
        method: 'POST'
      });
      if (res.ok) {
        fetchData();
        addLog('Docente: Simulación y consumos hídricos restablecidos a cero.');
      }
    } catch (err) {
      console.error(err);
      addLog('Error al reiniciar la simulación.');
    }
  };

  const getEventName = (type) => {
    if (type === 'OLA_DE_CALOR') return 'OLA DE CALOR ACTIVA';
    if (type === 'SEQUIA') return 'SEQUÍA PROLONGADA ACTIVA';
    return 'NORMAL';
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header className="glass-header">
        <div className="header-content">
          <div className="header-brand">
            <Sprout className="header-logo" size={32} />
            <div className="header-title-wrapper">
              <span className="header-title">AgroTech Dashboard</span>
              <span className="header-subtitle">Monitoreo y Control Agrícola de Precisión</span>
            </div>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.65rem',
                background: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                color: isConnected ? 'var(--accent-emerald)' : 'var(--color-valve-closed)',
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
                  background: isConnected ? 'var(--accent-emerald)' : 'var(--color-valve-closed)',
                  display: 'inline-block',
                  boxShadow: isConnected ? '0 0 6px var(--accent-emerald)' : 'none'
                }}
              ></span>
              {isConnected ? 'TELEMETRÍA ONLINE' : 'DESCONECTADO'}
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="role-tabs">
            <button
              className={`role-btn ${activeTab === 'telemetry' ? 'active telemetry' : ''}`}
              onClick={() => setActiveTab('telemetry')}
            >
              <Activity size={14} />
              <span>Mapa de Suelo</span>
            </button>
            <button
              className={`role-btn ${activeTab === 'rules' ? 'active rules' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <ToggleLeft size={14} />
              <span>Riego Automático</span>
            </button>
            <button
              className={`role-btn ${activeTab === 'pests' ? 'active pests' : ''}`}
              onClick={() => setActiveTab('pests')}
            >
              <Brain size={14} />
              <span>Predicción Plagas</span>
            </button>
            <button
              className={`role-btn ${activeTab === 'teacher' ? 'active teacher' : ''}`}
              onClick={() => setActiveTab('teacher')}
            >
              <Flame size={14} />
              <span>Control Docente</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. KPIs Top Bar */}
      <section className="master-kpis-banner">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{
                background: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.2)'
              }}
            >
              <Droplet size={18} color="var(--color-moisture)" />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Huella de Agua</span>
              <span className="kpi-value" style={{ color: 'var(--color-moisture)' }}>
                {Math.round(kpis.waterConsumed).toLocaleString()} Litros
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <Heart size={18} color="var(--color-valve-open)" />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Salud de Planta</span>
              <span className="kpi-value" style={{ color: 'var(--color-valve-open)' }}>
                {kpis.cropHealth}%
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{
                background: 'rgba(249, 115, 22, 0.08)',
                border: '1px solid rgba(249, 115, 22, 0.2)'
              }}
            >
              <Sun size={18} color="var(--color-radiation)" />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Radiación Solar</span>
              <span className="kpi-value" style={{ color: 'var(--color-radiation)' }}>
                {zones[0]?.sensors?.find((s) => s.type === 'RADIATION')?.currentValue.toFixed(0) ||
                  0}{' '}
                W/m²
              </span>
            </div>
          </div>

          <div
            className="kpi-card"
            style={{
              border:
                kpis.activeEvent !== 'NORMAL'
                  ? '1px solid var(--color-valve-closed)'
                  : '1px solid var(--border-glass)',
              background:
                kpis.activeEvent !== 'NORMAL'
                  ? 'rgba(239, 68, 68, 0.05)'
                  : 'rgba(255, 255, 255, 0.01)'
            }}
          >
            <div
              className="kpi-icon-container"
              style={{
                background:
                  kpis.activeEvent !== 'NORMAL'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <Flame
                size={18}
                color={
                  kpis.activeEvent !== 'NORMAL' ? 'var(--color-valve-closed)' : 'var(--text-muted)'
                }
              />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Clima del Predio</span>
              <span
                className="kpi-value"
                style={{
                  color: kpis.activeEvent !== 'NORMAL' ? 'var(--color-valve-closed)' : '#fff',
                  fontSize: '1rem'
                }}
              >
                {getEventName(kpis.activeEvent)}{' '}
                {kpis.activeEventSeverity > 0 && `(SEV: ${kpis.activeEventSeverity}/5)`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main view panel */}
      <main className="main-view">
        {activeTab === 'telemetry' && (
          <FarmGlobe
            zones={zones}
            onToggleValve={handleToggleValve}
            onTriggerAlert={addLog}
            isLoading={initialLoading}
          />
        )}

        {activeTab === 'rules' && (
          <RulesManager
            zones={zones}
            rules={rules}
            kpis={kpis}
            onCreateRule={handleCreateRule}
            onDeleteRule={handleDeleteRule}
            onTriggerAlert={addLog}
            isLoading={initialLoading}
          />
        )}

        {activeTab === 'pests' && (
          <PestPredictor
            zones={zones}
            pestHistory={pestHistory}
            onTriggerAlert={addLog}
            isLoading={initialLoading}
          />
        )}

        {activeTab === 'teacher' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Instructor Actions panel */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <Flame size={18} color="var(--color-radiation)" /> Consola Docente - Inyector de
                  Anomalías
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  fontSize: '0.82rem'
                }}
              >
                <p style={{ color: 'var(--text-secondary)' }}>
                  Provoca alteraciones climatológicas severas en tiempo real. Los estudiantes de
                  Agronomía e Ingeniería deberán reconfigurar las automatizaciones de riego para
                  compensar la tasa acelerada de evaporación del suelo.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    marginTop: '0.5rem'
                  }}
                >
                  <button
                    className="btn-danger"
                    style={{ background: 'var(--color-radiation)', justifyContent: 'center' }}
                    onClick={() => handleTriggerEvent('OLA_DE_CALOR', 4)}
                  >
                    Ola de Calor (+10°C, Evaporación 2.5x)
                  </button>
                  <button
                    className="btn-danger"
                    style={{ justifyContent: 'center' }}
                    onClick={() => handleTriggerEvent('SEQUIA', 5)}
                  >
                    Sequía Extrema (Evaporación 3.0x)
                  </button>
                </div>

                <button
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--accent-emerald)',
                    marginTop: '0.5rem'
                  }}
                  onClick={() => handleTriggerEvent('NORMAL', 0)}
                >
                  Restablecer Clima Normal (Despejar Crisis)
                </button>

                <div
                  style={{
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '1rem',
                    marginTop: '1rem'
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Resetear Entorno Completo:
                  </span>
                  <button
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      borderColor: 'var(--color-valve-closed)',
                      color: 'var(--color-valve-closed)'
                    }}
                    onClick={handleResetSimulation}
                  >
                    Restablecer Consumos y Riegos a Cero
                  </button>
                </div>
              </div>
            </div>

            {/* Pedagogical info card */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <HelpCircle size={18} color="var(--accent-emerald)" /> Guía de Evaluación
                  Pedagógica
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  lineHeight: '1.45'
                }}
              >
                <strong>Variables de Evaluación para los Estudiantes:</strong>
                <ul>
                  <li>
                    • **Eficiencia Hídrica**: Mantener la huella hídrica total en valores bajos
                    (óptimo &lt; 2000L).
                  </li>
                  <li>
                    • **Salud de Planta**: Evitar que el índice de salud disminuya por debajo del
                    90% (evitando marchitez).
                  </li>
                  <li>
                    • **Prevención**: Calibrar las ventanas del predictor fitosanitario en la
                    pestaña "Predicción Plagas" para detectar Botrytis con anticipación de acuerdo
                    con los históricos del predio.
                  </li>
                </ul>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '0.65rem',
                    marginTop: '0.5rem'
                  }}
                >
                  <strong style={{ color: '#fff' }}>Ecuación de Evaluación:</strong>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      color: 'var(--accent-emerald)',
                      marginTop: '4px'
                    }}
                  >
                    Score = (Salud Planta * 10) - (Agua Utilizada / 20) - Penalización de Plagas
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 3.5 Collapsible Soil Moisture History Chart */}
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div
            onClick={() => {
              if (!isHistoryOpen) {
                setHistoryData(generateMoistureHistory());
              }
              setIsHistoryOpen(!isHistoryOpen);
            }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="#4E7D6B" />
              <span>Histórico de Datos y Reporte de Humedad del Suelo</span>
            </div>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}
            >
              {isHistoryOpen ? '▲ Ocultar Gráfico' : '▼ Mostrar Gráfico'}
            </button>
          </div>

          {isHistoryOpen && (
            <div
              style={{
                marginTop: '1rem',
                height: '220px',
                width: '100%'
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNorte" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                  <ChartTooltip
                    contentStyle={{
                      background: '#ffffff',
                      borderColor: 'var(--border-glass)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                  <ChartLegend wrapperStyle={{ fontSize: 10 }} />
                  <Area
                    name="Cuadrante Norte"
                    type="monotone"
                    dataKey="Cuadrante Norte"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorNorte)"
                    isAnimationActive={true}
                    animationDuration={500}
                  />
                  <Area
                    name="Cuadrante Sur"
                    type="monotone"
                    dataKey="Cuadrante Sur"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorSur)"
                    isAnimationActive={true}
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. Telemetry Events Log */}
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
              <Terminal size={14} color="var(--accent-emerald)" /> Consola de Sucesos y Eventos IoT
              (Live Feed)
            </span>
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
            <BookOpen size={12} /> Laboratorio de AgroTech y Agricultura de Precisión
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
