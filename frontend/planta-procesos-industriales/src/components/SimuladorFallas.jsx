import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  ShieldAlert,
  Activity,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  BarChart2,
  Flame,
  AlertCircle,
  Layers
} from 'lucide-react';

import VisorPID from './UI/VisorPID';

export default function SimuladorFallas() {
  const [selectedFault, setSelectedFault] = useState('ninguna');
  const [openPidModal, setOpenPidModal] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  // Student inputs
  const [hypothesis, setHypothesis] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');

  const mapFaultToEquipment = (fault) => {
    switch (fault) {
      case 'cavitacion':
        return 'bomba';
      case 'desalineacion':
        return 'motor';
      case 'incrustaciones':
        return 'intercambiador';
      case 'histeresis':
        return 'valvula';
      default:
        return null;
    }
  };

  // Feedback evaluation
  const [evaluated, setEvaluated] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Define operational specs per fault
  const faultsSpecs = {
    ninguna: {
      vibration: 1.8, // mm/s (Normal < 2.8)
      temperature: 45, // °C (Normal < 65)
      pressure: 4.2, // bar (Normal 4.0 - 4.5)
      flow: 120, // m³/h (Normal 115 - 125)
      desc: 'Planta operando en condiciones nominales de estabilidad (BEP).'
    },
    cavitacion: {
      vibration: 8.4, // Alta vibración aleatoria
      temperature: 52,
      pressure: 2.1, // Caída de presión de succión
      flow: 78, // Caudal inestable y bajo
      desc: 'Señal de succión deficiente. El ojo del impulsor forma burbujas de vapor que colapsan implosionando contra la voluta.'
    },
    desalineacion: {
      vibration: 11.2, // Vibración axial severa (2x y 1x rpm)
      temperature: 79, // Calentamiento de rodamientos
      pressure: 4.1,
      flow: 118,
      desc: 'Desalineación angular y paralela entre eje del motor y la bomba. Genera fuerzas alternantes severas en acoplamiento.'
    },
    incrustaciones: {
      vibration: 2.0,
      temperature: 92, // Alta temperatura de salida del proceso (falla de enfriamiento)
      pressure: 6.2, // Mayor caída de presión (obstrucción)
      flow: 105,
      desc: 'Deposición de carbonatos y óxidos en el haz de tubos del intercambiador de calor, bloqueando el coeficiente global U.'
    },
    histeresis: {
      vibration: 2.2,
      temperature: 46,
      pressure: 5.8, // Presión fluctuante aguas arriba
      flow: 60, // Caudal trabado o desfasado
      desc: 'Fricción excesiva en la empaquetadura del vástago de la válvula. Causa histéresis y oscilaciones constantes (hunting).'
    }
  };

  // Generate scrolling real-time telemetry data
  useEffect(() => {
    // Initialize data
    const initialData = [];
    for (let i = 0; i < 20; i++) {
      initialData.push(generateTelemetryPoint(i, 'ninguna'));
    }
    setTelemetryHistory(initialData);

    const interval = setInterval(() => {
      setTelemetryHistory((prev) => {
        const nextTime = prev.length;
        const newPoint = generateTelemetryPoint(nextTime, selectedFault);
        const sliced = prev.slice(1); // Scroll left
        return [...sliced, newPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedFault]);

  const generateTelemetryPoint = (tick, fault) => {
    const spec = faultsSpecs[fault];
    // Add micro random fluctuations to simulate actual sensors
    const randVib = (Math.random() - 0.5) * 0.4;
    const randTemp = (Math.random() - 0.5) * 1.5;
    const randPress = (Math.random() - 0.5) * 0.2;
    const randFlow = (Math.random() - 0.5) * 4;

    return {
      tick: tick,
      Vibración: Math.max(0.1, Math.round((spec.vibration + randVib) * 100) / 100),
      Temperatura: Math.round((spec.temperature + randTemp) * 10) / 10,
      Presión: Math.max(0.1, Math.round((spec.pressure + randPress) * 100) / 100),
      Caudal: Math.max(0, Math.round((spec.flow + randFlow) * 10) / 10)
    };
  };

  const handleInjectFault = (fault) => {
    setSelectedFault(fault);
    setEvaluated(false);
    setHypothesis('');
    setCorrectiveAction('');
  };

  const handleSubmitDiagnosis = () => {
    if (!hypothesis || !correctiveAction) {
      alert('Por favor selecciona una hipótesis y una acción correctiva.');
      return;
    }

    let calculatedScore = 0;
    let feedback = '';

    if (selectedFault === 'ninguna') {
      if (hypothesis === 'nominal' && correctiveAction === 'monitoreo') {
        calculatedScore = 100;
        feedback =
          '✅ ¡Diagnóstico impecable! La planta se encuentra operando dentro de su Punto de Máxima Eficiencia (BEP) y la acción correcta es el monitoreo de tendencias preventivas.';
      } else {
        calculatedScore = 20;
        feedback =
          '❌ Error de inspección. Declaraste una anomalía en un equipo que está operando en parámetros nominales de diseño.';
      }
    } else if (selectedFault === 'cavitacion') {
      if (hypothesis === 'cavitacion' && correctiveAction === 'npsh') {
        calculatedScore = 100;
        feedback =
          '✅ ¡Felicidades! Identificaste correctamente la Cavitación debido a la caída de presión de succión y la acción idónea es elevar el NPSH disponible (limpieza de filtro de succión o subir nivel de estanque).';
      } else if (hypothesis === 'cavitacion') {
        calculatedScore = 50;
        feedback =
          '⚠️ Identificaste la cavitación, pero la acción correctiva propuesta no soluciona la presión de succión. Se requiere elevar el NPSH disponible.';
      } else {
        calculatedScore = 10;
        feedback =
          '❌ Diagnóstico fallido. La combinación de alta vibración y baja presión en succión es síntoma patognomónico de Cavitación Hidráulica.';
      }
    } else if (selectedFault === 'desalineacion') {
      if (hypothesis === 'desalineacion' && correctiveAction === 'alinear') {
        calculatedScore = 100;
        feedback =
          '✅ ¡Diagnóstico Correcto! La vibración axial severa y el alza térmica en los rodamientos de acople del motor apuntaban a desalineación. Resolver alineando con comparador de carátula o láser.';
      } else {
        calculatedScore = 30;
        feedback =
          '❌ Fallo en análisis. Un aumento térmico en rodamientos acoplados con espectro de vibración elevado responde a desalineación de ejes, no a fallas eléctricas.';
      }
    } else if (selectedFault === 'incrustaciones') {
      if (hypothesis === 'incrustacion' && correctiveAction === 'limpieza') {
        calculatedScore = 100;
        feedback =
          '✅ ¡Excelente! La caída térmica del intercambiador junto al aumento en la presión diferencial (presión a 6.2 bar) diagnostica incrustaciones. La solución es retrolavado o limpieza química.';
      } else {
        calculatedScore = 20;
        feedback =
          '❌ Fallo en análisis. La pérdida de transferencia térmica junto al aumento de la caída de presión indica incrustaciones en la superficie del haz de tubos.';
      }
    } else if (selectedFault === 'histeresis') {
      if (hypothesis === 'histeresis' && correctiveAction === 'empaquetadura') {
        calculatedScore = 100;
        feedback =
          '✅ ¡Impecable! La oscilación en el caudal (hunting) y presión residual del actuador indica histéresis severa por empaquetadura apretada. Requiere reajuste o cambio de empaquetadura.';
      } else {
        calculatedScore = 40;
        feedback =
          '⚠️ Parcialmente correcto. Las oscilaciones repetitivas de caudal con una señal de control inestable demuestran fricción física en el vástago (histéresis de válvula).';
      }
    }

    setScore(calculatedScore);
    setFeedbackText(feedback);
    setEvaluated(true);
  };

  const currentSpec = faultsSpecs[selectedFault];

  return (
    <div className="slide-in-right">
      <div className="grid-cols-12">
        {/* PANEL IZQUIERDO: SELECCIÓN DE FALLAS Y GAUGES */}
        <div
          className="col-span-4 glass-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <ShieldAlert size={22} className="text-accent" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inyector de Fallas Dinámicas</h3>
          </div>

          <div>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Selecciona una Falla a Simular:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'ninguna', label: 'Operación Nominal (Estable)' },
                { id: 'cavitacion', label: 'Cavitación en Bomba' },
                { id: 'desalineacion', label: 'Desalineación de Eje Acople' },
                { id: 'incrustaciones', label: 'Incrustaciones en Intercambiador' },
                { id: 'histeresis', label: 'Histéresis en Válvula Control' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleInjectFault(f.id)}
                  className={`btn ${selectedFault === f.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    justifyContent: 'flex-start',
                    fontSize: '0.82rem',
                    padding: '10px 14px'
                  }}
                >
                  {selectedFault === f.id && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        marginRight: '6px',
                        display: 'inline-block'
                      }}
                    />
                  )}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Operational Gauges Panel */}
          <div
            style={{
              marginTop: 'auto',
              padding: '16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Variables de Operación Instantánea
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>
                  VIBRACIÓN
                </span>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: currentSpec.vibration > 2.8 ? 'var(--color-danger)' : 'var(--text-main)'
                  }}
                >
                  {currentSpec.vibration} mm/s
                </span>
              </div>
              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>
                  TEMPERATURA
                </span>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: currentSpec.temperature > 75 ? 'var(--color-danger)' : 'var(--text-main)'
                  }}
                >
                  {currentSpec.temperature} °C
                </span>
              </div>
              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>
                  PRESIÓN
                </span>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: currentSpec.pressure < 3.0 ? 'var(--color-danger)' : 'var(--text-main)'
                  }}
                >
                  {currentSpec.pressure} bar
                </span>
              </div>
              <div
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>
                  CAUDAL
                </span>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: currentSpec.flow < 100 ? 'var(--color-danger)' : 'var(--text-main)'
                  }}
                >
                  {currentSpec.flow} m³/h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL CENTRAL: TELEMETRÍA GRÁFICA EN TIEMPO REAL */}
        <div
          className="col-span-8 glass-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Activity className="text-accent" />
              Tendencias Históricas y Telemetría en Tiempo Real
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setOpenPidModal(true)}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={14} className="text-accent" />
                Ver Plano P&ID
              </button>
              <span
                className="badge badge-green"
                style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}
              >
                Adquisición Activa (1 Hz)
              </span>
            </div>
          </div>

          {/* Line Chart */}
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="tick" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: 11
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="Vibración"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Temperatura"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Presión"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Caudal"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* DIAGNOSTIC FORMULATOR AND EVALUATION */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
              Consola del Analista de Confiabilidad
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  Hipótesis del Origen de Falla:
                </label>
                <select
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Seleccionar Hipótesis --</option>
                  <option value="nominal">Operación Nominal / Estable</option>
                  <option value="cavitacion">Cavitación por Bajo NPSH</option>
                  <option value="desalineacion">Desalineación Angular/Paralela de Eje</option>
                  <option value="incrustacion">Incrustación de Tubos (Intercambiador)</option>
                  <option value="histeresis">Histéresis del Obturador (Válvula de Control)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  Acción Correctiva Propuesta:
                </label>
                <select
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Seleccionar Acción Correctiva --</option>
                  <option value="monitoreo">Mantener Monitoreo y Telemetría Predictiva</option>
                  <option value="npsh">
                    Incrementar NPSH disponible (Abrir succión/Subir nivel)
                  </option>
                  <option value="alinear">Realinear equipo dinámico en caliente</option>
                  <option value="limpieza">Ejecutar retrolavado y desincrustación química</option>
                  <option value="empaquetadura">
                    Ajustar/Reemplazar empaquetadura de teflón del vástago
                  </option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <button
                onClick={handleSubmitDiagnosis}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Enviar Diagnóstico de Evaluación
              </button>

              {evaluated && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}
                  >
                    Calificación:
                  </span>
                  <span
                    className="badge"
                    style={{
                      fontSize: '1rem',
                      padding: '6px 14px',
                      backgroundColor:
                        score === 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: score === 100 ? 'var(--color-success)' : 'var(--color-danger)',
                      border: '1.5px solid'
                    }}
                  >
                    {score} / 100
                  </span>
                </div>
              )}
            </div>

            {/* Detailed feedback text */}
            {evaluated && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  color: 'var(--text-main)'
                }}
              >
                {feedbackText}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Visor P&ID */}
      {openPidModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '1100px',
              height: '80%',
              maxHeight: '650px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
          >
            <VisorPID
              selectedEquipmentId={mapFaultToEquipment(selectedFault)}
              onClose={() => setOpenPidModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
