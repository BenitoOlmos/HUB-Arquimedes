import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  CartesianGrid
} from 'recharts';
import { TrendingUp, ShoppingCart, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function ConversionFunnel({ data, kpis }) {
  if (!data || !kpis) {
    return (
      <div className="glass-card flex items-center justify-center" style={{ minHeight: '300px' }}>
        <p className="text-secondary">Cargando datos analíticos...</p>
      </div>
    );
  }

  // Color palette for the funnel stages
  const COLORS = ['#6366f1', '#3b82f6', '#10b981'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Analytics KPIs Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '50%', display: 'flex' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Conversión General</p>
            <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{kpis.conversionRate}%</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sesiones &rarr; Compra</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '50%', display: 'flex' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tasa CTR de Clics</p>
            <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{kpis.ctr}%</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vistas &rarr; Agregar</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '50%', display: 'flex' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tasa de Abandono</p>
            <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{kpis.abandonRate}%</h3>
            <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: '500' }}>Carritos perdidos</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '50%', display: 'flex' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pérdidas Quiebre Stock</p>
            <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0', color: '#f59e0b' }}>
              ${kpis.lostRevenue.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ventas no concretadas</span>
          </div>
        </div>
      </div>

      {/* Funnel Graph Card */}
      <div className="glass-card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Embudo de Conversión de Sesiones</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Flujo desde la carga de la página (Impresión) hasta el Checkout Exitoso (Compra).
            </p>
          </div>
          <div className="badge badge-info" style={{ display: 'flex', gap: '0.25rem' }}>
            <span>Total Compras: {kpis.purchases}</span>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222c48" horizontal={false} />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis 
                type="category" 
                dataKey="stage" 
                stroke="#9ca3af" 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                formatter={(value, name, props) => [
                  `${value} eventos (${props.payload.pct}% de conversión)`,
                  'Cantidad'
                ]}
              />
              <Bar dataKey="cantidad" barSize={35} radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
