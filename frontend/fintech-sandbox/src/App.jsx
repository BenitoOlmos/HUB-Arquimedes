import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  ShieldAlert,
  Terminal as TermIcon,
  Activity,
  Database,
  RefreshCw,
  FileDown,
  Share2,
  AlertTriangle
} from 'lucide-react';
import NetworkGraph3D from './components/NetworkGraph3D';
import TransactionTerminal from './components/TransactionTerminal';
import CreditDashboard from './components/CreditDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal'); // terminal, graph, credit
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [evalStats, setEvalStats] = useState({
    falsePositives: 0,
    falseNegatives: 0,
    truePositives: 0,
    trueNegatives: 0,
    falsePositiveRate: 0,
    falseNegativeRate: 0,
    accuracy: 100,
    directLossesUSD: 0,
    frictionLossesUSD: 0
  });

  // API Webhook status
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [activeWebhook, setActiveWebhook] = useState(null);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [fraudOutbreakActive, setFraudOutbreakActive] = useState(false);

  // 1. Fetch initial accounts and stats on mount
  const fetchData = async () => {
    try {
      const accRes = await fetch('/api/finance/accounts');
      if (accRes.ok) {
        const data = await accRes.json();
        setAccounts(data);
      }

      const txRes = await fetch('/api/finance/transactions?limit=60');
      if (txRes.ok) {
        const data = await txRes.json();
        // Flatten nested service structure if exists
        const formatted = data.map((t) => ({
          id: t.id,
          sender: t.sender.accountNumber,
          receiver: t.receiver.accountNumber,
          amount: parseFloat(t.amount),
          timestamp: t.timestamp,
          ipAddress: t.ipAddress,
          isFlagged: t.isFlagged,
          isFraud: t.isFraud
        }));
        setTransactions(formatted);
      }

      const alertRes = await fetch('/api/finance/alerts');
      if (alertRes.ok) {
        const data = await alertRes.json();
        setActiveAlerts(data);
      }

      const metricsRes = await fetch('/api/finance/metrics');
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setEvalStats(data.evaluation);
        setActiveWebhook(data.webhookUrl);
        setWebhookUrlInput(data.webhookUrl || '');
      }
    } catch (error) {
      console.error('Error fetching sandbox data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    // 2. Establish WebSockets Telemetry Channel
    const socket = io(); // Autodetects host port via Vite proxy

    socket.on('connect', () => {
      console.log('Connected to Fintech Telemetry Stream');
    });

    socket.on('fintech-telemetry-update', (data) => {
      // Incoming telemetry: { transactions: [...], alerts: [...], evalStats: {...} }
      setTransactions(data.transactions);
      setActiveAlerts(data.alerts);
      setEvalStats(data.evalStats);

      // Update account balances occasionally by re-fetching
      fetch('/api/finance/accounts')
        .then((res) => res.json())
        .then(setAccounts)
        .catch(console.error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. Toggle Account Freeze status (Kill Switch)
  const handleToggleFreeze = async (accountId, isFrozen) => {
    try {
      const res = await fetch('/api/finance/accounts/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, isFrozen })
      });
      if (res.ok) {
        // Sync accounts
        setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, isFrozen } : a)));
      }
    } catch (error) {
      console.error('Error setting account freeze status:', error);
    }
  };

  // 4. Resolve AML alerts
  const handleResolveAlert = async (alertId) => {
    try {
      const res = await fetch(`/api/finance/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      if (res.ok) {
        setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (error) {
      console.error('Error resolving AML alert:', error);
    }
  };

  // 5. Submit Student Webhook URL
  const handleSaveWebhook = async (e) => {
    e.preventDefault();
    setSavingWebhook(true);
    try {
      const res = await fetch('/api/finance/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhookUrlInput || null })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveWebhook(data.url);
      }
    } catch (error) {
      console.error('Error updating webhook registration:', error);
    } finally {
      setSavingWebhook(false);
    }
  };

  // 6. Reset Simulation Session
  const handleResetSimulation = async () => {
    if (!window.confirm('¿Seguro que deseas purgar la sesión de entrenamiento actual?')) return;
    try {
      const res = await fetch('/api/finance/reset', { method: 'POST' });
      if (res.ok) {
        fetchData();
        setFraudOutbreakActive(false);
      }
    } catch (error) {
      console.error('Error resetting simulation:', error);
    }
  };

  // 7. Trigger Fraud Outbreak
  const handleTriggerOutbreak = () => {
    setFraudOutbreakActive(true);
    // Auto-disable after 30 seconds
    setTimeout(() => {
      setFraudOutbreakActive(false);
    }, 30000);
  };

  // 8. Export Transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Timestamp,Sender,Receiver,Amount,IPAddress,IsFlagged,IsFraud\n';

    transactions.forEach((t) => {
      const row = `${t.id},${t.timestamp},${t.sender},${t.receiver},${t.amount},${t.ipAddress},${t.isFlagged},${t.isFraud}`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fintech_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple handler to auto-select an account in details
  const handleSelectAccountFromGraph = (node) => {
    console.log('Graph selected account:', node);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Header Navigation Bar */}
      <header className="app-header">
        <div className="header-brand">
          <Database size={24} className="brand-icon" />
          <div>
            <h1 className="brand-title">FINTECH SANDBOX</h1>
            <div className="brand-subtitle">Core Bancario & Simulador AML</div>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            <TermIcon size={16} /> CONSOLA EN VIVO
          </button>
          <button
            className={`nav-tab ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            <Activity size={16} /> GRAFO WEBGL 3D
          </button>
          <button
            className={`nav-tab ${activeTab === 'credit' ? 'active' : ''}`}
            onClick={() => setActiveTab('credit')}
          >
            <Database size={16} /> STRESS CREDITICIO
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="pulse-dot active"></span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              color: 'var(--neon-green)'
            }}
          >
            SIMULACIÓN EN VIVO
          </span>
        </div>
      </header>

      {/* 2. Main Dashboard Panel Split */}
      <div className="dashboard-container">
        {/* Left Side: SecOps parameters / Webhooks / Scoreboards */}
        <aside className="sidebar-panel">
          {/* ML Webhook Connector */}
          <div className="cyber-card cyan">
            <div className="card-title">
              <Share2 size={16} /> Webhook de IA (Estudiante)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Registra tu URL local de Jupyter / FastAPI (POST `/predict`). Recibirás payloads de
              cada transacción para clasificarlos.
            </p>
            <form onSubmit={handleSaveWebhook} className="form-group">
              <input
                type="url"
                placeholder="http://localhost:8000/predict"
                className="cyber-input"
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
              />
              <button
                type="submit"
                className="cyber-button"
                disabled={savingWebhook}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {savingWebhook ? 'Conectando...' : 'Guardar y Enlazar Webhook'}
              </button>
            </form>

            <div style={{ marginTop: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              Estatus Webhook:{' '}
              {activeWebhook ? (
                <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>ENLAZADO</span>
              ) : (
                <span style={{ color: 'var(--neon-yellow)' }}>POR DEFECTO (REGLAS AML)</span>
              )}
            </div>
          </div>

          {/* Outbreak banner */}
          {fraudOutbreakActive && (
            <div
              className="cyber-card magenta"
              style={{ borderLeftWidth: '4px', animation: 'pulse 2s infinite' }}
            >
              <div className="card-title" style={{ color: 'var(--neon-magenta)' }}>
                <AlertTriangle size={18} /> BROTE DE FRAUDE EN CURSO
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-bright)' }}>
                El docente ha gatillado un ataque masivo de Carding a través de IPs Tor. Ajusta tu
                algoritmo o congela las cuentas asociadas.
              </p>
            </div>
          )}

          {/* Gamification metrics board */}
          <div className="cyber-card green">
            <div className="card-title">
              <Activity size={16} /> Evaluación SecOps (Modelo ML)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div
                  style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}
                >
                  <span className="metric-subtitle">Precisión (Acc)</span>
                  <div
                    className="metric-value"
                    style={{ color: 'var(--neon-cyan)', fontSize: '20px' }}
                  >
                    {evalStats.accuracy}%
                  </div>
                </div>
                <div
                  style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}
                >
                  <span className="metric-subtitle">Falsos Positivos</span>
                  <div
                    className="metric-value"
                    style={{ color: 'var(--neon-yellow)', fontSize: '20px' }}
                  >
                    {evalStats.falsePositives}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Fricción al cliente
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div
                  style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}
                >
                  <span className="metric-subtitle">Falsos Negativos</span>
                  <div
                    className="metric-value"
                    style={{ color: 'var(--neon-magenta)', fontSize: '20px' }}
                  >
                    {evalStats.falseNegatives}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Fraudes filtrados
                  </span>
                </div>
                <div
                  style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}
                >
                  <span className="metric-subtitle">FPR / FNR Rates</span>
                  <div
                    style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', marginTop: '6px' }}
                  >
                    FPR:{' '}
                    <span style={{ color: 'var(--neon-yellow)' }}>
                      {evalStats.falsePositiveRate}%
                    </span>
                    <br />
                    FNR:{' '}
                    <span style={{ color: 'var(--neon-magenta)' }}>
                      {evalStats.falseNegativeRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Balance / Losses */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    marginBottom: '4px'
                  }}
                >
                  <span>Pérdida por Fraudes:</span>
                  <span style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-mono)' }}>
                    -${evalStats.directLossesUSD.toLocaleString('es-ES')} USD
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    marginBottom: '8px'
                  }}
                >
                  <span>Multas por Fricción:</span>
                  <span style={{ color: 'var(--neon-yellow)', fontFamily: 'var(--font-mono)' }}>
                    -${evalStats.frictionLossesUSD.toLocaleString('es-ES')} USD
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderTop: '1px dashed rgba(255,255,255,0.1)',
                    paddingTop: '8px'
                  }}
                >
                  <span>Impacto Financiero:</span>
                  <span style={{ color: 'var(--text-bright)', fontFamily: 'var(--font-mono)' }}>
                    -$
                    {(evalStats.directLossesUSD + evalStats.frictionLossesUSD).toLocaleString(
                      'es-ES'
                    )}{' '}
                    USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="cyber-card">
            <div className="card-title">
              <RefreshCw size={16} /> Centro de Comando Docente
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleTriggerOutbreak}
                className="cyber-button danger"
                disabled={fraudOutbreakActive}
                style={{ width: '100%' }}
              >
                Gatillar Brote de Fraude
              </button>

              <button onClick={handleExportCSV} className="cyber-button" style={{ width: '100%' }}>
                <FileDown size={14} style={{ marginRight: '6px' }} /> Exportar Transacciones (CSV)
              </button>

              <button
                onClick={handleResetSimulation}
                className="cyber-button"
                style={{ width: '100%', borderColor: '#888', color: '#888' }}
              >
                Reiniciar Simulación
              </button>
            </div>
          </div>
        </aside>

        {/* Right Side: Main Dynamic Workspaces */}
        <main className="main-workspace">
          {activeTab === 'terminal' && (
            <TransactionTerminal
              transactions={transactions}
              accounts={accounts}
              onToggleFreeze={handleToggleFreeze}
              activeAlerts={activeAlerts}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {activeTab === 'graph' && (
            <NetworkGraph3D
              accounts={accounts}
              transactions={transactions}
              onSelectAccount={handleSelectAccountFromGraph}
            />
          )}

          {activeTab === 'credit' && <CreditDashboard accounts={accounts} />}
        </main>
      </div>
    </div>
  );
}
