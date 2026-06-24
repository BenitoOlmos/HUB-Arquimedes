import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  GraduationCap,
  BarChart2,
  Users,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText
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
