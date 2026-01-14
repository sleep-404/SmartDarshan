import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Volume2,
  Send,
  Filter
} from 'lucide-react';

function AlertCard({ alert, onAcknowledge }) {
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const getSeverityStyles = (severity, type) => {
    if (type === 'resolved') {
      return {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        icon: CheckCircle,
        iconColor: 'text-slate-400'
      };
    }
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: AlertTriangle,
          iconColor: 'text-red-600'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: AlertCircle,
          iconColor: 'text-amber-600'
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: Bell,
          iconColor: 'text-slate-600'
        };
    }
  };

  const styles = getSeverityStyles(alert.severity, alert.type);
  const IconComponent = styles.icon;

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    try {
      await fetch(`http://localhost:3001/api/alerts/${alert.id}/acknowledge`, {
        method: 'POST'
      });
      onAcknowledge?.(alert.id);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
    setIsAcknowledging(false);
  };

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <IconComponent size={20} className={styles.iconColor} />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-slate-900">{alert.message}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="capitalize">{alert.zone?.replace('-', ' ')}</span>
                <span>•</span>
                <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                {alert.autoTriggered && (
                  <>
                    <span>•</span>
                    <span className="text-primary-600">AI Triggered</span>
                  </>
                )}
              </div>
            </div>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              alert.severity === 'high' ? 'bg-red-100 text-red-700' :
              alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {alert.severity}
            </span>
          </div>
          {!alert.acknowledged && alert.type !== 'resolved' && (
            <button
              onClick={handleAcknowledge}
              disabled={isAcknowledging}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}
            </button>
          )}
          {alert.acknowledged && (
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle size={12} />
              Acknowledged
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BroadcastPanel() {
  const [message, setMessage] = useState('');
  const [selectedZones, setSelectedZones] = useState(['all']);

  const handleBroadcast = () => {
    // In production, this would send to PA system
    console.log('Broadcasting:', message, 'to zones:', selectedZones);
    setMessage('');
  };

  return (
    <div className="card">
      <h3 className="card-header">PA Broadcast</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter announcement message..."
            className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBroadcast}
            disabled={!message.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Volume2 size={16} />
            Broadcast
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Send size={16} />
            Send SMS Alert
          </button>
        </div>
      </div>
    </div>
  );
}

function ThresholdConfig() {
  return (
    <div className="card">
      <h3 className="card-header">Alert Thresholds</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Density Critical</span>
            <span className="text-sm font-medium text-slate-900">85%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            defaultValue="85"
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Wait Time Warning</span>
            <span className="text-sm font-medium text-slate-900">60 min</span>
          </div>
          <input
            type="range"
            min="15"
            max="120"
            defaultValue="60"
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Gate Congestion</span>
            <span className="text-sm font-medium text-slate-900">75%</span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            defaultValue="75"
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default function Alerts() {
  const { data } = useData();
  const [filter, setFilter] = useState('all');

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading alerts...</p>
        </div>
      </div>
    );
  }

  const { alerts } = data;

  const filteredAlerts = alerts?.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return !alert.acknowledged && alert.type !== 'resolved';
    if (filter === 'acknowledged') return alert.acknowledged;
    return alert.severity === filter;
  }) || [];

  const activeCount = alerts?.filter(a => !a.acknowledged && a.type !== 'resolved').length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Alerts & Notifications</h1>
          <p className="text-slate-500 mt-1">Automated escalation and notification management</p>
        </div>
        {activeCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
            <AlertTriangle size={20} />
            <span className="font-medium">{activeCount} active alerts</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit">
            {['all', 'active', 'high', 'medium', 'low', 'acknowledged'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  filter === f
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="card text-center py-12">
                <Bell size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No alerts matching filter</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <BroadcastPanel />
          <ThresholdConfig />
        </div>
      </div>
    </div>
  );
}
