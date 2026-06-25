import React, { useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import pidConfig from '../../utils/pidConfig.json';

export default function VisorPID({ selectedEquipmentId, onClose }) {
  const transformWrapperRef = useRef(null);

  // Focus and zoom automatically to the selected equipment when it changes, or center it
  useEffect(() => {
    const timer = setTimeout(() => {
      if (transformWrapperRef.current) {
        const { setTransform, resetTransform } = transformWrapperRef.current;
        if (selectedEquipmentId) {
          const config = pidConfig.equipos.find((e) => e.id3D === selectedEquipmentId);
          if (config && config.coordenadasZoom) {
            const { x, y, scale } = config.coordenadasZoom;
            setTransform(x, y, scale, 400, 'easeOut');
            return;
          }
        }
        resetTransform(300);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedEquipmentId]);

  const handleReset = () => {
    if (transformWrapperRef.current) {
      const { resetTransform } = transformWrapperRef.current;
      resetTransform(300);
    }
  };

  const getSelectedEquipmentInfo = () => {
    if (!selectedEquipmentId) return null;
    return pidConfig.equipos.find((e) => e.id3D === selectedEquipmentId) || null;
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '16px',
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '450px',
        overflow: 'hidden'
      }}
    >
      {/* Header controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px'
        }}
      >
        <div>
          <span className="badge badge-yellow" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>
            Norma ANSI/ISA S5.1
          </span>
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-main)'
            }}
          >
            Diagrama de Tuberías e Instrumentación (P&ID)
          </h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-secondary flex-center"
            style={{ padding: '6px', borderRadius: '50%' }}
            title="Cerrar Visor"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* SVG Style sheet for interactive highlight */}
      <style>{`
        .pid-element {
          transition: all 0.3s ease;
        }
        .pid-highlight-active {
          stroke: #eab308 !important; /* Gold warning glow */
          stroke-width: 3px !important;
          fill: rgba(234, 179, 8, 0.12) !important;
          filter: drop-shadow(0px 0px 8px rgba(234, 179, 8, 0.9));
          animation: pid-pulse 2s infinite ease-in-out;
        }
        @keyframes pid-pulse {
          0%, 100% { filter: drop-shadow(0px 0px 6px rgba(234, 179, 8, 0.5)); }
          50% { filter: drop-shadow(0px 0px 14px rgba(234, 179, 8, 0.9)); }
        }
        .pid-trans-active {
          fill: rgba(16, 185, 129, 0.15) !important;
          stroke: #10b981 !important;
        }
      `}</style>

      {/* Content Layout: CAD Canvas and Information Panel Below */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '16px',
          overflowY: 'auto'
        }}
      >
        {/* P&ID CAD Canvas */}
        <div
          style={{
            width: '100%',
            height: '420px',
            minHeight: '350px',
            backgroundColor: '#0b0f19',
            borderRadius: 'var(--radius-md)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #1e293b'
          }}
        >
          <TransformWrapper
            ref={transformWrapperRef}
            initialScale={0.8}
            minScale={0.4}
            maxScale={5}
            centerOnInit={true}
            limitToBounds={true}
            centerZoomedOut={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Floating controls inside the CAD canvas */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    zIndex: 10,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    padding: '6px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #334155'
                  }}
                >
                  <button
                    onClick={() => zoomIn()}
                    className="btn btn-secondary flex-center"
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#94a3b8'
                    }}
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="btn btn-secondary flex-center"
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#94a3b8'
                    }}
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="btn btn-secondary flex-center"
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#94a3b8'
                    }}
                    title="Restaurar Vista"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%', cursor: 'grab' }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* SVG Blueprint */}
                  <svg
                    viewBox="0 0 1000 500"
                    width="1000"
                    height="500"
                    style={{
                      backgroundColor: '#0b0f19',
                      fontFamily: 'monospace',
                      userSelect: 'none'
                    }}
                  >
                    {/* Grid Lines */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#161e2e" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="1000" height="500" fill="url(#grid)" />

                    {/* Flow pipeline connections */}
                    {/* Pipe 1: Intake Tank to Pump */}
                    <path
                      d="M 80 240 L 150 240 L 150 260 L 180 260"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                    />
                    {/* Pipe 2: Pump to Heat Exchanger */}
                    <path
                      d="M 200 200 L 200 170 L 350 170 L 350 200 L 410 200"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                    />
                    {/* Pipe 3: Heat Exchanger to Valve */}
                    <path d="M 530 200 L 610 200" fill="none" stroke="#0284c7" strokeWidth="3.5" />
                    {/* Pipe 4: Valve to Outlet Tank */}
                    <path
                      d="M 660 200 L 760 200 L 760 240 L 850 240"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                    />
                    {/* Pipe 5: Compressor to Valve Actuator */}
                    <path
                      d="M 650 100 L 650 145"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />

                    {/* Directional Flow Arrows */}
                    <polygon points="120,236 120,244 128,240" fill="#0284c7" />
                    <polygon points="270,166 270,174 278,170" fill="#0284c7" />
                    <polygon points="570,196 570,204 578,200" fill="#0284c7" />
                    <polygon points="800,236 800,244 808,240" fill="#0284c7" />

                    {/* 1. COMPONENT: INTAKE FEED TANK */}
                    <g id="pid_tanque_entrada">
                      <rect
                        x="20"
                        y="160"
                        width="60"
                        height="140"
                        rx="5"
                        fill="#1e293b"
                        stroke="#475569"
                        strokeWidth="2"
                      />
                      <line x1="20" y1="180" x2="80" y2="180" stroke="#475569" strokeWidth="1" />
                      <line x1="20" y1="280" x2="80" y2="280" stroke="#475569" strokeWidth="1" />
                      <text
                        x="50"
                        y="150"
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        TK-101
                      </text>
                      <text x="50" y="235" fill="#38bdf8" fontSize="8" textAnchor="middle">
                        INSUMO
                      </text>
                    </g>

                    {/* 2. COMPONENT: PUMP (selectedEquipmentId === 'bomba') */}
                    <g
                      id="pid_bomba"
                      className={`pid-element ${selectedEquipmentId === 'bomba' ? 'pid-highlight-active' : ''}`}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      fill="#1e293b"
                    >
                      {/* Pump housing outer circle */}
                      <circle cx="200" cy="260" r="22" />
                      {/* Pump internal scroll impeller triangle */}
                      <polygon points="186,274 214,274 200,242" fill="none" />
                      {/* Nozzle outlet vertical path */}
                      <line x1="200" y1="238" x2="200" y2="200" strokeWidth="2.5" />
                      <text
                        x="200"
                        y="300"
                        fill="#94a3b8"
                        fontSize="10"
                        stroke="none"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        PMP-101
                      </text>
                    </g>

                    {/* 3. COMPONENT: MOTOR (selectedEquipmentId === 'motor') */}
                    <g
                      id="pid_motor"
                      className={`pid-element ${selectedEquipmentId === 'motor' ? 'pid-highlight-active' : ''}`}
                      stroke="#475569"
                      strokeWidth="2"
                      fill="#1e293b"
                    >
                      <rect x="165" y="338" width="70" height="50" rx="4" />
                      <line x1="175" y1="338" x2="175" y2="388" />
                      <line x1="225" y1="338" x2="225" y2="388" />
                      {/* Shaft coupling to pump */}
                      <line
                        x1="200"
                        y1="282"
                        x2="200"
                        y2="338"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                      />
                      <text
                        x="200"
                        y="325"
                        fill="#38bdf8"
                        fontSize="7"
                        stroke="none"
                        textAnchor="middle"
                      >
                        ACOPLE
                      </text>
                      <text
                        x="200"
                        y="368"
                        fill="#94a3b8"
                        fontSize="9"
                        stroke="none"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        MOT-101
                      </text>
                    </g>

                    {/* 4. COMPONENT: HEAT EXCHANGER (selectedEquipmentId === 'intercambiador') */}
                    <g
                      id="pid_intercambiador"
                      className={`pid-element ${selectedEquipmentId === 'intercambiador' ? 'pid-highlight-active' : ''}`}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      fill="#1e293b"
                    >
                      <rect x="410" y="160" width="120" height="80" rx="12" />
                      {/* Flanges */}
                      <line x1="422" y1="160" x2="422" y2="240" stroke="#475569" />
                      <line x1="518" y1="160" x2="518" y2="240" stroke="#475569" />
                      {/* Tube bundle lines */}
                      <path d="M 422 185 L 518 185" />
                      <path d="M 422 200 L 518 200" />
                      <path d="M 422 215 L 518 215" />
                      {/* Cooling fluid inlet & outlet pipes */}
                      <line x1="470" y1="160" x2="470" y2="130" stroke="#f43f5e" />
                      <line x1="470" y1="240" x2="470" y2="270" stroke="#06b6d4" />
                      <text
                        x="470"
                        y="120"
                        fill="#f43f5e"
                        fontSize="7"
                        stroke="none"
                        textAnchor="middle"
                      >
                        ENTRADA ENFRIAMIENTO
                      </text>
                      <text
                        x="470"
                        y="285"
                        fill="#06b6d4"
                        fontSize="7"
                        stroke="none"
                        textAnchor="middle"
                      >
                        RETORNO ENFRIAMIENTO
                      </text>
                      <text
                        x="470"
                        y="205"
                        fill="#94a3b8"
                        fontSize="10"
                        stroke="none"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        HEX-101
                      </text>
                    </g>

                    {/* 5. COMPONENT: CONTROL VALVE (selectedEquipmentId === 'valvula') */}
                    <g
                      id="pid_valvula"
                      className={`pid-element ${selectedEquipmentId === 'valvula' ? 'pid-highlight-active' : ''}`}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      fill="#1e293b"
                    >
                      {/* Valve body (two triangles) */}
                      <polygon points="610,185 610,215 635,200" />
                      <polygon points="660,185 660,215 635,200" />
                      {/* Stem */}
                      <line x1="635" y1="200" x2="635" y2="165" />
                      {/* Actuator Diaphragm */}
                      <path d="M 615 155 Q 635 140 655 155" fill="none" strokeWidth="2.5" />
                      <line x1="615" y1="155" x2="655" y2="155" />
                      <text
                        x="635"
                        y="235"
                        fill="#94a3b8"
                        fontSize="10"
                        stroke="none"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        TCV-101
                      </text>
                    </g>

                    {/* 6. COMPONENT: COMPRESSOR (selectedEquipmentId === 'compresor') */}
                    <g
                      id="pid_compresor"
                      className={`pid-element ${selectedEquipmentId === 'compresor' ? 'pid-highlight-active' : ''}`}
                      stroke="#10b981"
                      strokeWidth="2"
                      fill="#1e293b"
                    >
                      {/* Reciprocating symbol (Circle inside square) */}
                      <rect x="615" y="38" width="70" height="60" rx="3" />
                      <circle cx="650" cy="68" r="18" fill="none" />
                      <path d="M 635 68 L 665 68" strokeDasharray="2,2" />
                      <text
                        x="650"
                        y="30"
                        fill="#94a3b8"
                        fontSize="10"
                        stroke="none"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        CMP-101
                      </text>
                      <text
                        x="650"
                        y="72"
                        fill="#10b981"
                        fontSize="8"
                        stroke="none"
                        textAnchor="middle"
                      >
                        AIR
                      </text>
                    </g>

                    {/* 7. COMPONENT: OUTLET RECEIVER TANK */}
                    <g id="pid_tanque_salida">
                      <rect
                        x="850"
                        y="160"
                        width="90"
                        height="140"
                        rx="5"
                        fill="#1e293b"
                        stroke="#475569"
                        strokeWidth="2"
                      />
                      <line x1="850" y1="180" x2="940" y2="180" stroke="#475569" strokeWidth="1" />
                      <line x1="850" y1="280" x2="940" y2="280" stroke="#475569" strokeWidth="1" />
                      <text
                        x="895"
                        y="150"
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        TK-102
                      </text>
                      <text x="895" y="235" fill="#10b981" fontSize="8" textAnchor="middle">
                        PRODUCTO
                      </text>
                    </g>

                    {/* INSTRUMENTATION TRANSMITTER BUBBLES */}
                    {/* FIT-101 (Flow) */}
                    <g>
                      <circle
                        cx="280"
                        cy="115"
                        r="16"
                        fill="#0f172a"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                      <line x1="264" y1="115" x2="296" y2="115" stroke="#10b981" strokeWidth="1" />
                      <text
                        x="280"
                        y="108"
                        fill="#10b981"
                        fontSize="7"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        FIT
                      </text>
                      <text x="280" y="125" fill="#10b981" fontSize="7" textAnchor="middle">
                        101
                      </text>
                      {/* connection to pipe */}
                      <line
                        x1="280"
                        y1="131"
                        x2="280"
                        y2="170"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    </g>

                    {/* PIT-101 (Pressure on Pump Intake) */}
                    <g>
                      <circle
                        cx="115"
                        cy="180"
                        r="16"
                        fill="#0f172a"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                      <line x1="99" y1="180" x2="131" y2="180" stroke="#10b981" strokeWidth="1" />
                      <text
                        x="115"
                        y="173"
                        fill="#10b981"
                        fontSize="7"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        PIT
                      </text>
                      <text x="115" y="190" fill="#10b981" fontSize="7" textAnchor="middle">
                        101
                      </text>
                      {/* connection to pipe */}
                      <line
                        x1="115"
                        y1="196"
                        x2="115"
                        y2="240"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    </g>

                    {/* TIT-101 (Temperature Exchanger Out) */}
                    <g>
                      <circle
                        cx="570"
                        cy="140"
                        r="16"
                        fill="#0f172a"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                      <line x1="554" y1="140" x2="586" y2="140" stroke="#10b981" strokeWidth="1" />
                      <text
                        x="570"
                        y="133"
                        fill="#10b981"
                        fontSize="7"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        TIT
                      </text>
                      <text x="570" y="150" fill="#10b981" fontSize="7" textAnchor="middle">
                        101
                      </text>
                      {/* connection to pipe */}
                      <line
                        x1="570"
                        y1="156"
                        x2="570"
                        y2="200"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    </g>

                    {/* PIT-102 (Pressure Valve Out) */}
                    <g>
                      <circle
                        cx="720"
                        cy="140"
                        r="16"
                        fill="#0f172a"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                      <line x1="704" y1="140" x2="736" y2="140" stroke="#10b981" strokeWidth="1" />
                      <text
                        x="720"
                        y="133"
                        fill="#10b981"
                        fontSize="7"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        PIT
                      </text>
                      <text x="720" y="150" fill="#10b981" fontSize="7" textAnchor="middle">
                        102
                      </text>
                      {/* connection to pipe */}
                      <line
                        x1="720"
                        y1="156"
                        x2="720"
                        y2="200"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    </g>
                  </svg>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Information Panel Below (100% width) */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {getSelectedEquipmentInfo() ? (
            <div className="visor-pid-info-grid">
              {/* Col 1: Equipo Activo */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span
                  className="badge badge-yellow"
                  style={{ fontSize: '0.62rem', marginBottom: '4px', width: 'fit-content' }}
                >
                  Equipo Activo
                </span>
                <h5
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-main)'
                  }}
                >
                  {getSelectedEquipmentInfo().nombre_comun}
                </h5>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '2px'
                  }}
                >
                  TAG: {getSelectedEquipmentInfo().tag}
                </span>
              </div>

              {/* Col 2: Función del Proceso */}
              <div
                style={{
                  borderLeft: '1px solid var(--border-color)',
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}
                >
                  Función del Proceso
                </span>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}
                >
                  {getSelectedEquipmentInfo().descripcion}
                </p>
              </div>

              {/* Col 3: Instrumentación Asociada */}
              <div
                style={{
                  borderLeft: '1px solid var(--border-color)',
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                  }}
                >
                  Instrumentación Asociada
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {getSelectedEquipmentInfo().instrumentos &&
                    getSelectedEquipmentInfo().instrumentos.map((inst, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.72rem',
                          padding: '4px 8px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>{inst.tag}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{inst.funcion}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                padding: '10px 0'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🔍</span>
              <p style={{ fontSize: '0.78rem', margin: 0 }}>
                Haz clic en un componente del plano P&ID o en la vista 3D para ver su telemetría e
                información técnica detallada.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>⚡ Puntero: Paneo (Arrastrar) | Rueda: Zoom +/-</span>
        <span>Ref: Planta de Chancado y Molienda</span>
      </div>
    </div>
  );
}
