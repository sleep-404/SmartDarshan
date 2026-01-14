import { useData } from '../context/DataContext';
import {
  Camera,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Volume2,
  Clock
} from 'lucide-react';

function StatusIndicator({ status }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'stable':
      case 'operational':
        return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'offline':
      case 'error':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' };
      case 'warning':
      case 'maintenance':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' };
      default:
        return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-50' };
    }
  };

  const styles = getStatusStyles();
  const Icon = styles.icon;

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${styles.bg}`}>
      <Icon size={14} className={styles.color} />
      <span className={`text-xs font-medium capitalize ${styles.color}`}>{status}</span>
    </div>
  );
}

function MetricBar({ label, value, max = 100, threshold = 80 }) {
  const percentage = (value / max) * 100;
  const isWarning = percentage >= threshold;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className={`font-medium ${isWarning ? 'text-amber-600' : 'text-slate-900'}`}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CameraStatus({ cameras }) {
  const percentage = ((cameras?.online || 0) / (cameras?.total || 1)) * 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">Camera Status</h3>
        <StatusIndicator status={cameras?.offline === 0 ? 'healthy' : 'warning'} />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-4 bg-slate-50 rounded-xl">
          <Camera size={32} className="text-slate-600" />
        </div>
        <div>
          <p className="text-3xl font-semibold text-slate-900">
            {cameras?.online}/{cameras?.total}
          </p>
          <p className="text-sm text-slate-500">cameras online</p>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-emerald-50 rounded-lg">
          <p className="text-lg font-semibold text-emerald-700">{cameras?.online}</p>
          <p className="text-xs text-emerald-600">Online</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-lg font-semibold text-red-700">{cameras?.offline}</p>
          <p className="text-xs text-red-600">Offline</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg">
          <p className="text-lg font-semibold text-amber-700">{cameras?.maintenance}</p>
          <p className="text-xs text-amber-600">Maintenance</p>
        </div>
      </div>
    </div>
  );
}

function VMSStatus({ vms }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">HikCentral VMS</h3>
        <StatusIndicator status={vms?.status} />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-xl">
          <Server size={32} className="text-blue-600" />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">Video Management System</p>
          <p className="text-sm text-slate-500">Central monitoring hub</p>
        </div>
      </div>
      <div className="space-y-4">
        <MetricBar label="CPU Usage" value={vms?.cpu} threshold={80} />
        <MetricBar label="Memory Usage" value={vms?.memory} threshold={85} />
        <MetricBar label="Storage Usage" value={vms?.storage} threshold={90} />
      </div>
    </div>
  );
}

function NetworkStatus({ network }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">Network</h3>
        <StatusIndicator status={network?.status} />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-emerald-50 rounded-xl">
          <Wifi size={32} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">Network Connectivity</p>
          <p className="text-sm text-slate-500">All zones connected</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500 mb-1">Latency</p>
          <p className="text-2xl font-semibold text-slate-900">{network?.latency}ms</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500 mb-1">Bandwidth</p>
          <p className="text-2xl font-semibold text-slate-900">{network?.bandwidth}%</p>
        </div>
      </div>
    </div>
  );
}

function EdgeNodes({ nodes }) {
  return (
    <div className="card">
      <h3 className="card-header">Edge Processing Nodes</h3>
      <div className="space-y-3">
        {nodes?.map((node) => (
          <div
            key={node.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              node.status === 'online' ? 'bg-slate-50' : 'bg-red-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                node.status === 'online' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                <HardDrive size={16} className={
                  node.status === 'online' ? 'text-emerald-600' : 'text-red-600'
                } />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{node.id}</p>
                <p className="text-xs text-slate-500">{node.zone}</p>
              </div>
            </div>
            <div className="text-right">
              {node.status === 'online' ? (
                <>
                  <p className="text-sm font-medium text-slate-900">{node.load}%</p>
                  <p className="text-xs text-slate-500">load</p>
                </>
              ) : (
                <span className="text-xs font-medium text-red-600 uppercase">Offline</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PASystemStatus({ paSystem }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">PA System</h3>
        <StatusIndicator status={paSystem?.status} />
      </div>
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary-50 rounded-xl">
          <Volume2 size={32} className="text-primary-600" />
        </div>
        <div>
          <p className="text-3xl font-semibold text-slate-900">
            {paSystem?.activeZones}/{paSystem?.zones}
          </p>
          <p className="text-sm text-slate-500">zones active</p>
        </div>
      </div>
    </div>
  );
}

export default function SystemHealth() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading system status...</p>
        </div>
      </div>
    );
  }

  const { systemHealth } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">System Health</h1>
          <p className="text-slate-500 mt-1">Infrastructure monitoring and connectivity status</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock size={16} />
          <span>Last sync: {new Date(systemHealth?.lastSync).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CameraStatus cameras={systemHealth?.cameras} />
        <VMSStatus vms={systemHealth?.vms} />
        <NetworkStatus network={systemHealth?.network} />
        <PASystemStatus paSystem={systemHealth?.paSystem} />
      </div>

      {/* Edge Nodes */}
      <EdgeNodes nodes={systemHealth?.edgeNodes} />

      {/* Fallback Status */}
      <div className="card">
        <h3 className="card-header">Offline Resilience Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Edge Processing</p>
              <p className="text-xs text-emerald-600">Ready for offline mode</p>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">SMS Fallback</p>
              <p className="text-xs text-emerald-600">Gateway connected</p>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">IVR System</p>
              <p className="text-xs text-emerald-600">Available as backup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
