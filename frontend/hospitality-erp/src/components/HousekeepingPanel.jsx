import React from 'react';
import { ShieldCheck, CheckCircle2, UserPlus, Clock } from 'lucide-react';

const HousekeepingPanel = ({ tasks, housekeepers, onAssign, onComplete }) => {
  return (
    <div className="space-y-6 font-mono text-xxs">
      {/* Staff workload credits summary */}
      <div className="grid grid-cols-1 md_grid-cols-3 gap-4">
        {housekeepers.map((hk, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xxxxs text-slate-500 uppercase font-bold">MUCAMA / STAFF</span>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{hk.name}</div>
            </div>
            <div className="text-right">
              <span className="text-xxxxs text-slate-500 uppercase font-bold">CRÉDITOS ASIGNADOS</span>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">{hk.assignedCredits} CR</div>
            </div>
          </div>
        ))}
      </div>

      {/* Housekeeping Tasks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-100 tracking-wide mb-4 flex items-center uppercase">
          <Clock className="text-cyan-400 mr-2" size={16} />
          PLANILLA DE TAREAS DE LIMPIEZA Y PISOS
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="py-2.5">HABITACIÓN</th>
                <th className="py-2.5">CATEGORÍA</th>
                <th className="py-2.5">CRÉDITOS (TIEMPO)</th>
                <th className="py-2.5">ASIGNADO A</th>
                <th className="py-2.5">ESTADO TAREA</th>
                <th className="py-2.5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                  <td className="py-3 font-bold text-slate-200">Hab. {task.room?.roomNumber || '101'}</td>
                  <td className="py-3 text-slate-450">{task.room?.category}</td>
                  <td className="py-3 text-cyan-400 font-bold">{task.credits} Créditos</td>
                  <td className="py-3">
                    {task.assignedTo === 'Unassigned' ? (
                      <span className="text-slate-550 italic">Sin asignar</span>
                    ) : (
                      <span className="text-slate-200 font-bold">{task.assignedTo}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xxxxs font-bold ${
                      task.status === 'COMPLETED' ? 'bg-emerald-950 border border-emerald-900 text-emerald-300' :
                      task.status === 'IN_PROGRESS' ? 'bg-amber-950 border border-amber-900 text-amber-300 animate-pulse' :
                      'bg-red-950 border border-red-900 text-red-300'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end space-x-1.5">
                      {/* Assignment actions */}
                      {task.status !== 'COMPLETED' && (
                        <div className="relative group inline-block">
                          <button className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-350 px-2 py-1 rounded hover:text-cyan-400 transition flex items-center space-x-1">
                            <UserPlus size={10} />
                            <span>Asignar</span>
                          </button>
                          
                          <div className="absolute right-0 bottom-full mb-1 w-36 bg-slate-950 border border-slate-850 rounded shadow-xl hidden group-hover:block z-30">
                            {housekeepers.map((hk, hIdx) => (
                              <button
                                key={hIdx}
                                onClick={() => onAssign(task.id, hk.name)}
                                className="w-full text-left px-2 py-1.5 hover:bg-slate-900 text-slate-300 hover:text-cyan-400 border-b border-slate-850 last:border-b-0"
                              >
                                {hk.name}
                              </button>
                            ))}
                            <button
                              onClick={() => onAssign(task.id, 'Unassigned')}
                              className="w-full text-left px-2 py-1.5 hover:bg-slate-900 text-slate-500 hover:text-red-400"
                            >
                              Desasignar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Completion action */}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => onComplete(task.id)}
                          className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 px-2 py-1 rounded transition flex items-center space-x-1"
                        >
                          <CheckCircle2 size={10} />
                          <span>Completar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-600 italic">
                    No hay habitaciones sucias registradas para limpieza en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Housekeeping instructions */}
      <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2 leading-relaxed text-slate-400">
        <div className="flex items-center text-amber-500 font-bold mb-1">
          <ShieldCheck size={14} className="mr-1.5" />
          INDICACIONES DE PLANIFICACIÓN LOGÍSTICA (PIES):
        </div>
        <p>1. <strong>VIP Check-in Prioritario:</strong> Las habitaciones SUITES (30 créditos) tienen un tiempo estimado de limpieza superior. Asigna mucamas eficientemente para liberar habitaciones VIP antes del check-in.</p>
        <p>2. <strong>Balance de Carga:</strong> Distribuye equitativamente la carga de créditos entre las mucamas para evitar el cobro de horas extras por turnos de limpieza excesivos.</p>
      </div>
    </div>
  );
};

export default HousekeepingPanel;
