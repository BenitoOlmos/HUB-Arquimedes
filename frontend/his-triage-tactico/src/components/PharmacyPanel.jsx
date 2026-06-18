import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, FileDown, AlertCircle, CheckCircle, Package } from 'lucide-react';

const PharmacyPanel = ({ onTriggerAlert }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [inventoryData, setInventoryData] = useState({ data: [], total: 0, totalPages: 1 });
  
  // Purchase quantities state
  const [buyQuantities, setBuyQuantities] = useState({});
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  // Load paginated data
  const loadInventory = async () => {
    try {
      const res = await fetch(`/api/his/pharmacy?page=${page}&pageSize=10&search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(categoryFilter)}`);
      if (res.ok) {
        const data = await res.json();
        setInventoryData(data);
      }
    } catch (err) {
      console.error("Error loading pharmacy inventory:", err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [page, searchTerm, categoryFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter]);

  const handleOrder = async (skuId) => {
    const qty = buyQuantities[skuId] || 100;
    try {
      const response = await fetch('/api/his/pharmacy/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skuId, quantity: Number(qty) })
      });
      if (response.ok) {
        const item = await response.json();
        onTriggerAlert(`Compra: Orden de ${qty} unidades enviada para ${item.name} (Prov: ${item.provider})`);
        setPurchaseSuccess(`Compra exitosa: ${qty} unidades en tránsito para ${item.name}`);
        setTimeout(() => setPurchaseSuccess(null), 4000);
        
        // Reset input qty
        setBuyQuantities(prev => ({ ...prev, [skuId]: '' }));
        loadInventory();
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Error al procesar compra');
      }
    } catch (err) {
      alert(`Error de compra: ${err.message}`);
    }
  };

  const handleQtyChange = (skuId, val) => {
    setBuyQuantities(prev => ({ ...prev, [skuId]: val }));
  };

  const handleExport = async (format, dataset) => {
    let url = '';
    if (dataset === 'pacientes') {
      url = '/api/his/patients?page=1&pageSize=15000';
    } else if (dataset === 'historial') {
      url = '/api/his/history';
    } else {
      url = '/api/his/pharmacy?page=1&pageSize=1500';
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al descargar datos');
      const resultData = await res.json();
      
      let exportData = [];
      if (dataset === 'pacientes') {
        exportData = resultData.data;
      } else if (dataset === 'historial') {
        exportData = resultData.recentHistory.map(log => ({
          id: log.id,
          date: (log.arrivalTime || '').split('T')[0],
          patientId: log.patient?.rut || log.patientId,
          patientName: log.patient?.fullName || 'Paciente',
          triageLevel: log.assignedEsi,
          waitTime: log.attentionTime ? Math.max(0, Math.floor((new Date(log.attentionTime).getTime() - new Date(log.arrivalTime).getTime()) / 60000)) : 0,
          diagnosis: log.symptoms,
          outcome: log.status
        }));
      } else {
        exportData = resultData.data;
      }

      if (format === 'json') {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
        const link = document.createElement("a");
        link.setAttribute("href", jsonString);
        link.setAttribute("download", `${dataset}_db_seed.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        onTriggerAlert(`Exportar: Descargada base de datos ${dataset} en formato JSON`);
      } else {
        if (exportData.length === 0) return;
        const headers = Object.keys(exportData[0]);
        const csvRows = [];
        csvRows.push(headers.join(","));

        exportData.forEach(item => {
          const values = headers.map(header => {
            const val = item[header];
            const escaped = ("" + (val !== null && val !== undefined ? val : '')).replace(/"/g, '\\"');
            return `"${escaped}"`;
          });
          csvRows.push(values.join(","));
        });

        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `${dataset}_db_seed.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        onTriggerAlert(`Exportar: Descargada base de datos ${dataset} en formato CSV`);
      }
    } catch (err) {
      alert(`Error al exportar: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      
      {/* Searchable Inventory List */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Package size={18} color="var(--esi-3-urg)" /> Bodega de Farmacia e Insumos (1,000+ SKUs)
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            Mostrando {inventoryData.total} items
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar SKU por nombre, ID o proveedor..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            <option value="Medicamentos Urgencia">Medicamentos de Urgencia</option>
            <option value="Insumos Quirúrgicos">Insumos Quirúrgicos</option>
            <option value="EPP">Equipos de Protección (EPP)</option>
            <option value="Gases Medicinales">Gases Medicinales</option>
          </select>
        </div>

        {purchaseSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--bed-free)',
            borderRadius: '6px',
            color: 'var(--bed-free)',
            padding: '0.6rem 0.8rem',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={14} />
            {purchaseSuccess}
          </div>
        )}

        <div className="his-table-container">
          <table className="his-table">
            <thead>
              <tr>
                <th>Código SKU</th>
                <th>Descripción Artículo</th>
                <th>Categoría</th>
                <th>Costo Unit.</th>
                <th>Stock Físico</th>
                <th>Tránsito (Virtual)</th>
                <th>Acción de Compra</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.data.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron insumos para la búsqueda actual.
                  </td>
                </tr>
              ) : (
                inventoryData.data.map(item => {
                  const isLowStock = item.stock <= item.reorderPoint;
                  return (
                    <tr key={item.id} style={{
                      background: isLowStock ? 'rgba(234, 179, 8, 0.03)' : 'transparent'
                    }}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{item.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{item.name}</span>
                          {item.isCritical && (
                            <span style={{
                              fontSize: '0.55rem',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: 'var(--esi-1-resus)',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              fontWeight: 'bold'
                            }}>CRÍTICO</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Prov: {item.provider}</div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.category}</td>
                      <td style={{ fontFamily: 'monospace' }}>${item.cost}</td>
                      <td>
                        <span style={{
                          fontWeight: 'bold',
                          color: isLowStock ? 'var(--esi-3-urg)' : 'var(--bed-free)'
                        }}>
                          {item.stock}
                        </span>
                        {isLowStock && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--esi-3-urg)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <AlertCircle size={8} /> Min: {item.reorderPoint}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent-purple)' }}>
                        {item.virtualStock > 0 ? `+${item.virtualStock}` : '0'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="number"
                            placeholder="Cant"
                            className="form-input"
                            style={{ width: '55px', padding: '0.3rem 0.4rem', fontSize: '0.75rem' }}
                            value={buyQuantities[item.id] || ''}
                            onChange={e => handleQtyChange(item.id, e.target.value)}
                          />
                          <button
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.5rem', borderRadius: '4px' }}
                            onClick={() => handleOrder(item.id)}
                            title="Comprar unidades"
                          >
                            <ShoppingCart size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-controls">
          <button
            className="btn-secondary"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
          >
            Anterior
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Página {page} de {inventoryData.totalPages}
          </span>
          <button
            className="btn-secondary"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            disabled={page === inventoryData.totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Database Exporter & Seeders (Academics) */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <FileDown size={18} color="var(--accent-cyan)" /> Base de Datos y Seeders (Docente)
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.8rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Este módulo simula la base de datos de poblamiento clínico e inventario hospitalario. Los docentes pueden descargar los archivos de seed estructurados para su uso en laboratorios de computación o para restablecer la sesión.
          </p>

          {/* Pacientes Seed */}
          <div style={{ border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.01)' }}>
            <strong style={{ display: 'block', marginBottom: '6px' }}>Seeder 1: Pacientes Clínicos (10,000+ Fichas)</strong>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }} onClick={() => handleExport('json', 'pacientes')}>
                Descargar JSON
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }} onClick={() => handleExport('csv', 'pacientes')}>
                Descargar CSV
              </button>
            </div>
          </div>

          {/* Historial Urgencias Seed */}
          <div style={{ border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.01)' }}>
            <strong style={{ display: 'block', marginBottom: '6px' }}>Seeder 2: Historial Urgencias (50,000+ Casos)</strong>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }} onClick={() => handleExport('json', 'historial')}>
                Descargar JSON
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }} onClick={() => handleExport('csv', 'historial')}>
                Descargar CSV
              </button>
            </div>
          </div>

          {/* Farmacia Seed */}
          <div style={{ border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.01)' }}>
            <strong style={{ display: 'block', marginBottom: '6px' }}>Seeder 3: Bodega Farmacia (1,000+ SKUs)</strong>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }} onClick={() => handleExport('json', 'farmacia')}>
                Descargar JSON
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }} onClick={() => handleExport('csv', 'farmacia')}>
                Descargar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PharmacyPanel;
