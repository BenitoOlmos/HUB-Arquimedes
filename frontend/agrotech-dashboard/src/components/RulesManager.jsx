import React, { useState } from 'react';
import { ToggleLeft, Trash2, Droplets, Heart, AlertTriangle, PlayCircle } from 'lucide-react';

const RulesManager = ({ zones, rules, kpis, onCreateRule, onDeleteRule, onTriggerAlert }) => {
  const [ruleName, setRuleName] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [sensorType, setSensorType] = useState('SOIL_MOISTURE');
  const [operator, setOperator] = useState('LT');
  const [threshold, setThreshold] = useState(25);
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Set default zone selection
  React.useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ruleName.trim() || !selectedZoneId) return;

    setIsLoading(true);
    try {
      await onCreateRule({
        zoneId: selectedZoneId,
        name: ruleName,
        sensorType,
        operator,
        thresholdValue: parseFloat(threshold),
        durationMinutes: parseInt(duration)
      });
      
      const zoneName = zones.find(z => z.id === selectedZoneId)?.name || 'cuadrante';
      onTriggerAlert(`Regla Creada: "${ruleName}" para activar riego si humedad < ${threshold}% en ${zoneName}.`);
      setRuleName('');
    } catch (err) {
      console.error(err);
      onTriggerAlert("Error al guardar la regla automática.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await onDeleteRule(id);
      onTriggerAlert(`Regla Eliminada: "${name}"`);
    } catch (err) {
      console.error(err);
      onTriggerAlert("Error al eliminar la regla.");
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      
      {/* Rules Editor & List */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <ToggleLeft size={18} color="var(--color-moisture)" /> Programador de Reglas de Riego (IFTTT)
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.82rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.6rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Nombre de la Regla:</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. Riego Preventivo Norte" 
                value={ruleName} 
                onChange={e => setRuleName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Cuadrante:</label>
              <select 
                className="form-select" 
                value={selectedZoneId}
                onChange={e => setSelectedZoneId(e.target.value)}
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Sensor Condición:</label>
              <select className="form-select" value={sensorType} disabled>
                <option value="SOIL_MOISTURE">Humedad de Suelo</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Operador:</label>
              <select className="form-select" value={operator} onChange={e => setOperator(e.target.value)}>
                <option value="LT">Menor que (&lt;)</option>
                <option value="GT">Mayor que (&gt;)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Umbral (%):</label>
              <input 
                type="number" 
                className="form-input" 
                min="0" 
                max="100" 
                value={threshold} 
                onChange={e => setThreshold(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.6rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Duración Riego (min):</label>
              <input 
                type="number" 
                className="form-input" 
                min="5" 
                max="180" 
                value={duration} 
                onChange={e => setDuration(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', height: '36px' }}
              disabled={isLoading || !ruleName.trim()}
            >
              Guardar Regla Automática
            </button>
          </div>
        </form>

        <h3 style={{ fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Reglas Programadas Activas ({rules.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '250px', paddingRight: '4px' }}>
          {rules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No hay automatizaciones de riego guardadas. El aspersor solo responderá a control manual.
            </div>
          ) : (
            rules.map(rule => {
              const zoneName = zones.find(z => z.id === rule.zoneId)?.name || 'Cuadrante';
              return (
                <div key={rule.id} className="rule-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                    <strong>{rule.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      SI {rule.sensorType === 'SOIL_MOISTURE' ? 'Humedad' : rule.sensorType} {rule.operator === 'LT' ? '<' : '>'} {rule.thresholdValue}% 
                      ENTONCES Regar {rule.durationMinutes} min en {zoneName}
                    </span>
                  </div>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '0.25rem 0.5rem', borderColor: 'var(--color-valve-closed)', color: 'var(--color-valve-closed)' }}
                    onClick={() => handleDelete(rule.id, rule.name)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Huella Hídrica & Crop Health Penalty */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Droplets size={18} color="var(--color-moisture)" /> Rastreador de Huella Hídrica y Balance
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.82rem' }}>
          
          <div style={{ background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Agua de Riego Utilizada:
            </span>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-moisture)', fontFamily: 'monospace' }}>
              {Math.round(kpis.waterConsumed).toLocaleString()} L
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              * Cada minuto de aspersores activos aumenta la huella hídrica y reduce la eficiencia en el reporte de evaluación.
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Índice de Salud de Cultivos:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
              <Heart size={20} color="var(--color-valve-open)" fill="var(--color-valve-open)" />
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-valve-open)', fontFamily: 'monospace' }}>
                {kpis.cropHealth}%
              </span>
            </div>
          </div>

          {/* Stressed or over-consumption penalty warnings */}
          {kpis.cropHealth < 85 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid var(--color-valve-closed)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              gap: '0.5rem',
              color: '#f87171'
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ fontSize: '0.75rem' }}>Pérdida de Rendimiento de Cultivos</strong>
                <p style={{ fontSize: '0.68rem', lineHeight: '1.3' }}>
                  El suelo ha permanecido en niveles críticos de sequedad por demasiado tiempo. El rendimiento proyectado de la cosecha se reduce. ¡Ajusta los umbrales de humedad de las reglas!
                </p>
              </div>
            </div>
          )}

          {kpis.waterConsumed > 3500 && (
            <div style={{
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid var(--color-temp)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              gap: '0.5rem',
              color: '#facc15'
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ fontSize: '0.75rem' }}>Desperdicio Excesivo de Recurso Hídrico</strong>
                <p style={{ fontSize: '0.68rem', lineHeight: '1.3' }}>
                  Has superado el presupuesto hídrico óptimo del predio. Tu calificación de eficiencia hídrica decaerá en la evaluación. Optimiza la duración de los riegos.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default RulesManager;
