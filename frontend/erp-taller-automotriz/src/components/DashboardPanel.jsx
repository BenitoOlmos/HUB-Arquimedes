import React from 'react';
import { DollarSign, Star, Wrench, Package, AlertTriangle, TrendingUp, BarChart3, Clock } from 'lucide-react';

const DashboardPanel = ({
  cash,
  satisfaction,
  activeOTs,
  closedOTsCount,
  parts,
  historicalLogs,
  setCurrentTab
}) => {
  // Calculations
  const activeCount = activeOTs.length;
  
  const totalPhysicalValue = parts.reduce((acc, p) => acc + (p.stockFisico * p.cost), 0);
  const totalVirtualValue = parts.reduce((acc, p) => acc + (p.stockVirtual * p.cost), 0);

  const lowStockParts = parts.filter(p => p.stockFisico <= p.minStock);

  // SVG Chart: Historical Revenue (12 months)
  // Let's summarize mock revenues from closed historical OTs
  // Since OTs are distributed from -120 to 0 days, let's group them in 4 periods of 30 days
  const periods = [
    { label: 'Mes -4', revenue: 0, cost: 0 },
    { label: 'Mes -3', revenue: 0, cost: 0 },
    { label: 'Mes -2', revenue: 0, cost: 0 },
    { label: 'Mes -1', revenue: 0, cost: 0 }
  ];

  historicalLogs.forEach(log => {
    // Parse entry day (format: "Día -45")
    const match = log.entryDate.match(/Día (-?\d+)/);
    if (match) {
      const day = parseInt(match[1]);
      if (day >= -120 && day < -90) { periods[0].revenue += log.totalPrice; periods[0].cost += log.totalCost; }
      else if (day >= -90 && day < -60) { periods[1].revenue += log.totalPrice; periods[1].cost += log.totalCost; }
      else if (day >= -60 && day < -30) { periods[2].revenue += log.totalPrice; periods[2].cost += log.totalCost; }
      else if (day >= -30 && day <= 0) { periods[3].revenue += log.totalPrice; periods[3].cost += log.totalCost; }
    }
  });

  const maxRevenue = Math.max(...periods.map(p => p.revenue), 100000);

  return (
    <div className="panel-view">
      {/* KPIs Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-title">
            <DollarSign size={16} color="var(--status-operational)" /> Caja de Finanzas
          </span>
          <strong className="kpi-value" style={{ color: 'var(--status-operational)' }}>
            ${Math.round(cash).toLocaleString()}
          </strong>
          <span className="kpi-subtitle">Fondo líquido disponible</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <Star size={16} color="var(--status-inspect)" /> Satisfacción Cliente
          </span>
          <strong className="kpi-value" style={{ color: 'var(--status-inspect)' }}>
            {satisfaction.toFixed(1)}%
          </strong>
          <span className="kpi-subtitle">Calificación promedio del servicio</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <Wrench size={16} color="var(--accent-indigo)" /> OTs Activas
          </span>
          <strong className="kpi-value" style={{ color: 'var(--accent-indigo)' }}>
            {activeCount}
          </strong>
          <span className="kpi-subtitle">Vehículos en andenes / taller</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">
            <Package size={16} color="var(--accent-purple)" /> Valor Bodega
          </span>
          <strong className="kpi-value" style={{ color: 'var(--accent-purple)' }}>
            ${totalPhysicalValue.toLocaleString()}
          </strong>
          <span className="kpi-subtitle">Stock Virtual: ${totalVirtualValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Graphs & Alerts */}
      <div className="grid-2col">
        {/* Graph Card: Revenue Trend */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">
              <TrendingUp size={18} color="var(--accent-blue)" /> Tendencia de Ventas (Últimos 120 Días)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Valores en Pesos</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Custom SVG Line Chart */}
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 400 160" width="100%" height="150" style={{ overflow: 'visible' }}>
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                  const y = 20 + (1 - val) * 110;
                  return (
                    <g key={idx}>
                      <line x1={40} y1={y} x2={380} y2={y} stroke="rgba(15,23,42,0.05)" strokeDasharray="3,3" />
                      <text x={34} y={y + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                        ${Math.round((val * maxRevenue) / 1000000)}M
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {periods.map((p, idx) => {
                  const x = 70 + idx * 85;
                  const hRevenue = (p.revenue / maxRevenue) * 110;
                  const hCost = (p.cost / maxRevenue) * 110;
                  
                  return (
                    <g key={idx}>
                      {/* Cost Bar (Dark Grey) */}
                      <rect 
                        x={x} 
                        y={130 - hCost} 
                        width="18" 
                        height={Math.max(2, hCost)} 
                        fill="var(--text-muted)" 
                        rx="3" 
                        opacity="0.3"
                      />
                      {/* Revenue Bar (Blue) */}
                      <rect 
                        x={x + 22} 
                        y={130 - hRevenue} 
                        width="18" 
                        height={Math.max(2, hRevenue)} 
                        fill="var(--accent-blue)" 
                        rx="3"
                      />
                      {/* X Label */}
                      <text x={x + 20} y={146} fill="var(--text-secondary)" fontSize="8" textAnchor="middle" fontWeight="bold">
                        {p.label}
                      </text>
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1={40} y1={130} x2={380} y2={130} stroke="var(--text-muted)" strokeWidth="1.2" />
                <line x1={40} y1={20} x2={40} y2={130} stroke="var(--text-muted)" strokeWidth="1.2" />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--accent-blue)', borderRadius: '3px' }}></div>
                <span style={{ fontWeight: '600' }}>Ingresos Brutos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--text-muted)', opacity: '0.4', borderRadius: '3px' }}></div>
                <span style={{ fontWeight: '600' }}>Costos Operacionales (Fijos + Repuestos)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Alerts & WIP list */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="section-header">
            <h3 className="section-title">
              <AlertTriangle size={18} color="var(--status-inspect)" /> Alertas de Abastecimiento Crítico
            </h3>
            <span className="badge-status inspect">{lowStockParts.length} Repuestos en Mínimo</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
            {lowStockParts.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ✅ Stock óptimo. Todos los repuestos superan el stock de reorden.
              </div>
            ) : (
              lowStockParts.slice(0, 5).map(part => (
                <div 
                  key={part.sku} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{part.name}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      SKU: {part.sku} | Mínimo Sugerido: {part.minStock} unidades
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--status-replace)', background: 'rgba(239, 68, 68, 0.08)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                      Stock: {part.stockFisico} un
                    </span>
                    {part.stockVirtual > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                        En tránsito: {part.stockVirtual} un
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            className="premium-btn active" 
            style={{ width: '100%', padding: '10px' }}
            onClick={() => setCurrentTab('inventory')}
          >
            Ir a Control de Bodega Dual
          </button>
        </div>
      </div>

      {/* active OTs overview */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">
            <BarChart3 size={18} color="var(--accent-indigo)" /> Vista Rápida del Flujo de Trabajo Taller
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Estado de las OTs activas</span>
        </div>

        <div className="grid-3col" style={{ gap: '16px' }}>
          {/* Presupuesto */}
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              <span>1. Presupuestos</span>
              <span style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                {activeOTs.filter(o => o.status === 'Presupuesto').length}
              </span>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {activeOTs.filter(o => o.status === 'Presupuesto').slice(0, 3).map(ot => (
                <div key={ot.id} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-glass)' }}>
                  <strong>{ot.id}</strong> | {ot.clientName}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ot.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Esperando Repuestos */}
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              <span>2. Espera Repuestos</span>
              <span style={{ background: 'rgba(2, 132, 199, 0.08)', color: 'var(--accent-blue)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                {activeOTs.filter(o => o.status === 'EsperandoRepuestos').length}
              </span>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {activeOTs.filter(o => o.status === 'EsperandoRepuestos').slice(0, 3).map(ot => (
                <div key={ot.id} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-glass)' }}>
                  <strong>{ot.id}</strong> | {ot.clientName}
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 'bold', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} /> Esperando entrega...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* En Ejecución */}
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              <span>3. En Ejecución</span>
              <span style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--status-operational)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                {activeOTs.filter(o => o.status === 'EnEjecucion').length}
              </span>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {activeOTs.filter(o => o.status === 'EnEjecucion').slice(0, 3).map(ot => (
                <div key={ot.id} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-glass)' }}>
                  <strong>{ot.id}</strong> | {ot.vehicleLabel}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Progreso:</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>
                      {Math.round((ot.laborHoursReal / ot.laborHoursTarget) * 100)}%
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
