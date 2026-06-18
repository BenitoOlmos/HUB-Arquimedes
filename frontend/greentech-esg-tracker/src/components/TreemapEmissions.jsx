import React from 'react';

const TreemapEmissions = ({ activities, facilities }) => {
  // Aggregate total emissions per facility
  const facilityEmissions = facilities.map((f) => {
    const total = activities
      .filter((act) => act.facilityId === f.id)
      .reduce((sum, act) => sum + act.calculatedCo2e, 0);
    return {
      id: f.id,
      name: f.name,
      country: f.country,
      val: total
    };
  });

  // Sort descending
  facilityEmissions.sort((a, b) => b.val - a.val);

  const grandTotal = facilityEmissions.reduce((sum, f) => sum + f.val, 0) || 1;

  // Squarish grid partitioning for 4 items in a 100% x 220px box
  // Layout logic:
  // Item 0 (largest): Left 50%
  // Item 1 (second): Top right (50% w, 60% h)
  // Item 2 (third): Bottom right-left (25% w, 40% h)
  // Item 3 (fourth): Bottom right-right (25% w, 40% h)

  // Let's compute percentages dynamically
  const p0 = facilityEmissions[0]?.val / grandTotal || 0.4;
  const p1 = facilityEmissions[1]?.val / (grandTotal - facilityEmissions[0]?.val) || 0.5;

  const leftWidth = p0 * 100;
  const rightWidth = 100 - leftWidth;
  const topRightHeight = p1 * 100;
  const bottomRightHeight = 100 - topRightHeight;

  const colors = [
    'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))', // Santiago (Red-ish)
    'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))', // Texas (Orange-ish)
    'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))', // London (Blue-ish)
    'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.05))' // Munich (Purple-ish)
  ];

  const borderColors = ['#ef4444', '#f59e0b', '#3b82f6', '#a855f7'];

  return (
    <div className="glass-panel flex flex-col h-full">
      <h3 className="text-sm font-mono text-cyan-400 tracking-wider mb-4 flex items-center">
        <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
        DISTRIBUCIÓN DE EMISIONES POR SUCURSAL (TREEMAP)
      </h3>

      {grandTotal <= 1 ? (
        <div className="flex-grow flex items-center justify-center text-xs font-mono text-slate-500 min-h-[220px]">
          Sin datos de emisiones registrados
        </div>
      ) : (
        <div className="flex-grow flex w-full h-[220px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950/40 p-1 gap-1">
          {/* Item 0 - Large block on the left */}
          {facilityEmissions[0] && (
            <div
              className="h-full flex flex-col justify-between p-3 rounded border transition-all duration-300 hover:scale-[1.01]"
              style={{
                width: `${leftWidth}%`,
                background: colors[0],
                borderColor: borderColors[0]
              }}
            >
              <div>
                <span className="text-xxs font-mono bg-red-950/80 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded uppercase">
                  {facilityEmissions[0].country} - Principal
                </span>
                <h4 className="text-xs font-bold font-title mt-1.5 text-white truncate">
                  {facilityEmissions[0].name}
                </h4>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-red-400">
                  {facilityEmissions[0].val.toFixed(1)} <span className="text-xxs">t</span>
                </div>
                <div className="text-xxs text-slate-400 font-mono">
                  {((facilityEmissions[0].val / grandTotal) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Right Column containing item 1, 2, 3 */}
          <div className="h-full flex flex-col gap-1" style={{ width: `${rightWidth}%` }}>
            {/* Item 1 - Top right block */}
            {facilityEmissions[1] && (
              <div
                className="flex flex-col justify-between p-3 rounded border transition-all duration-300 hover:scale-[1.01]"
                style={{
                  height: `${topRightHeight}%`,
                  background: colors[1],
                  borderColor: borderColors[1]
                }}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold font-title text-white truncate max-w-[70%]">
                    {facilityEmissions[1].name}
                  </h4>
                  <span className="text-xxs font-mono text-amber-400">
                    {facilityEmissions[1].country}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xxs text-slate-400 font-mono">
                    {((facilityEmissions[1].val / grandTotal) * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-bold font-mono text-amber-400">
                    {facilityEmissions[1].val.toFixed(1)} t
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Row containing item 2 and 3 */}
            <div className="flex gap-1" style={{ height: `${bottomRightHeight}%` }}>
              {/* Item 2 - Bottom right left */}
              {facilityEmissions[2] && (
                <div
                  className="w-1/2 h-full flex flex-col justify-between p-2.5 rounded border transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: colors[2],
                    borderColor: borderColors[2]
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xxs font-bold font-title text-white truncate max-w-[65%]">
                      {facilityEmissions[2].name}
                    </h4>
                    <span className="text-xxs font-mono text-blue-400">
                      {facilityEmissions[2].country}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xxs text-slate-400 font-mono">
                      {((facilityEmissions[2].val / grandTotal) * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs font-bold font-mono text-blue-400">
                      {facilityEmissions[2].val.toFixed(1)} t
                    </span>
                  </div>
                </div>
              )}

              {/* Item 3 - Bottom right right */}
              {facilityEmissions[3] && (
                <div
                  className="w-1/2 h-full flex flex-col justify-between p-2.5 rounded border transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: colors[3],
                    borderColor: borderColors[3]
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xxs font-bold font-title text-white truncate max-w-[65%]">
                      {facilityEmissions[3].name}
                    </h4>
                    <span className="text-xxs font-mono text-purple-400">
                      {facilityEmissions[3].country}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xxs text-slate-400 font-mono">
                      {((facilityEmissions[3].val / grandTotal) * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs font-bold font-mono text-purple-400">
                      {facilityEmissions[3].val.toFixed(1)} t
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreemapEmissions;
