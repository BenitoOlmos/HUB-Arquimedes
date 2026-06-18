import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, Search, BarChart3, Clock, TrendingUp, Filter } from 'lucide-react';

const HistoryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [triageFilter, setTriageFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [showCharts, setShowCharts] = useState(true);

  const [allHistory, setAllHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHistoryAndAnalytics = async () => {
    try {
      const res = await fetch('/api/his/history');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
        
        // Map recentHistory to the format the table expects
        const mapped = data.recentHistory.map(log => {
          const parts = log.symptoms.split(' | Vitales: ');
          const cleanSymptoms = parts[0];
          
          let waitTime = 12; // default
          if (log.attentionTime) {
            const diffMs = new Date(log.attentionTime).getTime() - new Date(log.arrivalTime).getTime();
            waitTime = Math.max(0, Math.floor(diffMs / 60000));
          }
          
          let outcome = 'Derivado';
          if (log.status === 'DISCHARGED') outcome = 'Alta';
          else if (log.status === 'ADMITTED' || log.status === 'IN_TREATMENT') outcome = 'Hospitalización';
          else if (log.status === 'DECEASED') outcome = 'Fallecido';

          return {
            id: log.id,
            date: new Date(log.arrivalTime).toLocaleDateString('es-CL'),
            patientId: log.patient?.rut || log.patientId,
            patientName: log.patient?.fullName || 'Paciente',
            age: log.patient?.age || 35,
            triageLevel: log.assignedEsi || 3,
            waitTime,
            diagnosis: cleanSymptoms,
            outcome
          };
        });
        
        setAllHistory(mapped);
      }
    } catch (e) {
      console.error("Error loading historical analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndAnalytics();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleTriageFilterChange = (e) => {
    setTriageFilter(Number(e.target.value));
    setPage(1);
  };

  // Perform client-side pagination, search, and filtering over the fetched recent history
  const filteredHistory = allHistory.filter(log => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = query === "" || 
      log.patientName.toLowerCase().includes(query) || 
      log.patientId.toLowerCase().includes(query) || 
      log.diagnosis.toLowerCase().includes(query);
    const matchesTriage = triageFilter === 0 || log.triageLevel === Number(triageFilter);
    return matchesSearch && matchesTriage;
  });

  const pageSize = 10;
  const total = filteredHistory.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const paginatedHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Toggle charts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Histórico de Atenciones e Informes (Auditoría)</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Consulte tendencias epidemiológicas y audite tiempos de espera sobre 50,000+ casos cargados.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => setShowCharts(!showCharts)}>
          <BarChart3 size={14} /> {showCharts ? "Ocultar Gráficos Estadísticos" : "Mostrar Gráficos Estadísticos"}
        </button>
      </div>

      {/* Analytical Charts */}
      {showCharts && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem' }}>
          
          {/* Monthly Trend */}
          <div className="glass-panel" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <TrendingUp size={14} color="var(--accent-cyan)" /> Tendencia Mensual de Admisión vs Decesos
            </div>
            <div style={{ flexGrow: 1, width: '100%', height: '80%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="monthName" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--border-glass)', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="admissions" name="Admisiones" stroke="var(--accent-cyan)" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="deaths" name="Decesos" stroke="var(--esi-1-resus)" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Specialty average Wait times */}
          <div className="glass-panel" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Clock size={14} color="var(--esi-3-urg)" /> Tiempo Medio de Espera por Especialidad (Minutos)
            </div>
            <div style={{ flexGrow: 1, width: '100%', height: '80%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={8} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="var(--text-muted)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--border-glass)' }} />
                  <Bar dataKey="avgWait" name="Minutos Espera" fill="var(--esi-3-urg)">
                    {analytics.categoryStats.map((entry, idx) => (
                      <Cell key={idx} fill={idx % 2 === 0 ? 'var(--esi-3-urg)' : 'var(--esi-2-emerg)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Triage Distribution */}
          <div className="glass-panel" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <FileText size={14} color="var(--accent-purple)" /> Distribución Triage ESI Histórica
            </div>
            <div style={{ flexGrow: 1, width: '100%', height: '80%', display: 'flex', position: 'relative', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--border-glass)' }} />
                  <Pie
                    data={analytics.triageDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {analytics.triageDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend overlay */}
              <div style={{
                position: 'absolute',
                bottom: 5,
                left: 5,
                right: 5,
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '8px',
                color: 'var(--text-secondary)'
              }}>
                {analytics.triageDist.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }}></span>
                    <span>{item.name.split(" ")[0]}: {item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Auditor Table */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <FileText size={18} color="var(--accent-cyan)" /> Auditoría de Urgencias (Bitácora de Eventos)
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            Encontrados {total.toLocaleString()} registros
          </span>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT de paciente o diagnóstico..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="form-select"
              value={triageFilter}
              onChange={handleTriageFilterChange}
            >
              <option value="0">Todos los Niveles ESI</option>
              <option value="1">ESI 1 - Resucitación</option>
              <option value="2">ESI 2 - Emergencia</option>
              <option value="3">ESI 3 - Urgente</option>
              <option value="4">ESI 4 - Semi-urgente</option>
              <option value="5">ESI 5 - No urgente</option>
            </select>
          </div>
        </div>

        {/* Table view */}
        <div className="his-table-container">
          <table className="his-table">
            <thead>
              <tr>
                <th>Código Caso</th>
                <th>Fecha Ingreso</th>
                <th>Rut Paciente</th>
                <th>Nombre Paciente</th>
                <th>Gravedad ESI</th>
                <th>Espera Prom.</th>
                <th>Diagnóstico Clínico</th>
                <th>Resolución (Egreso)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedHistory.map(log => {
                  let outcomeColor = 'var(--text-primary)';
                  if (log.outcome === 'Fallecido') outcomeColor = 'var(--esi-1-resus)';
                  else if (log.outcome === 'Hospitalización') outcomeColor = 'var(--accent-purple)';
                  else if (log.outcome === 'Alta') outcomeColor = 'var(--bed-free)';

                  return (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{log.id}</td>
                      <td>{log.date}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.patientId}</td>
                      <td style={{ fontWeight: '600' }}>{log.patientName} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({log.age} a)</span></td>
                      <td>
                        <span className={`esi-badge esi-${log.triageLevel}`}>ESI {log.triageLevel}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{log.waitTime} min</td>
                      <td>{log.diagnosis}</td>
                      <td style={{ fontWeight: 'bold', color: outcomeColor }}>
                        {log.outcome}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-controls">
          <button
            className="btn-secondary"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
          >
            Anterior
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Página {page} de {totalPages}
          </span>
          <button
            className="btn-secondary"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>

    </div>
  );
};

export default HistoryPanel;
