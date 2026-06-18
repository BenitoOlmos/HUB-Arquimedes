import React from 'react';
import { ShieldAlert, Zap, Truck, AlertOctagon, HeartCrack, Ban, Play, RefreshCcw } from 'lucide-react';

const CrisisConsole = ({
  activeCrises,
  onTriggerCrisis,
  onResolveCrises,
  onTriggerAlert,
  patientArrivalMultiplier,
  consumptionMultiplier
}) => {

  const handleTrigger = (type) => {
    onTriggerCrisis(type);
    
    let message = '';
    if (type === 'EPIDEMIC') message = '¡Docente activó crisis: Brote de Virus Respiratorio Severo! Tasa de ingreso +150%, consumo de Oxígeno x3.';
    if (type === 'ACCIDENT') message = '¡Docente activó crisis: Accidente Masivo de Tránsito! Inyección inmediata de politraumatizados ESI 1 y 2.';
    if (type === 'EARTHQUAKE') message = '¡Docente activó crisis: Desastre Natural (Sismo)! Emergencia general en curso.';
    if (type === 'EQUIPMENT_FAIL') message = '¡Docente activó crisis: Falla Masiva de Ventiladores Mecánicos! Camas de UCI inhabilitadas.';

    onTriggerAlert(message);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      
      {/* Teacher Controls */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Zap size={18} color="var(--esi-1-resus)" /> Consola Docente / Game Master (Crisis)
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            Control de Escenarios de Estrés
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Usa estos controles para inyectar complejidades logísticas y clínicas en tiempo real. Los estudiantes deberán priorizar de inmediato el triage y reordenar recursos de farmacia para evitar muertes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* Brote Viral */}
          <div style={{
            background: activeCrises.includes('EPIDEMIC') ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.01)',
            border: activeCrises.includes('EPIDEMIC') ? '1px solid var(--accent-purple)' : '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <ShieldAlert size={18} color="var(--accent-purple)" />
              <strong style={{ fontSize: '0.85rem' }}>Brote Viral Respiratorio</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexGrow: 1 }}>
              Multiplica la llegada de pacientes respiratorios ESI 2 y 3. Aumenta críticamente la tasa de consumo de Oxígeno e inhaladores.
            </p>
            <button
              className="btn-danger"
              style={{ background: 'var(--accent-purple)', fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'center' }}
              onClick={() => handleTrigger('EPIDEMIC')}
              disabled={activeCrises.includes('EPIDEMIC')}
            >
              <Play size={12} /> Inyectar Brote
            </button>
          </div>

          {/* Accidente Vial */}
          <div style={{
            background: activeCrises.includes('ACCIDENT') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.01)',
            border: activeCrises.includes('ACCIDENT') ? '1px solid var(--esi-1-resus)' : '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Truck size={18} color="var(--esi-1-resus)" />
              <strong style={{ fontSize: '0.85rem' }}>Choque de Autobús</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexGrow: 1 }}>
              Inyección instantánea de 10 a 15 heridos graves (ESI 1 y ESI 2) a la sala de espera. Requiere andenes críticos UCI/UTI y suturas.
            </p>
            <button
              className="btn-danger"
              style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'center' }}
              onClick={() => handleTrigger('ACCIDENT')}
              disabled={activeCrises.includes('ACCIDENT')}
            >
              <Play size={12} /> Inyectar Accidente
            </button>
          </div>

          {/* Sismo */}
          <div style={{
            background: activeCrises.includes('EARTHQUAKE') ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 255, 255, 0.01)',
            border: activeCrises.includes('EARTHQUAKE') ? '1px solid var(--esi-2-emerg)' : '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertOctagon size={18} color="var(--esi-2-emerg)" />
              <strong style={{ fontSize: '0.85rem' }}>Sismo de Mayor Intensidad</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexGrow: 1 }}>
              Aumento sostenido en la tasa general de admisión de pacientes de todas las clasificaciones. Afecta el stock de EPP.
            </p>
            <button
              className="btn-danger"
              style={{ background: 'var(--esi-2-emerg)', fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'center' }}
              onClick={() => handleTrigger('EARTHQUAKE')}
              disabled={activeCrises.includes('EARTHQUAKE')}
            >
              <Play size={12} /> Inyectar Terremoto
            </button>
          </div>

          {/* Falla de Ventiladores */}
          <div style={{
            background: activeCrises.includes('EQUIPMENT_FAIL') ? 'rgba(100, 116, 139, 0.08)' : 'rgba(255, 255, 255, 0.01)',
            border: activeCrises.includes('EQUIPMENT_FAIL') ? '1px solid var(--text-muted)' : '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Ban size={18} color="var(--text-muted)" />
              <strong style={{ fontSize: '0.85rem' }}>Falla de Ventiladores UCI</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexGrow: 1 }}>
              Inhabilita camas críticas de la sala UCI de manera aleatoria. Los pacientes críticos deben reubicarse en UTI o derivarse.
            </p>
            <button
              className="btn-danger"
              style={{ background: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'center' }}
              onClick={() => handleTrigger('EQUIPMENT_FAIL')}
              disabled={activeCrises.includes('EQUIPMENT_FAIL')}
            >
              <Play size={12} /> Inyectar Fallas
            </button>
          </div>

        </div>

        {activeCrises.length > 0 && (
          <button
            className="btn-secondary"
            style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center', borderColor: 'var(--bed-free)', color: 'var(--bed-free)' }}
            onClick={() => {
              onResolveCrises();
              onTriggerAlert('¡Escenario estabilizado! El docente ha finalizado las crisis inyectadas.');
            }}
          >
            <RefreshCcw size={14} /> Normalizar y Resolver Crises Activas
          </button>
        )}
      </div>

      {/* Simulator Metrics Dashboard */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <HeartCrack size={18} color="var(--esi-1-resus)" /> Estatus del Multiplicador de Red
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Arrival Rate */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem' }}>Multiplicador Admisiones</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tasa de flujo en Triage</span>
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: patientArrivalMultiplier > 1 ? 'var(--esi-1-resus)' : 'var(--bed-free)'
            }}>
              {patientArrivalMultiplier.toFixed(1)}x
            </span>
          </div>

          {/* Consumption Rate */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem' }}>Multiplicador Farmacia</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tasa de consumo de insumos</span>
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: consumptionMultiplier > 1 ? 'var(--esi-2-emerg)' : 'var(--bed-free)'
            }}>
              {consumptionMultiplier.toFixed(1)}x
            </span>
          </div>

          {/* Active crises list */}
          <div>
            <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Crisis Activas en el Sistema:
            </strong>
            {activeCrises.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--bed-free)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="bed-status-dot free" style={{ alignSelf: 'center' }}></span> Operación Estable y Normalizada
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeCrises.map(c => {
                  let name = '';
                  let color = '';
                  if (c === 'EPIDEMIC') { name = 'EPIDEMIA VIRAL RESPIRATORIA'; color = 'var(--accent-purple)'; }
                  if (c === 'ACCIDENT') { name = 'ACCIDENTE VIAL MULTIPATOLÓGICO'; color = 'var(--esi-1-resus)'; }
                  if (c === 'EARTHQUAKE') { name = 'DESASTRE NATURAL (SISMO)'; color = 'var(--esi-2-emerg)'; }
                  if (c === 'EQUIPMENT_FAIL') { name = 'BLOQUEO VENTILADORES CRÍTICOS'; color = 'var(--text-muted)'; }

                  return (
                    <div key={c} style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color,
                      background: 'rgba(255,255,255,0.02)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${color}`
                    }}>
                      ⚠️ {name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default CrisisConsole;
