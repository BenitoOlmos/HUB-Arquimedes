import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldAlert, Award, FileText, Database, Radio, Volume2, VolumeX } from 'lucide-react';
import TriagePanel from './components/TriagePanel';
import BedManagementPanel from './components/BedManagementPanel';
import PharmacyPanel from './components/PharmacyPanel';
import CrisisConsole from './components/CrisisConsole';
import HistoryPanel from './components/HistoryPanel';
import { initializeSimulationData, getPaginatedPatients, deliverVirtualStock, consumePharmacyStock, getReorderItemsList } from './utils/dataGenerator';

// Initial hospital beds layout seed
const INITIAL_BEDS = [
  // UCI (Cuidado Crítico) - 8 beds
  ...Array(8).fill(0).map((_, i) => ({ id: `UCI-10${i+1}`, status: 'Disponible', patient: null, cleaningTimeLeftSim: 0 })),
  // UTI (Tratamiento Intermedio) - 8 beds
  ...Array(8).fill(0).map((_, i) => ({ id: `UTI-20${i+1}`, status: 'Disponible', patient: null, cleaningTimeLeftSim: 0 })),
  // Medicina General - 12 beds
  ...Array(12).fill(0).map((_, i) => ({ id: `MED-3${i+1 < 10 ? '0' + (i+1) : i+1}`, status: 'Disponible', patient: null, cleaningTimeLeftSim: 0 })),
  // Pediatría - 8 beds
  ...Array(8).fill(0).map((_, i) => ({ id: `PED-40${i+1}`, status: 'Disponible', patient: null, cleaningTimeLeftSim: 0 })),
  // Aislamiento Infeccioso - 4 beds
  ...Array(4).fill(0).map((_, i) => ({ id: `AIS-50${i+1}`, status: 'Disponible', patient: null, cleaningTimeLeftSim: 0 }))
];

function App() {
  // Navigation role tabs
  const [currentRole, setCurrentRole] = useState('TRIAGE'); // TRIAGE, BEDS, PHARMACY, CONSOLE, HISTORY
  
  // Simulation Clock
  const [simTime, setSimTime] = useState({ hour: 8, minute: 0, day: 18, month: 6, year: 2026 });
  const [clockSpeed, setClockSpeed] = useState(1); // 0 = Pausa, 1 = Normal, 5 = Rápido, 10 = Ultra
  
  // Main states
  const [activePatients, setActivePatients] = useState([]); // Waiting list
  const [beds, setBeds] = useState(INITIAL_BEDS); // Beds map
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
    avgWait: 12 // Simulated initial baseline
  });

  const clockIntervalRef = useRef(null);

  // Initialize Seed database on boot
  useEffect(() => {
    initializeSimulationData();
    // Populate with 3 initial waiting room patients to avoid empty start
    const res = getPaginatedPatients(1, 3, "");
    if (res.data.length >= 3) {
      const initialWaiting = res.data.map((p, idx) => ({
        ...p,
        esi: idx === 0 ? 2 : (idx === 1 ? 3 : 4),
        symptoms: idx === 0 
          ? "Dificultad respiratoria aguda" 
          : (idx === 1 ? "Dolor abdominal difuso" : "Sospecha de fractura de tobillo"),
        vitals: { temp: 37.1, hr: 85, bp: "130/85", sat: 96 },
        admittedAtSim: { hour: 7, minute: 45 + idx, day: 18, month: 6, year: 2026 },
        waitElapsedSim: 15 - idx * 5,
        timeLimitSim: idx === 0 ? 10 : (idx === 1 ? 30 : 60),
        degraded: false,
        dead: false
      }));
      setActivePatients(initialWaiting);
    }
  }, []);

  // Simulation Clock Tick Loop
  useEffect(() => {
    if (clockSpeed === 0) {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      return;
    }

    // Tick speed: 1x = 2.5s (2500ms) per sim minute, 5x = 500ms per sim minute, 10x = 250ms
    const tickInterval = clockSpeed === 1 ? 2500 : (clockSpeed === 5 ? 500 : 250);

    clockIntervalRef.current = setInterval(() => {
      // Advance clock by 1 minute
      setSimTime(prev => {
        let nMin = prev.minute + 1;
        let nHour = prev.hour;
        if (nMin >= 60) {
          nMin = 0;
          nHour += 1;
        }
        let nDay = prev.day;
        if (nHour >= 24) {
          nHour = 0;
          nDay += 1; // Simplify months for UI
        }
        return { ...prev, minute: nMin, hour: nHour, day: nDay };
      });
    }, tickInterval);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [clockSpeed]);

  // Main state logic recalculator (runs every time the clock minute advances)
  useEffect(() => {
    if (clockSpeed === 0) return;
    
    // 1. Deliver in-transit pharmacy virtual stock
    deliverVirtualStock();

    // 2. Consume stock in pharmacy dynamically based on bed occupancy
    simulatePharmacyConsumption();

    // 3. Process active waiting patients (Wait timers & degradation)
    processWaitingRoom();

    // 4. Process beds (Clean up times & patient recovery discharge alerts)
    processHospitalBeds();

    // 5. Simulate patient auto-arrival (procedural rate)
    simulatePatientArrivals();

    // 6. Update KPIs
    updateHospitalKPIs();

    // 7. Inject random collaborative network websocket log
    simulateNetworkFeed();

  }, [simTime]);

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

  const { arrivalMult: arrivalMultiplier, consMult: consumptionMultiplier } = getActiveCrisisMultiplier();

  // Trigger audio-visual alert
  const triggerSystemAlert = (msg) => {
    setAlertTriggered(true);
    setTimeout(() => setAlertTriggered(false), 3000);
    
    setNetworkEvents(prev => [
      { time: formatTime(simTime.hour, simTime.minute), message: msg },
      ...prev.slice(0, 19) // Keep last 20 events
    ]);

    // Simple beep sound effect if enabled
    if (soundEnabled) {
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
        console.log("Audio not supported");
      }
    }
  };

  // Consume stock in pharmacy based on beds
  const simulatePharmacyConsumption = () => {
    const occupiedCount = beds.filter(b => b.status === 'Ocupada').length;
    if (occupiedCount === 0) return;

    // Standard hourly consumption (proportional to occupied beds)
    // Scale it per minute
    const baseUsage = Math.ceil(occupiedCount * 0.2 * consumptionMultiplier);

    consumePharmacyStock("Medicamentos Urgencia", baseUsage);
    consumePharmacyStock("Insumos Quirúrgicos", Math.ceil(baseUsage * 0.5));
    consumePharmacyStock("EPP", Math.ceil(baseUsage * 0.8));

    if (activeCrises.includes('EPIDEMIC')) {
      // High oxygen/gases consumption during viral outbreak
      consumePharmacyStock("Gases Medicinales", Math.ceil(baseUsage * 2.5));
    }
  };

  // Process waiting list countdowns and clinical degradation
  const processWaitingRoom = () => {
    setActivePatients(prevList => {
      const updated = prevList.map(patient => {
        if (patient.dead) return patient;

        const newElapsed = patient.waitElapsedSim + 1;
        let newEsi = patient.esi;
        let newLimit = patient.timeLimitSim;
        let newDegraded = patient.degraded;
        let newDead = patient.dead;

        // Check ESI countdown threshold
        if (newElapsed > newLimit) {
          if (patient.esi > 1) {
            // Degrade patient category
            newEsi = patient.esi - 1;
            newLimit = newElapsed + ESI_LIMITS[newEsi]; // Set new countdown offset
            newDegraded = true;
            triggerSystemAlert(`⚠️ DEGRADACIÓN CLÍNICA: Paciente ${patient.name} empeoró a ESI ${newEsi} por tiempo de espera excedido.`);
          } else if (patient.esi === 1 && newElapsed > newLimit + 5) {
            // If ESI 1 (critical) waits an extra 5 minutes, they pass away (Kode Black)
            newDead = true;
            triggerSystemAlert(`🚨 CÓDIGO NEGRO: Deceso de paciente ${patient.name} en sala de espera debido a colapso de atención.`);
            setKpis(k => ({ ...k, mortality: k.mortality + 1 }));
          }
        }

        return {
          ...patient,
          waitElapsedSim: newElapsed,
          esi: newEsi,
          timeLimitSim: newLimit,
          degraded: newDegraded,
          dead: newDead
        };
      });

      return updated;
    });
  };

  // Process hospital bed recovery/ aseo timers
  const processHospitalBeds = () => {
    setBeds(prevBeds => {
      const updated = prevBeds.map(bed => {
        if (bed.status === 'En Limpieza') {
          const newTime = bed.cleaningTimeLeftSim - 1;
          if (newTime <= 0) {
            triggerSystemAlert(`✨ Limpieza: Cama ${bed.id} se encuentra desinfectada y lista para recibir ingresos.`);
            return { ...bed, status: 'Disponible', cleaningTimeLeftSim: 0 };
          }
          return { ...bed, cleaningTimeLeftSim: newTime };
        }

        if (bed.status === 'Ocupada' && bed.patient) {
          // 0.3% chance per minute of patient recovery discharge
          if (Math.random() < 0.015) {
            triggerSystemAlert(`🩺 Alta Médica: Paciente ${bed.patient.name} en Cama ${bed.id} se encuentra clínicamente estable para el egreso.`);
          }
        }

        return bed;
      });
      return updated;
    });
  };

  // Simulate arrival of new emergency patients
  const simulatePatientArrivals = () => {
    // Standard rate: 15% chance per simulated minute
    // Under crisis multipliers, rate increases up to 60% chance
    const arrivalChance = 0.15 * arrivalMultiplier;
    
    if (Math.random() < arrivalChance) {
      const res = getPaginatedPatients(Math.floor(Math.random() * 500) + 1, 1, "");
      if (res.data.length > 0) {
        const patient = res.data[0];
        
        // Exclude if already in queue
        if (activePatients.some(ap => ap.id === patient.id)) return;

        // Generate procedural severity based on active crises
        let assignedEsi = 4;
        let symptomText = "Dolor general y malestar";

        if (activeCrises.includes('EPIDEMIC')) {
          assignedEsi = Math.random() > 0.4 ? 2 : 3;
          symptomText = "Insuficiencia respiratoria severa y disnea";
        } else if (activeCrises.includes('ACCIDENT')) {
          assignedEsi = Math.random() > 0.3 ? 1 : 2;
          symptomText = "Politraumatismo por impacto cinético grave";
        } else {
          assignedEsi = Math.floor(Math.random() * 4) + 2; // ESI 2 to 5
        }

        const newAdmitted = {
          ...patient,
          esi: assignedEsi,
          symptoms: symptomText,
          vitals: {
            temp: parseFloat((36.5 + Math.random() * 2).toFixed(1)),
            hr: Math.round(70 + Math.random() * 40),
            bp: `${Math.round(110 + Math.random() * 30)}/${Math.round(70 + Math.random() * 20)}`,
            sat: Math.round(92 + Math.random() * 8)
          },
          admittedAtSim: { ...simTime },
          waitElapsedSim: 0,
          timeLimitSim: ESI_LIMITS[assignedEsi],
          degraded: false,
          dead: false
        };

        setActivePatients(prev => [...prev, newAdmitted]);
        triggerSystemAlert(`📢 Ingreso Triage: Paciente ${newAdmitted.name} categorizado ESI ${newAdmitted.esi}`);
      }
    }
  };

  // Update KPI scores
  const updateHospitalKPIs = () => {
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Ocupada').length;
    const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

    // Calculate stockouts (SKUs <= 0)
    const outItems = getReorderItemsList().filter(s => s.stock <= 0).length;

    setKpis(prev => ({
      ...prev,
      occupancy: occupancyRate,
      stockouts: outItems
    }));
  };

  // Simulate network websocket logs from other roles
  const simulateNetworkFeed = () => {
    if (Math.random() > 0.1) return; // 10% chance per minute
    
    const logs = [
      "Médico Jefe: 'Recordar priorizar camas de aislamiento.'",
      "Central Logística: 'Despacho de medicamentos en curso.'",
      "Enfermería: 'Carga de pacientes ESI 4 alta en box de atención.'",
      "Dirección: 'UCI operando cerca del límite de ocupación.'",
      "Logística: 'Iniciando compra extraordinaria de EPP.'"
    ];

    const randomMsg = logs[Math.floor(Math.random() * logs.length)];
    setNetworkEvents(prev => [
      { time: formatTime(simTime.hour, simTime.minute), message: `[Red] ${randomMsg}` },
      ...prev.slice(0, 19)
    ]);
  };

  // Action callbacks
  const handleAdmitPatient = (patient) => {
    setActivePatients(prev => [...prev, patient]);
  };

  const handleTransferPatient = (patientId, bedId) => {
    const patient = activePatients.find(p => p.id === patientId);
    if (!patient) return;

    // Remove from triage waiting list
    setActivePatients(prev => prev.filter(p => p.id !== patientId));

    // Put in bed
    setBeds(prevBeds => {
      return prevBeds.map(b => {
        if (b.id === bedId) {
          return {
            ...b,
            status: 'Ocupada',
            patient: patient
          };
        }
        return b;
      });
    });

    setKpis(prev => ({ ...prev, attended: prev.attended + 1 }));
  };

  const handleDischargePatient = (bedId) => {
    setBeds(prevBeds => {
      return prevBeds.map(b => {
        if (b.id === bedId) {
          return {
            ...b,
            status: 'En Limpieza',
            patient: null,
            cleaningTimeLeftSim: 15 // 15 simulated minutes for desinfect
          };
        }
        return b;
      });
    });
  };

  // Crisis operations
  const handleTriggerCrisis = (type) => {
    setActiveCrises(prev => [...prev, type]);

    if (type === 'ACCIDENT') {
      // Immediately inject 8 polytrauma patients to the waiting room
      const initialTrauma = [];
      const res = getPaginatedPatients(rngPage(), 8, "");
      
      res.data.forEach((p, idx) => {
        initialTrauma.push({
          ...p,
          esi: idx < 3 ? 1 : 2, // Heavy severity
          symptoms: "Politraumatismo agudo por colisión vial de alto impacto",
          vitals: {
            temp: 36.2,
            hr: 110 + idx * 2,
            bp: "90/60",
            sat: 89 - idx
          },
          admittedAtSim: { ...simTime },
          waitElapsedSim: 0,
          timeLimitSim: ESI_LIMITS[idx < 3 ? 1 : 2],
          degraded: false,
          dead: false
        });
      });
      setActivePatients(prev => [...prev, ...initialTrauma]);
    }

    if (type === 'EQUIPMENT_FAIL') {
      // Inactivate 2 random ICU/UTI beds
      setBeds(prevBeds => {
        let disabledCount = 0;
        return prevBeds.map(b => {
          if ((b.id.startsWith('UCI') || b.id.startsWith('UTI')) && b.status === 'Disponible' && disabledCount < 2) {
            disabledCount++;
            return { ...b, status: 'Inhabilitada' };
          }
          // Displace patients if occupied
          if ((b.id.startsWith('UCI') || b.id.startsWith('UTI')) && b.status === 'Ocupada' && disabledCount < 2) {
            disabledCount++;
            if (b.patient) {
              // Push back to triage waiting list
              setActivePatients(prev => [
                {
                  ...b.patient,
                  symptoms: `${b.patient.symptoms} (Desplazado de ${b.id} por falla ventilador)`,
                  waitElapsedSim: 0
                },
                ...prev
              ]);
            }
            return { ...b, status: 'Inhabilitada', patient: null };
          }
          return b;
        });
      });
    }
  };

  const rngPage = () => Math.floor(Math.random() * 500) + 1;

  const handleResolveCrises = () => {
    setActiveCrises([]);
    // Restore inactivated beds
    setBeds(prev => prev.map(b => b.status === 'Inhabilitada' ? { ...b, status: 'Disponible' } : b));
  };

  return (
    <div className="app-container">
      
      {/* Header bar */}
      <header className="glass-header" style={{
        boxShadow: alertTriggered ? '0 0 25px rgba(239, 68, 68, 0.25)' : '0 8px 32px rgba(0, 0, 0, 0.4)',
        borderColor: alertTriggered ? 'var(--esi-1-resus)' : 'var(--border-glass)',
        transition: 'all 0.3s ease'
      }}>
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
            <button className={`role-btn triage ${currentRole === 'TRIAGE' ? 'active' : ''}`} onClick={() => setCurrentRole('TRIAGE')}>
              Médico de Triage
            </button>
            <button className={`role-btn beds ${currentRole === 'BEDS' ? 'active' : ''}`} onClick={() => setCurrentRole('BEDS')}>
              Coordinador Camas
            </button>
            <button className={`role-btn pharmacy ${currentRole === 'PHARMACY' ? 'active' : ''}`} onClick={() => setCurrentRole('PHARMACY')}>
              Logística / Farmacia
            </button>
            <button className={`role-btn console ${currentRole === 'CONSOLE' ? 'active' : ''}`} onClick={() => setCurrentRole('CONSOLE')}>
              Consola Crisis
            </button>
            <button className={`role-btn history ${currentRole === 'HISTORY' ? 'active' : ''}`} onClick={() => setCurrentRole('HISTORY')}>
              Historial
            </button>
          </div>

          {/* Time & speed controls */}
          <div className="header-controls">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="btn-secondary" 
              style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
              title={soundEnabled ? "Desactivar audio" : "Activar audio"}
            >
              {soundEnabled ? <Volume2 size={16} color="var(--accent-cyan)" /> : <VolumeX size={16} color="var(--text-muted)" />}
            </button>

            <div className="sim-controls">
              <div className="sim-time-display">
                <span>Día {simTime.day}</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{formatTime(simTime.hour, simTime.minute)}</span>
              </div>
              <select 
                className="sim-speed-selector"
                value={clockSpeed}
                onChange={e => setClockSpeed(Number(e.target.value))}
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
            <div className="kpi-icon-container" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
              <Activity size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Pacientes Atendidos</span>
              <strong className="kpi-value">{kpis.attended}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-container" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--esi-1-resus)' }}>
              <Award size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Decesos en Espera</span>
              <strong className="kpi-value" style={{ color: kpis.mortality > 0 ? 'var(--esi-1-resus)' : 'inherit' }}>{kpis.mortality}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-container" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
              <Database size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Ocupación Hospitalaria</span>
              <strong className="kpi-value">{kpis.occupancy}%</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-container" style={{ background: 'rgba(234, 179, 8, 0.1)', color: 'var(--esi-3-urg)' }}>
              <ShieldAlert size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">Quiebres Farmacia (SKUs 0)</span>
              <strong className="kpi-value" style={{ color: kpis.stockouts > 0 ? 'var(--esi-3-urg)' : 'inherit' }}>{kpis.stockouts}</strong>
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

        {currentRole === 'PHARMACY' && (
          <PharmacyPanel 
            onTriggerAlert={triggerSystemAlert}
          />
        )}

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

        {currentRole === 'HISTORY' && (
          <HistoryPanel />
        )}

        {/* Real-time Simulated Network Events Feed (WebSockets simulation) */}
        <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Radio size={14} color="var(--accent-cyan)" /> Feed de Red y Sincronización (Simulado WebSockets)
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
        <p style={{ marginTop: '4px' }}>&copy; 2026 Ecosistema Hospitalario - HIS Triage Táctico - Laboratorio de Medicina y Administración en Salud.</p>
      </footer>

    </div>
  );
}

export default App;
