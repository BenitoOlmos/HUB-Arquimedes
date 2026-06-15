import React, { useState, useEffect } from 'react';
import CanvasViewer from './components/3D/CanvasViewer';
import InfoPanel from './components/UI/InfoPanel';
import PumpSimulatorPanel from './components/UI/PumpSimulatorPanel';
import ErrorBoundary from './components/UI/ErrorBoundary';
import PedagogyPanel from './components/UI/PedagogyPanel';
import DiagnosisPanel from './components/UI/DiagnosisPanel';
import SecurityPanel from './components/UI/SecurityPanel';
import HistoryPanel from './components/UI/HistoryPanel';
import { usePumpSimulation } from './hooks/usePumpSimulation';
import { RotateCcw, Activity, HelpCircle, Eye, EyeOff, BookOpen, ClipboardList, ShieldCheck, BarChart3 } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('simulator'); // 'simulator', 'pedagogy', 'diagnosis', 'security'
  const [motorPower, setMotorPower] = useState(2); // Default to 2 HP
  const [geomHeight, setGeomHeight] = useState(10); // m
  const [pipeLength, setPipeLength] = useState(20); // m
  const [lossK, setLossK] = useState(5.0); // Coeficiente K
  const [flowRate, setFlowRate] = useState(15); // Caudal actual (m3/h)
  const [flowUnit, setFlowUnit] = useState('m3h'); // 'm3h' o 'lh'
  const [activeDiameter, setActiveDiameter] = useState(2); // Diámetro de operación activo (pulgadas)
  const [enabledDiameters, setEnabledDiameters] = useState({
    1: true,
    1.5: true,
    2: true,
    3: true
  });
  const [isCavitating, setIsCavitating] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('simulation'); // 'simulation' or 'inspection'
  
  const {
    explodeFactor,
    setExplodeFactor,
    autoRotate,
    setAutoRotate,
    selectedPartId,
    setSelectedPartId,
    selectedPart,
    loadingPart,
    modelLoaded,
    setModelLoaded,
    usingFallback,
    models,
    selectedModel,
    setSelectedModel,
    handleStatusChange,
    handleAddLog,
    resetView
  } = usePumpSimulation();

  // Auto switch sidebar to inspection mode when a part is clicked
  useEffect(() => {
    if (selectedPartId) {
      setSidebarMode('inspection');
    }
  }, [selectedPartId]);

  return (
    <div className="app-container">
      {/* Premium Ambient Background Blobs */}
      <div className="bg-ambient-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Integrated Header Bar (Persistent at Top) */}
      <header className="app-header">
        <div className="header-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span className="brand-badge">LABORATORIO DE HIDRÁULICA</span>
            <span className="brand-dept">DEPT. INGENIERÍA MECÁNICA</span>
          </div>
          <h1 className="brand-title">
            <Activity size={18} className="pulse-icon" style={{ color: 'var(--accent-cyan)' }} />
            Simulador de Bomba Centrífuga
          </h1>
        </div>

        {/* Integrated Navigation Tabs */}
        <nav className="global-navbar">
          <button 
            className={`nav-tab ${currentView === 'simulator' ? 'active' : ''}`}
            onClick={() => setCurrentView('simulator')}
          >
            <Activity size={14} />
            <span>Simulador 3D</span>
          </button>
          <button 
            className={`nav-tab ${currentView === 'diagnosis' ? 'active' : ''}`}
            onClick={() => setCurrentView('diagnosis')}
          >
            <ClipboardList size={14} />
            <span>Matriz de Diagnóstico</span>
          </button>
          <button 
            className={`nav-tab ${currentView === 'pedagogy' ? 'active' : ''}`}
            onClick={() => setCurrentView('pedagogy')}
          >
            <BookOpen size={14} />
            <span>Plan de Trabajo (5W2H)</span>
          </button>
          <button 
            className={`nav-tab ${currentView === 'security' ? 'active' : ''}`}
            onClick={() => setCurrentView('security')}
          >
            <ShieldCheck size={14} />
            <span>Seguridad e IoT</span>
          </button>
          <button 
            className={`nav-tab ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            <BarChart3 size={14} />
            <span>Historial e Informes</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {currentView === 'simulator' ? (
          <div className="simulator-view">
            <div className="canvas-zone">
              {/* Instructions Overlay */}
              <div className="instructions-overlay">
                <div className="instruction-item">
                  <div className="instruction-dot"></div>
                  <span>{selectedModel === 'sketchfab-bomba-centrifuga' ? 'Arrastrar: Rotar 3D' : 'Click + Arrastrar: Orbitar 360º'}</span>
                </div>
                <div className="instruction-item">
                  <div className="instruction-dot"></div>
                  <span>{selectedModel === 'sketchfab-bomba-centrifuga' ? 'Shift + Arrastrar: Desplazar' : 'Click Der. + Arrastrar: Desplazar'}</span>
                </div>
                <div className="instruction-item">
                  <div className="instruction-dot"></div>
                  <span>Rueda de mouse: Zoom</span>
                </div>
                {selectedModel !== 'sketchfab-bomba-centrifuga' && (
                  <div className="instruction-item">
                    <div className="instruction-dot"></div>
                    <span>Clic en pieza: Auditar componente</span>
                  </div>
                )}
              </div>

              {/* 3D Canvas Visualizer or Sketchfab Embed */}
              {selectedModel === 'sketchfab-bomba-centrifuga' ? (
                <div className="canvas-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border-glass)' }}>
                  <iframe
                    title="Bomba Centrifuga Anima"
                    frameBorder="0"
                    allowFullScreen
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    xr-spatial-tracking
                    execution-while-out-of-viewport
                    execution-while-not-rendered
                    web-share
                    src="https://sketchfab.com/models/8ba0ed44dfbd480793aa2ac4ce22b287/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_theme=dark"
                    style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
                  />
                </div>
              ) : (
                <ErrorBoundary>
                  <CanvasViewer
                    modelName={selectedModel}
                    explodeFactor={explodeFactor}
                    autoRotate={autoRotate}
                    selectedPartId={selectedPartId}
                    onSelectPart={setSelectedPartId}
                    onModelLoaded={setModelLoaded}
                    motorPower={motorPower}
                    activeDiameter={activeDiameter}
                    isCavitating={isCavitating}
                  />
                </ErrorBoundary>
              )}

              {/* Interactive Overlay controls */}
              <div className="controls-panel">
                {/* Model Selector */}
                <div className="control-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '8px' }}>
                  <div className="control-label">
                    <span>Modelo 3D Activo</span>
                  </div>
                  <select
                    className="status-select"
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setSelectedPartId(null); // Reset selection
                    }}
                    style={{ flex: 1, padding: '8px', maxWidth: '320px', fontSize: '0.85rem' }}
                  >
                    {models.map((model) => (
                      <option key={model} value={model}>
                        {model === 'sketchfab-bomba-centrifuga' 
                          ? 'BOMBA ANIMADA (SKETCHFAB)' 
                          : model.replace('.glb', '').replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedModel === 'sketchfab-bomba-centrifuga' ? (
                  <div style={{ padding: '8px 4px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                      <HelpCircle size={14} />
                      <span>Visualizador Externo</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.4' }}>
                      Visualizando <strong>Bomba Centrífuga Anima</strong> desde Sketchfab. Las opciones de despiece, simulación e inspección de partes locales están desactivadas para este modelo.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="control-row">
                      <div className="control-label">
                        <span>Despiece (Exploded View)</span>
                      </div>
                      <div className="slider-container">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={explodeFactor}
                          onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                          className="premium-slider"
                        />
                        <span className="slider-val">{Math.round(explodeFactor * 100)}%</span>
                      </div>
                    </div>

                    <div className="control-row" style={{ marginTop: '4px' }}>
                      <div className="btn-group">
                        <button
                          className={`btn-secondary ${autoRotate ? 'active' : ''}`}
                          onClick={() => setAutoRotate(!autoRotate)}
                        >
                          {autoRotate ? <EyeOff size={14} /> : <Eye size={14} />}
                          {autoRotate ? 'Detener Rotación' : 'Auto Rotar'}
                        </button>
                        <button className="btn-secondary" onClick={resetView}>
                          <RotateCcw size={14} />
                          Restablecer
                        </button>
                      </div>

                      {usingFallback && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <HelpCircle size={12} color="var(--status-inspect)" />
                          <span>Modo Sin Servidor (Mock Data)</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar Info Panel */}
            <aside className="info-sidebar">
              <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="sidebar-title">{sidebarMode === 'simulation' ? 'Simulador Dinámico' : 'Detalles Técnicos'}</h2>
                    <span className="sidebar-subtitle">{sidebarMode === 'simulation' ? 'Curvas de Rendimiento' : 'Control de Mantenimiento'}</span>
                  </div>
                </div>
                
                {/* Modern Toggle Tabs */}
                <div className="sidebar-tabs" style={{ width: '100%', marginTop: '4px' }}>
                  <button 
                    onClick={() => setSidebarMode('simulation')}
                    className={`sidebar-tab ${sidebarMode === 'simulation' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Activity size={13} />
                    <span>Simulación</span>
                  </button>
                  <button 
                    onClick={() => setSidebarMode('inspection')}
                    className={`sidebar-tab ${sidebarMode === 'inspection' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <ClipboardList size={13} />
                    <span>Inspección</span>
                  </button>
                </div>
              </div>
              
              <ErrorBoundary>
                {sidebarMode === 'simulation' ? (
                  <PumpSimulatorPanel
                    motorPower={motorPower}
                    setMotorPower={setMotorPower}
                    geomHeight={geomHeight}
                    setGeomHeight={setGeomHeight}
                    pipeLength={pipeLength}
                    setPipeLength={setPipeLength}
                    lossK={lossK}
                    setLossK={setLossK}
                    flowRate={flowRate}
                    setFlowRate={setFlowRate}
                    flowUnit={flowUnit}
                    setFlowUnit={setFlowUnit}
                    activeDiameter={activeDiameter}
                    setActiveDiameter={setActiveDiameter}
                    enabledDiameters={enabledDiameters}
                    setEnabledDiameters={setEnabledDiameters}
                    setIsCavitating={setIsCavitating}
                  />
                ) : (
                  <InfoPanel
                    selectedPart={selectedPart}
                    loading={loadingPart}
                    onStatusChange={handleStatusChange}
                    onAddLog={handleAddLog}
                  />
                )}
              </ErrorBoundary>
            </aside>
          </div>
        ) : (
          <div className="panel-view">
            {currentView === 'pedagogy' && <PedagogyPanel />}
            {currentView === 'diagnosis' && <DiagnosisPanel />}
            {currentView === 'security' && <SecurityPanel />}
            {currentView === 'history' && <HistoryPanel />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
