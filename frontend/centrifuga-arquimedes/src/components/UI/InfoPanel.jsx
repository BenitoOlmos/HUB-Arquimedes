import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('detail'); // 'detail', 'telemetry', 'logs', 'lubrication'
  const [selectedStageInfo, setSelectedStageInfo] = useState(null);
  const [techName, setTechName] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [logStatus, setLogStatus] = useState('');
  const [formError, setFormError] = useState('');

  // States for Telemetry simulation inputs
  const [simMaxHours, setSimMaxHours] = useState(20000);
  const [simCurrentHours, setSimCurrentHours] = useState(0);
  const [simVibration, setSimVibration] = useState(1.5);
  const [simTemp, setSimTemp] = useState(45);
  const [simNoise, setSimNoise] = useState('No');
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // States for Lubrication custom notes
  const [lubricationNotes, setLubricationNotes] = useState('');
  const [lubNotesSaved, setLubNotesSaved] = useState(false);

  // Sync simulation values when selectedPart changes
  useEffect(() => {
    if (selectedPart) {
      setSimCurrentHours(selectedPart.operatingHours || 0);

      let lastVib = 1.5;
      try {
        const vData =
          typeof selectedPart.vibrationHistory === 'string'
            ? JSON.parse(selectedPart.vibrationHistory)
            : selectedPart.vibrationHistory || [];
        if (vData.length > 0) lastVib = vData[vData.length - 1];
      } catch (e) {}

      setSimVibration(lastVib);
      setSimTemp(selectedPart.id === 'bearings' ? 42 : selectedPart.id === 'motor' ? 55 : 30);
      setSimNoise('No');
      setGeneratedPlan(null);

      const savedNotes = localStorage.getItem(`lub_notes_${selectedPart.id}`);
      setLubricationNotes(savedNotes || '');
      setLubNotesSaved(false);
    }
  }, [selectedPart]);

  const handleSaveLubNotes = () => {
    localStorage.setItem(`lub_notes_${selectedPart.id}`, lubricationNotes);
    setLubNotesSaved(true);
    setTimeout(() => setLubNotesSaved(false), 2000);
  };

  const getRecommendedToolsForPart = (partId) => {
    switch (partId) {
      case 'bearings':
        return 'Extractor hidráulico de rodamientos, extractor de garras, calentador de inducción, juego de galgas de espesores, llaves dinamométricas, alineador láser de acoplamiento.';
      case 'motor':
        return 'Megger de resistencia de aislamiento, multímetro, pinza amperimétrica, llaves de vaso, extractor de poleas, pistola de engrase manual con manómetro.';
      case 'impeller':
        return 'Juego de llaves de vaso y corona, extractor de impulsor, mazo de bronce o goma, calibre vernier, eslingas textiles de izaje.';
      case 'mechanical_seal':
        return 'Juego de llaves Allen, destornillador plano de precisión, extractor de sello, toallitas de limpieza libres de pelusa, lubricante de silicona para juntas tóricas.';
      case 'volute_casing':
        return 'Llaves dinamométricas de alto torque, cáncamos de izaje, eslingas de cadena, espátula para limpieza de bridas, juntas de repuesto de grafito espiralado.';
      default:
        return 'Juego de herramientas manuales de taller (llaves fijas, destornilladores, alicates), torquímetro, cinta métrica, EPP reglamentario.';
    }
  };

  const getRecommendedTasksForPart = (partId, severity) => {
    const actionWord =
      severity === 'Critical'
        ? 'Proceder al reemplazo urgente del'
        : 'Realizar inspección exhaustiva y mantenimiento preventivo del';
    switch (partId) {
      case 'bearings':
        return `${actionWord} rodamiento radial/axial. Verificar desgaste de pistas de rodadura, holgura axial y rellenar con Grasa Sintética Mobilith SHC 100 en la cantidad especificada.`;
      case 'motor':
        return `${actionWord} motor eléctrico. Medir aislamiento de bobinados con Megger, comprobar corriente de arranque por fase, limpiar aletas de refrigeración y lubricar rodamientos con Mobil Polyrex EM.`;
      case 'impeller':
        return `${actionWord} impulsor. Inspeccionar álabes contra cavitación, remover incrustaciones, verificar holgura respecto a anillos de desgaste y realizar balanceo dinámico ISO G2.5.`;
      case 'mechanical_seal':
        return `${actionWord} sello mecánico. Inspeccionar caras de rozamiento (carbón/carburo de silicio), verificar estanqueidad del resorte, cambiar juntas tóricas de Viton y comprobar flujo del Plan de Lavado.`;
      case 'volute_casing':
        return `${actionWord} cuerpo de voluta. Medir espesor de pared por ultrasonido para descartar erosión abrasiva, limpiar voluta interna y renovar pernos y juntas espiraladas.`;
      default:
        return `${actionWord} componente afectado. Verificar alineación del eje de transmisión, reapretar pernos de fijación al torque especificado y limpiar superficies de contacto.`;
    }
  };

  const handleGeneratePlan = (e) => {
    e.preventDefault();

    let severity = 'Normal';
    let recommendation =
      'NORMAL: Operación estable dentro de los rangos nominales de diseño. Se sugiere continuar con el monitoreo rutinario.';
    let finalStatus = 'Operational';
    let finalStatusLabel = 'Operativo';

    if (simVibration >= 4.5 || simTemp >= 75) {
      severity = 'Critical';
      recommendation =
        'CRÍTICO: Severidad alta detectada. Se sugiere DETENER el equipo de forma INMEDIATA para evitar un fallo catastrófico en el rodamiento o eje de transmisión.';
      finalStatus = 'Replace';
      finalStatusLabel = 'Reemplazo';
    } else if (
      simVibration >= 2.8 ||
      simTemp >= 65 ||
      simCurrentHours >= simMaxHours ||
      simNoise === 'Sí'
    ) {
      severity = 'Warning';
      recommendation =
        'ALERTA: Desviación de parámetros detectada. Se sugiere detener el equipo en un MÁXIMO DE UNA SEMANA para una inspección física detallada y corrección preventiva.';
      finalStatus = 'Inspect';
      finalStatusLabel = 'Inspección';
    }

    const workPlan = {
      severity,
      recommendation,
      status: finalStatus,
      statusLabel: finalStatusLabel,
      steps: [
        {
          title: '1. Solicitar permisos de trabajo',
          desc: 'Obtener Permiso de Trabajo en Caliente/Frío, firmar el análisis de riesgos (AST) y aplicar bloqueo de energía de alimentación (candado LOTO) en la consola eléctrica principal.'
        },
        {
          title: '2. Recopilar información técnica del equipo',
          desc: `Revisar el manual de fabricante del componente ${selectedPart.spanishName || selectedPart.name}, tolerancias de holgura y torque de apriete nominal.`
        },
        {
          title: '3. Recolectar las herramientas propuestas para la tarea',
          desc: getRecommendedToolsForPart(selectedPart.id)
        },
        {
          title: '4. Detallar las tareas a realizar en el equipo',
          desc: getRecommendedTasksForPart(selectedPart.id, severity)
        },
        {
          title: '5. Entrega del equipo y despeje del área de trabajo para producción',
          desc: 'Retirar herramientas, limpiar derrames de lubricante/agua, retirar candado de bloqueo LOTO y realizar prueba en vacío antes de autorizar la entrega formal a operaciones.'
        }
      ]
    };

    setGeneratedPlan(workPlan);

    // Save to Part's Bitácora (via onAddLog)
    onAddLog(selectedPart.id, {
      tech: 'Simulador de Escenarios',
      desc: `Simulación de escenario operativo. Diagnóstico: ${recommendation}. Parámetros ingresados: Vida: ${simCurrentHours}/${simMaxHours} Hrs, Vib: ${simVibration} mm/s RMS, Temp: ${simTemp}°C, Ruido anormal: ${simNoise}.`,
      status: finalStatus
    });

    // Also save to global History logs (shared in localStorage)
    const newGlobalLog = {
      id: `hlog-sim-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      tech: 'Simulador de Escenarios',
      action: `Escenario simulado - ${selectedPart.spanishName || selectedPart.name}`,
      status: finalStatus,
      statusLabel: finalStatusLabel,
      component: selectedPart.spanishName || selectedPart.name,
      details: `Plan de trabajo generado por simulación. Recomendación: ${recommendation}. Variables: Horas: ${simCurrentHours}/${simMaxHours}, Vib: ${simVibration} mm/s, Temp: ${simTemp}°C, Ruido: ${simNoise}.`,
      duration: '1.0 Hrs'
    };

    try {
      const saved = localStorage.getItem('hub_historical_logs');
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
      const currentGlobal = saved ? JSON.parse(saved) : historicalLogs;
      localStorage.setItem('hub_historical_logs', JSON.stringify([newGlobalLog, ...currentGlobal]));
    } catch (err) {
      console.warn('Could not save to global logs in localStorage', err);
    }
  };

  if (loading) {
    return (
      <div className="sidebar-content">
        <div className="placeholder-container">
          <div
            className="spinner"
            style={{ width: '30px', height: '30px', marginBottom: '16px' }}
          ></div>
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
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
            Selecciona un Componente
          </h3>
          <p className="placeholder-text">
            Haz clic sobre cualquier componente de la bomba en el visor 3D para examinar su ficha
            técnica, historial de vibraciones, bitácora de mantenimientos y programaciones.
          </p>
        </div>
      </div>
    );
  }

  // Parse JSON fields safely
  let vibrationData = [];
  try {
    vibrationData =
      typeof selectedPart.vibrationHistory === 'string'
        ? JSON.parse(selectedPart.vibrationHistory)
        : selectedPart.vibrationHistory || [];
  } catch (e) {
    vibrationData = [1.0, 1.2, 1.1, 1.3, 1.5];
  }

  let logsData = [];
  try {
    logsData =
      typeof selectedPart.maintenanceLogs === 'string'
        ? JSON.parse(selectedPart.maintenanceLogs)
        : selectedPart.maintenanceLogs || [];
  } catch (e) {
    logsData = [];
  }

  // Parse new stress and lifecycle properties with fallback defaults
  let stressData = [];
  try {
    stressData = selectedPart.stressHistory
      ? typeof selectedPart.stressHistory === 'string'
        ? JSON.parse(selectedPart.stressHistory)
        : selectedPart.stressHistory
      : [20, 25, 35, 45, 52, 60, 65];
  } catch (e) {
    stressData = [20, 25, 35, 45, 52, 60, 65];
  }

  const remainingLife = selectedPart.remainingLife !== undefined ? selectedPart.remainingLife : 80;
  const lifecycleStage = selectedPart.lifecycleStage || 'Maintenance';
  const installationNotes =
    selectedPart.installationNotes ||
    'Montaje inicial completado. Alineación radial y axial verificada.';

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
      <div
        style={{
          background: 'var(--bg-sidebar-header)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border-glass)',
          marginTop: '8px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '8px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color="var(--accent-cyan)" /> Historial de Vibraciones
          </span>
          <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
            Vib: mm/s RMS
          </span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <defs>
            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="rgba(15, 23, 42, 0.05)"
            strokeDasharray="3,3"
            className="chart-grid-line"
          />
          <line
            x1={padding}
            y1={padding + chartHeight / 2}
            x2={width - padding}
            y2={padding + chartHeight / 2}
            stroke="rgba(15, 23, 42, 0.05)"
            strokeDasharray="3,3"
            className="chart-grid-line"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(15, 23, 42, 0.15)"
          />

          {/* Area under line */}
          <path d={areaD} fill="url(#chart-glow)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            className="chart-line-animate"
          />

          {/* Dots & Labels */}
          {points.map((p, i) => (
            <g key={i}>
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <circle cx={p.x} cy={p.y} r="3.5" fill="var(--accent-cyan)" opacity="0.4">
                  <animate
                    attributeName="r"
                    values="3.5;10;3.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
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
                r="3.5"
                fill="var(--accent-cyan)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Show labels for peak or last point */}
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="var(--text-primary)"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {p.val}
                </text>
              )}
            </g>
          ))}

          {/* X axis labels */}
          <text x={padding} y={height - 4} fill="var(--text-muted)" fontSize="8">
            Inicio
          </text>
          <text
            x={width / 2}
            y={height - 4}
            fill="var(--text-muted)"
            fontSize="8"
            textAnchor="middle"
          >
            Operación
          </text>
          <text
            x={width - padding}
            y={height - 4}
            fill="var(--text-muted)"
            fontSize="8"
            textAnchor="right"
          >
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
      <div
        style={{
          background: 'var(--bg-sidebar-header)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border-glass)',
          marginTop: '8px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '8px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color="var(--status-replace)" /> Carga de Estrés Mecánico
          </span>
          <span
            style={{ fontFamily: 'monospace', color: 'var(--status-replace)', fontWeight: 'bold' }}
          >
            Estrés: %
          </span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <defs>
            <linearGradient id="stress-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--status-replace)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--status-replace)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="rgba(15, 23, 42, 0.05)"
            strokeDasharray="3,3"
            className="chart-grid-line"
          />
          <line
            x1={padding}
            y1={padding + chartHeight / 2}
            x2={width - padding}
            y2={padding + chartHeight / 2}
            stroke="rgba(15, 23, 42, 0.05)"
            strokeDasharray="3,3"
            className="chart-grid-line"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(15, 23, 42, 0.15)"
          />

          <path d={areaD} fill="url(#stress-glow)" />
          <path
            d={pathD}
            fill="none"
            stroke="var(--status-replace)"
            strokeWidth="2"
            className="chart-line-animate"
          />

          {points.map((p, i) => (
            <g key={i}>
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <circle cx={p.x} cy={p.y} r="3.5" fill="var(--status-replace)" opacity="0.4">
                  <animate
                    attributeName="r"
                    values="3.5;10;3.5"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0;0.8"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="var(--status-replace)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {(i === points.length - 1 || p.val === Math.max(...data)) && (
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="var(--text-primary)"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {p.val}%
                </text>
              )}
            </g>
          ))}

          <text x={padding} y={height - 4} fill="var(--text-muted)" fontSize="8">
            Inicio
          </text>
          <text
            x={width / 2}
            y={height - 4}
            fill="var(--text-muted)"
            fontSize="8"
            textAnchor="middle"
          >
            Calibración
          </text>
          <text
            x={width - padding}
            y={height - 4}
            fill="var(--text-muted)"
            fontSize="8"
            textAnchor="right"
          >
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
              {status === 'Operational'
                ? 'ÓPTIMO'
                : status === 'Inspect'
                  ? 'BAJO CONTROL'
                  : 'CRÍTICO'}
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
          <div
            className="history-chart-container"
            style={{
              background: 'var(--bg-sidebar-header)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'fade-in-tooltip 0.25s'
            }}
          >
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: '800',
                color: 'var(--status-inspect)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={14} /> Fallas de Juventud (Mortalidad Infantil)
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              Ocurren al inicio de la vida del equipo con una alta tasa de fallos. Generalmente son
              consecuencia de problemas en la instalación, la puesta en marcha, el almacenamiento o
              el transporte.
            </p>
          </div>
        );
      case 'Maintenance':
        return (
          <div
            className="history-chart-container"
            style={{
              background: 'var(--bg-sidebar-header)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'fade-in-tooltip 0.25s'
            }}
          >
            {/* Main Header */}
            <div>
              <h4
                style={{
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <Activity size={14} /> Etapas del Ciclo de Vida del Equipo
              </h4>

              {/* Stages List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Fallas de Juventud */}
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.04)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <strong
                    style={{
                      color: 'var(--status-inspect)',
                      display: 'block',
                      fontSize: '0.74rem',
                      marginBottom: '4px'
                    }}
                  >
                    Fallas de Juventud (Mortalidad Infantil):
                  </strong>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45'
                    }}
                  >
                    Ocurren al inicio de la vida del equipo con una alta tasa de fallos.
                    Generalmente son consecuencia de problemas en la instalación, la puesta en
                    marcha, el almacenamiento o el transporte.
                  </span>
                </div>

                {/* Vida Util */}
                <div
                  style={{
                    background: 'rgba(6, 182, 212, 0.04)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(6, 182, 212, 0.15)'
                  }}
                >
                  <strong
                    style={{
                      color: 'var(--accent-cyan)',
                      display: 'block',
                      fontSize: '0.74rem',
                      marginBottom: '4px'
                    }}
                  >
                    Vida Útil (Etapa de Estabilidad):
                  </strong>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45'
                    }}
                  >
                    Es el periodo central donde el equipo presenta un comportamiento estable y una
                    tasa de fallos baja. Durante esta fase, el equipo ofrece una alta disponibilidad
                    y sus horas de servicio son predecibles, siempre y cuando se someta a procesos
                    de producción normalizados (sin sobreexigencias) y se respeten sus
                    mantenimientos.
                  </span>
                </div>

                {/* Fallas de Vejez */}
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.04)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.15)'
                  }}
                >
                  <strong
                    style={{
                      color: 'var(--status-replace)',
                      display: 'block',
                      fontSize: '0.74rem',
                      marginBottom: '4px'
                    }}
                  >
                    Fallas de Vejez (Desgaste):
                  </strong>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45'
                    }}
                  >
                    En la etapa final, la tasa de fallos vuelve a aumentar drásticamente. Esto se
                    debe al desgaste natural de los componentes, la fatiga por la operación continua
                    y el historial de mantención del equipo.
                  </span>
                </div>
              </div>
            </div>

            {/* Mantenimiento y Procedimientos Criticos */}
            <div
              style={{
                borderTop: '1px solid var(--border-glass)',
                paddingTop: '12px',
                marginTop: '4px'
              }}
            >
              <h4
                style={{
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <Wrench size={14} /> Mantenimiento y Procedimientos Críticos
              </h4>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  marginBottom: '10px'
                }}
              >
                Para prolongar la etapa de "Vida Útil", se establecen ciclos de mantenimiento que
                varían según el componente:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Inspecciones de Rutina */}
                <div style={{ paddingLeft: '4px' }}>
                  <strong
                    style={{
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      marginBottom: '4px'
                    }}
                  >
                    <ClipboardList size={12} style={{ color: 'var(--accent-cyan)' }} /> Inspecciones
                    de Rutina:
                  </strong>
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4',
                      marginBottom: '4px'
                    }}
                  >
                    Tanto en la bomba como en el motor, es vital monitorear variables de manera
                    constante:
                  </p>
                  <ul
                    style={{
                      paddingLeft: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      listStyleType: 'disc'
                    }}
                  >
                    <li>Inspección de fugas (especialmente en la bomba).</li>
                    <li>Detección de ruidos y vibraciones anormales.</li>
                    <li>Control de temperatura.</li>
                    <li>Estado de la lubricación y vida remanente de los rodamientos.</li>
                  </ul>
                </div>

                {/* Desacople y Alineacion */}
                <div
                  style={{
                    paddingLeft: '4px',
                    borderTop: '1px dashed var(--border-glass)',
                    paddingTop: '8px'
                  }}
                >
                  <strong
                    style={{
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      marginBottom: '4px'
                    }}
                  >
                    <TrendingUp size={12} style={{ color: 'var(--accent-blue)' }} /> Desacople y
                    Alineación:
                  </strong>
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45'
                    }}
                  >
                    Cuando se realiza una intervención mayor, como el cambio de rodamientos o el
                    reemplazo del motor, el conjunto debe desacoplarse. Al volver a montar, el paso
                    más crítico es la alineación. Esta debe realizarse respetando estrictamente las
                    normativas técnicas para evitar daños prematuros y asegurar que los rodamientos
                    nuevos alcancen la vida útil esperada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Replacement':
        return (
          <div
            className="history-chart-container"
            style={{
              background: 'var(--bg-sidebar-header)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'fade-in-tooltip 0.25s'
            }}
          >
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: '800',
                color: 'var(--status-replace)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={14} /> Fallas de Vejez (Desgaste)
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              En la etapa final, la tasa de fallos vuelve a aumentar drásticamente. Esto se debe al
              desgaste natural de los componentes, la fatiga por la operación continua y el
              historial de mantención del equipo.
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
      <div
        className="history-chart-container"
        style={{
          background: 'var(--bg-sidebar-header)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '4px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            fontWeight: '700'
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-primary)'
            }}
          >
            <Activity size={12} style={{ color: 'var(--accent-cyan)' }} /> Curva de la Bañera
            (Bathtub Curve)
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
          <line
            x1="90"
            y1="5"
            x2="90"
            y2="80"
            stroke="rgba(15, 23, 42, 0.05)"
            strokeDasharray="3,3"
          />

          <rect x="90" y="5" width="140" height="75" fill="rgba(6, 182, 212, 0.02)" />
          <line
            x1="230"
            y1="5"
            x2="230"
            y2="80"
            stroke="rgba(15, 23, 42, 0.05)"
            strokeDasharray="3,3"
          />

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
            <circle
              cx={dotX}
              cy={dotY}
              r="6"
              fill={dotColor}
              opacity="0.4"
              style={{
                transition:
                  'cx 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), cy 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.6s ease'
              }}
            >
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.8;0;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={dotX}
              cy={dotY}
              r="4.5"
              fill={dotColor}
              stroke="#ffffff"
              strokeWidth="1.5"
              style={{
                transition:
                  'cx 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), cy 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.6s ease'
              }}
            />
          </g>

          {/* Labels */}
          <text
            x="55"
            y="88"
            fill="var(--text-muted)"
            fontSize="7"
            textAnchor="middle"
            fontWeight="bold"
          >
            Juventud
          </text>
          <text
            x="160"
            y="88"
            fill="var(--text-muted)"
            fontSize="7"
            textAnchor="middle"
            fontWeight="bold"
          >
            Vida Útil
          </text>
          <text
            x="265"
            y="88"
            fill="var(--text-muted)"
            fontSize="7"
            textAnchor="middle"
            fontWeight="bold"
          >
            Vejez
          </text>

          <text
            x="10"
            y="45"
            fill="var(--text-muted)"
            fontSize="6"
            textAnchor="middle"
            transform="rotate(-90 10 45)"
            fontWeight="bold"
          >
            Tasa de Fallas
          </text>
          <text
            x="303"
            y="77"
            fill="var(--text-muted)"
            fontSize="6"
            textAnchor="left"
            fontWeight="bold"
          >
            Tiempo
          </text>
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
      <div
        style={{
          background: 'var(--bg-sidebar-header)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '4px'
        }}
      >
        <span
          className="detail-label"
          style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}
        >
          <span>Etapa del Ciclo de Vida</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)' }}>
            Clic para más información
          </span>
        </span>

        <div className="lifecycle-stepper">
          <div className="stepper-track-bg"></div>
          <div
            className="stepper-track-fill"
            style={{
              width: stage === 'Installation' ? '0%' : stage === 'Maintenance' ? '50%' : '100%'
            }}
          ></div>

          {stages.map((st, idx) => {
            const isActive = stage === st.key;
            const isCompleted =
              (stage === 'Maintenance' && idx === 0) || (stage === 'Replacement' && idx <= 1);
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
                <div
                  className="stepper-circle"
                  style={{ boxShadow: isSelected ? '0 0 10px var(--accent-cyan)' : '' }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className="stepper-label"
                  style={{ color: isSelected ? 'var(--accent-cyan)' : '' }}
                >
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
    <div
      className="sidebar-content"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Title section */}
      <div className="part-title-row">
        <div>
          <h2 className="part-name">{selectedPart.spanishName || selectedPart.name}</h2>
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
          Ficha
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`sidebar-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
        >
          <Activity size={14} />
          Telemetría
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`sidebar-tab ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <FileText size={14} />
          Bitácora ({logsData.length})
        </button>
        <button
          onClick={() => setActiveTab('lubrication')}
          className={`sidebar-tab ${activeTab === 'lubrication' ? 'active' : ''}`}
        >
          <Wrench size={14} />
          Lubricación
        </button>
      </div>

      {/* Tab 1: TECHNICAL DETAILS */}
      {activeTab === 'detail' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Lifecycle Stepper (Ciclo de Vida) */}
          {renderLifecycleStepper(lifecycleStage)}

          {/* Bathtub Curve Graphic */}
          {renderBathtubCurve(selectedStageInfo || lifecycleStage)}

          {/* Render expanded stage info here */}
          {selectedStageInfo && renderStageInfoContent(selectedStageInfo)}

          {/* Radial Life Gauge */}
          {renderRadialGauge(remainingLife, selectedPart.operatingHours, selectedPart.status)}

          {/* Engineering Alerts */}
          {selectedPart.technicianAlert && (
            <div
              style={{
                background:
                  selectedPart.status === 'Replace'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${selectedPart.status === 'Replace' ? 'var(--status-replace)' : 'var(--status-inspect)'}`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              <AlertTriangle
                size={18}
                color={
                  selectedPart.status === 'Replace'
                    ? 'var(--status-replace)'
                    : 'var(--status-inspect)'
                }
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong
                  style={{
                    display: 'block',
                    marginBottom: '2px',
                    color:
                      selectedPart.status === 'Replace'
                        ? 'var(--status-replace)'
                        : 'var(--status-inspect)'
                  }}
                >
                  ALERTA DE MANTENIMIENTO:
                </strong>
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
              <p className="card-value-txt">
                {selectedPart.commonFailures || 'No hay fallas recurrentes registradas.'}
              </p>
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

          <div
            className="detail-section"
            style={{
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '12px',
              marginTop: '4px'
            }}
          >
            <span className="detail-label">Identificador de Malla</span>
            <span
              className="detail-value"
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            >
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
            <div
              style={{
                background: 'var(--bg-sidebar-header)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)'
              }}
            >
              <span
                className="detail-label"
                style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Clock size={11} /> Entrada en Servicio
              </span>
              <span
                className="detail-value"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'block',
                  marginTop: '4px'
                }}
              >
                {selectedPart.entryDate}
              </span>
            </div>

            <div
              style={{
                background: 'var(--bg-sidebar-header)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)'
              }}
            >
              <span
                className="detail-label"
                style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Wrench size={11} /> Horas de Servicio
              </span>
              <span
                className="detail-value"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'block',
                  marginTop: '4px',
                  color: 'var(--accent-cyan)'
                }}
              >
                {selectedPart.operatingHours.toLocaleString()} Hrs
              </span>
            </div>
          </div>

          {/* Render our Beautiful SVG Charts */}
          {renderVibrationChart(vibrationData)}
          {renderStressChart(stressData)}

          {/* Next Planned Maintenance */}
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid var(--border-glass-active)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '8px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: 'var(--accent-blue)',
                marginBottom: '4px'
              }}
            >
              <Calendar size={14} /> Planificación de Mantenimiento
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: 'var(--text-primary)'
              }}
            >
              <span>Próxima Fecha:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>
                {selectedPart.nextMaintenance}
              </strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}
            >
              <span>Frecuencia Nominal:</span>
              <span>{selectedPart.maintenanceInterval}</span>
            </div>
          </div>

          {/* Simulation of scenarios */}
          <div
            style={{
              marginTop: '16px',
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <h4
              style={{
                fontSize: '0.82rem',
                fontWeight: '800',
                color: 'var(--accent-indigo)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0
              }}
            >
              <Activity size={14} /> Simulador de Escenarios Operativos
            </h4>
            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.35',
                margin: 0
              }}
            >
              Ingresa variables de terreno para evaluar el impacto en la fiabilidad del componente y
              generar planes de trabajo automáticos.
            </p>

            <form
              onSubmit={handleGeneratePlan}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Vida de Diseño (Hrs)
                  </label>
                  <input
                    type="number"
                    value={simMaxHours}
                    onChange={(e) => setSimMaxHours(parseInt(e.target.value) || 0)}
                    className="premium-input"
                    style={{ padding: '6px', fontSize: '0.78rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Uso Actual (Hrs)
                  </label>
                  <input
                    type="number"
                    value={simCurrentHours}
                    onChange={(e) => setSimCurrentHours(parseInt(e.target.value) || 0)}
                    className="premium-input"
                    style={{ padding: '6px', fontSize: '0.78rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Vibración (mm/s RMS)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={simVibration}
                    onChange={(e) => setSimVibration(parseFloat(e.target.value) || 0)}
                    className="premium-input"
                    style={{ padding: '6px', fontSize: '0.78rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <label
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={simTemp}
                    onChange={(e) => setSimTemp(parseInt(e.target.value) || 0)}
                    className="premium-input"
                    style={{ padding: '6px', fontSize: '0.78rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label
                  style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-secondary)' }}
                >
                  Presencia de Ruidos Anormales
                </label>
                <select
                  value={simNoise}
                  onChange={(e) => setSimNoise(e.target.value)}
                  className="premium-select"
                  style={{ padding: '6px', fontSize: '0.78rem' }}
                >
                  <option value="No">No, sonido nominal estable</option>
                  <option value="Sí">Sí, golpeteo metálico o chirrido</option>
                </select>
              </div>

              <button
                type="submit"
                className="premium-btn active"
                style={{
                  marginTop: '6px',
                  padding: '8px',
                  fontSize: '0.78rem',
                  background: 'var(--accent-indigo)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
                }}
              >
                <Wrench size={12} />
                Generar Plan de Trabajo y Registrar
              </button>
            </form>
          </div>

          {/* Generated Plan Deployment */}
          {generatedPlan && (
            <div
              style={{
                marginTop: '12px',
                background:
                  generatedPlan.severity === 'Critical'
                    ? 'rgba(239, 68, 68, 0.05)'
                    : 'rgba(245, 158, 11, 0.05)',
                border: `1px solid ${generatedPlan.severity === 'Critical' ? 'var(--status-replace)' : 'var(--status-inspect)'}`,
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                animation: 'fade-in-tooltip 0.3s ease'
              }}
            >
              <h4
                style={{
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  color:
                    generatedPlan.severity === 'Critical'
                      ? 'var(--status-replace)'
                      : 'var(--status-inspect)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={14} /> Plan de Mantenimiento Sugerido
              </h4>
              <p
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.4',
                  margin: 0,
                  fontWeight: 'bold'
                }}
              >
                {generatedPlan.recommendation}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '6px',
                  borderTop: '1px dashed var(--border-glass)',
                  paddingTop: '10px'
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}
                >
                  Plan de Trabajo Paso a Paso:
                </span>
                {generatedPlan.steps.map((st, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      paddingLeft: '4px',
                      borderLeft: '2px solid var(--border-glass)'
                    }}
                  >
                    <strong style={{ fontSize: '0.74rem', color: 'var(--text-primary)' }}>
                      {st.title}
                    </strong>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.35'
                      }}
                    >
                      {st.desc}
                    </span>
                  </div>
                ))}
              </div>
              <span
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  marginTop: '6px'
                }}
              >
                💾 Registrado automáticamente en el historial de bitácoras del componente.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: MAINTENANCE LOGS */}
      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick status setting */}
          <div className="status-changer" style={{ borderTop: 'none', paddingTop: 0 }}>
            <label className="detail-label" htmlFor="status-select">
              Estado Actual
            </label>
            <select
              id="status-select"
              className="status-select"
              value={selectedPart.status}
              onChange={(e) => onStatusChange(selectedPart.id, e.target.value)}
              style={{ padding: '8px', fontSize: '0.85rem' }}
            >
              <option value="Operational">Operativo</option>
              <option value="Inspect">Requiere Inspección</option>
              <option value="Replace">Requiere Reemplazo</option>
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

            {formError && <span className="form-error-msg">{formError}</span>}
          </form>

          {/* Historical timeline logs list */}
          <div className="timeline-section">
            <span
              className="detail-label"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}
            >
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
                              {log.status === 'Operational'
                                ? 'Operativo'
                                : log.status === 'Inspect'
                                  ? 'Inspección'
                                  : 'Reemplazo'}
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

      {/* Tab 4: LUBRICATION */}
      {activeTab === 'lubrication' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg-sidebar-header)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)'
            }}
          >
            <h3
              style={{
                fontSize: '0.9rem',
                fontWeight: '800',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                margin: 0
              }}
            >
              <Wrench size={16} /> Gestión de Lubricación de la Bomba
            </h3>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4',
                margin: 0
              }}
            >
              Base de datos industrial y recomendaciones automáticas basadas en la carga, potencia y
              horas de servicio del equipo.
            </p>
          </div>

          {/* Recommended specs table */}
          <div
            style={{
              background: 'var(--bg-sidebar-header)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Especificación Industrial de Lubricantes
            </span>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  fontSize: '0.72rem',
                  borderCollapse: 'collapse',
                  textAlign: 'left'
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <th style={{ padding: '6px', color: 'var(--text-muted)' }}>Componente</th>
                    <th style={{ padding: '6px', color: 'var(--text-muted)' }}>Lubricante</th>
                    <th style={{ padding: '6px', color: 'var(--text-muted)' }}>Cantidad</th>
                    <th style={{ padding: '6px', color: 'var(--text-muted)' }}>Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>Rodamientos</td>
                    <td style={{ padding: '6px' }}>Mobilith SHC 100</td>
                    <td style={{ padding: '6px' }}>45g / cojinete</td>
                    <td style={{ padding: '6px' }}>4000 h</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>Motor Eléctrico</td>
                    <td style={{ padding: '6px' }}>Mobil Polyrex EM</td>
                    <td style={{ padding: '6px' }}>30g / rodamiento</td>
                    <td style={{ padding: '6px' }}>6000 h</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>Sello Mecánico</td>
                    <td style={{ padding: '6px' }}>Aceite Silicona / Plan 11</td>
                    <td style={{ padding: '6px' }}>Constante (Lavado)</td>
                    <td style={{ padding: '6px' }}>Continuo</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>Eje / Camisas</td>
                    <td style={{ padding: '6px' }}>Grasa Grafito (Juntas)</td>
                    <td style={{ padding: '6px' }}>Película delgada</td>
                    <td style={{ padding: '6px' }}>Montaje</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic recommendations */}
          <div
            style={{
              background: 'rgba(6, 182, 212, 0.04)',
              border: '1px solid var(--border-glass-active)',
              borderRadius: '12px',
              padding: '14px'
            }}
          >
            <h4
              style={{
                fontSize: '0.78rem',
                fontWeight: '800',
                color: 'var(--accent-cyan)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0
              }}
            >
              <TrendingUp size={12} /> Recomendaciones Dinámicas
            </h4>

            {/* Logic for recommendations */}
            {selectedPart.id === 'bearings' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: '8px'
                }}
              >
                <p>
                  Lubricante recomendado: <strong>Mobilith SHC 100 (Grasa sintética)</strong>
                </p>
                <p>
                  Cantidad de inyección sugerida: <strong>45 gramos</strong> por punto.
                </p>
                <p>
                  Intervalo normal: <strong>4,000 Horas</strong> o 6 meses.
                </p>
                <div
                  style={{
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '6px',
                    background:
                      simCurrentHours >= 4000
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${simCurrentHours >= 4000 ? 'var(--status-replace)' : 'var(--status-operational)'}`,
                    color:
                      simCurrentHours >= 4000
                        ? 'var(--status-replace)'
                        : 'var(--status-operational)',
                    fontWeight: 'bold'
                  }}
                >
                  {simCurrentHours >= 4000
                    ? '🔴 URGENTE: Las horas acumuladas exceden el límite recomendado de lubricación. Se requiere inyección de grasa inmediata.'
                    : '🟢 ÓPTIMO: Lubricación vigente. Se sugiere monitorear vibración y temperatura superficial regularmente.'}
                </div>
              </div>
            ) : selectedPart.id === 'motor' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: '8px'
                }}
              >
                <p>
                  Lubricante recomendado:{' '}
                  <strong>Mobil Polyrex EM (Especificación polímero/litio)</strong>
                </p>
                <p>
                  Cantidad de inyección sugerida: <strong>30 gramos</strong> por rodamiento.
                </p>
                <p>
                  Intervalo normal: <strong>6,000 Horas</strong> o 12 meses.
                </p>
                <div
                  style={{
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '6px',
                    background:
                      simCurrentHours >= 6000
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${simCurrentHours >= 6000 ? 'var(--status-replace)' : 'var(--status-operational)'}`,
                    color:
                      simCurrentHours >= 6000
                        ? 'var(--status-replace)'
                        : 'var(--status-operational)',
                    fontWeight: 'bold'
                  }}
                >
                  {simCurrentHours >= 6000
                    ? '🔴 URGENTE: Rodamientos del motor requieren relubricación inmediata para evitar daño en las bobinas por sobrecalentamiento.'
                    : '🟢 ÓPTIMO: Estado del lubricante óptimo. Programado para engrase rutinario anual.'}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Este componente ({selectedPart.spanishName || selectedPart.name}) no requiere
                lubricación directa. Se aconseja vigilar el estado de los sellos mecánicos
                adyacentes y la temperatura del cuerpo de rodamientos de la bomba.
              </div>
            )}
          </div>

          {/* Custom Notes Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-secondary)' }}
            >
              Observaciones Adicionales (Profesor / Alumno)
            </label>
            <textarea
              placeholder="Escribe recomendaciones personalizadas sobre la lubricación de este componente..."
              value={lubricationNotes}
              onChange={(e) => setLubricationNotes(e.target.value)}
              className="premium-textarea"
              rows={3}
              style={{ fontSize: '0.78rem' }}
            />
            <button
              onClick={handleSaveLubNotes}
              className="premium-btn"
              style={{
                alignSelf: 'flex-end',
                padding: '6px 12px',
                fontSize: '0.75rem',
                background: lubNotesSaved ? 'var(--status-operational)' : 'var(--accent-indigo)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
            >
              {lubNotesSaved ? '✓ Notas Guardadas' : 'Guardar Observaciones'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
