import React, { useEffect, useRef, useState } from 'react';

export default function NetworkGraph3D({ accounts, transactions, onSelectAccount }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const particlesRef = useRef([]);
  const prevTxIdsRef = useRef(new Set());

  useEffect(() => {
    if (accounts.length === 0) return;

    const prevNodesMap = new Map(nodesRef.current.map((n) => [n.id, n]));
    const newNodes = accounts.map((acc, idx) => {
      const existing = prevNodesMap.get(acc.id);
      if (existing) {
        existing.riskScore = acc.riskScore;
        existing.isFrozen = acc.isFrozen;
        existing.balance = acc.balance;
        return existing;
      }

      const angle = (idx / accounts.length) * Math.PI * 2;
      const radius = 120;
      return {
        id: acc.id,
        accountNumber: acc.accountNumber,
        ownerName: acc.ownerName,
        riskScore: acc.riskScore,
        isFrozen: acc.isFrozen,
        balance: acc.balance,
        x: 400 + Math.cos(angle) * radius,
        y: 240 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0
      };
    });
    nodesRef.current = newNodes;

    const links = [];
    const linksMap = new Map();

    transactions.forEach((t) => {
      const senderAcc = accounts.find((a) => a.accountNumber === t.sender);
      const receiverAcc = accounts.find((a) => a.accountNumber === t.receiver);
      if (!senderAcc || !receiverAcc) return;

      const key = `${senderAcc.id}-${receiverAcc.id}`;
      const revKey = `${receiverAcc.id}-${senderAcc.id}`;

      if (!linksMap.has(key) && !linksMap.has(revKey)) {
        linksMap.set(key, {
          sourceId: senderAcc.id,
          targetId: receiverAcc.id,
          isFraud: t.isFraud
        });
      }
    });

    linksMap.forEach((l) => {
      const source = nodesRef.current.find((n) => n.id === l.sourceId);
      const target = nodesRef.current.find((n) => n.id === l.targetId);
      if (source && target) {
        links.push({ source, target, isFraud: l.isFraud });
      }
    });
    linksRef.current = links;

    const currentTxIds = new Set(transactions.map((t) => t.id));
    transactions.forEach((t) => {
      if (!prevTxIdsRef.current.has(t.id)) {
        const sourceNode = nodesRef.current.find((n) => n.accountNumber === t.sender);
        const targetNode = nodesRef.current.find((n) => n.accountNumber === t.receiver);
        if (sourceNode && targetNode) {
          particlesRef.current.push({
            id: t.id,
            source: sourceNode,
            target: targetNode,
            progress: 0,
            speed: 0.02 + Math.random() * 0.01,
            isFraud: t.isFraud
          });
        }
      }
    });
    prevTxIdsRef.current = currentTxIds;
  }, [accounts, transactions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const runSimulation = () => {
      const width = canvas.width;
      const height = canvas.height;
      const nodes = nodesRef.current;
      const links = linksRef.current;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 100) {
            const force = 1.2 / (dist * dist);
            const fx = (dx / dist) * force * 150;
            const fy = (dy / dist) * force * 150;

            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }
      }

      links.forEach((l) => {
        const dx = l.target.x - l.source.x;
        const dy = l.target.y - l.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = 0.015 * (dist - 80);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        l.source.vx += fx;
        l.source.vy += fy;
        l.target.vx -= fx;
        l.target.vy -= fy;
      });

      nodes.forEach((n) => {
        const dx = width / 2 - n.x;
        const dy = height / 2 - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        n.vx += (dx / dist) * 0.05;
        n.vy += (dy / dist) * 0.05;

        n.vx *= 0.85;
        n.vy *= 0.85;

        n.x += n.vx;
        n.y += n.vy;

        n.x = Math.max(20, Math.min(width - 20, n.x));
        n.y = Math.max(20, Math.min(height - 20, n.y));
      });

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      links.forEach((l) => {
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.strokeStyle = l.isFraud ? 'rgba(239, 68, 68, 0.35)' : 'rgba(15, 23, 42, 0.08)';
        ctx.lineWidth = l.isFraud ? 2 : 1;
        ctx.stroke();
      });

      particlesRef.current = particlesRef.current.filter((p) => p.progress < 1);
      particlesRef.current.forEach((p) => {
        p.progress += p.speed;
        const x = p.source.x + (p.target.x - p.source.x) * p.progress;
        const y = p.source.y + (p.target.y - p.source.y) * p.progress;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.isFraud ? '#ef4444' : '#0ea5e9';
        ctx.fill();
      });

      nodes.forEach((n) => {
        const isHovered = hoveredNode?.id === n.id;
        const isSelected = selectedNode?.id === n.id;

        let color = '#10b981';
        let strokeColor = '#059669';
        if (n.isFrozen) {
          color = '#94a3b8';
          strokeColor = '#64748b';
        } else if (n.riskScore > 75) {
          color = '#ef4444';
          strokeColor = '#b91c1c';
        } else if (n.riskScore > 40) {
          color = '#f59e0b';
          strokeColor = '#d97706';
        }

        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, isSelected ? 18 : 14, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(15, 23, 42, 0.05)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#0ea5e9' : 'rgba(15, 23, 42, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#0ea5e9' : 'var(--text-primary)';
        ctx.font = isSelected ? 'bold 10px sans-serif' : '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.ownerName, n.x, n.y - 12);
      });

      animId = requestAnimationFrame(runSimulation);
    };

    runSimulation();
    return () => cancelAnimationFrame(animId);
  }, [hoveredNode, selectedNode]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const found = nodesRef.current.find((n) => {
      const dist = Math.sqrt(Math.pow(x - n.x, 2) + Math.pow(y - n.y, 2));
      return dist < 12;
    });

    setHoveredNode(found || null);
  };

  const handleMouseClick = (e) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
      onSelectAccount(hoveredNode);
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div
      className="canvas-wrapper"
      style={{ height: '520px', width: '100%', position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          cursor: hoveredNode ? 'pointer' : 'default'
        }}
      />

      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-glass)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontFamily: 'inherit',
            fontSize: '11px',
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-premium)',
            zIndex: 20
          }}
        >
          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
            {hoveredNode.ownerName}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Cta: {hoveredNode.accountNumber}</div>
          <div
            style={{
              fontWeight: 'bold',
              color:
                hoveredNode.riskScore > 75
                  ? '#ef4444'
                  : hoveredNode.riskScore > 40
                    ? '#f59e0b'
                    : '#10b981'
            }}
          >
            Riesgo: {hoveredNode.riskScore}/100
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '11px',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 10,
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}
          ></span>
          <span style={{ color: 'var(--text-secondary)' }}>Riesgo Bajo (&lt;40)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }}
          ></span>
          <span style={{ color: 'var(--text-secondary)' }}>Riesgo Medio (40-75)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}
          ></span>
          <span style={{ color: 'var(--text-secondary)' }}>Riesgo Alto/Fraude (&gt;75)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}
          ></span>
          <span style={{ color: 'var(--text-secondary)' }}>Cuenta Congelada</span>
        </div>
      </div>
    </div>
  );
}
