import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  GraduationCap,
  BarChart2,
  Users,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardEstudiante({
  selectedSemester,
  setSelectedSemester,
  onSelectScenario
}) {
  const [isTeacherView, setIsTeacherView] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');

  // States for Teacher Scenario configuration
  const [selectedEq, setSelectedEq] = useState('bomba');
  const [opHours, setOpHours] = useState('800');
  const [downHours, setDownHours] = useState('40');
  const [failures, setFailures] = useState('5');
  const [teacherConfigs, setTeacherConfigs] = useState({});
  const [docenteMsg, setDocenteMsg] = useState('');

  const factoryDefaults = {
    bomba: 'Bomba Centrífuga (PMP-101)',
    motor: 'Motor Eléctrico (MOT-101)',
    compresor: 'Compresor Alternativo (CMP-101)',
    intercambiador: 'Intercambiador Tubo/Carcasa (HEX-101)',
    valvula: 'Válvula Control Proporcional (TCV-101)'
  };

  // Load configurations on mount
  useEffect(() => {
    const stored = localStorage.getItem('reliability_teacher_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTeacherConfigs(parsed);
        if (parsed[selectedEq]) {
          setOpHours(String(parsed[selectedEq].tiempoOperativo));
          setDownHours(String(parsed[selectedEq].tiempoReparacion));
          setFailures(String(parsed[selectedEq].numFallas));
        }
      } catch (e) {
        console.error(e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync inputs when selected asset changes
  useEffect(() => {
    const stored = localStorage.getItem('reliability_teacher_config');
    let currentConfig = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed[selectedEq]) {
          currentConfig = parsed[selectedEq];
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (currentConfig) {
      setOpHours(String(currentConfig.tiempoOperativo));
      setDownHours(String(currentConfig.tiempoReparacion));
      setFailures(String(currentConfig.numFallas));
    } else {
      const defaults = {
        bomba: { op: '800', down: '40', fail: '5' },
        motor: { op: '1200', down: '24', fail: '3' },
        compresor: { op: '600', down: '30', fail: '6' },
        intercambiador: { op: '1500', down: '50', fail: '2' },
        valvula: { op: '900', down: '18', fail: '4' }
      };
      setOpHours(defaults[selectedEq].op);
      setDownHours(defaults[selectedEq].down);
      setFailures(defaults[selectedEq].fail);
    }
  }, [selectedEq, teacherConfigs]);

  const handleSaveScenario = () => {
    const newConfig = {
      ...teacherConfigs,
      [selectedEq]: {
        tiempoOperativo: parseFloat(opHours) || 0,
        tiempoReparacion: parseFloat(downHours) || 0,
        numFallas: parseInt(failures) || 0
      }
    };
    localStorage.setItem('reliability_teacher_config', JSON.stringify(newConfig));
    setTeacherConfigs(newConfig);
    setDocenteMsg(
      `¡Escenario de evaluación inyectado con éxito para ${factoryDefaults[selectedEq]}!`
    );
    setTimeout(() => setDocenteMsg(''), 4000);
  };

  const handleResetAllScenarios = () => {
    localStorage.removeItem('reliability_teacher_config');
    setTeacherConfigs({});
    setDocenteMsg('¡Se han restablecido todos los equipos a sus parámetros base de fábrica!');
    setTimeout(() => setDocenteMsg(''), 4000);
  };

  // Curriculum Data Matrix
  const curriculumScenarios = [
    {
      semester: '1° Semestre',
      title: 'Mantenimiento Base',
      type: 'Planta Virtual Completa',
      activity:
        'Reconocimiento y Mapeo: Navegación guiada, identificación de equipos principales y flujos de transformación (Entrada-Proceso-Salida).',
      code: 'SEM1-BASE'
    },
    {
      semester: '1° Semestre',
      title: 'Diagnóstico Inicial',
      type: 'Bomba Centrífuga con Motor',
      activity:
        'Detección de Síntomas: Análisis de vibración excesiva, ruidos anormales y aumento de temperatura. Formulación de hipótesis técnicas.',
      code: 'SEM1-DIAG'
    },
    {
      semester: '2° Semestre',
      title: 'Fallas Mecánicas',
      type: 'Compactadora / Envasadora',
      activity:
        'Secuencia de Falla: Análisis de variables operacionales y diagnóstico de fallas mecánicas/secuenciales en sistemas automatizados.',
      code: 'SEM2-MECH'
    },
    {
      semester: '3° Semestre',
      title: 'Subsistemas Industriales',
      type: 'Área de Bombeo y Actuadores',
      activity:
        'Sistemas Hidráulicos/Neumáticos: Interpretación de esquemas básicos, relación entre presión/flujo y estabilidad de actuadores.',
      code: 'SEM3-HYDR'
    },
    {
      semester: '4° Semestre',
      title: 'Integración de Sistemas',
      type: 'Proceso Automatizado Multisistema',
      activity:
        'Mantenimiento de Control: Detección de errores lógicos y desviaciones analizando la interacción entre lo mecánico, eléctrico y el control.',
      code: 'SEM4-CTRL'
    },
    {
      semester: '6° Semestre',
      title: 'Gestión de Activos',
      type: 'Planta desde Gestión de Equipos',
      activity:
        'Programación: Reconocimiento de rutas críticas, cuellos de botella del proceso e interpretación de diagramas de control.',
      code: 'SEM6-ASST'
    },
    {
      semester: '6° Semestre',
      title: 'Confiabilidad',
      type: 'Planta Completa',
      activity:
        'Falla Integrada: Evaluación del impacto de una falla masiva en la producción, disponibilidad y priorización del riesgo operacional.',
      code: 'SEM6-RELI'
    },
    {
      semester: '8° Semestre',
      title: 'Integración Avanzada',
      type: 'Subsistemas de Planta Completa',
      activity:
        'Confiabilidad Operacional: Clasificación de criticidad de activos estratégicos y diseño conceptual de estrategias de mantenimiento.',
      code: 'SEM8-CONF'
    }
  ];

  // Insignias / Competencias
  const badges = [
    {
      id: 1,
      title: 'Planos Técnicos',
      desc: 'Interpretación de planos P&ID e hidráulicos',
      color: '#3b82f6',
      active: true
    },
    {
      id: 2,
      title: 'Verificación Dimensional',
      desc: 'Uso experto de calibrador Vernier y micrómetro',
      color: '#10b981',
      active: true
    },
    {
      id: 3,
      title: 'Diagnóstico Predictivo',
      desc: 'Cálculo e identificación de espectros de vibración',
      color: '#f59e0b',
      active: true
    },
    {
      id: 4,
      title: 'Control Lógico',
      desc: 'Aislamiento de fallas en PLCs y lazos de control',
      color: '#8b5cf6',
      active: false
    },
    {
      id: 5,
      title: 'Confiabilidad Operacional',
      desc: 'Diseño de matrices de criticidad RCM',
      color: '#ec4899',
      active: false
    }
  ];

  // Analytics data for 6000 students (Docente Panel)
  const errorsByEquipment = [
    {
      name: 'Motores Eléctricos',
      fallasFrecuentes: 320,
      diagnosticosErroneos: 412,
      color: '#3b82f6'
    },
    {
      name: 'Bombas Centrífugas',
      fallasFrecuentes: 450,
      diagnosticosErroneos: 520,
      color: '#10b981'
    },
    { name: 'Compresores', fallasFrecuentes: 210, diagnosticosErroneos: 340, color: '#f59e0b' },
    {
      name: 'Intercambiadores',
      fallasFrecuentes: 180,
      diagnosticosErroneos: 270,
      color: '#8b5cf6'
    },
    {
      name: 'Válvulas de Control',
      fallasFrecuentes: 290,
      diagnosticosErroneos: 390,
      color: '#ec4899'
    }
  ];

  const errorTypesPie = [
    { name: 'Errores Mecánicos', value: 40, color: '#ea580c' },
    { name: 'Errores de Control/PLC', value: 25, color: '#8b5cf6' },
    { name: 'Errores Eléctricos', value: 20, color: '#3b82f6' },
    { name: 'Errores Neumáticos/Hidráulicos', value: 15, color: '#06b6d4' }
  ];

  const handleDownloadReport = (type) => {
    setDownloadMsg(
      `Generando y descargando reporte de evaluación (${type}) para 6,240 estudiantes...`
    );
    setTimeout(() => {
      setDownloadMsg(
        `¡Descarga iniciada exitosamente! Archivo: HUB_Reporte_Analitica_${type === 'CSV' ? 'Excel.csv' : 'Completo.pdf'}`
      );
      setTimeout(() => setDownloadMsg(''), 4000);
    }, 1500);
  };

  const getSemesterProgress = (sem) => {
    const activeIndex = parseInt(sem) || 1;
    return Math.min(100, Math.round((activeIndex / 8) * 100));
  };

  const currentScenarios = curriculumScenarios.filter((s) =>
    s.semester.startsWith(selectedSemester + '°')
  );

  return (
    <div className="slide-in-left">
      {/* Header and Teacher Toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap className="text-accent" />
            Progreso Curricular y Dashboard Académico
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gestiona tus actividades semestrales y haz seguimiento a las insignias de competencia.
          </p>
        </div>

        <button
          onClick={() => setIsTeacherView(!isTeacherView)}
          className={`btn ${isTeacherView ? 'btn-primary' : 'btn-secondary'} flex-center gap-12`}
        >
          <Users size={16} />
          <span>{isTeacherView ? 'Ver Vista Estudiante' : 'Ver Vista Docente (Analítica)'}</span>
        </button>
      </div>

      {/* TABS DE DOCENTE O ESTUDIANTE */}
      {!isTeacherView ? (
        <div className="grid-cols-12">
          {/* Ficha de Estudiante */}
          <div className="col-span-8 glass-card">
            <div
              style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}
            >
              <div
                className="avatar"
                style={{
                  width: '64px',
                  height: '64px',
                  fontSize: '1.5rem',
                  background: 'var(--accent-gradient)'
                }}
              >
                BG
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Benjamín González</h3>
                  <span className="badge badge-blue">8 Semestres Activos</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ingeniería Mecánica y de Confiabilidad Operacional
                </p>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${getSemesterProgress(selectedSemester)}%`,
                        height: '100%',
                        backgroundColor: 'var(--accent-color)'
                      }}
                    />
                  </div>
                  <span
                    style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-accent)' }}
                  >
                    Progreso Curricular: {getSemesterProgress(selectedSemester)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Semester Quick Slider */}
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                letterSpacing: '0.5px'
              }}
            >
              Seleccionar Semestre Curricular
            </h4>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '24px',
                overflowX: 'auto',
                paddingBottom: '8px'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`btn ${selectedSemester === sem ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    flex: '1 1 0px',
                    minWidth: '50px',
                    padding: '12px 6px',
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {sem}°
                </button>
              ))}
            </div>

            {/* Scenarios Checklist according to Semester */}
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BookOpen size={18} className="text-accent" />
              Escenarios y Actividades Curriculares ({selectedSemester}° Semestre)
            </h4>

            {currentScenarios.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentScenarios.map((sc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
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
                        <span
                          className="badge badge-blue"
                          style={{ fontSize: '0.65rem', marginBottom: '4px' }}
                        >
                          {sc.type}
                        </span>
                        <h5
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: 'var(--text-main)'
                          }}
                        >
                          {sc.title}
                        </h5>
                      </div>
                      <span
                        style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}
                      >
                        Código: {sc.code}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{sc.activity}</p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '8px',
                        alignSelf: 'flex-end'
                      }}
                    >
                      <button
                        onClick={() => onSelectScenario(sc.code, 'planta')}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Reconocer Planta
                      </button>
                      <button
                        onClick={() => onSelectScenario(sc.code, 'fallas')}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Iniciar Simulación
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                No hay actividades preconfiguradas para este semestre. Te sugerimos explorar el
                Reconocimiento de Planta General.
              </div>
            )}
          </div>

          {/* Insignias / Competencias */}
          <div
            className="col-span-4 glass-card"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Award size={18} className="text-accent" />
              Insignias / Competencias
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Las insignias validan tus competencias y habilidades prácticas registradas.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {badges.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: b.active ? 'var(--bg-primary)' : 'rgba(0,0,0,0.02)',
                    border: '1px solid',
                    borderColor: b.active ? 'var(--border-color)' : 'transparent',
                    opacity: b.active ? 1 : 0.5
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: b.active ? b.color : '#ccc',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: b.active ? `0 0 10px ${b.color}40` : 'none'
                    }}
                  >
                    <Award size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {b.title}
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.desc}</p>
                  </div>
                  {b.active ? (
                    <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <span
                      style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}
                    >
                      Bloq.
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DOCENTE / PANEL ANALITICO NACIONAL */
        <div className="glass-card slide-in-right">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BarChart2 className="text-accent" />
              Panel de Analítica Nacional de Rendimiento
            </h3>
            <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>
              6,240 Estudiantes Enrolados
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
            >
              <Users size={24} className="text-accent" style={{ marginBottom: '8px' }} />
              <h5 style={{ fontSize: '1.5rem', fontWeight: 800 }}>6,240</h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Alumnos Totales (Nivel Nacional)
              </p>
            </div>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
            >
              <CheckCircle
                size={24}
                style={{ color: 'var(--color-success)', marginBottom: '8px' }}
              />
              <h5 style={{ fontSize: '1.5rem', fontWeight: 800 }}>92.4%</h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tasa de Completitud de Actividades
              </p>
            </div>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
            >
              <AlertTriangle
                size={24}
                style={{ color: 'var(--color-warning)', marginBottom: '8px' }}
              />
              <h5 style={{ fontSize: '1.5rem', fontWeight: 800 }}>14.8%</h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tasa Promedio de Error en Diagnósticos
              </p>
            </div>
          </div>

          {/* Gráficos de errores */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px' }}>
                Errores Frecuentes por Familia de Equipo (6,000 Alumnos)
              </h4>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={errorsByEquipment}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar
                      dataKey="fallasFrecuentes"
                      name="Fallas Resueltas"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="diagnosticosErroneos"
                      name="Errores de Diagnóstico"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px' }}>
                Errores por Subsistema
              </h4>
              <div
                style={{
                  width: '100%',
                  height: '180px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorTypesPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {errorTypesPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '0.68rem',
                  marginTop: '8px'
                }}
              >
                {errorTypesPie.map((e, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: e.color
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>
                      {e.name} ({e.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONSOLA DE CONFIGURACION DE ESCENARIOS (DOCENTE) */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-color)',
              marginBottom: '24px',
              animation: 'slideInLeft 0.3s ease-out'
            }}
          >
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings size={18} className="text-accent" />
              🔧 Consola Docente: Inyección de Escenarios de Confiabilidad
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Define escenarios específicos de fallas ocultas y tiempos operativos. Los estudiantes
              verán estos parámetros cargados en sus calculadoras al inspeccionar los equipos en la
              Planta Virtual.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.8fr',
                gap: '24px',
                alignItems: 'start'
              }}
            >
              {/* Formulario */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      marginBottom: '4px'
                    }}
                  >
                    Seleccionar Equipo Industrial
                  </label>
                  <select
                    value={selectedEq}
                    onChange={(e) => setSelectedEq(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="bomba">Bomba Centrífuga (PMP-101)</option>
                    <option value="motor">Motor Eléctrico (MOT-101)</option>
                    <option value="compresor">Compresor Alternativo (CMP-101)</option>
                    <option value="intercambiador">Intercambiador de Calor (HEX-101)</option>
                    <option value="valvula">Válvula de Control (TCV-101)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      marginBottom: '4px'
                    }}
                  >
                    Tiempo Operativo Base (Horas)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={opHours}
                    onChange={(e) => setOpHours(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        marginBottom: '4px'
                      }}
                    >
                      Reparación (Horas)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={downHours}
                      onChange={(e) => setDownHours(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        marginBottom: '4px'
                      }}
                    >
                      N° de Fallas
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={failures}
                      onChange={(e) => setFailures(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}
                >
                  <button
                    onClick={handleSaveScenario}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '10px' }}
                  >
                    Inyectar Escenario Docente
                  </button>
                  <button
                    onClick={handleResetAllScenarios}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '8px', color: 'var(--color-danger)' }}
                  >
                    Limpiar Todos los Escenarios
                  </button>
                </div>
              </div>

              {/* Tabla Resumen */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <h5
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)'
                  }}
                >
                  Configuración Activa de Equipos (Base de Datos Local)
                </h5>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          color: 'var(--text-muted)',
                          textAlign: 'left'
                        }}
                      >
                        <th style={{ padding: '8px 4px' }}>Equipo (Tag)</th>
                        <th style={{ padding: '8px 4px' }}>T. Operación</th>
                        <th style={{ padding: '8px 4px' }}>T. Inactividad</th>
                        <th style={{ padding: '8px 4px' }}>Fallas</th>
                        <th style={{ padding: '8px 4px' }}>Disponibilidad</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(factoryDefaults).map(([key, _name]) => {
                        const isCustom = !!teacherConfigs[key];
                        const defaults = {
                          bomba: { op: 800, down: 40, fail: 5 },
                          motor: { op: 1200, down: 24, fail: 3 },
                          compresor: { op: 600, down: 30, fail: 6 },
                          intercambiador: { op: 1500, down: 50, fail: 2 },
                          valvula: { op: 900, down: 18, fail: 4 }
                        };

                        const op = isCustom
                          ? teacherConfigs[key].tiempoOperativo
                          : defaults[key].op;
                        const down = isCustom
                          ? teacherConfigs[key].tiempoReparacion
                          : defaults[key].down;
                        const fail = isCustom ? teacherConfigs[key].numFallas : defaults[key].fail;

                        let disp = 100;
                        if (fail > 0) {
                          const mtbf = op / fail;
                          const mttr = down / fail;
                          disp = (mtbf / (mtbf + mttr)) * 100;
                        } else {
                          disp = op + down > 0 ? (op / (op + down)) * 100 : 100;
                        }

                        const shortName =
                          key === 'bomba'
                            ? 'PMP-101'
                            : key === 'motor'
                              ? 'MOT-101'
                              : key === 'compresor'
                                ? 'CMP-101'
                                : key === 'intercambiador'
                                  ? 'HEX-101'
                                  : 'TCV-101';

                        return (
                          <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '8px 4px', fontWeight: 600 }}>{shortName}</td>
                            <td style={{ padding: '8px 4px' }}>{op} h</td>
                            <td style={{ padding: '8px 4px' }}>{down} h</td>
                            <td style={{ padding: '8px 4px' }}>{fail}</td>
                            <td
                              style={{
                                padding: '8px 4px',
                                fontWeight: 700,
                                color: disp >= 95 ? '#10b981' : disp >= 90 ? '#f59e0b' : '#ef4444'
                              }}
                            >
                              {disp.toFixed(1)}%
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <span
                                className={`badge ${isCustom ? 'badge-blue' : 'badge-green'}`}
                                style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                              >
                                {isCustom ? 'Docente' : 'Fábrica'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {docenteMsg && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--accent-light)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--text-accent)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  animation: 'slideInLeft 0.2s ease-out'
                }}
              >
                {docenteMsg}
              </div>
            )}
          </div>

          {/* Botones de Descarga y Mensaje */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => handleDownloadReport('CSV')}
              className="btn btn-secondary flex-center gap-12"
            >
              <Download size={16} />
              <span>Descargar CSV (Excel)</span>
            </button>
            <button
              onClick={() => handleDownloadReport('PDF')}
              className="btn btn-secondary flex-center gap-12"
            >
              <FileText size={16} />
              <span>Descargar Reporte PDF de Evaluación</span>
            </button>

            {downloadMsg && (
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: 'var(--accent-light)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--text-accent)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  animation: 'slideInLeft 0.2s ease-out'
                }}
              >
                {downloadMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
