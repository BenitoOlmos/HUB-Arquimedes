import React from 'react';
import { Settings } from 'lucide-react';

const AssemblyLine3D = ({ lineState, onSelectMachine, selectedMachineId }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPERATIONAL':
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          border: '#10b981',
          text: '#047857',
          badge: 'OPERATIVO'
        };
      case 'DEGRADED':
        return {
          bg: 'rgba(245, 158, 11, 0.08)',
          border: '#f59e0b',
          text: '#a16207',
          badge: 'DEGRADADO'
        };
      case 'DOWN':
        return {
          bg: 'rgba(239, 68, 68, 0.08)',
          border: '#ef4444',
          text: '#b91c1c',
          badge: 'PARADA'
        };
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.08)',
          border: '#64748b',
          text: '#475569',
          badge: 'INACTIVO'
        };
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-white p-6 flex flex-col gap-6 shadow-sm">
      {/* Top SCADA Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <Settings className="text-blue-500 animate-spin-slow" size={18} />
          <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">
            Diagrama de Flujo - Celda de Monitoreo 2D
          </span>
        </div>

        {/* Legend */}
        <div className="flex gap-2 text-xxxxs font-bold">
          <div className="flex items-center px-2 py-1 rounded border border-green-200 bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
            OPERATIVO
          </div>
          <div className="flex items-center px-2 py-1 rounded border border-amber-200 bg-amber-50 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
            DEGRADADO
          </div>
          <div className="flex items-center px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse"></span>
            PARADA
          </div>
        </div>
      </div>

      {/* Visual Conveyor Flow */}
      <div className="flex-grow flex flex-col justify-center items-center py-6">
        <div className="relative w-full max-w-2xl flex items-center justify-between">
          {/* Connecting Conveyor Line Background */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-4 bg-slate-100 border-y border-slate-200 rounded-full z-0"></div>

          {/* Conveyor rollers detail */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-slate-350"></span>
            ))}
          </div>

          {/* Machine Stations */}
          {lineState?.machines?.map((m) => {
            const config = getStatusColor(m.status);
            const isSelected = selectedMachineId === m.id;

            return (
              <div
                key={m.id}
                onClick={() => onSelectMachine(m)}
                className="relative z-10 flex flex-col items-center gap-3 cursor-pointer group"
              >
                {/* Station Card */}
                <div
                  className="w-32 p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-all duration-200 hover:-translate-y-1 bg-white"
                  style={{
                    backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.03)' : '#ffffff',
                    borderColor: isSelected ? '#0ea5e9' : config.border,
                    borderWidth: isSelected ? '2px' : '1px',
                    boxShadow: isSelected
                      ? '0 10px 20px rgba(14, 165, 233, 0.15), 0 0 0 2px rgba(14, 165, 233, 0.05)'
                      : '0 4px 6px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xxxxs font-extrabold text-slate-400">
                      ESTACIÓN {m.sequenceOrder}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: config.border,
                        boxShadow: `0 0 8px ${config.border}`
                      }}
                    />
                  </div>

                  <span className="text-xxs font-bold text-slate-800 line-clamp-1">{m.type}</span>

                  <div
                    className="text-xxxxs font-extrabold uppercase px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: config.bg,
                      color: config.text,
                      borderColor: config.border
                    }}
                  >
                    {config.badge}
                  </div>
                </div>

                {/* Flow Arrow pointing to next station */}
                {m.sequenceOrder < 4 && (
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 text-slate-400 pointer-events-none hidden md:block">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssemblyLine3D;
