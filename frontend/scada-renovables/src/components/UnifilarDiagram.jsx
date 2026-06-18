import React from 'react';
import { AlertCircle, Zap } from 'lucide-react';

export default function UnifilarDiagram({ assets, breakers, onToggleBreaker }) {
  const getAssetData = (tagId) => {
    const asset = assets.find((a) => a.tagId === tagId);
    return asset || { status: 'OFFLINE', telemetry: {} };
  };

  const isEnergized = (tagId) => {
    // Transformer is energized if closed and any wind/inverter is delivering power
    if (tagId === 'TRAFO-01') {
      return (
        breakers['TRAFO-01'] &&
        (isEnergized('INV-01') ||
          isEnergized('INV-02') ||
          isEnergized('WTG-01') ||
          isEnergized('WTG-02'))
      );
    }
    if (tagId === 'INV-01') {
      return (
        breakers['INV-01'] &&
        breakers['PV-ARRAY-01'] &&
        getAssetData('PV-ARRAY-01').telemetry['POWER'] > 0
      );
    }
    if (tagId === 'INV-02') {
      return (
        breakers['INV-02'] &&
        breakers['PV-ARRAY-02'] &&
        getAssetData('PV-ARRAY-02').telemetry['POWER'] > 0
      );
    }
    // WTG is energized if breaker closed and wind speed is generating power
    return breakers[tagId] && getAssetData(tagId).telemetry['POWER'] > 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
        return 'var(--hmi-online)';
      case 'FAULT':
        return 'var(--hmi-fault)';
      case 'MAINTENANCE':
        return 'var(--hmi-maintenance)';
      default:
        return 'var(--hmi-offline)';
    }
  };

  return (
    <div
      className="hmi-card highlight"
      style={{ flex: 1, minHeight: '380px', display: 'flex', flexDirection: 'column' }}
    >
      <div className="hmi-card-title">
        <Zap size={16} /> Diagrama Eléctrico Unifilar de la Planta
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: '320px',
          background: '#07090e',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <svg viewBox="0 0 800 320" width="100%" height="100%">
          {/* DEFINITIONS FOR PARTICLES & FILTERS */}
          <defs>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--hmi-cyan)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--hmi-cyan)" stopOpacity={0.8} />
            </linearGradient>
          </defs>

          {/* POWER FLOW LINES (CONNECTIONS) */}

          {/* Solar Panel 1 -> Inverter 1 */}
          <path
            d="M 120,60 L 260,60"
            className={`unifilar-line ${isEnergized('PV-ARRAY-01') ? 'energized' : ''}`}
          />
          {isEnergized('PV-ARRAY-01') && (
            <path
              d="M 120,60 L 260,60"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Solar Panel 2 -> Inverter 2 */}
          <path
            d="M 120,130 L 260,130"
            className={`unifilar-line ${isEnergized('PV-ARRAY-02') ? 'energized' : ''}`}
          />
          {isEnergized('PV-ARRAY-02') && (
            <path
              d="M 120,130 L 260,130"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Inverter 1 -> Main Bus */}
          <path
            d="M 340,60 L 440,60 L 440,160"
            className={`unifilar-line ${isEnergized('INV-01') ? 'energized' : ''}`}
          />
          {isEnergized('INV-01') && (
            <path
              d="M 340,60 L 440,60 L 440,160"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Inverter 2 -> Main Bus */}
          <path
            d="M 340,130 L 440,130 L 440,160"
            className={`unifilar-line ${isEnergized('INV-02') ? 'energized' : ''}`}
          />
          {isEnergized('INV-02') && (
            <path
              d="M 340,130 L 440,130 L 440,160"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Wind Turbine 1 -> Main Bus */}
          <path
            d="M 120,200 L 440,200"
            className={`unifilar-line ${isEnergized('WTG-01') ? 'energized' : ''}`}
          />
          {isEnergized('WTG-01') && (
            <path
              d="M 120,200 L 440,200"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Wind Turbine 2 -> Main Bus */}
          <path
            d="M 120,270 L 440,270 L 440,200"
            className={`unifilar-line ${isEnergized('WTG-02') ? 'energized' : ''}`}
          />
          {isEnergized('WTG-02') && (
            <path
              d="M 120,270 L 440,270 L 440,200"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Main Bus -> Transformer 1 */}
          <path
            d="M 440,180 L 560,180"
            className={`unifilar-line ${isEnergized('TRAFO-01') ? 'energized' : ''}`}
          />
          {isEnergized('TRAFO-01') && (
            <path
              d="M 440,180 L 560,180"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Transformer 1 -> Grid */}
          <path
            d="M 640,180 L 730,180"
            className={`unifilar-line ${breakers['TRAFO-01'] && isEnergized('TRAFO-01') ? 'energized' : ''}`}
          />
          {breakers['TRAFO-01'] && isEnergized('TRAFO-01') && (
            <path
              d="M 640,180 L 730,180"
              className="power-flow-particle"
              stroke="var(--hmi-cyan)"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* 1. SOLAR ARRAYS (GENERATORS) */}
          <g transform="translate(40, 35)">
            <rect
              x="0"
              y="0"
              width="80"
              height="46"
              rx="4"
              fill="var(--hmi-panel)"
              stroke={getStatusColor(getAssetData('PV-ARRAY-01').status)}
              strokeWidth="2"
            />
            <text
              x="40"
              y="18"
              fill="var(--text-bright)"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              SOLAR PV-01
            </text>
            <text
              x="40"
              y="32"
              fill="var(--hmi-cyan)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('PV-ARRAY-01').telemetry['POWER'] || 0).toFixed(2)} MW
            </text>
            {getAssetData('PV-ARRAY-01').status === 'FAULT' && (
              <AlertCircle x="64" y="6" size={10} color="var(--hmi-fault)" />
            )}
          </g>

          <g transform="translate(40, 105)">
            <rect
              x="0"
              y="0"
              width="80"
              height="46"
              rx="4"
              fill="var(--hmi-panel)"
              stroke={getStatusColor(getAssetData('PV-ARRAY-02').status)}
              strokeWidth="2"
            />
            <text
              x="40"
              y="18"
              fill="var(--text-bright)"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              SOLAR PV-02
            </text>
            <text
              x="40"
              y="32"
              fill="var(--hmi-cyan)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('PV-ARRAY-02').telemetry['POWER'] || 0).toFixed(2)} MW
            </text>
            {getAssetData('PV-ARRAY-02').status === 'FAULT' && (
              <AlertCircle x="64" y="6" size={10} color="var(--hmi-fault)" />
            )}
          </g>

          {/* 2. WIND TURBINES (GENERATORS) */}
          <g transform="translate(40, 175)">
            <rect
              x="0"
              y="0"
              width="80"
              height="46"
              rx="4"
              fill="var(--hmi-panel)"
              stroke={getStatusColor(getAssetData('WTG-01').status)}
              strokeWidth="2"
            />
            <text
              x="40"
              y="18"
              fill="var(--text-bright)"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              EOLICA WTG-01
            </text>
            <text
              x="40"
              y="32"
              fill="var(--hmi-cyan)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('WTG-01').telemetry['POWER'] || 0).toFixed(2)} MW
            </text>
            {getAssetData('WTG-01').status === 'FAULT' && (
              <AlertCircle x="64" y="6" size={10} color="var(--hmi-fault)" />
            )}
          </g>

          <g transform="translate(40, 245)">
            <rect
              x="0"
              y="0"
              width="80"
              height="46"
              rx="4"
              fill="var(--hmi-panel)"
              stroke={getStatusColor(getAssetData('WTG-02').status)}
              strokeWidth="2"
            />
            <text
              x="40"
              y="18"
              fill="var(--text-bright)"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              EOLICA WTG-02
            </text>
            <text
              x="40"
              y="32"
              fill="var(--hmi-cyan)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('WTG-02').telemetry['POWER'] || 0).toFixed(2)} MW
            </text>
            {getAssetData('WTG-02').status === 'FAULT' && (
              <AlertCircle x="64" y="6" size={10} color="var(--hmi-fault)" />
            )}
          </g>

          {/* 3. INVERTERS */}
          <g transform="translate(260, 35)">
            <polygon
              points="0,0 80,0 60,46 20,46"
              fill="var(--hmi-panel)"
              stroke={getStatusColor(getAssetData('INV-01').status)}
              strokeWidth="2"
            />
            <text
              x="40"
              y="18"
              fill="var(--text-bright)"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              INV-01 (AC/DC)
            </text>
            <text
              x="40"
              y="32"
              fill="var(--text-bright)"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('INV-01').telemetry['TEMPERATURE'] || 0).toFixed(1)}°C
            </text>
          </g>

          <g transform="translate(260, 105)">
            <polygon
              points="0,0 80,0 60,46 20,46"
              fill="var(--hmi-panel)"
              stroke={getStatusColor(getAssetData('INV-02').status)}
              strokeWidth="2"
            />
            <text
              x="40"
              y="18"
              fill="var(--text-bright)"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              INV-02 (AC/DC)
            </text>
            <text
              x="40"
              y="32"
              fill="var(--text-bright)"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('INV-02').telemetry['TEMPERATURE'] || 0).toFixed(1)}°C
            </text>
            {getAssetData('INV-02').status === 'FAULT' && (
              <AlertCircle x="68" y="4" size={10} color="var(--hmi-fault)" />
            )}
          </g>

          {/* 4. TRANSFORMER SUBSTATION */}
          <g transform="translate(560, 150)">
            <circle
              cx="25"
              cy="30"
              r="20"
              fill="none"
              stroke={getStatusColor(getAssetData('TRAFO-01').status)}
              strokeWidth="2"
            />
            <circle
              cx="45"
              cy="30"
              r="20"
              fill="none"
              stroke={getStatusColor(getAssetData('TRAFO-01').status)}
              strokeWidth="2"
            />
            <text
              x="35"
              y="-12"
              fill="var(--text-bright)"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              TRAFO-01
            </text>
            <text
              x="35"
              y="62"
              fill="var(--text-bright)"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('TRAFO-01').telemetry['TEMPERATURE'] || 0).toFixed(1)}°C
            </text>
          </g>

          {/* 5. GRID CONNECTION POINT */}
          <g transform="translate(730, 150)">
            <rect
              x="0"
              y="0"
              width="50"
              height="60"
              rx="2"
              fill="var(--hmi-panel-light)"
              stroke="var(--hmi-border-glow)"
              strokeWidth="2"
            />
            <path
              d="M 10,45 L 25,15 L 40,45"
              stroke="var(--hmi-yellow)"
              strokeWidth="2"
              fill="none"
            />
            <path d="M 25,15 L 25,40" stroke="var(--hmi-yellow)" strokeWidth="2" />
            <text
              x="25"
              y="-12"
              fill="var(--hmi-yellow)"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              RED (GRID)
            </text>
            <text
              x="25"
              y="72"
              fill="var(--hmi-cyan)"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {(getAssetData('TRAFO-01').telemetry['POWER'] || 0).toFixed(2)} MW
            </text>
          </g>

          {/* INTERACTIVE BREAKERS (DISYUNTORES) */}

          {/* PV-01 Breaker */}
          <g
            transform="translate(170, 45)"
            onClick={() => onToggleBreaker('PV-ARRAY-01', !breakers['PV-ARRAY-01'])}
          >
            <rect x="0" y="0" width="30" height="30" rx="3" className="breaker-box" />
            {breakers['PV-ARRAY-01'] ? (
              <line x1="5" y1="15" x2="25" y2="15" className="breaker-switch closed" />
            ) : (
              <line x1="5" y1="15" x2="20" y2="5" className="breaker-switch open" />
            )}
            <text x="15" y="-5" fill="var(--text-muted)" fontSize="7" textAnchor="middle">
              52-PV1
            </text>
          </g>

          {/* PV-02 Breaker */}
          <g
            transform="translate(170, 115)"
            onClick={() => onToggleBreaker('PV-ARRAY-02', !breakers['PV-ARRAY-02'])}
          >
            <rect x="0" y="0" width="30" height="30" rx="3" className="breaker-box" />
            {breakers['PV-ARRAY-02'] ? (
              <line x1="5" y1="15" x2="25" y2="15" className="breaker-switch closed" />
            ) : (
              <line x1="5" y1="15" x2="20" y2="5" className="breaker-switch open" />
            )}
            <text x="15" y="-5" fill="var(--text-muted)" fontSize="7" textAnchor="middle">
              52-PV2
            </text>
          </g>

          {/* WTG-01 Breaker */}
          <g
            transform="translate(240, 185)"
            onClick={() => onToggleBreaker('WTG-01', !breakers['WTG-01'])}
          >
            <rect x="0" y="0" width="30" height="30" rx="3" className="breaker-box" />
            {breakers['WTG-01'] ? (
              <line x1="5" y1="15" x2="25" y2="15" className="breaker-switch closed" />
            ) : (
              <line x1="5" y1="15" x2="20" y2="5" className="breaker-switch open" />
            )}
            <text x="15" y="-5" fill="var(--text-muted)" fontSize="7" textAnchor="middle">
              52-WTG1
            </text>
          </g>

          {/* WTG-02 Breaker */}
          <g
            transform="translate(240, 255)"
            onClick={() => onToggleBreaker('WTG-02', !breakers['WTG-02'])}
          >
            <rect x="0" y="0" width="30" height="30" rx="3" className="breaker-box" />
            {breakers['WTG-02'] ? (
              <line x1="5" y1="15" x2="25" y2="15" className="breaker-switch closed" />
            ) : (
              <line x1="5" y1="15" x2="20" y2="5" className="breaker-switch open" />
            )}
            <text x="15" y="-5" fill="var(--text-muted)" fontSize="7" textAnchor="middle">
              52-WTG2
            </text>
          </g>

          {/* Transformer Breaker */}
          <g
            transform="translate(660, 165)"
            onClick={() => onToggleBreaker('TRAFO-01', !breakers['TRAFO-01'])}
          >
            <rect x="0" y="0" width="30" height="30" rx="3" className="breaker-box" />
            {breakers['TRAFO-01'] ? (
              <line x1="5" y1="15" x2="25" y2="15" className="breaker-switch closed" />
            ) : (
              <line x1="5" y1="15" x2="20" y2="5" className="breaker-switch open" />
            )}
            <text x="15" y="-5" fill="var(--text-muted)" fontSize="7" textAnchor="middle">
              52-T1
            </text>
          </g>
        </svg>
      </div>

      <div
        style={{
          marginTop: '12px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '16px',
          justifyContent: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '6px',
              backgroundColor: 'var(--hmi-online)',
              borderRadius: '2px'
            }}
          ></span>
          <span>Disyuntor Cerrado (Conectado)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '6px',
              backgroundColor: 'var(--hmi-fault)',
              borderRadius: '2px'
            }}
          ></span>
          <span>Disyuntor Abierto (Aislado)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '3px',
              backgroundColor: 'var(--hmi-cyan)',
              borderRadius: '1px'
            }}
          ></span>
          <span>Flujo de Potencia Activo</span>
        </div>
      </div>
    </div>
  );
}
