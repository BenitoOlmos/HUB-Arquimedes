import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Play,
  Square,
  Settings,
  UserPlus,
  ShieldAlert,
  Cpu,
  Layers,
  TrendingUp,
  HelpCircle,
  Terminal as TerminalIcon,
  ShieldCheck,
  UserCheck,
  Star,
  Users
} from 'lucide-react';
import HotelMap3D from './components/HotelMap3D';
import RevenueDashboard from './components/RevenueDashboard';
import TapeChart from './components/TapeChart';
import HousekeepingPanel from './components/HousekeepingPanel';

const App = () => {
  const [activeTab, setActiveTab] = useState('twin'); // 'twin', 'tape', 'housekeeping', 'revenue', 'reviews'
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [pickupCurve, setPickupCurve] = useState([]);
  const [rules, setRules] = useState([]);

  const [simulationActive, setSimulationActive] = useState(false);
  const [activeEvent, setActiveEvent] = useState('NORMAL');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDocentePanel, setShowDocentePanel] = useState(false);
  const [activeCrisis, setActiveCrisis] = useState(null);

  const [budgetCredits, setBudgetCredits] = useState(1500);
  const [reputationScore, setReputationScore] = useState(7.8);
  const [overbookingLimitPercent, setOverbookingLimitPercent] = useState(5);

  const [terminalLogs, setTerminalLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      text: 'Sistema PMS virtualizado y en escucha en puerto local 20014.'
    },
    {
      time: new Date().toLocaleTimeString(),
      text: 'Base de datos de reservas on-the-books cargada exitosamente.'
    }
  ]);

  const socketRef = useRef(null);

  const addLog = (text) => {
    setTerminalLogs((prev) => [
      { time: new Date().toLocaleTimeString(), text },
      ...prev.slice(0, 15)
    ]);
  };

  const fetchInitialData = async () => {
    try {
      const resRooms = await fetch('/api/pms/rooms');
      if (resRooms.ok) {
        const data = await resRooms.json();
        setRooms(data);
      }

      const resReservations = await fetch('/api/pms/reservations');
      if (resReservations.ok) {
        const data = await resReservations.json();
        setReservations(data);
      }

      const resReviews = await fetch('/api/pms/reviews');
      if (resReviews.ok) {
        const data = await resReviews.json();
        setReviews(data);
      }

      const resKpis = await fetch('/api/revenue/kpis');
      if (resKpis.ok) {
        const data = await resKpis.json();
        setKpis(data);
      }

      const resPickup = await fetch('/api/revenue/pickup');
      if (resPickup.ok) {
        const data = await resPickup.json();
        setPickupCurve(data);
      }

      const resRules = await fetch('/api/revenue/rules');
      if (resRules.ok) {
        const data = await resRules.json();
        setRules(data);
      }

      const resSim = await fetch('/api/pms/simulation/status');
      if (resSim.ok) {
        const data = await resSim.json();
        setSimulationActive(data.simulationActive);
        setActiveEvent(data.activeEvent);
        setBudgetCredits(data.budgetCredits);
        setReputationScore(data.reputationScore);
        setActiveCrisis(data.activeCrisis);
      }

      const resLimit = await fetch('/api/revenue/overbook/limit');
      if (resLimit.ok) {
        const data = await resLimit.json();
        setOverbookingLimitPercent(data.overbookingLimitPercent);
      }
    } catch (err) {
      console.error('Error fetching initial PMS data:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Setup WebSockets
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;

    socket.on('connect', () => {
      addLog('Enlace de telemetría de pisos y reservas (PMS) conectado.');
    });

    socket.on('disconnect', () => {
      addLog('Conexión perdida con la consola central.');
    });

    socket.on('hospitality-telemetry-update', (data) => {
      const {
        rooms: newRooms,
        reservations: newRes,
        reviews: newRev,
        kpis: newKpis,
        activeCrisis: newCrisis,
        budgetCredits: newBudget,
        reputationScore: newRep
      } = data;

      setRooms(newRooms);
      setReservations(newRes);
      setReviews(newRev);
      setKpis(newKpis);
      setActiveCrisis(newCrisis);
      setBudgetCredits(newBudget);
      setReputationScore(newRep);

      // Add feedback log
      addLog('PLC PISOS: Actualización de telemetría de habitaciones y ocupación recibida.');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSelectRoom = (roomNum) => {
    setSelectedRoomNumber(roomNum);
    const room = rooms.find((r) => r.roomNumber === roomNum);
    setSelectedRoom(room);
  };

  // Checkin action
  const handleCheckIn = async (reservationId, roomId) => {
    try {
      const res = await fetch('/api/pms/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, roomId })
      });
      if (res.ok) {
        addLog(`RECEPCIÓN: Check-in completado exitosamente.`);
        fetchInitialData();
      } else {
        const err = await res.json();
        addLog(`ERROR RECEPCIÓN: ${err.error}`);
      }
    } catch (err) {
      addLog('Error al realizar check-in.');
    }
  };

  // Checkout action
  const handleCheckOut = async (reservationId) => {
    try {
      const res = await fetch('/api/pms/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId })
      });
      if (res.ok) {
        addLog(`RECEPCIÓN: Check-out completado. Habitación marcada como sucia.`);
        fetchInitialData();
      }
    } catch (err) {
      addLog('Error al realizar check-out.');
    }
  };

  // Housekeeping task assign
  const handleAssignHousekeeping = async (taskId, housekeeperName) => {
    try {
      const res = await fetch('/api/pms/housekeeping/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, housekeeperName })
      });
      if (res.ok) {
        addLog(`PISOS: Tarea asignada a ${housekeeperName}.`);
        fetchInitialData();
      }
    } catch (err) {
      addLog('Error al asignar tarea.');
    }
  };

  // Housekeeping task complete
  const handleCompleteHousekeeping = async (taskId) => {
    try {
      const res = await fetch('/api/pms/housekeeping/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        addLog(`PISOS: Habitación limpia e inspeccionada.`);
        fetchInitialData();
      }
    } catch (err) {
      addLog('Error al completar tarea.');
    }
  };

  // Yield rules update
  const handleUpdateRules = async (updatedRules) => {
    try {
      const res = await fetch('/api/revenue/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: updatedRules })
      });
      if (res.ok) {
        setRules(updatedRules);
        addLog('REVENUE: Reglas dinámicas de tarifas actualizadas en el motor.');
      }
    } catch (err) {
      addLog('Error al actualizar tarifas.');
    }
  };

  // Overbooking limit update
  const handleUpdateOverbook = async (val) => {
    try {
      const res = await fetch('/api/revenue/overbook/limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitPercent: val })
      });
      if (res.ok) {
        setOverbookingLimitPercent(val);
        addLog(`REVENUE: Límite de overventa fijado en ${val}%.`);
      }
    } catch (err) {
      addLog('Error al actualizar sobreventa.');
    }
  };

  // Submit crisis decision
  const handleCrisisDecision = async (idx) => {
    try {
      const res = await fetch('/api/pms/crisis/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionIndex: idx })
      });
      if (res.ok) {
        const data = await res.json();
        setBudgetCredits(data.budgetCredits);
        setReputationScore(data.reputationScore);
        setActiveCrisis(null);
        addLog('RECEPCIÓN: Decisión de crisis registrada. Satisfacción/presupuesto actualizados.');
        fetchInitialData();
      }
    } catch (err) {
      addLog('Error al registrar decisión.');
    }
  };

  // Simulation controls
  const toggleSimulation = async () => {
    try {
      const nextActive = !simulationActive;
      const res = await fetch('/api/pms/simulation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive })
      });
      if (res.ok) {
        setSimulationActive(nextActive);
        addLog(`SIMULADOR: Servidor ${nextActive ? 'ACTIVADO' : 'DETENIDO'}.`);
      }
    } catch (err) {
      addLog('Error al cambiar estado de simulación.');
    }
  };

  const setSimulationEvent = async (event) => {
    try {
      const res = await fetch('/api/pms/simulation/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event })
      });
      if (res.ok) {
        setActiveEvent(event);
        addLog(`SIMULADOR: Evento de escenario cambiado a [${event}].`);
      }
    } catch (err) {
      addLog('Error al configurar evento.');
    }
  };

  const triggerCrisis = async () => {
    try {
      const res = await fetch('/api/pms/simulation/crisis/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActiveCrisis(data);
        addLog('SIMULADOR: Crisis de recepción inyectada manualmente.');
      }
    } catch (err) {
      addLog('Error al inyectar crisis.');
    }
  };

  // Get active housekeeping tasks
  const housekeepingTasks = rooms
    .filter((r) => r.status === 'DIRTY')
    .map((r) => ({
      id: r.id,
      room: r,
      credits: r.cleaningCredits,
      assignedTo: 'Unassigned',
      status: 'PENDING'
    }));

  return (
    <div className="scada-container">
      {/* Header bar */}
      <div className="scada-header">
        <div>
          <h1 className="text-2xl m-0 flex items-center font-bold">
            <Cpu className="text-cyan-400 mr-2 animate-pulse" />
            HOSPITALITY ERP - FRONT DESK & REVENUE PMS
          </h1>
          <p className="text-xxs font-mono text-slate-500 tracking-wider">
            SISTEMA DE CONTROL OPERATIVO HOTELERO, PLANIFICACIÓN DE PISOS Y YIELD MANAGEMENT
          </p>
        </div>

        {/* PMS quick information cards */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 font-mono text-xxs">
            <span className="text-slate-500">PRESUPUESTO CAJA:</span>
            <span className="text-xs font-bold text-amber-400">${budgetCredits} USD</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 font-mono text-xxs">
            <span className="text-slate-500">REPUTACIÓN:</span>
            <span className="text-xs font-bold text-cyan-400 flex items-center">
              <Star size={12} className="text-cyan-400 mr-1 fill-current" />
              {reputationScore} / 10
            </span>
          </div>

          <button
            onClick={() => setShowDocentePanel(!showDocentePanel)}
            className={`px-3 py-1.5 rounded-lg text-xxs font-bold border transition ${
              showDocentePanel
                ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-rose-950/60'
            }`}
          >
            PANEL DOCENTE
          </button>
        </div>
      </div>

      {/* Docente controller panel */}
      {showDocentePanel && (
        <div className="mb-6 p-4 rounded-xl border docente-alert flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold docente-title flex items-center">
              <ShieldAlert className="mr-1.5" size={14} />
              CONSOLA DEL INSTRUCTOR - CRISIS HOTELERA
            </span>
            <span className="text-xxs font-mono text-slate-400 italic">
              * Cambia las tarifas de la competencia o inyecta overbookings repentinos
            </span>
          </div>

          <div className="grid grid-cols-1 md_grid-cols-4 gap-3">
            {/* Play/Pause */}
            <button
              onClick={toggleSimulation}
              className={`docente-btn py-2 px-3 rounded flex items-center justify-center space-x-1 ${
                simulationActive
                  ? 'active border-red-500 text-red-350'
                  : 'border-emerald-500 text-emerald-350'
              }`}
            >
              {simulationActive ? (
                <>
                  <Square size={12} className="mr-1 fill-current" /> Detener Simulación
                </>
              ) : (
                <>
                  <Play size={12} className="mr-1 fill-current" /> Iniciar Simulación
                </>
              )}
            </button>

            {/* Event Normal */}
            <button
              onClick={() => setSimulationEvent('NORMAL')}
              className={`docente-btn py-2 px-3 rounded ${activeEvent === 'NORMAL' ? 'active' : ''}`}
            >
              Simulación Normal
            </button>

            {/* Guerra de tarifas */}
            <button
              onClick={() => setSimulationEvent('COMPETITOR_WAR')}
              className={`docente-btn py-2 px-3 rounded ${activeEvent === 'COMPETITOR_WAR' ? 'active' : ''}`}
            >
              Guerra Tarifas Competencia (-20% ADR)
            </button>

            {/* Inyectar crisis recepción */}
            <button
              onClick={triggerCrisis}
              className="docente-btn py-2 px-3 rounded border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white"
            >
              Inyectar Queja / Crisis en Recepción
            </button>
          </div>
        </div>
      )}

      {/* Reception Crisis popup overlay */}
      {activeCrisis && (
        <div className="mb-6 p-4 rounded-xl border border-amber-800 bg-amber-950/20 flex flex-col space-y-3 font-mono text-xxs">
          <div className="flex items-center text-amber-500 font-bold text-xs">
            <ShieldAlert size={14} className="mr-2 animate-bounce" />
            CRISIS OPERACIONAL EN FRONT-DESK: {activeCrisis.title}
          </div>
          <p className="text-slate-300">{activeCrisis.description}</p>
          <div className="grid grid-cols-1 md_grid-cols-3 gap-2">
            {activeCrisis.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleCrisisDecision(idx)}
                className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-2.5 rounded text-left text-slate-350 hover:text-slate-200 transition"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6 space-x-1">
        <button
          onClick={() => setActiveTab('twin')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'twin'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40'
          }`}
        >
          <Layers size={14} />
          <span>MAPA 3D HABITACIONES</span>
        </button>

        <button
          onClick={() => setActiveTab('tape')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'tape'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40'
          }`}
        >
          <Users size={14} />
          <span>TAPE CHART (FRONT-DESK)</span>
        </button>

        <button
          onClick={() => setActiveTab('housekeeping')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'housekeeping'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40'
          }`}
        >
          <Settings size={14} />
          <span>HOUSEKEEPING (PISOS)</span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'revenue'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40'
          }`}
        >
          <TrendingUp size={14} />
          <span>REVENUE MANAGEMENT</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'reviews'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40'
          }`}
        >
          <HelpCircle size={14} />
          <span>OPINIONES DE HUÉSPEDES</span>
        </button>
      </div>

      {/* Main content viewport */}
      <div className="flex-grow">
        {activeTab === 'twin' && (
          <div className="grid grid-cols-1 lg_grid-cols-12 gap-6">
            {/* Left 3D Map */}
            <div className="lg_col-span-8 flex flex-col space-y-4">
              <HotelMap3D
                rooms={rooms}
                reservations={reservations}
                onSelectRoom={handleSelectRoom}
                selectedRoomNumber={selectedRoomNumber}
              />

              {/* Floor selector summaries */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xxs text-center">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="font-bold text-slate-400">PISO 3 (SUITES)</span>
                  <div className="text-slate-500 mt-0.5">Habitaciones 301-308</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="font-bold text-slate-400">PISO 2 (DELUXE)</span>
                  <div className="text-slate-500 mt-0.5">Habitaciones 201-208</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="font-bold text-slate-400">PISO 1 (STANDARD)</span>
                  <div className="text-slate-500 mt-0.5">Habitaciones 101-108</div>
                </div>
              </div>
            </div>

            {/* Right Room Inspector / checkin control */}
            <div className="lg_col-span-4 flex flex-col space-y-4">
              {selectedRoom ? (
                <div className="p-4 rounded-xl border data-plate flex flex-col space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-cyan-400">
                      FICHA TÉCNICA - HABITACIÓN {selectedRoom.roomNumber}
                    </span>
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      [Cerrar]
                    </button>
                  </div>

                  <div className="space-y-2 text-xxs">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Categoría:</span>
                      <span className="text-slate-200 font-bold">{selectedRoom.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Créditos Limpieza:</span>
                      <span className="text-slate-200">{selectedRoom.cleaningCredits} CR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Estado Limpieza:</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-xxxxs ${
                          selectedRoom.status === 'INSPECTED'
                            ? 'bg-green-950 text-green-300'
                            : selectedRoom.status === 'CLEAN'
                              ? 'bg-yellow-950 text-yellow-300'
                              : selectedRoom.status === 'DIRTY'
                                ? 'bg-red-950 text-red-300'
                                : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        {selectedRoom.status}
                      </span>
                    </div>
                  </div>

                  {/* Active reservation checkin/out actions */}
                  <div className="border-t border-slate-850 pt-3 flex flex-col space-y-2">
                    <span className="text-xxxxs font-bold text-slate-500 uppercase block mb-1">
                      Huéspedes Asignables (Pre-llegada)
                    </span>

                    {/* List confirmed reservations to check-in */}
                    <div className="max-height-[150px] overflow-y-auto space-y-1.5">
                      {reservations
                        .filter(
                          (res) =>
                            res.status === 'CONFIRMED' &&
                            (!res.roomId || res.roomId === selectedRoom.id)
                        )
                        .slice(0, 3)
                        .map((res) => (
                          <div
                            key={res.id}
                            className="bg-slate-950 border border-slate-850 p-2 rounded flex justify-between items-center text-xxxxs"
                          >
                            <div>
                              <span className="text-slate-350 block font-bold">
                                {res.guestName}
                              </span>
                              <span className="text-slate-500">{res.channel}</span>
                            </div>
                            <button
                              onClick={() => handleCheckIn(res.id, selectedRoom.id)}
                              disabled={selectedRoom.status !== 'INSPECTED'}
                              className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-850 text-cyan-400 px-2 py-1 rounded transition disabled:opacity-40"
                            >
                              Check-In
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Active check-out action */}
                    {reservations
                      .filter(
                        (res) => res.roomId === selectedRoom.id && res.status === 'CHECKED_IN'
                      )
                      .map((res) => (
                        <div
                          key={res.id}
                          className="bg-slate-950 border border-slate-800 p-3 rounded flex justify-between items-center text-xxxxs"
                        >
                          <div>
                            <span className="text-slate-100 block font-bold">
                              {res.guestName} (Ocupando)
                            </span>
                            <span className="text-slate-500">Salida prevista</span>
                          </div>
                          <button
                            onClick={() => handleCheckOut(res.id)}
                            className="bg-red-950 hover:bg-red-900 border border-red-900 text-red-300 px-2 py-1 rounded transition"
                          >
                            Check-Out
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/40 text-center text-slate-500 font-mono text-xxs h-44 flex flex-col items-center justify-center space-y-2">
                  <Cpu size={24} className="text-slate-650" />
                  <p>
                    Selecciona una habitación en el visor 3D para desplegar su estado de recepción y
                    realizar check-in de huéspedes.
                  </p>
                </div>
              )}

              {/* live system telemetry logs */}
              <div className="flex flex-col space-y-2">
                <span className="text-xxs font-bold font-mono text-slate-450 tracking-wider flex items-center">
                  <TerminalIcon size={12} className="text-cyan-500 mr-1" />
                  BITÁCORA PMS Y COMERCIAL (SYSTEM LOG)
                </span>
                <div className="terminal-feed">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="terminal-line">
                      <span className="terminal-timestamp">[{log.time}]</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tape' && (
          <TapeChart
            rooms={rooms}
            reservations={reservations}
            onSelectReservation={(res) => {
              // Redirect to room checkin view
              const matchingRoom = rooms.find((rm) => rm.id === res.roomId);
              if (matchingRoom) {
                handleSelectRoom(matchingRoom.roomNumber);
                setActiveTab('twin');
              }
            }}
          />
        )}

        {activeTab === 'housekeeping' && (
          <HousekeepingPanel
            tasks={housekeepingTasks}
            housekeepers={[
              {
                name: 'Andrés Silva',
                assignedCredits: rooms.filter((r) => r.status === 'DIRTY').length * 15
              },
              { name: 'Marta Díaz', assignedCredits: 0 },
              { name: 'Carlos Pizarro', assignedCredits: 0 }
            ]}
            onAssign={handleAssignHousekeeping}
            onComplete={handleCompleteHousekeeping}
          />
        )}

        {activeTab === 'revenue' && (
          <RevenueDashboard
            kpis={kpis}
            pickupCurve={pickupCurve}
            onUpdateRules={handleUpdateRules}
            initialRules={rules}
            onUpdateOverbook={handleUpdateOverbook}
            initialOverbook={overbookingLimitPercent}
          />
        )}

        {activeTab === 'reviews' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xxs space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase">
              Reseñas y Calificaciones Recientes de Huéspedes
            </h3>

            <div className="grid grid-cols-1 md_grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg space-y-2 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-400">{rev.category}</span>
                    <span className="text-amber-500 font-bold flex items-center">
                      <Star size={12} className="mr-1 fill-current" />
                      {rev.score} / 10
                    </span>
                  </div>
                  <p className="text-slate-350 italic">"{rev.comment}"</p>
                  <div className="text-xxxxs text-slate-500 text-right">
                    {new Date(rev.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
