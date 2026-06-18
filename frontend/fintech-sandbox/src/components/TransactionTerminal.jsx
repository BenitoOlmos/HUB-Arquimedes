import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, Eye, Volume2, VolumeX, Ban, Unlock } from 'lucide-react';

export default function TransactionTerminal({ 
  transactions, 
  accounts, 
  onToggleFreeze, 
  activeAlerts,
  onResolveAlert 
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, fraud, flagged
  const [audioEnabled, setAudioEnabled] = useState(false);
  const prevTxCountRef = useRef(transactions.length);

  // Play alert sound on new fraud transaction if enabled
  useEffect(() => {
    if (!audioEnabled || transactions.length === 0) return;
    
    // Check if there are new transactions and if any of them are fraud
    if (transactions.length > prevTxCountRef.current) {
      const newTransactions = transactions.slice(0, transactions.length - prevTxCountRef.current);
      const hasNewFraud = newTransactions.some(t => t.isFraud);
      if (hasNewFraud) {
        playAlertSound();
      }
    }
    prevTxCountRef.current = transactions.length;
  }, [transactions, audioEnabled]);

  const playAlertSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      // Cyber double beep
      const playBeep = (freq, start, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(100, start + duration);
        
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      playBeep(987.77, audioCtx.currentTime, 0.1); // B5
      playBeep(1318.51, audioCtx.currentTime + 0.12, 0.15); // E6
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const query = filterQuery.toLowerCase();
    const matchesQuery = 
      t.sender.toLowerCase().includes(query) || 
      t.receiver.toLowerCase().includes(query) || 
      t.ipAddress.toLowerCase().includes(query) ||
      (t.id && t.id.toLowerCase().includes(query));

    if (filterType === 'fraud') {
      return matchesQuery && t.isFraud;
    }
    if (filterType === 'flagged') {
      return matchesQuery && t.isFlagged;
    }
    return matchesQuery;
  });

  const getAccountStatus = (accountNumber) => {
    const acc = accounts.find(a => a.accountNumber === accountNumber);
    return acc ? acc.isFrozen : false;
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '--:--:--';
    }
  };

  return (
    <div className="ticker-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* SecOps Terminal Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Buscar por Cuenta / IP..."
            className="cyber-input"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{ width: '220px' }}
          />
          <select
            className="cyber-input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '130px' }}
          >
            <option value="all">Todas</option>
            <option value="fraud">Verdad Fraude</option>
            <option value="flagged">Marcadas AML</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label className="audio-toggle">
            <input 
              type="checkbox" 
              checked={audioEnabled}
              onChange={(e) => setAudioEnabled(e.target.checked)}
            />
            <div className="audio-switch"></div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              {audioEnabled ? <Volume2 size={14} className="badge-cyan" /> : <VolumeX size={14} />}
              ALARMAS
            </span>
          </label>
        </div>
      </div>

      {/* AML Alerts Panel */}
      {activeAlerts.length > 0 && (
        <div className="cyber-card magenta" style={{ padding: '12px', marginBottom: '16px', borderLeftWidth: '4px' }}>
          <div className="card-title" style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--neon-magenta)' }}>
            <ShieldAlert size={16} /> {activeAlerts.length} ALERTAS DE RIESGO AML POR RESOLVER
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
            {activeAlerts.map(alert => (
              <div key={alert.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                <span>Regla: <strong>{alert.ruleTriggered}</strong> | Sev: <strong>{alert.severity}</strong></span>
                <button 
                  onClick={() => onResolveAlert(alert.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--neon-magenta)',
                    color: 'var(--neon-magenta)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticker Grid Header */}
      <div className="ticker-header">
        <div>Hora</div>
        <div>Origen</div>
        <div>Destino</div>
        <div>Monto</div>
        <div>Dirección IP</div>
        <div>Verificación</div>
        <div>Kill Switch</div>
      </div>

      {/* Ticker Rows */}
      <div className="ticker-rows">
        {filteredTransactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px'
          }}>
            [ ESPERANDO FLUJO TRANSACCIONAL EN VIVO... ]
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const senderFrozen = getAccountStatus(tx.sender);
            return (
              <div key={tx.id} className={`ticker-row ${tx.isFraud ? 'fraud' : ''} ${tx.isFlagged ? 'flagged' : ''}`}>
                <div style={{ color: 'var(--text-muted)' }}>{formatTime(tx.timestamp)}</div>
                
                <div style={{ color: senderFrozen ? '#888' : 'var(--text-bright)', textDecoration: senderFrozen ? 'line-through' : 'none' }}>
                  {tx.sender}
                </div>
                
                <div>{tx.receiver}</div>
                
                <div style={{ fontWeight: '700', color: tx.isFraud ? 'var(--neon-magenta)' : 'var(--neon-green)' }}>
                  ${parseFloat(tx.amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                
                <div style={{ color: 'var(--text-muted)' }}>{tx.ipAddress}</div>
                
                <div>
                  {tx.isFraud ? (
                    <span className="badge magenta" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={10} /> FRAUDE
                    </span>
                  ) : tx.isFlagged ? (
                    <span className="badge yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={10} /> FLAG
                    </span>
                  ) : (
                    <span className="badge green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={10} /> OK
                    </span>
                  )}
                </div>
                
                <div>
                  <button
                    onClick={() => {
                      // Find sender account info
                      const senderAcc = accounts.find(a => a.accountNumber === tx.sender);
                      if (senderAcc) {
                        onToggleFreeze(senderAcc.id, !senderFrozen);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: senderFrozen ? 'var(--neon-green)' : 'var(--neon-magenta)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px'
                    }}
                    title={senderFrozen ? "Descongelar cuenta" : "Congelar cuenta"}
                  >
                    {senderFrozen ? (
                      <>
                        <Unlock size={14} /> DESCONG
                      </>
                    ) : (
                      <>
                        <Ban size={14} /> CONGELAR
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
