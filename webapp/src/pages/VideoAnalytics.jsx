import { useState, useEffect, useCallback } from 'react';
import {
  Map, Grid3X3, BarChart3, RefreshCw, Maximize2, Settings, ChevronDown,
  AlertTriangle, TrendingUp, ArrowLeftRight, Users, Package, ShieldOff,
  Flame, Video, Eye, EyeOff, ZoomIn, ZoomOut, Home, Layers, Play,
  Check, X, ExternalLink, Phone, Shield, Clock, Camera, Wifi, WifiOff,
  Activity, Accessibility, Baby, UserCheck, AlertCircle, ChevronRight,
  Filter, Search, MoreVertical, Pause, Volume2, VolumeX
} from 'lucide-react';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getDensityColor = (percent) => {
  if (percent <= 20) return 'transparent';
  if (percent <= 50) return '#22C55E';
  if (percent <= 70) return '#EAB308';
  if (percent <= 85) return '#F97316';
  return '#DC2626';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'normal': return '#22C55E';
    case 'moderate': return '#EAB308';
    case 'warning': return '#F97316';
    case 'high': return '#F97316';
    case 'critical': return '#DC2626';
    default: return '#6B7280';
  }
};

const getSeverityStyles = (severity) => {
  switch (severity) {
    case 'critical': return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600' };
    case 'high': return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' };
    case 'medium': return { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500' };
    case 'info': return { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' };
    default: return { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' };
  }
};

const getVelocityStatus = (velocity) => {
  if (velocity >= 0.8) return { label: 'Normal', color: '#22C55E' };
  if (velocity >= 0.4) return { label: 'Slow', color: '#EAB308' };
  return { label: 'Congested', color: '#DC2626' };
};

const getAnomalyIcon = (type) => {
  switch (type) {
    case 'crowd_surge': return TrendingUp;
    case 'counter_flow': return ArrowLeftRight;
    case 'unusual_crowding': return Users;
    case 'abandoned_object': return Package;
    case 'restricted_intrusion': return ShieldOff;
    case 'fall_detected': return AlertTriangle;
    case 'smoke_fire': return Flame;
    default: return AlertCircle;
  }
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================
function VideoAnalyticsHeader({
  config,
  viewMode,
  onViewModeChange,
  selectedZone,
  onZoneChange,
  timeRange,
  onTimeRangeChange,
  zones,
  lastUpdated,
  autoRefresh,
  onAutoRefreshToggle,
  isLive
}) {
  return (
    <header className="h-[60px] bg-[#1E293B] border-b border-[#475569] flex items-center px-4 gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[#F1F5F9]">{config.title}</h1>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-500">LIVE</span>
          </div>
        )}
      </div>

      {/* Center Section */}
      <div className="flex-1 flex items-center justify-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex bg-[#0F172A] rounded-lg p-1">
          {[
            { id: 'map', icon: Map, label: 'Map View' },
            { id: 'grid', icon: Grid3X3, label: 'Grid View' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onViewModeChange(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === id
                  ? 'bg-[#334155] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title={label}
            >
              <Icon size={16} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Zone Filter */}
        <div className="relative">
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="appearance-none bg-[#0F172A] border border-[#475569] rounded-lg px-3 py-1.5 pr-8 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.shortName}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
        </div>

        {/* Time Range */}
        <div className="flex bg-[#0F172A] rounded-lg p-1">
          {['Live', '1h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                timeRange === range
                  ? 'bg-[#334155] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#94A3B8]">
          Updated {lastUpdated}
        </span>

        <button
          onClick={onAutoRefreshToggle}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
            autoRefresh ? 'text-green-500' : 'text-[#94A3B8]'
          }`}
        >
          <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
          {autoRefresh ? 'Auto' : 'Paused'}
        </button>

        <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors">
          <Maximize2 size={18} className="text-[#94A3B8]" />
        </button>

        <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors">
          <Settings size={18} className="text-[#94A3B8]" />
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// CRITICAL ALERT BANNER
// ============================================================================
function CriticalAlertBanner({ anomalies, onAcknowledge, onEscalate }) {
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' && a.status === 'unacknowledged');

  if (criticalAnomalies.length === 0) return null;

  const primary = criticalAnomalies[0];

  return (
    <div className="h-12 bg-red-600 flex items-center px-4 gap-4 animate-pulse" style={{ animationDuration: '2s' }}>
      <AlertTriangle size={20} className="text-white flex-shrink-0" />

      <div className="flex-1 flex items-center gap-2">
        <span className="font-semibold text-white">CRITICAL:</span>
        <span className="text-white">{primary.typeLabel} detected at {primary.location}</span>
        <span className="text-red-200">| {primary.timeAgo}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors">
          View Details
        </button>
        <button
          onClick={() => onAcknowledge(primary.id)}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors"
        >
          Acknowledge
        </button>
        <button
          onClick={() => onEscalate(primary.id)}
          className="px-3 py-1 bg-white hover:bg-gray-100 rounded text-sm text-red-600 font-medium transition-colors"
        >
          Escalate
        </button>
      </div>

      {criticalAnomalies.length > 1 && (
        <span className="text-red-200 text-sm">+{criticalAnomalies.length - 1} more</span>
      )}
    </div>
  );
}

// ============================================================================
// MAP VIEW COMPONENT
// ============================================================================
function MapView({ zones, gates, congestionHotspots, anomalies, overview, onZoneClick }) {
  const [layers, setLayers] = useState({
    heatmap: true,
    flowArrows: false,
    cameraIcons: false,
    anomalyMarkers: true,
    zoneLabels: true
  });
  const [selectedZone, setSelectedZone] = useState(null);

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="flex-1 flex">
      {/* Map Area */}
      <div className="flex-1 relative bg-[#0F172A] overflow-hidden">
        {/* Temple Layout Background */}
        <div className="absolute inset-4 border border-[#475569] rounded-lg overflow-hidden">
          {/* Zone Overlays */}
          {zones.map(zone => (
            <div
              key={zone.id}
              className="absolute cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:z-10"
              style={{
                left: `${zone.bounds.x}%`,
                top: `${zone.bounds.y}%`,
                width: `${zone.bounds.width}%`,
                height: `${zone.bounds.height}%`,
                backgroundColor: layers.heatmap ? getDensityColor(zone.densityPercent) : 'transparent',
                opacity: layers.heatmap ? (zone.densityPercent > 20 ? 0.3 + (zone.densityPercent / 200) : 0) : 0,
                border: `2px solid ${getStatusColor(zone.status)}`,
                borderRadius: '4px'
              }}
              onClick={() => {
                setSelectedZone(zone);
                onZoneClick?.(zone);
              }}
            >
              {layers.zoneLabels && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white drop-shadow-lg">
                  <span className="text-xs font-semibold">{zone.shortName}</span>
                  <span className="text-sm font-bold">{zone.densityPercent}%</span>
                </div>
              )}
            </div>
          ))}

          {/* Congestion Hotspots */}
          {congestionHotspots.map(hotspot => (
            <div
              key={hotspot.id}
              className="absolute w-6 h-6 rounded-full animate-ping"
              style={{
                left: `${hotspot.position.x}%`,
                top: `${hotspot.position.y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: hotspot.severity === 'critical' ? '#DC2626' :
                                 hotspot.severity === 'high' ? '#F97316' : '#EAB308',
                opacity: 0.6
              }}
            />
          ))}

          {/* Anomaly Markers */}
          {layers.anomalyMarkers && anomalies.filter(a => a.status === 'unacknowledged').slice(0, 5).map((anomaly, idx) => {
            const Icon = getAnomalyIcon(anomaly.type);
            return (
              <div
                key={anomaly.id}
                className="absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer animate-pulse"
                style={{
                  left: `${30 + idx * 10}%`,
                  top: `${40 + idx * 5}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: anomaly.severity === 'critical' ? '#DC2626' : '#F97316',
                  boxShadow: `0 0 20px ${anomaly.severity === 'critical' ? '#DC2626' : '#F97316'}`
                }}
                title={anomaly.typeLabel}
              >
                <Icon size={16} className="text-white" />
              </div>
            );
          })}

          {/* Gate Icons */}
          {gates.map(gate => (
            <div
              key={gate.id}
              className="absolute flex flex-col items-center cursor-pointer"
              style={{
                left: `${gate.position.x}%`,
                top: `${gate.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              title={`${gate.name}\nIN: ${gate.inRate}/min | OUT: ${gate.outRate}/min`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: getStatusColor(gate.loadStatus) }}
              >
                <span className="text-white text-xs font-bold">G{gate.id.slice(-1)}</span>
              </div>
              <span className="text-[10px] text-[#94A3B8] mt-1">{gate.shortName}</span>
            </div>
          ))}
        </div>

        {/* Map Toolbar */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="bg-[#1E293B] rounded-lg p-2 flex flex-col gap-1">
            <button className="p-2 hover:bg-[#334155] rounded transition-colors">
              <ZoomIn size={18} className="text-[#94A3B8]" />
            </button>
            <button className="p-2 hover:bg-[#334155] rounded transition-colors">
              <ZoomOut size={18} className="text-[#94A3B8]" />
            </button>
            <button className="p-2 hover:bg-[#334155] rounded transition-colors">
              <Home size={18} className="text-[#94A3B8]" />
            </button>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={14} className="text-[#94A3B8]" />
              <span className="text-xs text-[#94A3B8]">Layers</span>
            </div>
            {[
              { id: 'heatmap', label: 'Density Heatmap' },
              { id: 'flowArrows', label: 'Flow Arrows' },
              { id: 'cameraIcons', label: 'Camera Icons' },
              { id: 'anomalyMarkers', label: 'Anomaly Markers' },
              { id: 'zoneLabels', label: 'Zone Labels' }
            ].map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layers[id]}
                  onChange={() => toggleLayer(id)}
                  className="w-3 h-3 rounded border-[#475569]"
                />
                <span className="text-xs text-[#F1F5F9]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[#1E293B] rounded-lg p-3">
          <span className="text-xs text-[#94A3B8] mb-2 block">Density</span>
          <div className="flex items-center gap-1">
            {[
              { pct: '0-50%', color: '#22C55E' },
              { pct: '51-70%', color: '#EAB308' },
              { pct: '71-85%', color: '#F97316' },
              { pct: '>85%', color: '#DC2626' }
            ].map(({ pct, color }) => (
              <div key={pct} className="flex flex-col items-center">
                <div className="w-6 h-3 rounded" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-[#94A3B8] mt-1">{pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-[350px] bg-[#1E293B] border-l border-[#475569] p-4 overflow-y-auto">
        {selectedZone ? (
          <ZoneDetailPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
        ) : (
          <OverviewPanel overview={overview} congestionHotspots={congestionHotspots} alerts={anomalies} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW PANEL
// ============================================================================
function OverviewPanel({ overview, congestionHotspots, alerts }) {
  const alertCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Temple Overview</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0F172A] rounded-lg p-3">
            <span className="text-xs text-[#94A3B8]">Current Footfall</span>
            <p className="text-2xl font-bold text-[#F1F5F9]">{overview.currentFootfall.toLocaleString()}</p>
          </div>
          <div className="bg-[#0F172A] rounded-lg p-3">
            <span className="text-xs text-[#94A3B8]">Today's Total</span>
            <p className="text-2xl font-bold text-[#F1F5F9]">{overview.todayTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#94A3B8]">Average Density</span>
            <span className="text-sm text-[#F1F5F9]">{overview.averageDensity} {overview.averageDensityUnit}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#94A3B8]">Overall Status</span>
            <span
              className="text-sm font-semibold"
              style={{ color: getStatusColor(overview.overallStatus) }}
            >
              ⚠️ {overview.statusLabel}
            </span>
          </div>
        </div>

        <div className="border-t border-[#475569] pt-4">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3">Top Congestion Points</h3>
          <div className="space-y-2">
            {congestionHotspots.map((hotspot, idx) => (
              <div key={hotspot.id} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(hotspot.severity) }}
                />
                <span className="text-sm text-[#F1F5F9] flex-1">{hotspot.location}</span>
                <span className="text-sm text-[#94A3B8]">({hotspot.densityPercent}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#475569] pt-4">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3">Active Alerts: {alerts.length}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8]">├── Critical:</span>
              <span className="text-red-500 font-semibold">{alertCounts.critical}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8]">├── High:</span>
              <span className="text-orange-500 font-semibold">{alertCounts.high}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8]">└── Medium:</span>
              <span className="text-yellow-500 font-semibold">{alertCounts.medium}</span>
            </div>
          </div>
          <button className="mt-3 text-sm text-blue-400 hover:underline flex items-center gap-1">
            View All Alerts <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ZONE DETAIL PANEL
// ============================================================================
function ZoneDetailPanel({ zone, onClose }) {
  const velocityInfo = getVelocityStatus(zone.velocity);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#F1F5F9]">{zone.id} - {zone.shortName}</h2>
        <button onClick={onClose} className="p-1 hover:bg-[#334155] rounded">
          <X size={18} className="text-[#94A3B8]" />
        </button>
      </div>

      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium mb-4"
        style={{
          backgroundColor: `${getStatusColor(zone.status)}20`,
          color: getStatusColor(zone.status)
        }}
      >
        ⚠️ {zone.status.toUpperCase()}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xs text-[#94A3B8] mb-2 font-semibold">━━━ Current Metrics ━━━</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[#94A3B8]">👥 People Count</span>
              <span className="text-sm text-[#F1F5F9] font-semibold">{zone.currentCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#94A3B8]">📊 Density</span>
              <span className="text-sm text-[#F1F5F9]">{zone.density} p/m² ({zone.densityPercent}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#94A3B8]">🚶 Avg Velocity</span>
              <span className="text-sm" style={{ color: velocityInfo.color }}>
                {zone.velocity} m/s ({velocityInfo.label})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#94A3B8]">⏱️ Avg Dwell Time</span>
              <span className="text-sm text-[#F1F5F9]">{zone.avgDwellTime} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#94A3B8]">↔️ Counter-flow</span>
              <span className="text-sm text-[#F1F5F9]">{zone.counterFlow}% (normal)</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs text-[#94A3B8] mb-2 font-semibold">━━━ 2-Hour Trend ━━━</h3>
          <div className="h-12 flex items-end gap-0.5">
            {zone.trend.slice(-24).map((val, idx) => (
              <div
                key={idx}
                className="flex-1 rounded-t"
                style={{
                  height: `${val}%`,
                  backgroundColor: getDensityColor(val)
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs text-[#94A3B8] mb-2 font-semibold">━━━ Cameras ({zone.cameras.total}) ━━━</h3>
          <div className="text-sm">
            <span className="text-green-500">🟢 Online: {zone.cameras.online}</span>
            {zone.cameras.offline > 0 && (
              <span className="text-red-500 ml-3">🔴 Offline: {zone.cameras.offline}</span>
            )}
          </div>
          <button className="mt-2 text-sm text-blue-400 hover:underline">
            View All Zone Cameras
          </button>
        </div>

        <div>
          <h3 className="text-xs text-[#94A3B8] mb-2 font-semibold">━━━ Demographics (Estimated) ━━━</h3>
          <div className="text-sm text-[#F1F5F9]">
            Adults: ~{zone.demographics.adults} | Elderly: ~{zone.demographics.elderly} | Children: ~{zone.demographics.children}
          </div>
          <div className="text-sm text-[#94A3B8] mt-1">
            Wheelchairs detected: {zone.demographics.wheelchairs}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button className="flex-1 px-3 py-2 bg-[#334155] hover:bg-[#475569] rounded text-sm text-[#F1F5F9] transition-colors">
            Adjust Thresholds
          </button>
          <button className="flex-1 px-3 py-2 bg-[#334155] hover:bg-[#475569] rounded text-sm text-[#F1F5F9] transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CAMERA GRID VIEW
// ============================================================================
function CameraGridView({ cameras, zones }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [statusFilter, setStatusFilter] = useState(['online', 'degraded', 'offline']);
  const [currentPage, setCurrentPage] = useState(1);
  const camerasPerPage = 24;

  const filteredCameras = cameras
    .filter(cam =>
      cam.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      statusFilter.includes(cam.status)
    )
    .sort((a, b) => {
      if (sortBy === 'density') return b.density - a.density;
      if (sortBy === 'zone') return a.zone.localeCompare(b.zone);
      return a.id.localeCompare(b.id);
    });

  const totalPages = Math.ceil(filteredCameras.length / camerasPerPage);
  const displayedCameras = filteredCameras.slice(
    (currentPage - 1) * camerasPerPage,
    currentPage * camerasPerPage
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] p-4">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search camera ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1E293B] border border-[#475569] rounded-lg text-sm text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#1E293B] border border-[#475569] rounded-lg px-3 py-2 text-sm text-[#F1F5F9]"
        >
          <option value="id">Sort by: Camera ID</option>
          <option value="zone">Sort by: Zone</option>
          <option value="density">Sort by: Density (High→Low)</option>
        </select>

        <div className="flex items-center gap-2">
          {['online', 'degraded', 'offline'].map(status => (
            <label key={status} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={statusFilter.includes(status)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setStatusFilter([...statusFilter, status]);
                  } else {
                    setStatusFilter(statusFilter.filter(s => s !== status));
                  }
                }}
                className="w-3.5 h-3.5 rounded border-[#475569]"
              />
              <span className={`text-sm capitalize ${
                status === 'online' ? 'text-green-500' :
                status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Camera Grid */}
      <div className="flex-1 grid grid-cols-6 gap-4 overflow-y-auto">
        {displayedCameras.map(camera => (
          <CameraCard key={camera.id} camera={camera} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#475569]">
        <span className="text-sm text-[#94A3B8]">
          Showing {(currentPage - 1) * camerasPerPage + 1}-{Math.min(currentPage * camerasPerPage, filteredCameras.length)} of {filteredCameras.length} cameras
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#1E293B] rounded text-sm text-[#F1F5F9] disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-[#F1F5F9]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#1E293B] rounded text-sm text-[#F1F5F9] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CAMERA CARD
// ============================================================================
function CameraCard({ camera }) {
  const isOffline = camera.status === 'offline';

  return (
    <div className={`bg-[#1E293B] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer ${
      isOffline ? 'opacity-60' : ''
    }`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#0F172A]">
        {isOffline ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#94A3B8] text-sm">NO SIGNAL</span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A]" />
        )}

        {/* Status Badge */}
        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
          camera.status === 'online' ? 'bg-green-500' :
          camera.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />

        {/* People Count Badge */}
        {!isOffline && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-sm font-semibold">
            {camera.peopleCount}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#F1F5F9]">{camera.id}</span>
          <span className="text-xs text-[#94A3B8]">{camera.zone}</span>
        </div>

        {!isOffline && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#94A3B8]">Density:</span>
              <div className="flex-1 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(camera.density * 40, 100)}%`,
                    backgroundColor: getDensityColor(camera.density * 40)
                  }}
                />
              </div>
              <span className="text-xs text-[#F1F5F9]">{camera.density}</span>
            </div>
            <div className="text-xs text-[#64748B]">
              Confidence: {camera.confidence}%
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS VIEW
// ============================================================================
function AnalyticsView({ densityTrend, velocityTrend, zones, anomalies }) {
  return (
    <div className="flex-1 grid grid-cols-2 gap-4 p-4 bg-[#0F172A]">
      {/* Density Trend */}
      <div className="bg-[#1E293B] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Density Trend</h3>
        <div className="h-48 flex items-end gap-2">
          {densityTrend.map((point, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${point.value * 2}px`,
                  backgroundColor: getDensityColor(point.value)
                }}
              />
              <span className="text-[10px] text-[#64748B] mt-1">{point.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-yellow-500" style={{ borderTop: '2px dashed' }} />
            <span className="text-xs text-[#94A3B8]">Warning (70%)</span>
          </div>
        </div>
      </div>

      {/* Velocity Trend */}
      <div className="bg-[#1E293B] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Velocity Trend</h3>
        <div className="h-48 relative">
          {/* Background zones */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-green-500/10 border-b border-green-500/30" />
            <div className="flex-1 bg-yellow-500/10 border-b border-yellow-500/30" />
            <div className="flex-1 bg-red-500/10" />
          </div>
          {/* Line chart placeholder */}
          <div className="absolute inset-0 flex items-end gap-2 px-2">
            {velocityTrend.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-2 h-2 rounded-full bg-blue-500"
                  style={{ marginBottom: `${point.value * 120}px` }}
                />
                <span className="text-[10px] text-[#64748B] mt-auto">{point.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-[#94A3B8]">
          <span>🟢 Normal (&gt;0.8)</span>
          <span>🟡 Slow (0.4-0.8)</span>
          <span>🔴 Congested (&lt;0.4)</span>
        </div>
      </div>

      {/* Zone Comparison */}
      <div className="bg-[#1E293B] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Zone Comparison</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {[...zones].sort((a, b) => b.densityPercent - a.densityPercent).map(zone => (
            <div key={zone.id} className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8] w-24 truncate">{zone.shortName}</span>
              <div className="flex-1 h-4 bg-[#0F172A] rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${zone.densityPercent}%`,
                    backgroundColor: getStatusColor(zone.status)
                  }}
                />
              </div>
              <span className="text-xs text-[#F1F5F9] w-10 text-right">{zone.densityPercent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Timeline */}
      <div className="bg-[#1E293B] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Anomaly Timeline</h3>
        <div className="h-48 relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-[#64748B]">
            <span>Critical</span>
            <span>High</span>
            <span>Medium</span>
            <span>Info</span>
          </div>
          <div className="ml-16 h-full border-l border-[#475569] pl-4 flex flex-wrap gap-2 content-start">
            {anomalies.slice(0, 10).map(anomaly => {
              const styles = getSeverityStyles(anomaly.severity);
              return (
                <div
                  key={anomaly.id}
                  className={`w-3 h-3 rounded-full cursor-pointer ${styles.bg} ${
                    anomaly.status === 'unacknowledged' ? 'animate-pulse' : ''
                  }`}
                  title={`${anomaly.typeLabel} - ${anomaly.timeAgo}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECONDARY PANELS
// ============================================================================
function SecondaryPanels({
  activeTab,
  onTabChange,
  zones,
  anomalies,
  safetyAlerts,
  accessibilityData,
  cameraHealth,
  onAnomalyAcknowledge
}) {
  const tabs = [
    { id: 'zones', label: 'Zone Metrics' },
    { id: 'anomalies', label: 'Anomaly Feed' },
    { id: 'safety', label: 'Safety & Accessibility' },
    { id: 'cameras', label: 'Camera Health' }
  ];

  return (
    <div className="min-h-[400px] bg-[#1E293B] border-t border-[#475569] flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[#475569]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#F1F5F9] border-b-2 border-blue-500'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'zones' && <ZoneMetricsTable zones={zones} />}
        {activeTab === 'anomalies' && (
          <AnomalyFeed anomalies={anomalies} onAcknowledge={onAnomalyAcknowledge} />
        )}
        {activeTab === 'safety' && (
          <SafetyPanel safetyAlerts={safetyAlerts} accessibilityData={accessibilityData} />
        )}
        {activeTab === 'cameras' && <CameraHealthPanel cameraHealth={cameraHealth} />}
      </div>
    </div>
  );
}

// ============================================================================
// ZONE METRICS TABLE
// ============================================================================
function ZoneMetricsTable({ zones }) {
  return (
    <div className="h-full overflow-auto">
      <table className="w-full">
        <thead className="bg-[#0F172A] sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Zone</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Cameras</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Count</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Density</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Occupancy</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Velocity</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]">Trend</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-[#94A3B8]"></th>
          </tr>
        </thead>
        <tbody>
          {zones.map(zone => {
            const velStatus = getVelocityStatus(zone.velocity);
            return (
              <tr key={zone.id} className="border-b border-[#334155] hover:bg-[#334155]/50 cursor-pointer">
                <td className="px-4 py-3">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: getStatusColor(zone.status) }}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[#F1F5F9]">{zone.name}</td>
                <td className="px-4 py-3 text-sm text-[#94A3B8]">
                  {zone.cameras.online}/{zone.cameras.total}
                </td>
                <td className="px-4 py-3 text-sm text-[#F1F5F9] font-medium">{zone.currentCount}</td>
                <td className="px-4 py-3 text-sm text-[#F1F5F9]">{zone.density} p/m²</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-[#0F172A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${zone.densityPercent}%`,
                          backgroundColor: getStatusColor(zone.status)
                        }}
                      />
                    </div>
                    <span className="text-xs text-[#94A3B8]">{zone.densityPercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm" style={{ color: velStatus.color }}>
                    {zone.velocity} m/s
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-20 h-5 flex items-end gap-px">
                    {zone.trend.slice(-12).map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${val / 2}%`,
                          backgroundColor: getStatusColor(zone.status)
                        }}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-[#475569] rounded">
                    <MoreVertical size={16} className="text-[#94A3B8]" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// ANOMALY FEED
// ============================================================================
function AnomalyFeed({ anomalies, onAcknowledge }) {
  const [filter, setFilter] = useState('all');

  const filteredAnomalies = anomalies.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return a.status === 'unacknowledged';
    return a.severity === filter;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="p-3 border-b border-[#475569] flex items-center gap-2">
        <Filter size={14} className="text-[#94A3B8]" />
        {['all', 'critical', 'high', 'unacknowledged'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded text-xs capitalize ${
              filter === f
                ? 'bg-[#334155] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredAnomalies.map(anomaly => {
          const styles = getSeverityStyles(anomaly.severity);
          const Icon = getAnomalyIcon(anomaly.type);

          return (
            <div
              key={anomaly.id}
              className={`bg-[#0F172A] rounded-lg p-4 border-l-4 ${styles.border} ${
                anomaly.status === 'unacknowledged' ? 'animate-pulse' : ''
              }`}
              style={{ animationDuration: '3s' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles.bg} ${styles.text}`}>
                    {anomaly.severityLabel}
                  </span>
                  <span className="text-sm font-medium text-[#F1F5F9] flex items-center gap-1">
                    <Icon size={14} />
                    {anomaly.typeLabel}
                  </span>
                </div>
                <span className="text-xs text-[#94A3B8]">{anomaly.timeAgo}</span>
              </div>

              <div className="text-sm text-[#94A3B8] mb-2">
                📍 {anomaly.location}
              </div>
              <div className="text-xs text-[#64748B] mb-3">
                📹 {anomaly.cameraId} | Confidence: {anomaly.confidence}%
              </div>

              <p className="text-sm text-[#F1F5F9] mb-3">{anomaly.description}</p>

              <div className="flex items-center gap-2">
                <button className="text-xs text-blue-400 hover:underline">View Live</button>
                <button className="text-xs text-blue-400 hover:underline">View Clip</button>
                {anomaly.status === 'unacknowledged' && (
                  <>
                    <button
                      onClick={() => onAcknowledge(anomaly.id)}
                      className="px-2 py-1 border border-[#475569] rounded text-xs text-[#F1F5F9] hover:bg-[#334155]"
                    >
                      Acknowledge
                    </button>
                    <button className="px-2 py-1 border border-[#475569] rounded text-xs text-[#F1F5F9] hover:bg-[#334155]">
                      Escalate
                    </button>
                  </>
                )}
                {anomaly.status === 'acknowledged' && (
                  <span className="text-xs text-green-500">
                    ✓ Acknowledged by {anomaly.acknowledgedBy}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// SAFETY PANEL
// ============================================================================
function SafetyPanel({ safetyAlerts, accessibilityData }) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Safety Detection */}
      <div>
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
          🚨 Safety Monitoring
        </h3>
        {safetyAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg mb-3 ${
              alert.urgency === 'immediate' ? 'bg-red-900/30 border border-red-500' : 'bg-orange-900/20 border border-orange-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#F1F5F9]">🚨 {alert.typeLabel}</span>
              <span className="text-xs text-[#94A3B8]">{alert.timeAgo}</span>
            </div>
            <div className="text-sm text-[#94A3B8] mb-2">
              Location: {alert.location}
            </div>
            <div className="text-xs text-[#64748B] mb-3">
              Camera: {alert.cameraId} | Confidence: {alert.confidence}%
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm text-white flex items-center gap-1">
                <Phone size={14} /> Dispatch Medical
              </button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white flex items-center gap-1">
                <Shield size={14} /> Dispatch Security
              </button>
              <button className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] rounded text-sm text-[#F1F5F9]">
                ✓ Mark Resolved
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility Detection */}
      <div className="border-t border-[#475569] pt-4">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
          ♿ Accessibility Monitoring
        </h3>
        <div className="bg-[#0F172A] rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#94A3B8]">Wheelchair Users:</span>
              <span className="text-[#F1F5F9] ml-2 font-semibold">{accessibilityData.wheelchairUsers.total}</span>
            </div>
            <div>
              <span className="text-[#94A3B8]">Walking Aid Users:</span>
              <span className="text-[#F1F5F9] ml-2 font-semibold">{accessibilityData.walkingAidUsers.total}</span>
            </div>
            <div>
              <span className="text-[#94A3B8]">Elderly (gait-based):</span>
              <span className="text-[#F1F5F9] ml-2 font-semibold">{accessibilityData.elderlyEstimate.total}</span>
            </div>
            <div>
              <span className="text-[#94A3B8]">Children:</span>
              <span className="text-[#F1F5F9] ml-2 font-semibold">{accessibilityData.childrenEstimate.total}</span>
            </div>
          </div>

          {accessibilityData.assistanceAlerts.length > 0 && (
            <div className="border-t border-[#475569] pt-3 mt-3">
              <h4 className="text-xs text-[#94A3B8] mb-2">━━━ Assistance Alerts ━━━</h4>
              {accessibilityData.assistanceAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-2 mb-2 p-2 bg-yellow-900/20 rounded">
                  <span className="text-yellow-500">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm text-[#F1F5F9]">{alert.message}</p>
                    <p className="text-xs text-[#94A3B8]">Location: {alert.location} ({alert.cameraId})</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="text-xs text-blue-400 hover:underline">View</button>
                    <button className="text-xs text-blue-400 hover:underline">Dispatch</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-[#64748B] mt-2 italic">
          Detection is estimated from visual cues. Counts are approximate.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// CAMERA HEALTH PANEL
// ============================================================================
function CameraHealthPanel({ cameraHealth }) {
  return (
    <div className="h-full overflow-y-auto p-4">
      {/* Summary */}
      <div className="bg-[#0F172A] rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
          📹 Camera Infrastructure Status
        </h3>
        <div className="text-sm text-[#94A3B8] mb-3">
          Total Cameras: <span className="text-[#F1F5F9] font-semibold">{cameraHealth.total}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-green-500">🟢 Online</span>
            <span className="text-[#F1F5F9]">{cameraHealth.online} ({cameraHealth.onlinePercent}%)</span>
            <div className="flex-1 h-2 bg-[#334155] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${cameraHealth.onlinePercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-500">🟡 Degraded</span>
            <span className="text-[#F1F5F9]">{cameraHealth.degraded} ({cameraHealth.degradedPercent}%)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-500">🔴 Offline</span>
            <span className="text-[#F1F5F9]">{cameraHealth.offline} ({cameraHealth.offlinePercent}%)</span>
          </div>
        </div>
      </div>

      {/* Offline Cameras */}
      {cameraHealth.offlineCameras.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-500 mb-2">Offline Cameras</h4>
          <div className="space-y-2">
            {cameraHealth.offlineCameras.map(cam => (
              <div key={cam.id} className="flex items-center justify-between bg-[#0F172A] rounded p-3">
                <div>
                  <span className="text-sm text-[#F1F5F9] font-medium">{cam.id}</span>
                  <span className="text-xs text-[#94A3B8] ml-2">{cam.zoneName}</span>
                  <div className="text-xs text-[#64748B]">
                    Down since {cam.downSince} ({cam.duration}) - {cam.issue}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-xs bg-[#334155] hover:bg-[#475569] rounded text-[#F1F5F9]">
                    Retry
                  </button>
                  <button className="px-2 py-1 text-xs bg-[#334155] hover:bg-[#475569] rounded text-[#F1F5F9]">
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Degraded Cameras */}
      {cameraHealth.degradedCameras.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-500 mb-2">Degraded Cameras</h4>
          <div className="space-y-2">
            {cameraHealth.degradedCameras.map(cam => (
              <div key={cam.id} className="flex items-center justify-between bg-[#0F172A] rounded p-3">
                <div>
                  <span className="text-sm text-[#F1F5F9] font-medium">{cam.id}</span>
                  <span className="text-xs text-[#94A3B8] ml-2">{cam.zoneName}</span>
                  <div className="text-xs text-[#64748B]">
                    {cam.issue} - Confidence: {cam.confidenceDrop}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN VIDEO ANALYTICS COMPONENT
// ============================================================================
export default function VideoAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState('map');
  const [selectedZone, setSelectedZone] = useState('all');
  const [timeRange, setTimeRange] = useState('Live');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('just now');
  const [activeTab, setActiveTab] = useState('zones');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/video-analytics');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
      setLoading(false);
      setLastUpdated('just now');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchData();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  const handleAnomalyAcknowledge = (anomalyId) => {
    setData(prev => ({
      ...prev,
      anomalies: prev.anomalies.map(a =>
        a.id === anomalyId
          ? { ...a, status: 'acknowledged', acknowledgedBy: 'Current User', acknowledgedAt: new Date().toLocaleTimeString() }
          : a
      )
    }));
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-[#F1F5F9]">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-red-500">Error: {error || 'No data'}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0F172A] flex flex-col">
      {/* Header - Fixed */}
      <VideoAnalyticsHeader
        config={data.pageConfig}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedZone={selectedZone}
        onZoneChange={setSelectedZone}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        zones={data.zones}
        lastUpdated={lastUpdated}
        autoRefresh={autoRefresh}
        onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
        isLive={timeRange === 'Live'}
      />

      {/* Critical Alert Banner - Fixed */}
      <CriticalAlertBanner
        anomalies={data.anomalies}
        onAcknowledge={handleAnomalyAcknowledge}
        onEscalate={(id) => console.log('Escalate:', id)}
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Primary Visualization Area */}
        <div className="min-h-[500px] h-[60vh] flex">
          {viewMode === 'map' && (
            <MapView
              zones={data.zones}
              gates={data.gates}
              congestionHotspots={data.congestionHotspots}
              anomalies={data.anomalies}
              overview={data.overview}
              onZoneClick={(zone) => console.log('Zone clicked:', zone)}
            />
          )}
          {viewMode === 'grid' && (
            <CameraGridView cameras={data.cameras} zones={data.zones} />
          )}
          {viewMode === 'analytics' && (
            <AnalyticsView
              densityTrend={data.densityTrend}
              velocityTrend={data.velocityTrend}
              zones={data.zones}
              anomalies={data.anomalies}
            />
          )}
        </div>

        {/* Secondary Panels */}
        <SecondaryPanels
          activeTab={activeTab}
          onTabChange={setActiveTab}
          zones={data.zones}
          anomalies={data.anomalies}
          safetyAlerts={data.safetyAlerts}
          accessibilityData={data.accessibilityData}
          cameraHealth={data.cameraHealth}
          onAnomalyAcknowledge={handleAnomalyAcknowledge}
        />
      </div>
    </div>
  );
}
