import React, { useState } from 'react';
import { Search, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, Eye, Play, CheckSquare, Info } from 'lucide-react';

const DiagnosisPanel = () => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'mechanical', 'electrical'
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVibPower, setSelectedVibPower] = useState(2); // Default to 2 HP

  const symptomsData = [
    {
      id: 'symp-1',
      symptom: 'Ruido excesivo o sonido metálico anormal en el cuerpo de la bomba',
      type: 'mechanical',
      typeName: 'Falla Mecánica',
      severity: 'high',
      causes: 'Cavitación debido a obstrucción en la tubería de succión, álabes del impulsor deformados o desgastados, o entrada de aire en la carcasa.',
      correction: 'Realizar purga de aire de la carcasa. Inspeccionar el impulsor por desgaste abrasivo o cavitación tipo panal. Limpiar rejilla de succión.',
      vrSteps: [
        'Realizar bloqueo de energías (LOTO) en el disyuntor eléctrico del motor.',
        'Cerrar válvulas de compuerta en la succión y descarga de la bomba.',
        'Retirar pernos de la carcasa de voluta en cruz para acceder al impulsor.',
        'Inspeccionar álabes del rodete y medir holguras diametrales de los anillos de desgaste.',
        'Reemplazar junta de grafito y reensamblar aplicando torque de 120 N·m.'
      ]
    },
    {
      id: 'symp-2',
      symptom: 'Temperatura de rodamientos de la bomba supera los 75°C',
      type: 'mechanical',
      typeName: 'Falla Mecánica',
      severity: 'high',
      causes: 'Lubricación insuficiente o contaminada con agua, desalineación angular entre el eje del motor y la bomba, o sobreapriete del sello mecánico.',
      correction: 'Inyectar grasa recomendada por el fabricante.',
      vrSteps: [
        'Bloquear e identificar el arrancador del motor.',
        'Medir temperatura superficial en carcasa del cojinete con termómetro infrarrojo.',
        'Verificar nivel y estado del lubricante en el cárter (buscar emulsión por agua).',
        'Montar alineador láser en el acoplamiento y medir desalineación angular (tolerancia máx 0.05 mm).',
        'Purgar y rellenar con aceite sintético ISO VG 46 si aplica, o inyectar grasa limpia.'
      ]
    },
    {
      id: 'symp-3',
      symptom: 'Bajo caudal y presión de descarga insuficiente',
      type: 'mechanical',
      typeName: 'Falla Mecánica',
      severity: 'medium',
      causes: 'Anillos de desgaste con holgura excesiva (recirculación interna), impulsor girando en sentido inverso o fuga en el sello mecánico. Puntos de verificación en terreno: 1) Verificar obstrucción en succión de la bomba. 2) Si se cuenta con vacuómetro, verificar presión de succión o aspiración.',
      correction: 'Verificar sentido de rotación del motor. Medir holgura diametral de anillos. Reemplazar anillos si superan el doble del valor de diseño (0.56 mm).',
      vrSteps: [
        'Verificar telemetría de presión de succión y descarga en el panel.',
        'Comprobar sentido de giro del eje motor (debe coincidir con la flecha de la voluta).',
        'Retirar acoplamiento y desacoplar bomba.',
        'Extraer anillos de desgaste gastados y colocar anillos nuevos con ajuste diametral de 0.28 mm.',
        'Asegurar anillos de reemplazo con pernos prisioneros y Loctite 243.'
      ]
    },
    {
      id: 'symp-4',
      symptom: 'Vibración elevada del eje motor-bomba (mayor a 4.5 mm/s RMS)',
      type: 'mechanical',
      typeName: 'Falla Mecánica',
      severity: 'medium',
      causes: 'Desbalanceo dinámico del impulsor debido a desgaste desigual o incrustaciones, pernos de cimentación sueltos, u holgura excesiva en cojinetes.',
      correction: 'Realizar balanceo dinámico del rodete según norma ISO G2.5. Ajustar pernos de anclaje a la base. Comprobar holguras de rodamientos.',
      vrSteps: [
        'Medir espectro de vibraciones mediante acelerómetro en puntos vertical, horizontal y axial.',
        'Verificar torque de anclaje de la base (120 N·m).',
        'Extraer el impulsor de la bomba.',
        'Montar impulsor en máquina de balanceo dinámico y balancear a G2.5.',
        'Revisar si los rodamientos tienen pistas picadas y cambiarlos si muestran desgaste.'
      ]
    },
    {
      id: 'symp-5',
      symptom: 'El motor eléctrico no arranca o salta el disyuntor al encender',
      type: 'electrical',
      typeName: 'Falla Eléctrica',
      severity: 'high',
      causes: 'Cortocircuito en bobinas del estator, desequilibrio de fases en alimentación, bobina a masa (tierra) debido a humedad, o sobrecarga por eje bloqueado.',
      correction: 'Medir resistencia de aislamiento de bobinado (Megado). Verificar que el rotor gire libremente de forma manual. Inspeccionar disyuntores.',
      vrSteps: [
        'Desenergizar la alimentación principal y aplicar candado e tarjeta de bloqueo.',
        'Intentar girar el acoplamiento manualmente para descartar atascamiento mecánico.',
        'Abrir la caja de conexiones (caja de bornes) del motor eléctrico.',
        'Usar un Megóhmetro (Megger) para medir resistencia de aislamiento de bobinas a tierra (debe ser > 2 MΩ).',
        'Medir resistencia de bobinas con multímetro para descartar desequilibrio entre fases.'
      ]
    },
    {
      id: 'symp-6',
      symptom: 'Sobrecalentamiento en la carcasa del motor eléctrico',
      type: 'electrical',
      typeName: 'Falla Eléctrica',
      severity: 'medium',
      causes: 'Funcionamiento en dos fases (pérdida de una fase), rejilla del ventilador obstruida, o tensión de alimentación fuera del rango nominal.',
      correction: 'Comprobar tensiones de alimentación trifásica en tablero. Limpiar aletas de refrigeración y rejilla del ventilador del motor.',
      vrSteps: [
        'Medir corriente de consumo en cada una de las 3 fases usando pinza amperimétrica.',
        'Limpiar acumulación de polvo y grasa en aletas disipadoras del estator.',
        'Comprobar estado y acople del ventilador plástico en el extremo trasero del eje.',
        'Verificar el voltaje fase-fase (debe coincidir con la placa de características: 380V en Chile).'
      ]
    }
  ];

  const filteredSymptoms = symptomsData.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.symptom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.causes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.correction.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityBadge = (severity) => {
    if (severity === 'high') {
      return (
        <span style={{ 
          fontSize: '0.68rem', 
          fontWeight: 'bold', 
          background: 'rgba(220, 38, 38, 0.08)', 
          color: 'var(--status-replace)', 
          padding: '2px 8px', 
          borderRadius: '10px', 
          border: '1px solid rgba(220,38,38,0.15)',
          textTransform: 'uppercase' 
        }}>
          Crítico
        </span>
      );
    }
    return (
      <span style={{ 
        fontSize: '0.68rem', 
        fontWeight: 'bold', 
        background: 'rgba(217, 119, 6, 0.08)', 
        color: 'var(--status-inspect)', 
        padding: '2px 8px', 
        borderRadius: '10px', 
        border: '1px solid rgba(217,119,6,0.15)',
        textTransform: 'uppercase' 
      }}>
        Medio
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '-0.03em' }}>Guía Diagnóstica y Tabla de Síntomas</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
          Matriz interactiva para la detección, diagnóstico y corrección de fallas mecánicas y eléctricas comunes en el conjunto motor-bomba. Sigue las secuencias de verificación indicadas para aplicar en tu simulador o visor VR.
        </p>
      </div>

      {/* Control Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '380px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Buscar síntoma, causa o procedimiento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-glass)', 
              color: 'var(--text-primary)', 
              borderRadius: '24px', 
              padding: '10px 16px 10px 38px', 
              fontSize: '0.88rem', 
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
            className="search-input"
          />
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-sidebar-header)', padding: '4px', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
          <button 
            className={`btn-secondary ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
            style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '0.8rem', boxShadow: 'none' }}
          >
            Ver Todas
          </button>
          <button 
            className={`btn-secondary ${filterType === 'mechanical' ? 'active' : ''}`}
            onClick={() => setFilterType('mechanical')}
            style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '0.8rem', boxShadow: 'none' }}
          >
            Mecánicas
          </button>
          <button 
            className={`btn-secondary ${filterType === 'electrical' ? 'active' : ''}`}
            onClick={() => setFilterType('electrical')}
            style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '0.8rem', boxShadow: 'none' }}
          >
            Eléctricas
          </button>
        </div>

      </div>

      {/* Symptoms list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredSymptoms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', border: '1px dotted var(--border-glass)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <HelpCircle size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No se encontraron síntomas o fallas para tu búsqueda.</p>
          </div>
        ) : (
          filteredSymptoms.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id} 
                style={{ 
                  background: 'var(--bg-glass)', 
                  border: isExpanded ? '1px solid var(--border-glass-active)' : '1px solid var(--border-glass)', 
                  borderRadius: '12px', 
                  boxShadow: isExpanded ? 'var(--shadow-premium), var(--shadow-glow)' : 'var(--shadow-premium)', 
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Header card info */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{ 
                    padding: '20px', 
                    display: 'grid', 
                    gridTemplateColumns: '1fr auto', 
                    gap: '16px', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(56, 189, 248, 0.03)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        background: item.type === 'mechanical' ? 'rgba(2, 132, 199, 0.08)' : 'rgba(79, 70, 229, 0.08)', 
                        color: item.type === 'mechanical' ? 'var(--accent-cyan)' : 'var(--accent-indigo)', 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        border: `1px solid ${item.type === 'mechanical' ? 'rgba(2,132,199,0.15)' : 'rgba(79,70,229,0.15)'}`
                      }}>
                        {item.typeName}
                      </span>
                      {getSeverityBadge(item.severity)}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {item.symptom}
                    </h3>
                  </div>

                  <button 
                    className="btn-secondary" 
                    style={{ 
                      borderRadius: '50%', 
                      width: '36px', 
                      height: '36px', 
                      padding: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.25s'
                    }}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Collapsible details body */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-sidebar-header)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '20px' }}>
                      
                      {/* Left: Cause & Basic Correction */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Causas Probables</strong>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                            {item.causes}
                          </p>
                        </div>
                        
                        <div>
                          <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Acción Correctiva Recomendada</strong>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                            {item.correction}
                          </p>
                        </div>
                      </div>

                      {/* Right: Step-by-Step VR Verification Checklist */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <CheckSquare size={14} color="var(--accent-cyan)" /> Secuencia de Inspección en VR (Segura)
                        </strong>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {item.vrSteps.map((step, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                display: 'flex', 
                                gap: '10px', 
                                background: 'rgba(255, 255, 255, 0.02)', 
                                padding: '10px 12px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-glass)',
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                                alignItems: 'center'
                              }}
                            >
                              <span style={{ 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '50%', 
                                background: 'var(--accent-cyan)', 
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Guía de Referencia Técnica: ISO 10816-1 */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-premium)',
        marginTop: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <ShieldCheck size={20} color="var(--accent-cyan)" /> Referencia Técnica: Severidad Vibratoria (ISO 10816-1)
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clase I: Máquinas pequeñas de potencia &lt; 15 kW (1 a 20 HP)</span>
          </div>

          {/* Selector de potencia para consulta */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-sidebar-header)', padding: '3px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            {[1, 2, 3].map((power) => (
              <button
                key={power}
                onClick={() => setSelectedVibPower(power)}
                className={`btn-secondary ${selectedVibPower === power ? 'active' : ''}`}
                style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', border: 'none', boxShadow: 'none' }}
              >
                {power} HP
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
          La norma <strong>ISO 10816-1</strong> establece pautas globales para evaluar la vibración mecánica de máquinas en sus soportes. Para motores de <strong>{selectedVibPower} HP</strong> (aproximadamente {(selectedVibPower * 0.746).toFixed(2)} kW), la vibración se mide en velocidad eficaz (RMS) en mm/s en el rango de 10 Hz a 1000 Hz.
        </p>

        {/* Severity Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sidebar-header)', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Zona de Severidad</th>
                <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Rango Vibratorio (mm/s RMS)</th>
                <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Evaluación del Estado</th>
                <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Acción Recomendada</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(16, 185, 129, 0.02)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 'bold', color: 'var(--status-operational)' }}>Zona A (Bueno)</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>0.00 a 0.71</td>
                <td style={{ padding: '10px 14px' }}>Excelente. Comportamiento óptimo.</td>
                <td style={{ padding: '10px 14px' }}>Mantener lubricación y monitoreo de rutina.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(6, 182, 212, 0.02)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>Zona B (Satisfactorio)</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>0.71 a 1.80</td>
                <td style={{ padding: '10px 14px' }}>Aceptable. Operación continua sin restricciones.</td>
                <td style={{ padding: '10px 14px' }}>No requiere intervención correctiva inmediata.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(245, 158, 11, 0.02)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 'bold', color: 'var(--status-inspect)' }}>Zona C (Alerta)</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>1.80 a 4.50</td>
                <td style={{ padding: '10px 14px' }}>Insatisfactorio. Desgaste o desalineación leve.</td>
                <td style={{ padding: '10px 14px' }}>Programar mantenimiento preventivo a corto plazo.</td>
              </tr>
              <tr style={{ background: 'rgba(239, 68, 68, 0.02)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 'bold', color: 'var(--status-replace)' }}>Zona D (Peligro)</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>&gt; 4.50</td>
                <td style={{ padding: '10px 14px' }}>Inaceptable. Daño destructivo inminente.</td>
                <td style={{ padding: '10px 14px', fontWeight: 'bold', color: 'var(--status-replace)' }}>Detención de emergencia del motor. Aplicar LOTO.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'var(--bg-sidebar-header)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <Info size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Consejo Operativo para {selectedVibPower} HP:</strong> Si en el Simulador 3D la vibración del eje excede los <strong>1.80 mm/s RMS</strong>, estarás operando en la <strong>Zona C (Alerta)</strong>. Si superas los <strong>4.50 mm/s RMS</strong>, ingresarás en la <strong>Zona D (Peligro)</strong>. Utiliza la alineación láser y el balanceo dinámico de álabes en tu matriz de diagnóstico para retornar la vibración a la Zona A.
          </div>
        </div>
      </div>

    </div>
  );
};

export default DiagnosisPanel;
