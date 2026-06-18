import React from 'react';
import {
  Truck,
  ShieldCheck,
  DollarSign,
  Info,
  Award,
  Settings,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ProcurementPanel = ({ suppliers, teacherScenarios }) => {
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
            Matriz de Adquisición y Gestión de Proveedores
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Evalúe el equilibrio óptimo entre el costo de adquisición, el plazo de entrega (SLA) y
            la calidad (fiabilidad) para abastecer las órdenes de trabajo.
          </p>
        </div>
      </div>

      {/* Grid of Suppliers */}
      <div className="grid-3col">
        {suppliers.map((s) => {
          // Check scenario modifications
          const isStrike = teacherScenarios.supplierStrike && s.id === 'SUP-QUAL';
          const isDollarHigh = teacherScenarios.dollarFluctuation && s.id === 'SUP-OEM';

          const finalSla = isStrike ? s.sla + 3 : s.sla;
          const finalCostMult = isDollarHigh ? s.costMultiplier + 0.15 : s.costMultiplier;

          let supplierBadge = null;
          let badgeClass = 'operational';

          if (s.id === 'SUP-OEM') {
            supplierBadge = <Award size={14} />;
            badgeClass = 'operational';
          } else if (s.id === 'SUP-QUAL') {
            supplierBadge = <Settings size={14} />;
            badgeClass = 'inspect';
          } else {
            supplierBadge = <Truck size={14} />;
            badgeClass = 'replace';
          }

          return (
            <div
              key={s.id}
              className="supplier-card"
              style={{
                borderTop: `4px solid ${s.id === 'SUP-OEM' ? 'var(--accent-blue)' : s.id === 'SUP-QUAL' ? 'var(--status-inspect)' : 'var(--status-replace)'}`
              }}
            >
              <div
                className="supplier-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <h4 className="supplier-name" style={{ fontSize: '0.92rem' }}>
                    {s.name}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {s.id}</span>
                </div>
                <span
                  className={`badge-status ${badgeClass}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  {supplierBadge}{' '}
                  {s.id === 'SUP-OEM' ? 'Premium' : s.id === 'SUP-QUAL' ? 'Medio' : 'Económico'}
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  minHeight: '52px',
                  lineHeight: '1.4'
                }}
              >
                {s.description}
              </p>

              {/* Specs */}
              <div
                className="supplier-stats"
                style={{
                  background: 'var(--bg-primary)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div className="stat-row">
                  <span className="stat-label">Multiplicador Costo</span>
                  <strong
                    className="stat-val"
                    style={{
                      color: isDollarHigh ? 'var(--status-replace)' : 'var(--text-primary)'
                    }}
                  >
                    {Math.round(finalCostMult * 100)}% {isDollarHigh && '(Dólar +15%)'}
                  </strong>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Tiempo de Entrega (SLA)</span>
                  <strong
                    className="stat-val"
                    style={{ color: isStrike ? 'var(--status-replace)' : 'var(--text-primary)' }}
                  >
                    {finalSla === 0.1 ? '2 Horas (Turno actual)' : `${finalSla} días`}{' '}
                    {isStrike && '(Huelga +3d)'}
                  </strong>
                </div>

                <div className="stat-row" style={{ marginTop: '8px' }}>
                  <span className="stat-label">Confianza / Calidad</span>
                  <strong
                    className="stat-val"
                    style={{
                      color:
                        s.reliability >= 0.95
                          ? 'var(--status-operational)'
                          : 'var(--status-inspect)'
                    }}
                  >
                    {Math.round(s.reliability * 100)}% Aprobación
                  </strong>
                </div>

                <div className="stat-row" style={{ marginTop: '8px' }}>
                  <span className="stat-label">Riesgo de Devolución</span>
                  <strong
                    className="stat-val"
                    style={{
                      color:
                        s.reliability >= 0.95
                          ? 'var(--status-operational)'
                          : 'var(--status-replace)'
                    }}
                  >
                    {Math.round((1 - s.reliability) * 100)}% Defectos
                  </strong>
                </div>
              </div>

              {/* Status notifications from Scenario Engine */}
              {isStrike && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#b45309',
                    background: '#fef3c7',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #f59e0b',
                    fontWeight: '600'
                  }}
                >
                  ⚠️ Huelga activa de transportistas. Los envíos de este proveedor tardan 3 turnos
                  adicionales en llegar.
                </div>
              )}
              {isDollarHigh && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#b91c1c',
                    background: '#fee2e2',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #ef4444',
                    fontWeight: '600'
                  }}
                >
                  ⚠️ Devaluación cambiaría activa. El costo de repuestos originales aumentó un 15%
                  por tarifas arancelarias.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guide Rules */}
      <div className="section-card">
        <h3 className="section-title">
          <Info size={18} color="var(--accent-blue)" /> Guía Pedagógica: ¿Cómo elegir al proveedor
          correcto?
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            fontSize: '0.8rem'
          }}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <strong
              style={{
                color: 'var(--status-operational)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCircle2 size={14} /> Caso 1: Trabajo Estándar / Mantención
            </strong>
            <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Para mantenciones cíclicas con holgura de tiempo (ej. Afinamientos, cambios de aceite
              planificados), el **Proveedor Alternativo Calidad** es el ideal por su balance óptimo
              de costo y plazos.
            </span>
          </div>

          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <strong
              style={{
                color: 'var(--status-inspect)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCircle2 size={14} /> Caso 2: Clientes VIP / Flotas Críticas
            </strong>
            <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Cuando un cliente de flota comercial (como camiones mineros) exige su entrega el mismo
              día, debes evaluar el **Proveedor Genérico** (entrega en 2h). Aunque asumes un 20% de
              riesgo de pieza fallada, la entrega inmediata evita multas por atraso.
            </span>
          </div>

          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <strong
              style={{
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCircle2 size={14} /> Caso 3: Fallas Estructurales Críticas
            </strong>
            <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Para repuestos del tren de distribución, empaquetaduras de culata o computadoras de
              motor (ECU) donde una falla de repuesto provocaría daños graves al motor, se debe
              comprar **OEM (Original)**, garantizando 0% fallas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementPanel;
