import React, { useState } from 'react';
import {
  Settings,
  Wrench,
  Thermometer,
  Compass,
  Maximize2,
  Layers,
  CheckCircle2,
  ChevronRight,
  Play,
  AlertCircle,
  FileText
} from 'lucide-react';
import VisorPID from './UI/VisorPID';

export default function SimuladorMantenimiento({ selectedSemester }) {
  const [activeTask, setActiveTask] = useState('alineacion'); // alineacion, lubricacion, preventiva
  const [activeTool, setActiveTool] = useState('calibrador'); // calibrador, multimetro, termometro, planos
  const [step, setStep] = useState(0);

  // Align parameters
  const [radialMisalign, setRadialMisalign] = useState(0.85); // mm
  const [angularMisalign, setAngularMisalign] = useState(0.42); // mm/100mm
  const [alignSuccess, setAlignSuccess] = useState(false);

  // Caliper parameters
  const [caliperPos, setCaliperPos] = useState(25.4); // mm

  // Multimeter parameters
  const [probePoint, setProbePoint] = useState('Phase-1'); // Phase-1, Phase-2, Ground

  // Exchanger Blueprint layers
  const [blueprintLayer, setBlueprintLayer] = useState('Todos'); // Todos, Mecánico, Instrumentación

  // Lubrication formula calculate
  const [bearingDiameter, setBearingDiameter] = useState(80); // mm
  const [bearingWidth, setBearingWidth] = useState(30); // mm
  const [greaseInput, setGreaseInput] = useState('');
  const [greaseFeedback, setGreaseFeedback] = useState('');

  const getEquipmentForActiveTask = () => {
    if (activeTask === 'alineacion') {
      return 'motor';
    } else if (activeTask === 'lubricacion') {
      return 'bomba';
    } else if (activeTask === 'preventiva') {
      if (step === 2) return 'bomba';
      return 'motor';
    }
    return null;
  };

  const calculateCorrectGrease = () => {
    // Formula: G = D * B * 0.005 (grams)
    return Math.round(bearingDiameter * bearingWidth * 0.005 * 10) / 10;
  };

  const handleVerifyGrease = () => {
    const correct = calculateCorrectGrease();
    const studentValue = parseFloat(greaseInput);
    if (isNaN(studentValue)) {
      setGreaseFeedback('Por favor, ingresa una cantidad numérica válida.');
      return;
    }
    if (Math.abs(studentValue - correct) <= 1) {
      setGreaseFeedback(
        `✅ ¡Cálculo correcto! Cantidad óptima de lubricante: ${correct}g. Relubricación autorizada.`
      );
    } else {
      setGreaseFeedback(
        `❌ Cantidad incorrecta. Tu cálculo: ${studentValue}g. Valor correcto calculado por fórmula SKF/FAG: ${correct}g (D * B * 0.005). Ajusta la dosificación.`
      );
    }
  };

  const handleAdjustAlignment = (type, val) => {
    const parsedVal = parseFloat(val);
    const radialVal = type === 'radial' ? parsedVal : parseFloat(radialMisalign);
    const angularVal = type === 'angular' ? parsedVal : parseFloat(angularMisalign);

    if (type === 'radial') {
      setRadialMisalign(parsedVal);
    } else {
      setAngularMisalign(parsedVal);
    }

    if (radialVal <= 0.05 && angularVal <= 0.03) {
      setAlignSuccess(true);
    } else {
      setAlignSuccess(false);
    }
  };

  return (
    <div className="slide-in-left">
      <div className="grid-cols-12">
        {/* PANEL IZQUIERDO: TAREAS DE MANTENIMIENTO */}
        <div className="col-span-7 glass-card">
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <Wrench size={22} className="text-accent" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Entorno de Prácticas: Procedimientos de Mantenimiento
            </h3>
          </div>

          {/* Task Selectors */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => {
                setActiveTask('alineacion');
                setStep(0);
              }}
              className={`btn ${activeTask === 'alineacion' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '10px 8px', fontSize: '0.82rem' }}
            >
              Alineación de Ejes
            </button>
            <button
              onClick={() => {
                setActiveTask('lubricacion');
                setStep(0);
                setGreaseFeedback('');
              }}
              className={`btn ${activeTask === 'lubricacion' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '10px 8px', fontSize: '0.82rem' }}
            >
              Lubricación y Dosificación
            </button>
            <button
              onClick={() => {
                setActiveTask('preventiva');
                setStep(0);
              }}
              className={`btn ${activeTask === 'preventiva' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '10px 8px', fontSize: '0.82rem' }}
            >
              Inspección Preventiva
            </button>
          </div>

          {/* CASO 1: ALINEACIÓN DE EJES */}
          {activeTask === 'alineacion' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <span className="badge badge-yellow">Mantenimiento Avanzado</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Módulo: Confiabilidad Mecánica
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Ajusta las bases del Motor Eléctrico (MOT-101) utilizando los pernos de nivelación y
                lainas calibradas para alinearlo con la Bomba Centrífuga (PMP-101). Logra
                desalineaciones por debajo de la norma ISO tolerada (Radial &lt; 0.05 mm, Angular
                &lt; 0.03 mm).
              </p>

              {/* Misalignment Controls Slider */}
              <div
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    <span>Desalineación Radial (Paralela)</span>
                    <span
                      style={{
                        color:
                          radialMisalign <= 0.05 ? 'var(--color-success)' : 'var(--color-danger)'
                      }}
                    >
                      {radialMisalign} mm{' '}
                      {radialMisalign <= 0.05 ? '(Tolerado)' : '(Fuera de Rango)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.01"
                    value={radialMisalign}
                    onChange={(e) => handleAdjustAlignment('radial', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    <span>Desalineación Angular</span>
                    <span
                      style={{
                        color:
                          angularMisalign <= 0.03 ? 'var(--color-success)' : 'var(--color-danger)'
                      }}
                    >
                      {angularMisalign} mm/100mm{' '}
                      {angularMisalign <= 0.03 ? '(Tolerado)' : '(Fuera de Rango)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.01"
                    value={angularMisalign}
                    onChange={(e) => handleAdjustAlignment('angular', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                  />
                </div>
              </div>

              {/* Graphic Visual feedback coupling alignment */}
              <div
                style={{
                  height: '100px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '40px',
                    backgroundColor: '#94a3b8',
                    borderRadius: '4px 0 0 4px',
                    marginRight: '2px'
                  }}
                />
                {/* Conducted Shaft coupling (shows gap depending on misalignment values) */}
                <div
                  style={{
                    width: '80px',
                    height: '40px',
                    backgroundColor: '#cbd5e1',
                    borderRadius: '0 4px 4px 0',
                    transform: `translateY(${radialMisalign * 15}px) rotate(${angularMisalign * 15}deg)`,
                    borderLeft: '4px solid var(--accent-color)',
                    transition: 'transform 0.1s ease'
                  }}
                />

                {alignSuccess ? (
                  <div
                    style={{ position: 'absolute', top: 8, right: 8 }}
                    className="badge badge-green"
                  >
                    Ejes Alineados
                  </div>
                ) : (
                  <div
                    style={{ position: 'absolute', top: 8, right: 8 }}
                    className="badge badge-red"
                  >
                    Desalineación Activa
                  </div>
                )}
              </div>

              {alignSuccess && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--color-success)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    ¡Excelente! Las tolerancias radiales y angulares están dentro de la norma ISO
                    10816. Equipo listo para pruebas.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CASO 2: LUBRICACIÓN Y DOSIFICACIÓN */}
          {activeTask === 'lubricacion' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <span className="badge badge-blue">Mantenimiento Base</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Módulo: Tribología Básica
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Utiliza la fórmula estandarizada de relubricación de rodamientos de bolas para
                calcular la cantidad en gramos de grasa requerida para los rodamientos de la Bomba
                Centrífuga (PMP-101):
                <br />
                <code
                  style={{
                    fontSize: '0.8rem',
                    display: 'block',
                    margin: '8px 0',
                    textAlign: 'center'
                  }}
                >
                  Grasa (gramos) = Diámetro Externo (D) * Ancho Rodamiento (B) * 0.005
                </code>
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
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
                    Diámetro Externo del Rodamiento (D) (mm)
                  </label>
                  <input
                    type="number"
                    value={bearingDiameter}
                    onChange={(e) => setBearingDiameter(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
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
                    Ancho del Rodamiento (B) (mm)
                  </label>
                  <input
                    type="number"
                    value={bearingWidth}
                    onChange={(e) => setBearingWidth(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end',
                  marginBottom: '20px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'block',
                      marginBottom: '4px'
                    }}
                  >
                    Resultado del Cálculo (gramos de grasa)
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa la cantidad calculada"
                    value={greaseInput}
                    onChange={(e) => setGreaseInput(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button
                  onClick={handleVerifyGrease}
                  className="btn btn-primary"
                  style={{ padding: '10px 16px' }}
                >
                  Verificar Cantidad
                </button>
              </div>

              {greaseFeedback && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: greaseFeedback.includes('incorrecta')
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid',
                    borderColor: greaseFeedback.includes('incorrecta')
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                    color: greaseFeedback.includes('incorrecta')
                      ? 'var(--color-danger)'
                      : 'var(--color-success)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    lineHeight: '1.45'
                  }}
                >
                  {greaseFeedback}
                </div>
              )}
            </div>
          )}

          {/* CASO 3: INSPECCIÓN PREVENTIVA */}
          {activeTask === 'preventiva' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <span className="badge badge-green">Inspección Operacional</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Módulo: Rutinas Preventivas
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Sigue la lista de verificación para realizar la rutina de inspección al Motor
                Eléctrico (MOT-101) y la Bomba Centrífuga (PMP-101). Presiona completar paso tras
                realizar la verificación de torque o física.
              </p>

              {/* Checklist steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    title: 'Verificar Torque de Pernos de Anclaje',
                    desc: 'Usa la llave de torque para validar los 45 Nm reglamentados.',
                    done: step > 0
                  },
                  {
                    title: 'Medición de Holgura Acoplamiento Elastómero',
                    desc: 'Comprueba el espacio libre del elastómero usando lainas de espesor.',
                    done: step > 1
                  },
                  {
                    title: 'Verificar Ajuste de Prensaestopas / Sello Mecánico',
                    desc: 'Inspecciona visualmente goteos excesivos de agua de refrigeración.',
                    done: step > 2
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: item.done ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-primary)',
                      border: '1px solid',
                      borderColor: item.done ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h5
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: item.done ? 'var(--color-success)' : 'var(--text-main)'
                        }}
                      >
                        {item.title}
                      </h5>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                    {item.done ? (
                      <span className="badge badge-green">Completado</span>
                    ) : idx === step ? (
                      <button
                        onClick={() => setStep(step + 1)}
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                      >
                        Verificar
                      </button>
                    ) : (
                      <span
                        style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}
                      >
                        Pendiente
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {step === 3 && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--color-success)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    ¡Felicidades! Rutina preventiva finalizada. Datos guardados en el reporte de
                    evaluación del semestre.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: HERRAMIENTAS E INSTRUMENTACIÓN VIRTUAL */}
        <div className="col-span-5 glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <Compass size={22} className="text-accent" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Instrumentos de Medición Virtual
            </h3>
          </div>

          {/* Tool Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {['calibrador', 'multimetro', 'termometro', 'planos'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTool(t)}
                className={`btn ${activeTool === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.72rem', flex: '1 1 auto' }}
              >
                {t === 'calibrador' && 'Vernier'}
                {t === 'multimetro' && 'Multímetro'}
                {t === 'termometro' && 'Láser IR'}
                {t === 'planos' && 'Planos P&ID'}
              </button>
            ))}
          </div>

          {activeTool === 'planos' ? (
            <div style={{ height: '460px', width: '100%' }}>
              <VisorPID selectedEquipmentId={getEquipmentForActiveTask()} />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '260px'
              }}
            >
              {/* VIRTUAL TOOL 1: CALIBRADOR VERNIER */}
              {activeTool === 'calibrador' && (
                <div style={{ textAlign: 'center' }}>
                  <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
                    Calibrador Vernier
                  </span>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginBottom: '16px'
                    }}
                  >
                    Desplaza el nonio para medir el diámetro del eje o chavetero (exactitud
                    ±0.02mm).
                  </p>

                  {/* Caliper Measurement Readout */}
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-accent)',
                      marginBottom: '20px'
                    }}
                  >
                    {caliperPos.toFixed(2)} mm
                  </div>

                  <input
                    type="range"
                    min="0.0"
                    max="150.0"
                    step="0.02"
                    value={caliperPos}
                    onChange={(e) => setCaliperPos(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                  />

                  {/* Caliper graphic rendering with SVG */}
                  <svg
                    viewBox="0 0 250 50"
                    width="100%"
                    height="auto"
                    style={{ marginTop: '20px' }}
                  >
                    {/* Fixed body */}
                    <rect x="10" y="20" width="230" height="12" fill="#94a3b8" />
                    <rect x="10" y="10" width="8" height="22" fill="#94a3b8" />
                    {/* Sliding jaws (moves based on caliperPos) */}
                    <g transform={`translate(${caliperPos * 1.2}, 0)`}>
                      <rect x="25" y="16" width="16" height="20" fill="#cbd5e1" stroke="#94a3b8" />
                      <rect x="25" y="8" width="6" height="12" fill="#94a3b8" />
                    </g>
                  </svg>
                </div>
              )}

              {/* VIRTUAL TOOL 2: MULTÍMETRO */}
              {activeTool === 'multimetro' && (
                <div style={{ textAlign: 'center' }}>
                  <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
                    Multímetro Fluke
                  </span>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginBottom: '16px'
                    }}
                  >
                    Posiciona las puntas de prueba en la bornera trifásica del Motor Eléctrico
                    (MOT-101) para comprobar el voltaje.
                  </p>

                  {/* Multimeter Display screen */}
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#10b981',
                      fontFamily: 'var(--font-mono)',
                      padding: '16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      marginBottom: '20px',
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    {probePoint === 'Phase-1' && '380.2 VAC'}
                    {probePoint === 'Phase-2' && '379.8 VAC'}
                    {probePoint === 'Ground' && '0.1 VAC'}
                    <div
                      style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}
                    >
                      TRMS AUTO - 50.0 Hz
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {['Phase-1', 'Phase-2', 'Ground'].map((point) => (
                      <button
                        key={point}
                        onClick={() => setProbePoint(point)}
                        className={`btn ${probePoint === point ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                      >
                        {point}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* VIRTUAL TOOL 3: TERMÓMETRO LÁSER */}
              {activeTool === 'termometro' && (
                <div style={{ textAlign: 'center' }}>
                  <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
                    Termómetro de Contacto e Infrarrojo
                  </span>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginBottom: '12px'
                    }}
                  >
                    Inspecciona la temperatura de los rodamientos de la Bomba Centrífuga (PMP-101).
                    Valores &gt;75°C indican falta de grasa o desgaste severo.
                  </p>

                  {/* Laser Thermometer display */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div
                        style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}
                      >
                        RODAMIENTO 1 (ACOPLE MOTOR MOT-101)
                      </div>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: 'var(--color-success)'
                        }}
                      >
                        58.4 °C
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div
                        style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}
                      >
                        RODAMIENTO 2 (BOMBA PMP-101)
                      </div>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: 'var(--color-danger)'
                        }}
                      >
                        78.2 °C
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ fontSize: '0.72rem', color: 'var(--color-danger)', fontWeight: 600 }}
                  >
                    ⚠️ Alerta: El rodamiento 2 excede la temperatura de operación segura de 75°C.
                    Requiere engrase inmediato.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
