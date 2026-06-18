import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Play,
  Square,
  Settings,
  Wrench,
  ShieldAlert,
  Cpu,
  Layers,
  TrendingUp,
  HelpCircle,
  Terminal as TerminalIcon,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import AssemblyLine3D from './components/AssemblyLine3D';
import OeeCalculator from './components/OeeCalculator';
import IshikawaFishbone from './components/IshikawaFishbone';

const App = () => {
  const [activeTab, setActiveTab] = useState('twin'); // 'twin', 'oee', 'ishikawa'
  const [lineState, setLineState] = useState(null);
  const [oeeMetrics, setOeeMetrics] = useState(null);
  const [downtimeLogs, setDowntimeLogs] = useState([]);

  const [simulationActive, setSimulationActive] = useState(false);
  const [activeEvent, setActiveEvent] = useState('NORMAL');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showDocentePanel, setShowDocentePanel] = useState(false);

  // Imaginary budget/credits for improvements
  const [credits, setCredits] = useState(1500);
  const [terminalLogs, setTerminalLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      text: 'PLC Virtual inicializado. Listo para recibir telemetría.'
    },
    {
      time: new Date().toLocaleTimeString(),
      text: 'Tableros de control SCADA en escucha en puerto local 20013.'
    }
  ]);

  const socketRef = useRef(null);

  // Helper to add terminal log messages
  const addLog = (text) => {
    setTerminalLogs((prev) => [
      { time: new Date().toLocaleTimeString(), text },
      ...prev.slice(0, 15) // Keep last 15 logs
    ]);
  };

  // Fetch initial system states
  const fetchInitialData = async () => {
    try {
      const resState = await fetch('/api/manufacturing/state');
      if (resState.ok) {
        const data = await resState.json();
        setLineState(data);
        if (data) {
          setActiveEvent(data.activeEvent);
        }
      }

      const resOee = await fetch('/api/manufacturing/oee');
      if (resOee.ok) {
        const data = await resOee.json();
        setOeeMetrics(data);
      }

      const resLogs = await fetch('/api/manufacturing/downtime');
      if (resLogs.ok) {
        const data = await resLogs.json();
        setDowntimeLogs(data);
      }

      const resSim = await fetch('/api/manufacturing/simulation/status');
      if (resSim.ok) {
        const data = await resSim.json();
        setSimulationActive(data.simulationActive);
      }
    } catch (err) {
      console.error('Error fetching initial SCADA data:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Setup Websocket connection
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;

    socket.on('connect', () => {
      addLog('Enlace WebSocket establecido con el servidor api-arquimedes.');
    });

    socket.on('disconnect', () => {
      addLog('Conexión perdida con el servidor de telemetría.');
    });

    // Handle incoming telemetry events
    socket.on('manufacturing-telemetry-update', (data) => {
      const {
        stepResult,
        lineState: newLineState,
        oeeMetrics: newOee,
        downtimeLogs: newDowntime
      } = data;

      setLineState(newLineState);
      setOeeMetrics(newOee);
      setDowntimeLogs(newDowntime);

      // Update selected machine reference if open
      if (selectedMachine) {
        const refreshed = newLineState?.machines?.find((m) => m.id === selectedMachine.id);
        if (refreshed) {
          setSelectedMachine(refreshed);
        }
      }

      // Add feedback log
      if (stepResult?.defectsFound > 0) {
        addLog(
          `PLC SENSOR: Lote ${stepResult.batchId.substring(0, 5)} reporta ${stepResult.defectsFound} pieza defectuosa (Scrap).`
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedMachine]);

  // Handle simulation start/stop (Teacher action or general control)
  const toggleSimulationState = async () => {
    try {
      const nextActive = !simulationActive;
      const res = await fetch('/api/manufacturing/simulation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive })
      });
      if (res.ok) {
        setSimulationActive(nextActive);
        addLog(`Servidor de PLC: Simulación ${nextActive ? 'ACTIVADA' : 'DETENIDA'}.`);
      }
    } catch (err) {
      addLog('Error al cambiar el estado de la simulación.');
    }
  };

  // Handle event injection (Teacher action)
  const injectEvent = async (eventCode) => {
    try {
      const res = await fetch('/api/manufacturing/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventCode })
      });
      if (res.ok) {
        setActiveEvent(eventCode);
        addLog(`Docente ha inyectado evento: [${eventCode}].`);
      }
    } catch (err) {
      addLog('Error al inyectar evento.');
    }
  };

  // Student upgrade machine (Preventative Maintenance)
  const handleUpgradeMachine = async (machineId) => {
    const cost = 250;
    if (credits < cost) {
      addLog('Recursos insuficientes para mantenimiento preventivo (Costo: 250 créditos).');
      return;
    }

    try {
      const res = await fetch('/api/manufacturing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId })
      });

      if (res.ok) {
        setCredits((prev) => prev - cost);
        addLog(
          `INTERVENCIÓN MEJORA: Aplicado mantenimiento preventivo a máquina. Probabilidad de paradas reducida.`
        );

        // Refresh local view
        fetchInitialData();
      }
    } catch (err) {
      addLog('Error al aplicar mejora.');
    }
  };

  // Student Balance Line (Robotic Arm Cycle Optimization)
  const handleBalanceLine = async () => {
    const cost = 500;
    const isCurrentlyBalanced = lineState?.lineBalanced || false;
    const nextBalanced = !isCurrentlyBalanced;

    if (nextBalanced && credits < cost) {
      addLog('Recursos insuficientes para balancear la línea (Costo: 500 créditos).');
      return;
    }

    try {
      const res = await fetch('/api/manufacturing/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: nextBalanced })
      });

      if (res.ok) {
        if (nextBalanced) {
          setCredits((prev) => prev - cost);
          addLog(
            `INTERVENCIÓN MEJORA: Línea Balanceada. Reasignación de carga robótica reduce el cuello de botella a 6.0s.`
          );
        } else {
          addLog(`INTERVENCIÓN MEJORA: Línea Desbalanceada. Regreso a la configuración inicial.`);
        }

        // Refresh local view
        fetchInitialData();
      }
    } catch (err) {
      addLog('Error al balancear la línea.');
    }
  };

  return (
    <div className="scada-container">
      {/* SCADA TOP HEADER */}
      <div className="scada-header">
        <div>
          <h1 className="text-2xl m-0 flex items-center font-bold">
            <Cpu className="text-cyan-400 mr-2 animate-pulse" />
            HMI CONSOLE - CELDA DE MANUFACTURA 4.0
          </h1>
          <p className="text-xxs font-mono text-slate-500 tracking-wider">
            SISTEMA DE MONITOREO Y OPTIMIZACIÓN DE PROCESOS LEAN & SEIS SIGMA
          </p>
        </div>

        {/* Right Header info */}
        <div className="flex items-center space-x-3">
          {/* Budget indicator */}
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 font-mono">
            <span className="text-xxs text-slate-500">CRÉDITOS MEJORA:</span>
            <span className="text-xs font-bold text-amber-400">{credits} CR</span>
          </div>

          {/* Teacher Console Toggle */}
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

      {/* DOCENTE SIMULATOR CONTROL (Injected fault console) */}
      {showDocentePanel && (
        <div className="mb-6 p-4 rounded-xl border docente-alert flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold docente-title flex items-center">
              <ShieldAlert className="mr-1.5" size={14} />
              CONSOLA DEL INSTRUCTOR - EVENTOS VIRTUALES
            </span>
            <span className="text-xxs font-mono text-slate-400 italic">
              * Inyecta variables de fallas para evaluar las respuestas de los estudiantes
            </span>
          </div>

          <div className="grid grid-cols-1 md_grid-cols-4 gap-3">
            {/* Play / Stop Simulation */}
            <button
              onClick={toggleSimulationState}
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
              onClick={() => injectEvent('NORMAL')}
              className={`docente-btn py-2 px-3 rounded ${activeEvent === 'NORMAL' ? 'active' : ''}`}
            >
              Simulación Normal
            </button>

            {/* Falla Materia Prima */}
            <button
              onClick={() => injectEvent('RAW_MATERIAL_DEFECT')}
              className={`docente-btn py-2 px-3 rounded ${activeEvent === 'RAW_MATERIAL_DEFECT' ? 'active' : ''}`}
            >
              Inyectar Fallas Materia Prima (Scrap/Calidad)
            </button>

            {/* Descalibración CNC */}
            <button
              onClick={() => injectEvent('MACHINE_DECALIBRATION')}
              className={`docente-btn py-2 px-3 rounded ${activeEvent === 'MACHINE_DECALIBRATION' ? 'active' : ''}`}
            >
              Descalibración CNC (Rendimiento/Velocidad)
            </button>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6 space-x-1">
        <button
          onClick={() => setActiveTab('twin')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'twin'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-200'
          }`}
        >
          <Layers size={14} />
          <span>LÍNEA DE PRODUCCIÓN</span>
        </button>

        <button
          onClick={() => setActiveTab('oee')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'oee'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-200'
          }`}
        >
          <TrendingUp size={14} />
          <span>CÁLCULO OEE Y SEIS SIGMA</span>
        </button>

        <button
          onClick={() => setActiveTab('ishikawa')}
          className={`flex-grow py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center space-x-2 ${
            activeTab === 'ishikawa'
              ? 'bg-slate-950 border border-cyan-500/20 text-cyan-400 shadow'
              : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-200'
          }`}
        >
          <HelpCircle size={14} />
          <span>ANÁLISIS CAUSA RAÍZ (ISHIKAWA)</span>
        </button>
      </div>

      {/* CENTRAL SCADA WORKSPACE */}
      <div className="flex-grow">
        {activeTab === 'twin' && (
          <div className="grid grid-cols-1 lg_grid-cols-12 gap-6">
            {/* Left 3D Screen */}
            <div className="lg_col-span-8 flex flex-col space-y-4">
              <AssemblyLine3D
                lineState={lineState}
                onSelectMachine={setSelectedMachine}
                selectedMachineId={selectedMachine?.id}
              />

              {/* Machine Cards list view */}
              <div className="grid grid-cols-2 md_grid-cols-4 gap-3 font-mono text-xxs">
                {lineState?.machines?.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMachine(m)}
                    className={`p-2.5 bg-slate-900 border rounded-lg cursor-pointer transition flex flex-col justify-between ${
                      selectedMachine?.id === m.id
                        ? 'border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-450 font-bold">ESTACIÓN {m.sequenceOrder}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          m.status === 'OPERATIONAL'
                            ? 'bg-emerald-500'
                            : m.status === 'DEGRADED'
                              ? 'bg-amber-500'
                              : 'bg-red-500 animate-pulse'
                        }`}
                      />
                    </div>
                    <div className="text-slate-200 font-bold mb-2 truncate">{m.type}</div>
                    <div className="flex justify-between text-slate-500">
                      <span>Ciclo:</span>
                      <span className="text-slate-350">{m.currentCycleTime}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Control & Telemetry Panel */}
            <div className="lg_col-span-4 flex flex-col space-y-4">
              {/* Machine Inspector (Placa de Datos) */}
              {selectedMachine ? (
                <div className="p-4 rounded-xl border data-plate flex flex-col space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-cyan-400">
                      PLACA DE DATOS DE MAQUINARIA
                    </span>
                    <button
                      onClick={() => setSelectedMachine(null)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      [Cerrar]
                    </button>
                  </div>

                  <div className="space-y-2 text-xxs">
                    <div className="flex justify-between">
                      <span className="text-slate-450">ID Nodo:</span>
                      <span className="text-slate-200 select-all">
                        {selectedMachine.id.substring(0, 18)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Tipo Estación:</span>
                      <span className="text-slate-200 font-bold">{selectedMachine.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Orden Secuencial:</span>
                      <span className="text-slate-200">
                        Estación #{selectedMachine.sequenceOrder}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">T. Ciclo Nominal:</span>
                      <span className="text-slate-200 font-bold">
                        {selectedMachine.nominalCycleTime.toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">T. Ciclo Actual:</span>
                      <span className="text-slate-200 font-bold text-cyan-400">
                        {selectedMachine.currentCycleTime.toFixed(2)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Temperatura Motor:</span>
                      <span
                        className={`font-bold ${selectedMachine.temperature > 65 ? 'text-rose-450' : 'text-slate-200'}`}
                      >
                        {selectedMachine.temperature.toFixed(1)} °C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Tasa Consumo Energía:</span>
                      <span className="text-slate-200">
                        {selectedMachine.energyRate.toFixed(3)} kW/h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Preventive Maintenance:</span>
                      <span className="flex items-center">
                        {selectedMachine.upgraded ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <ShieldCheck size={10} className="mr-1" /> Activo (Planificado)
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No Aplicado</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-3 flex flex-col space-y-2">
                    <button
                      onClick={() => handleUpgradeMachine(selectedMachine.id)}
                      disabled={selectedMachine.upgraded}
                      className="w-full bg-slate-950 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:hover:border-cyan-500/30 disabled:hover:text-cyan-400 py-1.5 rounded text-xxs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <Wrench size={12} />
                      <span>APLICAR MANTENIMIENTO PREVENTIVO (Costo: 250 CR)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/40 text-center text-slate-500 font-mono text-xxs h-44 flex flex-col items-center justify-center space-y-2">
                  <Cpu size={24} className="text-slate-650" />
                  <p>
                    Selecciona una máquina en el plano para desplegar su instrumentación telemétrica
                    y opciones de mejora preventivas.
                  </p>
                </div>
              )}

              {/* Assembly Line Balancing Controls */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col space-y-3 font-mono">
                <span className="text-xs font-bold text-slate-100 flex items-center">
                  <Settings size={14} className="text-cyan-500 mr-1.5" />
                  INTERVENCIONES LEAN: BALANCEO DE LÍNEA
                </span>
                <p className="text-xxs text-slate-500 leading-relaxed">
                  Reasigna las tareas de carga del brazo robótico (Estación 3) para equilibrar los
                  tiempos de ciclo. Costo único de 500 créditos.
                </p>

                <div className="flex justify-between items-center text-xxs">
                  <span className="text-slate-450">Estado Balanceo:</span>
                  {lineState?.lineBalanced ? (
                    <span className="text-emerald-400 font-bold flex items-center">
                      <UserCheck size={11} className="mr-1" /> BALANCEADO
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      DESEQUILIBRADO (Cuello de Botella)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleBalanceLine}
                  className="w-full bg-slate-950 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 py-1.5 rounded text-xxs font-bold transition"
                >
                  {lineState?.lineBalanced
                    ? 'Desactivar Balanceo'
                    : 'Equilibrar Carga Estación 3 (Costo: 500 CR)'}
                </button>
              </div>

              {/* SCADA System Live event feed */}
              <div className="flex flex-col space-y-2">
                <span className="text-xxs font-bold font-mono text-slate-450 tracking-wider flex items-center">
                  <TerminalIcon size={12} className="text-cyan-500 mr-1" />
                  BITÁCORA DE PLC VIRTUAL
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

        {activeTab === 'oee' && <OeeCalculator oeeData={oeeMetrics} />}

        {activeTab === 'ishikawa' && <IshikawaFishbone />}
      </div>

      {/* Down Table: Downtime Log (Tiempos Muertos) */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono">
        <h3 className="text-xs font-bold text-slate-100 tracking-wider mb-4 uppercase">
          Registro Histórico de Paradas de Maquinaria (Downtime Logs)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xxs text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="py-2 text-left">ESTACIÓN / MÁQUINA</th>
                <th className="py-2 text-left">CÓDIGO DE FALLA (REASON CODE)</th>
                <th className="py-2 text-left">DURACIÓN SIMULADA</th>
                <th className="py-2 text-left">TIMESTAMP DETECCION</th>
              </tr>
            </thead>
            <tbody>
              {downtimeLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                  <td className="py-2.5 font-bold text-slate-200">{log.machineType}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 bg-red-950 border border-red-900 rounded text-red-300">
                      {log.reasonCode}
                    </span>
                  </td>
                  <td className="py-2.5 text-cyan-400 font-bold">
                    {log.durationSecs} seg (aprox {(log.durationSecs / 60).toFixed(1)} mins)
                  </td>
                  <td className="py-2.5 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {downtimeLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-600">
                    No se han registrado paradas o caídas de tensión en las máquinas de la celda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
