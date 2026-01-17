import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Video, TrendingUp, DoorOpen, Bell, MessageCircle,
  Activity, MapPin, Route, Users, AlertTriangle, MessageSquare,
  BarChart3, Utensils, Car, Settings, RefreshCw, WifiOff, ArrowUp,
  ArrowDown, Clock, CheckCircle, ExternalLink, X, Zap, Sparkles,
  Megaphone, Shield, AlertCircle
} from 'lucide-react';
import './index.css';

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================
const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, group: 1, active: true },
  { id: 'video-analytics', label: 'Video Analytics', icon: Video, group: 1 },
  { id: 'crowd-forecast', label: 'Crowd Forecast', icon: TrendingUp, group: 1 },
  { id: 'gate-queue', label: 'Gate & Queue', icon: DoorOpen, group: 1 },
  { id: 'alerts', label: 'Alerts', icon: Bell, group: 1, badge: 2 },
  { id: 'chatbot', label: 'Chatbot Monitor', icon: MessageCircle, group: 1 },
  { id: 'system-health', label: 'System Health', icon: Activity, group: 1 },
  { id: 'zone-monitor', label: 'Zone Monitor', icon: MapPin, group: 2 },
  { id: 'spatial-flow', label: 'Spatial Flow', icon: Route, group: 2 },
  { id: 'staff-deployment', label: 'Staff Deployment', icon: Users, group: 2 },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, group: 2 },
  { id: 'feedback-analytics', label: 'Feedback Analytics', icon: MessageSquare, group: 2 },
  { id: 'analytics-reports', label: 'Analytics & Reports', icon: BarChart3, group: 3 },
  { id: 'amenities', label: 'Amenities', icon: Utensils, group: 3 },
  { id: 'parking', label: 'Parking', icon: Car, group: 3 },
  { id: 'settings', label: 'Settings', icon: Settings, group: 3 },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getDensityColor = (density) => {
  if (density <= 40) return '#22C55E';
  if (density <= 60) return '#84CC16';
  if (density <= 75) return '#F59E0B';
  if (density <= 90) return '#F97316';
  return '#EF4444';
};

const getLoadColor = (load) => {
  if (load < 70) return '#22C55E';
  if (load < 90) return '#F59E0B';
  return '#EF4444';
};

const getScoreColor = (score, thresholds = { low: 40, high: 70 }) => {
  if (score <= thresholds.low) return '#22C55E';
  if (score <= thresholds.high) return '#F59E0B';
  return '#EF4444';
};

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================
function Sidebar({ activeItem, systemStatus, hasUnacknowledgedAlerts }) {
  const renderNavGroup = (groupId) => {
    const items = NAV_ITEMS.filter(item => item.group === groupId);
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = item.id === activeItem;

      return (
        <button
          key={item.id}
          className={`relative h-11 w-full flex items-center gap-3 px-3 rounded-lg transition-colors duration-200 cursor-pointer
            ${isActive
              ? 'bg-[rgba(14,165,233,0.1)] border-l-3 border-l-[#0EA5E9]'
              : 'hover:bg-[#1C2631]'
            }`}
          aria-label={item.label}
        >
          <Icon
            size={22}
            strokeWidth={1.5}
            className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-[#0EA5E9]' : 'text-[#94A3B8]'}`}
          />
          <span className={`text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isActive ? 'text-[#0EA5E9]' : 'text-[#94A3B8]'
          }`}>
            {item.label}
          </span>
          {item.badge && hasUnacknowledgedAlerts && (
            <span className="absolute top-1.5 left-7 w-2 h-2 bg-[#EF4444] rounded-full" />
          )}
        </button>
      );
    });
  };

  return (
    <nav
      className="group fixed left-0 top-0 h-screen bg-[#141B24] border-r border-[#2A3542] flex flex-col z-[100] w-[72px] hover:w-[240px] transition-[width] duration-300 ease-in-out overflow-hidden"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-[72px] flex items-center px-5 border-b border-[#2A3542]">
        <span className="text-[#D97706] font-bold text-xl tracking-tight whitespace-nowrap">
          <span className="inline group-hover:hidden">SD</span>
          <span className="hidden group-hover:inline">Smart Darshan</span>
        </span>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 flex flex-col py-4 px-3 gap-1 overflow-y-auto overflow-x-hidden">
        {renderNavGroup(1)}

        {/* Divider */}
        <div className="h-px bg-[#2A3542] my-2 w-full" />

        {renderNavGroup(2)}

        {/* Divider */}
        <div className="h-px bg-[#2A3542] my-2 w-full" />

        {renderNavGroup(3)}
      </div>

      {/* System Status Indicator */}
      <div className="pb-6 px-5 flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            systemStatus === 'operational' ? 'bg-[#22C55E]' :
            systemStatus === 'degraded' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
          }`}
        />
        <span className="text-xs text-[#64748B] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          System {systemStatus}
        </span>
      </div>
    </nav>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================
function Header({ temple, user, peakWindow, dataFreshness, dayType }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 h-16 bg-[#141B24] border-b border-[#2A3542] flex items-center px-4 z-50">
      {/* Left Section - Temple Info */}
      <div className="flex flex-col">
        <h1 className="text-base font-semibold text-[#F1F3F5] leading-tight">
          {temple.name}
        </h1>
        <p className="text-xs text-[#64748B]">{temple.location}</p>
      </div>

      {/* Center Section - Date/Time */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="text-sm font-mono text-[#94A3B8]">
          {formatDate(currentTime)} • {formatTime(currentTime)}
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-[rgba(59,130,246,0.2)] text-[#3B82F6]">
          {dayType}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Peak Window */}
        <div className="flex flex-col items-end">
          <span className="text-[11px] uppercase text-[#64748B]">Peak Window</span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#94A3B8]">
              {peakWindow.start} – {peakWindow.end}
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  peakWindow.isActive ? 'bg-[#F59E0B] animate-live-pulse' : 'bg-[#64748B]'
                }`}
              />
              <span className={`text-xs font-medium ${
                peakWindow.isActive ? 'text-[#F59E0B]' : 'text-[#64748B]'
              }`}>
                {peakWindow.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#2A3542]" />

        {/* Data Freshness */}
        <div className="flex items-center gap-2">
          {dataFreshness.status === 'live' ? (
            <>
              <RefreshCw size={14} className="text-[#22C55E] animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs text-[#22C55E] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-live-pulse" />
                Live
              </span>
            </>
          ) : dataFreshness.status === 'stale' ? (
            <>
              <RefreshCw size={14} className="text-[#F59E0B]" />
              <span className="text-xs text-[#F59E0B]">Updated {dataFreshness.lastUpdate}</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-[#EF4444]" />
              <span className="text-xs text-[#EF4444]">Offline</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#2A3542]" />

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[#1C2631] flex items-center justify-center text-xs font-semibold text-[#94A3B8] cursor-pointer hover:bg-[#2A3542] transition-colors"
          title={`Logged in as ${user.name}`}
        >
          {user.initials}
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// CRITICAL ALERT BANNER
// ============================================================================
function CriticalAlertBanner({ alerts, onAcknowledgeAll, onViewAlerts }) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'unacknowledged');
  const warningAlerts = alerts.filter(a => a.severity === 'warning' && a.status === 'unacknowledged');

  const hasCritical = criticalAlerts.length > 0;
  const hasWarning = warningAlerts.length > 0;

  if (!hasCritical && !hasWarning) return null;

  const count = hasCritical ? criticalAlerts.length : warningAlerts.length;
  const severity = hasCritical ? 'critical' : 'warning';
  const preview = hasCritical ? criticalAlerts[0].message : warningAlerts[0].message;

  return (
    <div
      className={`animate-slide-down flex items-center gap-4 px-5 py-4 border-l-4 ${
        hasCritical
          ? 'bg-[rgba(239,68,68,0.15)] border-l-[#EF4444]'
          : 'bg-[rgba(245,158,11,0.12)] border-l-[#F59E0B]'
      }`}
    >
      <AlertTriangle
        size={20}
        className={hasCritical ? 'text-[#EF4444]' : 'text-[#F59E0B]'}
      />

      <div className="flex-1">
        <p className="text-sm font-semibold text-[#F1F3F5]">
          {count} {severity === 'critical' ? 'Critical' : 'Warning'} Alert{count > 1 ? 's' : ''} Require Attention
        </p>
        <p className="text-[13px] text-[#94A3B8]">{preview}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAcknowledgeAll}
          className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F1F3F5] border border-[#2A3542] rounded-lg hover:bg-[#1C2631] transition-colors cursor-pointer"
        >
          Acknowledge All
        </button>
        <button
          onClick={onViewAlerts}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#0EA5E9] rounded-lg hover:bg-[#0284C7] transition-colors cursor-pointer"
        >
          View Alerts
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// KEY METRICS CARDS
// ============================================================================
function MetricCard({ children, onClick, className = '' }) {
  return (
    <article
      onClick={onClick}
      className={`bg-[#141B24] border border-[#2A3542] rounded-xl p-5 cursor-pointer
        hover:border-[#3D4A5C] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-150
        ${className}`}
    >
      {children}
    </article>
  );
}

function LiveFootfallCard({ data }) {
  const trendColor = data.trendDirection === 'up' ? '#22C55E' : '#EF4444';
  const TrendIcon = data.trendDirection === 'up' ? ArrowUp : ArrowDown;

  return (
    <MetricCard>
      <div className="flex items-center gap-2 mb-1">
        <Users size={18} className="text-[#64748B]" />
      </div>
      <p className="text-xs text-[#64748B] mb-2">On Premises Now</p>
      <div className="flex items-baseline gap-3">
        <span className="text-[42px] font-bold text-[#F1F3F5] leading-none">
          {data.current.toLocaleString()}
        </span>
        <div className="flex items-center gap-1" style={{ color: trendColor }}>
          <TrendIcon size={14} />
          <span className="text-[13px]">{data.trend}</span>
        </div>
      </div>
      <p className="text-xs text-[#94A3B8] mt-2">
        Today's total: {data.todayTotal.toLocaleString()}
      </p>
    </MetricCard>
  );
}

function WaitTimeCard({ data }) {
  const color = data.average < 30 ? '#22C55E' : data.average <= 60 ? '#F59E0B' : '#EF4444';

  return (
    <MetricCard>
      <div className="flex items-center gap-2 mb-1">
        <Clock size={18} className="text-[#64748B]" />
      </div>
      <p className="text-xs text-[#64748B] mb-2">Avg. Darshan Wait</p>
      <div className="flex items-baseline gap-1">
        <span className="text-[42px] font-bold leading-none" style={{ color }}>
          {data.average}
        </span>
        <span className="text-lg" style={{ color }}>min</span>
      </div>
      <p className="text-xs text-[#94A3B8] mt-2">
        Shortest via {data.shortestGate}: {data.shortestTime} min
      </p>
    </MetricCard>
  );
}

function CrowdMovementCard({ data }) {
  const statusColors = {
    'NORMAL': '#22C55E',
    'SLOW': '#F59E0B',
    'CONGESTED': '#EF4444'
  };
  const color = statusColors[data.status] || '#64748B';

  const bars = [
    data.level >= 1,
    data.level >= 2,
    data.level >= 3
  ];

  return (
    <MetricCard>
      <div className="flex items-center gap-2 mb-1">
        <Activity size={18} className="text-[#64748B]" />
      </div>
      <p className="text-xs text-[#64748B] mb-2">Movement Status</p>
      <div className="flex items-center gap-4">
        <span className="text-[28px] font-bold" style={{ color }}>
          {data.status}
        </span>
        <div className="flex flex-col gap-1">
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className="w-6 h-1.5 rounded-sm"
              style={{
                backgroundColor: bars[i] ? color : '#2A3542'
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-xs font-mono text-[#64748B] mt-2">
        {data.velocity} {data.unit} avg velocity
      </p>
    </MetricCard>
  );
}

function GateOverviewCard({ data }) {
  const getGateColor = (load, status) => {
    if (status === 'restricted') return '#EF4444';
    if (load < 70) return '#22C55E';
    if (load < 90) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <MetricCard>
      <div className="flex items-center gap-2 mb-1">
        <DoorOpen size={18} className="text-[#64748B]" />
      </div>
      <p className="text-xs text-[#64748B] mb-3">Gate Status</p>
      <div className="flex justify-center gap-3 mb-3">
        {data.summary.map((gate) => (
          <div key={gate.id} className="flex flex-col items-center">
            <div
              className="w-8 h-10 rounded-t-full"
              style={{ backgroundColor: getGateColor(gate.load, gate.status) }}
            />
            <span className="text-[10px] text-[#64748B] mt-1">{gate.label}</span>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-[#94A3B8] text-center">
        {data.open} Open • {data.restricted} Restricted
      </p>
    </MetricCard>
  );
}

// ============================================================================
// COMPOSITE SCORE CARDS
// ============================================================================
function SemiCircleGauge({ value, maxValue = 100, size = 120, strokeWidth = 10, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (value / maxValue) * circumference;

  return (
    <svg width={size} height={size / 2 + 10} className="overflow-visible">
      {/* Background arc */}
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke="#2A3542"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={circumference - progress}
        style={{
          transition: 'stroke-dashoffset 800ms ease-out'
        }}
      />
    </svg>
  );
}

function CrowdStressCard({ data }) {
  const color = getScoreColor(data.value);

  return (
    <MetricCard className="flex flex-col items-center">
      <SemiCircleGauge value={data.value} color={color} />
      <span className="text-[32px] font-bold -mt-4" style={{ color }}>
        {data.value}
      </span>
      <p className="text-[13px] font-semibold text-[#F1F3F5] mt-2">Crowd Stress Index</p>
      <p className="text-[11px] text-[#64748B]">{data.formula}</p>
      <p className="text-xs mt-1" style={{ color }}>
        ↑ {data.trend} {data.trendPeriod}
      </p>
    </MetricCard>
  );
}

function ZoneHealthCard({ data }) {
  const zones = [];
  for (let i = 0; i < data.healthy; i++) zones.push('healthy');
  for (let i = 0; i < data.warning; i++) zones.push('warning');
  for (let i = 0; i < data.critical; i++) zones.push('critical');

  const colorMap = {
    healthy: '#22C55E',
    warning: '#F59E0B',
    critical: '#EF4444'
  };

  return (
    <MetricCard className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-2 mb-4">
        {zones.map((status, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colorMap[status] }}
          />
        ))}
      </div>
      <span className="text-[28px] font-bold text-[#F1F3F5]">
        {data.healthy} of {data.total} Healthy
      </span>
      <p className="text-[13px] font-semibold text-[#F1F3F5] mt-2">Zone Health</p>
      <p className="text-xs text-[#94A3B8]">{data.needsAttention} zones need attention</p>
    </MetricCard>
  );
}

function IncidentRiskCard({ data }) {
  const color = getScoreColor(data.value, { low: 40, high: 70 });

  return (
    <MetricCard className="flex flex-col items-center">
      <SemiCircleGauge value={data.value} color={color} />
      <span className="text-[32px] font-bold -mt-4" style={{ color }}>
        {data.value}
      </span>
      <p className="text-[13px] font-semibold text-[#F1F3F5] mt-2">Incident Risk</p>
      <p className="text-xs" style={{ color }}>{data.level}</p>
      <p className="text-[11px] text-[#64748B]">{data.description}</p>
    </MetricCard>
  );
}

function DevoteeExperienceCard({ data }) {
  const color = data.value >= 70 ? '#22C55E' : data.value >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <MetricCard className="flex flex-col items-center">
      <SemiCircleGauge value={data.value} color={color} />
      <span className="text-[32px] font-bold text-[#F1F3F5] -mt-4">
        {data.value}
      </span>
      <p className="text-[13px] font-semibold text-[#F1F3F5] mt-2">Devotee Experience</p>
      <p className="text-xs" style={{ color }}>{data.level}</p>
      <p className="text-[11px] text-[#64748B]">{data.formula}</p>
    </MetricCard>
  );
}

// ============================================================================
// ZONE DENSITY HEATMAP
// ============================================================================
function ZoneDensityHeatmap({ zones }) {
  const [viewMode, setViewMode] = useState('map');
  const [hoveredZone, setHoveredZone] = useState(null);

  const zoneLayout = [
    { id: 'temple-core', row: 1, col: 1, rowSpan: 1, colSpan: 2 },
    { id: 'darshan-queue', row: 1, col: 3, rowSpan: 1, colSpan: 2 },
    { id: 'counters', row: 2, col: 1, rowSpan: 1, colSpan: 1 },
    { id: 'prasadam', row: 2, col: 2, rowSpan: 1, colSpan: 1 },
    { id: 'annadanam', row: 2, col: 3, rowSpan: 1, colSpan: 2 },
    { id: 'parking', row: 3, col: 1, rowSpan: 1, colSpan: 2 },
    { id: 'choulties', row: 3, col: 3, rowSpan: 1, colSpan: 1 },
    { id: 'sub-temples', row: 3, col: 4, rowSpan: 1, colSpan: 1 },
    { id: 'gosala', row: 4, col: 1, rowSpan: 1, colSpan: 1 },
    { id: 'kesakhandana', row: 4, col: 2, rowSpan: 1, colSpan: 1 },
    { id: 'boats-tanks', row: 4, col: 3, rowSpan: 1, colSpan: 2 },
  ];

  const getZoneData = (id) => zones.find(z => z.id === id);

  return (
    <article className="bg-[#141B24] border border-[#2A3542] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#F1F3F5]">Zone Density</h2>
        <div className="flex bg-[#0B0F14] rounded-lg p-0.5">
          {['Map', 'List'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode.toLowerCase())}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer
                ${viewMode === mode.toLowerCase()
                  ? 'bg-[#1C2631] text-[#F1F3F5]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      {viewMode === 'map' ? (
        <div
          className="grid gap-1 relative"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 60px)'
          }}
        >
          {zoneLayout.map((layout) => {
            const zone = getZoneData(layout.id);
            if (!zone) return null;

            const isCritical = zone.density > 85;
            const isHighCritical = zone.density > 90;

            return (
              <div
                key={zone.id}
                className={`relative flex flex-col items-center justify-center p-2 rounded cursor-pointer
                  transition-transform duration-150 hover:scale-[1.02] hover:z-10
                  ${isCritical ? 'animate-pulse-subtle' : ''}
                  ${isHighCritical ? 'ring-1 ring-[#EF4444] ring-opacity-50' : ''}
                `}
                style={{
                  gridColumn: `${layout.col} / span ${layout.colSpan}`,
                  gridRow: `${layout.row} / span ${layout.rowSpan}`,
                  backgroundColor: getDensityColor(zone.density),
                }}
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <span className="text-[11px] font-semibold text-white drop-shadow-sm text-center leading-tight">
                  {zone.name}
                </span>
                <span className="text-base font-bold text-white drop-shadow-sm">
                  {zone.density}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between p-3 bg-[#0B0F14] rounded-lg"
            >
              <span className="text-sm text-[#F1F3F5]">{zone.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#64748B]">{zone.count} people</span>
                <div
                  className="w-12 h-2 rounded-full overflow-hidden bg-[#2A3542]"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${zone.density}%`,
                      backgroundColor: getDensityColor(zone.density)
                    }}
                  />
                </div>
                <span
                  className="text-sm font-semibold w-10 text-right"
                  style={{ color: getDensityColor(zone.density) }}
                >
                  {zone.density}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {hoveredZone && (
        <div className="absolute bg-[#1C2631] rounded-lg p-3 shadow-xl z-50 pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <p className="text-sm font-semibold text-[#F1F3F5]">{hoveredZone.name}</p>
          <p className="text-xs text-[#94A3B8]">{hoveredZone.count} people</p>
          <p className="text-xs" style={{ color: getDensityColor(hoveredZone.density) }}>
            {hoveredZone.density}% capacity
          </p>
          <p className="text-xs text-[#64748B]">Trend: {hoveredZone.trend}</p>
        </div>
      )}
    </article>
  );
}

// ============================================================================
// GATE STATUS PANEL
// ============================================================================
function GateStatusPanel({ gates }) {
  return (
    <article className="bg-[#141B24] border border-[#2A3542] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[#F1F3F5]">Gate Status</h2>
          <p className="text-xs text-[#64748B]">4 Gopurams</p>
        </div>
      </div>

      {/* Gate List */}
      <div className="space-y-2">
        {gates.map((gate) => (
          <div
            key={gate.id}
            className="flex items-center gap-4 p-3 bg-[#0B0F14] rounded-lg hover:bg-[#141B24] transition-colors cursor-pointer"
          >
            {/* Gate Icon */}
            <div className="flex flex-col items-center">
              <div
                className="w-6 h-8 rounded-t-full"
                style={{ backgroundColor: getLoadColor(gate.load) }}
              />
              <span className="text-[10px] text-[#64748B] mt-1">{gate.type}</span>
            </div>

            {/* Gate Info */}
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#F1F3F5]">{gate.name}</p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold
                  ${gate.status === 'open'
                    ? 'bg-[rgba(34,197,94,0.2)] text-[#22C55E]'
                    : gate.status === 'restricted'
                    ? 'bg-[rgba(245,158,11,0.2)] text-[#F59E0B]'
                    : 'bg-[rgba(239,68,68,0.2)] text-[#EF4444]'
                  }`}
              >
                {gate.status}
              </span>
            </div>

            {/* Load Ring */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#2A3542"
                  strokeWidth="4"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={getLoadColor(gate.load)}
                  strokeWidth="4"
                  strokeDasharray={`${(gate.load / 100) * 100.53} 100.53`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{ color: getLoadColor(gate.load) }}
              >
                {gate.load}%
              </span>
            </div>

            {/* Flow Rate */}
            <div className="text-right">
              <p className="text-xs font-mono text-[#F1F3F5]">+{gate.flowRate}/hr</p>
              <p className="text-[10px] text-[#64748B]">{gate.flowDirection}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

// ============================================================================
// ALERTS PANEL
// ============================================================================
function AlertsPanel({ alerts, sparkline, onAcknowledge, onDismiss }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  };

  const filteredAlerts = activeFilter === 'all'
    ? alerts.slice(0, 5)
    : alerts.filter(a => a.severity === activeFilter).slice(0, 5);

  const severityColors = {
    critical: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  };

  const maxSparkline = Math.max(...sparkline);

  return (
    <article className="bg-[#141B24] border border-[#2A3542] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#F1F3F5]">Active Alerts</h2>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer
                ${activeFilter === key
                  ? 'bg-[#1C2631] text-[#F1F3F5]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{
                  backgroundColor: key === 'all' ? '#2A3542' : `${severityColors[key]}20`,
                  color: key === 'all' ? '#94A3B8' : severityColors[key]
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-1">
          {filteredAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg
                ${index % 2 === 0 ? 'bg-[#0B0F14]' : 'bg-[#141B24]'}
              `}
            >
              {/* Severity Icon */}
              <AlertTriangle
                size={20}
                style={{ color: severityColors[alert.severity] }}
              />

              {/* Time */}
              <span className="text-xs font-mono text-[#64748B] w-16">
                {alert.time}
              </span>

              {/* Zone Tag */}
              <span className="px-2 py-0.5 bg-[#1C2631] rounded text-[11px] text-[#94A3B8] w-24 text-center truncate">
                {alert.zone}
              </span>

              {/* Message */}
              <p className="flex-1 text-[13px] text-[#F1F3F5] truncate">
                {alert.message}
              </p>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium
                  ${alert.status === 'unacknowledged'
                    ? 'bg-[rgba(239,68,68,0.2)] text-[#EF4444]'
                    : alert.status === 'acknowledged'
                    ? 'bg-[rgba(34,197,94,0.2)] text-[#22C55E]'
                    : 'bg-[#2A3542] text-[#64748B]'
                  }`}
              >
                {alert.status}
              </span>

              {/* Actions */}
              <div className="flex gap-1">
                {alert.status === 'unacknowledged' && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="p-1.5 rounded hover:bg-[#1C2631] transition-colors cursor-pointer"
                    title="Acknowledge"
                  >
                    <CheckCircle size={16} className="text-[#64748B] hover:text-[#22C55E]" />
                  </button>
                )}
                <button
                  className="p-1.5 rounded hover:bg-[#1C2631] transition-colors cursor-pointer"
                  title="View Details"
                >
                  <ExternalLink size={16} className="text-[#64748B] hover:text-[#0EA5E9]" />
                </button>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1.5 rounded hover:bg-[#1C2631] transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X size={16} className="text-[#64748B] hover:text-[#EF4444]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle size={48} className="text-[#22C55E] mb-3" />
          <p className="text-sm text-[#94A3B8]">No active alerts</p>
          <p className="text-xs text-[#64748B]">All systems operating normally</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2A3542]">
        <button className="text-xs text-[#0EA5E9] hover:underline cursor-pointer">
          View All Alerts →
        </button>

        {/* Mini Sparkline */}
        <div className="flex items-end gap-px h-6">
          {sparkline.slice(-30).map((value, i) => (
            <div
              key={i}
              className="w-1 bg-[#3B82F6] rounded-t opacity-60"
              style={{ height: `${(value / maxSparkline) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// QUICK ACTIONS FAB
// ============================================================================
function QuickActionsFab() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const actions = [
    { id: 'emergency', icon: Shield, label: 'Activate Emergency Protocol', danger: true },
    { id: 'staff', icon: Users, label: 'Send Staff Alert' },
    { id: 'pa', icon: Megaphone, label: 'Trigger PA Announcement' },
    { id: 'ai', icon: Sparkles, label: 'AI Gate Recommendations' },
  ];

  return (
    <>
      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-center gap-3">
        {/* Action Buttons */}
        {isExpanded && (
          <div className="flex flex-col gap-3 animate-fade-in-up">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => setActiveModal(action.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                    transition-all duration-150 cursor-pointer
                    ${action.danger
                      ? 'bg-[rgba(239,68,68,0.2)] border border-[#EF4444] hover:bg-[rgba(239,68,68,0.3)]'
                      : 'bg-[#1C2631] hover:bg-[#2A3542]'
                    }`}
                  style={{
                    animationDelay: `${(actions.length - 1 - index) * 50}ms`
                  }}
                  title={action.label}
                >
                  <Icon
                    size={20}
                    className={action.danger ? 'text-[#EF4444]' : 'text-[#94A3B8]'}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full bg-[#0EA5E9] flex items-center justify-center
            shadow-[0_4px_16px_rgba(14,165,233,0.4)] hover:scale-105 transition-all duration-150 cursor-pointer
            ${isExpanded ? 'rotate-45' : ''}`}
        >
          <Zap size={24} className="text-white" />
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'ai' && (
        <Modal title="AI Gate Recommendations" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="p-4 bg-[#0B0F14] rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-[#0EA5E9] mt-0.5" />
                <div>
                  <p className="text-sm text-[#F1F3F5]">Restrict West Gopuram entry, redirect to South</p>
                  <p className="text-xs text-[#64748B] mt-1">Confidence: 87%</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#1C2631] rounded-lg">
              <p className="text-xs text-[#94A3B8]">Predicted Impact</p>
              <p className="text-sm text-[#22C55E]">Reduce congestion by 23% in 15 minutes</p>
            </div>
            <button className="w-full py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:bg-[#0284C7] transition-colors cursor-pointer">
              Apply Recommendation
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'pa' && (
        <Modal title="Trigger PA Announcement" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#64748B] block mb-2">Preset Announcement</label>
              <select className="w-full p-2 bg-[#0B0F14] border border-[#2A3542] rounded-lg text-sm text-[#F1F3F5]">
                <option>Queue Guidance</option>
                <option>Safety Reminder</option>
                <option>Gate Announcement</option>
                <option>Custom Message</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#64748B] block mb-2">Target Zones</label>
              <div className="flex flex-wrap gap-2">
                {['All Zones', 'Temple Core', 'Darshan Queue', 'Gates'].map((zone) => (
                  <label key={zone} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <input type="checkbox" className="rounded border-[#2A3542]" />
                    {zone}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#64748B] block mb-2">Languages</label>
              <div className="flex gap-4">
                {['Telugu', 'Hindi', 'English'].map((lang) => (
                  <label key={lang} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <input type="checkbox" className="rounded border-[#2A3542]" defaultChecked />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:bg-[#0284C7] transition-colors cursor-pointer">
              Broadcast
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'staff' && (
        <Modal title="Send Staff Alert" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#64748B] block mb-2">Recipient Group</label>
              <select className="w-full p-2 bg-[#0B0F14] border border-[#2A3542] rounded-lg text-sm text-[#F1F3F5]">
                <option>Security</option>
                <option>Temple Staff</option>
                <option>Sanitation</option>
                <option>Volunteers</option>
                <option>Medical</option>
                <option>All Staff</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#64748B] block mb-2">Message Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <input type="radio" name="msgType" defaultChecked />
                  Normal
                </label>
                <label className="flex items-center gap-2 text-sm text-[#EF4444]">
                  <input type="radio" name="msgType" />
                  Urgent
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#64748B] block mb-2">Message</label>
              <textarea
                className="w-full p-2 bg-[#0B0F14] border border-[#2A3542] rounded-lg text-sm text-[#F1F3F5] resize-none"
                rows={3}
                placeholder="Enter your message..."
              />
            </div>
            <div>
              <label className="text-xs text-[#64748B] block mb-2">Channel</label>
              <div className="flex gap-4">
                {['SMS', 'WhatsApp', 'Both'].map((ch) => (
                  <label key={ch} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <input type="radio" name="channel" defaultChecked={ch === 'Both'} />
                    {ch}
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:bg-[#0284C7] transition-colors cursor-pointer">
              Send Alert
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'emergency' && (
        <Modal title="Activate Emergency Protocol" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Fire Emergency', emoji: '🔥' },
                { label: 'Medical Emergency', emoji: '🏥' },
                { label: 'Crowd Surge', emoji: '🚨' },
                { label: 'Power Failure', emoji: '⚡' },
                { label: 'Natural Calamity', emoji: '🌊' },
              ].map((protocol) => (
                <button
                  key={protocol.label}
                  className="p-4 bg-[#0B0F14] border border-[#2A3542] rounded-lg text-left hover:border-[#EF4444] transition-colors cursor-pointer"
                >
                  <span className="text-2xl block mb-2">{protocol.emoji}</span>
                  <span className="text-sm text-[#F1F3F5]">{protocol.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#F59E0B] text-center">
              This will trigger automated PA announcements and staff alerts.
            </p>
            <button className="w-full py-2 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors cursor-pointer">
              Activate Protocol
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#141B24] border border-[#2A3542] rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F1F3F5]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#1C2631] transition-colors cursor-pointer"
          >
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================
function LoadingSkeleton() {
  return (
    <div className="space-y-7">
      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#141B24] border border-[#2A3542] rounded-xl p-5">
            <div className="h-4 w-24 animate-shimmer rounded mb-3" />
            <div className="h-10 w-32 animate-shimmer rounded mb-2" />
            <div className="h-3 w-20 animate-shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Composite Scores Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#141B24] border border-[#2A3542] rounded-xl p-5 flex flex-col items-center">
            <div className="h-16 w-28 animate-shimmer rounded-full mb-3" />
            <div className="h-8 w-16 animate-shimmer rounded mb-2" />
            <div className="h-4 w-24 animate-shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Split Panel Skeleton */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 bg-[#141B24] border border-[#2A3542] rounded-xl p-5">
          <div className="h-5 w-32 animate-shimmer rounded mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="h-14 animate-shimmer rounded" />
            ))}
          </div>
        </div>
        <div className="col-span-5 bg-[#141B24] border border-[#2A3542] rounded-xl p-5">
          <div className="h-5 w-24 animate-shimmer rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-18 animate-shimmer rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Skeleton */}
      <div className="bg-[#141B24] border border-[#2A3542] rounded-xl p-5">
        <div className="h-5 w-28 animate-shimmer rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-shimmer rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================
function ErrorState({ onRetry, message = 'Unable to load data' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle size={64} className="text-[#EF4444] mb-4" />
      <h2 className="text-xl font-semibold text-[#F1F3F5] mb-2">Connection Lost</h2>
      <p className="text-sm text-[#94A3B8] mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:bg-[#0284C7] transition-colors cursor-pointer"
      >
        Retry Connection
      </button>
    </div>
  );
}

// ============================================================================
// OFFLINE BANNER
// ============================================================================
function OfflineBanner({ lastUpdate, onDismiss }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-[rgba(245,158,11,0.12)] border-l-4 border-l-[#F59E0B]">
      <div className="flex items-center gap-3">
        <WifiOff size={18} className="text-[#F59E0B]" />
        <p className="text-sm text-[#F1F3F5]">
          Operating in offline mode. Displaying cached data from {lastUpdate}.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-[rgba(245,158,11,0.2)] transition-colors cursor-pointer"
      >
        <X size={18} className="text-[#F59E0B]" />
      </button>
    </div>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
      setLoading(false);
      setIsOffline(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (!data) {
        setError(err.message);
      } else {
        setIsOffline(true);
        setShowOfflineBanner(true);
      }
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAcknowledgeAlert = (alertId) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a =>
        a.id === alertId ? { ...a, status: 'acknowledged' } : a
      )
    }));
  };

  const handleDismissAlert = (alertId) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId)
    }));
  };

  const handleAcknowledgeAllCritical = () => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a =>
        (a.severity === 'critical' || a.severity === 'warning') && a.status === 'unacknowledged'
          ? { ...a, status: 'acknowledged' }
          : a
      )
    }));
  };

  const hasUnacknowledgedAlerts = data?.alerts?.some(
    a => a.status === 'unacknowledged' && (a.severity === 'critical' || a.severity === 'warning')
  );

  return (
    <div className="min-h-screen bg-pattern">
      {/* Sidebar */}
      <Sidebar
        activeItem="command-center"
        systemStatus={data?.systemStatus || 'operational'}
        hasUnacknowledgedAlerts={hasUnacknowledgedAlerts}
      />

      {/* Main Content */}
      <div className="ml-[72px] min-h-screen flex flex-col">
        {/* Header */}
        {data && (
          <Header
            temple={data.temple}
            user={data.user}
            peakWindow={data.temple.peakWindow}
            dataFreshness={isOffline ? { status: 'offline' } : data.dataFreshness}
            dayType={data.temple.dayType}
          />
        )}

        {/* Offline Banner */}
        {showOfflineBanner && (
          <OfflineBanner
            lastUpdate="10:42 AM"
            onDismiss={() => setShowOfflineBanner(false)}
          />
        )}

        {/* Critical Alert Banner */}
        {data && (
          <CriticalAlertBanner
            alerts={data.alerts}
            onAcknowledgeAll={handleAcknowledgeAllCritical}
            onViewAlerts={() => {}}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : error && !data ? (
            <ErrorState onRetry={fetchData} message={error} />
          ) : data ? (
            <div className="space-y-7">
              {/* Key Metrics Section */}
              <section aria-label="Key Metrics">
                <div className="grid grid-cols-4 gap-4">
                  <LiveFootfallCard data={data.metrics.liveFootfall} />
                  <WaitTimeCard data={data.metrics.darshanWaitTime} />
                  <CrowdMovementCard data={data.metrics.crowdMovement} />
                  <GateOverviewCard data={data.metrics.gates} />
                </div>
              </section>

              {/* Composite Scores Section */}
              <section aria-label="Composite Scores">
                <div className="grid grid-cols-4 gap-4">
                  <CrowdStressCard data={data.compositeScores.crowdStress} />
                  <ZoneHealthCard data={data.compositeScores.zoneHealth} />
                  <IncidentRiskCard data={data.compositeScores.incidentRisk} />
                  <DevoteeExperienceCard data={data.compositeScores.devoteeExperience} />
                </div>
              </section>

              {/* Zone Density + Gate Status Split Panel */}
              <section aria-label="Zone and Gate Status" className="grid grid-cols-12 gap-4">
                <div className="col-span-7">
                  <ZoneDensityHeatmap zones={data.zones} />
                </div>
                <div className="col-span-5">
                  <GateStatusPanel gates={data.gateDetails} />
                </div>
              </section>

              {/* Active Alerts Panel */}
              <section aria-label="Active Alerts">
                <AlertsPanel
                  alerts={data.alerts}
                  sparkline={data.alertSparkline}
                  onAcknowledge={handleAcknowledgeAlert}
                  onDismiss={handleDismissAlert}
                />
              </section>
            </div>
          ) : null}
        </main>
      </div>

      {/* Quick Actions FAB */}
      <QuickActionsFab />
    </div>
  );
}

export default App;
