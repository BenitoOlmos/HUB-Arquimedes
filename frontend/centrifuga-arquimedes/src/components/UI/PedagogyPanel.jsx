import React, { useState } from 'react';
import { BookOpen, Target, Calendar, User, MapPin, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

const PedagogyPanel = () => {
  const [activeStage, setActiveStage] = useState(1);

  const stagesData = [
    {
      id: 1,
      title: 'Etapa 1: Desarrollo de la Demo / Maqueta',
      period: 'Mes 1 a Mes 2',
      summary: 'Creación de un prototipo inicial funcional en VR de la bomba centrífuga para mitigar riesgos tecnológicos y validar la UX.',
      details: [
        { label: 'Qué (What)', value: 'Creación de un prototipo inicial funcional en VR de la bomba centrífuga.', icon: FileText },
        { label: 'Por qué (Why)', value: 'Para mitigar riesgos tecnológicos y validar la viabilidad del proyecto de forma temprana.', icon: Target },
        { label: 'Para qué (What for)', value: 'Para obtener feedback de usuarios (estudiantes/docentes) y validar la experiencia de usuario (UX).', icon: HelpCircle },
        { label: 'Cuándo (When)', value: 'Mes 1 a Mes 2 del proyecto.', icon: Calendar },
        { label: 'Dónde (Where)', value: 'Laboratorios de computación de la institución educativa en Chile.', icon: MapPin },
        { label: 'Quién (Who)', value: 'Equipo de desarrolladores VR, diseñadores 3D y un docente experto en mantenimiento.', icon: User },
        { label: 'Cómo (How)', value: 'Modelando la bomba en software 3D (Blender) y programando interacciones básicas en un motor gráfico (Unity/Unreal Engine).', icon: CheckCircle2 },
      ]
    },
    {
      id: 2,
      title: 'Etapa 2: Desarrollo del Sitio Web y Herramientas Didácticas',
      period: 'Mes 3 a Mes 5',
      summary: 'Programación de la plataforma web, base de datos de fichas técnicas, bitácoras digitales y tablas diagnósticas de fallas.',
      details: [
        { label: 'Qué (What)', value: 'Programación de la plataforma web, base de datos de fichas técnicas, bitácoras y tablas de fallas.', icon: FileText },
        { label: 'Por qué (Why)', value: 'Porque la práctica en Realidad Virtual debe estar respaldada por teoría técnica y documentación rigurosa.', icon: Target },
        { label: 'Para qué (What for)', value: 'Para centralizar el material de estudio y el seguimiento del alumno durante los 8 semestres de formación.', icon: HelpCircle },
        { label: 'Cuándo (When)', value: 'Mes 3 a Mes 5.', icon: Calendar },
        { label: 'Dónde (Where)', value: 'Entorno Cloud (Servidores en la nube) accesible desde cualquier dispositivo.', icon: MapPin },
        { label: 'Quién (Who)', value: 'Desarrolladores Full-Stack (Web) y especialistas en currículum de mantenimiento.', icon: User },
        { label: 'Cómo (How)', value: 'Utilizando frameworks web modernos (React) y bases de datos relacionales (PostgreSQL) para las bitácoras e historial.', icon: CheckCircle2 },
      ]
    },
    {
      id: 3,
      title: 'Etapa 3: Integración IoT y Entorno de Ensayos VR',
      period: 'Mes 6 a Mes 9',
      summary: 'Conexión bidireccional de parámetros operativos (Presión, Temperatura, Vibración) y simulación inmersiva de fallas complejas.',
      details: [
        { label: 'Qué (What)', value: 'Conexión de parámetros (Presión, Temperatura, Vibración) al visor VR y programación de simulaciones de fallas complejas.', icon: FileText },
        { label: 'Por qué (Why)', value: 'Para acercar al estudiante a la realidad de la Industria 4.0 y el mantenimiento predictivo.', icon: Target },
        { label: 'Para qué (What for)', value: 'Para que el alumno aprenda a tomar decisiones basadas en datos reales simulados, sin riesgo de accidentes.', icon: HelpCircle },
        { label: 'Cuándo (When)', value: 'Mes 6 a Mes 9.', icon: Calendar },
        { label: 'Dónde (Where)', value: 'Plataforma web integrada y visores VR en laboratorios de especialidad de la carrera.', icon: MapPin },
        { label: 'Quién (Who)', value: 'Ingenieros de automatización (IoT), programadores VR avanzados y docentes evaluadores.', icon: User },
        { label: 'Cómo (How)', value: 'Programando gemelos digitales, simulando telemetría mediante protocolos como WebSockets/MQTT y conectando los scripts de VR con los datos del servidor.', icon: CheckCircle2 },
      ]
    }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', height: '100%' }}>
      
      {/* Hero Header */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)', textTransform: 'uppercase' }}>Chile - Educación Técnico Profesional</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Carrera de Mantenimiento Industrial (8 Semestres)</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '-0.03em' }}>Proyecto Pedagógico: Módulo Virtual de Maquinaria</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6', maxWidth: '850px' }}>
          Propuesta innovadora de plataforma virtual con tecnología de <strong>Realidad Virtual (VR)</strong> e <strong>Internet de las Cosas (IoT)</strong>, enfocada en el estudio, diagnóstico y mantenimiento de una bomba de agua centrífuga acoplada a un motor eléctrico.
        </p>
      </div>

      {/* Main Grid: Objectives & Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Objectives Section */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="var(--accent-cyan)" /> Objetivos del Proyecto
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '12px' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Objetivo General</strong>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                Desarrollar e implementar una plataforma web interactiva y un entorno de Realidad Virtual (VR) que optimice el aprendizaje práctico y teórico de los estudiantes de mantenimiento, utilizando como modelo base una bomba centrífuga con motor eléctrico.
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Objetivos Específicos</strong>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <li>Crear un entorno virtual seguro para el ensayo de fallas complejas y el entrenamiento de mantenimiento preventivo y correctivo.</li>
                <li>Integrar tecnología IoT para la comunicación bidireccional en tiempo real entre la telemetría simulada y el dispositivo de visualización.</li>
                <li>Proveer herramientas didácticas digitales accesibles desde la web, como bitácoras digitales, fichas técnicas normalizadas y tablas de síntomas interactivos.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo validation Box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--accent-cyan)" /> Validación Inicial (Demo MVP)
          </h2>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            Antes del despliegue masivo en los talleres, se implementa una <strong>maqueta funcional</strong>. Este piloto web de componentes 3D cumple la función de validar la interfaz gráfica y familiarizar a los docentes con las métricas del simulador.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'block' }}>Alcance del Piloto:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: 'var(--status-operational)', borderRadius: '50%' }} />
                <span>Interacción 3D Explosionada</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: 'var(--status-operational)', borderRadius: '50%' }} />
                <span>Ficha Técnica en Español</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: 'var(--status-operational)', borderRadius: '50%' }} />
                <span>Historial de Bitácoras</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: 'var(--status-operational)', borderRadius: '50%' }} />
                <span>Simulación de Variables IoT</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5W2H Plan de Trabajo (Timeline and tabs) */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>Plan de Trabajo (Metodología 5W2H)</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cronograma detallado del desarrollo e implementación</span>
          </div>
          
          {/* Stage Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setActiveStage(num)}
                className={`btn-secondary ${activeStage === num ? 'active' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '20px' }}
              >
                Etapa {num}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Stage Detail */}
        <div>
          <div style={{ marginBottom: '20px', background: 'var(--bg-sidebar-header)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{stagesData[activeStage - 1].title}</h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-cyan)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>{stagesData[activeStage - 1].period}</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{stagesData[activeStage - 1].summary}</p>
          </div>

          {/* 5W2H Parameter Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {stagesData[activeStage - 1].details.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', transition: 'var(--transition-smooth)' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '8px', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.02em' }}>{item.label}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default PedagogyPanel;
