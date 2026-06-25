import React from 'react';
import { Clock, AlertTriangle, RotateCcw, Activity, Award, BookOpen } from 'lucide-react';

export default function CalculadoraConfiabilidad({
  equipmentName,
  equipmentTag,
  data,
  onChange,
  onReset,
  isTeacherScenario
}) {
  const { tiempoOperativo, tiempoReparacion, numFallas } = data;

  // Lógica de cálculo de indicadores de confiabilidad
  const calcMetrics = () => {
    const op = parseFloat(tiempoOperativo) || 0;
    const rep = parseFloat(tiempoReparacion) || 0;
    const f = parseInt(numFallas) || 0;

    let mtbfValue = null;
    let mttrValue = null;
    let availabilityValue = 100;

    if (f > 0) {
      mtbfValue = op / f;
      mttrValue = rep / f;
      availabilityValue = (mtbfValue / (mtbfValue + mttrValue)) * 100;
    } else {
      if (op + rep > 0) {
        availabilityValue = (op / (op + rep)) * 100;
      } else {
        availabilityValue = 100;
      }
    }

    return {
      mtbf: mtbfValue !== null ? mtbfValue.toFixed(1) : 'N/A',
      mttr: mttrValue !== null ? mttrValue.toFixed(1) : 'N/A',
      disponibilidad: availabilityValue.toFixed(1),
      dispNum: availabilityValue
    };
  };

  const { mtbf, mttr, disponibilidad, dispNum } = calcMetrics();

  // Escoger color para la disponibilidad física
  // >= 95% -> verde, >= 90% -> amarillo/naranja, < 90% -> rojo
  const getAvailabilityColorClass = (val) => {
    if (val >= 95)
      return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' };
    if (val >= 90)
      return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' };
    return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' };
  };

  const colorStyles = getAvailabilityColorClass(dispNum);

  return (
    <div
      className="reliability-calculator-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Activity size={18} className="text-accent" />
          Calculador de Confiabilidad
        </h4>
        {isTeacherScenario && (
          <span
            className="badge"
            style={{
              fontSize: '0.68rem',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--text-accent)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Escenario Docente
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Modifica los parámetros operativos para calcular los KPIs de confiabilidad en tiempo real
        para{' '}
        <strong>
          {equipmentName} ({equipmentTag})
        </strong>
        .
      </p>

      {/* INPUTS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            Tiempo Servicio Operativo (Horas)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              min="0"
              value={tiempoOperativo}
              onChange={(e) => onChange('tiempoOperativo', e.target.value)}
              className="form-control"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: '12px',
                top: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              hrs
            </span>
          </div>
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
              Inactividad / Reparación
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                value={tiempoReparacion}
                onChange={(e) => onChange('tiempoReparacion', e.target.value)}
                className="form-control"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                hrs
              </span>
            </div>
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
              Número de Fallas
            </label>
            <input
              type="number"
              min="0"
              value={numFallas}
              onChange={(e) => onChange('numFallas', e.target.value)}
              className="form-control"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* OUTPUTS KPI CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* MTBF Card */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              MTBF
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mtbf}</span>
              {mtbf !== 'N/A' && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>hrs/falla</span>
              )}
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              T. Medio Entre Fallas
            </span>
          </div>

          {/* MTTR Card */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              MTTR
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mttr}</span>
              {mttr !== 'N/A' && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>hrs/rep</span>
              )}
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              T. Medio de Reparación
            </span>
          </div>
        </div>

        {/* Physical Availability Card */}
        <div
          style={{
            padding: '14px',
            backgroundColor: colorStyles.bg,
            border: `1.5px solid ${colorStyles.border}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                display: 'block'
              }}
            >
              Disponibilidad Física
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {dispNum >= 95
                ? 'Excelente confiabilidad'
                : dispNum >= 90
                  ? 'Atención / Holgura baja'
                  : 'Crítico: Requiere acción'}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: colorStyles.text }}>
              {disponibilidad}%
            </span>
          </div>
        </div>
      </div>

      {/* RESET ACTION */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
        <button
          onClick={onReset}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '0.72rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <RotateCcw size={12} />
          <span>Restablecer</span>
        </button>
      </div>
    </div>
  );
}
