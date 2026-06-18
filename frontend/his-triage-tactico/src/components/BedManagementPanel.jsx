import React, { useState } from 'react';
import {
  Home,
  Trash2,
  ArrowRightLeft,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Eye,
  Layers
} from 'lucide-react';
import Hospital3DViewer from './Hospital3DViewer';

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
  const [viewMode, setViewMode] = useState('3D'); // 3D or 2D

  // Filter beds by wing for visual sub-tabs
  const wings = {
    ALL: 'Todo el Hospital',
    UCI: 'UCI (Cuidado Crítico)',
    UTI: 'UTI (Tratamiento Intermedio)',
    MED: 'Medicina General',
    PED: 'Pediatría',
    AIS: 'Aislamiento Infeccioso'
  };

  // Group beds by wing
  const uciBeds = beds.filter((b) => b.id.startsWith('UCI'));
  const utiBeds = beds.filter((b) => b.id.startsWith('UTI'));
  const medBeds = beds.filter((b) => b.id.startsWith('MED'));
  const pedBeds = beds.filter((b) => b.id.startsWith('PED'));
  const aisBeds = beds.filter((b) => b.id.startsWith('AIS'));

  // Get active patients from triage that are NOT dead and not already admitted to a bed
  // A patient is admitted if their ID is set in any bed's currentPatient
  const admittedPatientIds = beds.map((b) => b.currentPatient).filter(Boolean);
  const waitingPatients = activePatients.filter(
    (p) => !p.dead && !admittedPatientIds.includes(p.id)
  );

  // Clinical Compatibility Check
  const checkCompatibility = (patient, bedId) => {
    const prefix = bedId.substring(0, 3);
    const errors = [];

    // 1. Pediatric Rule: Age <= 14 must be in PED or AIS
    if (patient.age <= 14) {
      if (prefix !== 'PED' && prefix !== 'AIS') {
        errors.push(
          'Paciente pediátrico (≤ 14 años) debe ir a Pediatría (PED) o Aislamiento (AIS).'
        );
      }
    } else {
      // Adults cannot go to Pediatrics
      if (prefix === 'PED') {
        errors.push('Paciente adulto (> 14 años) no puede ser asignado a camas de Pediatría.');
      }
    }

    // 2. Isolation Rule: Contagious symptoms or respiratory pandemic
    const isContagious =
      patient.symptoms.toLowerCase().includes('virus') ||
      patient.symptoms.toLowerCase().includes('respiratorio') ||
      patient.symptoms.toLowerCase().includes('neumonía') ||
      patient.symptoms.toLowerCase().includes('tos') ||
      patient.comorbidities.includes('EPOC');

    if (isContagious && prefix !== 'AIS' && prefix !== 'UCI') {
      errors.push(
        'Paciente con síntomas de infección transmisible requiere aislamiento (AIS) o cama crítica (UCI).'
      );
    }

    // 3. Severity Rule: ESI 1 or ESI 2 with poor saturation must go to UCI or UTI
    if (patient.esi === 1) {
      if (prefix !== 'UCI') {
        errors.push('Paciente ESI 1 (Paro/Resucitación) requiere cama crítica UCI de inmediato.');
      }
    } else if (patient.esi === 2) {
      if (prefix !== 'UCI' && prefix !== 'UTI') {
        errors.push('Paciente ESI 2 (Inestable/Emergencia) requiere cama en UCI o UTI.');
      }
    }

    return {
      compatible: errors.length === 0,
      errors
    };
  };

  const handleTransfer = (e) => {
    if (e) e.preventDefault();
    if (!selectedPatientId || !selectedBedId) return;

    const patient = waitingPatients.find((p) => p.id === selectedPatientId);
    const bed = beds.find((b) => b.id === selectedBedId);

    if (!patient || !bed) return;

    // Check Compatibility
    const validation = checkCompatibility(patient, selectedBedId);
    if (!validation.compatible) {
      alert(`⚠️ ERROR DE TRASLADO CLÍNICO:\n\n${validation.errors.join('\n')}`);
      return;
    }

    // Execute transfer
    onTransferPatient(selectedPatientId, selectedBedId);
    onTriggerAlert(`Traslado: Paciente ${patient.name} ingresado a la cama ${selectedBedId}`);

    // Clear selections
    setSelectedPatientId('');
    setSelectedBedId('');
  };

  // Safe wrapper for raycasted drag and drop transfers
  const handleDragTransfer = (patientId, bedId) => {
    const patient = waitingPatients.find((p) => p.id === patientId);
    const bed = beds.find((b) => b.id === bedId);

    if (!patient || !bed) return;

    const validation = checkCompatibility(patient, bedId);
    if (!validation.compatible) {
      alert(`⚠️ ERROR DE TRASLADO CLÍNICO:\n\n${validation.errors.join('\n')}`);
      return;
    }

    onTransferPatient(patientId, bedId);
    onTriggerAlert(`Traslado: Paciente ${patient.name} ingresado a la cama ${bedId}`);
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
    const initials =
      isOccupied && bed.patient
        ? bed.patient.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        : '';

    return (
      <div
        key={bed.id}
        onClick={() => {
          if (bed.status === 'Disponible') {
            setSelectedBedId(bed.id);
          } else if (isOccupied) {
            setSelectedBedId('');
            if (
              confirm(
                `¿Desea dar de alta al paciente ${bed.patient.name} de la cama ${bed.id}? El andén entrará en aseo.`
              )
            ) {
              onDischargePatient(bed.id);
              onTriggerAlert(`Alta: Paciente ${bed.patient.name} egresado de cama ${bed.id}`);
            }
          }
        }}
        className="bed-box"
        style={{
          border:
            selectedBedId === bed.id
              ? '2px solid var(--accent-cyan)'
              : '1px solid var(--border-glass)',
          boxShadow: selectedBedId === bed.id ? '0 0 10px var(--accent-cyan-glow)' : 'none',
          opacity: isMaintenance ? 0.4 : 1
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span className="bed-id">{bed.id}</span>
          <span className={`bed-status-dot ${statusClass}`}></span>
        </div>

        {isOccupied ? (
          <div
            className="bed-patient-initials"
            style={{ color: 'var(--esi-' + bed.patient.esi + ')' }}
          >
            {initials}
          </div>
        ) : isCleaning ? (
          <div
            style={{
              fontSize: '0.6rem',
              color: 'var(--bed-cleaning)',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            ASEO <br />
            {bed.cleaningTimeLeftSim}m
          </div>
        ) : isMaintenance ? (
          <div
            style={{
              fontSize: '0.55rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            FALLA EQUIPO
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.65rem',
              color: 'var(--bed-free)',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            LIBRE
          </div>
        )}

        <div
          style={{
            fontSize: '0.58rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {isOccupied && bed.patient ? `ESI ${bed.patient.esi}` : ''}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
      {/* Interactive Map (2D or 3D) */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Home size={18} color="var(--accent-purple)" />
            <span>Gestión Espacial de Camas</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: '20px',
                padding: '2px',
                marginRight: '8px'
              }}
            >
              <button
                onClick={() => setViewMode('3D')}
                className={`role-btn ${viewMode === '3D' ? 'active' : ''}`}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: viewMode === '3D' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewMode === '3D' ? '#000' : 'var(--text-secondary)'
                }}
              >
                <Eye size={12} /> 3D Digital Twin
              </button>
              <button
                onClick={() => setViewMode('2D')}
                className={`role-btn ${viewMode === '2D' ? 'active' : ''}`}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: viewMode === '2D' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewMode === '2D' ? '#000' : 'var(--text-secondary)'
                }}
              >
                <Layers size={12} /> Plano 2D
              </button>
            </div>

            {/* Ward filters (only active in 2D mode) */}
            {viewMode === '2D' && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {Object.keys(wings).map((wKey) => (
                  <button
                    key={wKey}
                    onClick={() => setActiveTabWing(wKey)}
                    style={{
                      background:
                        activeTabWing === wKey ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: activeTabWing === wKey ? 'var(--border-glass)' : 'transparent',
                      color:
                        activeTabWing === wKey ? 'var(--accent-cyan)' : 'var(--text-secondary)',
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
            )}
          </div>
        </div>

        {/* View rendering */}
        {viewMode === '3D' ? (
          <Hospital3DViewer
            beds={beds}
            onTransferPatient={handleDragTransfer}
            onDischargePatient={onDischargePatient}
            onTriggerAlert={onTriggerAlert}
            selectedPatientId={selectedPatientId}
            setSelectedPatientId={setSelectedPatientId}
            selectedBedId={selectedBedId}
            setSelectedBedId={setSelectedBedId}
            waitingPatients={waitingPatients}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* UCI Wing */}
            {(activeTabWing === 'ALL' || activeTabWing === 'UCI') && (
              <div className="hospital-wing">
                <div className="wing-header">
                  <span>Unidad de Cuidados Intensivos (UCI)</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Camas Críticas
                  </span>
                </div>
                <div className="wing-beds-grid">{uciBeds.map(renderBedBox)}</div>
              </div>
            )}

            {/* UTI Wing */}
            {(activeTabWing === 'ALL' || activeTabWing === 'UTI') && (
              <div className="hospital-wing">
                <div className="wing-header">
                  <span>Unidad de Tratamiento Intermedio (UTI)</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Camas Medias
                  </span>
                </div>
                <div className="wing-beds-grid">{utiBeds.map(renderBedBox)}</div>
              </div>
            )}

            {/* General Medicine Wing */}
            {(activeTabWing === 'ALL' || activeTabWing === 'MED') && (
              <div className="hospital-wing">
                <div className="wing-header">
                  <span>Medicina General</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Adultos Comunes
                  </span>
                </div>
                <div className="wing-beds-grid">{medBeds.map(renderBedBox)}</div>
              </div>
            )}

            {/* Pediatrics Wing */}
            {(activeTabWing === 'ALL' || activeTabWing === 'PED') && (
              <div className="hospital-wing">
                <div className="wing-header">
                  <span>Pediatría</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Menores de 14 años
                  </span>
                </div>
                <div className="wing-beds-grid">{pedBeds.map(renderBedBox)}</div>
              </div>
            )}

            {/* Isolation Wing */}
            {(activeTabWing === 'ALL' || activeTabWing === 'AIS') && (
              <div className="hospital-wing">
                <div className="wing-header">
                  <span>Aislamiento Infeccioso</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Presión Negativa / Contagio
                  </span>
                </div>
                <div className="wing-beds-grid">{aisBeds.map(renderBedBox)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bed Assignment, Draggable Cards and Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Draggable Patients waiting list */}
        <div
          className="glass-panel"
          style={{ maxHeight: '380px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
            <div className="panel-title" style={{ fontSize: '0.9rem' }}>
              <ArrowRightLeft size={16} color="var(--accent-cyan)" /> Pacientes en Espera (Triage)
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                background: 'rgba(6, 182, 212, 0.1)',
                color: 'var(--accent-cyan)',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {waitingPatients.length} en cola
            </span>
          </div>

          <div
            style={{
              overflowY: 'auto',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              paddingRight: '4px'
            }}
          >
            {waitingPatients.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem'
                }}
              >
                No hay pacientes en lista de espera.
              </div>
            ) : (
              waitingPatients.map((p) => (
                <div
                  key={p.id}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', p.id);
                    setSelectedPatientId(p.id);
                  }}
                  onClick={() => setSelectedPatientId(p.id)}
                  style={{
                    padding: '0.6rem',
                    background:
                      selectedPatientId === p.id
                        ? 'rgba(6, 182, 212, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                    border:
                      selectedPatientId === p.id
                        ? '1px solid var(--accent-cyan)'
                        : '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `var(--esi-${p.esi})`)}
                  onMouseLeave={(e) => {
                    if (selectedPatientId !== p.id) {
                      e.currentTarget.style.borderColor = 'var(--border-glass)';
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      className={`esi-badge esi-${p.esi}`}
                      style={{ fontSize: '0.55rem', padding: '1px 5px' }}
                    >
                      ESI {p.esi}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.65rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span>
                      {p.age} años | RUT: {p.rut}
                    </span>
                    <span style={{ color: 'var(--accent-cyan)' }}>Espera: {p.waitElapsedSim}m</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.62rem',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    ⚠️ {p.symptoms}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manual Transfer Action */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title" style={{ fontSize: '0.9rem' }}>
              <ArrowRightLeft size={16} color="var(--accent-cyan)" /> Orden Manual
            </div>
          </div>

          <form
            onSubmit={handleTransfer}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
          >
            <div>
              <label
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '3px'
                }}
              >
                Paciente Seleccionado
              </label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem' }}
              >
                <option value="">-- Seleccionar Paciente --</option>
                {waitingPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ESI {p.esi} | {p.age} años)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '3px'
                }}
              >
                Cama Destino (Clica una en 2D/3D)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Clica una cama libre..."
                value={selectedBedId}
                readOnly
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.5rem 1rem',
                fontSize: '0.78rem'
              }}
              disabled={!selectedPatientId || !selectedBedId}
            >
              Confirmar Traslado
            </button>
          </form>
        </div>

        {/* Clinical Protocol / Guidelines */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title" style={{ fontSize: '0.9rem' }}>
              <ShieldAlert size={16} color="var(--esi-3-urg)" /> Protocolo de Compatibilidad
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)'
            }}
          >
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <AlertTriangle
                size={12}
                color="var(--esi-1-resus)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong>Cuidados Críticos (UCI):</strong> Exclusivo para **ESI 1** o **ESI 2**
                inestables.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <AlertTriangle
                size={12}
                color="var(--esi-2-emerg)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong>Aislamiento (AIS):</strong> Infecciones transmisibles (virus respiratorios
                severos, neumonías, tuberculosis).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <AlertTriangle
                size={12}
                color="var(--esi-3-urg)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong>Pediatría (PED):</strong> Obligatorio para menores de 14 años. Prohibido
                para adultos.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <Sparkles
                size={12}
                color="var(--bed-cleaning)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong>Aseo Obligatorio:</strong> Posterior al egreso, el andén entra en
                sanitización durante **15 minutos simulados**.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedManagementPanel;
