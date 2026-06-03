import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Play, Thermometer, Gauge, Activity, AlertOctagon, Info, Zap } from 'lucide-react';

const SecurityPanel = () => {
  const [failMode, setFailMode] = useState('normal'); // 'normal', 'cavitation', 'bearing', 'overheat'
  
  // Real-time fluctuating state variables
  const [suctionPres, setSuctionPres] = useState(1.8);
  const [dischargePres, setDischargePres] = useState(4.2);
  const [bearingTemp, setBearingTemp] = useState(42.5);
  const [coilTemp, setCoilTemp] = useState(55.0);
  const [vibration, setVibration] = useState(1.4);

  // Fluctuations interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Add minor random fluctuation
      const rand = () => (Math.random() - 0.5) * 0.05;
      const randTemp = () => (Math.random() - 0.5) * 0.4;

      if (failMode === 'normal') {
        setSuctionPres(prev => Math.max(1.5, Math.min(2.0, prev + rand() * 0.5)));
        setDischargePres(prev => Math.max(4.0, Math.min(4.5, prev + rand() * 0.5)));
        setBearingTemp(prev => Math.max(40.0, Math.min(46.0, prev + randTemp())));
        setCoilTemp(prev => Math.max(52.0, Math.min(58.0, prev + randTemp())));
        setVibration(prev => Math.max(1.1, Math.min(1.7, prev + rand() * 0.2)));
      } 
      else if (failMode === 'cavitation') {
        // Cavitation: Suction drops, discharge drops, vibration spikes
        setSuctionPres(prev => Math.max(0.1, Math.min(0.5, prev + rand() * 0.2)));
        setDischargePres(prev => Math.max(1.8, Math.min(2.5, prev + rand() * 0.4)));
        setBearingTemp(prev => Math.max(45.0, Math.min(50.0, prev + randTemp())));
        setCoilTemp(prev => Math.max(55.0, Math.min(60.0, prev + randTemp())));
        setVibration(prev => Math.max(4.8, Math.min(6.2, prev + (Math.random() - 0.5) * 0.6)));
      } 
      else if (failMode === 'bearing') {
        // Bearing Failure: Temperature and vibration spike
        setSuctionPres(prev => Math.max(1.5, Math.min(2.0, prev + rand() * 0.5)));
        setDischargePres(prev => Math.max(3.8, Math.min(4.3, prev + rand() * 0.5)));
        setBearingTemp(prev => Math.max(82.0, Math.min(94.0, prev + (Math.random() - 0.5) * 1.5)));
        setCoilTemp(prev => Math.max(55.0, Math.min(62.0, prev + randTemp())));
        setVibration(prev => Math.max(3.8, Math.min(5.0, prev + (Math.random() - 0.5) * 0.5)));
      } 
      else if (failMode === 'overheat') {
        // Coil Overheat: Coil temp spikes, discharge drops slightly
        setSuctionPres(prev => Math.max(1.5, Math.min(2.0, prev + rand() * 0.5)));
        setDischargePres(prev => Math.max(3.5, Math.min(4.0, prev + rand() * 0.5)));
        setBearingTemp(prev => Math.max(45.0, Math.min(52.0, prev + randTemp())));
        setCoilTemp(prev => Math.max(98.0, Math.min(115.0, prev + (Math.random() - 0.5) * 2.0)));
        setVibration(prev => Math.max(1.5, Math.min(2.3, prev + rand() * 0.3)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [failMode]);

  // Status limits checking helper
  const getStatusColor = (val, warn, crit) => {
    if (val >= crit) return 'var(--status-replace)';
    if (val >= warn) return 'var(--status-inspect)';
    return 'var(--status-operational)';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '-0.03em' }}>Seguridad Industrial y Telemetría IoT</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
          Visualización de protocolos de seguridad en Realidad Virtual e integración bidireccional de sensores para el monitoreo y mantenimiento de la maquinaria (Industria 4.0).
        </p>
      </div>

      {/* Grid: Safety & IoT Protocols */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Safety Box */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-operational)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--status-operational)" /> Módulo de Ensayos Virtuales 100% Seguros
          </h2>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            El simulador VR permite a los estudiantes realizar prácticas críticas de mantenimiento de alta peligrosidad eliminando por completo el riesgo de accidentes reales graves:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(5, 150, 105, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(5,150,105,0.1)' }}>
              <Zap size={18} color="var(--status-operational)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Cero Riesgo de Electrocución</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prácticas de desmontaje de caja de bornes y medición de bobinado del motor eléctrico con tensión trifásica simulada sin riesgo de choque eléctrico.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(5, 150, 105, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(5,150,105,0.1)' }}>
              <ShieldCheck size={18} color="var(--status-operational)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Protocolo LOTO (Bloqueo y Etiquetado)</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>El estudiante aprende la secuencia obligatoria de bloqueo de disyuntores mecánicos/eléctricos y colocación de candados de seguridad antes de manipular las piezas.</span>
              </div>
            </div>
          </div>
        </div>

        {/* IoT Protocols Box */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={22} color="var(--accent-cyan)" /> Domótica Industrial e Integración IoT
          </h2>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            La plataforma interactúa de manera bidireccional. La telemetría captada por la maqueta o gemelo digital se transmite en tiempo real hacia los dashboards y el visor de realidad inmersiva (HUD):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <strong style={{ color: 'var(--accent-cyan)', width: '130px', flexShrink: 0 }}>Protocolos de Red:</strong>
              <span>WebSockets para actualización inmediata de gráficos, MQTT para sensores IoT industriales.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <strong style={{ color: 'var(--accent-cyan)', width: '130px', flexShrink: 0 }}>Visualización:</strong>
              <span>Gafas de Realidad Virtual (HUD inmersivo) y Dashboard web unificado para docentes.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--accent-cyan)', width: '130px', flexShrink: 0 }}>Retroalimentación:</strong>
              <span>Alarma visual y sonora instantánea en caso de desbordamiento de límites térmicos o mecánicos.</span>
            </div>
          </div>
        </div>

      </div>

      {/* IoT Telemetry Simulation Dashboard */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--accent-cyan)" /> Telemetría de Control de Planta (IoT Simulado)
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inyecta fallas y observa el comportamiento de los sensores en tiempo real</span>
          </div>

          {/* Fault injection buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setFailMode('normal')}
              className={`btn-secondary ${failMode === 'normal' ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '16px', background: failMode === 'normal' ? 'rgba(5, 185, 129, 0.08)' : '', borderColor: failMode === 'normal' ? 'var(--status-operational)' : '', color: failMode === 'normal' ? 'var(--status-operational)' : '' }}
            >
              Operación Normal
            </button>
            <button 
              onClick={() => setFailMode('cavitation')}
              className={`btn-secondary ${failMode === 'cavitation' ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '16px', background: failMode === 'cavitation' ? 'rgba(220, 38, 38, 0.08)' : '', borderColor: failMode === 'cavitation' ? 'var(--status-replace)' : '', color: failMode === 'cavitation' ? 'var(--status-replace)' : '' }}
            >
              Falla: Cavitación
            </button>
            <button 
              onClick={() => setFailMode('bearing')}
              className={`btn-secondary ${failMode === 'bearing' ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '16px', background: failMode === 'bearing' ? 'rgba(220, 38, 38, 0.08)' : '', borderColor: failMode === 'bearing' ? 'var(--status-replace)' : '', color: failMode === 'bearing' ? 'var(--status-replace)' : '' }}
            >
              Falla: Rodamiento Gastado
            </button>
            <button 
              onClick={() => setFailMode('overheat')}
              className={`btn-secondary ${failMode === 'overheat' ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '16px', background: failMode === 'overheat' ? 'rgba(220, 38, 38, 0.08)' : '', borderColor: failMode === 'overheat' ? 'var(--status-replace)' : '', color: failMode === 'overheat' ? 'var(--status-replace)' : '' }}
            >
              Falla: Sobrecarga Motor
            </button>
          </div>
        </div>

        {/* Warning Banner if failMode active */}
        {failMode !== 'normal' && (
          <div style={{ 
            background: 'rgba(220, 38, 38, 0.06)', 
            border: '1px solid var(--status-replace)', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center',
            color: 'var(--status-replace)',
            fontSize: '0.88rem'
          }}>
            <AlertOctagon size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>ALARMA GENERAL DE PLANTA:</strong>{' '}
              {failMode === 'cavitation' && 'Se detecta caída drástica de presión hidráulica e incremento destructivo de vibraciones en bomba (Posible obstrucción en succión).'}
              {failMode === 'bearing' && 'Temperatura límite superada en rodamiento radial de la bomba. Peligro de gripado del eje.'}
              {failMode === 'overheat' && 'Bobinados del estator registran temperatura crítica (>95°C). Alta corriente y peligro de daño del aislamiento.'}
            </div>
          </div>
        )}

        {/* Gauges list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          {/* Pressure gauges */}
          <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gauge size={14} color="var(--accent-cyan)" /> Presión de Succión
            </span>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <strong style={{ fontSize: '1.6rem', color: getStatusColor(suctionPres, 0.8, 0.4) }}>{suctionPres.toFixed(2)}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>bar</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal: 1.5 - 2.0 bar</span>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gauge size={14} color="var(--accent-cyan)" /> Presión de Descarga
            </span>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <strong style={{ fontSize: '1.6rem', color: getStatusColor(dischargePres, 3.5, 2.5) }}>{dischargePres.toFixed(2)}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>bar</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal: 4.0 - 4.5 bar</span>
            </div>
          </div>

          {/* Temperature gauges */}
          <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Thermometer size={14} color="var(--status-inspect)" /> Temp. Rodamientos
            </span>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <strong style={{ fontSize: '1.6rem', color: getStatusColor(bearingTemp, 70, 80) }}>{bearingTemp.toFixed(1)}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>°C</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal: &lt; 65 °C</span>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Thermometer size={14} color="var(--status-inspect)" /> Temp. Bobinas Motor
            </span>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <strong style={{ fontSize: '1.6rem', color: getStatusColor(coilTemp, 85, 95) }}>{coilTemp.toFixed(1)}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>°C</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal: &lt; 80 °C</span>
            </div>
          </div>

          {/* Vibration gauge */}
          <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color="var(--status-replace)" /> Vibración del Eje
            </span>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <strong style={{ fontSize: '1.6rem', color: getStatusColor(vibration, 3.0, 4.5) }}>{vibration.toFixed(2)}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>mm/s RMS</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal: &lt; 2.5 mm/s RMS</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SecurityPanel;
