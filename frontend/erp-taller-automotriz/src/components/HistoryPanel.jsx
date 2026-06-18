import React, { useState } from 'react';
import {
  FileText,
  Search,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const HistoryPanel = ({ historicalLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Financial calculations
  const totalRevenue = historicalLogs.reduce((acc, log) => acc + log.totalPrice, 0);
  const totalCost = historicalLogs.reduce((acc, log) => acc + log.totalCost, 0);
  const totalMargin = totalRevenue - totalCost;
  const avgSatisfaction =
    historicalLogs.reduce((acc, log) => acc + log.satisfaction, 0) / (historicalLogs.length || 1);

  const filteredLogs = historicalLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.id.toLowerCase().includes(term) ||
      log.clientName.toLowerCase().includes(term) ||
      log.vehicleLabel.toLowerCase().includes(term)
    );
  });

  const toggleExpandLog = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
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
            Historial de Operaciones y Bitácoras
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Audite el rendimiento financiero, la rentabilidad histórica por orden de trabajo y la
            satisfacción final de los clientes.
          </p>
        </div>
      </div>

      {/* Historical Financial Indicators */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-title">
            <DollarSign size={16} color="var(--status-operational)" /> Total Facturado
          </span>
          <strong className="kpi-value" style={{ color: 'var(--status-operational)' }}>
            ${totalRevenue.toLocaleString()}
          </strong>
          <span className="kpi-subtitle">100 OTs Históricas</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <TrendingUp size={16} color="var(--status-replace)" /> Costo de Operaciones
          </span>
          <strong className="kpi-value" style={{ color: 'var(--status-replace)' }}>
            ${totalCost.toLocaleString()}
          </strong>
          <span className="kpi-subtitle">Repuestos + Mano de Obra</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <ShieldCheck size={16} color="var(--accent-blue)" /> Utilidad Neta
          </span>
          <strong className="kpi-value" style={{ color: 'var(--accent-blue)' }}>
            ${totalMargin.toLocaleString()}
          </strong>
          <span className="kpi-subtitle">
            Margen bruto: {Math.round((totalMargin / totalRevenue) * 100)}%
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <Clock size={16} color="var(--status-inspect)" /> Calificación Clientes
          </span>
          <strong className="kpi-value" style={{ color: 'var(--status-inspect)' }}>
            {avgSatisfaction.toFixed(1)}%
          </strong>
          <span className="kpi-subtitle">Satisfacción acumulada</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          background: 'var(--bg-glass)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar por cliente, patente, marca o ID de OT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          Mostrando {filteredLogs.length} de {historicalLogs.length} registros
        </span>
      </div>

      {/* Table / List */}
      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>OT ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Ingresos</th>
              <th>Margen ($)</th>
              <th>Satisfacción</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                >
                  No se encontraron OTs históricas.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const profitPct = Math.round((log.margin / log.totalPrice) * 100);

                return (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => toggleExpandLog(log.id)} style={{ cursor: 'pointer' }}>
                      <td>{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                      <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{log.id}</td>
                      <td>{log.closedDate}</td>
                      <td style={{ fontWeight: '600' }}>{log.clientName}</td>
                      <td>{log.vehicleLabel}</td>
                      <td style={{ fontFamily: 'monospace' }}>
                        ${log.totalPrice.toLocaleString()}
                      </td>
                      <td
                        style={{
                          fontFamily: 'monospace',
                          color:
                            log.margin >= 0 ? 'var(--status-operational)' : 'var(--status-replace)',
                          fontWeight: 'bold'
                        }}
                      >
                        ${log.margin.toLocaleString()} ({profitPct}%)
                      </td>
                      <td>
                        <span
                          className={`badge-status ${log.satisfaction >= 85 ? 'operational' : log.satisfaction >= 70 ? 'inspect' : 'replace'}`}
                        >
                          {log.satisfaction}%
                        </span>
                      </td>
                      <td>
                        <span className="badge-status operational">Cerrado</span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td
                          colSpan="9"
                          style={{ background: 'var(--bg-primary)', padding: '16px' }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                              gap: '16px',
                              fontSize: '0.78rem'
                            }}
                          >
                            {/* Technical summaries */}
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>
                                Detalles de Operación:
                              </strong>
                              <ul
                                style={{
                                  margin: '6px 0 0 0',
                                  paddingLeft: '16px',
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                <li>
                                  <strong>Andén utilizado:</strong> {log.andenId}
                                </li>
                                <li>
                                  <strong>Horas Estándar (TAR):</strong> {log.laborHoursTarget} Hrs
                                </li>
                                <li>
                                  <strong>Horas Reales:</strong> {log.laborHoursReal.toFixed(1)} Hrs
                                </li>
                                <li>
                                  <strong>Rendimiento Taller:</strong>{' '}
                                  {log.laborHoursReal > log.laborHoursTarget
                                    ? 'Sobrecosto / Retraso'
                                    : 'Eficiente / A tiempo'}
                                </li>
                              </ul>
                            </div>

                            {/* Spares used */}
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>
                                Repuestos Utilizados:
                              </strong>
                              {log.partsRequired.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Solo mano de obra. Sin repuestos.
                                </div>
                              ) : (
                                <ul
                                  style={{
                                    margin: '6px 0 0 0',
                                    paddingLeft: '16px',
                                    color: 'var(--text-secondary)'
                                  }}
                                >
                                  {log.partsRequired.map((p, idx) => (
                                    <li key={idx}>
                                      {p.qty}x {p.name} (${p.price.toLocaleString()}/u)
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Financial breakdown */}
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>
                                Desglose de Costos e Ingresos:
                              </strong>
                              <table
                                style={{
                                  width: '100%',
                                  marginTop: '6px',
                                  fontSize: '0.75rem',
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td>Mano de Obra (Venta):</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                      ${log.laborPrice.toLocaleString()}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Repuestos (Venta):</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                      ${(log.totalPrice - log.laborPrice).toLocaleString()}
                                    </td>
                                  </tr>
                                  <tr
                                    style={{
                                      borderTop: '1px solid var(--border-glass)',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    <td style={{ color: 'var(--text-primary)' }}>
                                      Total Ingresos:
                                    </td>
                                    <td
                                      style={{
                                        textAlign: 'right',
                                        fontFamily: 'monospace',
                                        color: 'var(--accent-blue)'
                                      }}
                                    >
                                      ${log.totalPrice.toLocaleString()}
                                    </td>
                                  </tr>
                                  <tr style={{ fontWeight: 'bold' }}>
                                    <td style={{ color: 'var(--text-primary)' }}>Costo Total:</td>
                                    <td
                                      style={{
                                        textAlign: 'right',
                                        fontFamily: 'monospace',
                                        color: 'var(--status-replace)'
                                      }}
                                    >
                                      -${log.totalCost.toLocaleString()}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPanel;
