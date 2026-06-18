import React from 'react';
import { Layers } from 'lucide-react';

const HotelMap3D = ({ rooms, reservations, onSelectRoom, selectedRoomNumber }) => {
  const floors = [3, 2, 1]; // From top floor to bottom floor

  const getRoomStatus = (roomNum, roomData) => {
    const isOccupied = reservations.some(
      (res) => res.room?.roomNumber === roomNum && res.status === 'CHECKED_IN'
    );
    if (isOccupied) return 'OCCUPIED';
    return roomData?.status || 'CLEAN';
  };

  const statusColors = {
    DIRTY: { bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444', text: '#b91c1c', label: 'SUCIA' },
    CLEAN: { bg: 'rgba(234, 179, 8, 0.08)', border: '#eab308', text: '#a16207', label: 'LIMPIA' },
    INSPECTED: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: '#10b981',
      text: '#047857',
      label: 'INSPECCIONADA'
    },
    OCCUPIED: {
      bg: 'rgba(59, 130, 246, 0.08)',
      border: '#3b82f6',
      text: '#1d4ed8',
      label: 'OCUPADA'
    },
    OUT_OF_ORDER: {
      bg: 'rgba(148, 163, 184, 0.08)',
      border: '#64748b',
      text: '#475569',
      label: 'F/S'
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-white p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <Layers className="text-blue-500" size={18} />
          <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">
            Plano 2D de Habitaciones - Monitoreo de Pisos
          </span>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-2 text-xxxxs font-bold">
          {Object.entries(statusColors).map(([status, config]) => (
            <div
              key={status}
              className="flex items-center px-2 py-1 rounded border"
              style={{
                backgroundColor: config.bg,
                color: config.text,
                borderColor: config.border
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: config.border }}
              ></span>
              {config.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5 flex-grow justify-center">
        {floors.map((floor) => (
          <div key={floor} className="flex flex-col gap-2">
            <div className="text-xxs font-bold text-slate-500 tracking-wider">
              {floor === 3
                ? 'PISO 3 - SUITES'
                : floor === 2
                  ? 'PISO 2 - DELUXE'
                  : 'PISO 1 - STANDARD'}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, index) => {
                const roomNum = `${floor}0${index + 1}`;
                const roomData = rooms.find((r) => r.roomNumber === roomNum);
                const status = getRoomStatus(roomNum, roomData);
                const config = statusColors[status] || statusColors.CLEAN;
                const isSelected = selectedRoomNumber === roomNum;

                return (
                  <div
                    key={roomNum}
                    onClick={() => onSelectRoom(roomNum)}
                    className="cursor-pointer p-3 rounded-lg border text-center flex flex-col justify-between items-center gap-1 transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: config.bg,
                      borderColor: isSelected ? '#0ea5e9' : config.border,
                      borderWidth: isSelected ? '2px' : '1px',
                      boxShadow: isSelected ? '0 0 10px rgba(14, 165, 233, 0.2)' : 'none'
                    }}
                  >
                    <span className="text-xs font-bold text-slate-800">{roomNum}</span>
                    <span
                      className="text-xxxxs font-extrabold uppercase px-1 rounded"
                      style={{ color: config.text }}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelMap3D;
