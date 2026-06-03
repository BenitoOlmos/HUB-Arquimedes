import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  FileText, 
  User, 
  Calendar, 
  ArrowUpRight, 
  BarChart3,
  Thermometer,
  Gauge
} from 'lucide-react';

const HistoryPanel = () => {
  const [selectedLog, setSelectedLog] = useState(null);

  // Mock Hydrated Logs (Technical Maintenance logs in Spanish)
  const historicalLogs = [
    {
      id: 'hlog-1',
      date: '2026-05-20',
      tech: 'Ing. Carlos Mendoza',
      action: 'Alineación láser de acoplamiento y balanceo de rodete',
      status: 'Operational',
      statusLabel: 'Operativo',
      component: 'Eje y Acoplamiento',
      details: 'Se detectó vibración elevada (3.8 mm/s RMS) en rodamiento radial del cuerpo de la bomba. Se procedió con alineación láser de precisión usando shims calibrados. Desviación final residual angular de 0.02 mm (tolerancia nominal < 0.05 mm). Se balanceó estáticamente el rodete retirando 4g de material acumulado por sedimentos.',
      duration: '3.5 Hrs'
    },
    {
      id: 'hlog-2',
      date: '2026-04-12',
      tech: 'Tec. Andrés Silva',
      action: 'Reemplazo de sello mecánico e inspección de rodete',
      status: 'Operational',
      statusLabel: 'Operativo',
      component: 'Sello Mecánico / Carcasa',
      details: 'Goteo continuo observado en prensaestopas superando límites de diseño. Desmontaje completo del prensa, eje e impulsor. Se instaló sello mecánico de cartucho de silicio-silicio con juntas tóricas de Viton. Inspección de álabes del rodete no mostró desgaste abrasivo ni cavitación tipo panal. Limpieza interna de voluta completada.',
      duration: '5.0 Hrs'
    },
    {
      id: 'hlog-3',
      date: '2026-03-05',
      tech: 'Ing. Marina Riquelme',
      action: 'Engrase y limpieza de rodamientos de motor',
      status: 'Operational',
      statusLabel: 'Operativo',
      component: 'Motor Eléctrico - Cojinetes',
      details: 'Mantenimiento preventivo cíclico. Limpieza de cámara de rodamientos del motor eléctrico de 5.5 kW. Inyección de grasa sintética Mobilith SHC 100 en cojinete delantero y trasero. La temperatura de operación nominal del estator disminuyó de 58°C a 44°C tras completar el servicio de lubricación.',
      duration: '2.0 Hrs'
    },
    {
      id: 'hlog-4',
      date: '2026-01-15',
      tech: 'Tec. Jorge Oyarzún',
      action: 'Puesta en marcha e instrumentación inicial (IoT)',
      status: 'Operational',
      statusLabel: 'Operativo',
      component: 'Bomba Completa',
      details: 'Montaje inicial e instalación de la bomba centrífuga estándar GLB en el banco de ensayos del Laboratorio de Hidráulica. Calibración de transductores de presión piezoeléctricos (succión/descarga), sensor infrarrojo de cojinete y acelerómetro triaxial de vibraciones. Comprobación de sentido de giro del eje motor exitosa.',
      duration: '8.0 Hrs'
    }
  ];

  // 1. Vibration Trend Data (14 days)
  const vibrationTrend = [1.2, 1.3, 1.1, 1.4, 2.5, 3.8, 1.2, 1.3, 1.4, 1.2, 1.1, 1.3, 1.5, 1.3];
  
  // 2. Temp Trend Data (24 hours) - Bearing & Motor Coil
  const bearingTempTrend = [35, 37, 38, 41, 44, 45, 43, 42, 41, 40, 39, 38, 42, 45, 46, 44, 43, 42, 41, 40, 39, 38, 37, 36];
  const coilTempTrend = [45, 48, 51, 55, 57, 58, 55, 53, 52, 51, 49, 48, 52, 56, 58, 56, 54, 53, 51, 50, 48, 47, 46, 45];

  // 3. Flow-Pressure Correlation (Valve opening trials: 0% to 100%)
  const flowRateTrial = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // m3/h
  const pressureTrial = [5.2, 5.1, 4.9, 4.7, 4.5, 4.2, 3.8, 3.4, 2.9, 2.3, 1.6]; // bar

  // Helper to render Vibration Line Chart
  const renderVibrationHistoryChart = () => {
    const width = 500;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxVal = 5.0; // max mm/s threshold

    const points = vibrationTrend.map((val, idx) => {
      const x = padding + (idx / (vibrationTrend.length - 1)) * chartWidth;
      const y = height - padding - (val / maxVal) * chartHeight;
      return { x, y, val };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    // Y-coordinate for Alarm limit (4.5 mm/s)
    const yAlarm = height - padding - (4.5 / maxVal) * chartHeight;
    // Y-coordinate for Warning limit (2.8 mm/s)
    const yWarning = height - padding - (2.8 / maxVal) * chartHeight;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <defs>
          <linearGradient id="vib-glow-history" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Warning & Critical Threshold lines */}
        <line x1={padding} y1={yAlarm} x2={width - padding} y2={yAlarm} stroke="var(--status-replace)" strokeDasharray="3,3" strokeWidth="1" className="chart-grid-line" />
        <text x={width - padding - 5} y={yAlarm - 4} fill="var(--status-replace)" fontSize="7" fontWeight="bold" textAnchor="end">CRÍTICO (4.5 mm/s)</text>

        <line x1={padding} y1={yWarning} x2={width - padding} y2={yWarning} stroke="var(--status-inspect)" strokeDasharray="3,3" strokeWidth="1" className="chart-grid-line" />
        <text x={width - padding - 5} y={yWarning - 4} fill="var(--status-inspect)" fontSize="7" fontWeight="bold" textAnchor="end">PREVENTIVO (2.8 mm/s)</text>

        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(15, 23, 42, 0.15)" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15, 23, 42, 0.03)" strokeDasharray="3,3" />

        {/* Area under curve */}
        <path d={areaD} fill="url(#vib-glow-history)" />

        {/* Chart curve */}
        <path d={pathD} fill="none" stroke="var(--accent-cyan)" strokeWidth="2" className="chart-line-animate" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            {(i === 5 || i === points.length - 1) && (
              <circle cx={p.x} cy={p.y} r="3" fill="var(--accent-cyan)">
                <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="2.5" 
              fill={p.val >= 4.5 ? "var(--status-replace)" : (p.val >= 2.8 ? "var(--status-inspect)" : "var(--accent-cyan)")} 
              stroke="#ffffff" 
              strokeWidth="1" 
            />
            {/* Show value label for peak */}
            {i === 5 && (
              <text x={p.x} y={p.y - 8} fill="var(--status-replace)" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {p.val} mm/s
              </text>
            )}
          </g>
        ))}

        {/* X axis labels */}
        <text x={padding} y={height - 8} fill="var(--text-muted)" fontSize="8">Día 1</text>
        <text x={width / 2} y={height - 8} fill="var(--text-muted)" fontSize="8" textAnchor="middle">Mantenimiento (Día 6)</text>
        <text x={width - padding} y={height - 8} fill="var(--text-muted)" fontSize="8" textAnchor="end">Día 14</text>
      </svg>
    );
  };

  // Helper to render Temperature Trend Chart (Dual curves)
  const renderTempHistoryChart = () => {
    const width = 500;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxVal = 120; // scale up to 120°C

    const bearingPoints = bearingTempTrend.map((val, idx) => {
      const x = padding + (idx / (bearingTempTrend.length - 1)) * chartWidth;
      const y = height - padding - (val / maxVal) * chartHeight;
      return { x, y, val };
    });

    const coilPoints = coilTempTrend.map((val, idx) => {
      const x = padding + (idx / (coilTempTrend.length - 1)) * chartWidth;
      const y = height - padding - (val / maxVal) * chartHeight;
      return { x, y, val };
    });

    const bearingPathD = bearingPoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const coilPathD = coilPoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(15, 23, 42, 0.15)" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15, 23, 42, 0.03)" strokeDasharray="3,3" />
        
        {/* Threshold indicator line for coils */}
        <line x1={padding} y1={height - padding - (80 / maxVal) * chartHeight} x2={width - padding} y2={height - padding - (80 / maxVal) * chartHeight} stroke="rgba(239, 68, 68, 0.15)" strokeDasharray="2,2" />

        {/* Coil Temp curve */}
        <path d={coilPathD} fill="none" stroke="var(--status-replace)" strokeWidth="2" className="chart-line-animate" />

        {/* Bearing Temp curve */}
        <path d={bearingPathD} fill="none" stroke="var(--status-inspect)" strokeWidth="1.8" className="chart-line-animate" style={{ animationDelay: '0.3s' }} />

        {/* Peak dots */}
        <circle cx={bearingPoints[14].x} cy={bearingPoints[14].y} r="2.5" fill="var(--status-inspect)" stroke="#ffffff" strokeWidth="1" />
        <circle cx={coilPoints[14].x} cy={coilPoints[14].y} r="2.5" fill="var(--status-replace)" stroke="#ffffff" strokeWidth="1" />

        {/* Text Labels */}
        <text x={bearingPoints[14].x + 5} y={bearingPoints[14].y + 2} fill="var(--status-inspect)" fontSize="7" fontWeight="bold">46°C</text>
        <text x={coilPoints[14].x + 5} y={coilPoints[14].y - 4} fill="var(--status-replace)" fontSize="7" fontWeight="bold">58°C</text>

        {/* X axis labels */}
        <text x={padding} y={height - 8} fill="var(--text-muted)" fontSize="8">00:00</text>
        <text x={width / 2} y={height - 8} fill="var(--text-muted)" fontSize="8" textAnchor="middle">12:00</text>
        <text x={width - padding} y={height - 8} fill="var(--text-muted)" fontSize="8" textAnchor="end">23:00</text>
      </svg>
    );
  };

  // Helper to render Flow vs Pressure Correlation Chart
  const renderFlowPressureChart = () => {
    const width = 500;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxVal = 6.0; // max 6.0 bar discharge pressure

    const points = pressureTrial.map((val, idx) => {
      const x = padding + (idx / (pressureTrial.length - 1)) * chartWidth;
      const y = height - padding - (val / maxVal) * chartHeight;
      return { x, y, val, flow: flowRateTrial[idx] };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(15, 23, 42, 0.15)" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15, 23, 42, 0.03)" strokeDasharray="3,3" />

        {/* Area / Slope */}
        <path d={pathD} fill="none" stroke="var(--accent-indigo)" strokeWidth="2.5" className="chart-line-animate" />

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            {(i % 2 === 0 || i === points.length - 1) && (
              <>
                <circle cx={p.x} cy={p.y} r="2.5" fill="var(--accent-indigo)" stroke="#ffffff" strokeWidth="1" />
                <text x={p.x} y={p.y - 8} fill="var(--text-secondary)" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  {p.val}b
                </text>
              </>
            )}
          </g>
        ))}

        {/* X axis labels */}
        <text x={padding} y={height - 8} fill="var(--text-muted)" fontSize="8">0 m³/h (Válvula Cerrada)</text>
        <text x={width / 2} y={height - 8} fill="var(--text-muted)" fontSize="8" textAnchor="middle">50 m³/h</text>
        <text x={width - padding} y={height - 8} fill="var(--text-muted)" fontSize="8" textAnchor="end">100 m³/h (Apertura Total)</text>
      </svg>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '-0.03em' }}>Historial y Telemetría Predictiva</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
          Análisis de tendencias a largo plazo e informes de auditoría del piloto técnico. Permite evaluar patrones de vibración, perfiles térmicos y el registro histórico acumulado de bitácoras.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-title">
            <ShieldCheck size={14} color="var(--status-operational)" /> Disponibilidad
          </span>
          <strong className="kpi-value text-green">98.4%</strong>
          <span className="kpi-subtitle">Óptimo para bomba GLB</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <Clock size={14} color="var(--accent-blue)" /> MTBF Cíclico
          </span>
          <strong className="kpi-value text-blue">720 Hrs</strong>
          <span className="kpi-subtitle">Tiempo Medio Entre Fallas</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <TrendingUp size={14} color="var(--accent-cyan)" /> MTTR de Servicio
          </span>
          <strong className="kpi-value text-cyan">4.2 Hrs</strong>
          <span className="kpi-subtitle">Tiempo Medio de Reparación</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <BarChart3 size={14} color="var(--accent-indigo)" /> Salud de Equipo
          </span>
          <strong className="kpi-value" style={{ color: 'var(--accent-indigo)' }}>92%</strong>
          <span className="kpi-subtitle">Índice predictivo general</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        
        {/* Chart 1: Vibration History */}
        <div className="history-chart-card">
          <div className="history-chart-header">
            <h3 className="history-chart-title">
              <Activity size={16} color="var(--accent-cyan)" />
              Tendencia de Vibración (14 Días)
            </h3>
            <div className="history-chart-legend">
              <span className="legend-item">
                <span className="legend-color cyan"></span>
                <span>Vibración RMS</span>
              </span>
            </div>
          </div>
          {renderVibrationHistoryChart()}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            * El pico en el Día 6 (3.8 mm/s) representa el reporte de desalineación radial antes de aplicar corrección por alineación láser y balanceo.
          </p>
        </div>

        {/* Chart 2: Temperature Trend */}
        <div className="history-chart-card">
          <div className="history-chart-header">
            <h3 className="history-chart-title">
              <Thermometer size={16} color="var(--status-inspect)" />
              Temperaturas de Control (24 Horas)
            </h3>
            <div className="history-chart-legend">
              <span className="legend-item">
                <span className="legend-color red"></span>
                <span>Bobinas Estator</span>
              </span>
              <span className="legend-item">
                <span className="legend-color orange"></span>
                <span>Rodamiento Bomba</span>
              </span>
            </div>
          </div>
          {renderTempHistoryChart()}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            * Las temperaturas se mantienen en límites normales (estator nominal &lt; 80°C, cojinetes &lt; 65°C) tras la inyección de grasa sintética Mobilith.
          </p>
        </div>

        {/* Chart 3: Flow-Pressure Correlation */}
        <div className="history-chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="history-chart-header">
            <h3 className="history-chart-title">
              <Gauge size={16} style={{ color: 'var(--accent-indigo)' }} />
              Curva de Ensayo: Presión de Descarga vs. Caudal
            </h3>
            <div className="history-chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: 'var(--accent-indigo)' }}></span>
                <span>Presión (bar)</span>
              </span>
            </div>
          </div>
          {renderFlowPressureChart()}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            * Curva característica H-Q de la bomba centrífuga ensayada en el laboratorio. Muestra la caída de presión de descarga a medida que aumenta el caudal volumétrico de salida.
          </p>
        </div>

      </div>

      {/* Hydrated Audit Logs Card */}
      <div className="audit-logs-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
          <FileText size={18} />
          Bitácora Completa de Auditorías del Piloto
        </h2>
        
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Fecha</th>
                <th style={{ width: '150px' }}>Técnico / Ing.</th>
                <th style={{ width: '180px' }}>Componente</th>
                <th>Acción Realizada</th>
                <th style={{ width: '90px' }}>Duración</th>
                <th style={{ width: '120px' }}>Estado Final</th>
              </tr>
            </thead>
            <tbody>
              {historicalLogs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>{log.date}</td>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} color="var(--text-muted)" />
                      {log.tech}
                    </div>
                  </td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{log.component}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.action}</strong>
                      {selectedLog === log.id && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(15, 23, 42, 0.02)', padding: '10px', borderRadius: '6px', border: '1px dotted var(--border-glass)', marginTop: '6px', animation: 'fade-in 0.3s ease' }}>
                          {log.details}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{log.duration}</td>
                  <td>
                    <span className={`audit-status-badge ${log.status.toLowerCase()}`}>
                      <span className="pulse-dot green" style={{ width: '4px', height: '4px' }}></span>
                      {log.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
          💡 Haz clic sobre cualquier registro de la tabla para desplegar los detalles técnicos completos y el diagnóstico extendido de la intervención.
        </p>
      </div>

    </div>
  );
};

export default HistoryPanel;
