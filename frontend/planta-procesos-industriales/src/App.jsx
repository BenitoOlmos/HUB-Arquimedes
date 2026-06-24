import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Map,
  Wrench,
  ShieldAlert,
  Calendar,
  Moon,
  Sun,
  Cpu,
  LogOut,
  Bell,
  Info,
  HelpCircle
} from 'lucide-react';

import TutorialGuiado from './components/TutorialGuiado';
import DashboardEstudiante from './components/DashboardEstudiante';
import PlantaInteractiva from './components/PlantaInteractiva';
import SimuladorMantenimiento from './components/SimuladorMantenimiento';
import SimuladorFallas from './components/SimuladorFallas';
import RoadmapPresentacion from './components/RoadmapPresentacion';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, planta, mantenimiento, fallas, roadmap
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedScenarioCode, setSelectedScenarioCode] = useState(null);

  // Custom scenario route linking
  const handleSelectScenario = (code, targetTab) => {
    setSelectedScenarioCode(code);
    setActiveTab(targetTab);

    // Automatically adjust the semester state if needed
    if (code.startsWith('SEM')) {
      const semNum = parseInt(code.charAt(3));
      if (!isNaN(semNum)) {
        setSelectedSemester(semNum);
      }
    }
  };

  // Sync dark theme class on the body
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardEstudiante
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
            onSelectScenario={handleSelectScenario}
          />
        );
      case 'planta':
        // Default context maps dynamically
        let defaultCtx = 'Minería';
        if (selectedSemester === 2 || selectedSemester === 3) defaultCtx = 'Alimenticia';
        if (selectedSemester === 4 || selectedSemester === 6) defaultCtx = 'Energía';
        if (selectedSemester === 8) defaultCtx = 'Química';

        return (
          <PlantaInteractiva defaultContext={defaultCtx} selectedScenario={selectedScenarioCode} />
        );
      case 'mantenimiento':
        return <SimuladorMantenimiento selectedSemester={selectedSemester} />;
      case 'fallas':
        return <SimuladorFallas />;
      case 'roadmap':
        return <RoadmapPresentacion />;
      default:
        return <DashboardEstudiante />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard de Progresión Curricular',
          sub: 'Monitoreo de actividades prácticas y competencias para 6,000 estudiantes'
        };
      case 'planta':
        return {
          title: 'Navegador de Planta Virtual',
          sub: 'Recorrido dinámico interactivo y flujos de procesos industriales'
        };
      case 'mantenimiento':
        return {
          title: 'Entorno de Mantenimiento Base y Avanzado',
          sub: 'Prácticas guiadas de alineación, lubricación y mediciones dimensionales'
        };
      case 'fallas':
        return {
          title: 'Simulador de Inyección de Fallas',
          sub: 'Telemetría en tiempo real y consola de diagnóstico predictivo'
        };
      case 'roadmap':
        return {
          title: 'Roadmap e Itinerario de Implementación',
          sub: 'Planificación estratégica y defensa del proyecto (Reunión del Viernes)'
        };
      default:
        return { title: 'Planta de Procesos Industriales', sub: '' };
    }
  };

  const headerInfo = getHeaderTitle();

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="app-sidebar">
        <div className="logo-container">
          <div className="logo-icon">PP</div>
          <div>
            <h1 className="logo-text">PlantaVirtual</h1>
            <span className="logo-sub">PC Digital Conf</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <GraduationCap size={18} />
            <span>Dashboard Alumno</span>
          </button>

          <button
            onClick={() => setActiveTab('planta')}
            className={`nav-item ${activeTab === 'planta' ? 'active' : ''}`}
          >
            <Map size={18} />
            <span>Planta Interactiva</span>
          </button>

          <button
            onClick={() => setActiveTab('mantenimiento')}
            className={`nav-item ${activeTab === 'mantenimiento' ? 'active' : ''}`}
          >
            <Wrench size={18} />
            <span>Simulador Mantenimiento</span>
          </button>

          <button
            onClick={() => setActiveTab('fallas')}
            className={`nav-item ${activeTab === 'fallas' ? 'active' : ''}`}
          >
            <ShieldAlert size={18} />
            <span>Simulador de Fallas</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>Roadmap / Hitos</span>
          </button>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="btn btn-secondary flex-center gap-12"
            style={{ padding: '8px', fontSize: '0.82rem' }}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDarkMode ? 'Tema Claro' : 'Tema Oscuro'}</span>
          </button>

          <div className="user-profile-badge">
            <div className="avatar">BG</div>
            <div className="user-info">
              <span className="user-name">Benjamín González</span>
              <span className="user-role">Ingeniería Conf.</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="main-wrapper">
        <header className="app-header">
          <div className="header-title-container">
            <h1>{headerInfo.title}</h1>
            <p>{headerInfo.sub}</p>
          </div>

          <div className="header-actions">
            {/* Onboarding Interactive Guide */}
            <TutorialGuiado activeTab={activeTab} setActiveTab={setActiveTab} />

            <button
              className="btn btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '50%' }}
            >
              <Bell size={16} />
            </button>
          </div>
        </header>

        <div className="content-container">{renderTabContent()}</div>
      </main>
    </div>
  );
}
