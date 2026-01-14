import { useState } from 'react';
import { X, Users, Camera, TrendingUp, TrendingDown, Minus, Clock, AlertTriangle } from 'lucide-react';

// Zone layout configuration - positions on a 12x10 grid
const ZONE_LAYOUT = {
  'temple-core': { x: 4, y: 3, width: 4, height: 3, label: 'Temple Core' },
  'darshan-queue': { x: 3, y: 2, width: 6, height: 5, label: 'Queue', isOutline: true },
  'parking': { x: 0, y: 0, width: 3, height: 4, label: 'Parking' },
  'choulties': { x: 0, y: 4, width: 3, height: 3, label: 'Choulties' },
  'sub-temples': { x: 9, y: 0, width: 3, height: 3, label: 'Sub Temples' },
  'tanks': { x: 9, y: 3, width: 3, height: 4, label: 'Tanks' },
  'counters': { x: 0, y: 7, width: 4, height: 2, label: 'Counters' },
  'gosala': { x: 9, y: 7, width: 3, height: 2, label: 'Gosala' },
  'kesakhandana': { x: 4, y: 7, width: 2, height: 2, label: 'Kesakhandana' },
  'annadanam': { x: 6, y: 7, width: 3, height: 2, label: 'Annadanam' },
  'prasadam': { x: 4, y: 0, width: 4, height: 2, label: 'Prasadam' },
};

// Gate positions
const GATES = [
  { id: 'south', x: 5.5, y: 9.5, label: 'South Gopuram' },
  { id: 'north', x: 5.5, y: -0.5, label: 'North Gopuram' },
  { id: 'east', x: 12, y: 4.5, label: 'East Gopuram' },
  { id: 'west', x: -0.5, y: 4.5, label: 'West Gopuram' },
];

function getDensityColor(density, opacity = 1) {
  if (density >= 85) return `rgba(239, 68, 68, ${opacity})`; // red
  if (density >= 70) return `rgba(249, 115, 22, ${opacity})`; // orange
  if (density >= 50) return `rgba(245, 158, 11, ${opacity})`; // amber
  if (density >= 30) return `rgba(34, 197, 94, ${opacity})`; // green
  return `rgba(59, 130, 246, ${opacity})`; // blue
}

function getDensityBorder(density) {
  if (density >= 85) return '#dc2626';
  if (density >= 70) return '#ea580c';
  if (density >= 50) return '#d97706';
  if (density >= 30) return '#16a34a';
  return '#2563eb';
}

function ZoneModal({ zone, onClose }) {
  if (!zone) return null;

  const TrendIcon = zone.trend === 'increasing' ? TrendingUp :
                    zone.trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = zone.trend === 'increasing' ? 'text-red-500' :
                     zone.trend === 'decreasing' ? 'text-green-500' : 'text-slate-400';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 text-white"
          style={{ backgroundColor: getDensityBorder(zone.density) }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{zone.name}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm opacity-90 capitalize">{zone.status} density</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Users size={16} />
                <span className="text-xs font-medium">Current Count</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900">
                {zone.currentCount?.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">of {zone.capacity?.toLocaleString()} capacity</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Camera size={16} />
                <span className="text-xs font-medium">Cameras</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900">{zone.cameras}</p>
              <p className="text-xs text-slate-500">monitoring</p>
            </div>
          </div>

          {/* Density Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Zone Density</span>
              <div className="flex items-center gap-2">
                <TrendIcon size={16} className={trendColor} />
                <span className="text-lg font-semibold text-slate-900">{zone.density}%</span>
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${zone.density}%`,
                  backgroundColor: getDensityBorder(zone.density)
                }}
              />
            </div>
          </div>

          {/* Wait Time (if applicable) */}
          {zone.waitTime && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
              <Clock size={24} className="text-amber-600" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Wait Time</p>
                <p className="text-2xl font-semibold text-amber-900">{zone.waitTime} min</p>
              </div>
            </div>
          )}

          {/* Trend */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-600">Trend</span>
            <div className="flex items-center gap-2">
              <TrendIcon size={18} className={trendColor} />
              <span className="text-sm font-medium text-slate-900 capitalize">{zone.trend}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TempleLayout({ zones, gates }) {
  const [hoveredZone, setHoveredZone] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const gridSize = 40; // pixels per grid unit
  const padding = 60; // padding for gates
  const width = 12 * gridSize + padding * 2;
  const height = 10 * gridSize + padding * 2;

  const getZoneData = (zoneId) => zones?.find(z => z.id === zoneId);
  const getGateData = (gateId) => gates?.find(g => g.id.includes(gateId));

  const handleMouseMove = (e, zone) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + padding,
      y: e.clientY - rect.top + padding
    });
    setHoveredZone(zone);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Temple Layout
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-slate-500">Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-slate-500">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-slate-500">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-slate-500">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-slate-500">Low</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-slate-50">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minHeight: '400px' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect x={padding} y={padding} width={12 * gridSize} height={10 * gridSize} fill="url(#grid)" />

          {/* Zones */}
          {Object.entries(ZONE_LAYOUT).map(([zoneId, layout]) => {
            const zoneData = getZoneData(zoneId);
            const density = zoneData?.density || 0;
            const isHovered = hoveredZone?.id === zoneId;
            const isQueue = layout.isOutline;

            return (
              <g key={zoneId}>
                {isQueue ? (
                  // Queue outline (dashed)
                  <rect
                    x={padding + layout.x * gridSize + 2}
                    y={padding + layout.y * gridSize + 2}
                    width={layout.width * gridSize - 4}
                    height={layout.height * gridSize - 4}
                    fill="none"
                    stroke={getDensityBorder(density)}
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    rx="8"
                    className="transition-all duration-300"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none'
                    }}
                  />
                ) : (
                  // Solid zone
                  <rect
                    x={padding + layout.x * gridSize + 2}
                    y={padding + layout.y * gridSize + 2}
                    width={layout.width * gridSize - 4}
                    height={layout.height * gridSize - 4}
                    fill={getDensityColor(density, 0.85)}
                    stroke={getDensityBorder(density)}
                    strokeWidth={isHovered ? 3 : 2}
                    rx="8"
                    className="cursor-pointer transition-all duration-300"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' : 'none',
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                    onMouseMove={(e) => handleMouseMove(e, zoneData)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => setSelectedZone(zoneData)}
                  />
                )}

                {/* Zone Label */}
                <text
                  x={padding + (layout.x + layout.width / 2) * gridSize}
                  y={padding + (layout.y + layout.height / 2) * gridSize - 8}
                  textAnchor="middle"
                  className="text-xs font-medium fill-slate-700 pointer-events-none select-none"
                  style={{ fontSize: '11px' }}
                >
                  {layout.label}
                </text>

                {/* Density Number */}
                {!isQueue && (
                  <text
                    x={padding + (layout.x + layout.width / 2) * gridSize}
                    y={padding + (layout.y + layout.height / 2) * gridSize + 12}
                    textAnchor="middle"
                    className="font-bold pointer-events-none select-none"
                    style={{
                      fontSize: '18px',
                      fill: density >= 70 ? '#ffffff' : '#1e293b'
                    }}
                  >
                    {density}%
                  </text>
                )}

                {/* Queue density badge */}
                {isQueue && (
                  <g>
                    <rect
                      x={padding + (layout.x + layout.width / 2) * gridSize - 25}
                      y={padding + (layout.y + layout.height / 2) * gridSize + 2}
                      width="50"
                      height="24"
                      fill={getDensityColor(density, 0.9)}
                      stroke={getDensityBorder(density)}
                      strokeWidth="1"
                      rx="12"
                    />
                    <text
                      x={padding + (layout.x + layout.width / 2) * gridSize}
                      y={padding + (layout.y + layout.height / 2) * gridSize + 19}
                      textAnchor="middle"
                      className="font-bold pointer-events-none select-none"
                      style={{
                        fontSize: '13px',
                        fill: density >= 70 ? '#ffffff' : '#1e293b'
                      }}
                    >
                      {density}%
                    </text>
                  </g>
                )}

                {/* Clickable overlay for queue */}
                {isQueue && (
                  <rect
                    x={padding + layout.x * gridSize}
                    y={padding + layout.y * gridSize}
                    width={layout.width * gridSize}
                    height={layout.height * gridSize}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseMove={(e) => handleMouseMove(e, zoneData)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => setSelectedZone(zoneData)}
                  />
                )}
              </g>
            );
          })}

          {/* Gates */}
          {GATES.map(gate => {
            const gateData = getGateData(gate.id);
            const isOpen = gateData?.status === 'open';
            const isRestricted = gateData?.status === 'restricted';

            return (
              <g key={gate.id}>
                {/* Gate marker */}
                <rect
                  x={padding + gate.x * gridSize - 20}
                  y={padding + gate.y * gridSize - 12}
                  width="40"
                  height="24"
                  fill={isOpen ? '#10b981' : isRestricted ? '#f59e0b' : '#ef4444'}
                  rx="4"
                  className="transition-colors duration-300"
                />
                <text
                  x={padding + gate.x * gridSize}
                  y={padding + gate.y * gridSize + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white pointer-events-none select-none"
                  style={{ fontSize: '9px' }}
                >
                  {gate.id.charAt(0).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredZone && (
          <div
            className="absolute bg-slate-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10 shadow-lg"
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y - 40,
              transform: 'translateX(-50%)'
            }}
          >
            <p className="font-medium">{hoveredZone.name}</p>
            <p className="text-slate-300 text-xs">
              {hoveredZone.currentCount?.toLocaleString()} people • {hoveredZone.density}%
            </p>
          </div>
        )}
      </div>

      {/* Zone Modal */}
      <ZoneModal zone={selectedZone} onClose={() => setSelectedZone(null)} />
    </div>
  );
}
