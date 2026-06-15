import React, { useState } from 'react';
import { 
  ClipboardList, 
  AlertTriangle, 
  ShieldCheck, 
  Wrench, 
  TrendingUp, 
  Clock, 
  Calendar, 
  User, 
  HardDrive,
  FileText,
  Activity
} from 'lucide-react';

const InfoPanel = ({ selectedPart, loading, onStatusChange, onAddLog }) => {
  const [activeTab, setActiveTab] = useState('detail'); // 'detail', 'telemetry', 'logs'
  const [selectedStageInfo, setSelectedStageInfo] = useState(null);
  const [techName, setTechName] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [logStatus, setLogStatus] = useState('');
  const [formError, setFormError] = useState('');

  if (loading) {
    return (
      <div className="sidebar-content">
        <div className="placeholder-container">
          <div className="spinner" style={{ width: '30px', height: '30px', marginBottom: '16px' }}></div>
          <p className="loading-text">Cargando detalles de la pieza...</p>
        </div>
      </div>
    );
  }

  if (!selectedPart) {
    return (
      <div className="sidebar-content">
        <div className="placeholder-container">
          <Activity className="placeholder-icon" size={48} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Selecciona un Componente</h3>
          <p className="placeholder-text">
            Haz clic sobre cualquier componente de la bomba en el visor 3D para examinar su ficha técnica, historial de vibraciones, bitácora de mantenimientos y programaciones.
          </p>
        </div>
      </div>
    );
  }

  // Parse JSON fields safely
  let vibrationData = [];
  try {
    vibrationData = typeof selectedPart.vibrationHistory === 'string' 
      ? JSON.parse(selectedPart.vibrationHistory) 
      : selectedPart.vibrationHistory || [];
  } catch (e) {
    vibrationData = [1.0, 1.2, 1.1, 1.3, 1.5];
  }

  let logsData = [];
  try {
    logsData = typeof selectedPart.maintenanceLogs === 'string'
      ? JSON.parse(selectedPart.maintenanceLogs)
      : selectedPart.maintenanceLogs || [];
  } catch (e) {
    logsData = [];
  }

  // Parse new stress and lifecycle properties with fallback defaults
  let stressData = [];
  try {
    stressData = selectedPart.stressHistory 
      ? (typeof selectedPart.stressHistory === 'string' ? JSON.parse(selectedPart.stressHistory) : selectedPart.stressHistory)
      : [20, 25, 35, 45, 52, 60, 65]; 
  } catch (e) {
    stressData = [20, 25, 35, 45, 52, 60, 65];
  }

  const remainingLife = selectedPart.remainingLife !== undefined ? selectedPart.remainingLife : 80;
  const lifecycleStage = selectedPart.lifecycleStage || 'Maintenance';
  const installationNotes = selectedPart.installationNotes || 'Montaje inicial completado. Alineación radial y axial verificada.';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Operational':
        return (
          <span className="badge-status operational">
            <span className="pulse-dot green"></span>
            <ShieldCheck size={13} /> Operativo
          </span>
        );
      case 'Inspect':
        return (
          <span className="badge-status inspect">
            <span className="pulse-dot orange"></span>
            <AlertTriangle size={13} /> Inspección
          </span>
        );
      case 'Replace':
        return (
          <span className="badge-status replace">
            <span className="pulse-dot red"></span>
            <AlertTriangle size={13} /> Reemplazo
          </span>
        );
      default:
        return <span className="badge-status">{status}</span>;
    }
  };

  // Generate SVG Line Chart Path for Vibration History
  const renderVibrationChart = (data) => {
    if (!data || data.length === 0) return null;
    
    const width = 320;
    const height = 110;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxVal = Math.max(...data, 4.0); // scale up to at least 4.0 mm/s
    const points = data.map((val, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      // SVG Y starts at top, so invert value
      const y = height - padding - (val / maxVal) * chartHeight;
      return { x, y, val };
    });

    // Create path line
    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Create area path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color="var(--accent-cyan)" /> Historial de Vibraciones
          </span>
          <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>Vib: mm/s RMS</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <defs>
            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" className="chart-grid-line" />
          <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" className="chart-grid-line" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(15, 23, 42, 0.15)" />

          {/* Area under line */}
          <path d={areaD} fill="url(#chart-glow)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="var(--accent-cyan)" strokeWidth="2" className="chart-line-animate" />

          {/* Dots & Labels */}
          {points.map((p, i) => (
            <g key={i}>
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <circle cx={p.x} cy={p.y} r="3.5" fill="var(--accent-cyan)" opacity="0.4">
                  <animate attributeName="r" values="3.5;10;3.5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r="3.5" fill="var(--accent-cyan)" stroke="#ffffff" strokeWidth="1.5" />
              {/* Show labels for peak or last point */}
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <text x={p.x} y={p.y - 8} fill="var(--text-primary)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {p.val}
                </text>
              )}
            </g>
          ))}
          
          {/* X axis labels */}
          <text x={padding} y={height - 4} fill="var(--text-muted)" fontSize="8">
            Inicio
          </text>
          <text x={width/2} y={height - 4} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
            Operación
          </text>
          <text x={width - padding} y={height - 4} fill="var(--text-muted)" fontSize="8" textAnchor="right">
            Actual
          </text>
        </svg>
      </div>
    );
  };

  const renderStressChart = (data) => {
    if (!data || data.length === 0) return null;
    
    const width = 320;
    const height = 110;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxVal = 100; // Stress represents percentage
    const points = data.map((val, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - (val / maxVal) * chartHeight;
      return { x, y, val };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color="var(--status-replace)" /> Carga de Estrés Mecánico
          </span>
          <span style={{ fontFamily: 'monospace', color: 'var(--status-replace)', fontWeight: 'bold' }}>Estrés: %</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <defs>
            <linearGradient id="stress-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--status-replace)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--status-replace)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" className="chart-grid-line" />
          <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" className="chart-grid-line" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(15, 23, 42, 0.15)" />

          <path d={areaD} fill="url(#stress-glow)" />
          <path d={pathD} fill="none" stroke="var(--status-replace)" strokeWidth="2" className="chart-line-animate" />

          {points.map((p, i) => (
            <g key={i}>
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <circle cx={p.x} cy={p.y} r="3.5" fill="var(--status-replace)" opacity="0.4">
                  <animate attributeName="r" values="3.5;10;3.5" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r="3.5" fill="var(--status-replace)" stroke="#ffffff" strokeWidth="1.5" />
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <text x={p.x} y={p.y - 8} fill="var(--text-primary)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {p.val}%
                </text>
              )}
            </g>
          ))}
          
          <text x={padding} y={height - 4} fill="var(--text-muted)" fontSize="8">
            Inicio
          </text>
          <text x={width/2} y={height - 4} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
            Calibración
          </text>
          <text x={width - padding} y={height - 4} fill="var(--text-muted)" fontSize="8" textAnchor="right">
            Actual
          </text>
        </svg>
      </div>
    );
  };

  const renderRadialGauge = (life, operatingHours, status) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (life / 100) * circumference;
    
    let strokeColor = 'var(--status-operational)';
    if (life <= 20) {
      strokeColor = 'var(--status-replace)';
    } else if (life <= 50) {
      strokeColor = 'var(--status-inspect)';
    }

    return (
      <div className="radial-gauge-card">
        <div className="radial-gauge-wrapper">
          <svg width="100" height="100" viewBox="0 0 100 100" className="radial-gauge-svg">
            <defs>
              <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={strokeColor} />
                <stop offset="100%" stopColor="var(--accent-cyan)" />
              </linearGradient>
            </defs>
            {/* Background track */}
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="transparent" 
              stroke="rgba(15, 23, 42, 0.08)" 
              strokeWidth="6" 
            />
            {/* Active progress track */}
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="transparent" 
              stroke="url(#gauge-grad)" 
              strokeWidth="6" 
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{
                transition: 'stroke-dashoffset 0.8s ease-out',
                filter: 'drop-shadow(0 0 3px ' + strokeColor + ')'
              }}
            />
          </svg>
          <div className="radial-gauge-center">
            <span className="radial-gauge-percentage">{life}%</span>
            <span className="radial-gauge-label">VIDA ÚTIL</span>
          </div>
        </div>
        <div className="radial-gauge-metrics">
          <div className="metric-box">
            <span className="metric-lbl">Estado Operacional</span>
            <span className="metric-val" style={{ color: strokeColor }}>
              {status === 'Operational' ? 'ÓPTIMO' : (status === 'Inspect' ? 'BAJO CONTROL' : 'CRÍTICO')}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-lbl">Uso Acumulado</span>
            <span className="metric-val text-cyan">{operatingHours.toLocaleString()} Hrs</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStageInfoContent = (stage) => {
    switch (stage) {
      case 'Installation':
        return (
          <div className="history-chart-container" style={{ background: 'var(--bg-sidebar-header)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fade-in-tooltip 0.25s' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--status-inspect)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> Fallas de Juventud (Mortalidad Infantil)
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              Ocurren al inicio de la vida del equipo con una alta tasa de fallos. Generalmente son consecuencia de problemas en la instalación, la puesta en marcha, el almacenamiento o el transporte.
            </p>
          </div>
        );
      case 'Maintenance':
        return (
          <div className="history-chart-container" style={{ background: 'var(--bg-sidebar-header)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fade-in-tooltip 0.25s' }}>
            {/* Main Header */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Activity size={14} /> Etapas del Ciclo de Vida del Equipo
              </h4>
              
              {/* Stages List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Fallas de Juventud */}
                <div style={{ background: 'rgba(245, 158, 11, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <strong style={{ color: 'var(--status-inspect)', display: 'block', fontSize: '0.74rem', marginBottom: '4px' }}>
                    Fallas de Juventud (Mortalidad Infantil):
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Ocurren al inicio de la vida del equipo con una alta tasa de fallos. Generalmente son consecuencia de problemas en la instalación, la puesta en marcha, el almacenamiento o el transporte.
                  </span>
                </div>

                {/* Vida Util */}
                <div style={{ background: 'rgba(6, 182, 212, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                  <strong style={{ color: 'var(--accent-cyan)', display: 'block', fontSize: '0.74rem', marginBottom: '4px' }}>
                    Vida Útil (Etapa de Estabilidad):
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Es el periodo central donde el equipo presenta un comportamiento estable y una tasa de fallos baja. Durante esta fase, el equipo ofrece una alta disponibilidad y sus horas de servicio son predecibles, siempre y cuando se someta a procesos de producción normalizados (sin sobreexigencias) y se respeten sus mantenimientos.
                  </span>
                </div>

                {/* Fallas de Vejez */}
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <strong style={{ color: 'var(--status-replace)', display: 'block', fontSize: '0.74rem', marginBottom: '4px' }}>
                    Fallas de Vejez (Desgaste):
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    En la etapa final, la tasa de fallos vuelve a aumentar drásticamente. Esto se debe al desgaste natural de los componentes, la fatiga por la operación continua y el historial de mantención del equipo.
                  </span>
                </div>
              </div>
            </div>

            {/* Mantenimiento y Procedimientos Criticos */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '4px' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Wrench size={14} /> Mantenimiento y Procedimientos Críticos
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                Para prolongar la etapa de "Vida Útil", se establecen ciclos de mantenimiento que varían según el componente:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Inspecciones de Rutina */}
                <div style={{ paddingLeft: '4px' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', marginBottom: '4px' }}>
                    <ClipboardList size={12} style={{ color: 'var(--accent-cyan)' }} /> Inspecciones de Rutina:
                  </strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '4px' }}>
                    Tanto en la bomba como en el motor, es vital monitorear variables de manera constante:
                  </p>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem', color: 'var(--text-secondary)', listStyleType: 'disc' }}>
                    <li>Inspección de fugas (especialmente en la bomba).</li>
                    <li>Detección de ruidos y vibraciones anormales.</li>
                    <li>Control de temperatura.</li>
                    <li>Estado de la lubricación y vida remanente de los rodamientos.</li>
                  </ul>
                </div>

                {/* Desacople y Alineacion */}
                <div style={{ paddingLeft: '4px', borderTop: '1px dashed var(--border-glass)', paddingTop: '8px' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', marginBottom: '4px' }}>
                    <TrendingUp size={12} style={{ color: 'var(--accent-blue)' }} /> Desacople y Alineación:
                  </strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Cuando se realiza una intervención mayor, como el cambio de rodamientos o el reemplazo del motor, el conjunto debe desacoplarse. Al volver a montar, el paso más crítico es la alineación. Esta debe realizarse respetando estrictamente las normativas técnicas para evitar daños prematuros y asegurar que los rodamientos nuevos alcancen la vida útil esperada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Replacement':
        return (
          <div className="history-chart-container" style={{ background: 'var(--bg-sidebar-header)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fade-in-tooltip 0.25s' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--status-replace)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> Fallas de Vejez (Desgaste)
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              En la etapa final, la tasa de fallos vuelve a aumentar drásticamente. Esto se debe al desgaste natural de los componentes, la fatiga por la operación continua y el historial de mantención del equipo.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderBathtubCurve = (currentStage) => {
    let dotX = 160;
    let dotY = 65;
    let dotColor = 'var(--accent-cyan)';
    let stageLabel = 'Vida Útil (Estabilidad)';

    if (currentStage === 'Installation') {
      dotX = 55;
      dotY = 40;
      dotColor = 'var(--status-inspect)';
      stageLabel = 'Mortalidad Infantil';
    } else if (currentStage === 'Replacement') {
      dotX = 265;
      dotY = 40;
      dotColor = 'var(--status-replace)';
      stageLabel = 'Desgaste / Vejez';
    }

    return (
      <div className="history-chart-container" style={{ background: 'var(--bg-sidebar-header)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}>
            <Activity size={12} style={{ color: 'var(--accent-cyan)' }} /> Curva de la Bañera (Bathtub Curve)
          </span>
          <span style={{ fontSize: '0.68rem', color: dotColor, fontWeight: 'bold' }}>
            {stageLabel}
          </span>
        </div>
        
        <svg viewBox="0 0 320 90" width="100%" height="90" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="bathtub-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--status-inspect)" />
              <stop offset="50%" stopColor="var(--accent-cyan)" />
              <stop offset="100%" stopColor="var(--status-replace)" />
            </linearGradient>
          </defs>
          
          {/* Phase shading backgrounds */}
          <rect x="20" y="5" width="70" height="75" fill="rgba(245, 158, 11, 0.02)" />
          <line x1="90" y1="5" x2="90" y2="80" stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" />
          
          <rect x="90" y="5" width="140" height="75" fill="rgba(6, 182, 212, 0.02)" />
          <line x1="230" y1="5" x2="230" y2="80" stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" />
          
          <rect x="230" y="5" width="70" height="75" fill="rgba(239, 68, 68, 0.02)" />
          
          {/* X and Y Axes */}
          <line x1="20" y1="80" x2="300" y2="80" stroke="var(--border-glass)" strokeWidth="1.5" />
          <line x1="20" y1="5" x2="20" y2="80" stroke="var(--border-glass)" strokeWidth="1.5" />
          
          {/* Bathtub curve path */}
          <path 
            d="M 20,15 Q 55,65 90,65 L 230,65 Q 265,65 300,15" 
            fill="none" 
            stroke="url(#bathtub-line-grad)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />

          {/* Current State Pulsing Circle Indicator */}
          <g>
            <circle cx={dotX} cy={dotY} r="6" fill={dotColor} opacity="0.4">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={dotX} cy={dotY} r="4.5" fill={dotColor} stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Labels */}
          <text x="55" y="88" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="bold">Juventud</text>
          <text x="160" y="88" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="bold">Vida Útil</text>
          <text x="265" y="88" fill="var(--text-muted)" fontSize="7" textAnchor="middle" fontWeight="bold">Vejez</text>
          
          <text x="10" y="45" fill="var(--text-muted)" fontSize="6" textAnchor="middle" transform="rotate(-90 10 45)" fontWeight="bold">Tasa de Fallas</text>
          <text x="303" y="77" fill="var(--text-muted)" fontSize="6" textAnchor="left" fontWeight="bold">Tiempo</text>
        </svg>
      </div>
    );
  };

  const renderLifecycleStepper = (stage) => {
    const stages = [
      { key: 'Installation', label: '1. Instalación' },
      { key: 'Maintenance', label: '2. Mantenimiento' },
      { key: 'Replacement', label: '3. Reemplazo' }
    ];

    return (
      <div style={{ background: 'var(--bg-sidebar-header)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        <span className="detail-label" style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Etapa del Ciclo de Vida</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)' }}>Clic para más información</span>
        </span>
        
        <div className="lifecycle-stepper">
          <div className="stepper-track-bg"></div>
          <div className="stepper-track-fill" style={{ width: stage === 'Installation' ? '0%' : (stage === 'Maintenance' ? '50%' : '100%') }}></div>
          
          {stages.map((st, idx) => {
            const isActive = stage === st.key;
            const isCompleted = (stage === 'Maintenance' && idx === 0) || (stage === 'Replacement' && idx <= 1);
            const isSelected = selectedStageInfo === st.key;
            
            let nodeClass = '';
            if (isActive) nodeClass = 'active';
            else if (isCompleted) nodeClass = 'completed';
            if (isSelected) nodeClass += ' active'; // highlight selected node

            return (
              <div 
                key={st.key} 
                className={`stepper-node ${nodeClass}`}
                onClick={() => setSelectedStageInfo(selectedStageInfo === st.key ? null : st.key)}
                style={{ cursor: 'pointer' }}
              >
                <div className="stepper-circle" style={{ boxShadow: isSelected ? '0 0 10px var(--accent-cyan)' : '' }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className="stepper-label" style={{ color: isSelected ? 'var(--accent-cyan)' : '' }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderInstallationNotes = (notes, date) => {
    return (
      <div className="certification-card">
        <div className="cert-header">
          <div className="cert-badge">
            <ShieldCheck size={14} />
            <span>CERTIFICADO DE PUESTA EN MARCHA</span>
          </div>
          <span className="cert-date">{date}</span>
        </div>
        <div className="cert-body">
          <div className="cert-watermark">
            <ShieldCheck size={72} />
          </div>
          <p className="cert-text">{notes}</p>
          <div className="cert-footer">
            <span className="cert-stamp">VERIFICADO</span>
            <span className="cert-org">DEPT. INGENIERÍA MECÁNICA</span>
          </div>
        </div>
      </div>
    );
  };

  const handleAddLogSubmit = (e) => {
    e.preventDefault();
    if (!techName.trim() || !logDesc.trim()) {
      setFormError('Por favor complete el nombre del técnico y la descripción.');
      return;
    }
    
    // Call parent's callback
    onAddLog(selectedPart.id, {
      tech: techName.trim(),
      desc: logDesc.trim(),
      status: logStatus || selectedPart.status
    });

    // Reset form states
    setTechName('');
    setLogDesc('');
    setLogStatus('');
    setFormError('');
  };

  return (
    <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Title section */}
      <div className="part-title-row">
        <div>
          <h2 className="part-name">{selectedPart.name}</h2>
          <h3 className="part-spanish-name">{selectedPart.spanishName}</h3>
        </div>
        {getStatusBadge(selectedPart.status)}
      </div>

      {/* Modern Tabs */}
      <div className="sidebar-tabs">
        <button 
          onClick={() => setActiveTab('detail')}
          className={`sidebar-tab ${activeTab === 'detail' ? 'active' : ''}`}
        >
          <ClipboardList size={14} />
          Ficha Técnica
        </button>
        <button 
          onClick={() => setActiveTab('telemetry')}
          className={`sidebar-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
        >
          <Activity size={14} />
          Telemetría y Uso
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`sidebar-tab ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <FileText size={14} />
          Bitácora ({logsData.length})
        </button>
      </div>

      {/* Tab 1: TECHNICAL DETAILS */}
      {activeTab === 'detail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Lifecycle Stepper (Ciclo de Vida) */}
          {renderLifecycleStepper(lifecycleStage)}

          {/* Bathtub Curve Graphic */}
          {renderBathtubCurve(lifecycleStage)}

          {/* Render expanded stage info here */}
          {selectedStageInfo && renderStageInfoContent(selectedStageInfo)}

          {/* Radial Life Gauge */}
          {renderRadialGauge(remainingLife, selectedPart.operatingHours, selectedPart.status)}

          {/* Engineering Alerts */}
          {selectedPart.technicianAlert && (
            <div style={{ 
              background: selectedPart.status === 'Replace' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${selectedPart.status === 'Replace' ? 'var(--status-replace)' : 'var(--status-inspect)'}`,
              borderRadius: '8px', 
              padding: '12px', 
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={18} color={selectedPart.status === 'Replace' ? 'var(--status-replace)' : 'var(--status-inspect)'} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px', color: selectedPart.status === 'Replace' ? 'var(--status-replace)' : 'var(--status-inspect)' }}>ALERTA DE MANTENIMIENTO:</strong>
                {selectedPart.technicianAlert}
              </div>
            </div>
          )}

          {/* Technical Specs Grid Card Layout */}
          <div className="technical-grid">
            <div className="technical-card">
              <div className="card-header-row">
                <Wrench size={12} className="card-icon text-blue" />
                <span className="card-title-lbl">Función Mecánica</span>
              </div>
              <p className="card-value-txt">{selectedPart.function}</p>
            </div>

            <div className="technical-card">
              <div className="card-header-row">
                <HardDrive size={12} className="card-icon text-cyan" />
                <span className="card-title-lbl">Material</span>
              </div>
              <p className="card-value-txt highlight-mono">{selectedPart.material}</p>
            </div>

            <div className="technical-card span-2">
              <div className="card-header-row">
                <AlertTriangle size={12} className="card-icon text-orange" />
                <span className="card-title-lbl">Fallas más frecuentes</span>
              </div>
              <p className="card-value-txt">{selectedPart.commonFailures || "No hay fallas recurrentes registradas."}</p>
            </div>

            <div className="technical-card span-2">
              <div className="card-header-row">
                <FileText size={12} className="card-icon text-indigo" />
                <span className="card-title-lbl">Descripción General</span>
              </div>
              <p className="card-value-txt">{selectedPart.description}</p>
            </div>
          </div>

          {/* Installation Commissioning notes */}
          {renderInstallationNotes(installationNotes, selectedPart.entryDate)}

          <div className="detail-section" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '4px' }}>
            <span className="detail-label">Identificador de Malla</span>
            <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedPart.id}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: TELEMETRY AND SERVICE */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Status Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-sidebar-header)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
              <span className="detail-label" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> Entrada en Servicio
              </span>
              <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                {selectedPart.entryDate}
              </span>
            </div>
            
            <div style={{ background: 'var(--bg-sidebar-header)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
              <span className="detail-label" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wrench size={11} /> Horas de Servicio
              </span>
              <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block', marginTop: '4px', color: 'var(--accent-cyan)' }}>
                {selectedPart.operatingHours.toLocaleString()} Hrs
              </span>
            </div>
          </div>

          {/* Render our Beautiful SVG Charts */}
          {renderVibrationChart(vibrationData)}
          {renderStressChart(stressData)}

          {/* Next Planned Maintenance */}
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.04)', 
            border: '1px solid var(--border-glass-active)', 
            borderRadius: '8px', 
            padding: '12px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '4px' }}>
              <Calendar size={14} /> Planificación de Mantenimiento
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <span>Próxima Fecha:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{selectedPart.nextMaintenance}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>Frecuencia Nominal:</span>
              <span>{selectedPart.maintenanceInterval}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MAINTENANCE LOGS */}
      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Quick status setting */}
          <div className="status-changer" style={{ borderTop: 'none', paddingTop: 0 }}>
            <label className="detail-label" htmlFor="status-select">Estado Actual</label>
            <select
              id="status-select"
              className="status-select"
              value={selectedPart.status}
              onChange={(e) => onStatusChange(selectedPart.id, e.target.value)}
              style={{ padding: '8px', fontSize: '0.85rem' }}
            >
              <option value="Operational">Operativo (Operational)</option>
              <option value="Inspect">Requiere Inspección (Inspect)</option>
              <option value="Replace">Requiere Reemplazo (Replace)</option>
            </select>
          </div>

          {/* Add log entry Form */}
          <form onSubmit={handleAddLogSubmit} className="premium-form">
            <span className="form-title-lbl">
              <FileText size={14} className="text-cyan" /> Registrar Mantenimiento
            </span>
            
            <div className="input-group">
              <User size={14} className="input-icon" />
              <input
                type="text"
                placeholder="Nombre del Técnico"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
                className="premium-input"
              />
            </div>
            
            <div className="input-group">
              <textarea
                placeholder="Descripción del trabajo o hallazgos..."
                value={logDesc}
                onChange={(e) => setLogDesc(e.target.value)}
                rows={2}
                className="premium-textarea"
              />
            </div>

            <div className="form-action-row">
              <select
                value={logStatus}
                onChange={(e) => setLogStatus(e.target.value)}
                className="premium-select"
              >
                <option value="">Dejar estado actual</option>
                <option value="Operational">Fijar: Operativo</option>
                <option value="Inspect">Fijar: Inspección</option>
                <option value="Replace">Fijar: Reemplazo</option>
              </select>

              <button type="submit" className="premium-btn">
                <span>Registrar</span>
              </button>
            </div>

            {formError && (
              <span className="form-error-msg">{formError}</span>
            )}
          </form>

          {/* Historical timeline logs list */}
          <div className="timeline-section">
            <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <ClipboardList size={12} /> Historial de Bitácora
            </span>
            
            {logsData.length === 0 ? (
              <div className="timeline-empty">
                <p>No hay mantenimientos previos registrados.</p>
              </div>
            ) : (
              <div className="timeline-container">
                <div className="timeline-line"></div>
                <div className="timeline-list">
                  {logsData.map((log, index) => {
                    let nodeColorClass = 'green';
                    if (log.status === 'Replace') nodeColorClass = 'red';
                    else if (log.status === 'Inspect') nodeColorClass = 'orange';

                    return (
                      <div key={log.id || index} className="timeline-item">
                        <div className={`timeline-node ${nodeColorClass}`}>
                          <div className="timeline-node-inner"></div>
                        </div>
                        <div className="timeline-card">
                          <div className="timeline-card-header">
                            <span className="timeline-tech">
                              <User size={10} style={{ marginRight: '4px' }} />
                              {log.tech}
                            </span>
                            <span className="timeline-date">
                              <Calendar size={10} style={{ marginRight: '4px' }} />
                              {log.date}
                            </span>
                          </div>
                          <p className="timeline-desc">{log.desc}</p>
                          {log.status && (
                            <span className={`timeline-status-badge ${log.status.toLowerCase()}`}>
                              {log.status === 'Operational' ? 'Operativo' : (log.status === 'Inspect' ? 'Inspección' : 'Reemplazo')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
