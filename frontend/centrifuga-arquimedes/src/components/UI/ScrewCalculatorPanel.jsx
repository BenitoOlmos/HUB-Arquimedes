import React, { useState, useEffect } from 'react';
import { Wrench, Shield, ShieldCheck, Scale, Info, HelpCircle } from 'lucide-react';

const ScrewCalculatorPanel = () => {
  const [threadSystem, setThreadSystem] = useState('metric'); // 'metric' | 'inch'
  const [nominalDiameter, setNominalDiameter] = useState('M12');
  const [pitch, setPitch] = useState('1.75');
  const [selectedGrade, setSelectedGrade] = useState('8.8');
  const [safetyFactor, setSafetyFactor] = useState(3.0);

  // Standard diameters list
  const metricDiameters = [
    { id: 'M4', d: 4.0, pitch: '0.70' },
    { id: 'M5', d: 5.0, pitch: '0.80' },
    { id: 'M6', d: 6.0, pitch: '1.00' },
    { id: 'M8', d: 8.0, pitch: '1.25' },
    { id: 'M10', d: 10.0, pitch: '1.50' },
    { id: 'M12', d: 12.0, pitch: '1.75' },
    { id: 'M14', d: 14.0, pitch: '2.00' },
    { id: 'M16', d: 16.0, pitch: '2.00' },
    { id: 'M20', d: 20.0, pitch: '2.50' },
    { id: 'M24', d: 24.0, pitch: '3.00' },
    { id: 'M30', d: 30.0, pitch: '3.50' }
  ];

  const inchDiameters = [
    { id: '1/4"', d: 6.35, pitch: '20 TPI' },
    { id: '5/16"', d: 7.9375, pitch: '18 TPI' },
    { id: '3/8"', d: 9.525, pitch: '16 TPI' },
    { id: '7/16"', d: 11.1125, pitch: '14 TPI' },
    { id: '1/2"', d: 12.70, pitch: '13 TPI' },
    { id: '5/8"', d: 15.875, pitch: '11 TPI' },
    { id: '3/4"', d: 19.05, pitch: '10 TPI' },
    { id: '7/8"', d: 22.225, pitch: '9 TPI' },
    { id: '1"', d: 25.40, pitch: '8 TPI' },
    { id: '1 1/8"', d: 28.575, pitch: '7 TPI' },
    { id: '1 1/4"', d: 31.75, pitch: '7 TPI' }
  ];

  // Standard bolt grades list
  const boltGrades = {
    metric: [
      { grade: '4.6', label: 'Clase 4.6', ultimateStress: 40.8, yieldStress: 24.5, material: 'Acero de bajo o medio carbono', markings: '4.6' },
      { grade: '5.6', label: 'Clase 5.6', ultimateStress: 51.0, yieldStress: 30.6, material: 'Acero de bajo o medio carbono', markings: '5.6' },
      { grade: '8.8', label: 'Clase 8.8 (Alta Resistencia)', ultimateStress: 81.6, yieldStress: 65.3, material: 'Acero de medio carbono templado y revenido', markings: '8.8' },
      { grade: '10.9', label: 'Clase 10.9 (Extra Alta)', ultimateStress: 102.0, yieldStress: 91.8, material: 'Acero aleado templado y revenido', markings: '10.9' },
      { grade: '12.9', label: 'Clase 12.9 (Uso Estructural)', ultimateStress: 122.4, yieldStress: 110.1, material: 'Acero aleado templado y revenido de alta calidad', markings: '12.9' }
    ],
    inch: [
      { grade: 'G2', label: 'SAE Grado 2', ultimateStress: 52.0, yieldStress: 40.1, material: 'Acero de bajo carbono', markings: 'Liso' },
      { grade: 'G5', label: 'SAE Grado 5 (Intermedio)', ultimateStress: 84.4, yieldStress: 64.7, material: 'Acero de medio carbono templado y revenido', markings: '3 líneas radiales' },
      { grade: 'G8', label: 'SAE Grado 8 (Alta Resistencia)', ultimateStress: 105.5, yieldStress: 91.4, material: 'Acero aleado templado y revenido', markings: '6 líneas radiales' }
    ]
  };

  // Sync default diameter and pitch when system changes
  useEffect(() => {
    if (threadSystem === 'metric') {
      setNominalDiameter('M12');
      setPitch('1.75');
      setSelectedGrade('8.8');
    } else {
      setNominalDiameter('1/2"');
      setPitch('13 TPI');
      setSelectedGrade('G5');
    }
  }, [threadSystem]);

  // Sync pitch when nominal diameter changes
  const handleDiameterChange = (e) => {
    const val = e.target.value;
    setNominalDiameter(val);
    if (threadSystem === 'metric') {
      const found = metricDiameters.find(item => item.id === val);
      if (found) setPitch(found.pitch);
    } else {
      const found = inchDiameters.find(item => item.id === val);
      if (found) setPitch(found.pitch);
    }
  };

  // Calculations
  const activeDiameterData = (threadSystem === 'metric' ? metricDiameters : inchDiameters).find(
    item => item.id === nominalDiameter
  ) || { d: 12.0 };

  const activeGradeData = boltGrades[threadSystem].find(
    item => item.grade === selectedGrade
  ) || { ultimateStress: 81.6, yieldStress: 65.3, material: '', markings: '' };

  const dNominal = activeDiameterData.d;
  const radius = dNominal / 2;
  const sectionArea = Math.PI * Math.pow(radius, 2); // mm^2
  const ultimateTensileStrength = activeGradeData.ultimateStress; // kg/mm^2
  const yieldStrength = activeGradeData.yieldStress; // kg/mm^2

  const RT = sectionArea * ultimateTensileStrength; // Ultimate Load (kg)
  const RT_kN = RT / 101.97; // kN
  const yieldLoad = sectionArea * yieldStrength; // Yield Load (kg)
  const yieldLoad_kN = yieldLoad / 101.97; // kN

  const safeLoad = RT / safetyFactor; // Safe Load (kg)
  const safeLoad_kN = safeLoad / 101.97; // kN

  // Visual head marks drawer (dynamic SVG)
  const renderBoltHeadSVG = () => {
    const isSAE = threadSystem === 'inch';
    
    return (
      <svg viewBox="0 0 140 140" width="100%" height="100%" style={{ maxHeight: '160px' }}>
        <defs>
          <radialGradient id="hex-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        
        {/* Glow circle */}
        <circle cx="70" cy="70" r="65" fill="url(#hex-glow)" />

        {/* Outer Hexagon shape representing the head */}
        <polygon 
          points="70,10 120,40 120,100 70,130 20,100 20,40" 
          fill="var(--bg-sidebar-header)" 
          stroke="var(--border-glass-active)" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />
        
        {/* Inner chamfer circle */}
        <circle 
          cx="70" 
          cy="70" 
          r="42" 
          fill="none" 
          stroke="var(--border-glass)" 
          strokeWidth="1.5" 
          strokeDasharray="4,2" 
        />

        {/* Central washer / thread socket detail */}
        <circle cx="70" cy="70" r="10" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2" />

        {/* Specific Head Markings based on Selected Bolt Grade */}
        {selectedGrade === '4.6' && (
          <text x="70" y="75" fill="var(--text-secondary)" fontSize="15" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">4.6</text>
        )}
        {selectedGrade === '5.6' && (
          <text x="70" y="75" fill="var(--text-secondary)" fontSize="15" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">5.6</text>
        )}
        {selectedGrade === '8.8' && (
          <text x="70" y="75" fill="var(--text-primary)" fontSize="16" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" style={{ letterSpacing: '0.5px' }}>8.8</text>
        )}
        {selectedGrade === '10.9' && (
          <text x="70" y="75" fill="var(--text-primary)" fontSize="16" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">10.9</text>
        )}
        {selectedGrade === '12.9' && (
          <text x="70" y="75" fill="var(--status-replace)" fontSize="16" fontWeight="950" fontFamily="sans-serif" textAnchor="middle">12.9</text>
        )}
        
        {/* SAE Radial Lines Head Markings */}
        {selectedGrade === 'G5' && (
          <g stroke="var(--text-primary)" strokeWidth="4" strokeLinecap="round">
            {/* 3 lines for Grade 5 at 120 deg (Top, Bottom Left, Bottom Right) */}
            <line x1="70" y1="20" x2="70" y2="38" />
            <line x1="26" y1="95" x2="42" y2="86" />
            <line x1="114" y1="95" x2="98" y2="86" />
            <text x="70" y="74" fill="var(--text-secondary)" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SAE 5</text>
          </g>
        )}
        {selectedGrade === 'G8' && (
          <g stroke="var(--status-replace)" strokeWidth="4" strokeLinecap="round">
            {/* 6 lines for Grade 8 at 60 deg */}
            <line x1="70" y1="20" x2="70" y2="38" />
            <line x1="70" y1="120" x2="70" y2="102" />
            <line x1="26" y1="45" x2="42" y2="54" />
            <line x1="114" y1="45" x2="98" y2="54" />
            <line x1="26" y1="95" x2="42" y2="86" />
            <line x1="114" y1="95" x2="98" y2="86" />
            <text x="70" y="74" fill="var(--status-replace)" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SAE 8</text>
          </g>
        )}
        {selectedGrade === 'G2' && (
          <g>
            <circle cx="70" cy="70" r="3" fill="var(--text-muted)" />
            <text x="70" y="76" fill="var(--text-muted)" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">LISO (G2)</text>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '-0.03em' }}>Identificación y Cálculo de Roscas</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
            Módulo mecánico interactivo para el análisis dimensional de uniones atornilladas, inspección visual de marcas de resistencia e ingeniería de esfuerzos admisibles.
          </p>
        </div>
      </div>

      {/* Main interactive grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Paso 1: Geometría de Rosca */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.1)', fontSize: '0.8rem', fontWeight: 'bold' }}>1</span>
            Geometría de la Rosca
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* System select buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setThreadSystem('metric')}
                className={`btn-secondary ${threadSystem === 'metric' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px', fontSize: '0.82rem', background: threadSystem === 'metric' ? 'rgba(2, 132, 199, 0.08)' : '', borderColor: threadSystem === 'metric' ? 'var(--accent-cyan)' : '', color: threadSystem === 'metric' ? 'var(--accent-cyan)' : '' }}
              >
                Métrica (mm)
              </button>
              <button
                onClick={() => setThreadSystem('inch')}
                className={`btn-secondary ${threadSystem === 'inch' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px', fontSize: '0.82rem', background: threadSystem === 'inch' ? 'rgba(2, 132, 199, 0.08)' : '', borderColor: threadSystem === 'inch' ? 'var(--accent-cyan)' : '', color: threadSystem === 'inch' ? 'var(--accent-cyan)' : '' }}
              >
                Whitworth (Pulgadas)
              </button>
            </div>

            {/* Nominal Diameter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)' }}>Diámetro Nominal (𝜙)</label>
              <select
                value={nominalDiameter}
                onChange={handleDiameterChange}
                className="premium-select"
                style={{ padding: '8px', fontSize: '0.85rem' }}
              >
                {(threadSystem === 'metric' ? metricDiameters : inchDiameters).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.id} ({item.d.toFixed(2)} mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Pitch display */}
            <div style={{ background: 'var(--bg-sidebar-header)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Paso de Rosca / Hilos</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{pitch}</strong>
              </div>
              <Info size={16} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            {/* Dimension summary badge */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              ℹ️ {threadSystem === 'metric' 
                ? 'Las roscas métricas están normalizadas bajo ISO. El diámetro y paso se miden directamente en milímetros.' 
                : 'Las roscas en pulgadas (UNC/UNF) corresponden al estándar inglés y americano. El paso se define como hilos por pulgada (TPI).'}
            </div>

          </div>
        </div>

        {/* Paso 2: Base de Datos de Grados y Marcas */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.1)', fontSize: '0.8rem', fontWeight: 'bold' }}>2</span>
            Grado y Marcas del Tornillo
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
            {/* Visual Screw Head */}
            <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.01)', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border-glass)' }}>
              {renderBoltHeadSVG()}
            </div>

            {/* Select Grade */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)' }}>Seleccione Calidad / Grado</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="premium-select"
                  style={{ padding: '8px', fontSize: '0.85rem' }}
                >
                  {boltGrades[threadSystem].map(item => (
                    <option key={item.grade} value={item.grade}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-sidebar-header)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                <strong>Marcado:</strong> {activeGradeData.markings}
              </div>
            </div>
          </div>

          {/* Material Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Especificación de Material</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '600' }}>
              {activeGradeData.material}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Resistencia Tracción ($S_t$):<br/>
                <strong style={{ color: 'var(--accent-blue)', fontSize: '0.8rem' }}>{activeGradeData.ultimateStress.toFixed(1)} kg/mm²</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Límite Elástico ($S_y$):<br/>
                <strong style={{ color: 'var(--accent-indigo)', fontSize: '0.8rem' }}>{activeGradeData.yieldStress.toFixed(1)} kg/mm²</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 3: Motor de Cálculo y Resultados */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.1)', fontSize: '0.8rem', fontWeight: 'bold' }}>3</span>
            Resultados y Límites de Carga
          </h2>

          {/* Math details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-glass)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Radio del Perno ($R$):</span>
              <strong style={{ fontFamily: 'monospace' }}>{radius.toFixed(3)} mm</strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-glass)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Área Sección ($S = \pi \cdot R^2$):</span>
              <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{sectionArea.toFixed(2)} mm²</strong>
            </div>

            {/* Safety Factor Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '800' }}>
                <span>Factor de Seguridad ($F_s$)</span>
                <span style={{ color: 'var(--accent-indigo)' }}>{safetyFactor.toFixed(1)}</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={safetyFactor}
                onChange={(e) => setSafetyFactor(parseFloat(e.target.value))}
                className="premium-slider"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Big Output Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%)', 
            border: '2px solid var(--border-glass-active)', 
            borderRadius: '10px', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Ultimate tensile limit */}
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Scale size={12} color="var(--accent-cyan)" /> Resistencia de Rotura ($R_T$)
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <strong style={{ fontSize: '1.45rem', color: 'var(--text-primary)' }}>{Math.round(RT).toLocaleString()} <span style={{ fontSize: '0.9rem' }}>kg</span></strong>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 'bold', fontFamily: 'monospace' }}>{RT_kN.toFixed(1)} kN</span>
              </div>
            </div>

            {/* Yield limit */}
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={12} color="var(--accent-indigo)" /> Límite de Fluencia Elástica
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{Math.round(yieldLoad).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>kg</span></strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{yieldLoad_kN.toFixed(1)} kN</span>
              </div>
            </div>

            {/* Safe working load */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-operational)', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Carga Segura de Trabajo ($R_T / F_s$)
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <strong style={{ fontSize: '1.65rem', color: 'var(--status-operational)' }}>{Math.round(safeLoad).toLocaleString()} <span style={{ fontSize: '0.95rem' }}>kg</span></strong>
                <span style={{ fontSize: '1rem', color: 'var(--status-operational)', fontWeight: 'bold', fontFamily: 'monospace' }}>{safeLoad_kN.toFixed(1)} kN</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', background: 'rgba(16, 185, 129, 0.04)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--status-operational)' }}>
            <strong>💡 Recomendación Técnica:</strong> La carga máxima de trabajo segura es de <strong>{Math.round(safeLoad).toLocaleString()} kg</strong>. Si el esfuerzo supera este umbral, se aconseja aumentar el diámetro del perno o emplear calidades superiores como 10.9 o 12.9.
          </div>
        </div>

      </div>

      {/* ISO Norm References Card */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', margin: 0 }}>
          <Info size={18} /> Tabla de Referencia Rápida de Tornillos Industriales
        </h2>
        
        <div className="audit-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="audit-table" style={{ width: '100%', fontSize: '0.78rem' }}>
            <thead>
              <tr>
                <th>Normativa / Sistema</th>
                <th>Grado / Marca</th>
                <th>Resistencia Tracción ($S_t$)</th>
                <th>Límite Elástico ($S_y$)</th>
                <th>Material Típico</th>
                <th>Clasificación de Dureza</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '600' }}>ISO 898-1 (Métrico)</td>
                <td style={{ color: 'var(--text-muted)' }}>4.6</td>
                <td style={{ fontWeight: 'bold' }}>400 MPa (40.8 kg/mm²)</td>
                <td>240 MPa (24.5 kg/mm²)</td>
                <td>Acero de bajo/medio carbono</td>
                <td>Baja resistencia</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>ISO 898-1 (Métrico)</td>
                <td style={{ color: 'var(--text-muted)' }}>5.6</td>
                <td style={{ fontWeight: 'bold' }}>500 MPa (51.0 kg/mm²)</td>
                <td>300 MPa (30.6 kg/mm²)</td>
                <td>Acero de bajo/medio carbono</td>
                <td>Baja/Media</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>ISO 898-1 (Métrico)</td>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>8.8</td>
                <td style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>800 MPa (81.6 kg/mm²)</td>
                <td>640 MPa (65.3 kg/mm²)</td>
                <td>Acero medio carbono templado</td>
                <td>Alta resistencia</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>ISO 898-1 (Métrico)</td>
                <td style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}>10.9</td>
                <td style={{ fontWeight: 'bold', color: 'var(--accent-indigo)' }}>1000 MPa (102.0 kg/mm²)</td>
                <td>900 MPa (91.8 kg/mm²)</td>
                <td>Acero aleado templado/revenido</td>
                <td>Extra alta resistencia</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>ISO 898-1 (Métrico)</td>
                <td style={{ color: 'var(--status-replace)', fontWeight: 'bold' }}>12.9</td>
                <td style={{ fontWeight: 'bold', color: 'var(--status-replace)' }}>1200 MPa (122.4 kg/mm²)</td>
                <td>1080 MPa (110.1 kg/mm²)</td>
                <td>Acero aleado templado de alta calidad</td>
                <td>Grado estructural crítico</td>
              </tr>
              <tr style={{ borderTop: '2px solid var(--border-glass)' }}>
                <td style={{ fontWeight: '600' }}>SAE J429 (Pulgadas)</td>
                <td style={{ color: 'var(--text-muted)' }}>Grado 2</td>
                <td style={{ fontWeight: 'bold' }}>510 MPa (52.0 kg/mm²)</td>
                <td>393 MPa (40.1 kg/mm²)</td>
                <td>Acero de bajo/medio carbono</td>
                <td>Baja resistencia estándar</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>SAE J429 (Pulgadas)</td>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Grado 5</td>
                <td style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>827 MPa (84.4 kg/mm²)</td>
                <td>634 MPa (64.7 kg/mm²)</td>
                <td>Acero medio carbono templado</td>
                <td>Alta resistencia automotriz</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>SAE J429 (Pulgadas)</td>
                <td style={{ color: 'var(--status-replace)', fontWeight: 'bold' }}>Grado 8</td>
                <td style={{ fontWeight: 'bold', color: 'var(--status-replace)' }}>1034 MPa (105.5 kg/mm²)</td>
                <td>896 MPa (91.4 kg/mm²)</td>
                <td>Acero aleado templado y revenido</td>
                <td>Grado pesado / crítico</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ScrewCalculatorPanel;
