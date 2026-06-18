import React, { useState } from 'react';
import { ClipboardCheck, FileSearch, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

const CustomsKanban = ({ manifests, onUpdateManifestStatus, onTriggerAlert }) => {
  const [selectedManifest, setSelectedManifest] = useState(null);

  // Group manifests by customsStatus
  const pending = manifests.filter(m => m.customsStatus === 'PENDIENTE');
  const inspection = manifests.filter(m => m.customsStatus === 'INSPECCION_FISICA');
  const approved = manifests.filter(m => m.customsStatus === 'APROBADO');
  const held = manifests.filter(m => m.customsStatus === 'RETENIDO');

  const handleInspect = (manifest) => {
    setSelectedManifest(manifest);
  };

  const handleAction = (status) => {
    if (!selectedManifest) return;

    onUpdateManifestStatus(selectedManifest.id, status);
    
    let alertMsg = '';
    if (status === 'APROBADO') {
      alertMsg = `Aduana: Carga ${selectedManifest.id} liberada y aprobada para descarga.`;
    } else if (status === 'RETENIDO') {
      alertMsg = `Aduana: Carga ${selectedManifest.id} RETENIDA formalmente por discrepancias críticas. Multa aplicada.`;
    } else if (status === 'INSPECCION_FISICA') {
      alertMsg = `Aduana: Carga ${selectedManifest.id} enviada a inspección física en andén aduanero.`;
    }

    onTriggerAlert(alertMsg);

    // Update local select state
    setSelectedManifest(prev => prev ? { ...prev, customsStatus: status } : null);
  };

  // Helper parsing JSON cargo contents
  const parseContents = (jsonStr) => {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return { item: jsonStr, category: "General", weight: 15.0 };
    }
  };

  const renderCard = (m) => {
    const cargo = parseContents(m.contents);
    const hasDiscrepancy = m.incoterm === 'EXW' || m.contents.includes('Discrepancia');

    return (
      <div 
        key={m.id} 
        className="kanban-card"
        onClick={() => handleInspect(m)}
        style={{
          borderLeft: hasDiscrepancy ? '3px solid var(--color-anchor)' : '1px solid var(--border-glass)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{m.id.split('-').slice(-2).join('-')}</span>
          <span className="incoterm-badge">{m.incoterm}</span>
        </div>
        <div className="kanban-card-title">{cargo.item}</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
          Origen: {m.originPort} → {m.destPort}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
      
      {/* Kanban Grid */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <ClipboardCheck size={18} color="var(--color-approved)" /> Despacho de Cargas y Kanban de Aduana
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            Auditoría Documental y Liberación
          </span>
        </div>

        <div className="kanban-board">
          
          {/* PENDIENTE */}
          <div className="kanban-column">
            <div className="kanban-column-header pendiente">
              <span>Pendiente ({pending.length})</span>
              <RefreshCw size={12} />
            </div>
            <div className="kanban-cards-container">
              {pending.slice(0, 10).map(renderCard)}
            </div>
          </div>

          {/* INSPECCION_FISICA */}
          <div className="kanban-column">
            <div className="kanban-column-header revision">
              <span>Inspección ({inspection.length})</span>
              <FileSearch size={12} />
            </div>
            <div className="kanban-cards-container">
              {inspection.slice(0, 10).map(renderCard)}
            </div>
          </div>

          {/* APROBADO */}
          <div className="kanban-column">
            <div className="kanban-column-header aprobado">
              <span>Aprobado ({approved.length})</span>
              <CheckCircle2 size={12} />
            </div>
            <div className="kanban-cards-container">
              {approved.slice(0, 10).map(renderCard)}
            </div>
          </div>

          {/* RETENIDO */}
          <div className="kanban-column">
            <div className="kanban-column-header retenido">
              <span>Retenido ({held.length})</span>
              <AlertTriangle size={12} />
            </div>
            <div className="kanban-cards-container">
              {held.slice(0, 10).map(renderCard)}
            </div>
          </div>

        </div>
      </div>

      {/* Manifest Document Inspector */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <FileSearch size={18} color="var(--accent-cyan)" /> Inspector de Documento
          </div>
        </div>

        {selectedManifest ? (() => {
          const cargo = parseContents(selectedManifest.contents);
          const weightMismatch = selectedManifest.contents.includes('Discrepancia');
          const wrongIncoterm = selectedManifest.incoterm === 'EXW'; // EXW is invalid for sea freight delivery directly (door-to-port rule mismatch)

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--accent-cyan)' }}>Manifiesto ID:</strong>
                <span style={{ fontFamily: 'monospace' }}>{selectedManifest.id}</span>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                <strong>Vía de Transporte:</strong> Maritime Cargo Carrier
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>IMO: {selectedManifest.shipId}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <strong>Puerto Origen:</strong>
                  <div>{selectedManifest.originPort}</div>
                </div>
                <div>
                  <strong>Puerto Destino:</strong>
                  <div>{selectedManifest.destPort}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '0.65rem' }}>
                <strong>Detalle de Carga Declara:</strong>
                <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>Item: {cargo.item}</div>
                <div>Categoría: {cargo.category}</div>
                <div>Peso Declarado: {cargo.weight} Tons</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                <span>Incoterm Declarado:</span>
                <span className="incoterm-badge" style={{ fontSize: '0.85rem' }}>{selectedManifest.incoterm}</span>
              </div>

              {/* Document Discrepancy Warnings */}
              {(weightMismatch || wrongIncoterm) && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid var(--color-held)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  color: '#f87171'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                    <AlertCircle size={14} /> Alerta Documental Detectada
                  </div>
                  {weightMismatch && (
                    <div style={{ fontSize: '0.72rem' }}>
                      • **Diferencia de Peso**: El sensor de balanza física del puerto detectó +50% de peso sobre lo declarado en el manifiesto.
                    </div>
                  )}
                  {wrongIncoterm && (
                    <div style={{ fontSize: '0.72rem' }}>
                      • **Incoterm Mismatch**: Se declaró Incoterm **EXW** para ruta marítima principal, lo cual traslada la responsabilidad de flete de forma incorrecta.
                    </div>
                  )}
                </div>
              )}

              {/* Status Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {selectedManifest.customsStatus !== 'APROBADO' && (
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', background: 'var(--color-approved)', color: 'var(--bg-darker)' }}
                    onClick={() => handleAction('APROBADO')}
                  >
                    Aprobar Carga (Release)
                  </button>
                )}
                {selectedManifest.customsStatus !== 'RETENIDO' && (
                  <button 
                    className="btn-danger" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleAction('RETENIDO')}
                  >
                    Retener Carga (Lock Contenedor)
                  </button>
                )}
                {selectedManifest.customsStatus !== 'INSPECCION_FISICA' && (
                  <button 
                    className="btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--color-anchor)', color: 'var(--color-anchor)' }}
                    onClick={() => handleAction('INSPECCION_FISICA')}
                  >
                    Enviar a Inspección Física
                  </button>
                )}
              </div>
            </div>
          );
        })() : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0', fontSize: '0.82rem' }}>
            Selecciona un manifiesto de la lista Kanban para inspeccionar su Incoterm, discrepancia de peso y estado documental.
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomsKanban;
