import React, { useState, useEffect } from 'react';
import {
  Eye,
  ShieldAlert,
  Cpu,
  ToggleLeft,
  Disc,
  Layers,
  Zap,
  Settings,
  RefreshCw,
  Layers3,
  Flame,
  Activity
} from 'lucide-react';

import VisorPID from './UI/VisorPID';
import CalculadoraConfiabilidad from './CalculadoraConfiabilidad';

export default function PlantaInteractiva({ defaultContext = 'Minería', selectedScenario = null }) {
  const [context, setContext] = useState(defaultContext);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [activeSubsystem, setActiveSubsystem] = useState('Mecánico'); // Mecánico, Eléctrico, Control
  const [mostrarPID, setMostrarPID] = useState(false);
  const [vistaPlanta, setVistaPlanta] = useState('2d'); // '2d' | '3d'

  // Reliability data state per equipment tag
  const [reliabilityData, setReliabilityData] = useState({
    bomba: { tiempoOperativo: 800, tiempoReparacion: 40, numFallas: 5 },
    motor: { tiempoOperativo: 1200, tiempoReparacion: 24, numFallas: 3 },
    compresor: { tiempoOperativo: 600, tiempoReparacion: 30, numFallas: 6 },
    intercambiador: { tiempoOperativo: 1500, tiempoReparacion: 50, numFallas: 2 },
    valvula: { tiempoOperativo: 900, tiempoReparacion: 18, numFallas: 4 }
  });

  // Load teacher evaluation scenarios from localStorage
  useEffect(() => {
    const storedConfig = localStorage.getItem('reliability_teacher_config');
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        setReliabilityData((prev) => {
          const updated = { ...prev };
          Object.keys(parsed).forEach((key) => {
            if (parsed[key]) {
              updated[key] = {
                tiempoOperativo: parsed[key].tiempoOperativo ?? prev[key].tiempoOperativo,
                tiempoReparacion: parsed[key].tiempoReparacion ?? prev[key].tiempoReparacion,
                numFallas: parsed[key].numFallas ?? prev[key].numFallas,
                isTeacherScenario: true
              };
            }
          });
          return updated;
        });
      } catch (e) {
        console.error('Error loading teacher reliability config:', e);
      }
    }
  }, []);

  const handleReliabilityChange = (field, value) => {
    if (!selectedEquipment) return;
    setReliabilityData((prev) => ({
      ...prev,
      [selectedEquipment]: {
        ...prev[selectedEquipment],
        [field]: value
      }
    }));
  };

  const handleReliabilityReset = () => {
    if (!selectedEquipment) return;
    const factoryDefaults = {
      bomba: { tiempoOperativo: 800, tiempoReparacion: 40, numFallas: 5 },
      motor: { tiempoOperativo: 1200, tiempoReparacion: 24, numFallas: 3 },
      compresor: { tiempoOperativo: 600, tiempoReparacion: 30, numFallas: 6 },
      intercambiador: { tiempoOperativo: 1500, tiempoReparacion: 50, numFallas: 2 },
      valvula: { tiempoOperativo: 900, tiempoReparacion: 18, numFallas: 4 }
    };

    const storedConfig = localStorage.getItem('reliability_teacher_config');
    let initialVal = factoryDefaults[selectedEquipment];
    let isTeacher = false;

    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        if (parsed[selectedEquipment]) {
          initialVal = {
            tiempoOperativo:
              parsed[selectedEquipment].tiempoOperativo ?? initialVal.tiempoOperativo,
            tiempoReparacion:
              parsed[selectedEquipment].tiempoReparacion ?? initialVal.tiempoReparacion,
            numFallas: parsed[selectedEquipment].numFallas ?? initialVal.numFallas
          };
          isTeacher = true;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setReliabilityData((prev) => ({
      ...prev,
      [selectedEquipment]: {
        ...initialVal,
        isTeacherScenario: isTeacher
      }
    }));
  };

  // Industrial Context definitions
  const contexts = {
    Minería: {
      name: 'Minería (Concentrado de Cobre)',
      primaryColor: 'var(--color-minerria)',
      accentLight: 'rgba(234, 88, 12, 0.1)',
      insumo: 'Mineral de Cobre (Chancado)',
      proceso: 'Molienda y Clasificación',
      transformacion: 'Celdas de Flotación',
      salida: 'Concentrado de Cobre (30%)',
      flowSpeed: 'pipe-flow-path-fast',
      bgColor: '#fffaf0',
      darkBgColor: '#221a15'
    },
    Alimenticia: {
      name: 'Alimenticia (Pasteurización e Hilo Frío)',
      primaryColor: 'var(--color-alimenticia)',
      accentLight: 'rgba(16, 185, 129, 0.1)',
      insumo: 'Leche Cruda Recibida',
      proceso: 'Intercambiador Térmico (HTST)',
      transformacion: 'Homogeneización y Envasado',
      salida: 'Leche Pasteurizada Sellada',
      flowSpeed: 'pipe-flow-path',
      bgColor: '#f0fdf4',
      darkBgColor: '#112217'
    },
    Energía: {
      name: 'Energía (Generación a Vapor)',
      primaryColor: 'var(--color-energia)',
      accentLight: 'rgba(245, 158, 11, 0.1)',
      insumo: 'Agua Desmineralizada',
      proceso: 'Caldera de Vaporización',
      transformacion: 'Turbina de Generación Vapor',
      salida: 'Electricidad a Red Nacional',
      flowSpeed: 'pipe-flow-path-fast',
      bgColor: '#fffbeb',
      darkBgColor: '#221f11'
    },
    Química: {
      name: 'Química (Reactores y Refino)',
      primaryColor: 'var(--color-quimica)',
      accentLight: 'rgba(139, 92, 246, 0.1)',
      insumo: 'Reactivos Líquidos A y B',
      proceso: 'Precalentamiento Térmico',
      transformacion: 'Reactor de Catálisis Dinámica',
      salida: 'Polímeros Sintetizados',
      flowSpeed: 'pipe-flow-path',
      bgColor: '#faf5ff',
      darkBgColor: '#1c152a'
    }
  };

  // 5 Families of Industrial Equipment
  const equipmentFamilies = {
    bomba: {
      name: 'Bomba Centrífuga',
      tag: 'PMP-101',
      subtitle: 'Familia: Turbomáquinas de Fluido',
      desc: 'Equipo crítico encargado de desplazar fluidos e insumos líquidos a través de la tubería incrementando su presión hidráulica.',
      components: [
        {
          name: 'Rodamientos',
          desc: 'Soportan las cargas axiales y radiales del eje. Fallan por mala lubricación o desalineación.'
        },
        {
          name: 'Sello Mecánico',
          desc: 'Evita fugas de líquido a lo largo del eje rotativo. Falla por vibraciones o cavitación.'
        },
        {
          name: 'Impulsor (Impeller)',
          desc: 'Elemento giratorio que transmite energía cinética al fluido. Sufre desgaste físico y erosión.'
        },
        {
          name: 'Carcasa (Voluta)',
          desc: 'Cuerpo de la bomba que transforma la energía cinética del fluido en presión estática.'
        }
      ],
      subsystems: {
        Mecánico:
          'Alineación de eje rotativo, holgura de anillos de desgaste, balanceo dinámico de impulsor.',
        Eléctrico:
          'Termografía de bornes, conexiones en caja de bornes, cables de alimentación blindados.',
        Control:
          'Monitoreo de NPSH disponible mediante sensor de presión diferencial y lazo de parada de emergencia.'
      }
    },
    motor: {
      name: 'Motor Eléctrico de Inducción',
      tag: 'MOT-101',
      subtitle: 'Familia: Convertidores Rotativos de Energía',
      desc: 'Accionamiento principal de la planta. Convierte energía eléctrica trifásica en energía mecánica rotacional.',
      components: [
        {
          name: 'Estator y Bobinado',
          desc: 'Devanados de cobre que generan el campo magnético giratorio. Sufren cortocircuitos por sobretemperatura.'
        },
        {
          name: 'Rotor de Jaula de Ardilla',
          desc: 'Induce corrientes y gira por la inducción electromagnética. Fallan las barras o el eje.'
        },
        {
          name: 'Ventilador de Enfriamiento',
          desc: 'Forza la circulación de aire a través de las aletas de la carcasa. Su obstrucción causa sobrecalentamiento.'
        },
        {
          name: 'Rodamiento Lado Acople',
          desc: 'Soporta la tensión y carga del acoplamiento con la máquina conducida.'
        }
      ],
      subsystems: {
        Mecánico:
          'Inspección de patas de anclaje (pie blando), espectroscopia de vibraciones radiales y axiales.',
        Eléctrico:
          'Análisis de firma de corriente (ESA), resistencia de aislamiento de bobinados, balance de fases trifásicas.',
        Control:
          'Termistores PT100 integrados para protección por disparo térmico, variador de frecuencia (VDF) por lazo Modbus.'
      }
    },
    compresor: {
      name: 'Compresor Alternativo (Pistón)',
      tag: 'CMP-101',
      subtitle: 'Familia: Desplazamiento Positivo Neumático',
      desc: 'Comprime gases o aire ambiental mediante pistones reciprocantes para accionar actuadores neumáticos y válvulas.',
      components: [
        {
          name: 'Pistón y Cilindro',
          desc: 'Efectúan la reducción de volumen. Fallan por desgaste de anillos/segmentos o rayadura por lubricación deficiente.'
        },
        {
          name: 'Válvulas de Succión/Descarga',
          desc: 'Láminas metálicas que regulan el flujo de gas. Fallan por fatiga o depósitos de carbono.'
        },
        {
          name: 'Cigüeñal y Biela',
          desc: 'Mecanismo biela-manivela que convierte rotación en traslación. Falla por fatiga mecánica o desgaste de bujes.'
        },
        {
          name: 'Cárter de Aceite',
          desc: 'Depósito de lubricación del mecanismo reciprocante. Falla por nivel bajo o contaminación del lubricante.'
        }
      ],
      subsystems: {
        Mecánico:
          'Medición de holguras internas de pistón, tensión de correas de transmisión y análisis tribológico del aceite.',
        Eléctrico: 'Amperaje de arranque del motor de tracción, caída de tensión eléctrica.',
        Control:
          'Presostatos de seguridad de alta/baja presión, control de velocidad de carga y descarga de aire (solenoide bypass).'
      }
    },
    intercambiador: {
      name: 'Intercambiador Tubo y Carcasa',
      tag: 'HEX-101',
      subtitle: 'Familia: Transferencia Térmica Estática',
      desc: 'Transfiere energía térmica de un fluido caliente a uno frío sin contacto directo físico entre ellos.',
      components: [
        {
          name: 'Haz de Tubos',
          desc: 'Conjunto de conductos internos por donde circula el fluido de proceso. Sufren incrustaciones, corrosión y picaduras.'
        },
        {
          name: 'Carcasa (Shell)',
          desc: 'Cuerpo cilíndrico exterior por donde pasa el fluido secundario que enfría o calienta.'
        },
        {
          name: 'Deflectores (Baffles)',
          desc: 'Placas internas que desvían el flujo y aumentan la turbulencia para maximizar la tasa de transferencia de calor.'
        },
        {
          name: 'Placa Porta-Tubos',
          desc: 'Fija y sella mecánicamente los extremos de los tubos para evitar contaminación cruzada de fluidos.'
        }
      ],
      subsystems: {
        Mecánico:
          'Torqueado de espárragos de bridas, limpieza hidrolavadora interna de tubos, pruebas hidrostáticas de hermeticidad.',
        Eléctrico:
          'Aislamiento a tierra del sistema de calentamiento auxiliar eléctrico o bombas circuladoras asociadas.',
        Control:
          'Lazo PID con válvula proporcional de vapor/agua fría regulando la temperatura de salida con termocuplas.'
      }
    },
    valvula: {
      name: 'Válvula de Control Proporcional',
      tag: 'TCV-101',
      subtitle: 'Familia: Elementos Finales de Control',
      desc: 'Regula activamente variables de proceso (presión, caudal, temperatura) variando el área de paso del fluido.',
      components: [
        {
          name: 'Actuador Neumático/Eléctrico',
          desc: 'Genera la fuerza física necesaria para desplazar el obturador contra la presión del fluido.'
        },
        {
          name: 'Posicionador Electro-Neumático',
          desc: 'Compara la señal de control (4-20mA) con la posición real del vástago para corregir desviaciones dinámicas.'
        },
        {
          name: 'Obturador (Plug) y Asiento',
          desc: 'Partes internas (trim) que restringen físicamente el flujo. Fallan por cavitación, erosión u obstrucción.'
        },
        {
          name: 'Empaquetadura del Vástago',
          desc: 'Evita fugas de fluido a través del vástago móvil. Si se aprieta demasiado causa fricción excesiva (histéresis).'
        }
      ],
      subsystems: {
        Mecánico:
          'Inspección de holguras en conexiones mecánicas, calibración física del recorrido del vástago (cero y span).',
        Eléctrico: 'Alimentación de bucle analógico 24VDC, cableado de transmisores asociados.',
        Control:
          'Calibración de la banda muerta del posicionador, diagnóstico de fricción por gráfico de firma de válvula (Valve Signature).'
      }
    }
  };

  const activeContext = contexts[context];

  return (
    <div className="slide-in-right">
      <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings className="text-accent" />
              Navegador de Planta Virtual e Interacción de Sistemas
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Selecciona tu contexto industrial para alterar dinámicamente las variables, flujos de
              proceso y equipos.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Contexto Industrial:
            </label>
            <select
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                setSelectedEquipment(null);
              }}
              className="form-select"
              style={{ width: '220px', padding: '6px 12px' }}
            >
              <option value="Minería">Minería (Cobre)</option>
              <option value="Alimenticia">Alimenticia (Leche)</option>
              <option value="Energía">Energía (Vapor)</option>
              <option value="Química">Química (Catálisis)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fila Superior: Planta Interactiva (2D/3D) y Visor P&ID */}
      <div
        className="grid-cols-12"
        style={{ gap: '20px', alignItems: 'stretch', marginBottom: '20px' }}
      >
        <div
          className={mostrarPID ? 'col-span-7' : 'col-span-12'}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {/* SVG Planta de Proceso Interactivo */}
          <div
            className="glass-card"
            style={{
              padding: '24px',
              position: 'relative',
              background: vistaPlanta === '3d' ? '#0b0f19' : activeContext.bgColor,
              border: `1.5px solid ${vistaPlanta === '3d' ? '#1e293b' : activeContext.primaryColor + '30'}`,
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.3s ease',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Leyenda de Contexto Activo */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span
                  className="context-pill"
                  style={{
                    backgroundColor: `${activeContext.primaryColor}20`,
                    color: activeContext.primaryColor,
                    border: `1px solid ${activeContext.primaryColor}40`
                  }}
                >
                  <Activity size={12} />
                  {activeContext.name}
                </span>

                {/* Toggle 2D / 3D Layout */}
                <div
                  className="btn-group"
                  style={{
                    display: 'flex',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: `1.5px solid ${vistaPlanta === '3d' ? '#334155' : 'var(--border-color)'}`,
                    background: vistaPlanta === '3d' ? '#1e293b' : 'var(--bg-primary)',
                    padding: '2px',
                    gap: '2px'
                  }}
                >
                  <button
                    onClick={() => setVistaPlanta('2d')}
                    className={`btn ${vistaPlanta === '2d' ? 'btn-primary' : ''}`}
                    style={{
                      padding: '4px 14px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: vistaPlanta === '2d' ? 'var(--accent-color)' : 'transparent',
                      color:
                        vistaPlanta === '2d'
                          ? '#fff'
                          : vistaPlanta === '3d'
                            ? '#94a3b8'
                            : 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none'
                    }}
                  >
                    Diagrama de Flujo 2D
                  </button>
                  <button
                    onClick={() => setVistaPlanta('3d')}
                    className={`btn ${vistaPlanta === '3d' ? 'btn-primary' : ''}`}
                    style={{
                      padding: '4px 14px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: vistaPlanta === '3d' ? 'var(--accent-color)' : 'transparent',
                      color: vistaPlanta === '3d' ? '#fff' : 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none'
                    }}
                  >
                    Modelo de Planta 3D
                  </button>
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {vistaPlanta === '2d'
                  ? '⚠️ Haz clic sobre cualquier equipo resaltado para analizar componentes e inspeccionar sus subsistemas.'
                  : '🔍 Utiliza el mouse para rotar, trasladar (pan) y hacer zoom sobre el modelo de la planta 3D.'}
              </span>
            </div>

            {/* SVG Diagrama de Proceso */}
            {vistaPlanta === '2d' ? (
              <svg
                viewBox="0 0 900 320"
                width="100%"
                height="auto"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.03))' }}
              >
                {/* Defs para gradientes */}
                <defs>
                  <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="50%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor={activeContext.primaryColor} stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>

                {/* Líneas de tuberías principales */}
                {/* Inlet Pipe */}
                <path
                  d="M 20 200 L 140 200"
                  stroke="url(#pipeGrad)"
                  strokeWidth="18"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 200 L 140 200"
                  stroke={activeContext.primaryColor}
                  strokeWidth="3"
                  fill="none"
                  className={activeContext.flowSpeed}
                  strokeOpacity="0.8"
                />

                {/* Connection Pipe 1 */}
                <path
                  d="M 200 200 L 300 200 L 300 120 L 380 120"
                  stroke="url(#pipeGrad)"
                  strokeWidth="14"
                  fill="none"
                />
                <path
                  d="M 200 200 L 300 200 L 300 120 L 380 120"
                  stroke={activeContext.primaryColor}
                  strokeWidth="2"
                  fill="none"
                  className={activeContext.flowSpeed}
                  strokeOpacity="0.8"
                />

                {/* Connection Pipe 2 */}
                <path
                  d="M 460 120 L 520 120 L 520 200 L 620 200"
                  stroke="url(#pipeGrad)"
                  strokeWidth="14"
                  fill="none"
                />
                <path
                  d="M 460 120 L 520 120 L 520 200 L 620 200"
                  stroke={activeContext.primaryColor}
                  strokeWidth="2"
                  fill="none"
                  className={activeContext.flowSpeed}
                  strokeOpacity="0.8"
                />

                {/* Outlet Pipe */}
                <path
                  d="M 720 200 L 880 200"
                  stroke="url(#pipeGrad)"
                  strokeWidth="18"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 720 200 L 880 200"
                  stroke={activeContext.primaryColor}
                  strokeWidth="3"
                  fill="none"
                  className={activeContext.flowSpeed}
                  strokeOpacity="0.8"
                />

                {/* ETAPA DE PROCESO LABELS */}
                <text
                  x="70"
                  y="160"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontWeight="700"
                  textTransform="uppercase"
                >
                  Insumo Entrada
                </text>
                <text
                  x="70"
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {activeContext.insumo}
                </text>

                <text
                  x="320"
                  y="70"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontWeight="700"
                  textTransform="uppercase"
                >
                  Acondicionamiento
                </text>
                <text
                  x="320"
                  y="90"
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {activeContext.proceso}
                </text>

                <text
                  x="560"
                  y="270"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontWeight="700"
                  textTransform="uppercase"
                >
                  Conversión Principal
                </text>
                <text
                  x="560"
                  y="290"
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {activeContext.transformacion}
                </text>

                <text
                  x="800"
                  y="160"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontWeight="700"
                  textTransform="uppercase"
                >
                  Producto Terminado
                </text>
                <text
                  x="800"
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {activeContext.salida}
                </text>

                {/* EQUIPOS (HOTSPOTS) */}

                {/* 1. BOMBA CENTRÍFUGA (Hotspot) */}
                <g
                  transform="translate(140, 160)"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedEquipment('bomba');
                    setMostrarPID(true);
                  }}
                >
                  <title>Bomba Centrífuga (PMP-101)</title>
                  <rect
                    x="0"
                    y="0"
                    width="70"
                    height="70"
                    rx="10"
                    fill={
                      selectedEquipment === 'bomba' ? 'var(--accent-light)' : 'var(--bg-secondary)'
                    }
                    stroke={
                      selectedEquipment === 'bomba' ? 'var(--accent-color)' : 'var(--border-color)'
                    }
                    strokeWidth="2"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r="22"
                    fill={`${activeContext.primaryColor}15`}
                    stroke={activeContext.primaryColor}
                    strokeWidth="2"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r="10"
                    fill="none"
                    stroke={activeContext.primaryColor}
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <text
                    x="35"
                    y="40"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={activeContext.primaryColor}
                  >
                    BOM
                  </text>
                  {/* Info Dot */}
                  <circle cx="60" cy="10" r="6" fill="var(--accent-color)" />
                  <text
                    x="60"
                    y="13"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="white"
                  >
                    1
                  </text>
                </g>

                {/* 2. MOTOR ELÉCTRICO (Hotspot) */}
                <g
                  transform="translate(20, 220)"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedEquipment('motor');
                    setMostrarPID(true);
                  }}
                >
                  <title>Motor Eléctrico (MOT-101)</title>
                  <rect
                    x="0"
                    y="0"
                    width="90"
                    height="50"
                    rx="6"
                    fill={
                      selectedEquipment === 'motor' ? 'var(--accent-light)' : 'var(--bg-secondary)'
                    }
                    stroke={
                      selectedEquipment === 'motor' ? 'var(--accent-color)' : 'var(--border-color)'
                    }
                    strokeWidth="2"
                  />
                  {/* Aletas de refrigeracion */}
                  <line
                    x1="10"
                    y1="10"
                    x2="80"
                    y2="10"
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="10"
                    y1="20"
                    x2="80"
                    y2="20"
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="10"
                    y1="30"
                    x2="80"
                    y2="30"
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="10"
                    y1="40"
                    x2="80"
                    y2="40"
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                  />
                  <rect x="30" y="45" width="30" height="5" fill="var(--text-muted)" />
                  <text
                    x="45"
                    y="30"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="var(--text-main)"
                  >
                    MOT-AC
                  </text>
                  {/* Info Dot */}
                  <circle cx="80" cy="10" r="6" fill="var(--accent-color)" />
                  <text
                    x="80"
                    y="13"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="white"
                  >
                    2
                  </text>
                </g>

                {/* 3. COMPRESOR ALTERNATIVO (Hotspot) */}
                <g
                  transform="translate(620, 160)"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedEquipment('compresor');
                    setMostrarPID(true);
                  }}
                >
                  <title>Compresor Reciprocante (CMP-101)</title>
                  <rect
                    x="0"
                    y="0"
                    width="100"
                    height="70"
                    rx="8"
                    fill={
                      selectedEquipment === 'compresor'
                        ? 'var(--accent-light)'
                        : 'var(--bg-secondary)'
                    }
                    stroke={
                      selectedEquipment === 'compresor'
                        ? 'var(--accent-color)'
                        : 'var(--border-color)'
                    }
                    strokeWidth="2"
                  />
                  {/* Simbolo de piston */}
                  <path
                    d="M 20 50 L 50 15 L 80 50 Z"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                  />
                  <line
                    x1="50"
                    y1="15"
                    x2="50"
                    y2="55"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                  />
                  <text
                    x="50"
                    y="60"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="var(--text-main)"
                  >
                    COMP-RECIP
                  </text>
                  {/* Info Dot */}
                  <circle cx="90" cy="10" r="6" fill="var(--accent-color)" />
                  <text
                    x="90"
                    y="13"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="white"
                  >
                    3
                  </text>
                </g>

                {/* 4. INTERCAMBIADOR DE CALOR (Hotspot) */}
                <g
                  transform="translate(380, 85)"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedEquipment('intercambiador');
                    setMostrarPID(true);
                  }}
                >
                  <title>Intercambiador de Calor (HEX-101)</title>
                  <rect
                    x="0"
                    y="0"
                    width="80"
                    height="70"
                    rx="20"
                    fill={
                      selectedEquipment === 'intercambiador'
                        ? 'var(--accent-light)'
                        : 'var(--bg-secondary)'
                    }
                    stroke={
                      selectedEquipment === 'intercambiador'
                        ? 'var(--accent-color)'
                        : 'var(--border-color)'
                    }
                    strokeWidth="2"
                  />
                  {/* Tubos internos */}
                  <line
                    x1="10"
                    y1="25"
                    x2="70"
                    y2="25"
                    stroke={activeContext.primaryColor}
                    strokeWidth="2"
                  />
                  <line
                    x1="10"
                    y1="35"
                    x2="70"
                    y2="35"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                  />
                  <line
                    x1="10"
                    y1="45"
                    x2="70"
                    y2="45"
                    stroke={activeContext.primaryColor}
                    strokeWidth="2"
                  />
                  <text
                    x="40"
                    y="15"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="var(--text-main)"
                  >
                    HEX-01
                  </text>
                  {/* Info Dot */}
                  <circle cx="70" cy="10" r="6" fill="var(--accent-color)" />
                  <text
                    x="70"
                    y="13"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="white"
                  >
                    4
                  </text>
                </g>

                {/* 5. VÁLVULA DE CONTROL (Hotspot) */}
                <g
                  transform="translate(540, 20)"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedEquipment('valvula');
                    setMostrarPID(true);
                  }}
                >
                  <title>Válvula de Control Proporcional (TCV-101)</title>
                  <rect
                    x="0"
                    y="0"
                    width="80"
                    height="60"
                    rx="8"
                    fill={
                      selectedEquipment === 'valvula'
                        ? 'var(--accent-light)'
                        : 'var(--bg-secondary)'
                    }
                    stroke={
                      selectedEquipment === 'valvula'
                        ? 'var(--accent-color)'
                        : 'var(--border-color)'
                    }
                    strokeWidth="2"
                  />
                  {/* Actuador y mariposa */}
                  <path
                    d="M 25 45 L 55 25 M 25 25 L 55 45"
                    stroke="var(--text-muted)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="40"
                    cy="15"
                    r="10"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                  />
                  <line
                    x1="40"
                    y1="25"
                    x2="40"
                    y2="35"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                  />
                  <text
                    x="40"
                    y="54"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="var(--text-main)"
                  >
                    TCV-PROPORC
                  </text>
                  {/* Info Dot */}
                  <circle cx="70" cy="10" r="6" fill="var(--accent-color)" />
                  <text
                    x="70"
                    y="13"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="white"
                  >
                    5
                  </text>
                </g>
              </svg>
            ) : (
              <div
                className="sketchfab-embed-wrapper"
                style={{
                  width: '100%',
                  height: '420px',
                  marginTop: '10px',
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}
              >
                <iframe
                  title="Industrial Factory Equipment"
                  frameBorder="0"
                  allowFullScreen
                  mozallowfullscreen="true"
                  webkitallowfullscreen="true"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  xr-spatial-tracking="true"
                  execution-while-out-of-viewport="true"
                  execution-while-not-rendered="true"
                  web-share="true"
                  width="100%"
                  height="100%"
                  src="https://sketchfab.com/models/9143423e241e4a7b98def7e74c15b49b/embed?preload=1&dnt=1"
                />

                {/* Floating Explorer Panel over 3D Viewer */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '220px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 10,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '6px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Explorador de Equipamiento 3D
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      maxHeight: '180px',
                      overflowY: 'auto'
                    }}
                  >
                    {[
                      { id: 'bomba', name: 'Bomba Centrífuga (PMP-101)' },
                      { id: 'motor', name: 'Motor Eléctrico (MOT-101)' },
                      { id: 'compresor', name: 'Compresor Reciprocante (CMP-101)' },
                      { id: 'intercambiador', name: 'Intercambiador de Calor (HEX-101)' },
                      { id: 'valvula', name: 'Válvula de Control (TCV-101)' }
                    ].map((eq) => (
                      <button
                        key={eq.id}
                        onClick={() => {
                          setSelectedEquipment(eq.id);
                          setMostrarPID(true);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          fontSize: '0.72rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor:
                            selectedEquipment === eq.id ? 'var(--accent-color)' : 'transparent',
                          backgroundColor:
                            selectedEquipment === eq.id ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                          color: selectedEquipment === eq.id ? '#eab308' : '#cbd5e1',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{eq.name}</span>
                        {selectedEquipment === eq.id && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#eab308'
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedEquipment && (
                    <div
                      style={{
                        marginTop: '4px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingTop: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.58rem',
                          color: '#94a3b8',
                          textTransform: 'uppercase'
                        }}
                      >
                        Equipo Seleccionado
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fff' }}>
                        {selectedEquipment === 'bomba' && 'Bomba Centrífuga (PMP-101)'}
                        {selectedEquipment === 'motor' && 'Motor Eléctrico (MOT-101)'}
                        {selectedEquipment === 'compresor' && 'Compresor Reciprocante (CMP-101)'}
                        {selectedEquipment === 'intercambiador' &&
                          'Intercambiador de Calor (HEX-101)'}
                        {selectedEquipment === 'valvula' && 'Válvula de Control (TCV-101)'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedEquipment(null);
                          setMostrarPID(false);
                        }}
                        style={{
                          marginTop: '4px',
                          border: 'none',
                          background: 'none',
                          padding: 0,
                          fontSize: '0.62rem',
                          color: '#f43f5e',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        Limpiar selección
                      </button>
                    </div>
                  )}
                </div>

                {/* Floating Context-Aware HUD Panel */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '260px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    zIndex: 10,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '6px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        color: 'var(--accent-color)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      HUD: SIMULACIÓN DE FLUIDOS
                    </span>
                    <span
                      style={{
                        fontSize: '0.58rem',
                        backgroundColor: `${activeContext.primaryColor}30`,
                        color: activeContext.primaryColor,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'bold'
                      }}
                    >
                      {context.toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.7rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Material Procesado:</span>
                      <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>
                        {context === 'Minería' && 'Pulpa / Rocas de Cobre'}
                        {context === 'Alimenticia' && 'Leche Entera Pasteurizada'}
                        {context === 'Energía' && 'Vapor Saturado Seco'}
                        {context === 'Química' && 'Reactivo Catálisis A+B'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Líneas de Tubería (DIN 2403):</span>
                      <span
                        style={{
                          color: activeContext.primaryColor,
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: activeContext.primaryColor
                          }}
                        />
                        {context === 'Minería' && 'Marrón (Pulpa Cobre)'}
                        {context === 'Alimenticia' && 'Blanco (Lácteos)'}
                        {context === 'Energía' && 'Gris Plata (Vapor/Agua)'}
                        {context === 'Química' && 'Violeta (Reactivos/Ácidos)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Variable Crítica Sector:</span>
                      <span style={{ color: '#cbd5e1' }}>
                        {context === 'Minería' && 'Presión Descarga: 4.2 bar'}
                        {context === 'Alimenticia' && 'Temp Pasteurización: 72°C'}
                        {context === 'Energía' && 'Presión Vapor: 12.5 bar'}
                        {context === 'Química' && 'Balance de pH: 6.6'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Circuito Industrial:</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Cerrado y Estable</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visor P&ID Lateral (Fila Superior) */}
        {mostrarPID && (
          <div className="col-span-5" style={{ display: 'flex', flexDirection: 'column' }}>
            <VisorPID
              selectedEquipmentId={selectedEquipment}
              onClose={() => setMostrarPID(false)}
            />
          </div>
        )}
      </div>

      {/* Fila Inferior: Panel de Inspección de Componentes y Subsistemas */}
      {selectedEquipment ? (
        <div className="grid-cols-12 slide-in-left" style={{ gap: '20px' }}>
          {/* General Equipment Specifications */}
          <div
            className="col-span-4 glass-card"
            style={{ borderLeft: `5px solid ${activeContext.primaryColor}` }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}
            >
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '4px' }}>
                  {equipmentFamilies[selectedEquipment].subtitle}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {equipmentFamilies[selectedEquipment].name} (
                  {equipmentFamilies[selectedEquipment].tag})
                </h3>
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                Cerrar
              </button>
            </div>

            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                marginBottom: '20px',
                lineHeight: '1.5'
              }}
            >
              {equipmentFamilies[selectedEquipment].desc}
            </p>

            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Despiece y Componentes Internos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {equipmentFamilies[selectedEquipment].components.map((comp, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: activeContext.primaryColor
                    }}
                  >
                    {comp.name}
                  </span>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginTop: '2px'
                    }}
                  >
                    {comp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Subsystems Integration (Mecánico, Eléctrico, Control) */}
          <div className="col-span-4 glass-card">
            <h4
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Layers3 size={18} className="text-accent" />
              Integración de Subsistemas Industriales
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Los alumnos de 4° a 8° semestre interactúan analizando cómo cada subsistema afecta a
              los otros dos.
            </p>

            {/* Subsystem Toggles */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['Mecánico', 'Eléctrico', 'Control'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubsystem(sub)}
                  className={`btn ${activeSubsystem === sub ? 'btn-primary' : 'btn-secondary'} flex-center gap-12`}
                  style={{ flex: 1, padding: '10px 6px', fontSize: '0.85rem' }}
                >
                  {sub === 'Mecánico' && <Settings size={14} />}
                  {sub === 'Eléctrico' && <Zap size={14} />}
                  {sub === 'Control' && <Cpu size={14} />}
                  <span>{sub}</span>
                </button>
              ))}
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative dynamic pulse based on subsystem */}
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor:
                    activeSubsystem === 'Mecánico'
                      ? 'var(--color-minerria)'
                      : activeSubsystem === 'Eléctrico'
                        ? 'var(--color-energia)'
                        : 'var(--color-quimica)',
                  opacity: 0.05,
                  filter: 'blur(10px)'
                }}
              />

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Foco de Inspección ({activeSubsystem})
              </span>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  lineHeight: '1.6'
                }}
              >
                {equipmentFamilies[selectedEquipment].subsystems[activeSubsystem]}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '20px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px',
                  alignItems: 'center'
                }}
              >
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                  Apto Evaluaciones
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Variables clave: Temperatura, Vibraciones, Señales de feedback analógicas.
                </span>
              </div>
            </div>
          </div>

          {/* Calculadora de Confiabilidad */}
          <div
            className="col-span-4 glass-card"
            style={{ borderRight: `5px solid ${activeContext.primaryColor}` }}
          >
            <CalculadoraConfiabilidad
              equipmentName={equipmentFamilies[selectedEquipment].name}
              equipmentTag={equipmentFamilies[selectedEquipment].tag}
              data={reliabilityData[selectedEquipment]}
              onChange={handleReliabilityChange}
              onReset={handleReliabilityReset}
              isTeacherScenario={!!reliabilityData[selectedEquipment].isTeacherScenario}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '40px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginTop: '20px'
          }}
        >
          💡 Selecciona un equipo del diagrama superior (Bomba, Motor, Compresor, Intercambiador,
          Válvula) para abrir la vista detallada de sus piezas y subsistemas mecánicos, eléctricos y
          lógicos.
        </div>
      )}
    </div>
  );
}
