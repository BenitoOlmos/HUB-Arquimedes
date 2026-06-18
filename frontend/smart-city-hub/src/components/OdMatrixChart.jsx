import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export default function OdMatrixChart({ matrixData }) {
  const origins = ['MAIPU', 'PUENTE-ALTO', 'PUDAHUEL', 'HUECHURABA'];
  const destinations = ['CENTRO', 'PROVIDENCIA', 'LAS-CONDES'];

  // Calculate cell styling based on passenger count density
  const getCellData = (origin, dest) => {
    const cell = matrixData?.find((c) => c.origin === origin && c.destination === dest);
    return cell ? cell.count : 0;
  };

  // Find max count for relative coloring
  let maxCount = 1;
  matrixData?.forEach((c) => {
    if (c.count > maxCount) maxCount = c.count;
  });

  return (
    <div className="grid-cols-12">
      {/* OD Matrix Grid Heatmap */}
      <div
        className="glass-card"
        style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
            Matriz Origen-Destino (O-D Matrix)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Densidad de viajes diarios calculada a partir de los puntos de validación bip! matutinos
            y vespertinos.
          </p>
        </div>

        {/* Heat Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            width: '100%',
            padding: '0.5rem'
          }}
        >
          {/* Header Row (Destinations) */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '120px repeat(3, 1fr)', gap: '0.5rem' }}
          >
            <div
              className="od-header"
              style={{ alignSelf: 'center', textAlign: 'left', fontWeight: 'bold' }}
            >
              Origen \ Destino
            </div>
            {destinations.map((d) => (
              <div
                key={d}
                className="od-header"
                style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Matrix Rows (Origins) */}
          {origins.map((origin) => (
            <div
              key={origin}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(3, 1fr)',
                gap: '0.5rem',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#a5b4fc',
                  textTransform: 'uppercase'
                }}
              >
                {origin}
              </div>

              {destinations.map((dest) => {
                const count = getCellData(origin, dest);
                const ratio = count / maxCount;
                // Scale cyan background based on count ratio
                const bgColor = `rgba(6, 182, 212, ${0.1 + ratio * 0.7})`;
                const textColor = ratio > 0.5 ? '#04060b' : '#fff';

                return (
                  <div
                    key={dest}
                    className="od-cell"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      fontWeight: 'bold',
                      border: '1px solid rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    <span>{count}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>viajes</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Explanations Panel */}
      <div
        className="glass-card"
        style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Análisis Geodemográfico</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Interpretación sociológica del tránsito
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h4
              style={{
                color: '#fff',
                fontSize: '0.9rem',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <ArrowRight size={14} className="logo-icon" />
              Migración Centro-Periferia
            </h4>
            Los datos revelan que más del 70% de las validaciones de la mañana se originan en
            comunas residenciales periféricas (Maipú, Puente Alto) con destino directo a centros de
            servicios y negocios (Providencia, Las Condes).
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h4
              style={{
                color: '#fff',
                fontSize: '0.9rem',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <ArrowRight size={14} className="logo-icon" />
              Equidad e Infraestructura
            </h4>
            El tiempo medio de viaje para residentes de Puente Alto y Maipú supera los 60 minutos en
            hora punta. La optimización del corredor de buses es crucial para reducir la brecha de
            tiempos de traslado urbano.
          </div>

          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
              borderLeft: '3px solid var(--color-warning)',
              padding: '0.75rem',
              borderRadius: '4px'
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#fbbf24',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                marginBottom: '0.25rem'
              }}
            >
              <AlertTriangle size={14} />
              Recomendación de Planificación:
            </span>
            Si las vías registran alta densidad (color rojo en el mapa), rediseñe la prioridad en
            los semáforos aledaños ampliando la fase de luz verde.
          </div>
        </div>
      </div>
    </div>
  );
}
