import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function TrafficLightController({ intersections, onUpdateIntersection }) {
  const [selectedInterId, setSelectedInterId] = useState('');
  const [greenPhase, setGreenPhase] = useState(40);
  const [redPhase, setRedPhase] = useState(40);
  const [offset, setOffset] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeInter = intersections?.find((i) => i.id === selectedInterId) || intersections?.[0];

  const handleSelectIntersection = (inter) => {
    setSelectedInterId(inter.id);
    setGreenPhase(inter.greenPhase);
    setRedPhase(inter.redPhase);
    setOffset(inter.offset);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!activeInter) {
      setErrorMsg('Seleccione una intersección válida.');
      return;
    }

    try {
      await onUpdateIntersection(activeInter.id, greenPhase, redPhase, offset);
      setSuccessMsg('Intersección actualizada correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Error al guardar: ' + err.message);
    }
  };

  return (
    <div className="grid-cols-12">
      {/* Intersection Listing */}
      <div
        className="glass-card"
        style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
            Configuración de Intersecciones (Semáforos)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Seleccione una intersección para modificar sus fases o sincronizar la Onda Verde.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '380px',
            overflowY: 'auto'
          }}
        >
          {intersections?.map((inter) => {
            const isActive = activeInter?.id === inter.id;
            return (
              <div
                key={inter.id}
                className={`intersection-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectIntersection(inter)}
              >
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{inter.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Fase Verde: {inter.greenPhase}s | Roja: {inter.redPhase}s | Desfase:{' '}
                    {inter.offset}s
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <span className="light-indicator pulse-green" style={{ color: '#10b981' }}></span>
                  <span className="light-indicator pulse-red" style={{ color: '#f43f5e' }}></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Onda Verde Help Box */}
        <div
          style={{
            border: '1px solid #1e293b',
            backgroundColor: '#090e1a',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            color: 'var(--text-secondary)'
          }}
        >
          <Info size={18} style={{ color: 'var(--color-cyan)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '0.25rem' }}>
              Consejo de Optimización (Onda Verde):
            </strong>
            Para sincronizar los semáforos consecutivos en la Alameda (Las Rejas &rarr; Velásquez
            &rarr; Estación Central &rarr; Santa Lucía), los desfases (offsets) ideales deben
            configurarse de forma secuencial (ej. 0s, 5s, 10s, 15s) para permitir el flujo
            ininterrumpido a velocidad crucero.
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div
        className="glass-card"
        style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Panel de Calibración</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {activeInter ? `Editando: ${activeInter.name}` : 'Seleccione una intersección'}
          </p>
        </div>

        {activeInter ? (
          <form
            onSubmit={handleSave}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Fase Luz Verde (Segundos)
              </label>
              <input
                type="number"
                className="form-input"
                min="10"
                max="120"
                value={greenPhase}
                onChange={(e) => setGreenPhase(Number(e.target.value))}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Fase Luz Roja (Segundos)
              </label>
              <input
                type="number"
                className="form-input"
                min="10"
                max="120"
                value={redPhase}
                onChange={(e) => setRedPhase(Number(e.target.value))}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Desfase / Offset (Segundos)
              </label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="90"
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Desfase de tiempo relativo al reloj patrón global.
              </span>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  color: '#34d399',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <CheckCircle size={18} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  color: '#fb7185',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(244, 63, 94, 0.2)'
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ justifyContent: 'center', marginTop: '0.5rem' }}
            >
              <Save size={18} />
              Guardar Configuración
            </button>
          </form>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            Haga clic en una intersección de la izquierda para editar.
          </div>
        )}
      </div>
    </div>
  );
}
