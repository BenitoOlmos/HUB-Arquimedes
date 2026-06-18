import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  ShieldAlert,
  DollarSign,
  Percent,
  TrendingUp,
  Sliders,
  Play,
  Plus,
  Trash
} from 'lucide-react';

const RevenueDashboard = ({
  kpis,
  pickupCurve,
  onUpdateRules,
  initialRules,
  onUpdateOverbook,
  initialOverbook
}) => {
  const [rules, setRules] = useState(initialRules || []);
  const [newOccupancy, setNewOccupancy] = useState('80');
  const [newLeadTime, setNewLeadTime] = useState('30');
  const [newAdjustment, setNewAdjustment] = useState('20');

  const [overbookLimit, setOverbookLimit] = useState(initialOverbook || 5);
  const [overbookRiskData, setOverbookRiskData] = useState(null);

  useEffect(() => {
    if (initialRules) {
      setRules(initialRules);
    }
  }, [initialRules]);

  useEffect(() => {
    // Fetch overbooking risk parameters
    const fetchRisk = async () => {
      try {
        const res = await fetch(
          `/api/revenue/overbook/risk?currentOccupancy=${kpis?.occupancyRate || 75}`
        );
        if (res.ok) {
          const data = await res.json();
          setOverbookRiskData(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRisk();
  }, [overbookLimit, kpis]);

  const handleAddRule = (e) => {
    e.preventDefault();
    const updated = [
      ...rules,
      {
        id: Math.random().toString(),
        occupancyThreshold: Number(newOccupancy),
        leadTimeDays: Number(newLeadTime),
        priceAdjustmentPercent: Number(newAdjustment)
      }
    ];
    setRules(updated);
    onUpdateRules(updated);
  };

  const handleDeleteRule = (id) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    onUpdateRules(updated);
  };

  const handleOverbookChange = async (e) => {
    const val = Number(e.target.value);
    setOverbookLimit(val);
    onUpdateOverbook(val);
  };

  return (
    <div className="space-y-6">
      {/* Revenue metrics cards */}
      <div className="grid grid-cols-1 md_grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xxs text-slate-400">OCUPACIÓN</span>
              <Percent size={14} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{kpis?.occupancyRate}%</div>
          </div>
          <div className="text-xxxxs text-slate-500 mt-2">Capacidad total: 24 hab.</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xxs text-slate-400">TARIFA PROMEDIO (ADR)</span>
              <DollarSign size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">${kpis?.adr}</div>
          </div>
          <div className="text-xxxxs text-slate-500 mt-2">Average Daily Rate histórico</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xxs text-slate-400">REVPAR (ROOM REV)</span>
              <TrendingUp size={14} className="text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">${kpis?.revpar}</div>
          </div>
          <div className="text-xxxxs text-slate-500 mt-2">Rev Per Available Room</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xxs text-slate-400">GOPPAR (BENEFICIO NETO)</span>
              <DollarSign size={14} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-100">${kpis?.goppar}</div>
          </div>
          <div className="text-xxxxs text-slate-500 mt-2">Gross Operating Profit Per Room</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg_grid-cols-12 gap-6">
        {/* Pickup pace curve */}
        <div className="lg_col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide mb-4">
            RITMO DE RESERVA SEGÚN ANTICIPACIÓN (PICK-UP PACE - LEAD TIME)
          </h3>
          <div className="w-full h-64 font-mono text-xxs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pickupCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" tickLine={false} />
                <YAxis stroke="#475569" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', border: '1px solid #334155' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar
                  name="Cantidad Reservas"
                  dataKey="count"
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Ingresos Totales ($)"
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overbooking limit simulator */}
        <div className="lg_col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide mb-3">
              SIMULADOR DE OVERBOOKING (SOBREVENTA)
            </h3>
            <p className="text-xxs font-mono text-slate-400 mb-4 leading-relaxed">
              Define el porcentaje de habitaciones a sobre-vender. Una sobreventa óptima minimiza
              pérdidas por No-Shows (15% hist), pero arriesga penalidades (Walk-outs).
            </p>

            <div className="space-y-4 font-mono text-xxs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Límite de Sobreventa:</span>
                  <span className="font-bold text-amber-500">
                    {overbookLimit}% (+{overbookRiskData?.overbookedRooms} hab)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={overbookLimit}
                  onChange={handleOverbookChange}
                  className="w-full accent-amber-500 bg-slate-950"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reservas Totales:</span>
                  <span className="text-slate-200">{overbookRiskData?.totalBooked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Llegadas Esperadas:</span>
                  <span className="text-slate-200">{overbookRiskData?.expectedArrivals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Riesgo de Reubicaciones:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xxxxs ${
                      overbookRiskData?.status === 'HIGH_RISK'
                        ? 'bg-red-950 border border-red-900 text-red-300'
                        : overbookRiskData?.status === 'MODERATE_RISK'
                          ? 'bg-amber-950 border border-amber-900 text-amber-300'
                          : 'bg-emerald-950 border border-emerald-900 text-emerald-300'
                    }`}
                  >
                    {overbookRiskData?.walkoutRiskPercent}% ({overbookRiskData?.status})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {overbookRiskData?.status === 'HIGH_RISK' && (
            <div className="mt-4 p-2 bg-red-950/40 border border-red-900 text-red-350 rounded font-mono text-xxxxs flex items-center space-x-2">
              <Sliders size={14} className="animate-bounce" />
              <span>
                Advertencia: La tasa de sobreventa excede la probabilidad de No-Shows. Riesgo
                inminente de Walk-outs y caída de Reviews.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Yield Management rules panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono">
        <h3 className="text-sm font-semibold text-slate-100 tracking-wide mb-4 flex items-center">
          <Sliders className="text-cyan-400 mr-2" size={16} />
          REGLAS DE TARIFAS DINÁMICAS (YIELD MANAGEMENT)
        </h3>

        <div className="grid grid-cols-1 lg_grid-cols-12 gap-6">
          {/* Rules editor form */}
          <div className="lg_col-span-4 bg-slate-950 border border-slate-850 p-4 rounded-lg">
            <span className="text-xxs font-bold text-slate-350 block mb-3 uppercase">
              Nueva Regla de Precios
            </span>
            <form onSubmit={handleAddRule} className="space-y-3 text-xxs">
              <div>
                <label className="block text-slate-500 mb-1">Si la Ocupación supera (%):</label>
                <input
                  type="number"
                  value={newOccupancy}
                  onChange={(e) => setNewOccupancy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:border-cyan-500 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">A menos de (días del check-in):</label>
                <input
                  type="number"
                  value={newLeadTime}
                  onChange={(e) => setNewLeadTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:border-cyan-500 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Ajustar tarifa base (%):</label>
                <input
                  type="number"
                  value={newAdjustment}
                  onChange={(e) => setNewAdjustment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:border-cyan-500 text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-950 border border-cyan-800 text-cyan-400 py-2 rounded text-xxs font-bold hover:bg-cyan-900 transition flex items-center justify-center space-x-1"
              >
                <Plus size={12} />
                <span>Agregar Regla</span>
              </button>
            </form>
          </div>

          {/* Active rules list */}
          <div className="lg_col-span-8 space-y-2">
            <span className="text-xxs font-bold text-slate-350 block mb-2 uppercase">
              Reglas Activas en el Motor
            </span>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex justify-between items-center text-xxs"
                >
                  <div className="space-y-1">
                    <span className="text-slate-100 font-bold block">
                      SI Ocupación &gt; {rule.occupancyThreshold}% y Lead Time &lt;{' '}
                      {rule.leadTimeDays} días
                    </span>
                    <span className="text-emerald-400 block">
                      ENTONCES Aumentar tarifa en un {rule.priceAdjustmentPercent}%
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-red-400 hover:text-red-300 p-1.5 border border-red-900/40 rounded hover:bg-red-950/20"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))}
              {rules.length === 0 && (
                <div className="text-center py-8 text-slate-600 italic text-xxs">
                  No hay reglas dinámicas de Yield configuradas. Las tarifas del hotel se mantendrán
                  fijas.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
