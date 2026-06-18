import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  BarChart3,
  Map,
  Users,
  Settings,
  Download,
  Play,
  Square,
  Sparkles,
  Plus,
  Mail,
  ShieldAlert,
  Info,
  Clock
} from 'lucide-react';
import ConversionFunnel from './components/ConversionFunnel';
import InventoryMap from './components/InventoryMap';

export default function App() {
  const [activeTab, setActiveTab] = useState('bi');
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [funnelData, setFunnelData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [crmRules, setCrmRules] = useState([]);
  const [simulationActive, setSimulationActive] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);

  // CRM Rule Modal form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('Carrito Abandonado por stock');
  const [newRuleDiscount, setNewRuleDiscount] = useState('10% OFF');
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Segment Filter state
  const [segmentFilter, setSegmentFilter] = useState('ALL');

  // Socket reference
  const socketRef = useRef(null);

  // Load initial data
  useEffect(() => {
    fetchData();

    // Setup Socket.io
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to Retail WebSocket telemetry stream');
    });

    socketRef.current.on('retail-telemetry-update', (payload) => {
      if (payload.funnel) setFunnelData(payload.funnel);
      if (payload.inventories) setInventories(payload.inventories);
      if (payload.customers) setCustomers(payload.customers);

      if (payload.stepResult) {
        const result = payload.stepResult;
        let logMsg = '';
        if (result.event) {
          const type = result.event.eventType;
          const sku = result.sku;
          if (type === 'PAGE_VIEW') {
            logMsg = `👀 Impresión de página: ${sku}`;
          } else if (type === 'ADD_TO_CART') {
            logMsg = `🛒 Añadido al carrito: ${sku}`;
          } else if (type === 'CART_ABANDONED') {
            logMsg = result.stockout
              ? `🚨 Carrito Abandonado por QUIEBRE DE STOCK (ROAS caídos): ${sku}`
              : `⚠️ Carrito Abandonado (intención de compra): ${sku}`;
          } else if (type === 'PURCHASE') {
            logMsg = `💰 Compra Exitosa! SKU: ${sku}`;
          }
        }

        if (logMsg) {
          setLiveLogs((prev) => [
            { id: Date.now(), msg: logMsg, timestamp: new Date().toLocaleTimeString() },
            ...prev.slice(0, 24)
          ]);
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const [prodsRes, invRes, funnelRes, custRes, rulesRes, statusRes] = await Promise.all([
        fetch('/api/retail/products'),
        fetch('/api/retail/inventories'),
        fetch('/api/retail/analytics/funnel'),
        fetch('/api/retail/customers'),
        fetch('/api/retail/crm/rules'),
        fetch('/api/retail/simulation/status')
      ]);

      setProducts(await prodsRes.json());
      setInventories(await invRes.json());
      setFunnelData(await funnelRes.json());
      setCustomers(await custRes.json());
      setCrmRules(await rulesRes.json());
      const status = await statusRes.json();
      setSimulationActive(status.blackFridayActive);
    } catch (error) {
      console.error('Error fetching retail engine data:', error);
    }
  };

  const handleToggleSimulation = async () => {
    const nextState = !simulationActive;
    try {
      const res = await fetch('/api/retail/simulation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState })
      });
      const data = await res.json();
      setSimulationActive(data.blackFridayActive);

      setLiveLogs((prev) => [
        {
          id: Date.now(),
          msg: nextState
            ? '🚀 Simulación de Black Friday ACTIVADA'
            : '⏹️ Simulación de Black Friday DESACTIVADA',
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Error toggling simulation:', error);
    }
  };

  const handleTransferStock = async (productId, fromType, toLat, toLng, qty) => {
    const res = await fetch('/api/retail/inventory/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, fromType, toLat, toLng, qty })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Fallo de transferencia');
    }

    // Refresh local lists
    await fetchData();
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!newRuleName) return;

    try {
      const res = await fetch('/api/retail/crm/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleName,
          condition: newRuleCondition,
          discount: newRuleDiscount
        })
      });
      const rules = await res.json();
      setCrmRules(rules);

      // Reset form
      setNewRuleName('');
      setShowRuleModal(false);
    } catch (error) {
      console.error('Error creating CRM rule:', error);
    }
  };

  // Filter customer listing
  const filteredCustomers =
    segmentFilter === 'ALL' ? customers : customers.filter((c) => c.segment === segmentFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header bar */}
      <header className="app-header">
        <div className="logo-container">
          <BarChart3 className="logo-icon" size={28} />
          <div>
            <span className="logo-text">Retail Analytics Engine</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              HUB-Arquímedes BI Panel
            </span>
          </div>
        </div>

        {/* Live Traffic simulation control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className={simulationActive ? 'pulse-dot' : ''}
              style={{
                backgroundColor: simulationActive ? 'var(--color-success)' : 'var(--text-muted)'
              }}
            ></span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: simulationActive ? 'var(--color-success)' : 'var(--text-secondary)'
              }}
            >
              {simulationActive ? 'Live Black Friday Activo' : 'Simulación Detenida'}
            </span>
          </div>

          <button
            onClick={handleToggleSimulation}
            className={simulationActive ? 'btn-secondary' : 'btn-primary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {simulationActive ? <Square size={16} /> : <Play size={16} />}
            {simulationActive ? 'Pausar Tráfico' : 'Iniciar CyberMonday'}
          </button>

          <a
            href="/api/retail/analytics/export"
            download
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            <Download size={16} />
            Exportar CSV
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Navigation Tabs */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'bi' ? 'active' : ''}`}
            onClick={() => setActiveTab('bi')}
          >
            <BarChart3 size={18} />
            Control BI de Campañas
          </button>
          <button
            className={`tab-btn ${activeTab === 'logistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('logistics')}
          >
            <Map size={18} />
            Mapa de Calor y Logística
          </button>
          <button
            className={`tab-btn ${activeTab === 'crm' ? 'active' : ''}`}
            onClick={() => setActiveTab('crm')}
          >
            <Users size={18} />
            CRM & Micro-Segmentación
          </button>
        </div>

        {/* Tab 1: Control BI de Campañas */}
        {activeTab === 'bi' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {/* Conversion statistics */}
            <ConversionFunnel data={funnelData?.funnelData} kpis={funnelData?.kpis} />

            {/* Live activity log and products inventory summary */}
            <div className="grid-cols-12">
              {/* Product list catalog */}
              <div className="glass-card" style={{ gridColumn: 'span 7' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                  Catálogo Digital y Estatus de Inventarios
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  Ajuste el precio base y planifique promociones en el CMS. Monitoree quiebres en
                  tiempo real.
                </p>

                <div className="premium-table-container">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Nombre de Producto</th>
                        <th>Categoría</th>
                        <th>Precio Base</th>
                        <th>Stock Global</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => {
                        const totalStock = prod.inventories.reduce((a, b) => a + b.stockLevel, 0);
                        return (
                          <tr key={prod.id}>
                            <td style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{prod.sku}</td>
                            <td>{prod.name}</td>
                            <td>{prod.category}</td>
                            <td>${prod.basePrice.toFixed(2)}</td>
                            <td>
                              <span
                                className={`badge ${totalStock === 0 ? 'badge-danger' : totalStock < 50 ? 'badge-warning' : 'badge-success'}`}
                              >
                                {totalStock} u.
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live WebSocket Event Console */}
              <div
                className="glass-card"
                style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Sparkles className="logo-icon" size={20} />
                    Consola de Telemetría en Vivo
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Actividades de navegación y compras inyectadas por Socket.io.
                  </p>
                </div>

                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#070911',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  {liveLogs.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'var(--text-muted)'
                      }}
                    >
                      No hay registros de tráfico aún. Inicie la simulación para ver la telemetría
                      en tiempo real.
                    </div>
                  ) : (
                    liveLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{ borderBottom: '1px solid #111827', paddingBottom: '0.25rem' }}
                      >
                        <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                          [{log.timestamp}]
                        </span>
                        <span
                          style={{
                            color: log.msg.includes('💰')
                              ? '#34d399'
                              : log.msg.includes('🚨')
                                ? '#fb7185'
                                : '#e5e7eb'
                          }}
                        >
                          {log.msg}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mapa de Calor y Logística */}
        {activeTab === 'logistics' && (
          <InventoryMap
            inventories={inventories}
            products={products}
            onTransfer={handleTransferStock}
          />
        )}

        {/* Tab 3: CRM y Micro-Segmentación */}
        {activeTab === 'crm' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {/* Info Alerts regarding Marketing vs Logistics clash */}
            <div
              className="glass-card"
              style={{
                display: 'flex',
                gap: '1rem',
                borderLeft: '4px solid var(--color-indigo)',
                backgroundColor: 'rgba(99, 102, 241, 0.05)'
              }}
            >
              <Info className="logo-icon" size={24} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Conflicto Omnicanal: Marketing vs Logística
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Los estudiantes de Marketing inyectan tráfico con campañas, pero si Logística no
                  transfiere stock a las Dark-Stores correspondientes, los carritos se abandonan. El
                  CRM permite configurar reglas automáticas de recuperación una vez que el stock se
                  repone.
                </p>
              </div>
            </div>

            <div className="grid-cols-12">
              {/* Customers list and segment filters */}
              <div className="glass-card" style={{ gridColumn: 'span 7' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>Segmentación de Clientes y CLV</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Historial y valor de vida del cliente (Customer Lifetime Value)
                    </p>
                  </div>
                  <div>
                    <select
                      className="form-select"
                      value={segmentFilter}
                      onChange={(e) => setSegmentFilter(e.target.value)}
                      style={{ minWidth: '180px' }}
                    >
                      <option value="ALL">Todos los Segmentos</option>
                      <option value="MILLENNIAL_TECH">Millennial Tech</option>
                      <option value="BARGAIN_HUNTER">Bargain Hunter</option>
                      <option value="LOYAL_PREMIUM">Loyal Premium</option>
                    </select>
                  </div>
                </div>

                <div className="premium-table-container">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>ID Cliente</th>
                        <th>Segmento</th>
                        <th>LTV Acumulado</th>
                        <th>Compras Realizadas</th>
                        <th>Abandonos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.slice(0, 30).map((cust) => (
                        <tr key={cust.id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {cust.id}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                cust.segment === 'LOYAL_PREMIUM'
                                  ? 'badge-info'
                                  : cust.segment === 'MILLENNIAL_TECH'
                                    ? 'badge-success'
                                    : 'badge-warning'
                              }`}
                            >
                              {cust.segment}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>${cust.lifetimeValue.toFixed(2)}</td>
                          <td>{cust.ordersCount} pedidos</td>
                          <td>
                            <span
                              style={{
                                color: cust.abandonedCount > 2 ? '#fb7185' : 'var(--text-primary)'
                              }}
                            >
                              {cust.abandonedCount} carritos
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CRM Automations list */}
              <div
                className="glass-card"
                style={{
                  gridColumn: 'span 5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>Automatizaciones CRM (IFTTT)</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Reglas automáticas de recuperación de carritos
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRuleModal(true)}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <Plus size={16} />
                    Nueva Regla
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {crmRules.map((rule) => (
                    <div
                      key={rule.id}
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '1rem',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <h4 style={{ fontSize: '0.95rem', color: '#a5b4fc' }}>{rule.name}</h4>
                        <span className="badge badge-success">Activa</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} />
                          <strong>SI:</strong> {rule.condition}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            marginTop: '0.25rem'
                          }}
                        >
                          <Mail size={12} />
                          <strong>ACCIÓN:</strong> Enviar correo con {rule.discount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CRM Create Rule Modal */}
      {showRuleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '420px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Crear Regla de Recuperación</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Programe disparadores automatizados para clientes en quiebre
              </p>
            </div>

            <form
              onSubmit={handleCreateRule}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Nombre de la Regla</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Recuperación Zapatillas 10%"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Condición (Trigger)</label>
                <select
                  className="form-select"
                  value={newRuleCondition}
                  onChange={(e) => setNewRuleCondition(e.target.value)}
                >
                  <option value="Carrito Abandonado por stock">
                    Carrito Abandonado por falta de stock
                  </option>
                  <option value="Stock se repone en < 48h">Stock se repone en &lt; 48 horas</option>
                  <option value="Cliente VIP abandona carrito">Cliente VIP abandona carrito</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Acción de Descuento</label>
                <select
                  className="form-select"
                  value={newRuleDiscount}
                  onChange={(e) => setNewRuleDiscount(e.target.value)}
                >
                  <option value="10% OFF">Enviar correo con 10% de descuento</option>
                  <option value="15% OFF">Enviar correo con 15% de descuento</option>
                  <option value="Envío Gratis">Enviar correo con Cupón Envío Gratis</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Guardar Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '2rem',
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}
      >
        &copy; {new Date().getFullYear()} HUB-Arquímedes. Todos los derechos reservados.
        Desarrollado para simulaciones académicas B2B.
      </footer>
    </div>
  );
}
