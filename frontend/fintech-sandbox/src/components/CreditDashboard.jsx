import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { Landmark, TrendingUp, ShieldAlert, Award, Search } from 'lucide-react';

export default function CreditDashboard({ accounts }) {
  const [interestRate, setInterestRate] = useState(5.75); // Fictitious central bank policy rate
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Calculate Portfolio metrics based on interest rate stress
  // LGD (Loss Given Default) is assumed to be 45% (industry standard)
  const LGD = 0.45;

  const stressedPortfolio = useMemo(() => {
    return accounts.map(acc => {
      // Base Probability of Default (PD) derived from riskScore
      const basePD = acc.riskScore / 200; // 0.005 to 0.5
      // Rate impact: Higher rate increases probability of default due to payment cost increases
      const rateDiff = interestRate - 5.0; // Benchmark around 5%
      const rateImpact = rateDiff > 0 ? rateDiff * 0.035 : rateDiff * 0.02;
      const pd = Math.max(0.01, Math.min(0.99, basePD + rateImpact));
      
      const balanceNum = parseFloat(acc.balance);
      const expectedLoss = balanceNum * pd * LGD;

      // Classify Risk Category
      let category = 'A (Bajo)';
      let color = '#39ff14';
      if (pd > 0.45) {
        category = 'E (Crítico)';
        color = '#ff007f';
      } else if (pd > 0.30) {
        category = 'D (Alto)';
        color = '#ff9f00';
      } else if (pd > 0.15) {
        category = 'C (Medio)';
        color = '#fff000';
      } else if (pd > 0.08) {
        category = 'B (Moderado)';
        color = '#00f0ff';
      }

      return {
        ...acc,
        pd: pd,
        expectedLoss: expectedLoss,
        category: category,
        color: color
      };
    });
  }, [accounts, interestRate]);

  // 2. Aggregate metrics
  const portfolioStats = useMemo(() => {
    let totalBalance = 0;
    let totalExpectedLoss = 0;
    let countA = 0, countB = 0, countC = 0, countD = 0, countE = 0;

    stressedPortfolio.forEach(item => {
      const bal = parseFloat(item.balance);
      totalBalance += bal;
      totalExpectedLoss += item.expectedLoss;

      if (item.category.startsWith('A')) countA++;
      else if (item.category.startsWith('B')) countB++;
      else if (item.category.startsWith('C')) countC++;
      else if (item.category.startsWith('D')) countD++;
      else countE++;
    });

    const averagePD = stressedPortfolio.reduce((acc, curr) => acc + curr.pd, 0) / (stressedPortfolio.length || 1);

    return {
      totalBalance,
      totalExpectedLoss,
      averagePD: averagePD * 100,
      distribution: [
        { name: 'Cat A (Bajo)', cantidad: countA, color: '#39ff14' },
        { name: 'Cat B (Mod)', cantidad: countB, color: '#00f0ff' },
        { name: 'Cat C (Med)', cantidad: countC, color: '#fff000' },
        { name: 'Cat D (Alto)', cantidad: countD, color: '#ff9f00' },
        { name: 'Cat E (Crit)', cantidad: countE, color: '#ff007f' }
      ]
    };
  }, [stressedPortfolio]);

  // 3. Pre-calculate expected loss curves across rates 1% to 15% for plotting
  const expectedLossCurve = useMemo(() => {
    const data = [];
    for (let rate = 1.0; rate <= 15.0; rate += 1.0) {
      let tempLoss = 0;
      accounts.forEach(acc => {
        const basePD = acc.riskScore / 200;
        const rateDiff = rate - 5.0;
        const rateImpact = rateDiff > 0 ? rateDiff * 0.035 : rateDiff * 0.02;
        const pd = Math.max(0.01, Math.min(0.99, basePD + rateImpact));
        tempLoss += parseFloat(acc.balance) * pd * LGD;
      });
      data.push({
        tasa: `${rate}%`,
        loss: Math.round(tempLoss),
      });
    }
    return data;
  }, [accounts]);

  // 4. Search Filter
  const filteredAccounts = stressedPortfolio.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.ownerName.toLowerCase().includes(term) ||
      a.accountNumber.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
      
      {/* LEFT: Client Directory with Risk Metrics */}
      <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <div className="card-title">
          <Award size={16} /> Directorio de Riesgo Crediticio
        </div>
        
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Buscar cliente, cuenta, clasificación..."
            className="cyber-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
        </div>

        {/* Client Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px' }}>Titular / Cuenta</th>
                <th style={{ padding: '8px' }}>Balance</th>
                <th style={{ padding: '8px' }}>Score</th>
                <th style={{ padding: '8px' }}>Prob. Default (PD)</th>
                <th style={{ padding: '8px' }}>Clase</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(acc => (
                <tr key={acc.id} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  opacity: acc.isFrozen ? 0.5 : 1
                }}>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{acc.ownerName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{acc.accountNumber}</div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    ${parseFloat(acc.balance).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: '10px 8px' }}>{acc.riskScore}</td>
                  <td style={{ padding: '10px 8px', color: acc.color }}>
                    {(acc.pd * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span className="badge" style={{ 
                      borderColor: acc.color, 
                      color: acc.color,
                      background: `${acc.color}15`
                    }}>
                      Cat {acc.category.split(' ')[0]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Stress Testing Controls & Analytics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Macroeconomic Interest Slider */}
        <div className="cyber-card cyan">
          <div className="card-title">
            <Landmark size={16} /> Simulador de Estrés Macroeconómico
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Ajusta la Tasa de Política Monetaria del Banco Central. Tipos de interés elevados encarecen el crédito incrementando la tasa de impago de la cartera.
          </p>
          
          <div className="slider-group">
            <div className="slider-labels">
              <span>Tasa Base (Bajo estrés)</span>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '15px' }}>{interestRate.toFixed(2)}%</span>
              <span>Límite (Hiperinflación)</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.25"
              value={interestRate}
              className="cyber-slider"
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
              <div className="metric-subtitle">Default Medio (PD)</div>
              <div className="metric-value" style={{ color: 'var(--neon-cyan)', fontSize: '22px' }}>
                {portfolioStats.averagePD.toFixed(2)}%
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
              <div className="metric-subtitle">Pérdida Esperada (EL)</div>
              <div className="metric-value" style={{ color: 'var(--neon-magenta)', fontSize: '22px' }}>
                ${Math.round(portfolioStats.totalExpectedLoss).toLocaleString('es-ES')}
              </div>
            </div>
          </div>
        </div>

        {/* Expected Loss curve chart */}
        <div className="cyber-card">
          <div className="card-title">
            <TrendingUp size={16} /> Curva de Pérdida Esperada vs. Tasa Interés
          </div>
          <div style={{ height: '140px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expectedLossCurve} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--neon-magenta)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--neon-magenta)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="tasa" tick={{ fill: '#8b9bb4', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fill: '#8b9bb4', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip 
                  contentStyle={{ background: '#101424', borderColor: 'var(--border-color)', color: 'var(--text-bright)' }}
                  labelStyle={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}
                />
                <Area type="monotone" dataKey="loss" stroke="var(--neon-magenta)" fillOpacity={1} fill="url(#lossGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution bar chart */}
        <div className="cyber-card">
          <div className="card-title">
            <ShieldAlert size={16} /> Clasificación de Clientes por Riesgo
          </div>
          <div style={{ height: '140px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolioStats.distribution} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#8b9bb4', fontSize: 9 }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fill: '#8b9bb4', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip 
                  contentStyle={{ background: '#101424', borderColor: 'var(--border-color)', color: 'var(--text-bright)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="cantidad" fill="var(--neon-cyan)" radius={[4, 4, 0, 0]}>
                  {portfolioStats.distribution.map((entry, index) => (
                    <span key={`cell-${index}`} style={{ fill: entry.color }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
