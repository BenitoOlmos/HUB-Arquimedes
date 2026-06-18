import React, { useState } from 'react';
import { HelpCircle, CheckCircle, AlertCircle, FileText, ChevronRight } from 'lucide-react';

const IshikawaFishbone = () => {
  const [fishboneAssignments, setFishboneAssignments] = useState({
    maquinas: [],
    materiales: [],
    metodos: [],
    manoObra: [],
    medicion: [],
    medioAmbiente: []
  });

  const [whys, setWhys] = useState({
    why1: '',
    why2: '',
    why3: '',
    why4: '',
    why5: '',
    rootCause: ''
  });

  const [whySaved, setWhySaved] = useState(false);

  // Available cause cards to assign to bones
  const causeCards = [
    { id: 'c1', text: 'Desgaste en cuchilla de corte', category: 'maquinas' },
    { id: 'c2', text: 'Fricción excesiva por material impuro', category: 'materiales' },
    { id: 'c3', text: 'Velocidad de avance descalibrada', category: 'metodos' },
    { id: 'c4', text: 'Omisión de plan preventivo semanal', category: 'metodos' },
    { id: 'c5', text: 'Operario no detecta alarma a tiempo', category: 'manoObra' },
    { id: 'c6', text: 'Sensor de temperatura descalibrado', category: 'medicion' },
    { id: 'c7', text: 'Acumulación de viruta metálica', category: 'medioAmbiente' },
    { id: 'c8', text: 'Espesor de chapa fuera de tolerancia', category: 'materiales' }
  ];

  const [availableCards, setAvailableCards] = useState(causeCards);
  const [draggedCard, setDraggedCard] = useState(null);

  const handleAssign = (category, card) => {
    // Add to category
    setFishboneAssignments(prev => ({
      ...prev,
      [category]: [...prev[category], card]
    }));
    // Remove from available
    setAvailableCards(prev => prev.filter(c => c.id !== card.id));
  };

  const handleResetFishbone = () => {
    setFishboneAssignments({
      maquinas: [],
      materiales: [],
      metodos: [],
      manoObra: [],
      medicion: [],
      medioAmbiente: []
    });
    setAvailableCards(causeCards);
  };

  const handleWhyChange = (key, val) => {
    setWhys(prev => ({ ...prev, [key]: val }));
    setWhySaved(false);
  };

  const handleSaveWhys = (e) => {
    e.preventDefault();
    setWhySaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Ishikawa Fishbone Diagram */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide flex items-center">
              <HelpCircle size={16} className="text-cyan-500 mr-2" />
              DIAGRAMA DE CAUSA-EFECTO (ISHIKAWA / ESPINA DE PESCADO)
            </h3>
            <button
              onClick={handleResetFishbone}
              className="text-xxs font-mono text-cyan-400 border border-cyan-500/35 hover:bg-cyan-500/10 px-2.5 py-1 rounded transition duration-200"
            >
              Reiniciar Diagrama
            </button>
          </div>

          <p className="text-xxs font-mono text-slate-400 mb-6 leading-relaxed">
            Asigna las posibles causas raíz identificadas en los registros de telemetría a sus categorías correspondientes haciendo clic en ellas y seleccionando su destino en la espina.
          </p>

          {/* Visual Fishbone Canvas representation */}
          <div className="relative border border-slate-800 bg-slate-950/40 rounded-xl p-4 min-h-[320px] flex flex-col justify-between overflow-x-auto">
            {/* Top Bones: Maquinas, Materiales, Metodos */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Máquinas */}
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col justify-between min-h-[90px]">
                <span className="text-xxs font-bold text-cyan-400 font-mono block border-b border-slate-805 pb-1 mb-2">MÁQUINAS</span>
                <div className="space-y-1.5 flex-grow">
                  {fishboneAssignments.maquinas.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-cyan-900/30 text-xxs font-mono text-cyan-300 py-1 px-2 rounded">
                      {c.text}
                    </div>
                  ))}
                  {fishboneAssignments.maquinas.length === 0 && (
                    <span className="text-xxxxs text-slate-600 font-mono italic block mt-4">Sin causas</span>
                  )}
                </div>
              </div>

              {/* Materiales */}
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col justify-between min-h-[90px]">
                <span className="text-xxs font-bold text-emerald-400 font-mono block border-b border-slate-805 pb-1 mb-2">MATERIALES</span>
                <div className="space-y-1.5 flex-grow">
                  {fishboneAssignments.materiales.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-emerald-900/30 text-xxs font-mono text-emerald-300 py-1 px-2 rounded">
                      {c.text}
                    </div>
                  ))}
                  {fishboneAssignments.materiales.length === 0 && (
                    <span className="text-xxxxs text-slate-600 font-mono italic block mt-4">Sin causas</span>
                  )}
                </div>
              </div>

              {/* Métodos */}
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col justify-between min-h-[90px]">
                <span className="text-xxs font-bold text-purple-400 font-mono block border-b border-slate-805 pb-1 mb-2">MÉTODOS</span>
                <div className="space-y-1.5 flex-grow">
                  {fishboneAssignments.metodos.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-purple-900/30 text-xxs font-mono text-purple-300 py-1 px-2 rounded">
                      {c.text}
                    </div>
                  ))}
                  {fishboneAssignments.metodos.length === 0 && (
                    <span className="text-xxxxs text-slate-600 font-mono italic block mt-4">Sin causas</span>
                  )}
                </div>
              </div>
            </div>

            {/* Central spine shaft line */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-slate-800 via-slate-650 to-rose-600 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[12px] border-l-rose-600"></div>
              </div>
              <div className="absolute right-4 bg-rose-950/90 border border-rose-800 px-3 py-1 rounded text-xxs font-bold text-rose-300 font-mono tracking-wider shadow">
                PROBLEMA: DESVIACIÓN OEE & SCRAP CNC
              </div>
            </div>

            {/* Bottom Bones: Mano Obra, Medicion, Medio Ambiente */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Mano de Obra */}
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col justify-between min-h-[90px]">
                <div className="space-y-1.5 flex-grow mb-2">
                  {fishboneAssignments.manoObra.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-amber-900/30 text-xxs font-mono text-amber-300 py-1 px-2 rounded">
                      {c.text}
                    </div>
                  ))}
                  {fishboneAssignments.manoObra.length === 0 && (
                    <span className="text-xxxxs text-slate-600 font-mono italic block mt-4">Sin causas</span>
                  )}
                </div>
                <span className="text-xxs font-bold text-amber-400 font-mono block border-t border-slate-805 pt-1">MANO DE OBRA</span>
              </div>

              {/* Medición */}
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col justify-between min-h-[90px]">
                <div className="space-y-1.5 flex-grow mb-2">
                  {fishboneAssignments.medicion.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-cyan-900/30 text-xxs font-mono text-cyan-300 py-1 px-2 rounded">
                      {c.text}
                    </div>
                  ))}
                  {fishboneAssignments.medicion.length === 0 && (
                    <span className="text-xxxxs text-slate-600 font-mono italic block mt-4">Sin causas</span>
                  )}
                </div>
                <span className="text-xxs font-bold text-cyan-400 font-mono block border-t border-slate-805 pt-1">MEDICIÓN</span>
              </div>

              {/* Medio Ambiente */}
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col justify-between min-h-[90px]">
                <div className="space-y-1.5 flex-grow mb-2">
                  {fishboneAssignments.medioAmbiente.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-rose-900/30 text-xxs font-mono text-rose-300 py-1 px-2 rounded">
                      {c.text}
                    </div>
                  ))}
                  {fishboneAssignments.medioAmbiente.length === 0 && (
                    <span className="text-xxxxs text-slate-600 font-mono italic block mt-4">Sin causas</span>
                  )}
                </div>
                <span className="text-xxs font-bold text-rose-400 font-mono block border-t border-slate-805 pt-1">MEDIO AMBIENTE</span>
              </div>
            </div>
          </div>

          {/* Cards to Assign */}
          {availableCards.length > 0 ? (
            <div className="mt-5 space-y-2">
              <span className="text-xxs font-bold font-mono text-slate-450 tracking-wider">TARJETAS DE CAUSAS POR CLASIFICAR:</span>
              <div className="flex flex-wrap gap-2">
                {availableCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 p-2 rounded text-xxs font-mono text-slate-300 flex items-center justify-between space-x-3 transition cursor-pointer"
                  >
                    <span>{card.text}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleAssign(card.category, card)}
                        className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 px-1.5 py-0.5 rounded text-xxxxs border border-cyan-850"
                      >
                        Clasificar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xxs font-mono text-emerald-400 flex items-center">
              <CheckCircle size={14} className="mr-2" />
              ¡Excelente! Has clasificado todas las causas sugeridas en sus respectivas categorías Ishikawa.
            </div>
          )}
        </div>

        {/* Right column: 5-Whys root cause portal */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide flex items-center mb-4">
              <FileText size={16} className="text-purple-500 mr-2" />
              TÉCNICA DE LOS 5 PORQUÉS
            </h3>
            <p className="text-xxs font-mono text-slate-400 mb-4 leading-relaxed">
              Analiza en cascada el evento "Sobrecalentamiento del Motor del CNC" usando la metodología Lean 5-Whys. Escribe tu hipótesis secuencial para llegar al problema original.
            </p>

            <form onSubmit={handleSaveWhys} className="space-y-3 font-mono text-xxs">
              <div>
                <label className="block text-slate-550 mb-1">1. ¿Por qué ocurrió el fallo? (Síntoma)</label>
                <input
                  type="text"
                  placeholder="El motor de avance del CNC se detuvo por sobretemperatura"
                  value={whys.why1}
                  onChange={(e) => handleWhyChange('why1', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1">2. ¿Por qué ocurrió lo anterior?</label>
                <input
                  type="text"
                  placeholder="Fricción elevada y sobreesfuerzo de corte en la bancada"
                  value={whys.why2}
                  onChange={(e) => handleWhyChange('why2', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1">3. ¿Por qué?</label>
                <input
                  type="text"
                  placeholder="La cuchilla de corte del CNC tenía desgaste excesivo"
                  value={whys.why3}
                  onChange={(e) => handleWhyChange('why3', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1">4. ¿Por qué?</label>
                <input
                  type="text"
                  placeholder="Se omitió la inspección y afilado programado"
                  value={whys.why4}
                  onChange={(e) => handleWhyChange('why4', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1">5. ¿Por qué? (Causa Raíz)</label>
                <input
                  type="text"
                  placeholder="No hay un plan preventivo semanal de herramientas implementado"
                  value={whys.why5}
                  onChange={(e) => handleWhyChange('why5', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">Causa Raíz Definitiva:</label>
                <textarea
                  rows={2}
                  placeholder="La ausencia de mantenimiento preventivo enfocado en desgaste de herramientas expone al CNC a fallas por rozamiento crítico."
                  value={whys.rootCause}
                  onChange={(e) => handleWhyChange('rootCause', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-850 border border-purple-500/40 text-purple-400 hover:text-purple-300 font-semibold py-2 rounded text-xxs transition duration-200 tracking-wider"
              >
                REGISTRAR ANÁLISIS EN BITÁCORA
              </button>
            </form>
          </div>

          {whySaved && (
            <div className="mt-4 p-2.5 bg-purple-950/30 border border-purple-900/50 rounded text-xxs font-mono text-purple-300 flex items-start space-x-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>Análisis guardado exitosamente. Se ha registrado en la bitácora docente de mejora continua Lean.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IshikawaFishbone;
