import React, { useState } from 'react';
import { Home, Trash2, ArrowRightLeft, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

const BedManagementPanel = ({
  beds,
  activePatients,
  onTransferPatient,
  onDischargePatient,
  onTriggerAlert
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [activeTabWing, setActiveTabWing] = useState('ALL');

  // Filter beds by wing for visual sub-tabs
  const wings = {
    ALL: "Todo el Hospital",
    UCI: "UCI (Cuidado Crítico)",
    UTI: "UTI (Tratamiento Intermedio)",
    MED: "Medicina General",
    PED: "Pediatría",
    AIS: "Aislamiento Infeccioso"
  };

  // Group beds by wing
  const uciBeds = beds.filter(b => b.id.startsWith('UCI'));
  const utiBeds = beds.filter(b => b.id.startsWith('UTI'));
  const medBeds = beds.filter(b => b.id.startsWith('MED'));
  const pedBeds = beds.filter(b => b.id.startsWith('PED'));
  const aisBeds = beds.filter(b => b.id.startsWith('AIS'));

  // Get active patients from triage that are NOT dead
  const waitingPatients = activePatients.filter(p => !p.dead);

  // Clinical Compatibility Check
  const checkCompatibility = (patient, bedId) => {
    const prefix = bedId.substring(0, 3);
    const errors = [];

    // 1. Pediatric Rule: Age <= 14 must be in PED or AIS
    if (patient.age <= 14) {
      if (prefix !== 'PED' && prefix !== 'AIS') {
        errors.push("Paciente pediátrico (≤ 14 años) debe ir a Pediatría (PED) o Aislamiento (AIS).");
      }
    } else {
      // Adults cannot go to Pediatrics
      if (prefix === 'PED') {
        errors.push("Paciente adulto (> 14 años) no puede ser asignado a camas de Pediatría.");
      }
    }

    // 2. Isolation Rule: Contagious symptoms or respiratory pandemic
    const isContagious = 
      patient.symptoms.toLowerCase().includes("virus") || 
      patient.symptoms.toLowerCase().includes("respiratorio") || 
      patient.symptoms.toLowerCase().includes("neumonía") ||
      patient.symptoms.toLowerCase().includes("tos") ||
      patient.comorbidities.includes("EPOC");

    if (isContagious && prefix !== 'AIS' && prefix !== 'UCI') {
      errors.push("Paciente con síntomas de infección transmisible requiere aislamiento (AIS) o cama crítica (UCI).");
    }

    // 3. Severity Rule: ESI 1 or ESI 2 with poor saturation must go to UCI or UTI
    if (patient.esi === 1) {
      if (prefix !== 'UCI') {
        errors.push("Paciente ESI 1 (Paro/Resucitación) requiere cama crítica UCI de inmediato.");
      }
    } else if (patient.esi === 2) {
      if (prefix !== 'UCI' && prefix !== 'UTI') {
        errors.push("Paciente ESI 2 (Inestable/Emergencia) requiere cama en UCI o UTI.");
      }
    }

    return {
      compatible: errors.length === 0,
      errors
    };
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedBedId) return;

    const patient = waitingPatients.find(p => p.id === selectedPatientId);
    const bed = beds.find(b => b.id === selectedBedId);

    if (!patient || !bed) return;

    // Check Compatibility
    const validation = checkCompatibility(patient, selectedBedId);
    if (!validation.compatible) {
      alert(`⚠️ ERROR DE TRASLADO CLINICO:\n\n${validation.errors.join('\n')}`);
      return;
    }

    // Execute transfer
    onTransferPatient(selectedPatientId, selectedBedId);
    onTriggerAlert(`Traslado: Paciente ${patient.name} ingresado a la cama ${selectedBedId}`);
    
    // Clear selections
    setSelectedPatientId('');
    setSelectedBedId('');
  };

  const renderBedBox = (bed) => {
    let statusClass = 'free';
    if (bed.status === 'Ocupada') statusClass = 'occupied';
    else if (bed.status === 'En Limpieza') statusClass = 'cleaning';
    else if (bed.status === 'Inhabilitada') statusClass = 'maintenance';

    const isCleaning = bed.status === 'En Limpieza';
    const isOccupied = bed.status === 'Ocupada';
    const isMaintenance = bed.status === 'Inhabilitada';

    // Get patient initials for occupied beds
    const initials = isOccupied && bed.patient 
      ? bed.patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '';

    return (
      <div 
        key={bed.id}
        onClick={() => {
          if (bed.status === 'Disponible') {
            setSelectedBedId(bed.id);
          } else if (isOccupied) {
            setSelectedBedId('');
            if (confirm(`¿Desea dar de alta al paciente ${bed.patient.name} de la cama ${bed.id}? El andén entrará en aseo.`)) {
              onDischargePatient(bed.id);
              onTriggerAlert(`Alta: Paciente ${bed.patient.name} egresado de cama ${bed.id}`);
            }
          }
        }}
        className="bed-box"
        style={{
          border: selectedBedId === bed.id ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
          boxShadow: selectedBedId === bed.id ? '0 0 10px var(--accent-cyan-glow)' : 'none',
          opacity: isMaintenance ? 0.4 : 1
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span className="bed-id">{bed.id}</span>
          <span className={`bed-status-dot ${statusClass}`}></span>
        </div>

        {isOccupied ? (
          <div className="bed-patient-initials" style={{ color: 'var(--esi-' + bed.patient.esi + ')' }}>
            {initials}
          </div>
        ) : isCleaning ? (
          <div style={{ fontSize: '0.6rem', color: 'var(--bed-cleaning)', textAlign: 'center', fontWeight: 'bold' }}>
            ASEO <br/>{bed.cleaningTimeLeftSim}m
          </div>
        ) : isMaintenance ? (
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 'bold' }}>
            FALLA EQUIPO
          </div>
        ) : (
          <div style={{ fontSize: '0.65rem', color: 'var(--bed-free)', textAlign: 'center', fontWeight: '500' }}>
            LIBRE
          </div>
        )}

        <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isOccupied ? `ESI ${bed.patient.esi}` : ''}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      
      {/* Interactive Map */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Home size={18} color="var(--accent-purple)" /> Mapa de Camas y Hospitalización
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.keys(wings).map(wKey => (
              <button
                key={wKey}
                onClick={() => setActiveTabWing(wKey)}
                style={{
                  background: activeTabWing === wKey ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: '1px solid',
                  borderColor: activeTabWing === wKey ? 'var(--border-glass)' : 'transparent',
                  color: activeTabWing === wKey ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {wKey}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* UCI Wing */}
          {(activeTabWing === 'ALL' || activeTabWing === 'UCI') && (
            <div className="hospital-wing">
              <div className="wing-header">
                <span>Unidad de Cuidados Intensivos (UCI)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Camas Críticas</span>
              </div>
              <div className="wing-beds-grid">
                {uciBeds.map(renderBedBox)}
              </div>
            </div>
          )}

          {/* UTI Wing */}
          {(activeTabWing === 'ALL' || activeTabWing === 'UTI') && (
            <div className="hospital-wing">
              <div className="wing-header">
                <span>Unidad de Tratamiento Intermedio (UTI)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Camas Medias</span>
              </div>
              <div className="wing-beds-grid">
                {utiBeds.map(renderBedBox)}
              </div>
            </div>
          )}

          {/* General Medicine Wing */}
          {(activeTabWing === 'ALL' || activeTabWing === 'MED') && (
            <div className="hospital-wing">
              <div className="wing-header">
                <span>Medicina General</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Adultos Comunes</span>
              </div>
              <div className="wing-beds-grid">
                {medBeds.map(renderBedBox)}
              </div>
            </div>
          )}

          {/* Pediatrics Wing */}
          {(activeTabWing === 'ALL' || activeTabWing === 'PED') && (
            <div className="hospital-wing">
              <div className="wing-header">
                <span>Pediatría</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Menores de 14 años</span>
              </div>
              <div className="wing-beds-grid">
                {pedBeds.map(renderBedBox)}
              </div>
            </div>
          )}

          {/* Isolation Wing */}
          {(activeTabWing === 'ALL' || activeTabWing === 'AIS') && (
            <div className="hospital-wing">
              <div className="wing-header">
                <span>Aislamiento Infeccioso</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Presión Negativa / Contagio</span>
              </div>
              <div className="wing-beds-grid">
                {aisBeds.map(renderBedBox)}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bed Assignment and Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Transfer Action */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <ArrowRightLeft size={18} color="var(--accent-cyan)" /> Orden de Traslado Clínico
            </div>
          </div>

          <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                1. Seleccionar Paciente en Espera (Triage)
              </label>
              <select 
                className="form-select"
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- Seleccionar Paciente --</option>
                {waitingPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ESI {p.esi} | {p.age} años | Espera: {p.waitElapsedSim}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                2. Cama Destino Seleccionada (Click en el mapa)
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Clica una cama libre en el mapa..." 
                value={selectedBedId}
                readOnly
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={!selectedPatientId || !selectedBedId}
            >
              Confirmar Ingreso e Instalar Paciente
            </button>
          </form>
        </div>

        {/* Clinical Protocol / Guidelines */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <ShieldAlert size={18} color="var(--esi-3-urg)" /> Protocolo de Compatibilidad
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={14} color="var(--esi-1-resus)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Cuidados Intensivos (UCI):</strong> Reservado exclusivamente para pacientes en riesgo vital inminente (**ESI 1**) y casos inestables (**ESI 2**).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={14} color="var(--esi-2-emerg)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Aislamiento (AIS):</strong> Destinado a pacientes con signos de contagio (ej. virus respiratorio severo, sospecha de influenza, neumonías, tuberculosis). ¡Previene epidemias nosocomiales!
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={14} color="var(--esi-3-urg)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Pediatría (PED):</strong> Obligatorio para todos los menores de 14 años. Queda estrictamente prohibido acostar pacientes adultos en esta unidad.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Sparkles size={14} color="var(--bed-cleaning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Aseo Clínico Obligatorio:</strong> Tras el alta médica, la cama queda inactiva por desinfección química durante **15 minutos simulados** antes de recibir a un nuevo paciente.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BedManagementPanel;
