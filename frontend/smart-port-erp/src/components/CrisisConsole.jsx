import React, { useState } from 'react';
import {
  CloudLightning,
  Flame,
  AlertOctagon,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  XCircle
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Tifón en el Pacífico',
    type: 'CLIMA',
    region: 'Océano Pacífico',
    severity: 4,
    description:
      'Crea oleaje extremo y vientos huracanados. Dificulta el tránsito de la ruta Shanghai - Los Ángeles.'
  },
  {
    name: 'Bloqueo Canal de Suez',
    type: 'CLIMA',
    region: 'Canal de Suez',
    severity: 5,
    description:
      'Cierre temporal del paso por encallamiento. Obliga a desviar buques aproximándose a Europa/Asia vía Cabo.'
  },
  {
    name: 'Huelga en Canal de Panamá',
    type: 'HUELGA',
    region: 'Canal de Panamá',
    severity: 4,
    description:
      'Paralización aduanera y de esclusas. Interrumpe el flujo comercial de la costa oeste/este.'
  },
  {
    name: 'Piratería - Cuerno de África',
    type: 'PIRATERIA',
    region: 'Golfo de Adén',
    severity: 3,
    description: 'Incremento de amenazas de seguridad. Eleva tarifas de seguros y costos diarios.'
  },
  {
    name: 'Huelga de Estibadores en Los Ángeles',
    type: 'HUELGA',
    region: 'Los Angeles',
    severity: 5,
    description:
      'Operaciones del puerto congeladas. Los buques acumulan demoras (demurrage) por descarga.'
  }
];

const CrisisConsole = ({ activeCrises, onTriggerEvent, onResolveAll, onTriggerAlert }) => {
  const [customType, setCustomType] = useState('CLIMA');
  const [customRegion, setCustomRegion] = useState('');
  const [customSeverity, setCustomSeverity] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const handleTriggerPreset = async (preset) => {
    setIsLoading(true);
    try {
      await onTriggerEvent({
        eventType: preset.type,
        severity: preset.severity,
        affectedRegion: preset.region
      });
      onTriggerAlert(
        `Crisis Activada: ${preset.name} (${preset.region}). Nivel de impacto: ${preset.severity}/5`
      );
    } catch (err) {
      console.error(err);
      onTriggerAlert('Error al inyectar la crisis en el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customRegion.trim()) return;

    setIsLoading(true);
    try {
      await onTriggerEvent({
        eventType: customType,
        severity: parseInt(customSeverity),
        affectedRegion: customRegion
      });
      onTriggerAlert(
        `Crisis Personalizada: ${customType} en ${customRegion} (Severidad ${customSeverity}/5)`
      );
      setCustomRegion('');
    } catch (err) {
      console.error(err);
      onTriggerAlert('Error al inyectar crisis personalizada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    setIsLoading(true);
    try {
      await onResolveAll();
      onTriggerAlert('Todas las crisis globales activas han sido resueltas. Rutas despejadas.');
    } catch (err) {
      console.error(err);
      onTriggerAlert('Error al resolver las crisis.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (sev) => {
    if (sev >= 5) return 'var(--color-held)';
    if (sev >= 4) return 'var(--color-anchor)';
    return 'var(--color-route)';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      {/* Active Crises and Presets */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <ShieldAlert size={18} color="var(--color-held)" /> Consola del Docente e Inyección de
            Crisis
          </div>
          <button
            className="btn-danger"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            onClick={handleResolve}
            disabled={isLoading}
          >
            <XCircle size={14} /> Resolver Todo
          </button>
        </div>

        <h3
          style={{
            fontSize: '0.85rem',
            marginBottom: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-secondary)'
          }}
        >
          Disrupciones Globales Disponibles (Presets)
        </h3>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            overflowY: 'auto',
            maxHeight: '420px',
            paddingRight: '4px'
          }}
        >
          {PRESETS.map((preset, index) => {
            const isAlreadyActive = activeCrises.some((c) => c.includes(preset.region));

            return (
              <div
                key={index}
                className="kanban-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  borderLeft: `3px solid ${isAlreadyActive ? 'var(--color-held)' : 'var(--text-muted)'}`,
                  opacity: isAlreadyActive ? 0.6 : 1
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{preset.name}</span>
                  <span
                    className="incoterm-badge"
                    style={{
                      color: getSeverityColor(preset.severity),
                      borderColor: getSeverityColor(preset.severity)
                    }}
                  >
                    SEV: {preset.severity}/5
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {preset.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '6px'
                  }}
                >
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Zona: {preset.region} | Tipo: {preset.type}
                  </span>
                  <button
                    className="btn-primary"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.68rem',
                      background: isAlreadyActive ? 'var(--text-muted)' : 'var(--accent-cyan)',
                      color: isAlreadyActive ? 'var(--text-secondary)' : 'var(--bg-darker)'
                    }}
                    onClick={() => handleTriggerPreset(preset)}
                    disabled={isLoading || isAlreadyActive}
                  >
                    {isAlreadyActive ? 'Activo' : 'Inyectar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Trigger Console */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Sparkles size={18} color="var(--accent-cyan)" /> Inyector de Crisis Manual
          </div>
        </div>

        <form
          onSubmit={handleCustomSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem' }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Tipo de Evento:
            </label>
            <select
              className="form-select"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
            >
              <option value="CLIMA">CLIMA (Tormenta, Tifón, Ciclón)</option>
              <option value="HUELGA">HUELGA (Estibadores, Aduaneros)</option>
              <option value="PIRATERIA">PIRATERIA / TERRORISMO</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Región o Canal Afectado:
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Canal de Suez, Cabo de Hornos..."
              value={customRegion}
              onChange={(e) => setCustomRegion(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Severidad (1 a 5):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min="1"
                max="5"
                value={customSeverity}
                onChange={(e) => setCustomSeverity(e.target.value)}
                style={{ flexGrow: 1, accentColor: 'var(--accent-cyan)' }}
              />
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: getSeverityColor(customSeverity),
                  minWidth: '20px',
                  textAlign: 'center'
                }}
              >
                {customSeverity}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              1 = Demora mínima. 5 = Bloqueo total de la ruta marítima / puerto.
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={isLoading || !customRegion.trim()}
          >
            Inyectar Disrupción
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '0.75rem'
          }}
        >
          <strong
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-anchor)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '4px'
            }}
          >
            <AlertOctagon size={12} /> Nota Pedagógica:
          </strong>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
            Cuando inyectas un bloqueo en el <strong>Canal de Suez</strong>, la simulación del
            backend detendrá los barcos cercanos. Los alumnos deberán usar la interfaz de Telemetría
            para <strong>Desviar el Buque</strong> hacia la ruta alterna (Cabo de Buena Esperanza),
            lo que aumentará su costo diario en un 35% pero mantendrá la carga en movimiento para
            evitar multas por demora.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrisisConsole;
