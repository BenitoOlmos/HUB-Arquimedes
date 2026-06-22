import React, { useEffect, useState } from 'react';
import { Droplet, Thermometer, Sun, Activity, Settings, Eye } from 'lucide-react';

const FarmGlobe = ({ zones, onToggleValve, onTriggerAlert, isLoading }) => {
  const [selectedZone, setSelectedZone] = useState(null);

  // Auto-select first zone if none selected
  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0]);
    } else if (zones.length > 0 && selectedZone) {
      const updated = zones.find((z) => z.id === selectedZone.id);
      if (updated) setSelectedZone(updated);
    }
  }, [zones]);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.5rem' }}>
        {/* Left Panel Skeleton */}
        <div
          className="glass-panel skeleton-pulse"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minHeight: '480px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <div
              className="skeleton-block"
              style={{
                height: '20px',
                width: '200px',
                backgroundColor: '#E2E8F0',
                borderRadius: '4px'
              }}
            ></div>
            <div
              className="skeleton-block"
              style={{
                height: '15px',
                width: '150px',
                backgroundColor: '#E2E8F0',
                borderRadius: '4px'
              }}
            ></div>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flexGrow: 1 }}
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="skeleton-block"
                style={{ height: '170px', borderRadius: '12px', background: '#E2E8F0' }}
              ></div>
            ))}
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <div
          className="glass-panel skeleton-pulse"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '480px',
            padding: '1.5rem',
            gap: '1rem'
          }}
        >
          <div
            className="skeleton-block"
            style={{
              height: '24px',
              width: '120px',
              marginBottom: '1rem',
              backgroundColor: '#E2E8F0',
              borderRadius: '4px'
            }}
          ></div>
          <div
            className="skeleton-block"
            style={{
              height: '14px',
              width: '160px',
              marginBottom: '1.5rem',
              backgroundColor: '#E2E8F0',
              borderRadius: '4px'
            }}
          ></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="skeleton-block"
                style={{ height: '60px', borderRadius: '8px', background: '#E2E8F0' }}
              ></div>
            ))}
          </div>
          <div
            className="skeleton-block"
            style={{
              height: '40px',
              marginTop: 'auto',
              borderRadius: '6px',
              background: '#E2E8F0'
            }}
          ></div>
        </div>
      </div>
    );
  }

  const getMoistureColor = (val) => {
    if (val < 20)
      return { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', label: 'Seco (Estrés)' };
    if (val < 40) return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706', label: 'Moderado' };
    return { bg: '#dcfce7', border: '#10b981', text: '#15803d', label: 'Óptimo' };
  };

  const handleToggleValveState = (valveId, currentStatus) => {
    const nextStatus = currentStatus === 'ABIERTA' ? 'CERRADA' : 'ABIERTA';
    onToggleValve(valveId, nextStatus);
    onTriggerAlert(`Comando Domótico: Válvula ${valveId} establecida en ${nextStatus}`);
  };

  const getSensorIcon = (type) => {
    if (type === 'SOIL_MOISTURE') return <Droplet size={14} color="#0ea5e9" />;
    if (type === 'PH') return <Activity size={14} color="#a855f7" />;
    if (type === 'TEMPERATURE') return <Thermometer size={14} color="#f59e0b" />;
    return <Sun size={14} color="#f97316" />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.5rem' }}>
      {/* 2D Landscape Grid */}
      <div
        className="glass-panel slide-in-left-panel"
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
            <Eye size={18} />
            <span>Plano 2D del Terreno Agrícola</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }}
              ></span>
              Estrés (&lt;20%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }}
              ></span>
              Humedad (20%-40%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}
              ></span>
              Óptimo (&gt;40%)
            </span>
          </div>
        </div>

        {/* Interactive 2x2 map grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
            flexGrow: 1,
            minHeight: '380px',
            background: '#F8F9FA',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}
        >
          {zones.map((zone) => {
            const moistureSensor = zone.sensors.find((s) => s.type === 'SOIL_MOISTURE');
            const moistureVal = moistureSensor ? moistureSensor.currentValue : 40;
            const statusStyle = getMoistureColor(moistureVal);
            const isSelected = selectedZone?.id === zone.id;
            const isValveOpen = zone.valves.some((v) => v.status === 'ABIERTA');

            const isAlert = moistureVal < 40;
            const cardBg = isAlert
              ? isSelected
                ? '#faf5f0'
                : '#F4EAE1'
              : isSelected
                ? '#e3ece8'
                : '#D8E2DC';
            const cardBorder = isSelected
              ? isAlert
                ? '2px solid #92400E'
                : '2px solid #3B6653'
              : '1px solid var(--border-glass)';

            return (
              <div
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone);
                  onTriggerAlert(`Predio Seleccionado: ${zone.name}`);
                }}
                style={{
                  background: cardBg,
                  border: cardBorder,
                  boxShadow: isSelected
                    ? '0 4px 12px rgba(0, 0, 0, 0.04)'
                    : '0 2px 4px rgba(0, 0, 0, 0.015)',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Visual moisture level border overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: statusStyle.border
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {zone.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Cultivo: {zone.cropType}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '20px',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      border: `1px solid ${statusStyle.border}`
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                {/* Center plant/field visual */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '1rem 0',
                    flexGrow: 1,
                    position: 'relative'
                  }}
                >
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Dirt base */}
                    <path
                      d="M2 20C6 21 18 21 22 20"
                      stroke="#78350f"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Plant stem */}
                    <path
                      d="M12 20C12 15 11 11 12 6"
                      stroke={moistureVal < 20 ? '#854d0e' : '#10b981'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    {/* Leaves */}
                    <path
                      d="M12 14C14 13 16 11 17 12C18 13 15 15 12 16"
                      fill={moistureVal < 20 ? 'rgba(133, 77, 14, 0.4)' : 'rgba(34, 197, 94, 0.4)'}
                      stroke={moistureVal < 20 ? '#854d0e' : '#22c55e'}
                      strokeWidth="1.2"
                    />
                    <path
                      d="M12 10C10 9 8 7 7 8C6 9 9 11 12 12"
                      fill={moistureVal < 20 ? 'rgba(133, 77, 14, 0.4)' : 'rgba(34, 197, 94, 0.4)'}
                      stroke={moistureVal < 20 ? '#854d0e' : '#22c55e'}
                      strokeWidth="1.2"
                    />
                  </svg>

                  {/* Sprinkler system visual indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isValveOpen
                          ? 'rgba(14, 165, 233, 0.1)'
                          : 'rgba(148, 163, 184, 0.1)',
                        border: `1px solid ${isValveOpen ? '#0ea5e9' : 'rgba(148, 163, 184, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Droplet
                        size={12}
                        color={isValveOpen ? '#0ea5e9' : '#94a3b8'}
                        className={isValveOpen ? 'animate-pulse' : ''}
                      />
                    </div>
                    {isValveOpen && (
                      <span
                        className="spray-drizzle"
                        style={{
                          fontSize: '0.55rem',
                          fontWeight: 'bold',
                          color: '#0ea5e9',
                          marginTop: '2px',
                          animation: 'flash-text 1s infinite alternate'
                        }}
                      >
                        RIEGO
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span>
                    Humedad: <strong>{moistureVal.toFixed(1)}%</strong>
                  </span>
                  <span>
                    Aspersor:{' '}
                    <strong style={{ color: isValveOpen ? '#10b981' : '#ef4444' }}>
                      {isValveOpen ? 'ON' : 'OFF'}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected zone details */}
      <div
        className="glass-panel slide-in-right-panel"
        style={{ display: 'flex', flexDirection: 'column', height: '480px' }}
      >
        {selectedZone ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
              className="panel-header"
              style={{ marginBottom: '0.8rem', paddingBottom: '0.5rem' }}
            >
              <div className="panel-title" style={{ fontSize: '1rem' }}>
                <Settings size={18} color="var(--accent-blue)" />
                <span>{selectedZone.name}</span>
              </div>
            </div>

            <div
              style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}
            >
              Variedad de Cultivo: <strong>{selectedZone.cropType}</strong>
            </div>

            {/* Live Sensors Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}
            >
              {selectedZone.sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: 'var(--shadow-premium)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      fontWeight: 'bold'
                    }}
                  >
                    {getSensorIcon(sensor.type)}
                    {sensor.type.replace('_', ' ')}
                  </div>
                  <span
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {sensor.currentValue.toFixed(1)}
                    {sensor.type === 'SOIL_MOISTURE' && '%'}
                    {sensor.type === 'TEMPERATURE' && '°C'}
                    {sensor.type === 'RADIATION' && ' W/m²'}
                    {sensor.type === 'PH' && ' pH'}
                  </span>
                </div>
              ))}
            </div>

            {/* Domotics Irrigation electrovalve controls */}
            {selectedZone.valves.map((valve) => (
              <div
                key={valve.id}
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifySelf: 'flex-end',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Aspersores Domóticos:
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: valve.status === 'ABIERTA' ? '#10b981' : '#ef4444',
                      fontSize: '0.8rem',
                      backgroundColor:
                        valve.status === 'ABIERTA'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      border: `1px solid ${valve.status === 'ABIERTA' ? '#10b981' : '#ef4444'}`
                    }}
                  >
                    {valve.status}
                  </span>
                </div>

                <button
                  className={valve.status === 'ABIERTA' ? 'btn-danger' : 'btn-primary'}
                  style={{ justifyContent: 'center', width: '100%' }}
                  onClick={() => handleToggleValveState(valve.id, valve.status)}
                >
                  {valve.status === 'ABIERTA' ? 'Cerrar Electroválvula' : 'Abrir Electroválvula'}
                </button>
              </div>
            ))}
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
            Cargando cuadrantes del terreno...
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmGlobe;
