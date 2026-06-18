import React from 'react';
import { Calendar, User, UserCheck } from 'lucide-react';

const TapeChart = ({ rooms, reservations, onSelectReservation }) => {
  // Generate next 10 days starting from today
  const days = [];
  const startDay = new Date();
  startDay.setHours(0, 0, 0, 0);

  for (let i = 0; i < 10; i++) {
    const day = new Date(startDay.getTime() + i * 24 * 60 * 60 * 1000);
    days.push({
      label: day.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      dateStr: day.toISOString().substring(0, 10)
    });
  }

  // Find if a room is occupied or reserved on a specific date string
  const getReservationForRoomOnDate = (roomId, dateStr) => {
    return reservations.find((res) => {
      if (res.roomId !== roomId) return false;
      const checkIn = new Date(res.checkInDate).toISOString().substring(0, 10);
      const checkOut = new Date(res.checkOutDate).toISOString().substring(0, 10);
      return (
        dateStr >= checkIn &&
        dateStr < checkOut &&
        res.status !== 'CANCELLED' &&
        res.status !== 'NO_SHOW'
      );
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono">
      <h3 className="text-sm font-semibold text-slate-100 tracking-wide mb-4 flex items-center">
        <Calendar className="text-cyan-400 mr-2" size={16} />
        TAPE CHART - CRONOGRAMA DE ASIGNACIONES (PRÓXIMOS 10 DÍAS)
      </h3>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] border border-slate-800 rounded-lg">
          {/* Header Row */}
          <div className="grid grid-cols-11 bg-slate-950/80 border-b border-slate-800 text-xxs font-bold text-slate-400">
            <div className="p-3 border-r border-slate-800 text-center font-bold">HABITACIÓN</div>
            {days.map((day, idx) => (
              <div key={idx} className="p-3 text-center border-r border-slate-850 last:border-r-0">
                {day.label}
              </div>
            ))}
          </div>

          {/* Room Rows */}
          {rooms.map((room) => (
            <div
              key={room.id}
              className="grid grid-cols-11 border-b border-slate-850 hover:bg-slate-950/10 last:border-b-0"
            >
              {/* Room label column */}
              <div className="p-2.5 border-r border-slate-800 text-center font-bold text-slate-200 flex justify-between items-center px-3 text-xxs">
                <span>{room.roomNumber}</span>
                <span className="text-slate-500 text-xxxxs">({room.category.substring(0, 3)})</span>
              </div>

              {/* Day cells columns */}
              {days.map((day, dIdx) => {
                const res = getReservationForRoomOnDate(room.id, day.dateStr);
                return (
                  <div
                    key={dIdx}
                    className="p-1.5 border-r border-slate-850 last:border-r-0 min-h-[40px] flex items-center justify-center relative group"
                  >
                    {res ? (
                      <div
                        onClick={() => onSelectReservation(res)}
                        className={`w-full h-full min-h-[30px] rounded p-1 text-xxxxs cursor-pointer flex flex-col justify-center select-none overflow-hidden transition ${
                          res.status === 'CHECKED_IN'
                            ? 'bg-blue-950 border border-blue-800 text-blue-300 shadow shadow-blue-500/10'
                            : 'bg-amber-950 border border-amber-900 text-amber-300'
                        }`}
                      >
                        <span className="font-bold truncate">{res.guestName.split(' ')[0]}</span>
                        <span className="opacity-75">{res.channel}</span>

                        {/* Tooltip detail card */}
                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 p-2.5 bg-slate-950 text-slate-300 rounded border border-slate-800 hidden group-hover:block z-30 font-mono shadow-xl text-xxs leading-relaxed">
                          <div className="font-bold text-cyan-400 mb-1 flex items-center">
                            {res.status === 'CHECKED_IN' ? (
                              <UserCheck size={10} className="mr-1" />
                            ) : (
                              <User size={10} className="mr-1" />
                            )}
                            {res.guestName}
                          </div>
                          <div>Canal: {res.channel}</div>
                          <div>Check-in: {new Date(res.checkInDate).toLocaleDateString()}</div>
                          <div>Check-out: {new Date(res.checkOutDate).toLocaleDateString()}</div>
                          <div>Monto: ${res.totalPrice}</div>
                          <div className="text-xxxxs text-slate-500 mt-1 italic">
                            Hacer clic para gestionar en Front-Desk
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-800 text-xxxxs">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex space-x-4 justify-end text-xxs text-slate-400">
        <div className="flex items-center">
          <span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-800 mr-2"></span>
          Check-in Activo
        </div>
        <div className="flex items-center">
          <span className="w-2.5 h-2.5 rounded bg-amber-950 border border-amber-900 mr-2"></span>
          Confirmada Previa
        </div>
      </div>
    </div>
  );
};

export default TapeChart;
