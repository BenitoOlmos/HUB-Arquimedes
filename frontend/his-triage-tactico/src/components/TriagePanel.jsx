import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  Heart,
  RefreshCw,
  Clock
} from 'lucide-react';

// Time limit threshold for each ESI in simulated minutes
const ESI_LIMITS = {
  1: 2, // Resuscitation: 2 mins (Immediate)
  2: 10, // Emergency: 10 mins
  3: 30, // Urgent: 30 mins
  4: 60, // Semi-urgent: 60 mins
  5: 120 // Non-urgent: 120 mins
};

const TriagePanel = ({ activePatients, onAdmitPatient, onTriggerAlert, simClock }) => {
  // Search state for autocomplete DNI/RUT
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Custom manual triage form
  const [esiLevel, setEsiLevel] = useState(3);
  const [symptoms, setSymptoms] = useState('');
  const [temp, setTemp] = useState('36.8');
  const [heartRate, setHeartRate] = useState('78');
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [oxySat, setOxySat] = useState('98');

  // Trigger search on typing
  useEffect(() => {
    const fetchPatients = async () => {
      if (searchTerm.length >= 3) {
        try {
          const res = await fetch(
            `/api/his/patients?page=1&pageSize=6&search=${encodeURIComponent(searchTerm)}`
          );
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.data || []);
          }
        } catch (err) {
          console.error('Error fetching patient search results:', err);
        }
      } else {
        setSearchResults([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const selectPatientFromSearch = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.name);
    setSearchResults([]);
    // Procedural initial vitals based on patient age/comorbidities
    generateProceduralVitals(patient);
  };

  const generateProceduralVitals = (patient) => {
    // Basic clinical logic for seed vitals
    let initialTemp = 36.5 + Math.random() * 0.8;
    let initialHR = 70 + Math.random() * 20;
    let initialSys = 110 + Math.random() * 20;
    let initialDia = 70 + Math.random() * 15;
    let initialSat = 96 + Math.random() * 4;

    if (patient.comorbidities.includes('Hipertensión Arterial')) {
      initialSys += 15;
      initialDia += 10;
    }
    if (patient.comorbidities.includes('Asma Bronquial') && Math.random() > 0.4) {
      initialSat -= 4;
      initialHR += 10;
    }
    if (patient.age > 75) {
      initialHR -= 5;
    }

    setTemp(initialTemp.toFixed(1));
    setHeartRate(Math.round(initialHR).toString());
    setBpSys(Math.round(initialSys).toString());
    setBpDia(Math.round(initialDia).toString());
    setOxySat(Math.round(Math.min(initialSat, 100)).toString());

    // Auto-generate some typical symptom text
    const typicalSymptoms = [
      'Dificultad respiratoria leve y tos seca',
      'Dolor opresivo retroesternal irradiado a brazo izquierdo',
      'Cefalea intensa de inicio súbito',
      'Fiebre persistente con deshidratación y diarrea',
      'Dolor abdominal agudo en fosa ilíaca derecha',
      'Disnea progresiva y sibilancias',
      'Pérdida súbita de fuerza en hemicuerpo izquierdo',
      'Herida cortante que requiere sutura'
    ];
    setSymptoms(typicalSymptoms[Math.floor(Math.random() * typicalSymptoms.length)]);
  };

  const handleRandomPatient = async () => {
    try {
      // Get a random page of patients to select from the 10,000+ db
      const randomPage = Math.floor(Math.random() * 500) + 1;
      const res = await fetch(`/api/his/patients?page=${randomPage}&pageSize=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.data.length > 0) {
          selectPatientFromSearch(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading random patient:', err);
    }
  };

  const handleSubmitAdmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newAdmitted = {
      ...selectedPatient,
      esi: Number(esiLevel),
      symptoms: symptoms || 'Sin especificación de síntomas',
      vitals: {
        temp: parseFloat(temp),
        hr: parseInt(heartRate),
        bp: `${bpSys}/${bpDia}`,
        sat: parseInt(oxySat)
      },
      admittedAtSim: { ...simClock },
      waitElapsedSim: 0, // Minutes elapsed in queue
      timeLimitSim: ESI_LIMITS[esiLevel],
      degraded: false,
      dead: false
    };

    onAdmitPatient(newAdmitted);
    onTriggerAlert(
      `Ingreso Urgencias: Paciente ${newAdmitted.name} categorizado ESI ${newAdmitted.esi}`
    );

    // Reset Form
    setSelectedPatient(null);
    setSearchTerm('');
    setSymptoms('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem' }}>
      {/* Triage Admission Panel */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Plus size={18} color="var(--accent-cyan)" /> Admisión e Ingreso Clínico
          </div>
          <button
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            onClick={handleRandomPatient}
          >
            <RefreshCw size={12} /> Carga Rápida Ficticia
          </button>
        </div>

        <form
          onSubmit={handleSubmitAdmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          {/* Autocomplete Search */}
          <div style={{ position: 'relative' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                display: 'block',
                marginBottom: '4px'
              }}
            >
              Buscar Paciente en Base de Datos (10,000+ Fichas)
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '12px',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Escribe Nombre o RUT..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Results Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  zIndex: 200,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}
              >
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectPatientFromSearch(p)}
                    style={{
                      padding: '0.6rem 0.8rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = 'rgba(255,255,255,0.03)')
                    }
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <strong>{p.name}</strong>{' '}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        ({p.age} años, {p.gender})
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.7rem'
                      }}
                    >
                      RUT: {p.id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Patient Mini card */}
          {selectedPatient && (
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px dashed rgba(6, 182, 212, 0.3)',
                borderRadius: '6px',
                padding: '0.75rem',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}
            >
              <div>
                <strong style={{ color: 'var(--accent-cyan)' }}>Ficha Cargada:</strong>{' '}
                {selectedPatient.name}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div>Edad: {selectedPatient.age} años</div>
                <div>Gpo. Sanguíneo: {selectedPatient.bloodType}</div>
                <div>Comorbilidades: {selectedPatient.comorbidities.join(', ')}</div>
                <div>Alergias: {selectedPatient.allergies.join(', ')}</div>
              </div>
            </div>
          )}

          {/* ESI Triage selection */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Clasificación Triage ESI (Escala de Gravedad)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((level) => {
                const colors = [
                  '--esi-1-resus',
                  '--esi-2-emerg',
                  '--esi-3-urg',
                  '--esi-4-semi',
                  '--esi-5-non'
                ];
                const labels = ['ESI 1', 'ESI 2', 'ESI 3', 'ESI 4', 'ESI 5'];
                const titles = [
                  'Resucitación',
                  'Emergencia',
                  'Urgente',
                  'Semi-urgente',
                  'No urgente'
                ];
                const isSelected = esiLevel === level;

                return (
                  <button
                    key={level}
                    type="button"
                    title={titles[level - 1]}
                    onClick={() => setEsiLevel(level)}
                    style={{
                      background: isSelected
                        ? `var(${colors[level - 1]})`
                        : 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: isSelected ? 'transparent' : 'var(--border-glass)',
                      color: isSelected ? 'var(--bg-darker)' : `var(${colors[level - 1]})`,
                      padding: '0.5rem 0.2rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {labels[level - 1]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vitals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                Temp (°C)
              </label>
              <input
                type="text"
                className="form-input"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                Frec. Cardíaca (LPM)
              </label>
              <input
                type="text"
                className="form-input"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                Saturación O₂ (%)
              </label>
              <input
                type="text"
                className="form-input"
                value={oxySat}
                onChange={(e) => setOxySat(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                P.A. Sistólica (mmHg)
              </label>
              <input
                type="text"
                className="form-input"
                value={bpSys}
                onChange={(e) => setBpSys(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                P.A. Diastólica (mmHg)
              </label>
              <input
                type="text"
                className="form-input"
                value={bpDia}
                onChange={(e) => setBpDia(e.target.value)}
              />
            </div>
          </div>

          {/* Symptoms description */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                display: 'block',
                marginBottom: '4px'
              }}
            >
              Síntomas o Motivo de Consulta
            </label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="Ej. Dolor abdominal agudo, dificultad respiratoria..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
            disabled={!selectedPatient}
          >
            <UserCheck size={16} /> Admitir e Ingresar Urgencia
          </button>
        </form>
      </div>

      {/* Active Patients in waiting room */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Heart size={18} color="var(--esi-1-resus)" /> Sala de Espera Activa
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            {activePatients.length} Pacientes en Espera
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '420px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}
        >
          {activePatients.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                padding: '3rem 0',
                fontSize: '0.85rem'
              }}
            >
              No hay pacientes en la sala de espera.
            </div>
          ) : (
            activePatients.map((patient) => {
              // Calculate countdown remaining minutes
              const waitLimit = patient.timeLimitSim;
              const elapsed = patient.waitElapsedSim;
              const remaining = Math.max(0, waitLimit - elapsed);

              // Warning alerts
              const criticalAlert = remaining === 0 && !patient.dead;
              const deadPatient = patient.dead;

              return (
                <div
                  key={patient.id}
                  style={{
                    background: deadPatient
                      ? 'rgba(0,0,0,0.4)'
                      : criticalAlert
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid',
                    borderColor: deadPatient
                      ? '#ef4444'
                      : criticalAlert
                        ? 'var(--esi-1-resus)'
                        : 'var(--border-glass)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    position: 'relative',
                    transition: 'var(--transition-smooth)',
                    animation: criticalAlert ? 'pulse-red-bg 2s infinite' : 'none'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`esi-badge esi-${patient.esi}`}>ESI {patient.esi}</span>
                        <strong
                          style={{
                            fontSize: '0.85rem',
                            color: deadPatient ? 'var(--text-muted)' : 'var(--text-primary)'
                          }}
                        >
                          {patient.name}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ({patient.age} años, {patient.gender})
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          marginTop: '6px'
                        }}
                      >
                        <strong>Síntomas:</strong> {patient.symptoms}
                      </div>

                      {/* Vitals display */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.8rem',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          marginTop: '6px',
                          fontFamily: 'monospace'
                        }}
                      >
                        <span>T°: {patient.vitals.temp}°C</span>
                        <span>F.C: {patient.vitals.hr} LPM</span>
                        <span>P.A: {patient.vitals.bp}</span>
                        <span>SatO₂: {patient.vitals.sat}%</span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.4rem'
                      }}
                    >
                      {/* Timer Display */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          color: deadPatient
                            ? '#ef4444'
                            : criticalAlert
                              ? '#ef4444'
                              : 'var(--text-secondary)'
                        }}
                      >
                        <Clock size={12} />
                        {deadPatient ? (
                          <span>FALLECIDO</span>
                        ) : (
                          <span>
                            Límite: {remaining} min {criticalAlert && '(DEGRADADO)'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Espera: {patient.waitElapsedSim} min sim
                      </div>
                    </div>
                  </div>

                  {/* Warning labels */}
                  {criticalAlert && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.7rem',
                        color: 'var(--esi-1-resus)',
                        fontWeight: 'bold'
                      }}
                    >
                      <ShieldAlert size={12} />
                      ¡Peligro! Excedió tiempo de espera recomendado. Paciente en degradación
                      clínica.
                    </div>
                  )}

                  {deadPatient && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.7rem',
                        color: '#ef4444',
                        fontWeight: 'bold'
                      }}
                    >
                      <AlertTriangle size={12} />
                      Deceso clínico por falta de atención oportuna. Registrar salida.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TriagePanel;
