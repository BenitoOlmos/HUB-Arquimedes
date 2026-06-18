import React, { useState } from 'react';
import { Play, Pause, AlertTriangle, UserCheck, Wrench, Shield, CheckCircle } from 'lucide-react';

const WorkshopPanel = ({
  bays,
  mechanics,
  activeOTs,
  assignOTToBay,
  assignMechanicToBay,
  completeWorkOnBay,
  teacherScenarios
}) => {
  const [selectedBayId, setSelectedBayId] = useState(null);
  const [selectedMecId, setSelectedMecId] = useState('');
  const [selectedOtId, setSelectedOtId] = useState('');

  // Filter OTs that can be assigned: budget approved, all parts 'Disponible', not already assigned
  const assignableOTs = activeOTs.filter(
    (ot) =>
      ot.budgetApproved &&
      ot.status !== 'Listo' &&
      ot.status !== 'ListoParaEntrega' &&
      !ot.andenId &&
      ot.partsRequired.every((p) => p.status === 'Disponible')
  );

  const handleOpenAssignModal = (bayId) => {
    setSelectedBayId(bayId);
    setSelectedMecId('');
    setSelectedOtId('');
  };

  const handleConfirmAssignment = () => {
    if (selectedOtId) {
      assignOTToBay(selectedOtId, selectedBayId);
    }
    if (selectedMecId) {
      assignMechanicToBay(selectedBayId, selectedMecId);
    }
    setSelectedBayId(null);
  };

  return (
    <div className="panel-view">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '12px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            Planta de Trabajo (Andenes de Taller)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Monitoree el progreso de reparaciones en tiempo real, asigne mecánicos y andenes según
            especialización para maximizar la productividad.
          </p>
        </div>
      </div>

      {/* Grid of Work Bays */}
      <div className="bay-grid">
        {bays.map((bay) => {
          // Find if there's an active OT in this bay
          const activeOT = activeOTs.find(
            (ot) => ot.andenId === bay.id && ot.status === 'EnEjecucion'
          );
          const isOffline = teacherScenarios.liftOffline && bay.id === 'AND-1';
          const mechanic = mechanics.find((m) => m.id === bay.mechanicId);

          let bayStatus = 'idle';
          let badgeColor = 'idle';
          let statusText = 'Disponible / Libre';

          if (isOffline) {
            bayStatus = 'offline';
            badgeColor = 'replace';
            statusText = 'FUERA DE SERVICIO (Falla)';
          } else if (activeOT) {
            bayStatus = 'occupied';
            badgeColor = 'operational';
            statusText = 'En Reparación';
          }

          const progressPercent = activeOT
            ? Math.min(100, Math.round((activeOT.laborHoursReal / activeOT.laborHoursTarget) * 100))
            : 0;

          return (
            <div key={bay.id} className={`bay-card ${bayStatus}`}>
              {/* Card top details */}
              <div className="bay-header">
                <div>
                  <h4 className="bay-name">{bay.name}</h4>
                  <span className="bay-specialty">Esp: {bay.specialty}</span>
                </div>
                <span className={`badge-status ${badgeColor}`}>{statusText}</span>
              </div>

              {/* Bay content */}
              {isOffline ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px 0',
                    color: 'var(--status-replace)',
                    textAlign: 'center'
                  }}
                >
                  <AlertTriangle size={32} />
                  <strong style={{ fontSize: '0.82rem' }}>ELEVADOR BLOQUEADO</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Falla hidráulica reportada por el instructor. Ningún vehículo puede ser
                    procesado aquí.
                  </span>
                </div>
              ) : activeOT ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* OT Details */}
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        fontWeight: 'bold'
                      }}
                    >
                      <span style={{ color: 'var(--accent-blue)' }}>{activeOT.id}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{activeOT.urgency}</span>
                    </div>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        marginTop: '2px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {activeOT.vehicleLabel}
                    </strong>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {activeOT.description}
                    </span>
                  </div>

                  {/* Mechanic details */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(2, 132, 199, 0.1)',
                        color: 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.72rem'
                      }}
                    >
                      {mechanic
                        ? mechanic.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                        : '?'}
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                        {mechanic ? mechanic.name : 'Sin asignar'}
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Esp: {mechanic ? mechanic.specialty : 'N/A'} (Rendimiento:{' '}
                        {mechanic ? Math.round(mechanic.speed * 100) : 100}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      marginTop: '4px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem'
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Progreso TAR:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {activeOT.laborHoursReal.toFixed(1)} /{' '}
                        {activeOT.laborHoursTarget.toFixed(1)} Hrs
                      </strong>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progressPercent}%`,
                          background:
                            progressPercent >= 100
                              ? 'var(--status-operational)'
                              : 'var(--accent-blue)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  {progressPercent >= 100 ? (
                    <button
                      className="premium-btn active"
                      style={{ width: '100%', padding: '6px', fontSize: '0.78rem', gap: '4px' }}
                      onClick={() => completeWorkOnBay(bay.id)}
                    >
                      <CheckCircle size={14} /> Finalizar y Entregar
                    </button>
                  ) : (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        padding: '4px 0'
                      }}
                    >
                      Mecánico trabajando... Avance el turno para progresar.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Idle status details */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.02)',
                      padding: '16px 12px',
                      borderRadius: '8px',
                      border: '1px dashed var(--border-glass)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}
                  >
                    💡 Andén disponible. Listo para recibir una orden de trabajo aprobada.
                  </div>

                  {/* Mechanic currently assigned */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Mecánico asignado:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {mechanic ? mechanic.name : 'Ninguno'}
                    </strong>
                  </div>

                  <button
                    className="premium-btn"
                    style={{ width: '100%', padding: '6px', fontSize: '0.78rem', gap: '4px' }}
                    onClick={() => handleOpenAssignModal(bay.id)}
                  >
                    <UserCheck size={14} /> Asignar Trabajo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mechanics Grid */}
      <div className="section-card" style={{ marginTop: '12px' }}>
        <h3 className="section-title">
          <UserCheck size={18} color="var(--accent-indigo)" /> Disponibilidad y Costos del Personal
          Técnico
        </h3>
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Rendimiento (Velocidad)</th>
                <th>Costo Diario (Sueldo)</th>
                <th>Estado Actual</th>
              </tr>
            </thead>
            <tbody>
              {mechanics.map((mec) => {
                // Find if mechanic is assigned to any bay
                const assignedBay = bays.find((b) => b.mechanicId === mec.id);
                // Scenario Check
                const isSick = teacherScenarios.sickMechanic && mec.id === 'MEC-2';

                return (
                  <tr key={mec.id} style={{ opacity: isSick ? 0.55 : 1 }}>
                    <td style={{ fontWeight: 'bold' }}>{mec.name}</td>
                    <td>{mec.specialty}</td>
                    <td
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: 'var(--accent-blue)'
                      }}
                    >
                      {Math.round(mec.speed * 100)}%
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      ${mec.costPerDay.toLocaleString()}/día
                    </td>
                    <td>
                      {isSick ? (
                        <span className="badge-status replace" style={{ fontWeight: 'bold' }}>
                          Licencia Médica (Ausente)
                        </span>
                      ) : assignedBay ? (
                        <span
                          className="badge-status operational"
                          style={{
                            color: 'var(--accent-indigo)',
                            background: 'rgba(99,102,241,0.08)'
                          }}
                        >
                          Asignado a {assignedBay.name}
                        </span>
                      ) : (
                        <span className="badge-status idle">Disponible / En Espera</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign OT & Mechanic Modal */}
      {selectedBayId && (
        <div className="modal-overlay" onClick={() => setSelectedBayId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                margin: 0,
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '10px',
                fontSize: '1.05rem',
                fontWeight: 800
              }}
            >
              Asignar Andén: {bays.find((b) => b.id === selectedBayId)?.name}
            </h3>

            {/* Select OT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}
              >
                Seleccione Orden de Trabajo
              </label>
              <select
                value={selectedOtId}
                onChange={(e) => setSelectedOtId(e.target.value)}
                className="premium-select"
              >
                <option value="">-- Seleccionar OT en Espera --</option>
                {assignableOTs.map((ot) => (
                  <option key={ot.id} value={ot.id}>
                    {ot.id} - {ot.vehicleLabel} ({ot.urgency})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                * Solo se muestran OTs con presupuesto aprobado y repuestos en bodega física.
              </span>
            </div>

            {/* Select Mechanic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <label
                style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}
              >
                Seleccione Técnico / Mecánico
              </label>
              <select
                value={selectedMecId}
                onChange={(e) => setSelectedMecId(e.target.value)}
                className="premium-select"
              >
                <option value="">-- Conservar asignación actual o dejar en blanco --</option>
                {mechanics
                  .filter((m) => !(teacherScenarios.sickMechanic && m.id === 'MEC-2'))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.specialty} ({Math.round(m.speed * 100)}% Vel)
                    </option>
                  ))}
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '12px'
              }}
            >
              <button className="premium-btn" onClick={() => setSelectedBayId(null)}>
                Cancelar
              </button>
              <button
                className="premium-btn active"
                onClick={handleConfirmAssignment}
                disabled={!selectedOtId && !selectedMecId}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopPanel;
