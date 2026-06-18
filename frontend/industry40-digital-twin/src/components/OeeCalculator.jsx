import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { AlertTriangle, Award, Info, RefreshCw, BarChart2 } from 'lucide-react';

const OeeCalculator = ({ oeeData }) => {
  const [studentAvail, setStudentAvail] = useState('');
  const [studentPerf, setStudentPerf] = useState('');
  const [studentQual, setStudentQual] = useState('');
  const [studentOee, setStudentOee] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  if (!oeeData) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center text-slate-400 font-mono flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-cyan-500 w-8 h-8" />
        <p>Cargando analíticas OEE y gráficos de Seis Sigma...</p>
      </div>
    );
  }

  const { availability, performance, quality, oee, kpis, controlChartData } = oeeData;

  const handleVerify = (e) => {
    e.preventDefault();
    const sa = parseFloat(studentAvail);
    const sp = parseFloat(studentPerf);
    const sq = parseFloat(studentQual);
    const so = parseFloat(studentOee);

    if (isNaN(sa) || isNaN(sp) || isNaN(sq) || isNaN(so)) {
      setVerificationResult({
        success: false,
        message: 'Por favor, introduce valores numéricos válidos para todos los campos.'
      });
      return;
    }

    // Allow 0.5% tolerance
    const avOk = Math.abs(sa - availability) <= 0.5;
    const peOk = Math.abs(sp - performance) <= 0.5;
    const quOk = Math.abs(sq - quality) <= 0.5;
    const oeOk = Math.abs(so - oee) <= 0.5;

    if (avOk && peOk && quOk && oeOk) {
      setVerificationResult({
        success: true,
        message: '¡Excelente! Tus cálculos coinciden con los del gemelo digital. Has calculado correctamente el OEE.'
      });
    } else {
      let issues = [];
      if (!avOk) issues.push('Disponibilidad');
      if (!peOk) issues.push('Rendimiento');
      if (!quOk) issues.push('Calidad');
      if (!oeOk) issues.push('OEE Final');

      setVerificationResult({
        success: false,
        message: `Desviación detectada en: ${issues.join(', ')}. Verifica tus fórmulas e inténtalo de nuevo.`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Availability */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-slate-850 opacity-10">
            <BarChart2 size={120} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-mono tracking-wider">DISPONIBILIDAD</span>
              <div className="group relative">
                <Info size={14} className="text-slate-500 cursor-help hover:text-slate-350" />
                <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-slate-950 text-xxs text-slate-350 rounded border border-slate-800 hidden group-hover:block z-20 font-mono">
                  Tiempo de Operación / Tiempo Planificado.<br/>
                  (Reduce paradas no planificadas con mantenimiento preventivo).
                </div>
              </div>
            </div>
            {/* The student must calculate. We hide the actual value or show it as target/sensor logs */}
            <div className="text-2xl font-bold font-mono text-cyan-400">--- %</div>
            <div className="text-xxs text-slate-500 font-mono mt-1">Sugerencia: Analizar registros en la tabla de paradas</div>
          </div>
        </div>

        {/* Performance */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-slate-850 opacity-10">
            <BarChart2 size={120} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-mono tracking-wider">RENDIMIENTO</span>
              <div className="group relative">
                <Info size={14} className="text-slate-500 cursor-help hover:text-slate-350" />
                <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-slate-950 text-xxs text-slate-350 rounded border border-slate-800 hidden group-hover:block z-20 font-mono">
                  (Piezas Producidas * Tiempo Ciclo Ideal) / Tiempo de Operación.<br/>
                  Ideal = 6.0s. Traición = Máquina 3 a 7.5s.
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">--- %</div>
            <div className="text-xxs text-slate-500 font-mono mt-1">Sugerencia: Descargar logs de telemetría</div>
          </div>
        </div>

        {/* Quality */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-slate-850 opacity-10">
            <BarChart2 size={120} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-mono tracking-wider">CALIDAD</span>
              <div className="group relative">
                <Info size={14} className="text-slate-500 cursor-help hover:text-slate-350" />
                <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-slate-950 text-xxs text-slate-350 rounded border border-slate-800 hidden group-hover:block z-20 font-mono">
                  (Piezas Buenas / Piezas Totales).<br/>
                  Piezas Buenas = Producidas - Defectos.
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-purple-400">--- %</div>
            <div className="text-xxs text-slate-500 font-mono mt-1">Sugerencia: Ver total de piezas vs defectos</div>
          </div>
        </div>

        {/* Total OEE Target */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-slate-850 opacity-10">
            <BarChart2 size={120} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-mono tracking-wider">OEE ACTUAL</span>
              <div className="group relative">
                <Info size={14} className="text-slate-500 cursor-help hover:text-slate-350" />
                <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-slate-950 text-xxs text-slate-350 rounded border border-slate-800 hidden group-hover:block z-20 font-mono">
                  OEE = Disponibilidad * Rendimiento * Calidad.
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-500">--- %</div>
            <div className="text-xxs text-slate-500 font-mono mt-1">Meta Clase Mundial: &gt; 85%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Six Sigma p-Chart (Defect Rate Control Chart) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide flex items-center">
              <BarChart2 size={16} className="text-cyan-500 mr-2" />
              GRÁFICO DE CONTROL SEIS SIGMA (TASA DE DEFECTOS p-CHART)
            </h3>
            <span className="text-xxs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Límites p-Chart a 3σ
            </span>
          </div>

          <div className="w-full h-64 font-mono text-xxs">
            <ResponsiveContainer width="100%" h="100%">
              <LineChart
                data={controlChartData}
                margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="batchId" stroke="#475569" tickLine={false} />
                <YAxis stroke="#475569" tickLine={false} domain={[0, 4.0]} label={{ value: 'Tasa Defectos (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '6px' }}
                  labelClassName="text-slate-350 font-bold font-mono text-xxs"
                  itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                <Line
                  type="monotone"
                  name="Tasa Lote (%)"
                  dataKey="rate"
                  stroke="#a855f7"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4 }}
                />
                <Line
                  type="step"
                  name="LCL (Límite Control Inf)"
                  dataKey="LCL"
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="step"
                  name="CL (Línea Central)"
                  dataKey="CL"
                  stroke="#64748b"
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  type="step"
                  name="UCL (Límite Control Sup)"
                  dataKey="UCL"
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xxs font-mono text-slate-400 space-y-2 leading-relaxed">
            <div className="flex items-center text-amber-500 font-semibold mb-1">
              <AlertTriangle size={14} className="mr-1.5" />
              INDICACIONES PARA EL ANÁLISIS DE VARIABILIDAD:
            </div>
            <p>
              1. <strong>Puntos Fuera de Límites:</strong> Si algún lote supera el UCL (Límite de Control Superior), significa que el proceso está fuera de control estadístico (Causa Asignable).
            </p>
            <p>
              2. <strong>Correlación de Fallas:</strong> Compara los picos del p-Chart con la tabla de telemetrías y consumo de energía para detectar desgastes en la herramienta de corte CNC.
            </p>
          </div>
        </div>

        {/* Student Verification Portal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide flex items-center mb-4">
              <Award size={16} className="text-amber-500 mr-2" />
              VERIFICADOR DE CÁLCULO OEE
            </h3>
            <p className="text-xxs font-mono text-slate-400 mb-4 leading-relaxed">
              Introduce tus cálculos a partir de los datos telemétricos históricos. Para aprobar la práctica, los valores ingresados deben tener una precisión menor al 0.5% frente al sensor del gemelo digital.
            </p>

            <form onSubmit={handleVerify} className="space-y-3 font-mono">
              <div>
                <label className="block text-xxs text-slate-400 mb-1">DISPONIBILIDAD (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ej. 88.5"
                  value={studentAvail}
                  onChange={(e) => setStudentAvail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xxs text-slate-400 mb-1">RENDIMIENTO (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ej. 75.3"
                  value={studentPerf}
                  onChange={(e) => setStudentPerf(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xxs text-slate-400 mb-1">CALIDAD (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ej. 98.2"
                  value={studentQual}
                  onChange={(e) => setStudentQual(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xxs text-slate-400 mb-1">OEE FINAL CALCULADO (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ej. 65.4"
                  value={studentOee}
                  onChange={(e) => setStudentOee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-100 font-bold py-2 rounded text-xs transition duration-200 tracking-wider shadow-lg shadow-cyan-500/10"
              >
                COMPROBAR FÓRMULAS
              </button>
            </form>
          </div>

          {verificationResult && (
            <div className={`mt-4 p-3 rounded border text-xxs font-mono ${
              verificationResult.success
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-red-950/50 border-red-900 text-red-300'
            }`}>
              {verificationResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Auxiliary Formulas & Info */}
      <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xxs font-mono text-slate-400">
        <div>
          <span className="text-slate-200 font-bold block mb-1">Fórmula de Disponibilidad:</span>
          <span>(Tiempo Operación - Tiempos Muertos) / Tiempo de Operación Planificado.</span>
        </div>
        <div>
          <span className="text-slate-200 font-bold block mb-1">Fórmula de Rendimiento:</span>
          <span>(Unidades Producidas * Tiempo Ciclo Ideal) / Tiempo de Operación Neto.</span>
        </div>
        <div>
          <span className="text-slate-200 font-bold block mb-1">Fórmula de Calidad:</span>
          <span>(Unidades Producidas - Unidades Defectuosas) / Unidades Producidas.</span>
        </div>
      </div>
    </div>
  );
};

export default OeeCalculator;
