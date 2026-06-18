import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert, Award, ShoppingCart } from 'lucide-react';

const CarbonTrading = ({ market, metrics, onPurchaseSubmit }) => {
  const [purchaseTons, setPurchaseTons] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  
  // Track price history for minor flash animation
  const prevMarketRef = useRef(market);

  useEffect(() => {
    const pricesObj = {};
    prevMarketRef.current.forEach(p => {
      pricesObj[p.id] = p.pricePerTon;
    });
    setPrevPrices(pricesObj);
    prevMarketRef.current = market;
  }, [market]);

  const handlePurchaseChange = (projectId, val) => {
    setPurchaseTons(prev => ({ ...prev, [projectId]: val }));
  };

  const handleBuy = (projectId) => {
    const tons = Number(purchaseTons[projectId]);
    if (!tons || tons <= 0) return;
    onPurchaseSubmit(projectId, tons);
    setPurchaseTons(prev => ({ ...prev, [projectId]: '' }));
  };

  return (
    <div className="glass-panel flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-mono text-cyan-400 tracking-wider flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
            BOLSA DE COMPENSACIÓN - MERCADO DE CARBONO
          </h3>
          <p className="text-xxs text-slate-400 font-mono mt-1">
            Intercambia bonos certificados de reducción y secuestro para mitigar emisiones remanentes.
          </p>
        </div>
        
        <div className="bg-slate-900 px-3 py-1.5 rounded border border-cyan-500/20 text-xxs font-mono flex items-center gap-2">
          <span className="text-slate-400">Presupuesto:</span>
          <span className="text-emerald-400 font-bold font-mono">${metrics.budget?.toLocaleString()} USD</span>
        </div>
      </div>

      {/* Price Ticker Banner */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 mb-4 flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-none">
        <span className="text-xxs font-mono text-cyan-400 font-bold flex items-center gap-1">
          <TrendingUp size={12} /> MERCADO EN VIVO:
        </span>
        {market.map(p => {
          const prevPrice = prevPrices[p.id] || p.pricePerTon;
          const diff = p.pricePerTon - prevPrice;
          const colorClass = diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-slate-400';
          const symbol = diff > 0 ? '▲' : diff < 0 ? '▼' : '';

          return (
            <div key={p.id} className="inline-flex items-center gap-1.5 text-xxs font-mono bg-slate-900/40 px-2 py-0.5 rounded border border-slate-800/40">
              <span className="text-slate-300 font-medium">{p.projectName.split(' ')[0]}</span>
              <span className={`font-bold ${colorClass}`}>
                ${p.pricePerTon.toFixed(2)} {symbol}
              </span>
            </div>
          );
        })}
      </div>

      {/* Greenwashing Risk Warning Banner */}
      <div className="mb-4 p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xxs font-mono text-slate-300 flex items-start gap-2.5">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-amber-400 font-bold block mb-0.5">ALERTA DE CUMPLIMIENTO (RESTRICCIÓN SBTi / GREENWASHING)</span>
          Para evitar penalizaciones severas de reputación corporativa (-20 puntos), los créditos de tipo <span className="text-white font-bold">RENEWABLE</span> (Energía Eólica/Solar) no deben representar más del <span className="text-amber-400 font-bold">50%</span> de tus compensaciones totales. Prioriza proyectos de captura directa <span className="text-white font-bold">DAC</span> o forestría certificada <span className="text-white font-bold">FORESTRY</span>.
        </div>
      </div>

      {/* Market Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow overflow-y-auto max-h-[350px] pr-1">
        {market.map(p => {
          const inputVal = purchaseTons[p.id] || '';
          const isHighQuality = p.certification === 'GOLD_STANDARD' || p.projectType === 'DAC';
          const price = p.pricePerTon;

          return (
            <div key={p.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg hover:border-slate-700/80 transition-all flex flex-col justify-between gap-3">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold font-title text-slate-200">{p.projectName}</h4>
                  <span className={`px-2 py-0.5 rounded text-xxs font-mono font-bold ${
                    p.projectType === 'DAC' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' :
                    p.projectType === 'FORESTRY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                    'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {p.projectType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-3 text-xxs font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Award size={12} className="text-slate-500" />
                    Cert: <span className="text-slate-200">{p.certification}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isHighQuality ? (
                      <>
                        <ShieldCheck size={12} className="text-emerald-500" />
                        Calidad: <span className="text-emerald-400 font-bold">Excelente</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={12} className="text-amber-500" />
                        Calidad: <span className="text-amber-400 font-bold">Media (Riesgo)</span>
                      </>
                    )}
                  </div>
                  <div>Disponible: <span className="text-slate-200">{p.availableTons.toLocaleString()} t</span></div>
                  <div>Precio Unitario: <span className="text-cyan-400 font-bold font-mono">${price.toFixed(2)} USD</span></div>
                </div>
              </div>

              <div className="flex gap-2 items-center pt-2 border-t border-slate-900">
                <div className="relative flex-grow">
                  <input
                    type="number"
                    min="1"
                    max={p.availableTons}
                    placeholder="Tons (tCO2e)"
                    value={inputVal}
                    onChange={(e) => handlePurchaseChange(p.id, e.target.value)}
                    className="custom-input w-full pr-6 text-xxs font-mono py-1.5"
                  />
                  <span className="absolute right-2 top-2 text-xxs text-slate-500 font-mono">t</span>
                </div>

                <button
                  onClick={() => handleBuy(p.id)}
                  disabled={!inputVal || Number(inputVal) <= 0 || Number(inputVal) > p.availableTons}
                  className="btn-emerald py-1.5 px-3 text-xxs font-mono shrink-0 flex items-center gap-1"
                >
                  <ShoppingCart size={12} />
                  Compensar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CarbonTrading;
