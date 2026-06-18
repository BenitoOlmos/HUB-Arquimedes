import React, { useState } from 'react';
import {
  ClipboardCheck,
  CreditCard,
  Clock,
  Truck,
  ShieldAlert,
  BadgeHelp,
  Play,
  DollarSign,
  Sparkles
} from 'lucide-react';

const WorkOrdersPanel = ({
  activeOTs,
  approveOTBudget,
  deliverOTToClient,
  purchasePartsFromSupplier,
  suppliers,
  cash
}) => {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'Presupuesto' | 'EnEjecucion' | 'EsperandoRepuestos' | 'Listo'
  const [purchasePartSku, setPurchasePartSku] = useState(null);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [selectedSupplierId, setSelectedSupplierId] = useState('SUP-QUAL');
  const [associatedOtId, setAssociatedOtId] = useState(null);

  const filteredOTs = activeOTs.filter((ot) => {
    if (filterStatus === 'all') return true;
    return ot.status === filterStatus;
  });

  const handleOpenPurchase = (sku, otId, qtyNeeded) => {
    setPurchasePartSku(sku);
    setAssociatedOtId(otId);
    setPurchaseQty(qtyNeeded);
    setSelectedSupplierId('SUP-QUAL');
  };

  const handleConfirmPurchase = () => {
    const ot = activeOTs.find((o) => o.id === associatedOtId);
    if (!ot) return;
    const part = ot.partsRequired.find((p) => p.sku === purchasePartSku);
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!part || !supplier) return;

    const unitCost = Math.round(part.cost * supplier.costMultiplier);
    const totalCost = unitCost * purchaseQty;

    if (cash < totalCost) {
      alert('❌ Fondos insuficientes en caja para completar esta compra.');
      return;
    }

    // Call purchase function with OT link
    purchasePartsFromSupplier(purchasePartSku, purchaseQty, selectedSupplierId, associatedOtId);
    setPurchasePartSku(null);
    setAssociatedOtId(null);
  };

  // Find active part details for purchase
  const activePart = associatedOtId
    ? activeOTs
        .find((o) => o.id === associatedOtId)
        ?.partsRequired.find((p) => p.sku === purchasePartSku)
    : null;

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
            Libro de Órdenes de Trabajo (OTs)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Revise solicitudes de clientes, cotice reparaciones, apruebe presupuestos y despache
            vehículos listos para facturación.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(15,23,42,0.04)',
          padding: '4px',
          borderRadius: '10px',
          width: 'max-content'
        }}
      >
        <button
          className={`premium-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
          style={{ padding: '6px 12px', fontSize: '0.78rem', boxShadow: 'none' }}
        >
          Todas ({activeOTs.length})
        </button>
        <button
          className={`premium-btn ${filterStatus === 'Presupuesto' ? 'active' : ''}`}
          onClick={() => setFilterStatus('Presupuesto')}
          style={{ padding: '6px 12px', fontSize: '0.78rem', boxShadow: 'none' }}
        >
          Presupuesto ({activeOTs.filter((o) => o.status === 'Presupuesto').length})
        </button>
        <button
          className={`premium-btn ${filterStatus === 'EsperandoRepuestos' ? 'active' : ''}`}
          onClick={() => setFilterStatus('EsperandoRepuestos')}
          style={{ padding: '6px 12px', fontSize: '0.78rem', boxShadow: 'none' }}
        >
          Espera Repuestos ({activeOTs.filter((o) => o.status === 'EsperandoRepuestos').length})
        </button>
        <button
          className={`premium-btn ${filterStatus === 'EnEjecucion' ? 'active' : ''}`}
          onClick={() => setFilterStatus('EnEjecucion')}
          style={{ padding: '6px 12px', fontSize: '0.78rem', boxShadow: 'none' }}
        >
          En Proceso ({activeOTs.filter((o) => o.status === 'EnEjecucion').length})
        </button>
        <button
          className={`premium-btn ${filterStatus === 'Listo' ? 'active' : ''}`}
          onClick={() => setFilterStatus('Listo')}
          style={{ padding: '6px 12px', fontSize: '0.78rem', boxShadow: 'none' }}
        >
          Listo para Entrega ({activeOTs.filter((o) => o.status === 'Listo').length})
        </button>
      </div>

      {/* OTs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredOTs.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            📭 No hay órdenes de trabajo activas en este estado.
          </div>
        ) : (
          filteredOTs.map((ot) => {
            // Check status details
            const isVip = ot.urgency === 'Crítica' || ot.id === 'OT-2015' || ot.id === 'OT-2003';

            let statusBadgeClass = 'idle';
            let statusText = 'Pendiente';

            if (ot.status === 'Presupuesto') {
              statusBadgeClass = 'inspect';
              statusText = 'Esperando Aprobación';
            } else if (ot.status === 'EsperandoRepuestos') {
              statusBadgeClass = 'replace';
              statusText = 'Espera de Repuestos';
            } else if (ot.status === 'EnEjecucion') {
              statusBadgeClass = 'operational';
              statusText = 'En Andén / Ejecución';
            } else if (ot.status === 'Listo') {
              statusBadgeClass = 'operational';
              statusText = 'Listo / Retiro';
            }

            // Calculate parts total cost/price
            const partsCost = ot.partsRequired.reduce((acc, p) => acc + p.cost * p.qty, 0);
            const partsPrice = ot.partsRequired.reduce((acc, p) => acc + p.price * p.qty, 0);
            const laborPrice = ot.laborHoursTarget * ot.laborPricePerHour;
            const totalBudget = partsPrice + laborPrice;

            return (
              <div
                key={ot.id}
                className="section-card"
                style={{
                  background: isVip
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(255, 255, 255, 0.95) 100%)'
                    : 'var(--bg-glass)',
                  borderColor: isVip ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-glass)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {ot.id}
                      </strong>
                      {isVip && (
                        <span
                          style={{
                            background: 'var(--accent-purple)',
                            color: '#ffffff',
                            fontSize: '0.62rem',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Sparkles size={8} /> VIP URGENTE
                        </span>
                      )}
                      <span className={`badge-status ${statusBadgeClass}`}>{statusText}</span>
                    </div>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '0.88rem',
                        marginTop: '6px',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Vehículo: {ot.vehicleLabel} | Cliente: {ot.clientName}
                    </strong>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '2px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontWeight: 'bold'
                      }}
                    >
                      Presupuesto Estimado
                    </span>
                    <strong
                      style={{
                        fontSize: '1.25rem',
                        color: 'var(--accent-blue)',
                        fontFamily: 'monospace'
                      }}
                    >
                      ${totalBudget.toLocaleString()}
                    </strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Mano de Obra: ${laborPrice.toLocaleString()} ({ot.laborHoursTarget} Hrs)
                    </span>
                  </div>
                </div>

                {/* Description and timeline */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '10px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <strong>Motivo de Ingreso:</strong> {ot.description}
                  {ot.notes && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        background: 'rgba(0,0,0,0.02)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--border-glass)'
                      }}
                    >
                      📝 <strong>Bitácora:</strong> {ot.notes}
                    </div>
                  )}
                </div>

                {/* Parts Required Checklist */}
                {ot.partsRequired.length > 0 && (
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.01)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '10px',
                      padding: '12px'
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 'bold',
                        color: 'var(--text-secondary)',
                        marginBottom: '8px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Checklist de Repuestos Necesarios
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {ot.partsRequired.map((part) => {
                        let badgeType = 'idle';
                        let badgeText = 'Pendiente';

                        if (part.status === 'Disponible') {
                          badgeType = 'operational';
                          badgeText = 'Físico en Bodega';
                        } else if (part.status === 'Pedido') {
                          badgeType = 'inspect';
                          badgeText = `En Tránsito (ETA: ${part.eta}d)`;
                        }

                        return (
                          <div
                            key={part.sku}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              background: '#ffffff',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-glass)'
                            }}
                          >
                            <span>
                              <strong>{part.qty}x</strong> {part.name}
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--text-muted)',
                                  fontFamily: 'monospace',
                                  marginLeft: '6px'
                                }}
                              >
                                SKU: {part.sku}
                              </span>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`badge-status ${badgeType}`}>{badgeText}</span>
                              {part.status === 'Pendiente' && (
                                <button
                                  className="premium-btn active"
                                  onClick={() => handleOpenPurchase(part.sku, ot.id, part.qty)}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.68rem',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Adquirir
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom interactive actions based on status */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '12px',
                    gap: '10px'
                  }}
                >
                  {ot.status === 'Presupuesto' && (
                    <button
                      className="premium-btn active"
                      onClick={() => approveOTBudget(ot.id)}
                      style={{ padding: '6px 16px', gap: '4px' }}
                    >
                      <ClipboardCheck size={14} /> Aprobar Presupuesto
                    </button>
                  )}
                  {ot.status === 'Listo' && (
                    <button
                      className="premium-btn active"
                      onClick={() => deliverOTToClient(ot.id)}
                      style={{
                        padding: '6px 16px',
                        gap: '4px',
                        background: 'var(--status-operational)',
                        borderColor: 'var(--status-operational)'
                      }}
                    >
                      <CreditCard size={14} /> Cobrar Factura y Entregar Auto
                    </button>
                  )}
                  {ot.status === 'EsperandoRepuestos' && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Truck size={14} /> Esperando que lleguen las compras de bodega para habilitar
                      andén de trabajo.
                    </div>
                  )}
                  {ot.status === 'EnEjecucion' && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      <Clock size={14} /> Vehículo en reparación en el andén de trabajo. Avance el
                      turno para completar.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Part Buy Modal inside OT */}
      {purchasePartSku && activePart && (
        <div
          className="modal-overlay"
          onClick={() => {
            setPurchasePartSku(null);
            setAssociatedOtId(null);
          }}
        >
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
              Adquisición de Repuesto para {associatedOtId}
            </h3>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                REPUESTO NECESARIO:
              </span>
              <strong
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  marginTop: '2px'
                }}
              >
                {activePart.name}
              </strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                SKU: {activePart.sku} | Cantidad requerida: {purchaseQty} unidades
              </span>
            </div>

            {/* Select Supplier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}
              >
                Seleccione Proveedor
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="premium-select"
              >
                {suppliers.map((s) => {
                  const finalCost = Math.round(activePart.cost * s.costMultiplier);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} - ${finalCost.toLocaleString()}/u (SLA:{' '}
                      {s.sla === 0.1 ? '2 Horas' : `${s.sla} días`})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cost and Balance Summary */}
            <div
              style={{
                background: 'var(--bg-primary)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Costo Unitario del Proveedor:</span>
                <strong style={{ fontFamily: 'monospace' }}>
                  $
                  {Math.round(
                    activePart.cost *
                      suppliers.find((s) => s.id === selectedSupplierId).costMultiplier
                  ).toLocaleString()}
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-glass)',
                  paddingBottom: '4px'
                }}
              >
                <span>Costo Total Compra ({purchaseQty} u):</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--status-replace)' }}>
                  $
                  {(
                    Math.round(
                      activePart.cost *
                        suppliers.find((s) => s.id === selectedSupplierId).costMultiplier
                    ) * purchaseQty
                  ).toLocaleString()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span>Caja Disponible:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--status-operational)' }}>
                  ${Math.round(cash).toLocaleString()}
                </strong>
              </div>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}
            >
              <button
                className="premium-btn"
                onClick={() => {
                  setPurchasePartSku(null);
                  setAssociatedOtId(null);
                }}
              >
                Cancelar
              </button>
              <button className="premium-btn active" onClick={handleConfirmPurchase}>
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersPanel;
