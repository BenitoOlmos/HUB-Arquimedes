import React, { useState } from 'react';
import { Truck, MapPin, AlertCircle, ArrowRight, Layers } from 'lucide-react';

export default function InventoryMap({ inventories, products, onTransfer }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [fromType, setFromType] = useState('MAIN_WAREHOUSE');
  const [toNodeId, setToNodeId] = useState('');
  const [transferQty, setTransferQty] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [transitAnimation, setTransitAnimation] = useState(null);

  // Setup default product if not set
  const activeProductId = selectedProductId || (products && products[0]?.id) || '';
  const activeProduct = products?.find(p => p.id === activeProductId);

  // Coordinates bounding box for Santiago Centro / Las Condes / Pudahuel
  const latMin = -33.49;
  const latMax = -33.40;
  const lngMin = -70.80;
  const lngMax = -70.56;

  const getXY = (lat, lng) => {
    const x = 50 + ((lng - lngMin) / (lngMax - lngMin)) * 700;
    const y = 450 - ((lat - latMin) / (latMax - latMin)) * 400;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // Group inventories by store location
  const uniqueStores = [];
  inventories.forEach(inv => {
    const existing = uniqueStores.find(s => Math.abs(s.lat - inv.lat) < 0.001 && Math.abs(s.lng - inv.lng) < 0.001);
    if (existing) {
      existing.items.push(inv);
    } else {
      uniqueStores.push({
        id: inv.id,
        name: inv.storeType === 'MAIN_WAREHOUSE' ? 'Pudahuel (WH)' : 
              inv.lat === -33.425 ? 'Providencia (DS)' :
              inv.lat === -33.412 ? 'Las Condes (DS)' :
              inv.lat === -33.442 ? 'Santiago Centro (RT)' : 'Maipú (RT)',
        storeType: inv.storeType,
        lat: inv.lat,
        lng: inv.lng,
        items: [inv],
        ...getXY(inv.lat, inv.lng)
      });
    }
  });

  // Hotspots / heat demand overlay coordinates
  const hotspots = [
    { name: "Sector Santiago Centro", lat: -33.442, lng: -70.653, radius: 55, demand: "ALTA", color: "rgba(244, 63, 94, 0.2)" },
    { name: "Sector Las Condes", lat: -33.412, lng: -70.578, radius: 65, demand: "EXTREMA", color: "rgba(244, 63, 94, 0.25)" },
    { name: "Sector Providencia", lat: -33.425, lng: -70.614, radius: 45, demand: "MEDIA-ALTA", color: "rgba(245, 158, 11, 0.18)" }
  ];

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!activeProductId) {
      setErrorMsg('Seleccione un producto para transferir.');
      return;
    }

    const targetStore = uniqueStores.find(s => s.id === toNodeId);
    if (!targetStore) {
      setErrorMsg('Seleccione un nodo de destino válido.');
      return;
    }

    // Find source stock level
    const sourceStore = uniqueStores.find(s => s.storeType === fromType);
    if (!sourceStore) {
      setErrorMsg('No se encontró el almacén de origen.');
      return;
    }

    const sourceItem = sourceStore.items.find(i => i.productId === activeProductId);
    if (!sourceItem || sourceItem.stockLevel < transferQty) {
      setErrorMsg(`Stock insuficiente en origen. Disponible: ${sourceItem?.stockLevel || 0}`);
      return;
    }

    if (sourceStore.id === targetStore.id) {
      setErrorMsg('El nodo de origen y destino no pueden ser el mismo.');
      return;
    }

    try {
      // Trigger truck transit animation
      setTransitAnimation({
        fromX: sourceStore.x,
        fromY: sourceStore.y,
        toX: targetStore.x,
        toY: targetStore.y
      });

      await onTransfer(activeProductId, fromType, targetStore.lat, targetStore.lng, transferQty);
      
      setSuccessMsg(`Transferencia exitosa: ${transferQty} unidades enviadas a ${targetStore.name}`);
      setTimeout(() => setTransitAnimation(null), 3500);
    } catch (err) {
      setTransitAnimation(null);
      setErrorMsg(err.message || 'Error al procesar transferencia.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* Product Selector Bar */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layers className="logo-icon" size={24} />
          <div>
            <h4 style={{ fontSize: '1.1rem' }}>Filtro de Inventario por Producto</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Visualice stock en tiempo real del SKU seleccionado</p>
          </div>
        </div>
        <div>
          <select 
            className="form-select" 
            value={activeProductId} 
            onChange={(e) => setSelectedProductId(e.target.value)}
            style={{ minWidth: '280px' }}
          >
            {products?.map(p => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name} (${p.basePrice})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Map and Controls */}
      <div className="grid-cols-12">
        
        {/* Interactive SVG Map Card */}
        <div className="glass-card" style={{ gridColumn: 'span 8', minHeight: '500px' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Mapa de Distribución Logística (Zonas Metropolitana)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Zonas de calor de demanda Same-Day vs disponibilidad de Dark-Stores</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
                Alta Demanda
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-indigo)' }}></span>
                Nodos Logísticos
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', border: '1px solid #1c233a', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#070911' }}>
            <svg viewBox="0 0 800 500" width="100%" height="100%">
              {/* Grid Background */}
              <rect width="800" height="500" fill="#070a13" />
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#12182b" strokeWidth="1" />
                </pattern>
                <radialGradient id="hotspotGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="800" height="500" fill="url(#grid)" />

              {/* Map roads network */}
              <path d="M 74 175 L 181 425 L 497 210 L 616 125 L 725 60" className="map-road" />
              <path d="M 74 175 L 497 210 L 725 60" className="map-road" />
              <path d="M 181 425 L 497 210" className="map-road" />

              {/* Demand Hotspots (Zonas de calor) */}
              {hotspots.map((hs, idx) => {
                const xy = getXY(hs.lat, hs.lng);
                return (
                  <g key={`hotspot-${idx}`}>
                    <circle cx={xy.x} cy={xy.y} r={hs.radius * 1.5} fill="url(#hotspotGrad)" />
                    <circle cx={xy.x} cy={xy.y} r={hs.radius} className="hotspot-circle" />
                  </g>
                );
              })}

              {/* Delivery Animation */}
              {transitAnimation && (
                <g className="dispatch-truck">
                  <path 
                    d={`M ${transitAnimation.fromX} ${transitAnimation.fromY} L ${transitAnimation.toX} ${transitAnimation.toY}`}
                    fill="none"
                    stroke="var(--color-indigo)"
                    strokeWidth="3"
                    id="truckPath"
                  />
                  <circle r="8" fill="#a5b4fc">
                    <animateMotion dur="3s" repeatCount="1" path={`M ${transitAnimation.fromX} ${transitAnimation.fromY} L ${transitAnimation.toX} ${transitAnimation.toY}`} />
                  </circle>
                  <text fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    🚚
                    <animateMotion dur="3s" repeatCount="1" path={`M ${transitAnimation.fromX} ${transitAnimation.fromY} L ${transitAnimation.toX} ${transitAnimation.toY}`} />
                  </text>
                </g>
              )}

              {/* Store Nodes */}
              {uniqueStores.map(store => {
                const activeItem = store.items.find(i => i.productId === activeProductId);
                const stock = activeItem ? activeItem.stockLevel : 0;
                const isOutOfStock = stock === 0;

                return (
                  <g key={store.id} className="map-node" onClick={() => setToNodeId(store.id)}>
                    {/* Node marker ring */}
                    <circle 
                      cx={store.x} 
                      cy={store.y} 
                      r={isOutOfStock ? 22 : 18} 
                      fill="none" 
                      stroke={isOutOfStock ? 'var(--color-danger)' : 'var(--color-indigo)'} 
                      strokeWidth={isOutOfStock ? 3 : 2}
                      strokeDasharray={isOutOfStock ? '4 2' : 'none'}
                    />
                    
                    {/* Node center dot */}
                    <circle 
                      cx={store.x} 
                      cy={store.y} 
                      r="12" 
                      fill={isOutOfStock ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)'} 
                    />

                    {/* Stock level tag */}
                    <rect 
                      x={store.x - 22} 
                      y={store.y - 38} 
                      width="44" 
                      height="18" 
                      rx="4" 
                      fill={isOutOfStock ? '#f43f5e' : '#1e263d'} 
                      stroke={isOutOfStock ? 'none' : 'var(--border-color)'}
                      strokeWidth="1"
                    />
                    <text 
                      x={store.x} 
                      y={store.y - 25} 
                      fill="#ffffff" 
                      fontSize="10" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {stock}
                    </text>

                    {/* Node Text Label */}
                    <text 
                      x={store.x} 
                      y={store.y + 30} 
                      fill="#ffffff" 
                      fontSize="11" 
                      fontWeight="600" 
                      textAnchor="middle"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {store.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Transfer Action Center Card */}
        <div className="glass-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Redireccionar Inventario</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Mueva stock desde bodegas principales para satisfacer quiebres.
            </p>
          </div>

          <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Origin Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>1. Nodo de Origen (Bodega Principal)</label>
              <select 
                className="form-select" 
                value={fromType} 
                onChange={(e) => setFromType(e.target.value)}
              >
                <option value="MAIN_WAREHOUSE">Pudahuel (MAIN_WAREHOUSE)</option>
                <option value="DARK_STORE">Dark Stores (DARK_STORE)</option>
                <option value="RETAIL_STORE">Tiendas Físicas (RETAIL_STORE)</option>
              </select>
            </div>

            {/* Destination Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>2. Nodo de Destino (Haga Clic en el Mapa)</label>
              <select 
                className="form-select" 
                value={toNodeId} 
                onChange={(e) => setToNodeId(e.target.value)}
              >
                <option value="">-- Seleccionar destino --</option>
                {uniqueStores.map(store => (
                  <option key={store.id} value={store.id}>{store.name} ({store.storeType})</option>
                ))}
              </select>
            </div>

            {/* Transfer Qty */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>3. Cantidad a Transferir</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" 
                max="500" 
                value={transferQty} 
                onChange={(e) => setTransferQty(Number(e.target.value))}
              />
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div style={{ display: 'flex', gap: '0.5rem', color: '#fb7185', backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ display: 'flex', gap: '0.5rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Truck size={18} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}
              disabled={!toNodeId || !fromType || transferQty <= 0}
            >
              Transferir Stock
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Active Out-of-Stock warnings */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fb7185' }}>
              <AlertCircle size={16} />
              Alertas de Quiebre (0 Stock)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto' }}>
              {uniqueStores.map(store => {
                const item = store.items.find(i => i.productId === activeProductId);
                if (!item || item.stockLevel > 0) return null;
                return (
                  <div key={store.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', backgroundColor: 'rgba(244, 63, 94, 0.05)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                    <span>{store.name}</span>
                    <span style={{ fontWeight: 'bold', color: '#f43f5e' }}>QUIEBRE</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
