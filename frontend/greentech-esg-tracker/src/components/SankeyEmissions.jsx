import React, { useState } from 'react';

const SankeyEmissions = ({ activities }) => {
  const [hoveredLink, setHoveredLink] = useState(null);

  // Filter and aggregate Scope 3 activities
  const scope3Activities = activities.filter((act) => act.scope === 3);

  // Group emissions by category
  const categoriesMap = {
    FLIGHT: { name: 'Viajes Aéreos', type: 'Travel', flow: 'Upstream', val: 0 },
    LOGISTICS_ROAD: { name: 'Logística Terrestre', type: 'Transport', flow: 'Upstream', val: 0 },
    WASTE_LANDFILL: { name: 'Residuos Vertedero', type: 'Disposal', flow: 'Downstream', val: 0 },
    PLASTIC_VIRGIN: {
      name: 'Materiales (Plásticos)',
      type: 'Procurement',
      flow: 'Upstream',
      val: 0
    },
    PAPER_RECYCLED: { name: 'Materiales (Papel)', type: 'Procurement', flow: 'Upstream', val: 0 }
  };

  scope3Activities.forEach((act) => {
    if (categoriesMap[act.category]) {
      categoriesMap[act.category].val += act.calculatedCo2e;
    }
  });

  // Define nodes layout: 3 columns
  // Column 1: Sources (Supplier, Business, End-of-life)
  // Column 2: Specific categories
  // Column 3: Destination (Scope 3 Upstream vs Scope 3 Downstream)

  const col1 = [
    {
      id: 'src_procure',
      label: 'Adquisición de Materias Primas',
      val: categoriesMap.PLASTIC_VIRGIN.val + categoriesMap.PAPER_RECYCLED.val,
      color: '#a855f7'
    },
    {
      id: 'src_transport',
      label: 'Transporte y Distribución',
      val: categoriesMap.LOGISTICS_ROAD.val,
      color: '#f59e0b'
    },
    {
      id: 'src_travel',
      label: 'Viajes de Negocio',
      val: categoriesMap.FLIGHT.val,
      color: '#3b82f6'
    },
    {
      id: 'src_waste',
      label: 'Fin de Vida de Productos',
      val: categoriesMap.WASTE_LANDFILL.val,
      color: '#10b981'
    }
  ];

  const col2 = [
    {
      id: 'cat_plastic',
      label: 'Plásticos Vírgenes',
      val: categoriesMap.PLASTIC_VIRGIN.val,
      color: '#8b5cf6'
    },
    {
      id: 'cat_paper',
      label: 'Papel Reciclado',
      val: categoriesMap.PAPER_RECYCLED.val,
      color: '#a78bfa'
    },
    {
      id: 'cat_road',
      label: 'Fletes Terrestres',
      val: categoriesMap.LOGISTICS_ROAD.val,
      color: '#fbbf24'
    },
    {
      id: 'cat_flight',
      label: 'Vuelos Comerciales',
      val: categoriesMap.FLIGHT.val,
      color: '#60a5fa'
    },
    {
      id: 'cat_landfill',
      label: 'Residuos en Vertedero',
      val: categoriesMap.WASTE_LANDFILL.val,
      color: '#34d399'
    }
  ];

  const col3 = [
    {
      id: 'dest_upstream',
      label: 'Alcance 3 (Upstream)',
      val: col1[0].val + col1[1].val + col1[2].val,
      color: '#00e5ff'
    },
    { id: 'dest_downstream', label: 'Alcance 3 (Downstream)', val: col1[3].val, color: '#10b981' }
  ];

  // Map heights and Y coordinates based on total value
  const totalScope3 = col1.reduce((sum, item) => sum + item.val, 0) || 1;
  const canvasHeight = 350;
  const canvasWidth = 750;
  const nodeWidth = 20;

  // Calculate coordinates for nodes
  const xCol1 = 50;
  const xCol2 = 360;
  const xCol3 = 660;

  const spacing = 15;
  const totalSpacing1 = spacing * (col1.length - 1);
  const totalSpacing2 = spacing * (col2.length - 1);
  const totalSpacing3 = spacing * (col3.length - 1);

  const scaleY1 = (canvasHeight - totalSpacing1) / totalScope3;
  const scaleY2 = (canvasHeight - totalSpacing2) / totalScope3;
  const scaleY3 = (canvasHeight - totalSpacing3) / totalScope3;

  // Compute node Y positions and heights
  let yOffset = 0;
  const nodes = {};

  col1.forEach((node) => {
    const h = Math.max(8, node.val * scaleY1);
    nodes[node.id] = {
      x: xCol1,
      y: yOffset,
      w: nodeWidth,
      h,
      color: node.color,
      label: node.label,
      val: node.val
    };
    yOffset += h + spacing;
  });

  yOffset = 0;
  col2.forEach((node) => {
    const h = Math.max(8, node.val * scaleY2);
    nodes[node.id] = {
      x: xCol2,
      y: yOffset,
      w: nodeWidth,
      h,
      color: node.color,
      label: node.label,
      val: node.val
    };
    yOffset += h + spacing;
  });

  yOffset = 0;
  col3.forEach((node) => {
    const h = Math.max(8, node.val * scaleY3);
    nodes[node.id] = {
      x: xCol3,
      y: yOffset,
      w: nodeWidth,
      h,
      color: node.color,
      label: node.label,
      val: node.val
    };
    yOffset += h + spacing;
  });

  // Calculate links
  const links = [];

  // Track output offsets for node columns to stack link flows
  const outOffsets = {};
  const inOffsets = {};
  Object.keys(nodes).forEach((id) => {
    outOffsets[id] = 0;
    inOffsets[id] = 0;
  });

  // Links Column 1 to Column 2
  // link 1: src_procure -> cat_plastic
  // link 2: src_procure -> cat_paper
  // link 3: src_transport -> cat_road
  // link 4: src_travel -> cat_flight
  // link 5: src_waste -> cat_landfill

  const addLink = (sourceId, targetId, val) => {
    if (val <= 0) return;
    const sNode = nodes[sourceId];
    const tNode = nodes[targetId];

    // Scale link heights locally
    const sH = (val / sNode.val) * sNode.h;
    const tH = (val / tNode.val) * tNode.h;

    const sy = sNode.y + outOffsets[sourceId];
    const ty = tNode.y + inOffsets[targetId];

    links.push({
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      x0: sNode.x + sNode.w,
      y0: sy + sH / 2,
      x1: tNode.x,
      y1: ty + tH / 2,
      width: sH,
      val,
      color: sNode.color
    });

    outOffsets[sourceId] += sH;
    inOffsets[targetId] += tH;
  };

  addLink('src_procure', 'cat_plastic', categoriesMap.PLASTIC_VIRGIN.val);
  addLink('src_procure', 'cat_paper', categoriesMap.PAPER_RECYCLED.val);
  addLink('src_transport', 'cat_road', categoriesMap.LOGISTICS_ROAD.val);
  addLink('src_travel', 'cat_flight', categoriesMap.FLIGHT.val);
  addLink('src_waste', 'cat_landfill', categoriesMap.WASTE_LANDFILL.val);

  // Links Column 2 to Column 3
  addLink('cat_plastic', 'dest_upstream', categoriesMap.PLASTIC_VIRGIN.val);
  addLink('cat_paper', 'dest_upstream', categoriesMap.PAPER_RECYCLED.val);
  addLink('cat_road', 'dest_upstream', categoriesMap.LOGISTICS_ROAD.val);
  addLink('cat_flight', 'dest_upstream', categoriesMap.FLIGHT.val);
  addLink('cat_landfill', 'dest_downstream', categoriesMap.WASTE_LANDFILL.val);

  // Render curved Bezier paths
  const getBezierPath = (x0, y0, x1, y1) => {
    const cx = (x0 + x1) / 2;
    return `M ${x0} ${y0} C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  };

  return (
    <div className="glass-panel relative flex flex-col items-center">
      <h3 className="text-sm font-mono text-cyan-400 tracking-wider mb-4 self-start flex items-center">
        <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
        FLUJO DE CARBONO ALCANCE 3 (SANKEY DIAGRAM)
      </h3>
      {totalScope3 <= 0 ? (
        <div className="h-[350px] flex items-center justify-center text-xs font-mono text-slate-500">
          Sin datos de Alcance 3 auditados
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          width="100%"
          height="100%"
          className="max-h-[350px]"
        >
          {/* Render links */}
          <g>
            {links.map((link) => {
              const isHovered = hoveredLink === link.id;
              return (
                <path
                  key={link.id}
                  d={getBezierPath(link.x0, link.y0, link.x1, link.y1)}
                  stroke={link.color}
                  strokeWidth={link.width}
                  className="sankey-link"
                  style={{ strokeOpacity: isHovered ? 0.45 : 0.15 }}
                  onMouseEnter={() => setHoveredLink(link.id)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
              );
            })}
          </g>

          {/* Render nodes */}
          <g>
            {Object.entries(nodes).map(([id, node]) => (
              <g key={id} className="sankey-node">
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  fill={node.color}
                  rx={3}
                  stroke={node.color}
                  strokeOpacity={0.8}
                />
                <text
                  x={node.x + (node.x > 300 ? -8 : node.w + 8)}
                  y={node.y + node.h / 2 + 3}
                  textAnchor={node.x > 300 ? 'end' : 'start'}
                >
                  {node.label} ({node.val.toFixed(1)} t)
                </text>
              </g>
            ))}
          </g>
        </svg>
      )}

      {/* Hover Info Tooltip */}
      {hoveredLink &&
        (() => {
          const link = links.find((l) => l.id === hoveredLink);
          if (!link) return null;
          const sourceLabel = nodes[link.source].label;
          const targetLabel = nodes[link.target].label;
          return (
            <div className="absolute bottom-2 left-4 bg-slate-950/90 border border-cyan-500/30 px-3 py-1.5 rounded text-xxs font-mono text-slate-300">
              Flujo: <span className="text-cyan-400 font-bold">{sourceLabel}</span> ➔{' '}
              <span className="text-emerald-400 font-bold">{targetLabel}</span>:{' '}
              <span className="text-white font-bold">{link.val.toFixed(2)} tCO2e</span>
            </div>
          );
        })()}
    </div>
  );
};

export default SankeyEmissions;
