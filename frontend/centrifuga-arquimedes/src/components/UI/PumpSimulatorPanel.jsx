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
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

const PumpSimulatorPanel = ({
  motorPower,
  setMotorPower,
  geomHeight,
  setGeomHeight,
  pipeLength,
  setPipeLength,
  lossK,
  setLossK,
  flowRate,
  setFlowRate,
  flowUnit,
  setFlowUnit,
  activeDiameter,
  setActiveDiameter,
  enabledDiameters,
  setEnabledDiameters,
  setIsCavitating
}) => {
  const [hoverQ, setHoverQ] = useState(null);
  const containerRefA = useRef(null);
  const containerRefB = useRef(null);

  // 1. Presets / Casos de Estudio Preconfigurados
  const presets = [
    {
      name: "Pozo Profundo (Cavitación)",
      desc: "Aspiración profunda de 6.7m con tubería estrecha. Causa severa caída de presión de entrada.",
      config: {
        motorPower: 2,
        geomHeight: 15,
        pipeLength: 45,
        lossK: 7.5,
        flowRate: 20,
        flowUnit: 'm3h',
        activeDiameter: 1,
        enabledDiameters: { 1: true, 1.5: true, 2: true, 3: true }
      }
    },
    {
      name: "Transferencia Corta (Óptimo)",
      desc: "Circuito corto de 8m, poca altura y tubería de 3\". Trabajo seguro sin fricción ni riesgo.",
      config: {
        motorPower: 2,
        geomHeight: 5,
        pipeLength: 8,
        lossK: 2.0,
        flowRate: 25,
        flowUnit: 'm3h',
        activeDiameter: 3,
        enabledDiameters: { 1: false, 1.5: false, 2: true, 3: true }
      }
    },
    {
      name: "Alta Fricción (Obstruido)",
      desc: "Línea muy larga (75m) y alta pérdida singular K. La curva del sistema se vuelve muy empinada.",
      config: {
        motorPower: 3,
        geomHeight: 12,
        pipeLength: 75,
        lossK: 16.0,
        flowRate: 12,
        flowUnit: 'm3h',
        activeDiameter: 1.5,
        enabledDiameters: { 1: true, 1.5: true, 2: true, 3: false }
      }
    }
  ];

  const applyPreset = (preset) => {
    setMotorPower(preset.config.motorPower);
    setGeomHeight(preset.config.geomHeight);
    setPipeLength(preset.config.pipeLength);
    setLossK(preset.config.lossK);
    setFlowRate(preset.config.flowRate);
    setFlowUnit(preset.config.flowUnit);
    setActiveDiameter(preset.config.activeDiameter);
    setEnabledDiameters(preset.config.enabledDiameters);
  };

  // 2. Unit Conversions
  // Q_calc is always in m3/h for hydraulic formulas
  const Q_calc = flowUnit === 'lh' ? flowRate / 1000 : flowRate;

  // 3. Fluid Dynamics Constants & Calculations
  const diameters = [1, 1.5, 2, 3]; // in inches
  const diameterValues = { 1: 0.0254, 1.5: 0.0381, 2: 0.0508, 3: 0.0762 }; // meters

  // Suction lift (altura de aspiración): assumed 45% of geometric height
  const H_suction = 0.45 * geomHeight;
  
  // Calculate C_friction factor for active diameter
  const D_meters = diameterValues[activeDiameter];
  const Area = (Math.PI / 4) * D_meters * D_meters;
  
  // h_friction = (f * L / D + K) * v^2 / 2g
  // v = Q_m3s / Area = (Q_calc / 3600) / Area
  // h_friction = (0.02 * L / D + K) * (Q_calc / (3600 * Area))^2 / (2 * 9.81)
  const getFrictionLoss = (q, dInch) => {
    const dM = diameterValues[dInch] || 0.0508;
    const aM = (Math.PI / 4) * dM * dM;
    const velocity = (q / 3600) / aM;
    const f_coef = 0.02; // friction factor
    return (f_coef * (pipeLength / dM) + lossK) * (velocity * velocity) / (2 * 9.81);
  };

  // Suction-side friction loss for NPSH Available
  const getSuctionFrictionLoss = (q, dInch) => {
    const dM = diameterValues[dInch] || 0.0508;
    const aM = (Math.PI / 4) * dM * dM;
    const velocity = (q / 3600) / aM;
    const f_coef = 0.02;
    // Suction pipe is 30% of total length and has 45% of singular losses K
    const L_suction = 0.3 * pipeLength;
    const K_suction = 0.45 * lossK;
    return (f_coef * (L_suction / dM) + K_suction) * (velocity * velocity) / (2 * 9.81);
  };

  // Pump Head: H_pump = H_max - a * Q^2
  const getPumpHead = (q, dInch) => {
    const H_max = 12 + 8 * motorPower + 1.5 * (dInch - 1);
    const a_coeff = 0.022 / (motorPower * (1 + 0.25 * (dInch - 1)));
    return Math.max(0, H_max - a_coeff * q * q);
  };

  // System resistant curve: H_sys = H_geom + friction_loss
  const getSystemHead = (q) => {
    return geomHeight + getFrictionLoss(q, activeDiameter);
  };

  // NPSH Required: rising curve
  const getNPSHRequired = (q) => {
    return 1.2 + (0.8 / motorPower) + (0.0016 / motorPower) * q * q;
  };

  // NPSH Available: falling curve
  // NPSHa = P_atmos (10.1m safety scaled) - H_suction - suction_friction
  const getNPSHAvailable = (q) => {
    const loss = getSuctionFrictionLoss(q, activeDiameter);
    return Math.max(0, 10.1 - H_suction - loss);
  };

  // Active Operating parameters at current flow rate
  const H_pump_active = getPumpHead(Q_calc, activeDiameter);
  const H_sys_active = getSystemHead(Q_calc);
  const NPSHr_active = getNPSHRequired(Q_calc);
  const NPSHa_active = getNPSHAvailable(Q_calc);

  // Cavitation Check
  const isCavitatingActive = NPSHa_active < NPSHr_active;

  // Notify App.jsx about cavitation
  useEffect(() => {
    setIsCavitating(isCavitatingActive);
  }, [isCavitatingActive, setIsCavitating]);

  // Compute maximum flow rate limit (where pump head is 0 for 3" pipe)
  const Q_limit = 100; // fixed X-axis range (m3/h)

  // 4. Mouse Hover Interaction mapping
  const handleMouseMove = (e, containerRef) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const svgWidth = 400;
    const paddingLeft = 40;
    const paddingRight = 20;
    const chartWidth = svgWidth - paddingLeft - paddingRight;

    const mouseX = e.clientX - rect.left;
    const chartX = mouseX * (svgWidth / rect.width) - paddingLeft;
    
    if (chartX >= 0 && chartX <= chartWidth) {
      const qVal = (chartX / chartWidth) * Q_limit;
      setHoverQ(qVal);
    } else {
      setHoverQ(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverQ(null);
  };

  // 5. SVG Coordinate Conversions
  const maxHeadAxis = 50;  // Y-axis limit for Head (m)
  const maxNPSHAxis = 10;  // Y-axis limit for NPSH (m)

  const getSvgX = (q) => {
    const paddingLeft = 40;
    const paddingRight = 20;
    const chartWidth = 400 - paddingLeft - paddingRight;
    return paddingLeft + (q / Q_limit) * chartWidth;
  };

  const getSvgYHead = (h) => {
    const clampedH = Math.min(maxHeadAxis, Math.max(0, h));
    const paddingTop = 20;
    const paddingBottom = 30;
    const chartHeight = 220 - paddingTop - paddingBottom;
    return 220 - paddingBottom - (clampedH / maxHeadAxis) * chartHeight;
  };

  const getSvgYNPSH = (n) => {
    const clampedN = Math.min(maxNPSHAxis, Math.max(0, n));
    const paddingTop = 20;
    const paddingBottom = 30;
    const chartHeight = 220 - paddingTop - paddingBottom;
    return 220 - paddingBottom - (clampedN / maxNPSHAxis) * chartHeight;
  };

  const generatePathD = (points, yConverter) => {
    return points.reduce((acc, p, i) => {
      const x = getSvgX(p.q);
      const y = yConverter(p.y);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  // Generate curves arrays
  const steps = 40;
  const pumpCurvesData = {};
  diameters.forEach(d => {
    if (enabledDiameters[d]) {
      pumpCurvesData[d] = [];
    }
  });
  const sysPoints = [];
  const npshrPoints = [];
  const npshaPoints = [];

  for (let i = 0; i <= steps; i++) {
    const q = (i / steps) * Q_limit;
    diameters.forEach(d => {
      if (enabledDiameters[d]) {
        pumpCurvesData[d].push({ q, y: getPumpHead(q, d) });
      }
    });
    sysPoints.push({ q, y: getSystemHead(q) });
    npshrPoints.push({ q, y: getNPSHRequired(q) });
    npshaPoints.push({ q, y: getNPSHAvailable(q) });
  }

  // Color mapping for diameter curves
  const diameterColors = {
    1: '#eab308',   // Yellow
    1.5: '#f97316', // Orange
    2: '#06b6d4',   // Cyan
    3: '#3b82f6'    // Blue
  };

  const flowDisplayVal = (q) => {
    return flowUnit === 'lh' ? q * 1000 : q;
  };

  const toggleDiameter = (dia) => {
    setEnabledDiameters(prev => {
      const next = { ...prev, [dia]: !prev[dia] };
      // Make sure at least one is enabled
      const enabledList = Object.keys(next).filter(k => next[k]);
      if (enabledList.length === 0) return prev;
      
      // If active diameter was disabled, switch active to another enabled one
      if (!next[activeDiameter]) {
        setActiveDiameter(parseFloat(enabledList[0]));
      }
      return next;
    });
  };

  return (
    <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header Info */}
      <div className="part-title-row">
        <div>
          <h2 className="part-name">Simulador de Circuito</h2>
          <h3 className="part-spanish-name">Pérdida de Carga y NPSH</h3>
        </div>
        {isCavitatingActive ? (
          <span className="badge-status replace" style={{ animation: 'pulse-ring 1.5s infinite' }}>
            <AlertTriangle size={13} /> Cavitación
          </span>
        ) : (
          <span className="badge-status operational">
            <span className="pulse-dot green"></span> Operativo
          </span>
        )}
      </div>

      {/* Casos de Uso Preconfigurados */}
      <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
        <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 'bold' }}>
          <Activity size={14} color="var(--accent-cyan)" /> Casos de Estudio (Presets)
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {presets.map((p, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              onClick={() => applyPreset(p)}
              style={{
                width: '100%',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: 'rgba(255, 255, 255, 0.4)',
                gap: '2px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                <Play size={10} style={{ color: 'var(--accent-cyan)' }} /> {p.name}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2.1. Panel Izquierdo: Inputs de Parámetros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Potencia del Motor */}
        <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Zap size={14} color="var(--accent-cyan)" /> Potencia del Motor (HP)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[1, 2, 3].map((powerVal) => (
              <label 
                key={powerVal}
                className={`premium-radio-card ${motorPower === powerVal ? 'active' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'center', padding: '8px 2px' }}
              >
                <input
                  type="radio"
                  name="motorPower"
                  value={powerVal}
                  checked={motorPower === powerVal}
                  onChange={() => setMotorPower(powerVal)}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: motorPower === powerVal ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                  {powerVal} HP
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Diámetros de Succión (Selector Múltiple) y Diámetro Activo */}
        <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Droplet size={14} color="var(--accent-blue)" /> Diámetros de Succión Habilitados
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
              {diameters.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDiameter(d)}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    border: '1px solid',
                    borderColor: enabledDiameters[d] ? diameterColors[d] : 'var(--border-glass)',
                    background: enabledDiameters[d] ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
                    color: enabledDiameters[d] ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {d}"
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}>
            <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              • Instalar Diámetro Operacional Activo
            </span>
            <select
              className="status-select"
              value={activeDiameter}
              onChange={(e) => setActiveDiameter(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
            >
              {diameters.map((d) => enabledDiameters[d] && (
                <option key={d} value={d}>
                  Tubería de {d} pulgada{d > 1 ? 's' : ''} (Color: {d === 1 ? 'Amarillo' : d === 1.5 ? 'Naranja' : d === 2 ? 'Cian' : 'Azul'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Parámetros Numéricos del Circuito */}
        <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <span className="detail-label" style={{ fontSize: '0.65rem' }}>Altura Geométrica (m)</span>
            <input
              type="number"
              min="0"
              max="40"
              value={geomHeight}
              onChange={(e) => setGeomHeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="premium-input"
              style={{ padding: '6px', fontSize: '0.8rem' }}
            />
          </div>
          <div>
            <span className="detail-label" style={{ fontSize: '0.65rem' }}>Largo de Tubería (m)</span>
            <input
              type="number"
              min="1"
              max="150"
              value={pipeLength}
              onChange={(e) => setPipeLength(Math.max(1, parseFloat(e.target.value) || 1))}
              className="premium-input"
              style={{ padding: '6px', fontSize: '0.8rem' }}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span className="detail-label" style={{ fontSize: '0.65rem' }}>Pérdidas Singulares Accesorios (K)</span>
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={lossK}
              onChange={(e) => setLossK(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              className="premium-input"
              style={{ padding: '6px', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* Caudal manual y unidad */}
        <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Gauge size={14} color="var(--accent-cyan)" /> Control de Caudal de Trabajo
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              min="0"
              max={flowUnit === 'lh' ? 100000 : 100}
              value={flowRate}
              onChange={(e) => setFlowRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="premium-input"
              style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
            />
            <select
              className="premium-select"
              value={flowUnit}
              onChange={(e) => {
                const oldUnit = flowUnit;
                const newUnit = e.target.value;
                setFlowUnit(newUnit);
                if (oldUnit === 'm3h' && newUnit === 'lh') {
                  setFlowRate(flowRate * 1000);
                } else if (oldUnit === 'lh' && newUnit === 'm3h') {
                  setFlowRate(Math.round(flowRate / 100) / 10);
                }
              }}
              style={{ width: '80px', padding: '6px' }}
            >
              <option value="m3h">m³/h</option>
              <option value="lh">L/h</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2.2. Panel Derecho: Gráficas Interactivas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* GRÁFICO 1: CURVAS DE SERVICIO */}
        <div 
          ref={containerRefA}
          style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)', position: 'relative' }}
          onMouseMove={(e) => handleMouseMove(e, containerRefA)}
          onMouseLeave={handleMouseLeave}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <Gauge size={12} color="var(--accent-cyan)" /> Gráfico 1: Curvas de Servicio
            </span>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>H [m] vs Q [{flowUnit === 'lh' ? 'L/h' : 'm³/h'}]</span>
          </div>

          <svg viewBox="0 0 400 220" width="100%" height="150" style={{ overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100].map((tickQ) => (
              <g key={tickQ}>
                <line 
                  x1={getSvgX(tickQ)} 
                  y1={getSvgYHead(0)} 
                  x2={getSvgX(tickQ)} 
                  y2={getSvgYHead(50)} 
                  stroke="rgba(15, 23, 42, 0.04)" 
                  strokeDasharray="3,3" 
                />
                <text x={getSvgX(tickQ)} y={212} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
                  {flowDisplayVal(tickQ)}
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
                  stroke="rgba(15, 23, 42, 0.04)" 
                  strokeDasharray="3,3" 
                />
                <text x={32} y={getSvgYHead(tickH) + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                  {tickH}
                </text>
              </g>
            ))}

            {/* Families of Pump curves */}
            {diameters.map(d => {
              if (enabledDiameters[d]) {
                const pathStr = generatePathD(pumpCurvesData[d], getSvgYHead);
                return (
                  <path 
                    key={d} 
                    d={pathStr} 
                    fill="none" 
                    stroke={diameterColors[d]} 
                    strokeWidth={d === activeDiameter ? '2.5' : '1.2'} 
                    opacity={d === activeDiameter ? 1.0 : 0.45}
                  />
                );
              }
              return null;
            })}

            {/* Resistant system curve */}
            <path d={generatePathD(sysPoints, getSvgYHead)} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3,2" />

            {/* Axes */}
            <line x1={40} y1={190} x2={380} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />
            <line x1={40} y1={20} x2={40} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />

            {/* Operating Point (Manual flow rate marker) */}
            {Q_calc <= Q_limit && (
              <g>
                <line 
                  x1={getSvgX(Q_calc)} 
                  y1={getSvgYHead(0)} 
                  x2={getSvgX(Q_calc)} 
                  y2={getSvgYHead(H_pump_active)} 
                  stroke="var(--text-muted)" 
                  strokeWidth="0.8"
                  strokeDasharray="2,2" 
                />
                <line 
                  x1={getSvgX(0)} 
                  y1={getSvgYHead(H_pump_active)} 
                  x2={getSvgX(Q_calc)} 
                  y2={getSvgYHead(H_pump_active)} 
                  stroke="var(--text-muted)" 
                  strokeWidth="0.8"
                  strokeDasharray="2,2" 
                />
                <circle cx={getSvgX(Q_calc)} cy={getSvgYHead(H_pump_active)} r="4.5" fill={diameterColors[activeDiameter]} stroke="#ffffff" strokeWidth="1" />
                <circle cx={getSvgX(Q_calc)} cy={getSvgYHead(H_sys_active)} r="4.5" fill="#64748b" stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {/* Synchronized Hover line */}
            {hoverQ !== null && (
              <g>
                <line x1={getSvgX(hoverQ)} y1={20} x2={getSvgX(hoverQ)} y2={190} stroke="var(--accent-blue)" strokeWidth="1.2" strokeDasharray="3,3" />
                <circle cx={getSvgX(hoverQ)} cy={getSvgYHead(getPumpHead(hoverQ, activeDiameter))} r="3.5" fill="var(--accent-cyan)" stroke="#ffffff" />
                <circle cx={getSvgX(hoverQ)} cy={getSvgYHead(getSystemHead(hoverQ))} r="3.5" fill="#64748b" stroke="#ffffff" />
              </g>
            )}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', fontSize: '0.62rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
            {diameters.map(d => enabledDiameters[d] && (
              <span key={d} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '2px', background: diameterColors[d] }}></span>
                Bomba {d}" {d === activeDiameter ? '(Activa)' : ''}
              </span>
            ))}
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '2px', borderBottom: '2px dashed #64748b' }}></span>
              Sistema
            </span>
          </div>
        </div>

        {/* GRÁFICO 2: CURVA NPSH */}
        <div 
          ref={containerRefB}
          style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)', position: 'relative' }}
          onMouseMove={(e) => handleMouseMove(e, containerRefB)}
          onMouseLeave={handleMouseLeave}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <Activity size={12} color="var(--accent-indigo)" /> Gráfico 2: Márgenes de Cavitación (NPSH)
            </span>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent-indigo)' }}>NPSH [m] vs Q [{flowUnit === 'lh' ? 'L/h' : 'm³/h'}]</span>
          </div>

          <svg viewBox="0 0 400 220" width="100%" height="150" style={{ overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100].map((tickQ) => (
              <g key={tickQ}>
                <line 
                  x1={getSvgX(tickQ)} 
                  y1={getSvgYNPSH(0)} 
                  x2={getSvgX(tickQ)} 
                  y2={getSvgYNPSH(10)} 
                  stroke="rgba(15, 23, 42, 0.04)" 
                  strokeDasharray="3,3" 
                />
                <text x={getSvgX(tickQ)} y={212} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
                  {flowDisplayVal(tickQ)}
                </text>
              </g>
            ))}
            {[0, 2, 4, 6, 8, 10].map((tickN) => (
              <g key={tickN}>
                <line 
                  x1={getSvgX(0)} 
                  y1={getSvgYNPSH(tickN)} 
                  x2={getSvgX(100)} 
                  y2={getSvgYNPSH(tickN)} 
                  stroke="rgba(15, 23, 42, 0.04)" 
                  strokeDasharray="3,3" 
                />
                <text x={32} y={getSvgYNPSH(tickN) + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                  {tickN}
                </text>
              </g>
            ))}

            {/* Curves */}
            {/* NPSHr (Required) - Red ascending */}
            <path d={generatePathD(npshrPoints, getSvgYNPSH)} fill="none" stroke="var(--status-replace)" strokeWidth="2" />
            {/* NPSHa (Available) - Green/Blue descending */}
            <path d={generatePathD(npshaPoints, getSvgYNPSH)} fill="none" stroke="var(--status-operational)" strokeWidth="2" />

            {/* Cavitation warning overlay shading */}
            {/* We shade the area where Q makes NPSHa < NPSHr */}
            <path 
              d={`${generatePathD(npshrPoints, getSvgYNPSH)} L ${getSvgX(100)} ${getSvgYNPSH(0)} L ${getSvgX(0)} ${getSvgYNPSH(0)} Z`}
              fill="rgba(239, 68, 68, 0.02)"
              pointerEvents="none"
            />

            {/* Axes */}
            <line x1={40} y1={190} x2={380} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />
            <line x1={40} y1={20} x2={40} y2={190} stroke="var(--text-muted)" strokeWidth="1.2" />

            {/* Operating Point */}
            {Q_calc <= Q_limit && (
              <g>
                <line 
                  x1={getSvgX(Q_calc)} 
                  y1={getSvgYNPSH(0)} 
                  x2={getSvgX(Q_calc)} 
                  y2={getSvgYNPSH(Math.max(NPSHa_active, NPSHr_active))} 
                  stroke="var(--text-muted)" 
                  strokeWidth="0.8"
                  strokeDasharray="2,2" 
                />
                <circle cx={getSvgX(Q_calc)} cy={getSvgYNPSH(NPSHa_active)} r="4.5" fill="var(--status-operational)" stroke="#ffffff" strokeWidth="1" />
                <circle cx={getSvgX(Q_calc)} cy={getSvgYNPSH(NPSHr_active)} r="4.5" fill="var(--status-replace)" stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {/* Synchronized Hover line */}
            {hoverQ !== null && (
              <g>
                <line x1={getSvgX(hoverQ)} y1={20} x2={getSvgX(hoverQ)} y2={190} stroke="var(--accent-blue)" strokeWidth="1.2" strokeDasharray="3,3" />
                <circle cx={getSvgX(hoverQ)} cy={getSvgYNPSH(getNPSHAvailable(hoverQ))} r="3.5" fill="var(--status-operational)" stroke="#ffffff" />
                <circle cx={getSvgX(hoverQ)} cy={getSvgYNPSH(getNPSHRequired(hoverQ))} r="3.5" fill="var(--status-replace)" stroke="#ffffff" />
              </g>
            )}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.62rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '2px', background: 'var(--status-operational)' }}></span>
              NPSH Disponible (NPSHa)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '2px', background: 'var(--status-replace)' }}></span>
              NPSH Requerido (NPSHr)
            </span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoverQ !== null && (
          <div className="history-chart-container" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--accent-blue)', color: '#ffffff', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', zIndex: 10 }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '4px', color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Lectura del Sensor</span>
              <span>Q = {flowDisplayVal(hoverQ).toFixed(0)} {flowUnit === 'lh' ? 'L/h' : 'm³/h'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div>• Altura Bomba: <strong style={{ color: 'var(--accent-cyan)' }}>{getPumpHead(hoverQ, activeDiameter).toFixed(1)} m</strong></div>
              <div>• Pérdida Sistema: <strong style={{ color: '#64748b' }}>{getFrictionLoss(hoverQ, activeDiameter).toFixed(1)} m</strong></div>
              <div>• NPSH Disponible: <strong style={{ color: 'var(--status-operational)' }}>{getNPSHAvailable(hoverQ).toFixed(2)} m</strong></div>
              <div>• NPSH Requerido: <strong style={{ color: 'var(--status-replace)' }}>{getNPSHRequired(hoverQ).toFixed(2)} m</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Resumen de Trabajo y Alerta de Cavitación */}
      {isCavitatingActive && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid var(--status-replace)',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          animation: 'pulse-ring 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: 'var(--status-replace)', fontSize: '0.75rem' }}>
            <AlertTriangle size={16} /> ALERTA: CAVITACIÓN DETECTADA
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-primary)', lineHeight: '1.35' }}>
            La presión en la succión (NPSHa: {NPSHa_active.toFixed(2)}m) es menor que el requerimiento físico de la bomba (NPSHr: {NPSHr_active.toFixed(2)}m). 
            <strong> Soluciones:</strong> aumenta el diámetro de succión, acorta el circuito, reduce las pérdidas K, o disminuye el caudal.
          </p>
        </div>
      )}

      {/* Resumen Numérico */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)', 
        border: '1px solid var(--border-glass-active)', 
        borderRadius: '10px', 
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
          <CheckCircle2 size={14} /> Estado Operacional Activo
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.58rem' }}>Altura Entregada</span>
            <span className="detail-value" style={{ fontSize: '0.85rem', fontWeight: '800', display: 'block', color: 'var(--accent-cyan)' }}>
              {H_pump_active.toFixed(1)} m
            </span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.58rem' }}>Pérdida por Fricción</span>
            <span className="detail-value" style={{ fontSize: '0.85rem', fontWeight: '800', display: 'block', color: '#64748b' }}>
              {(H_sys_active - geomHeight).toFixed(1)} m
            </span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.58rem' }}>NPSH Disponible</span>
            <span className="detail-value" style={{ fontSize: '0.85rem', fontWeight: '800', display: 'block', color: 'var(--status-operational)' }}>
              {NPSHa_active.toFixed(2)} m
            </span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <span className="detail-label" style={{ fontSize: '0.58rem' }}>NPSH Requerido</span>
            <span className="detail-value" style={{ fontSize: '0.85rem', fontWeight: '800', display: 'block', color: 'var(--status-replace)' }}>
              {NPSHr_active.toFixed(2)} m
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.3)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
          <Info size={13} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            La altura de succión geométrica de este circuito es de <strong>{H_suction.toFixed(1)}m</strong>. 
            El caudal regulado exige una presión mínima de entrada que disminuye al ensanchar la tubería.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpSimulatorPanel;
