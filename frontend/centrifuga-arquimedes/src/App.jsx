import React, { useState } from 'react';
import CanvasViewer from './components/3D/CanvasViewer';
import InfoPanel from './components/UI/InfoPanel';
import ErrorBoundary from './components/UI/ErrorBoundary';
import PedagogyPanel from './components/UI/PedagogyPanel';
import DiagnosisPanel from './components/UI/DiagnosisPanel';
import SecurityPanel from './components/UI/SecurityPanel';
import { usePumpSimulation } from './hooks/usePumpSimulation';
import { RotateCcw, Activity, HelpCircle, Eye, EyeOff, BookOpen, ClipboardList, ShieldCheck } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('simulator'); // 'simulator', 'pedagogy', 'diagnosis', 'security'
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

  return (
    <div 
      className="app-container" 
      style={{ 
        gridTemplateColumns: currentView === 'simulator' ? '1fr 420px' : '1fr',
        background: '#ffffff'
      }}
    >
      {/* Global Floating Navigation Bar */}
      <nav className="global-navbar" style={{ right: currentView === 'simulator' ? '444px' : '24px' }}>
        <button 
          className={`nav-tab ${currentView === 'simulator' ? 'active' : ''}`}
          onClick={() => setCurrentView('simulator')}
        >
          <Activity size={15} />
          <span>Simulador 3D</span>
        </button>
        <button 
          className={`nav-tab ${currentView === 'diagnosis' ? 'active' : ''}`}
          onClick={() => setCurrentView('diagnosis')}
        >
          <ClipboardList size={15} />
          <span>Matriz de Diagnóstico</span>
        </button>
        <button 
          className={`nav-tab ${currentView === 'pedagogy' ? 'active' : ''}`}
          onClick={() => setCurrentView('pedagogy')}
        >
          <BookOpen size={15} />
          <span>Plan de Trabajo (5W2H)</span>
        </button>
        <button 
          className={`nav-tab ${currentView === 'security' ? 'active' : ''}`}
          onClick={() => setCurrentView('security')}
        >
          <ShieldCheck size={15} />
          <span>Seguridad e IoT</span>
        </button>
      </nav>

      {/* VIEW CONDITIONAL RENDERING */}
      {currentView === 'simulator' ? (
        <>
          {/* Header Overlay */}
          <header className="app-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ 
                fontSize: '0.6rem', 
                fontWeight: 800, 
                background: 'var(--accent-blue)', 
                color: '#ffffff', 
                padding: '2px 6px', 
                borderRadius: '3px',
                letterSpacing: '0.05em' 
              }}>LABORATORIO DE HIDRÁULICA</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>DEPT. INGENIERÍA MECÁNICA</span>
            </div>
            <h1>
              <Activity size={20} color="var(--accent-cyan)" style={{ animation: 'pulse 2.5s infinite' }} />
              Simulador de Bomba Centrífuga
            </h1>
            <p>Módulo de Despiece e Inspección Técnica 3D</p>
          </header>

          {/* Instructions Overlay */}
          <div className="instructions-overlay">
            <div className="instruction-item">
              <div className="instruction-dot"></div>
              <span>Click + Arrastrar: Orbitar 360º</span>
            </div>
            <div className="instruction-item">
              <div className="instruction-dot"></div>
              <span>Click Der. + Arrastrar: Desplazar</span>
            </div>
            <div className="instruction-item">
              <div className="instruction-dot"></div>
              <span>Rueda de mouse: Zoom completo</span>
            </div>
            <div className="instruction-item">
              <div className="instruction-dot"></div>
              <span>Clic en pieza: Auditar componente</span>
            </div>
          </div>

          {/* 3D Canvas Visualizer wrapped in ErrorBoundary */}
          <ErrorBoundary>
            <CanvasViewer
              modelName={selectedModel}
              explodeFactor={explodeFactor}
              autoRotate={autoRotate}
              selectedPartId={selectedPartId}
              onSelectPart={setSelectedPartId}
              onModelLoaded={setModelLoaded}
            />
          </ErrorBoundary>

          {/* Interactive Overlay controls (for the 3D canvas side) */}
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
                    {model.replace('.glb', '').replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Sidebar Info Panel wrapped in ErrorBoundary */}
          <aside className="info-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Detalles Técnicos</h2>
              <span className="sidebar-subtitle">Control de Mantenimiento</span>
            </div>
            <ErrorBoundary>
              <InfoPanel
                selectedPart={selectedPart}
                loading={loadingPart}
                onStatusChange={handleStatusChange}
                onAddLog={handleAddLog}
              />
            </ErrorBoundary>
          </aside>
        </>
      ) : (
        <div style={{ width: '100%', height: '100vh', paddingTop: '80px', overflowY: 'auto' }}>
          {currentView === 'pedagogy' && <PedagogyPanel />}
          {currentView === 'diagnosis' && <DiagnosisPanel />}
          {currentView === 'security' && <SecurityPanel />}
        </div>
      )}
    </div>
  );
}

export default App;
