import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { LineChart as ChartIcon, Thermometer, Wind, AlertTriangle } from 'lucide-react';

export default function TrendCharts() {
  const [activeTrend, setActiveTrend] = useState('vibration'); // vibration, inverter, pitch
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fallback: Generate mock history if API fails or database is unpopulated (local developer fallback)
  const generateMockHistory = (trendType) => {
    const data = [];
    const baseDate = new Date();

    for (let i = 120; i >= 0; i -= 2) {
      const timestamp = new Date(baseDate.getTime() - i * 60 * 60 * 1000);
      const label =
        timestamp.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) +
        ' ' +
        timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      if (trendType === 'vibration') {
        // Upward vibration trend for WTG-01 showing mechanical wear
        const progress = (120 - i) / 120;
        const value = 1.6 + progress * 4.4 + Math.random() * 0.4;
        data.push({
          time: label,
          Vibracion: parseFloat(value.toFixed(2)),
          WTG02_Vib: parseFloat((1.5 + Math.random() * 0.3).toFixed(2)) // WTG-02 remains normal
        });
      } else if (trendType === 'inverter') {
        // Inverter temp correlation (filters clogging on INV-02)
        const hour = timestamp.getHours();
        const irradiance =
          hour >= 6 && hour <= 18
            ? Math.sin(((hour - 6) / 12) * Math.PI) * 900 + Math.random() * 50
            : 0;

        const solarPower = irradiance > 0 ? irradiance * 0.6 : 0;

        // INV-01 normal temp
        const tempINV01 = 35 + solarPower / 12 + Math.random() * 3;

        // INV-02 clogged filter temp rising over time
        const clogProgress = (120 - i) / 120;
        const tempINV02 = 35 + solarPower / 12 + clogProgress * 28.5 + Math.random() * 4;

        data.push({
          time: label,
          Irradiancia: Math.round(irradiance),
          Temp_INV01: parseFloat(tempINV01.toFixed(1)),
          Temp_INV02: parseFloat(tempINV02.toFixed(1))
        });
      } else if (trendType === 'pitch') {
        // Wind speed vs power curve
        const windSpeed = 3 + Math.random() * 18;
        // Pitch impact demonstration
        const mockPitch = i > 60 ? 0 : 15; // pitch changes halfway

        const pitchRad = (mockPitch * Math.PI) / 180;
        const Cp = 0.4 * Math.cos(pitchRad);

        let powerkW = 0;
        if (windSpeed >= 3 && windSpeed <= 25) {
          powerkW = 0.5 * 1.225 * 6.3 * Math.pow(windSpeed, 3) * Cp * 0.9;
          powerkW = Math.min(2.5, powerkW); // MW
        }

        data.push({
          windSpeed: parseFloat(windSpeed.toFixed(1)),
          pitch: mockPitch,
          Power: parseFloat(powerkW.toFixed(3))
        });
      }
    }

    if (trendType === 'pitch') {
      // Sort pitch data by wind speed for a clean power curve X-Axis plotting
      data.sort((a, b) => a.windSpeed - b.windSpeed);
    }

    return data;
  };

  useEffect(() => {
    setLoading(true);

    // Attempt to fetch from API, otherwise fallback to premium mock curves
    const fetchHistory = async () => {
      try {
        if (activeTrend === 'vibration') {
          const res = await fetch('/api/scada/history?tagId=WTG-01&parameter=VIBRATION&limit=60');
          if (res.ok) {
            const dbData = await res.json();
            if (dbData.length > 0) {
              const formatted = dbData.map((d) => ({
                time:
                  new Date(d.timestamp).toLocaleDateString() +
                  ' ' +
                  new Date(d.timestamp).getHours() +
                  ':00',
                Vibracion: d.value,
                WTG02_Vib: 1.5 + Math.random() * 0.3
              }));
              setChartData(formatted);
              return;
            }
          }
        } else if (activeTrend === 'inverter') {
          const res1 = await fetch(
            '/api/scada/history?tagId=INV-02&parameter=TEMPERATURE&limit=60'
          );
          if (res1.ok) {
            const dbData = await res1.json();
            if (dbData.length > 0) {
              const formatted = dbData.map((d, idx) => ({
                time: new Date(d.timestamp).getHours() + ':00',
                Temp_INV02: d.value,
                Temp_INV01: 45 + Math.random() * 5,
                Irradiancia: d.value > 50 ? (d.value - 40) * 10 : 0
              }));
              setChartData(formatted);
              return;
            }
          }
        }

        // Default Fallback
        setChartData(generateMockHistory(activeTrend));
      } catch (err) {
        console.warn('API history failed, using mock telemetry fallback:', err);
        setChartData(generateMockHistory(activeTrend));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [activeTrend]);

  return (
    <div
      className="hmi-card"
      style={{ flex: 1, minHeight: '360px', display: 'flex', flexDirection: 'column' }}
    >
      <div className="hmi-card-title">
        <ChartIcon size={16} /> Gráficos de Tendencia e Históricos
      </div>

      {/* Select Trend Tab */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`hmi-button ${activeTrend === 'vibration' ? 'active' : ''}`}
          onClick={() => setActiveTrend('vibration')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <AlertTriangle size={14} /> Vibraciones WTG-01 (Mecánico)
        </button>
        <button
          className={`hmi-button ${activeTrend === 'inverter' ? 'active' : ''}`}
          onClick={() => setActiveTrend('inverter')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Thermometer size={14} /> Correlación Térmica INV-02 (Filtros)
        </button>
        <button
          className={`hmi-button ${activeTrend === 'pitch' ? 'active' : ''}`}
          onClick={() => setActiveTrend('pitch')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Wind size={14} /> Curva de Potencia & Pitch (WTG)
        </button>
      </div>

      {/* Chart Workspace */}
      <div
        style={{
          flex: 1,
          minHeight: '220px',
          background: 'rgba(0,0,0,0.2)',
          padding: '12px',
          borderRadius: '4px'
        }}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              height: '220px',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'var(--font-mono)'
            }}
          >
            [ CARGANDO TELEMETRÍA HISTÓRICA... ]
          </div>
        ) : (
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTrend === 'vibration' ? (
                // 1. Gearbox Vibration Anomaly Line Chart
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#7f8fa4', fontSize: 9 }}
                    stroke="var(--hmi-border)"
                  />
                  <YAxis
                    domain={[0, 8]}
                    tick={{ fill: '#7f8fa4', fontSize: 10 }}
                    stroke="var(--hmi-border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--hmi-panel)',
                      borderColor: 'var(--hmi-border)',
                      color: 'var(--text-bright)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <ReferenceLine
                    y={5.0}
                    label={{
                      value: 'Alerta Critica',
                      fill: 'var(--hmi-fault)',
                      fontSize: 10,
                      position: 'top'
                    }}
                    stroke="var(--hmi-fault)"
                    strokeDasharray="3 3"
                  />
                  <Line
                    name="WTG-01 Vibración (Engranaje)"
                    type="monotone"
                    dataKey="Vibracion"
                    stroke="var(--hmi-fault)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    name="WTG-02 Vibración (Normal)"
                    type="monotone"
                    dataKey="WTG02_Vib"
                    stroke="var(--hmi-online)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              ) : activeTrend === 'inverter' ? (
                // 2. Inverter Thermal Anomaly Dual-Axis Chart
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#7f8fa4', fontSize: 9 }}
                    stroke="var(--hmi-border)"
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[30, 100]}
                    tick={{ fill: '#7f8fa4', fontSize: 10 }}
                    stroke="var(--hmi-border)"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 1000]}
                    tick={{ fill: '#7f8fa4', fontSize: 10 }}
                    stroke="var(--hmi-border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--hmi-panel)',
                      borderColor: 'var(--hmi-border)',
                      color: 'var(--text-bright)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line
                    yAxisId="left"
                    name="INV-02 Temperatura (°C)"
                    type="monotone"
                    dataKey="Temp_INV02"
                    stroke="var(--hmi-fault)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    name="INV-01 Temperatura (°C)"
                    type="monotone"
                    dataKey="Temp_INV01"
                    stroke="var(--hmi-online)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    name="Irradiancia Solar (W/m²)"
                    type="monotone"
                    dataKey="Irradiancia"
                    stroke="var(--hmi-cyan)"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              ) : (
                // 3. Wind speed vs power curve
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="windSpeed"
                    tick={{ fill: '#7f8fa4', fontSize: 9 }}
                    stroke="var(--hmi-border)"
                  />
                  <YAxis
                    domain={[0, 3.0]}
                    tick={{ fill: '#7f8fa4', fontSize: 10 }}
                    stroke="var(--hmi-border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--hmi-panel)',
                      borderColor: 'var(--hmi-border)',
                      color: 'var(--text-bright)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line
                    name="Potencia Generada (MW)"
                    type="monotone"
                    dataKey="Power"
                    stroke="var(--hmi-cyan)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    name="Ángulo Pitch (Pala °)"
                    type="monotone"
                    dataKey="pitch"
                    stroke="var(--hmi-yellow)"
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
