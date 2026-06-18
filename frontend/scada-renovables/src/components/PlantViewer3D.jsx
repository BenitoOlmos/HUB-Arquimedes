import React, { useState } from 'react';
import { Wind, Sun, Power, Activity, Settings } from 'lucide-react';

export default function PlantViewer3D({ assets, breakers }) {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const getStatusColor = (tagId, status) => {
    if (!breakers[tagId])
      return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', label: 'OFFLINE' };
    if (status === 'FAULT')
      return { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', label: 'FALLA' };
    if (status === 'MAINTENANCE')
      return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706', label: 'MANTENIMIENTO' };
    return { bg: '#dcfce7', border: '#10b981', text: '#15803d', label: 'ONLINE' };
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2.2fr 1fr',
        gap: '1.5rem',
        width: '100%',
        height: '100%',
        minHeight: '450px'
      }}
    >
      {/* 2D Mimic Map of the Plant */}
      <div
        className="glass-panel"
        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              color: 'var(--accent-blue)'
            }}
          >
            <Activity size={18} />
            <span>Mímico de Equipos en Planta (2D)</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            * Haz clic en cualquier equipo para inspeccionar sus telemetrías y parámetros.
          </div>
        </div>

        {/* 2D mimic layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            flexGrow: 1,
            background: 'rgba(15, 23, 42, 0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}
        >
          {assets.map((asset) => {
            const statusStyle = getStatusColor(asset.tagId, asset.status);
            const isSelected = selectedAsset?.tagId === asset.tagId;
            const rpm = asset.telemetry['RPM'] || 0;
            const isTurbine = asset.assetType === 'WIND_TURBINE';
            const isSolar = asset.assetType === 'SOLAR_ARRAY';

            const animationDuration = rpm > 0 ? `${60 / rpm}s` : '0s';

            return (
              <div
                key={asset.tagId}
                onClick={() => setSelectedAsset(asset)}
                style={{
                  background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                  border: isSelected
                    ? '2px solid var(--accent-blue)'
                    : '1px solid var(--border-glass)',
                  boxShadow: isSelected ? 'var(--shadow-hover)' : 'var(--shadow-premium)',
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: statusStyle.border
                  }}
                />

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}
                >
                  {asset.tagId}
                </div>

                {/* Animated graphic based on type */}
                <div
                  style={{
                    margin: '0.75rem 0',
                    position: 'relative',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isTurbine ? (
                    <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                      <Wind
                        size={40}
                        color={
                          breakers[asset.tagId] && asset.status !== 'FAULT' ? '#0ea5e9' : '#94a3b8'
                        }
                        style={{
                          transformOrigin: 'center',
                          animation: rpm > 0 ? `spin ${animationDuration} linear infinite` : 'none',
                          transition: 'transform 0.5s ease'
                        }}
                      />
                      {/* Wind Turbine Mast */}
                      <div
                        style={{
                          width: '3px',
                          height: '24px',
                          backgroundColor: '#94a3b8',
                          position: 'absolute',
                          bottom: '-12px',
                          left: '18px',
                          zIndex: -1
                        }}
                      />
                    </div>
                  ) : isSolar ? (
                    <Sun
                      size={42}
                      color={
                        breakers[asset.tagId] && asset.status !== 'FAULT' ? '#f59e0b' : '#94a3b8'
                      }
                      style={{ animation: rpm > 0 ? 'pulse 2s infinite' : 'none' }}
                    />
                  ) : (
                    <Power
                      size={36}
                      color={
                        breakers[asset.tagId] && asset.status !== 'FAULT' ? '#10b981' : '#94a3b8'
                      }
                    />
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    color: statusStyle.text,
                    backgroundColor: statusStyle.bg,
                    border: `1px solid ${statusStyle.border}`,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginTop: '0.5rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {statusStyle.label}
                </div>

                {/* Micro telemetry view */}
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.5rem'
                  }}
                >
                  {asset.telemetry['POWER'] !== undefined
                    ? `${asset.telemetry['POWER'].toFixed(1)} MW`
                    : '0.0 MW'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Asset Details */}
      <div
        className="glass-panel"
        style={{ display: 'flex', flexDirection: 'column', height: '480px' }}
      >
        {selectedAsset ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {selectedAsset.tagId}
            </div>
            <div
              style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '4px' }}
            >
              Tipo: <strong>{selectedAsset.assetType}</strong>
            </div>
            <div
              style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '12px' }}
            >
              Ubicación: <strong>{selectedAsset.location}</strong>
            </div>

            <div
              style={{
                borderTop: '1px dashed var(--border-glass)',
                paddingTop: '10px',
                marginTop: '10px'
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  color: 'var(--accent-blue)',
                  fontSize: '0.75rem',
                  marginBottom: '8px',
                  letterSpacing: '0.5px'
                }}
              >
                TELEMETRÍA DE HMI:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.entries(selectedAsset.telemetry).map(([param, val]) => (
                  <div
                    key={param}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      background: 'rgba(15, 23, 42, 0.02)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{param}:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{val}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '6rem 0',
              fontSize: '0.85rem'
            }}
          >
            Selecciona un equipo de la planta para ver telemetría detallada.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
