import React, { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  FileText,
  CheckCircle,
  Info,
  Award,
  BarChart2
} from 'lucide-react';

export default function RoadmapPresentacion() {
  const [selectedStrategy, setSelectedStrategy] = useState('fases'); // fases, familias

  const stages = [
    {
      title: 'Etapa 1 (Meta Noviembre 2026)',
      duration: '6 meses (Desarrollo inicial)',
      progress: 80,
      scope: [
        'Desarrollo del Core Base y motor de navegación de la planta virtual.',
        'Reconocimiento de componentes interactivos.',
        'Módulo de interpretación de planos P&ID y herramientas de medición virtuales.',
        'Módulos de mantenimiento base (1° a 3° semestre).'
      ],
      deliverable:
        'Core completado en Enero 2027 para control de calidad y marcha blanca curricular.'
    },
    {
      title: 'Etapa 2',
      duration: '6 meses (Siguiente Sprint)',
      progress: 0,
      scope: [
        'Módulos avanzados de sistemas de transmisión mecánica.',
        'Mantenimiento avanzado de bombas centrífugas.',
        'Integración de subsistemas electromecánicos (4° a 6° semestre).'
      ],
      deliverable: 'Integración de variadores de frecuencia y simulación de desgaste progresivo.'
    },
    {
      title: 'Etapa 3 (Meta Final)',
      duration: 'Condicional (Según etapa 2)',
      progress: 0,
      scope: [
        'Motor avanzado de inyección de fallas dinámicas multisistema.',
        'Simulación neumática e hidráulica interactiva en tiempo real.',
        'Lógica avanzada de control automático y análisis predictivo.'
      ],
      deliverable: 'Rollout nacional oficial completo para los semestres 6° a 8°.'
    }
  ];

  const milestones = [
    {
      date: 'Noviembre 2026',
      title: 'Finalización del Core',
      desc: 'Meta del Core de la plataforma y Etapa 1 completada al 100%.'
    },
    {
      date: 'Enero 2027',
      title: 'Marcha Blanca Nacional',
      desc: 'Entrega del 80% global para control de calidad, inducción y guías autogestionadas.'
    },
    {
      date: 'Marzo 2027',
      title: 'Puesta en Servicio Nacional',
      desc: 'Lanzamiento oficial a más de 6,000 alumnos a nivel nacional.'
    }
  ];

  return (
    <div className="slide-in-right">
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
          <Calendar className="text-accent" />
          Roadmap Estratégico y Planificación (Presentación del Viernes)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Visualiza los hitos, plazos e itinerarios propuestos para defender el proyecto ante los
          tomadores de decisión.
        </p>
      </div>

      <div className="grid-cols-12">
        {/* HITOS Y GANTT */}
        <div className="col-span-8 glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
            Gantt de Desarrollo Sugerido (Estrategia por Fases)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {stages.map((st, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>{st.title}</h4>
                    <span
                      style={{ fontSize: '0.72rem', color: 'var(--text-accent)', fontWeight: 600 }}
                    >
                      {st.duration}
                    </span>
                  </div>
                  {st.progress > 0 && (
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                      {st.progress}% Desarrollado
                    </span>
                  )}
                </div>

                <ul
                  style={{
                    paddingLeft: '16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '12px'
                  }}
                >
                  {st.scope.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {item}
                    </li>
                  ))}
                </ul>

                <div
                  style={{
                    borderTop: '1px dashed var(--border-color)',
                    paddingTop: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-main)'
                  }}
                >
                  💡 Entregable Clave: {st.deliverable}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPARACIÓN DE CAMINOS ESTRATÉGICOS */}
        <div className="col-span-4 glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
            Caminos Estratégicos de Desarrollo
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '16px',
              backgroundColor: 'var(--bg-primary)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <button
              onClick={() => setSelectedStrategy('fases')}
              className="btn btn-secondary"
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                background: selectedStrategy === 'fases' ? 'var(--bg-secondary)' : 'none',
                border: 'none',
                fontWeight: 700
              }}
            >
              Fases Técnicas
            </button>
            <button
              onClick={() => setSelectedStrategy('familias')}
              className="btn btn-secondary"
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                background: selectedStrategy === 'familias' ? 'var(--bg-secondary)' : 'none',
                border: 'none',
                fontWeight: 700
              }}
            >
              Familias de Equipos
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              lineHeight: '1.5'
            }}
          >
            {selectedStrategy === 'fases' ? (
              <div>
                <span
                  className="badge badge-blue"
                  style={{ marginBottom: '8px', fontSize: '0.65rem' }}
                >
                  Estrategia Recomendada
                </span>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Despliegue horizontal por madurez técnica.
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  Prioriza entregar el Core funcional de visualización y herramientas a toda la base
                  curricular primero. Permite una marcha blanca más rápida y adaptabilidad
                  curricular generalizada para los 6,000 alumnos.
                </p>
              </div>
            ) : (
              <div>
                <span
                  className="badge badge-yellow"
                  style={{ marginBottom: '8px', fontSize: '0.65rem' }}
                >
                  Estrategia Alternativa
                </span>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Profundidad vertical por familia.
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  Desarrolla una familia de equipos en profundidad total (visualización, despiece y
                  simulación de fallas avanzadas) antes de pasar a la siguiente. Adecuado si se
                  desea validar la simulación de fallas muy temprano con grupos piloto reducidos.
                </p>
              </div>
            )}
          </div>

          {/* Hitos Críticos */}
          <div style={{ marginTop: '20px' }}>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '12px',
                textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}
            >
              Hitos Críticos de Implementación
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {milestones.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      padding: '2px 6px',
                      backgroundColor: 'var(--accent-light)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent-color)',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {m.date}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {m.title}
                    </h5>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
