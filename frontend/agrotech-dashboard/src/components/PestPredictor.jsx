import React, { useState, useEffect } from 'react';
import { ShieldAlert, BookOpen, Brain, Bell, AlertTriangle } from 'lucide-react';

const PestPredictor = ({ zones, pestHistory, onTriggerAlert, isLoading }) => {
  const [minTemp, setMinTemp] = useState(14);
  const [maxTemp, setMaxTemp] = useState(22);
  const [minHumidity, setMinHumidity] = useState(78);
  const [predictions, setPredictions] = useState([]);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Left Panel Skeleton */}
        <div
          className="glass-panel skeleton-pulse"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            gap: '1rem',
            minHeight: '450px'
          }}
        >
          <div
            className="skeleton-block"
            style={{
              height: '20px',
              width: '250px',
              marginBottom: '1rem',
              backgroundColor: '#E2E8F0',
              borderRadius: '4px'
            }}
          ></div>
          <div
            className="skeleton-block"
            style={{
              height: '14px',
              width: '100%',
              marginBottom: '1.5rem',
              backgroundColor: '#E2E8F0',
              borderRadius: '4px'
            }}
          ></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              className="skeleton-block"
              style={{ height: '35px', borderRadius: '6px', backgroundColor: '#E2E8F0' }}
            ></div>
            <div
              className="skeleton-block"
              style={{ height: '35px', borderRadius: '6px', backgroundColor: '#E2E8F0' }}
            ></div>
          </div>
          <div
            className="skeleton-block"
            style={{
              height: '15px',
              width: '180px',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              backgroundColor: '#E2E8F0',
              borderRadius: '4px'
            }}
          ></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2].map((n) => (
              <div
                key={n}
                className="skeleton-block"
                style={{ height: '70px', borderRadius: '8px', background: '#E2E8F0' }}
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
            height: '450px',
            padding: '1.5rem',
            gap: '1rem'
          }}
        >
          <div
            className="skeleton-block"
            style={{
              height: '20px',
              width: '220px',
              marginBottom: '1.5rem',
              backgroundColor: '#E2E8F0',
              borderRadius: '4px'
            }}
          ></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="skeleton-block"
                style={{ height: '30px', borderRadius: '4px', background: '#E2E8F0' }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate live risks when threshold settings or zone sensors change
  useEffect(() => {
    const newPredictions = [];

    zones.forEach((zone) => {
      const tempSensor = zone.sensors.find((s) => s.type === 'TEMPERATURE');
      const humSensor = zone.sensors.find((s) => s.type === 'SOIL_MOISTURE'); // Humedad del suelo/ambiente correlacionada

      const currentTemp = tempSensor ? tempSensor.currentValue : 20;
      const currentHum = humSensor ? humSensor.currentValue : 40;

      // Basic rule evaluation
      const isInTempWindow = currentTemp >= minTemp && currentTemp <= maxTemp;
      const isInHumWindow = currentHum >= minHumidity;

      let risk = 'LOW';
      let probability = 10;
      let recommendation = 'Condiciones estables. No se requiere intervención química.';

      if (isInTempWindow && isInHumWindow) {
        risk = 'CRITICAL';
        probability = 90;
        recommendation = `¡PELIGRO! Condiciones altamente conductivas para Botrytis en ${zone.name}. Aplicar fungicida biológico preventivo de inmediato.`;
      } else if (isInTempWindow || isInHumWindow) {
        risk = 'MEDIUM';
        probability = 45;
        recommendation = `Monitoreo preventivo aconsejado en ${zone.name}. Incrementar ventilación del follaje.`;
      }

      newPredictions.push({
        zoneName: zone.name,
        pestName: 'Botrytis (Moho Gris)',
        risk,
        probability,
        currentTemp,
        currentHum,
        recommendation
      });
    });

    setPredictions(newPredictions);

    // Trigger alert if there's a critical threat
    const criticalZones = newPredictions.filter((p) => p.risk === 'CRITICAL');
    if (criticalZones.length > 0) {
      onTriggerAlert(
        `Alerta Fitosanitaria: Riesgo crítico de Botrytis detectado en ${criticalZones.map((z) => z.zoneName).join(', ')}.`
      );
    }
  }, [zones, minTemp, maxTemp, minHumidity]);

  const getRiskColor = (risk) => {
    if (risk === 'CRITICAL') return 'var(--color-valve-closed)';
    if (risk === 'MEDIUM') return 'var(--color-temp)';
    return 'var(--color-valve-open)';
  };

  const getRiskTagStyle = (risk) => {
    if (risk === 'CRITICAL') {
      return { bg: '#FEE2E2', text: '#991B1B', label: 'ALTO' };
    }
    if (risk === 'MEDIUM') {
      return { bg: '#FEF3C7', text: '#92400E', label: 'MEDIO' };
    }
    return { bg: '#D1FAE5', text: '#065F46', label: 'BAJO' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      {/* Blackbox ML Parameters & Live Risk */}
      <div
        className="glass-panel slide-in-left-panel"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div className="panel-header">
          <div className="panel-title">
            <Brain size={18} color="var(--color-ph)" /> Simulador de Predicción Fitosanitaria (ML)
          </div>
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}
        >
          Configura los umbrales climáticos del algoritmo predictor. Analiza los registros
          históricos de la derecha para calibrar la ventana exacta en que se incuban las plagas.
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '1rem',
            marginBottom: '1rem',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>
                Temp Mínima de Incubación (°C):
              </label>
              <input
                type="number"
                className="form-input"
                value={minTemp}
                onChange={(e) => setMinTemp(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>
                Temp Máxima de Incubación (°C):
              </label>
              <input
                type="number"
                className="form-input"
                value={maxTemp}
                onChange={(e) => setMaxTemp(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>
              Humedad Mínima de Suelo/Follaje (%):
            </label>
            <input
              type="number"
              className="form-input"
              value={minHumidity}
              onChange={(e) => setMinHumidity(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <h3
          style={{
            fontSize: '0.85rem',
            marginBottom: '0.65rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Alertas Preventivas Activas por Cuadrante
        </h3>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            overflowY: 'auto',
            maxHeight: '180px'
          }}
        >
          {predictions.map((p, idx) => {
            const tag = getRiskTagStyle(p.risk);
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-glass)',
                  background: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: '600', color: '#1E293B' }}>
                    {p.zoneName} - {p.pestName}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: tag.bg,
                      color: tag.text,
                      textTransform: 'uppercase'
                    }}
                  >
                    {tag.label}
                  </span>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  Condiciones: <strong>{p.currentTemp.toFixed(1)}°C</strong> | Humedad:{' '}
                  <strong>{p.currentHum.toFixed(1)}%</strong>
                </div>

                {/* Probability Horizontal Progress Bar */}
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.68rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span>Probabilidad de Brote</span>
                    <span style={{ fontWeight: 'bold' }}>{p.probability}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#E2E8F0',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${p.probability}%`,
                        height: '100%',
                        backgroundColor: '#4E7D6B',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}
                >
                  {p.risk === 'CRITICAL' && <AlertTriangle size={12} color="#991B1B" />}
                  <span>{p.recommendation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Outbreaks Database */}
      <div
        className="glass-panel slide-in-right-panel"
        style={{ display: 'flex', flexDirection: 'column', height: '450px' }}
      >
        <div className="panel-header">
          <div className="panel-title">
            <BookOpen size={18} color="var(--color-ph)" /> Base Histórica de Brotes (10 Años)
          </div>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.75rem',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-glass)',
                  color: 'var(--text-muted)'
                }}
              >
                <th style={{ padding: '0.4rem' }}>Plaga</th>
                <th style={{ padding: '0.4rem' }}>Temp Prom.</th>
                <th style={{ padding: '0.4rem' }}>Humedad Prom.</th>
                <th style={{ padding: '0.4rem' }}>Pérdidas</th>
              </tr>
            </thead>
            <tbody>
              {pestHistory.map((record) => (
                <tr
                  key={record.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <td style={{ padding: '0.4rem', fontWeight: 'bold' }}>{record.pestName}</td>
                  <td style={{ padding: '0.4rem' }}>{record.avgTemp.toFixed(1)} °C</td>
                  <td style={{ padding: '0.4rem' }}>{record.avgHumidity.toFixed(1)} %</td>
                  <td style={{ padding: '0.4rem', color: 'var(--color-valve-closed)' }}>
                    -{record.cropLost}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PestPredictor;
