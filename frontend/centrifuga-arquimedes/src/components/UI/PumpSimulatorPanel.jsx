import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Settings, 
  HelpCircle, 
  TrendingUp, 
  Info,
  Droplet,
  Gauge,
  Zap,
  CheckCircle2
} from 'lucide-react';

const PumpSimulatorPanel = ({
  motorPower,
  setMotorPower,
  pipeDiameter,
  setPipeDiameter
}) => {
  const [hoverQ, setHoverQ] = useState(null);
  const containerRefA = useRef(null);
  const containerRefB = useRef(null);

  // Constants & Math Model
  const H_static = 5; // Static Head (m)
  
  // Friction factor k depending on pipe diameter (1", 2", 3")
  const kFrictionMap = {
    1: 0.08,    // high friction for narrow pipe
    2: 0.02,    // medium friction
    3: 0.005    // low friction for wide pipe
  };
  const k_friction = kFrictionMap[pipeDiameter];

  // Pump Curve H = H_max - a * Q^2
  const H_max = 10 + 10 * motorPower + 2 * (pipeDiameter - 1);
  const a = 0.025 / (motorPower * (1 + 0.3 * (pipeDiameter - 1)));
  const Q_max = Math.sqrt(H_max / a);

  // Operating Point (Punto de Trabajo) by solving H_pump(Q) = H_sys(Q)
  // H_max - a * Q^2 = H_static + k_friction * Q^2
  // Q = sqrt((H_max - H_static) / (a + k_friction))
  const Q_op = Math.sqrt((H_max - H_static) / (a + k_friction));
  const H_op = H_max - a * Q_op * Q_op;

  // Efficiency of system at operating point (%)
  const eta_op = Math.min(85, 65 + 5 * (pipeDiameter - 1) - 1.5 * Math.pow(motorPower - 2.5, 2));

  // Useful Hydraulic Power (kW) = (rho * g * Q * H) / (3600 * 1000)
  // P_hyd = (1000 * 9.81 * Q * H) / 3600000 = (Q * H) / 367
  const P_hyd_kW = (Q_op * H_op) / 367;

  // Operating Electrical/Shaft Power Consumed (kW & HP)
  const P_op_kW = P_hyd_kW / (eta_op / 100);
  const P_op_HP = P_op_kW / 0.746;

  // Shutoff Power (Q = 0)
  const P_shutoff = 0.3 * motorPower;

  // Curvas Data generator
  const maxFlowAxis = 100; // X-axis limit (m3/h)
  const maxHeadAxis = 50;  // Y-axis limit for Head (m)
  const maxPowerAxis = 4.0; // Y-axis limit for Power (HP)

  // Get H(Q) for a specific Q
  const getH = (q) => {
    return Math.max(0, H_max - a * q * q);
  };

  // Get H_sys(Q) for a specific Q
  const getHSys = (q) => {
    return H_static + k_friction * q * q;
  };

  // Get Power P(Q) in HP for a specific Q
  const getP = (q) => {
    const x = Q_op > 0 ? q / Q_op : 0;
    // Ascending polynomial curve that matches P_shutoff at x=0 and P_op_HP at x=1
    return P_shutoff + (P_op_HP - P_shutoff) * (1.2 * x - 0.2 * x * x);
  };

  // Handle Mouse Hover to calculate exact Caudal (Q)
  const handleMouseMove = (e, containerRef) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const svgWidth = 400;
    const paddingLeft = 40;
    const paddingRight = 20;
    const chartWidth = svgWidth - paddingLeft - paddingRight;

    // Calculate percentage along the chart width
    const mouseX = e.clientX - rect.left;
    const chartX = mouseX * (svgWidth / rect.width) - paddingLeft;
    
    if (chartX >= 0 && chartX <= chartWidth) {
      const qVal = (chartX / chartWidth) * maxFlowAxis;
      setHoverQ(qVal);
    } else {
      setHoverQ(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverQ(null);
  };

  // SVG Coordinate Helpers
  const getSvgX = (q) => {
    const paddingLeft = 40;
    const paddingRight = 20;
    const chartWidth = 400 - paddingLeft - paddingRight;
    return paddingLeft + (q / maxFlowAxis) * chartWidth;
  };

  const getSvgYHead = (h) => {
    const paddingTop = 20;
    const paddingBottom = 30;
    const chartHeight = 220 - paddingTop - paddingBottom;
    // Invert Y axis
    return 220 - paddingBottom - (h / maxHeadAxis) * chartHeight;
  };

  const getSvgYPower = (p) => {
    const paddingTop = 20;
    const paddingBottom = 30;
    const chartHeight = 220 - paddingTop - paddingBottom;
    // Invert Y axis
    return 220 - paddingBottom - (p / maxPowerAxis) * chartHeight;
  };

  // Generate Path Strings
  const generatePathD = (points, yConverter) => {
    return points.reduce((acc, p, i) => {
      const x = getSvgX(p.q);
      const y = yConverter(p.y);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  // Build Curves Points
  const curvePoints = [];
  const systemPoints = [];
  const powerPoints = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const q = (i / steps) * maxFlowAxis;
    curvePoints.push({ q, y: getH(q) });
    systemPoints.push({ q, y: getHSys(q) });
    powerPoints.push({ q, y: getP(q) });
  }

  const hPumpPath = generatePathD(curvePoints, getSvgYHead);
  const hSysPath = generatePathD(systemPoints, getSvgYHead);
  const pPath = generatePathD(powerPoints, getSvgYPower);

  // Areas under curves
  const hPumpArea = `${hPumpPath} L ${getSvgX(maxFlowAxis)} ${getSvgYHead(0)} L ${getSvgX(0)} ${getSvgYHead(0)} Z`;
  const pArea = `${pPath} L ${getSvgX(maxFlowAxis)} ${getSvgYPower(0)} L ${getSvgX(0)} ${getSvgYPower(0)} Z`;

  return (
    <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Simulation Title Card */}
      <div className="part-title-row">
        <div>
          <h2 className="part-name">Simulación de Bombas</h2>
          <h3 className="part-spanish-name">Parámetros Dinámicos del Sistema</h3>
        </div>
        <span className="badge-status operational">
          <span className="pulse-dot green"></span>
          Activo
        </span>
      </div>

      {/* 2.2. Panel Derecho: Controles de Entrada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Selector de Potencia */}
        <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Zap size={14} color="var(--accent-cyan)" /> Potencia Nominal del Motor (HP)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[1, 2, 3].map((powerVal) => (
              <label 
                key={powerVal}
                className={`premium-radio-card ${motorPower === powerVal ? 'active' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'center', padding: '10px 4px', borderRadius: '8px', border: '1px solid var(--border-glass)', transition: 'all 0.25s ease' }}
              >
                <input
                  type="radio"
                  name="motorPower"
                  value={powerVal}
                  checked={motorPower === powerVal}
                  onChange={() => setMotorPower(powerVal)}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: motorPower === powerVal ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                  {powerVal} HP
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {Math.round(powerVal * 0.746 * 100) / 100} kW
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Selector de Diámetro de Tubería */}
        <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Droplet size={14} color="var(--accent-blue)" /> Diámetro de Conexión (Aspiración/Descarga)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[1, 2, 3].map((diaVal) => (
              <label 
                key={diaVal}
                className={`premium-radio-card ${pipeDiameter === diaVal ? 'active' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'center', padding: '10px 4px', borderRadius: '8px', border: '1px solid var(--border-glass)', transition: 'all 0.25s ease' }}
              >
                <input
                  type="radio"
                  name="pipeDiameter"
                  value={diaVal}
                  checked={pipeDiameter === diaVal}
                  onChange={() => setPipeDiameter(diaVal)}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: pipeDiameter === diaVal ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                  {diaVal}" Pulgada{diaVal > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {diaVal === 1 ? 'DN25' : diaVal === 2 ? 'DN50' : 'DN80'}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Lógica de Visualización de Datos (Gráficos) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* GRÁFICO A: CURVA DE RENDIMIENTO (Altura vs Caudal) */}
        <div 
          ref={containerRefA}
          style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)', position: 'relative' }}
          onMouseMove={(e) => handleMouseMove(e, containerRefA)}
          onMouseLeave={handleMouseLeave}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <Gauge size={12} color="var(--accent-cyan)" /> Gráfico A: Curva de Rendimiento
            </span>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>H [m] vs Q [m³/h]</span>
          </div>

          <svg viewBox="0 0 400 220" width="100%" height="150" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="pump-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 20, 40, 60, 80, 100].map((tickQ) => (
              <g key={tickQ}>
                <line 
                  x1={getSvgX(tickQ)} 
                  y1={getSvgYHead(0)} 
                  x2={getSvgX(tickQ)} 
                  y2={getSvgYHead(50)} 
                  stroke="rgba(15, 23, 42, 0.05)" 
                  strokeDasharray="3,3" 
                />
                <text x={getSvgX(tickQ)} y={212} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
                  {tickQ}
                </text>
              </g>
            ))}
            {[0, 10, 20, 30, 40, 50].map((tickH) => (
              <g key={tickH}>
                <line 
                  x1={getSvgX(0)} 
                  y1={getSvgYHead(tickH)} 
                  x2={getSvgX(100)} 
                  y2={getSvgYHead(tickH)} 
                  stroke="rgba(15, 23, 42, 0.05)" 
                  strokeDasharray="3,3" 
                />
                <text x={32} y={getSvgYHead(tickH) + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                  {tickH}
                </text>
              </g>
            ))}

            {/* Area and Curves */}
            <path d={hPumpArea} fill="url(#pump-glow)" />
            <path d={hPumpPath} fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" />
            <path d={hSysPath} fill="none" stroke="var(--status-inspect)" strokeWidth="1.5" strokeDasharray="4,2" />

            {/* Axes */}
            <line x1={40} y1={190} x2={380} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />
            <line x1={40} y1={20} x2={40} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />

            {/* Operating Point */}
            {Q_op <= maxFlowAxis && (
              <g>
                <line 
                  x1={getSvgX(Q_op)} 
                  y1={getSvgYHead(0)} 
                  x2={getSvgX(Q_op)} 
                  y2={getSvgYHead(H_op)} 
                  stroke="var(--text-muted)" 
                  strokeDasharray="2,2" 
                />
                <line 
                  x1={getSvgX(0)} 
                  y1={getSvgYHead(H_op)} 
                  x2={getSvgX(Q_op)} 
                  y2={getSvgYHead(H_op)} 
                  stroke="var(--text-muted)" 
                  strokeDasharray="2,2" 
                />
                <circle cx={getSvgX(Q_op)} cy={getSvgYHead(H_op)} r="5" fill="var(--accent-cyan)" stroke="#ffffff" strokeWidth="1.5">
                  <animate attributeName="r" values="5;9;5" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={getSvgX(Q_op)} cy={getSvgYHead(H_op)} r="4" fill="var(--status-operational)" />
              </g>
            )}

            {/* Synchronized Hover vertical line */}
            {hoverQ !== null && (
              <g>
                <line 
                  x1={getSvgX(hoverQ)} 
                  y1={20} 
                  x2={getSvgX(hoverQ)} 
                  y2={190} 
                  stroke="var(--accent-blue)" 
                  strokeWidth="1.5" 
                  strokeDasharray="3,3" 
                />
                <circle cx={getSvgX(hoverQ)} cy={getSvgYHead(getH(hoverQ))} r="4" fill="var(--accent-cyan)" stroke="#ffffff" />
                <circle cx={getSvgX(hoverQ)} cy={getSvgYHead(getHSys(hoverQ))} r="4" fill="var(--status-inspect)" stroke="#ffffff" />
              </g>
            )}
          </svg>

          {/* Dynamic Labels Legend */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.65rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '2px', background: 'var(--accent-cyan)' }}></span>
              Bomba H(Q)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '2px', borderBottom: '2px dashed var(--status-inspect)' }}></span>
              Sistema H_sys(Q)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-operational)' }}></span>
              Punto de Trabajo
            </span>
          </div>
        </div>

        {/* GRÁFICO B: CURVA DE CONSUMO (Potencia vs Caudal) */}
        <div 
          ref={containerRefB}
          style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)', position: 'relative' }}
          onMouseMove={(e) => handleMouseMove(e, containerRefB)}
          onMouseLeave={handleMouseLeave}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <Zap size={12} color="var(--status-operational)" /> Gráfico B: Curva de Consumo
            </span>
            <span style={{ fontFamily: 'monospace', color: 'var(--status-operational)' }}>P [HP] vs Q [m³/h]</span>
          </div>

          <svg viewBox="0 0 400 220" width="100%" height="150" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="power-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--status-operational)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--status-operational)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 20, 40, 60, 80, 100].map((tickQ) => (
              <g key={tickQ}>
                <line 
                  x1={getSvgX(tickQ)} 
                  y1={getSvgYPower(0)} 
                  x2={getSvgX(tickQ)} 
                  y2={getSvgYPower(4.0)} 
                  stroke="rgba(15, 23, 42, 0.05)" 
                  strokeDasharray="3,3" 
                />
                <text x={getSvgX(tickQ)} y={212} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
                  {tickQ}
                </text>
              </g>
            ))}
            {[0.0, 1.0, 2.0, 3.0, 4.0].map((tickP) => (
              <g key={tickP}>
                <line 
                  x1={getSvgX(0)} 
                  y1={getSvgYPower(tickP)} 
                  x2={getSvgX(100)} 
                  y2={getSvgYPower(tickP)} 
                  stroke="rgba(15, 23, 42, 0.05)" 
                  strokeDasharray="3,3" 
                />
                <text x={32} y={getSvgYPower(tickP) + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                  {tickP.toFixed(1)}
                </text>
              </g>
            ))}

            {/* Area and Curves */}
            <path d={pArea} fill="url(#power-glow)" />
            <path d={pPath} fill="none" stroke="var(--status-operational)" strokeWidth="2.5" />

            {/* Axes */}
            <line x1={40} y1={190} x2={380} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />
            <line x1={40} y1={20} x2={40} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />

            {/* Operating Point */}
            {Q_op <= maxFlowAxis && (
              <g>
                <line 
                  x1={getSvgX(Q_op)} 
                  y1={getSvgYPower(0)} 
                  x2={getSvgX(Q_op)} 
                  y2={getSvgYPower(P_op_HP)} 
                  stroke="var(--text-muted)" 
                  strokeDasharray="2,2" 
                />
                <line 
                  x1={getSvgX(0)} 
                  y1={getSvgYPower(P_op_HP)} 
                  x2={getSvgX(Q_op)} 
                  y2={getSvgYPower(P_op_HP)} 
                  stroke="var(--text-muted)" 
                  strokeDasharray="2,2" 
                />
                <circle cx={getSvgX(Q_op)} cy={getSvgYPower(P_op_HP)} r="5" fill="var(--status-operational)" stroke="#ffffff" strokeWidth="1.5">
                  <animate attributeName="r" values="5;9;5" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={getSvgX(Q_op)} cy={getSvgYPower(P_op_HP)} r="4" fill="var(--accent-blue)" />
              </g>
            )}

            {/* Synchronized Hover vertical line */}
            {hoverQ !== null && (
              <g>
                <line 
                  x1={getSvgX(hoverQ)} 
                  y1={20} 
                  x2={getSvgX(hoverQ)} 
                  y2={190} 
                  stroke="var(--accent-blue)" 
                  strokeWidth="1.5" 
                  strokeDasharray="3,3" 
                />
                <circle cx={getSvgX(hoverQ)} cy={getSvgYPower(getP(hoverQ))} r="4" fill="var(--status-operational)" stroke="#ffffff" />
              </g>
            )}
          </svg>

          {/* Axis description */}
          <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.65rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '2px', background: 'var(--status-operational)' }}></span>
              Potencia Absorbida (P)
            </span>
          </div>
        </div>

        {/* Hover Tooltip Overlay (if hovering over curves) */}
        {hoverQ !== null && (
          <div className="history-chart-container" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--accent-blue)', color: '#ffffff', padding: '10px 14px', borderRadius: '8px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', zIndex: 10 }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '4px', color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Lectura del Sensor</span>
              <span>Q = {hoverQ.toFixed(1)} m³/h</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div>• Altura Bomba: <strong style={{ color: 'var(--accent-cyan)' }}>{getH(hoverQ).toFixed(1)} m</strong></div>
              <div>• Altura Sistema: <strong style={{ color: 'var(--status-inspect)' }}>{getHSys(hoverQ).toFixed(1)} m</strong></div>
              <div>• Potencia: <strong style={{ color: 'var(--status-operational)' }}>{getP(hoverQ).toFixed(2)} HP</strong></div>
              <div>• Potencia (kW): <strong>{(getP(hoverQ) * 0.746).toFixed(2)} kW</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Resumen Técnico del Punto de Trabajo */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)', 
        border: '1px solid var(--border-glass-active)', 
        borderRadius: '10px', 
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
          <CheckCircle2 size={14} /> Resumen del Punto de Trabajo
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.65rem' }}>Caudal de Trabajo (Q)</span>
            <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: '800', display: 'block', marginTop: '2px', color: 'var(--accent-cyan)' }}>
              {Q_op.toFixed(1)} m³/h
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {Math.round((Q_op * 1000) / 60)} L/min
            </span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.65rem' }}>Altura Manométrica (H)</span>
            <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: '800', display: 'block', marginTop: '2px', color: 'var(--accent-blue)' }}>
              {H_op.toFixed(1)} m
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {(H_op * 1.422).toFixed(1)} PSI
            </span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.65rem' }}>Consumo Eléctrico (P)</span>
            <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: '800', display: 'block', marginTop: '2px', color: 'var(--status-operational)' }}>
              {P_op_HP.toFixed(2)} HP
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {P_op_kW.toFixed(2)} kW
            </span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.65rem' }}>Eficiencia del Sistema</span>
            <span className="detail-value" style={{ fontSize: '0.9rem', fontWeight: '800', display: 'block', marginTop: '2px', color: 'var(--accent-cyan)' }}>
              {eta_op.toFixed(1)} %
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Coplamiento Motor-Bomba
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.3)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <Info size={14} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            El punto de trabajo actual representa la intersección entre la curva de energía entregada por la bomba de <strong>{motorPower} HP</strong> y la curva de pérdidas por fricción de la tubería de <strong>{pipeDiameter}"</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpSimulatorPanel;
