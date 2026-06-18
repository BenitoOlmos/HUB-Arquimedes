import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Search, HelpCircle, ArrowRight } from 'lucide-react';

const AuditDataGrid = ({ activities, onAuditSubmit }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [correctedAmount, setCorrectedAmount] = useState('');
  const [correctedUnit, setCorrectedUnit] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelper, setShowHelper] = useState(false);

  const isNoisyUnit = (unit) => ['MJ', 'Miles', 'ton-miles'].includes(unit);

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    // Search query
    const matchesSearch =
      act.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.facility?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.proofDocument?.toLowerCase().includes(searchQuery.toLowerCase());

    // Scope filter
    const matchesScope = scopeFilter === 'ALL' || act.scope === Number(scopeFilter);

    // Status filter
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ALERT' && isNoisyUnit(act.unit)) ||
      (statusFilter === 'CLEAN' && !isNoisyUnit(act.unit));

    return matchesSearch && matchesScope && matchesStatus;
  });

  const handleAuditClick = (act) => {
    setSelectedActivity(act);
    setCorrectedAmount(act.rawAmount);
    // Suggest the standard target unit to help the student
    const defaultTargetUnits = {
      ELECTRICITY: 'kWh',
      FLIGHT: 'Passenger-km',
      LOGISTICS_ROAD: 'ton-km',
      DIESEL: 'Liters',
      GASOLINE: 'Liters',
      NATURAL_GAS: 'm3'
    };
    setCorrectedUnit(defaultTargetUnits[act.category] || act.unit);
  };

  const handleAuditFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedActivity) return;
    onAuditSubmit(selectedActivity.id, correctedAmount, correctedUnit);
    setSelectedActivity(null);
  };

  // Quick unit converter helper
  const getSuggestedConversion = (act) => {
    if (act.unit === 'MJ') {
      return `Valor en kWh = ${(act.rawAmount / 3.6).toFixed(2)} (Fórmula: MJ / 3.6)`;
    }
    if (act.unit === 'Miles') {
      return `Valor en Passenger-km = ${(act.rawAmount * 1.60934).toFixed(2)} (Fórmula: Millas * 1.60934)`;
    }
    if (act.unit === 'ton-miles') {
      return `Valor en ton-km = ${(act.rawAmount * 1.45997).toFixed(2)} (Fórmula: ton-miles * 1.45997)`;
    }
    return 'Ninguna conversión sugerida (ya está en unidad estándar)';
  };

  return (
    <div className="glass-panel flex flex-col w-full h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-mono text-cyan-400 tracking-wider flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
            REGISTRO AUDITABLE DE DATOS DE ACTIVIDAD (GEI)
          </h3>
          <p className="text-xxs text-slate-400 font-mono mt-1">
            Revisa las facturas de proveedores. Las facturas marcadas con advertencia poseen errores
            de unidades.
          </p>
        </div>

        <button
          onClick={() => setShowHelper(!showHelper)}
          className="flex items-center gap-1.5 text-xxs font-mono text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded hover:bg-cyan-500/5 transition-all"
        >
          <HelpCircle size={14} />
          {showHelper ? 'Ocultar Fórmulas' : 'Ver Guía de Conversión'}
        </button>
      </div>

      {/* Conversion Guia Helper Banner */}
      {showHelper && (
        <div className="mb-4 p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-xxs font-mono text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <h5 className="text-cyan-400 font-bold mb-1">Alcance 2 (Electricidad)</h5>
            <p>1 kWh = 3.6 MJ</p>
            <p>
              Fórmula: <span className="text-white">kWh = MJ / 3.6</span>
            </p>
          </div>
          <div>
            <h5 className="text-cyan-400 font-bold mb-1">Alcance 3 (Viajes Aéreos)</h5>
            <p>1 Milla = 1.60934 km</p>
            <p>
              Fórmula: <span className="text-white">km = Millas * 1.60934</span>
            </p>
          </div>
          <div>
            <h5 className="text-cyan-400 font-bold mb-1">Alcance 3 (Logística)</h5>
            <p>1 ton-milla = 1.45997 ton-km</p>
            <p>
              Fórmula: <span className="text-white">ton-km = ton-miles * 1.45997</span>
            </p>
          </div>
        </div>
      )}

      {/* Grid Filters */}
      <div className="flex flex-col md:flex-row gap-2.5 mb-4 items-center">
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar factura por hash o planta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="custom-input pl-8 w-full font-mono text-xs"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="custom-select text-xs"
          >
            <option value="ALL">Todos los Alcances</option>
            <option value="1">Alcance 1 (Directas)</option>
            <option value="2">Alcance 2 (Red Eléctrica)</option>
            <option value="3">Alcance 3 (Cadena Valor)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="custom-select text-xs"
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="ALERT">Facturas con Alerta</option>
            <option value="CLEAN">Facturas Auditadas</option>
          </select>
        </div>
      </div>

      {/* Data Grid Table */}
      <div className="audit-table-wrapper flex-grow max-h-[350px] overflow-y-auto">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Planta / Instalación</th>
              <th>Alcance</th>
              <th>Categoría</th>
              <th>Cantidad Facturada</th>
              <th>Unidad</th>
              <th>CO2e Calculado (t)</th>
              <th>Doc. Probatorio (Factura)</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-500 font-mono">
                  No se encontraron facturas con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredActivities.map((act) => {
                const isAlert = isNoisyUnit(act.unit);
                return (
                  <tr key={act.id}>
                    <td className="font-semibold text-slate-200">
                      {act.facility?.name || 'Cargando...'}
                    </td>
                    <td className="font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xxs ${
                          act.scope === 1
                            ? 'bg-red-950 text-red-400 border border-red-900/30'
                            : act.scope === 2
                              ? 'bg-amber-950 text-amber-400 border border-amber-900/30'
                              : 'bg-purple-950 text-purple-400 border border-purple-900/30'
                        }`}
                      >
                        Alcance {act.scope}
                      </span>
                    </td>
                    <td className="font-mono text-slate-300">{act.category}</td>
                    <td className="font-mono text-white text-right">
                      {act.rawAmount.toLocaleString()}
                    </td>
                    <td className="font-mono text-slate-400">{act.unit}</td>
                    <td className="font-mono text-cyan-400 font-bold text-right">
                      {act.calculatedCo2e.toFixed(3)}
                    </td>
                    <td className="font-mono text-xxs text-slate-500">
                      {act.proofDocument || 'N/A'}
                    </td>
                    <td>
                      {isAlert ? (
                        <span className="flex items-center gap-1 text-xxs font-mono text-amber-500">
                          <span className="pulse-dot bg-amber-500"></span>
                          Unidad Errónea
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xxs font-mono text-emerald-400">
                          <CheckCircle size={10} />
                          Correcto
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleAuditClick(act)}
                        className={`text-xxs font-mono px-2 py-1 rounded transition-all ${
                          isAlert
                            ? 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        Auditar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Modal/Overlay */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-mono text-cyan-400 tracking-wider">
                  AUDITAR FACTURA: {selectedActivity.proofDocument}
                </h4>
                <p className="text-xxs text-slate-400 font-mono mt-0.5">
                  {selectedActivity.facility?.name} - {selectedActivity.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-xxs font-mono text-slate-300 flex flex-col gap-2">
              <div>
                Dato de Factura Original:{' '}
                <span className="text-white font-bold">
                  {selectedActivity.rawAmount} {selectedActivity.unit}
                </span>
              </div>
              <div>
                Factor de Emisión Vinculado:{' '}
                <span className="text-white">
                  {selectedActivity.factor?.source} - {selectedActivity.factor?.co2ePerUnit} tCO2e /{' '}
                  {selectedActivity.factor?.unit}
                </span>
              </div>
              <div className="mt-1 border-t border-slate-800 pt-2 text-cyan-400">
                Sugerencia de Conversión:{' '}
                <span className="text-slate-200 font-bold block mt-0.5">
                  {getSuggestedConversion(selectedActivity)}
                </span>
              </div>
            </div>

            <form onSubmit={handleAuditFormSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-mono text-slate-400">
                  Cantidad Auditada (Convertida)
                </label>
                <input
                  type="number"
                  step="any"
                  value={correctedAmount}
                  onChange={(e) => setCorrectedAmount(e.target.value)}
                  className="custom-input font-mono text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xxs font-mono text-slate-400">
                  Unidad Estándar Correspondiente
                </label>
                <select
                  value={correctedUnit}
                  onChange={(e) => setCorrectedUnit(e.target.value)}
                  className="custom-select text-xs font-mono"
                  required
                >
                  <option value="kWh">kWh (Electricidad)</option>
                  <option value="Passenger-km">Passenger-km (Vuelos)</option>
                  <option value="ton-km">ton-km (Logística)</option>
                  <option value="Liters">Liters (Diesel/Gasolina)</option>
                  <option value="m3">m3 (Gas Natural)</option>
                  <option value="Metric-Tons">Metric-Tons (Residuos/Plástico)</option>
                  <option value="MJ">MJ (No estándar)</option>
                  <option value="Miles">Miles (No estándar)</option>
                  <option value="ton-miles">ton-miles (No estándar)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="btn-outline-danger text-xxs py-1.5 px-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-cyan text-xxs py-1.5 px-4 flex items-center gap-1"
                >
                  Confirmar Corrección
                  <ArrowRight size={12} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDataGrid;
