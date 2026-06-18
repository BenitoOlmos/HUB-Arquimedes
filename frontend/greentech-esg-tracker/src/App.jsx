import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
  Leaf,
  Award,
  FileText,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Layers,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import SankeyEmissions from './components/SankeyEmissions';
import TreemapEmissions from './components/TreemapEmissions';
import AuditDataGrid from './components/AuditDataGrid';
import CarbonTrading from './components/CarbonTrading';
import './App.css';

// Socket connection
const socket = io('/', { path: '/socket.io' });

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [facilities, setFacilities] = useState([]);
  const [factors, setFactors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [market, setMarket] = useState([]);
  const [metrics, setMetrics] = useState({
    totalScope1: 0,
    totalScope2: 0,
    totalScope3: 0,
    totalEmissions: 0,
    targetEmissions: 175,
    offsetEmissions: 0,
    netEmissions: 0,
    budget: 350000,
    auditErrorsCount: 0,
    reputationScore: 100,
    legalFines: 0
  });

  const [circularEconomy, setCircularEconomy] = useState(false);
  const [activeEvent, setActiveEvent] = useState('NORMAL');
  const [notification, setNotification] = useState(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [facRes, facsRes, actRes, mktRes, metRes, circRes, evRes] = await Promise.all([
        fetch('/api/esg/facilities'),
        fetch('/api/esg/factors'),
        fetch('/api/esg/activities'),
        fetch('/api/esg/market'),
        fetch('/api/esg/metrics'),
        fetch('/api/esg/circular'),
        fetch('/api/esg/event')
      ]);

      const [facs, factors, acts, mkt, met, circ, ev] = await Promise.all([
        facRes.json(),
        facsRes.json(),
        actRes.json(),
        mktRes.json(),
        metRes.json(),
        circRes.json(),
        evRes.json()
      ]);

      setFacilities(facs);
      setFactors(factors);
      setActivities(acts);
      setMarket(mkt);
      setMetrics(met);
      setCircularEconomy(circ.active);
      setActiveEvent(ev.event);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to live telemetry updates
    socket.on('esg-telemetry-update', (data) => {
      setMarket(data.market);
      setMetrics(data.metrics);
    });

    return () => {
      socket.off('esg-telemetry-update');
    };
  }, []);

  const showFlashNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Audit form submit
  const handleAuditSubmit = async (activityId, correctedAmount, correctedUnit) => {
    try {
      const response = await fetch('/api/esg/activities/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, correctedAmount, correctedUnit })
      });
      const data = await response.json();
      if (data.success) {
        showFlashNotification('Factura auditada y corregida con éxito.', 'success');
        fetchData();
      } else {
        showFlashNotification(data.error || 'Error al auditar factura', 'error');
      }
    } catch (error) {
      console.error(error);
      showFlashNotification('Error al contactar al servidor', 'error');
    }
  };

  // Carbon credits purchase
  const handlePurchaseSubmit = async (projectId, tons) => {
    try {
      const response = await fetch('/api/esg/market/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, tons })
      });
      const data = await response.json();
      if (data.success) {
        showFlashNotification(data.message, 'success');
        fetchData();
      } else {
        showFlashNotification(data.error || 'Error en la compra', 'error');
      }
    } catch (error) {
      console.error(error);
      showFlashNotification('Error en la transacción', 'error');
    }
  };

  // Toggle Circular Economy design
  const handleCircularToggle = async () => {
    try {
      const nextVal = !circularEconomy;
      const response = await fetch('/api/esg/circular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextVal })
      });
      const data = await response.json();
      if (data.success) {
        setCircularEconomy(data.active);
        showFlashNotification(
          data.active
            ? 'Embalaje de plástico virgen reemplazado por cartón reciclado. Alcance 3 disminuido un 70%.'
            : 'Diseño circular desactivado. Embalaje retornado a plástico estándar.',
          'info'
        );
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Reset simulation
  const handleReset = async () => {
    try {
      const response = await fetch('/api/esg/reset', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        showFlashNotification(
          'Simulación reiniciada. Base de datos re-hidratada con ruidos originales.',
          'success'
        );
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Set teacher event
  const handleEventChange = async (event) => {
    try {
      const response = await fetch('/api/esg/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event })
      });
      const data = await response.json();
      if (data.success) {
        setActiveEvent(data.event);
        showFlashNotification(`Evento simulado activado: ${event}`, 'info');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Trigger PDF Report Download
  const handleDownloadPdf = () => {
    window.open('/api/esg/report/pdf', '_blank');
  };

  // Chart data for SBTi target comparison
  const chartData = [
    { name: '2024 Base', emisiones: 250, fill: '#64748b' },
    { name: 'SBTi Target 2025', emisiones: metrics.targetEmissions, fill: '#38bdf8' },
    { name: 'Actual Brutas', emisiones: metrics.totalEmissions, fill: '#ef4444' },
    {
      name: 'Actual Netas',
      emisiones: metrics.netEmissions,
      fill: metrics.netEmissions <= metrics.targetEmissions ? '#10b981' : '#f59e0b'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 pb-12">
      {/* Top Banner header */}
      <header className="w-full bg-[#0c1222]/85 border-b border-slate-800/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Leaf className="text-slate-950" size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold font-title text-white tracking-wide flex items-center gap-2">
              GREENTECH ESG TRACKER
              <span className="text-xxs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                GHG PROTOCOL
              </span>
            </h1>
            <p className="text-xxs font-mono text-slate-400 mt-0.5">
              SISTEMA CORPORATIVO DE AUDITORÍA Y COMPENSACIÓN DE EMISIONES
            </p>
          </div>
        </div>

        {/* Global tab nav */}
        <nav className="flex bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/60 text-xs font-mono">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded transition-all ${activeTab === 'dashboard' ? 'bg-[#00e5ff] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard SBTi
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`px-4 py-1.5 rounded transition-all ${activeTab === 'auditoria' ? 'bg-[#00e5ff] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Auditoría Invoices
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-1.5 rounded transition-all ${activeTab === 'market' ? 'bg-[#00e5ff] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Bolsa de Compensación
          </button>
        </nav>
      </header>

      {/* Floating Notifications */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center gap-2 font-mono text-xs max-w-sm transition-all duration-300 animate-slide-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/30'
              : notification.type === 'error'
                ? 'bg-red-950/90 text-red-400 border-red-500/30'
                : 'bg-cyan-950/90 text-cyan-400 border-cyan-500/30'
          }`}
        >
          <AlertTriangle size={16} />
          {notification.message}
        </div>
      )}

      {/* Main Layout body */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Corporate KPIs & SBTi targets */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel flex flex-col gap-4">
            <h3 className="text-xs font-mono text-cyan-400 tracking-wider">
              RESUMEN CO2e CORPORATIVO
            </h3>

            <div className="flex flex-col gap-2">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                <span className="text-xxs font-mono text-slate-400">Emisiones Brutas:</span>
                <span className="text-sm font-bold font-mono text-white">
                  {metrics.totalEmissions?.toFixed(1)} t
                </span>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                <span className="text-xxs font-mono text-slate-400">Compensadas:</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  -{metrics.offsetEmissions?.toFixed(1)} t
                </span>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                <span className="text-xxs font-mono text-slate-400">Emisiones Netas:</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {metrics.netEmissions?.toFixed(1)} t
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xxs font-mono text-slate-400 flex items-center gap-1">
                  Reputación Corporativa:
                </span>
                <span
                  className={`text-sm font-bold font-mono ${metrics.reputationScore >= 80 ? 'text-emerald-400' : metrics.reputationScore >= 50 ? 'text-amber-400' : 'text-red-500'}`}
                >
                  {metrics.reputationScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    metrics.reputationScore >= 80
                      ? 'bg-emerald-500'
                      : metrics.reputationScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.reputationScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Legal Compliance Box */}
          <div className="glass-panel flex flex-col gap-4">
            <h3 className="text-xs font-mono text-cyan-400 tracking-wider">
              MARCO REGULADOR & RIESGO LEGAL
            </h3>

            {metrics.auditErrorsCount > 0 ? (
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg flex items-start gap-2.5">
                <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h5 className="text-xxs font-bold text-red-400 font-mono">
                    INCUMPLIMIENTO TCFD / LEY MARCO
                  </h5>
                  <p className="text-xxs text-slate-300 font-mono mt-1">
                    Detectadas {metrics.auditErrorsCount} inconsistencias en auditoría de facturas.
                    Multa virtual acumulada:
                  </p>
                  <span className="text-xs font-bold font-mono text-red-400 mt-1 block">
                    ${metrics.legalFines?.toLocaleString()} USD
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-start gap-2.5">
                <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h5 className="text-xxs font-bold text-emerald-400 font-mono">
                    CONFORME A LA NORMATIVA
                  </h5>
                  <p className="text-xxs text-slate-300 font-mono mt-1">
                    Cero discrepancias detectadas. Inventario 100% calibrado ante entidades
                    reguladoras. Sin multas.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleDownloadPdf}
              className="btn-cyan w-full text-xxs flex items-center justify-center gap-1.5"
            >
              <FileText size={14} />
              Exportar Informe PDF
            </button>
          </div>

          {/* Product Circular Redesign Box */}
          <div className="glass-panel flex flex-col gap-4">
            <h3 className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-1">
              <Layers size={14} /> REDISEÑO CIRCULAR
            </h3>
            <p className="text-xxs text-slate-400 font-mono">
              Reemplaza el embalaje de plástico virgen por cartón reciclado en el diseño del
              producto para reducir la huella en la cadena de valor (Alcance 3).
            </p>

            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xxs font-mono text-slate-300">Embalaje Ecológico:</span>
              <button
                onClick={handleCircularToggle}
                className={`px-3 py-1.5 rounded font-mono text-xxs font-bold transition-all ${
                  circularEconomy
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {circularEconomy ? 'ACTIVADO (-70%)' : 'DESACTIVADO'}
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Main Work Panels */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gross emissions vs target chart */}
              <div className="glass-panel flex flex-col h-[380px] md:col-span-1">
                <h3 className="text-xs font-mono text-cyan-400 tracking-wider mb-4">
                  COMPORTAMIENTO ANUAL VS META SBTi
                </h3>
                <div className="flex-grow w-full">
                  <ResponsiveContainer width="100%" height="95%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: '#0c1222',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          fontSize: '10px',
                          fontFamily: 'JetBrains Mono'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      <ReferenceLine
                        y={metrics.targetEmissions}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{
                          value: 'Límite SBTi',
                          fill: '#ef4444',
                          fontSize: 8,
                          position: 'top'
                        }}
                      />
                      <Bar dataKey="emisiones" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <rect key={`rect-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Treemap breakout */}
              <div className="md:col-span-1">
                <TreemapEmissions activities={activities} facilities={facilities} />
              </div>

              {/* Sankey diagram */}
              <div className="md:col-span-2">
                <SankeyEmissions activities={activities} />
              </div>
            </div>
          )}

          {activeTab === 'auditoria' && (
            <div className="flex flex-col gap-6">
              <AuditDataGrid activities={activities} onAuditSubmit={handleAuditSubmit} />
            </div>
          )}

          {activeTab === 'market' && (
            <div className="flex flex-col gap-6">
              <CarbonTrading
                market={market}
                metrics={metrics}
                onPurchaseSubmit={handlePurchaseSubmit}
              />
            </div>
          )}
        </div>
      </main>

      {/* Instructor/Teacher panel */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-6">
        <div className="bg-[#0c1222]/80 border border-slate-800/60 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400" size={18} />
            <div>
              <h4 className="text-xs font-bold font-title text-white">
                CONSOLA DEL DOCENTE (SIMULACIÓN DE CRISIS)
              </h4>
              <p className="text-xxs text-slate-400 font-mono mt-0.5">
                Controla y altera las dinámicas del mercado de bonos y verificación GEI en vivo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleEventChange('NORMAL')}
              className={`px-3 py-1.5 rounded font-mono text-xxs border ${
                activeEvent === 'NORMAL'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleEventChange('OIL_SPILL_AUDIT_STRICT')}
              className={`px-3 py-1.5 rounded font-mono text-xxs border ${
                activeEvent === 'OIL_SPILL_AUDIT_STRICT'
                  ? 'bg-red-500/10 text-red-400 border-red-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Accidente Petrolero
            </button>
            <button
              onClick={() => handleEventChange('EU_CARBON_TAX_BOOST')}
              className={`px-3 py-1.5 rounded font-mono text-xxs border ${
                activeEvent === 'EU_CARBON_TAX_BOOST'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Impuesto Carbono UE
            </button>
            <button
              onClick={() => handleEventChange('AMAZON_FIRE_DEVALUATION')}
              className={`px-3 py-1.5 rounded font-mono text-xxs border ${
                activeEvent === 'AMAZON_FIRE_DEVALUATION'
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Incendios Amazonía
            </button>

            <div className="border-l border-slate-800 pl-2 ml-1">
              <button
                onClick={handleReset}
                className="btn-outline-danger flex items-center gap-1 text-xxs py-1.5 px-3"
              >
                <RefreshCw size={12} />
                Reiniciar Piloto
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
