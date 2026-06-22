import React, { useState, useEffect } from 'react';
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

const HistoryPanel = ({ userRole = 'Leader' }) => {
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
      details:
        'Se detectó vibración elevada (3.8 mm/s RMS) en rodamiento radial del cuerpo de la bomba. Se procedió con alineación láser de precisión usando shims calibrados. Desviación final residual angular de 0.02 mm (tolerancia nominal < 0.05 mm). Se balanceó estáticamente el rodete retirando 4g de material acumulado por sedimentos.',
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
      details:
        'Goteo continuo observado en prensaestopas superando límites de diseño. Desmontaje completo del prensa, eje e impulsor. Se instaló sello mecánico de cartucho de silicio-silicio con juntas tóricas de Viton. Inspección de álabes del rodete no mostró desgaste abrasivo ni cavitación tipo panal. Limpieza interna de voluta completada.',
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
      details:
        'Mantenimiento preventivo cíclico. Limpieza de cámara de rodamientos del motor eléctrico de 5.5 kW. Inyección de grasa sintética Mobilith SHC 100 en cojinete delantero y trasero. La temperatura de operación nominal del estator disminuyó de 58°C a 44°C tras completar el servicio de lubricación.',
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
      details:
        'Montaje inicial e instalación de la bomba centrífuga estándar GLB en el banco de ensayos del Laboratorio de Hidráulica. Calibración de transductores de presión piezoeléctricos (succión/descarga), sensor infrarrojo de cojinete y acelerómetro triaxial de vibraciones. Comprobación de sentido de giro del eje motor exitosa.',
      duration: '8.0 Hrs'
    }
  ];

  // 1. Vibration Trend Data (14 days)
  const vibrationTrend = [1.2, 1.3, 1.1, 1.4, 2.5, 3.8, 1.2, 1.3, 1.4, 1.2, 1.1, 1.3, 1.5, 1.3];

  // 2. Temp Trend Data (24 hours) - Bearing & Motor Coil
  const bearingTempTrend = [
    35, 37, 38, 41, 44, 45, 43, 42, 41, 40, 39, 38, 42, 45, 46, 44, 43, 42, 41, 40, 39, 38, 37, 36
  ];
  const coilTempTrend = [
    45, 48, 51, 55, 57, 58, 55, 53, 52, 51, 49, 48, 52, 56, 58, 56, 54, 53, 51, 50, 48, 47, 46, 45
  ];

  // 3. Flow-Pressure Correlation (Valve opening trials: 0% to 100%)
  const flowRateTrial = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // m3/h
  const pressureTrial = [5.2, 5.1, 4.9, 4.7, 4.5, 4.2, 3.8, 3.4, 2.9, 2.3, 1.6]; // bar

  // State for interactive curve simulation and logs
  const [logsList, setLogsList] = useState(() => {
    try {
      const saved = localStorage.getItem('hub_historical_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading logs from localStorage', e);
    }
    return historicalLogs;
  });
  const [isInteractive, setIsInteractive] = useState(false);
  const [customPressureTrial, setCustomPressureTrial] = useState([...pressureTrial]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [techFilter, setTechFilter] = useState('');
  const [fullscreenGraph, setFullscreenGraph] = useState(null); // 'vibration' | 'temperature' | 'flow-pressure' | null

  // Reload logs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hub_historical_logs');
      if (saved) {
        setLogsList(JSON.parse(saved));
      } else {
        localStorage.setItem('hub_historical_logs', JSON.stringify(historicalLogs));
      }
    } catch (e) {
      console.warn('Error sync logs in HistoryPanel', e);
    }
  }, []);

  // Helper to format date for input field in local timezone
  const getLocalDateTimeString = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now - tzOffset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    date: getLocalDateTimeString(),
    tech: '',
    ot: '',
    tag: '',
    area: '',
    system: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMouseDown = (e, index) => {
    if (!isInteractive) return;
    e.preventDefault();
    setDraggingIndex(index);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();

    // Scale clientY into the viewBox coordinates (viewBox height is dynamic)
    const viewBoxAttr = svg.getAttribute('viewBox');
    const viewBoxHeight = viewBoxAttr ? parseFloat(viewBoxAttr.split(' ')[3]) : 150;
    const scaleY = viewBoxHeight / rect.height;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const height = viewBoxHeight;
    const paddingBottom = 25;
    const paddingTop = 20;
    const chartHeight = height - paddingTop - paddingBottom;
    const maxVal = 6.0;

    let newVal = ((height - paddingBottom - mouseY) / chartHeight) * maxVal;

    // Clamp newVal between 0 and 6 bar
    newVal = Math.max(0, Math.min(maxVal, newVal));
    // Round to 1 decimal place for neatness
    newVal = Math.round(newVal * 10) / 10;

    const updated = [...customPressureTrial];
    updated[draggingIndex] = newVal;
    setCustomPressureTrial(updated);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const generateReportText = (data) => {
    const divider = '='.repeat(60);
    const subDivider = '-'.repeat(60);

    let text = `${divider}\n`;
    text += ` INFORME TÉCNICO DE ENSAYO DE CAMPO - SIMULACIÓN DE BOMBA\n`;
    text += `${divider}\n\n`;
    text += `INFORMACIÓN GENERAL DE TERRENO:\n`;
    text += `${subDivider}\n`;
    text += `Fecha y Hora:           ${data.date.replace('T', ' ')}\n`;
    text += `Operador / Mecánico:    ${data.tech}\n`;
    text += `Orden de Trabajo (OT):  ${data.ot}\n`;
    text += `TAG del Componente:     ${data.tag}\n`;
    text += `Área / Ubicación:       ${data.area}\n`;
    text += `Sistema / Subsistema:   ${data.system}\n`;
    text += `Estado Final:           SIMULADO (Modificado por Operador)\n\n`;

    text += `CURVA DE RENDIMIENTO SIMULADA (PRESIÓN VS CAUDAL):\n`;
    text += `${subDivider}\n`;
    text += `Punto   Caudal (m³/h)   Presión (bar)   Altura Equivalente (m)\n`;

    flowRateTrial.forEach((flow, i) => {
      const pressure = customPressureTrial[i];
      const heightVal = pressure * 10;
      text += `${String(i + 1).padEnd(8)}${String(flow).padEnd(16)}${String(pressure.toFixed(2)).padEnd(16)}${heightVal.toFixed(1)} m\n`;
    });

    text += `\n`;
    text += `DIAGNÓSTICO Y NOTAS TÉCNICAS:\n`;
    text += `${subDivider}\n`;
    text += `El ensayo de campo fue simulado de forma interactiva en la interfaz del Laboratorio de Hidráulica.\n`;
    text += `Se registraron deformaciones en la curva característica de presión y caudal del equipo,\n`;
    text += `lo cual puede ser utilizado para documentar pérdidas de rendimiento volumétrico,\n`;
    text += `desgaste del rodete o desalineaciones en terreno.\n\n`;
    text += `Firma Responsable: ___________________________\n`;
    text += `                   Ingeniería de Mantenimiento\n\n`;
    text += `${divider}\n`;
    text += ` Fin del Reporte\n`;
    text += `${divider}\n`;

    return text;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Create new log entry
    const newLog = {
      id: `hlog-sim-${Date.now()}`,
      date: formData.date.split('T')[0], // Extract YYYY-MM-DD
      tech: formData.tech,
      action: `Ensayo de campo simulado - OT ${formData.ot}`,
      status: 'Simulated',
      statusLabel: 'Simulado',
      component: formData.tag,
      details: `Reporte de simulación de terreno en el área ${formData.area}, sistema ${formData.system}, tag ${formData.tag}. Curva H-Q modificada manualmente. Puntos de ensayo (Caudal m³/h -> Presión bar): ${flowRateTrial.map((f, i) => `${f}:${customPressureTrial[i].toFixed(1)}`).join(', ')}.`,
      duration: '0.5 Hrs'
    };

    // Add to logsList
    setLogsList([newLog, ...logsList]);

    // Generate text report content
    const reportText = generateReportText(formData);

    // Download text report
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_bomba_${formData.tag}_OT_${formData.ot}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Reset and close form
    setShowForm(false);
  };

  // Helper to render Vibration Line Chart
  const renderVibrationHistoryChart = (customHeight) => {
    const width = 500;
    const height = customHeight || 150;
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
        <line
          x1={padding}
          y1={yAlarm}
          x2={width - padding}
          y2={yAlarm}
          stroke="var(--status-replace)"
          strokeDasharray="3,3"
          strokeWidth="1"
          className="chart-grid-line"
        />
        <text
          x={width - padding - 5}
          y={yAlarm - 10}
          fill="var(--status-replace)"
          fontSize="21"
          fontWeight="bold"
          textAnchor="end"
        >
          CRÍTICO (4.5 mm/s)
        </text>

        <line
          x1={padding}
          y1={yWarning}
          x2={width - padding}
          y2={yWarning}
          stroke="var(--status-inspect)"
          strokeDasharray="3,3"
          strokeWidth="1"
          className="chart-grid-line"
        />
        <text
          x={width - padding - 5}
          y={yWarning - 10}
          fill="var(--status-inspect)"
          fontSize="21"
          fontWeight="bold"
          textAnchor="end"
        >
          PREVENTIVO (2.8 mm/s)
        </text>

        {/* Grid lines */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="rgba(15, 23, 42, 0.15)"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="rgba(15, 23, 42, 0.03)"
          strokeDasharray="3,3"
        />

        {/* Area under curve */}
        <path d={areaD} fill="url(#vib-glow-history)" />

        {/* Chart curve */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent-cyan)"
          strokeWidth="2"
          className="chart-line-animate"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            {(i === 5 || i === points.length - 1) && (
              <circle cx={p.x} cy={p.y} r="3" fill="var(--accent-cyan)">
                <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.8;0;0.8"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill={
                p.val >= 4.5
                  ? 'var(--status-replace)'
                  : p.val >= 2.8
                    ? 'var(--status-inspect)'
                    : 'var(--accent-cyan)'
              }
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* Show value label for peak */}
            {i === 5 && (
              <text
                x={p.x}
                y={p.y - 12}
                fill="var(--status-replace)"
                fontSize="24"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {p.val} mm/s
              </text>
            )}
          </g>
        ))}

        {/* X axis labels */}
        <text x={padding} y={height - 5} fill="var(--text-muted)" fontSize="24">
          Día 1
        </text>
        <text
          x={width / 2}
          y={height - 5}
          fill="var(--text-muted)"
          fontSize="24"
          textAnchor="middle"
        >
          Mantenimiento (Día 6)
        </text>
        <text
          x={width - padding}
          y={height - 5}
          fill="var(--text-muted)"
          fontSize="24"
          textAnchor="end"
        >
          Día 14
        </text>
      </svg>
    );
  };

  // Helper to render Temperature Trend Chart (Dual curves)
  const renderTempHistoryChart = (customHeight) => {
    const width = 500;
    const height = customHeight || 150;
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
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="rgba(15, 23, 42, 0.15)"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="rgba(15, 23, 42, 0.03)"
          strokeDasharray="3,3"
        />

        {/* Threshold indicator line for coils */}
        <line
          x1={padding}
          y1={height - padding - (80 / maxVal) * chartHeight}
          x2={width - padding}
          y2={height - padding - (80 / maxVal) * chartHeight}
          stroke="rgba(239, 68, 68, 0.15)"
          strokeDasharray="2,2"
        />

        {/* Coil Temp curve */}
        <path
          d={coilPathD}
          fill="none"
          stroke="var(--status-replace)"
          strokeWidth="2"
          className="chart-line-animate"
        />

        {/* Bearing Temp curve */}
        <path
          d={bearingPathD}
          fill="none"
          stroke="var(--status-inspect)"
          strokeWidth="1.8"
          className="chart-line-animate"
          style={{ animationDelay: '0.3s' }}
        />

        {/* Peak dots */}
        <circle
          cx={bearingPoints[14].x}
          cy={bearingPoints[14].y}
          r="2.5"
          fill="var(--status-inspect)"
          stroke="#ffffff"
          strokeWidth="1"
        />
        <circle
          cx={coilPoints[14].x}
          cy={coilPoints[14].y}
          r="2.5"
          fill="var(--status-replace)"
          stroke="#ffffff"
          strokeWidth="1"
        />

        {/* Text Labels */}
        <text
          x={bearingPoints[14].x + 5}
          y={bearingPoints[14].y + 4}
          fill="var(--status-inspect)"
          fontSize="21"
          fontWeight="bold"
        >
          46°C
        </text>
        <text
          x={coilPoints[14].x + 5}
          y={coilPoints[14].y - 10}
          fill="var(--status-replace)"
          fontSize="21"
          fontWeight="bold"
        >
          58°C
        </text>

        {/* X axis labels */}
        <text x={padding} y={height - 5} fill="var(--text-muted)" fontSize="24">
          00:00
        </text>
        <text
          x={width / 2}
          y={height - 5}
          fill="var(--text-muted)"
          fontSize="24"
          textAnchor="middle"
        >
          12:00
        </text>
        <text
          x={width - padding}
          y={height - 5}
          fill="var(--text-muted)"
          fontSize="24"
          textAnchor="end"
        >
          23:00
        </text>
      </svg>
    );
  };

  // Helper to render Flow vs Pressure Correlation Chart
  const renderFlowPressureChart = (customHeight) => {
    const width = 500;
    const height = customHeight || 150;
    const paddingLeft = 75;
    const paddingRight = 25;
    const paddingTop = 20;
    const paddingBottom = 25;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const maxVal = 6.0; // max 6.0 bar discharge pressure

    const points = customPressureTrial.map((val, idx) => {
      const x = paddingLeft + (idx / (customPressureTrial.length - 1)) * chartWidth;
      const y = height - paddingBottom - (val / maxVal) * chartHeight;
      return { x, y, val, flow: flowRateTrial[idx] };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Original curve points (as static reference dashed line)
    const originalPoints = pressureTrial.map((val, idx) => {
      const x = paddingLeft + (idx / (pressureTrial.length - 1)) * chartWidth;
      const y = height - paddingBottom - (val / maxVal) * chartHeight;
      return { x, y };
    });

    const originalPathD = originalPoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        {/* Left Y Axis (Altura in meters) */}
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          stroke="rgba(15, 23, 42, 0.3)"
          strokeWidth="1.5"
        />

        {/* Ticks and Labels for Altura (m) */}
        {[0, 20, 40, 60].map((h) => {
          const yTick = height - paddingBottom - (h / 60) * chartHeight;
          return (
            <g key={h}>
              <line
                x1={paddingLeft - 4}
                y1={yTick}
                x2={paddingLeft}
                y2={yTick}
                stroke="rgba(15, 23, 42, 0.3)"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 12}
                y={yTick + 3}
                fill="var(--text-secondary)"
                fontSize="24"
                textAnchor="end"
                fontWeight="600"
              >
                {h}m
              </text>
            </g>
          );
        })}

        {/* Y Axis Label */}
        <text
          transform="rotate(-90 22 75)"
          x={22}
          y={75}
          fill="var(--text-secondary)"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
        >
          Altura (m)
        </text>

        {/* Grid lines */}
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="rgba(15, 23, 42, 0.15)"
          strokeWidth="1.5"
        />
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={width - paddingRight}
          y2={paddingTop}
          stroke="rgba(15, 23, 42, 0.03)"
          strokeDasharray="3,3"
        />

        {/* Reference Original Curve (only when interactive mode is active) */}
        {isInteractive && (
          <path
            d={originalPathD}
            fill="none"
            stroke="rgba(99, 102, 241, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
        )}

        {/* Area / Slope */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent-indigo)"
          strokeWidth="2.5"
          className={isInteractive ? '' : 'chart-line-animate'}
        />

        {/* Dots */}
        {points.map((p, i) => {
          const isDraggable = isInteractive;
          const showDot = isDraggable || i % 2 === 0 || i === points.length - 1;
          if (!showDot) return null;

          return (
            <g key={i} style={{ cursor: isDraggable ? 'ns-resize' : 'default' }}>
              {isDraggable && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="7"
                  fill="var(--accent-indigo)"
                  opacity={draggingIndex === i ? 0.4 : 0.15}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isDraggable ? '4' : '2.5'}
                fill={isDraggable ? 'var(--accent-cyan)' : 'var(--accent-indigo)'}
                stroke="#ffffff"
                strokeWidth={isDraggable ? 1.5 : 1}
                onMouseDown={(e) => handleMouseDown(e, i)}
              />
              <text
                x={p.x}
                y={p.y - (isDraggable ? 18 : 14)}
                fill="var(--text-secondary)"
                fontSize="21"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {p.val.toFixed(1)}b
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        <text x={paddingLeft} y={height - 4} fill="var(--text-muted)" fontSize="24">
          0 m³/h (Válvula Cerrada)
        </text>
        <text
          x={paddingLeft + chartWidth / 2}
          y={height - 4}
          fill="var(--text-muted)"
          fontSize="24"
          textAnchor="middle"
        >
          50 m³/h
        </text>
        <text
          x={width - paddingRight}
          y={height - 4}
          fill="var(--text-muted)"
          fontSize="24"
          textAnchor="end"
        >
          100 m³/h (Apertura Total)
        </text>
      </svg>
    );
  };

  // Filtered logs list for Technical view
  const filteredLogs = logsList.filter((log) => {
    if (userRole === 'Tech' && techFilter.trim() !== '') {
      const query = techFilter.toLowerCase();
      return (
        log.tech.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.component.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%'
      }}
    >
      {/* Title */}
      <div
        style={{
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--accent-cyan)',
              letterSpacing: '-0.03em'
            }}
          >
            Historial y Telemetría Predictiva
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              marginTop: '8px',
              lineHeight: '1.6'
            }}
          >
            Análisis de tendencias a largo plazo e informes de auditoría del piloto técnico. Permite
            evaluar patrones de vibración, perfiles térmicos y el registro histórico acumulado de
            bitácoras.
          </p>
        </div>
        <div
          style={{
            background:
              userRole === 'Leader' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: `1px solid ${userRole === 'Leader' ? 'var(--accent-indigo)' : 'var(--status-operational)'}`,
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: userRole === 'Leader' ? 'var(--accent-indigo)' : 'var(--status-operational)',
            textTransform: 'uppercase'
          }}
        >
          Perfil: {userRole === 'Leader' ? 'Líder de Mantención' : 'Técnico Operativo'}
        </div>
      </div>

      {/* KPI Cards Row (Leader only) */}
      {userRole === 'Leader' && (
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
            <strong className="kpi-value" style={{ color: 'var(--accent-indigo)' }}>
              92%
            </strong>
            <span className="kpi-subtitle">Índice predictivo general</span>
          </div>
        </div>
      )}

      {/* Dashboard Analítico Integral (Leader only) */}
      {userRole === 'Leader' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-premium)'
          }}
        >
          {/* Component failure analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: '800',
                color: 'var(--accent-indigo)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📊 Alertas e Intervenciones por Componente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(
                logsList.reduce((acc, log) => {
                  acc[log.component] = (acc[log.component] || 0) + 1;
                  return acc;
                }, {})
              ).map(([comp, count]) => {
                const total = logsList.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={comp}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        marginBottom: '4px'
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>{comp}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--accent-indigo)',
                          borderRadius: '3px'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintainer performance analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: '800',
                color: 'var(--accent-cyan)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              👷 Historial de Intervenciones por Mantenedor
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '180px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}
            >
              {Object.entries(
                logsList.reduce((acc, log) => {
                  acc[log.tech] = (acc[log.tech] || 0) + 1;
                  return acc;
                }, {})
              ).map(([tech, count]) => {
                return (
                  <div
                    key={tech}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      padding: '6px 10px',
                      background: 'var(--bg-sidebar-header)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <User size={12} style={{ color: 'var(--accent-cyan)' }} />
                      {tech}
                    </span>
                    <span
                      style={{
                        background: 'var(--accent-cyan)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {count} {count === 1 ? 'tarea' : 'tareas'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid (Leader only) */}
      {userRole === 'Leader' && (
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
            <div
              className="zoomable-graph-container"
              onClick={() => setFullscreenGraph('vibration')}
            >
              {renderVibrationHistoryChart()}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              * El pico en el Día 6 (3.8 mm/s) representa el reporte de desalineación radial antes
              de aplicar corrección por alineación láser y balanceo.
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
            <div
              className="zoomable-graph-container"
              onClick={() => setFullscreenGraph('temperature')}
            >
              {renderTempHistoryChart()}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              * Las temperaturas se mantienen en límites normales (estator nominal &lt; 80°C,
              cojinetes &lt; 65°C) tras la inyección de grasa sintética Mobilith.
            </p>
          </div>
        </div>
      )}

      {/* Technician specific quick filter bar */}
      {userRole === 'Tech' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: 'var(--shadow-premium)'
          }}
        >
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: '800',
              color: 'var(--accent-indigo)',
              margin: 0
            }}
          >
            🔍 Panel de Búsqueda y Filtro de Tareas
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setTechFilter('Andrés Silva')}
              className={`btn-secondary ${techFilter === 'Andrés Silva' ? 'active' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '12px',
                borderColor: techFilter === 'Andrés Silva' ? 'var(--accent-indigo)' : '',
                color: techFilter === 'Andrés Silva' ? 'var(--accent-indigo)' : ''
              }}
            >
              Ver mis órdenes (Andrés Silva)
            </button>
            <button
              onClick={() => setTechFilter('Jorge Oyarzún')}
              className={`btn-secondary ${techFilter === 'Jorge Oyarzún' ? 'active' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '12px',
                borderColor: techFilter === 'Jorge Oyarzún' ? 'var(--accent-indigo)' : '',
                color: techFilter === 'Jorge Oyarzún' ? 'var(--accent-indigo)' : ''
              }}
            >
              Ver mis órdenes (Jorge Oyarzún)
            </button>
            <button
              onClick={() => setTechFilter('Simulador de Escenarios')}
              className={`btn-secondary ${techFilter === 'Simulador de Escenarios' ? 'active' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '12px',
                borderColor: techFilter === 'Simulador de Escenarios' ? 'var(--accent-indigo)' : '',
                color: techFilter === 'Simulador de Escenarios' ? 'var(--accent-indigo)' : ''
              }}
            >
              Ver mis simulaciones
            </button>
            {techFilter && (
              <button
                onClick={() => setTechFilter('')}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: '1px dashed var(--status-replace)',
                  color: 'var(--status-replace)'
                }}
              >
                Limpiar Filtro
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}
            >
              Filtro manual por texto (Técnico / Componente / Acción)
            </label>
            <input
              type="text"
              placeholder="Buscar por texto libre..."
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="premium-input"
              style={{ padding: '8px 12px', fontSize: '0.82rem' }}
            />
          </div>
        </div>
      )}

      {/* Chart 3: Flow-Pressure Correlation (For both roles) */}
      <div className="history-chart-card">
        <div
          className="history-chart-header"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 className="history-chart-title" style={{ margin: 0 }}>
            <Gauge size={16} style={{ color: 'var(--accent-indigo)' }} />
            Curva de Ensayo: Presión de Descarga vs. Caudal
          </h3>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => {
                setIsInteractive(!isInteractive);
                if (!isInteractive) {
                  setCustomPressureTrial([...pressureTrial]);
                }
                setShowForm(false);
              }}
              className={`premium-btn ${isInteractive ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)',
                background: isInteractive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isInteractive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <Activity size={14} />
              {isInteractive ? 'Desactivar Simulación' : 'Simular Curva / Fallas'}
            </button>

            {isInteractive && (
              <button
                onClick={() => setShowForm(true)}
                className="premium-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  border: '1px solid var(--accent-cyan)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileText size={14} />
                Generar Reporte
              </button>
            )}

            {JSON.stringify(customPressureTrial) !== JSON.stringify(pressureTrial) && (
              <button
                onClick={() => {
                  setCustomPressureTrial([...pressureTrial]);
                  setShowForm(false);
                }}
                className="premium-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: 'var(--status-replace)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                Restablecer
              </button>
            )}
          </div>

          <div className="history-chart-legend">
            <span className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: 'var(--accent-indigo)' }}
              ></span>
              <span>Presión (bar) / Altura (m)</span>
            </span>
          </div>
        </div>
        <div
          className="zoomable-graph-container"
          onClick={(e) => {
            if (e.target.tagName !== 'circle') setFullscreenGraph('flow-pressure');
          }}
        >
          {renderFlowPressureChart()}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          * Curva característica H-Q de la bomba centrífuga ensayada en el laboratorio. Muestra la
          caída de presión de descarga a medida que aumenta el caudal volumétrico de salida. En modo
          simulación, arrastre los puntos verticalmente para modelar fallas en terreno.
        </p>
      </div>

      {/* Hydrated Audit Logs Card */}
      <div className="audit-logs-card">
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '12px'
          }}
        >
          <FileText size={18} />
          {userRole === 'Leader'
            ? 'Bitácora Completa de Auditorías del Piloto'
            : 'Mis Órdenes de Trabajo y Tareas'}
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
              {filteredLogs.map((log) => (
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
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>
                    {log.component}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.action}</strong>
                      {selectedLog === log.id && (
                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(15, 23, 42, 0.02)',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px dotted var(--border-glass)',
                            marginTop: '6px',
                            animation: 'fade-in 0.3s ease'
                          }}
                        >
                          {log.details}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{log.duration}</td>
                  <td>
                    <span className={`audit-status-badge ${log.status.toLowerCase()}`}>
                      <span
                        className={
                          log.status.toLowerCase() === 'simulated'
                            ? 'pulse-dot blue'
                            : log.status.toLowerCase() === 'inspect'
                              ? 'pulse-dot orange'
                              : log.status.toLowerCase() === 'replace'
                                ? 'pulse-dot red'
                                : 'pulse-dot green'
                        }
                        style={{ width: '4px', height: '4px' }}
                      ></span>
                      {log.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                  >
                    No se encontraron órdenes de trabajo para los criterios de filtro establecidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '12px',
            textAlign: 'center'
          }}
        >
          💡 Haz clic sobre cualquier registro de la tabla para desplegar los detalles técnicos
          completos y el diagnóstico extendido de la intervención.
        </p>
      </div>

      {/* Glassmorphic Report Form Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fade-in 0.3s ease',
            padding: '16px'
          }}
        >
          <div
            className="premium-card"
            style={{
              width: '100%',
              maxWidth: '550px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-glass)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: 'var(--text-primary)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '12px'
              }}
            >
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: 'var(--accent-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0
                }}
              >
                <FileText size={20} /> Generar Reporte Técnico de Terreno
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                    className="premium-input"
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Operador / Mecánico
                  </label>
                  <input
                    type="text"
                    name="tech"
                    value={formData.tech}
                    onChange={handleFormChange}
                    placeholder="Nombre completo"
                    required
                    className="premium-input"
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Orden de Trabajo (OT)
                  </label>
                  <input
                    type="text"
                    name="ot"
                    value={formData.ot}
                    onChange={handleFormChange}
                    placeholder="OT-XXXX"
                    required
                    className="premium-input"
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    TAG del Equipo
                  </label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleFormChange}
                    placeholder="B-101A"
                    required
                    className="premium-input"
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Área de Planta / Ubicación
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleFormChange}
                    placeholder="Ej: Sala de Bombas principal"
                    required
                    className="premium-input"
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Sistema y Subsistema
                  </label>
                  <input
                    type="text"
                    name="system"
                    value={formData.system}
                    onChange={handleFormChange}
                    placeholder="Ej: Circuito Refrigeración"
                    required
                    className="premium-input"
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.8)'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '16px',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '16px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="premium-btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(0,0,0,0.05)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="premium-btn active"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--accent-indigo)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Guardar y Descargar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Pantalla Completa para Gráficas */}
      {fullscreenGraph && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenGraph(null)}>
          <div className="fullscreen-overlay-card" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-overlay-header">
              <h3 className="fullscreen-overlay-title">
                {fullscreenGraph === 'vibration' && 'Historial de Vibraciones (14 Días)'}
                {fullscreenGraph === 'temperature' && 'Temperaturas de Control (24 Horas)'}
                {fullscreenGraph === 'flow-pressure' &&
                  'Curva de Ensayo: Presión de Descarga vs Caudal'}
              </h3>
              <button
                className="fullscreen-overlay-close-btn"
                onClick={() => setFullscreenGraph(null)}
              >
                ✕ Cerrar
              </button>
            </div>
            <div
              className="fullscreen-graph-body"
              style={{ background: 'var(--bg-sidebar-header)' }}
            >
              {fullscreenGraph === 'vibration' && renderVibrationHistoryChart(380)}
              {fullscreenGraph === 'temperature' && renderTempHistoryChart(380)}
              {fullscreenGraph === 'flow-pressure' && renderFlowPressureChart(380)}
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '8px',
                lineHeight: '1.5'
              }}
            >
              {fullscreenGraph === 'vibration' && (
                <span>
                  <strong>Información de Vibración:</strong> Monitoreo de vibraciones RMS en mm/s.
                  El límite preventivo se establece en <strong>2.8 mm/s</strong> y el límite crítico
                  en <strong>4.5 mm/s</strong> según la norma ISO 10816-1.
                </span>
              )}
              {fullscreenGraph === 'temperature' && (
                <span>
                  <strong>Información Térmica:</strong> Comparación de las lecturas térmicas en las
                  bobinas del estator y el rodamiento principal. Límites admisibles: estator nominal
                  &lt; 80°C, cojinetes &lt; 65°C.
                </span>
              )}
              {fullscreenGraph === 'flow-pressure' && (
                <span>
                  <strong>Curva Característica H-Q:</strong> Ensayo experimental que correlaciona el
                  caudal de descarga con la altura piezométrica equivalente en metros.
                  {isInteractive
                    ? ' Modo Simulación ACTIVO: Arrastre los círculos verticalmente para modificar la curva.'
                    : ' Clic en "Simular Curva / Fallas" para habilitar la manipulación interactiva de puntos.'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
