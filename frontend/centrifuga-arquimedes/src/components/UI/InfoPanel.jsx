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
            <ShieldCheck size={13} /> Operativo
          </span>
        );
      case 'Inspect':
        return (
          <span className="badge-status inspect">
            <AlertTriangle size={13} /> Inspección
          </span>
        );
      case 'Replace':
        return (
          <span className="badge-status replace">
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
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" />
          <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(15, 23, 42, 0.15)" />

          {/* Area under line */}
          <path d={areaD} fill="url(#chart-glow)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />

          {/* Dots & Labels */}
          {points.map((p, i) => (
            <g key={i}>
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
          
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" />
          <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="rgba(15, 23, 42, 0.05)" strokeDasharray="3,3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(15, 23, 42, 0.15)" />

          <path d={areaD} fill="url(#stress-glow)" />
          <path d={pathD} fill="none" stroke="var(--status-replace)" strokeWidth="2" />

          {points.map((p, i) => (
            <g key={i}>
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

  const renderLifecycleStepper = (stage, life) => {
    const stages = [
      { key: 'Installation', label: '1. Instalación' },
      { key: 'Maintenance', label: '2. Mantenimiento' },
      { key: 'Replacement', label: '3. Reemplazo' }
    ];

    return (
      <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        <span className="detail-label" style={{ fontSize: '0.7rem' }}>Etapa del Ciclo de Vida</span>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '4px 0' }}>
          <div style={{ position: 'absolute', top: '11px', left: '15%', right: '15%', height: '2px', background: '#e2e8f0', zIndex: 1 }} />
          
          {stages.map((st, idx) => {
            const isActive = stage === st.key;
            const isCompleted = (stage === 'Maintenance' && idx === 0) || (stage === 'Replacement' && idx <= 1);
            
            return (
              <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: isActive ? 'var(--accent-blue)' : (isCompleted ? 'var(--status-operational)' : '#cbd5e1'),
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  boxShadow: isActive ? '0 0 8px rgba(30, 58, 138, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{ 
                  fontSize: '0.62rem', 
                  fontWeight: isActive ? 'bold' : '600', 
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)', 
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '4px', borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Vida Útil Remanente:</span>
            <strong style={{ 
              color: life > 50 ? 'var(--status-operational)' : (life > 20 ? 'var(--status-inspect)' : 'var(--status-replace)') 
            }}>{life}%</strong>
          </div>
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${life}%`, 
              background: life > 50 ? 'var(--status-operational)' : (life > 20 ? 'var(--status-inspect)' : 'var(--status-replace)'),
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>
      </div>
    );
  };

  const renderInstallationNotes = (notes, date) => {
    return (
      <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
          <ShieldCheck size={14} color="var(--status-operational)" /> Protocolo de Puesta en Marcha (Instalación)
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Fecha de Montaje:</span>
          <span>{date}</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '6px', border: '1px dotted var(--border-glass)', marginTop: '4px' }}>
          {notes}
        </p>
      </div>
    );
  };

  const handleAddLogSubmit = (e) => {
    e.preventDefault();
    if (!techName.trim() || !logDesc.trim()) {
      setFormError('Por favor complete el nombre del técnico y la descripción.');
      return;
    }
    
    // Call parents callback
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
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', gap: '4px', paddingBottom: '2px' }}>
        <button 
          onClick={() => setActiveTab('detail')}
          className={`btn-secondary ${activeTab === 'detail' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem', borderRadius: '6px', borderBottom: activeTab === 'detail' ? '2px solid var(--accent-cyan)' : '1px solid transparent' }}
        >
          Ficha Técnica
        </button>
        <button 
          onClick={() => setActiveTab('telemetry')}
          className={`btn-secondary ${activeTab === 'telemetry' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem', borderRadius: '6px', borderBottom: activeTab === 'telemetry' ? '2px solid var(--accent-cyan)' : '1px solid transparent' }}
        >
          Telemetría y Uso
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`btn-secondary ${activeTab === 'logs' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem', borderRadius: '6px', borderBottom: activeTab === 'logs' ? '2px solid var(--accent-cyan)' : '1px solid transparent' }}
        >
          Bitácora ({logsData.length})
        </button>
      </div>

      {/* Tab 1: TECHNICAL DETAILS */}
      {activeTab === 'detail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Lifecycle Stepper (Ciclo de Vida) */}
          {renderLifecycleStepper(lifecycleStage, remainingLife)}

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

          <div className="detail-section">
            <span className="detail-label">Función Mecánica</span>
            <p className="detail-value" style={{ fontSize: '0.85rem' }}>{selectedPart.function}</p>
          </div>

          <div className="detail-section">
            <span className="detail-label">Material de Construcción</span>
            <span className="detail-value material" style={{ fontSize: '0.8rem' }}>
              <HardDrive size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {selectedPart.material}
            </span>
          </div>

          <div className="detail-section">
            <span className="detail-label">Fallas más frecuentes</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'var(--bg-sidebar-header)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
              <p className="detail-value" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {selectedPart.commonFailures || "No hay registros cargados para esta pieza."}
              </p>
            </div>
          </div>

          <div className="detail-section">
            <span className="detail-label">Descripción General</span>
            <p className="detail-value" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedPart.description}</p>
          </div>

          {/* Installation Commissioning notes */}
          {renderInstallationNotes(installationNotes, selectedPart.entryDate)}

          <div className="detail-section" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
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
          <form onSubmit={handleAddLogSubmit} style={{ background: 'var(--bg-sidebar-header)', border: '1px solid var(--border-glass)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={12} /> Registrar Mantenimiento
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input
                type="text"
                placeholder="Nombre del Técnico"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <textarea
                placeholder="Descripción del trabajo o hallazgos..."
                value={logDesc}
                onChange={(e) => setLogDesc(e.target.value)}
                rows={2}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={logStatus}
                onChange={(e) => setLogStatus(e.target.value)}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '6px', padding: '5px', fontSize: '0.75rem', flex: 1, outline: 'none' }}
              >
                <option value="" style={{ background: 'var(--bg-secondary)' }}>Dejar estado actual</option>
                <option value="Operational" style={{ background: 'var(--bg-secondary)' }}>Fijar: Operativo</option>
                <option value="Inspect" style={{ background: 'var(--bg-secondary)' }}>Fijar: Inspección</option>
                <option value="Replace" style={{ background: 'var(--bg-secondary)' }}>Fijar: Reemplazo</option>
              </select>

              <button type="submit" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)', color: '#ffffff', cursor: 'pointer' }}>
                Registrar
              </button>
            </div>

            {formError && (
              <span style={{ color: 'var(--status-replace)', fontSize: '0.7rem' }}>{formError}</span>
            )}
          </form>

          {/* Historical timeline logs list */}
          <div className="detail-section">
            <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <ClipboardList size={12} /> Historial de Bitácora
            </span>
            
            {logsData.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                No hay mantenimientos previos registrados.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {logsData.map((log, index) => (
                  <div key={log.id || index} style={{ background: 'var(--bg-sidebar-header)', border: '1px solid var(--border-glass)', borderLeft: '3px solid var(--accent-cyan)', padding: '8px 10px', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={10} /> {log.tech}
                      </span>
                      <span>{log.date}</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{log.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
