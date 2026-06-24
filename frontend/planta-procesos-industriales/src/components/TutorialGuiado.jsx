import React, { useState } from 'react';
import { HelpCircle, ChevronRight, X, Play, BookOpen } from 'lucide-react';

export default function TutorialGuiado({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      title: '¡Bienvenido a la Planta de Proceso Industrial!',
      description:
        'Esta plataforma está diseñada para acompañar tu progresión curricular de 1° a 8° semestre en Mantenimiento, Mecatrónica y Confiabilidad. No necesitas inducción presencial: este asistente te guiará.',
      action: 'Comenzar',
      targetTab: 'dashboard'
    },
    {
      title: 'Módulo 1: Dashboard del Estudiante',
      description:
        'Aquí puedes ver tu perfil, tus competencias e insignias adquiridas, y seleccionar tu Semestre curricular para cargar dinámicamente escenarios de práctica. Los docentes también acceden aquí al panel analítico nacional de 6,000 alumnos.',
      action: 'Siguiente Módulo',
      targetTab: 'dashboard'
    },
    {
      title: 'Módulo 2: Planta Interactiva 2D/3D',
      description:
        'Recorre flujos de proceso reales. Puedes alternar entre 4 contextos industriales (Minería, Alimenticia, Energía y Química) e interactuar con las 5 familias de equipos críticos (bombas, motores, compresores, válvulas e intercambiadores) detallando sus subsistemas.',
      action: 'Ver Planta Virtual',
      targetTab: 'planta'
    },
    {
      title: 'Módulo 3: Simulador de Mantenimiento',
      description:
        'Ejecuta tareas guiadas de mantenimiento base y avanzado (Alineación, Lubricación, Inspección). Aprende a usar instrumentos virtuales como el Calibrador Vernier, Termómetro y Multímetro y a interpretar planos técnicos interactivos.',
      action: 'Ver Simulador',
      targetTab: 'mantenimiento'
    },
    {
      title: 'Módulo 4: Diagnóstico Avanzado de Fallas',
      description:
        'Enfréntate a fallas industriales multisistema inyectadas dinámicamente. Analiza tendencias y telemetría de vibración, temperatura y presiones en tiempo real. Formula hipótesis técnicas y toma acciones correctivas.',
      action: 'Ver Diagnóstico',
      targetTab: 'fallas'
    },
    {
      title: 'Hoja de Ruta del Proyecto (Presentación)',
      description:
        'Explora la planificación estratégica del proyecto para tu presentación de este viernes: hitos clave (Meta Nov 2026, Ene 2027, Mar 2027), y los dos caminos de desarrollo sugeridos.',
      action: 'Finalizar Tour',
      targetTab: 'roadmap'
    }
  ];

  const handleNext = () => {
    const nextStep = step + 1;
    if (nextStep < tutorialSteps.length) {
      setStep(nextStep);
      setActiveTab(tutorialSteps[nextStep].targetTab);
    } else {
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  const startTutorial = () => {
    setStep(0);
    setActiveTab('dashboard');
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={startTutorial}
        className="btn btn-secondary flex-center gap-12"
        style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem' }}
        title="Iniciar tutorial guiado"
      >
        <BookOpen size={16} className="text-accent" />
        <span>Ayuda / Tutorial</span>
      </button>
    );
  }

  const current = tutorialSteps[step];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '380px',
        zIndex: 9999,
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--accent-color)'
          }}
        >
          <HelpCircle size={20} />
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Tutorial Autoaprendizaje
          </span>
        </div>
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <X size={18} />
        </button>
      </div>

      <h4
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          marginBottom: '8px',
          color: 'var(--text-main)'
        }}
      >
        {current.title}
      </h4>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          lineHeight: '1.45'
        }}
      >
        {current.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Paso {step + 1} de {tutorialSteps.length}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {step > 0 && (
            <button
              onClick={handleSkip}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Omitir
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            <span>{current.action}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar indicator */}
      <div
        style={{
          height: '4px',
          width: '100%',
          backgroundColor: 'var(--border-color)',
          borderRadius: '2px',
          marginTop: '16px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((step + 1) / tutorialSteps.length) * 100}%`,
            backgroundColor: 'var(--accent-color)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
}
