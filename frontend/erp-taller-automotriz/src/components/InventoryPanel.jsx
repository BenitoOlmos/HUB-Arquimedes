import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  Package,
  Truck,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';

const InventoryPanel = ({ parts, suppliers, purchasePartsFromSupplier, cash, setCurrentTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'low' | 'transit'

  // Purchase state modal
  const [purchasePartSku, setPurchasePartSku] = useState(null);
  const [purchaseQty, setPurchaseQty] = useState(5);
  const [selectedSupplierId, setSelectedSupplierId] = useState('SUP-QUAL');

  const categories = [
    'Todos',
    'Frenos',
    'Suspensión y Dirección',
    'Motor y Filtros',
    'Eléctrico y Diagnóstico'
  ];

  // Calculations
  const totalItems = parts.length;
  const lowStockCount = parts.filter((p) => p.stockFisico <= p.minStock).length;
  const transitCount = parts.filter((p) => p.stockVirtual > 0).length;

  const filteredParts = parts.filter((part) => {
    // Search filter
    const matchesSearch =
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCat =
      selectedCategory === '' || selectedCategory === 'Todos' || part.category === selectedCategory;

    // Mode filter
    let matchesMode = true;
    if (filterMode === 'low') {
      matchesMode = part.stockFisico <= part.minStock;
    } else if (filterMode === 'transit') {
      matchesMode = part.stockVirtual > 0;
    }

    return matchesSearch && matchesCat && matchesMode;
  });

  const handleOpenPurchaseModal = (sku) => {
    setPurchasePartSku(sku);
    setPurchaseQty(5);
    setSelectedSupplierId('SUP-QUAL');
  };

  const handleConfirmPurchase = () => {
    const part = parts.find((p) => p.sku === purchasePartSku);
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!part || !supplier) return;

    const unitCost = Math.round(part.cost * supplier.costMultiplier);
    const totalCost = unitCost * purchaseQty;

    if (cash < totalCost) {
      alert('❌ Fondos insuficientes en caja para completar esta compra.');
      return;
    }

    purchasePartsFromSupplier(purchasePartSku, purchaseQty, selectedSupplierId);
    setPurchasePartSku(null);
  };

  const selectedPart = parts.find((p) => p.sku === purchasePartSku);

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
            Control de Bodega Dual (Físico vs. Virtual)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Controle el stock físico in situ (genera costos por almacenamiento) y el stock virtual
            contratado al proveedor (en tránsito, sin costo de almacenamiento).
          </p>
        </div>
      </div>

      {/* Mini KPIs Row */}
      <div className="grid-3col" style={{ gap: '16px' }}>
        <div
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              background: 'rgba(2, 132, 199, 0.1)',
              color: 'var(--accent-blue)',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              Total SKUs
            </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {totalItems}
            </strong>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--status-replace)',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              Crítico / Bajo Stock
            </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--status-replace)' }}>
              {lowStockCount}
            </strong>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--status-operational)',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Truck size={20} />
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              En Tránsito (Virtual)
            </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--status-operational)' }}>
              {transitCount}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-glass)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          alignItems: 'center'
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar por repuesto o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Category */}
        <div style={{ minWidth: '180px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="premium-select"
          >
            {categories.map((c) => (
              <option key={c} value={c === 'Todos' ? '' : c}>
                Categoría: {c}
              </option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(15,23,42,0.04)',
            padding: '4px',
            borderRadius: '8px'
          }}
        >
          <button
            className={`premium-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
            style={{ padding: '6px 12px', fontSize: '0.75rem', boxShadow: 'none' }}
          >
            Todos
          </button>
          <button
            className={`premium-btn ${filterMode === 'low' ? 'active' : ''}`}
            onClick={() => setFilterMode('low')}
            style={{ padding: '6px 12px', fontSize: '0.75rem', boxShadow: 'none' }}
          >
            Bajo Mínimo
          </button>
          <button
            className={`premium-btn ${filterMode === 'transit' ? 'active' : ''}`}
            onClick={() => setFilterMode('transit')}
            style={{ padding: '6px 12px', fontSize: '0.75rem', boxShadow: 'none' }}
          >
            En Tránsito
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Descripción del Repuesto</th>
              <th>Categoría</th>
              <th>Stock Físico</th>
              <th>Stock Virtual (ETA)</th>
              <th>Costo Unitario</th>
              <th>Precio Venta</th>
              <th>Alerta</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                >
                  🔍 No se encontraron repuestos con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredParts.map((part) => {
                const totalAvailable = part.stockFisico + part.stockVirtual;
                const isUnderMin = part.stockFisico <= part.minStock;
                const isCritical = totalAvailable <= part.minStock;

                return (
                  <tr
                    key={part.sku}
                    style={{ background: isCritical ? 'rgba(239, 68, 68, 0.01)' : '' }}
                  >
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{part.sku}</td>
                    <td style={{ fontWeight: '600' }}>{part.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{part.category}</td>
                    <td>
                      <span
                        className={`badge-status ${part.stockFisico === 0 ? 'replace' : isUnderMin ? 'inspect' : 'operational'}`}
                      >
                        {part.stockFisico} unidades {isUnderMin && '(Bajo Mínimo)'}
                      </span>
                    </td>
                    <td>
                      {part.stockVirtual > 0 ? (
                        <span
                          style={{
                            color: 'var(--accent-blue)',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Truck size={12} /> {part.stockVirtual} un
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0 un</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>${part.cost.toLocaleString()}</td>
                    <td
                      style={{
                        fontFamily: 'monospace',
                        color: 'var(--status-operational)',
                        fontWeight: 'bold'
                      }}
                    >
                      ${part.price.toLocaleString()}
                    </td>
                    <td>
                      {isCritical ? (
                        <span
                          className="badge-status replace"
                          style={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                        >
                          Abastecer URGENTE
                        </span>
                      ) : isUnderMin ? (
                        <span
                          className="badge-status inspect"
                          style={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                        >
                          Reordenar
                        </span>
                      ) : (
                        <span className="badge-status operational" style={{ fontSize: '0.65rem' }}>
                          Óptimo
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`premium-btn ${isCritical ? 'replace' : ''}`}
                        onClick={() => handleOpenPurchaseModal(part.sku)}
                        style={{ padding: '4px 8px', fontSize: '0.72rem', margin: '0 auto' }}
                      >
                        <RefreshCw size={10} /> Comprar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Purchase Modal */}
      {purchasePartSku && selectedPart && (
        <div className="modal-overlay" onClick={() => setPurchasePartSku(null)}>
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
              Orden de Compra: Reabastecimiento de Stock
            </h3>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                REPUESTO A COMPRAR:
              </span>
              <strong
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  marginTop: '2px'
                }}
              >
                {selectedPart.name}
              </strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                SKU: {selectedPart.sku} | Stock Físico: {selectedPart.stockFisico} un | Min:{' '}
                {selectedPart.minStock} un
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
                  const finalCost = Math.round(selectedPart.cost * s.costMultiplier);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} - ${finalCost.toLocaleString()}/u (SLA:{' '}
                      {s.sla === 0.1 ? '2 Horas' : `${s.sla} días`})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quantity select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}
              >
                Cantidad a Comprar
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="premium-input"
              />
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
                    selectedPart.cost *
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
                <span>Costo Total Compra:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--status-replace)' }}>
                  $
                  {(
                    Math.round(
                      selectedPart.cost *
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
              <button className="premium-btn" onClick={() => setPurchasePartSku(null)}>
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

export default InventoryPanel;
