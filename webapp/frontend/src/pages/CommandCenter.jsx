import { useData } from '../context/DataContext';
import {
  Users,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'slate' }) {
  const colorClasses = {
    slate: 'bg-slate-50 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-4 text-sm">
          {trend === 'increasing' && <TrendingUp size={16} className="text-emerald-500" />}
          {trend === 'decreasing' && <TrendingDown size={16} className="text-red-500" />}
          {trend === 'stable' && <Minus size={16} className="text-slate-400" />}
          <span className="text-slate-600 capitalize">{trend}</span>
        </div>
      )}
    </div>
  );
}

function ZoneHeatmap({ zones }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-amber-500';
      case 'normal': return 'bg-emerald-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'moderate': return 'bg-amber-50 border-amber-200';
      case 'normal': return 'bg-emerald-50 border-emerald-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="card">
      <h3 className="card-header">Zone Density Overview</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {zones?.map((zone) => (
          <div
            key={zone.id}
            className={`p-4 rounded-lg border ${getStatusBg(zone.status)} transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 truncate pr-2">
                {zone.name}
              </span>
              <span className={`w-2 h-2 rounded-full ${getStatusColor(zone.status)}`} />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold text-slate-900">
                {zone.density}%
              </span>
              <span className="text-xs text-slate-500">
                {zone.currentCount?.toLocaleString()} people
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GateSummary({ gates }) {
  const getStatusDot = (status) => {
    switch (status) {
      case 'open': return 'bg-emerald-500';
      case 'restricted': return 'bg-amber-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="card">
      <h3 className="card-header">Gate Status</h3>
      <div className="space-y-3">
        {gates?.map((gate) => (
          <div
            key={gate.id}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${getStatusDot(gate.status)}`} />
              <div>
                <p className="text-sm font-medium text-slate-900">{gate.name}</p>
                <p className="text-xs text-slate-500 capitalize">{gate.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {gate.entryRate}/min
              </p>
              <p className="text-xs text-slate-500">entry rate</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveAlerts({ alerts }) {
  const activeAlerts = alerts?.filter(a => !a.acknowledged && a.type !== 'resolved') || [];

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">Active Alerts</h3>
        <span className="text-sm font-medium text-slate-500">
          {activeAlerts.length} unresolved
        </span>
      </div>
      <div className="space-y-3">
        {activeAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No active alerts
          </p>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getSeverityStyles(alert.severity)}`}
            >
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { realtime, zones, gates, alerts } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Command Center</h1>
        <p className="text-slate-500 mt-1">Real-time temple overview and situational awareness</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Footfall"
          value={realtime?.currentFootfall?.toLocaleString()}
          subtitle="devotees on premises"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Avg Wait Time"
          value={`${realtime?.avgWaitTime} min`}
          subtitle="for darshan"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Alerts"
          value={alerts?.filter(a => !a.acknowledged && a.type !== 'resolved').length || 0}
          subtitle="requiring attention"
          icon={AlertTriangle}
          color={realtime?.activeAlerts > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          title="Overall Density"
          value={`${realtime?.overallDensity}%`}
          subtitle="across all zones"
          icon={Activity}
          color={realtime?.overallDensity > 80 ? 'red' : realtime?.overallDensity > 60 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Zone Heatmap */}
      <ZoneHeatmap zones={zones} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GateSummary gates={gates} />
        <ActiveAlerts alerts={alerts} />
      </div>
    </div>
  );
}
