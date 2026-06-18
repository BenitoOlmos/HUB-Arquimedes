import React from 'react';
import { ToggleLeft, ToggleRight, AlertTriangle, Users, Award, ShieldAlert, Cpu } from 'lucide-react';

const TeacherConsole = ({
  teacherScenarios,
  toggleScenario,
  injectVipClient,
  activeOTs
}) => {
  const activeScenariosCount = Object.values(teacherScenarios).filter(Boolean).length;

  return (
    <div className="panel-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Consola de Simulación Docente (Incidentes)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Esta consola simula eventos externos y fallas en terreno. Permite a los profesores evaluar la resiliencia y la toma de decisiones de los alumnos.
          </p>
        </div>
        
        {activeScenariosCount > 0 ? (
          <span className="scenario-active-badge">
            ⚡ {activeScenariosCount} Crisis Activas
          </span>
        ) : (
          <span className="badge-status operational" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
            Operación Normal
          </span>
        )}
      </div>

      {/* Grid of Incidents */}
      <div className="grid-2col">
        {/* Incident 1: Logistical Strike */}
        <div className="section-card teacher-console-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={24} style={{ color: 'var(--status-inspect)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Huelga de Transportistas (Logística)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Afecta a: **Apex Auto Parts** (+3 turnos de demora)
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => toggleScenario('supplierStrike')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {teacherScenarios.supplierStrike ? (
                <ToggleRight size={44} style={{ color: 'var(--status-inspect)' }} />
              ) : (
                <ToggleLeft size={44} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Simula un paro nacional de camioneros o transportistas. El Proveedor Calidad aumenta su plazo de entrega de 2 a 5 turnos. Los alumnos deben decidir si arriesgan comprando genérico o gastan de más comprando OEM.
          </p>
        </div>

        {/* Incident 2: Exchange rate fluctuation */}
        <div className="section-card teacher-console-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={24} style={{ color: 'var(--status-replace)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Alza del Dólar (Inflación Arancelaria)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Afecta a: **Original Parts S.A.** (+15% Costo)
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => toggleScenario('dollarFluctuation')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {teacherScenarios.dollarFluctuation ? (
                <ToggleRight size={44} style={{ color: 'var(--status-replace)' }} />
              ) : (
                <ToggleLeft size={44} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Simula una devaluación abrupta de la moneda nacional. El costo de los repuestos originales (OEM) importados aumenta un 15%. Obliga a los alumnos a recalcular presupuestos o buscar alternativas de compra.
          </p>
        </div>

        {/* Incident 3: Infrastructure failure */}
        <div className="section-card teacher-console-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={24} style={{ color: 'var(--status-replace)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Falla del Elevador Hidráulico Primario</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Afecta a: **Andén 1 (Elevador 2 Postes)** (Bloqueado)
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => toggleScenario('liftOffline')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {teacherScenarios.liftOffline ? (
                <ToggleRight size={44} style={{ color: 'var(--status-replace)' }} />
              ) : (
                <ToggleLeft size={44} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Inhabilita el Andén 1. Las reparaciones de suspensión o transmisión en curso en ese andén quedan pausadas y no es posible asignar nuevos vehículos hasta reparar la infraestructura.
          </p>
        </div>

        {/* Incident 4: Personnel illness */}
        <div className="section-card teacher-console-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={24} style={{ color: 'var(--accent-blue)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Licencia Médica (Ausentismo)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Afecta a: **Carlos Mendoza (Electricista Lead)**
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => toggleScenario('sickMechanic')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {teacherScenarios.sickMechanic ? (
                <ToggleRight size={44} style={{ color: 'var(--accent-blue)' }} />
              ) : (
                <ToggleLeft size={44} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            El especialista en inyección electrónica y fallas eléctricas se ausenta por enfermedad. No podrá ser asignado a ningún andén. Si estaba trabajando, su orden queda pausada hasta que se reasigne o vuelva de su licencia.
          </p>
        </div>
      </div>

      {/* Special VIP Injector */}
      <div className="section-card teacher-console-card" style={{ borderStyle: 'solid', borderColor: 'var(--accent-purple)' }}>
        <h3 className="section-title" style={{ color: 'var(--accent-purple)', fontSize: '1.02rem' }}>
          <Award size={18} /> Inyector de Casos Especiales: Cliente VIP Corporativo
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Inyecta una Orden de Trabajo crítica de alta prioridad. Corresponde a una patrulla de policía o camión de reparto logístico (Cliente VIP) que exige reparación el mismo día, ofreciendo un pago elevado pero aplicando fuertes multas o pérdida de contrato si el alumno se atrasa.
          </p>
          
          <button 
            className="premium-btn active"
            style={{ background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', alignSelf: 'flex-start', padding: '10px 20px' }}
            onClick={injectVipClient}
          >
            🚀 Inyectar Orden VIP (Dina S.A.)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherConsole;
