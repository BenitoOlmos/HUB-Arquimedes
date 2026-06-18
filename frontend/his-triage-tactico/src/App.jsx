import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldAlert,
  Award,
  FileText,
  Database,
  Radio,
  Volume2,
  VolumeX
} from 'lucide-react';
import { io } from 'socket.io-client';
import TriagePanel from './components/TriagePanel';
import BedManagementPanel from './components/BedManagementPanel';
import PharmacyPanel from './components/PharmacyPanel';
import CrisisConsole from './components/CrisisConsole';
import HistoryPanel from './components/HistoryPanel';

function App() {
  // Navigation role tabs
  const [currentRole, setCurrentRole] = useState('TRIAGE'); // TRIAGE, BEDS, PHARMACY, CONSOLE, HISTORY

  // Simulation Clock
  const [simTime, setSimTime] = useState({ hour: 8, minute: 0, day: 18, month: 6, year: 2026 });
  const [clockSpeed, setClockSpeed] = useState(1); // 0 = Pausa, 1 = Normal, 5 = Rápido, 10 = Ultra

  // Main states
  const [activePatients, setActivePatients] = useState([]); // Waiting list
  const [beds, setBeds] = useState([]); // Beds map
  const [activeCrises, setActiveCrises] = useState([]); // Array of strings: EPIDEMIC, ACCIDENT, etc.
  const [networkEvents, setNetworkEvents] = useState([
    { time: '08:00', message: 'Sistema de Información Hospitalaria (HIS) iniciado.' },
    { time: '08:00', message: 'Túnel de datos conectado. Sincronización WebSockets activa.' }
  ]);

  // Sound and alert indicators
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [alertTriggered, setAlertTriggered] = useState(false);

  // Performance metrics KPIs
  const [kpis, setKpis] = useState({
    attended: 0,
    mortality: 0,
    occupancy: 0,
    stockouts: 0,
    avgWait: 12
  });

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Helper formats
  const formatTime = (h, m) => {
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
  };

  const getActiveCrisisMultiplier = () => {
    let arrivalMult = 1.0;
    let consMult = 1.0;

    if (activeCrises.includes('EPIDEMIC')) {
      arrivalMult += 1.5;
      consMult += 2.0;
    }
    if (activeCrises.includes('ACCIDENT')) {
      arrivalMult += 2.0;
      consMult += 1.5;
    }
    if (activeCrises.includes('EARTHQUAKE')) {
      arrivalMult += 2.0;
      consMult += 1.0;
    }
    return { arrivalMult, consMult };
  };

  const { arrivalMult: arrivalMultiplier, consMult: consumptionMultiplier } =
    getActiveCrisisMultiplier();

  // Trigger audio-visual alert
  const triggerSystemAlert = (msg, alertTime = null) => {
    setAlertTriggered(true);
    setTimeout(() => setAlertTriggered(false), 3000);

    const timeStr = alertTime || formatTime(simTime.hour, simTime.minute);
    setNetworkEvents((prev) => [
      { time: timeStr, message: msg },
      ...prev.slice(0, 19) // Keep last 20 events
    ]);

    // Simple beep sound effect if enabled
    if (soundEnabledRef.current) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch warning
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  };

  // Fetch initial state
  const fetchInitialState = async () => {
    try {
      const res = await fetch('/api/his/state');
      if (res.ok) {
        const data = await res.json();
        setSimTime(data.simTime);
        setClockSpeed(data.clockSpeed);
        setActiveCrises(data.activeCrises);
        if (data.kpis) setKpis(data.kpis);
      }

      const resBeds = await fetch('/api/his/beds');
      if (resBeds.ok) {
        const bedsData = await resBeds.json();
        setBeds(bedsData);
      }

      const resTriage = await fetch('/api/his/triage');
      if (resTriage.ok) {
        const triageData = await resTriage.json();
        setActivePatients(triageData);
      }
    } catch (e) {
      console.error('Error fetching initial HIS states:', e);
    }
  };

  // Establish WebSockets Connection
  useEffect(() => {
    fetchInitialState();

    const socket = io();

    socket.on('his-telemetry-update', (data) => {
      // { beds, activeTriage, simTime, clockSpeed, activeCrises, kpis }
      setBeds(data.beds);
      setActivePatients(data.activeTriage);
      setSimTime(data.simTime);
      setClockSpeed(data.clockSpeed);
      setActiveCrises(data.activeCrises);
      if (data.kpis) {
        setKpis(data.kpis);
      }
    });

    socket.on('his-system-alert', (alertData) => {
      triggerSystemAlert(alertData.message, alertData.time);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Action callbacks calling the API
  const handleAdmitPatient = async (patientData) => {
    try {
      const response = await fetch('/api/his/triage/admit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: patientData.rut || patientData.id,
          symptoms: patientData.symptoms,
          assignedEsi: patientData.esi,
          vitals: patientData.vitals
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al admitir paciente');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTransferPatient = async (patientId, bedId) => {
    try {
      const response = await fetch('/api/his/beds/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triageId: patientId, bedId })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al trasladar paciente');
      }
    } catch (err) {
      alert(`⚠️ ERROR DE TRASLADO CLÍNICO:\n\n${err.message}`);
    }
  };

  const handleDischargePatient = async (bedId) => {
    try {
      const response = await fetch('/api/his/beds/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedId })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al dar de alta al paciente');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTriggerCrisis = async (type) => {
    try {
      const response = await fetch('/api/his/crisis/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al activar crisis');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResolveCrises = async () => {
    try {
      const response = await fetch('/api/his/crisis/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al resolver crisis');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleClockSpeedChange = async (speed) => {
    try {
      const response = await fetch('/api/his/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al cambiar velocidad');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Header bar */}
      <header
        className="glass-header"
        style={{
          boxShadow: alertTriggered
            ? '0 0 25px rgba(239, 68, 68, 0.25)'
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
          borderColor: alertTriggered ? 'var(--esi-1-resus)' : 'var(--border-glass)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="header-content">
          <div className="header-brand">
            <div className="header-logo">
              <Activity size={26} />
            </div>
            <div className="header-title-wrapper">
              <h1 className="header-title">HIS Triage Táctico</h1>
              <span className="header-subtitle">Gestión e Inmersión Hospitalaria Académica</span>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="role-tabs">
            <button
              className={`role-btn triage ${currentRole === 'TRIAGE' ? 'active' : ''}`}
              onClick={() => setCurrentRole('TRIAGE')}
            >
              Médico de Triage
            </button>
            <button
              className={`role-btn beds ${currentRole === 'BEDS' ? 'active' : ''}`}
              onClick={() => setCurrentRole('BEDS')}
            >
              Coordinador Camas
            </button>
            <button
              className={`role-btn pharmacy ${currentRole === 'PHARMACY' ? 'active' : ''}`}
              onClick={() => setCurrentRole('PHARMACY')}
            >
              Logística / Farmacia
            </button>
            <button
              className={`role-btn console ${currentRole === 'CONSOLE' ? 'active' : ''}`}
              onClick={() => setCurrentRole('CONSOLE')}
            >
              Consola Crisis
            </button>
            <button
              className={`role-btn history ${currentRole === 'HISTORY' ? 'active' : ''}`}
              onClick={() => setCurrentRole('HISTORY')}
            >
              Historial
            </button>
          </div>

          {/* Time & speed controls */}
          <div className="header-controls">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn-secondary"
              style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
              title={soundEnabled ? 'Desactivar audio' : 'Activar audio'}
            >
              {soundEnabled ? (
                <Volume2 size={16} color="var(--accent-cyan)" />
              ) : (
                <VolumeX size={16} color="var(--text-muted)" />
              )}
            </button>

            <div className="sim-controls">
              <div className="sim-time-display">
                <span>Día {simTime.day}</span>
                <span style={{ color: 'var(--accent-cyan)' }}>
                  {formatTime(simTime.hour, simTime.minute)}
                </span>
              </div>
              <select
                className="sim-speed-selector"
                value={clockSpeed}
                onChange={(e) => handleClockSpeedChange(Number(e.target.value))}
              >
                <option value="0">⏸️ PAUSA</option>
                <option value="1">⏱️ 1x VEL</option>
                <option value="5">⚡ 5x VEL</option>
                <option value="10">🚀 10x VEL</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Hospital Metrics KPIs Banner */}
      <section className="master-kpis-banner">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}
            >
              <Activity size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Pacientes Atendidos</span>
              <strong className="kpi-value">{kpis.attended}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--esi-1-resus)' }}
            >
              <Award size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Decesos en Espera</span>
              <strong
                className="kpi-value"
                style={{ color: kpis.mortality > 0 ? 'var(--esi-1-resus)' : 'inherit' }}
              >
                {kpis.mortality}
              </strong>
            </div>
          </div>

          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}
            >
              <Database size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Ocupación Hospitalaria</span>
              <strong className="kpi-value">{kpis.occupancy}%</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div
              className="kpi-icon-container"
              style={{ background: 'rgba(234, 179, 8, 0.1)', color: 'var(--esi-3-urg)' }}
            >
              <ShieldAlert size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Quiebres Farmacia (SKUs 0)</span>
              <strong
                className="kpi-value"
                style={{ color: kpis.stockouts > 0 ? 'var(--esi-3-urg)' : 'inherit' }}
              >
                {kpis.stockouts}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="main-view">
        {currentRole === 'TRIAGE' && (
          <TriagePanel
            activePatients={activePatients}
            onAdmitPatient={handleAdmitPatient}
            onTriggerAlert={triggerSystemAlert}
            simClock={simTime}
          />
        )}

        {currentRole === 'BEDS' && (
          <BedManagementPanel
            beds={beds}
            activePatients={activePatients}
            onTransferPatient={handleTransferPatient}
            onDischargePatient={handleDischargePatient}
            onTriggerAlert={triggerSystemAlert}
          />
        )}

        {currentRole === 'PHARMACY' && <PharmacyPanel onTriggerAlert={triggerSystemAlert} />}

        {currentRole === 'CONSOLE' && (
          <CrisisConsole
            activeCrises={activeCrises}
            onTriggerCrisis={handleTriggerCrisis}
            onResolveCrises={handleResolveCrises}
            onTriggerAlert={triggerSystemAlert}
            patientArrivalMultiplier={arrivalMultiplier}
            consumptionMultiplier={consumptionMultiplier}
          />
        )}

        {currentRole === 'HISTORY' && <HistoryPanel />}

        {/* Real-time Simulated Network Events Feed */}
        <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)'
            }}
          >
            <Radio size={14} color="var(--accent-cyan)" /> Feed de Red y Sincronización WebSockets
            (Tiempo Real)
          </div>
          <div className="network-feed-container">
            {networkEvents.map((evt, idx) => (
              <div key={idx} className="network-event">
                <span className="network-event-time">[{evt.time}]</span>
                <span className="network-event-msg">{evt.message}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>"El Triage no es solo clasificar, es decidir quién vive bajo el peso de la escasez."</p>
        <p style={{ marginTop: '4px' }}>
          &copy; 2026 Ecosistema Hospitalario - HIS Triage Táctico - Laboratorio de Medicina y
          Administración en Salud.
        </p>
      </footer>
    </div>
  );
}

export default App;
