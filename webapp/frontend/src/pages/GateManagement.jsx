import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  DoorOpen,
  DoorClosed,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

function GateCard({ gate, onControl }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'open':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: 'text-emerald-600',
          badge: 'bg-emerald-100 text-emerald-700'
        };
      case 'restricted':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-700'
        };
      case 'closed':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700'
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: 'text-slate-600',
          badge: 'bg-slate-100 text-slate-700'
        };
    }
  };

  const styles = getStatusStyles(gate.status);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await fetch(`http://localhost:3001/api/gates/${gate.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Failed to update gate status:', error);
    }
    setIsUpdating(false);
  };

  return (
    <div className={`card ${styles.bg} border ${styles.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {gate.status === 'open' ? (
            <DoorOpen size={24} className={styles.icon} />
          ) : (
            <DoorClosed size={24} className={styles.icon} />
          )}
          <div>
            <h3 className="font-semibold text-slate-900">{gate.name}</h3>
            <p className="text-xs text-slate-500 capitalize">{gate.type.replace('-', ' ')}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles.badge}`}>
          {gate.status}
        </span>
      </div>

      {/* Flow Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <ArrowUpRight size={16} />
            <span className="text-xs font-medium">Entry Rate</span>
          </div>
          <p className="text-xl font-semibold text-slate-900">{gate.entryRate}/min</p>
        </div>
        {gate.type === 'entry-exit' && (
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <ArrowDownRight size={16} />
              <span className="text-xs font-medium">Exit Rate</span>
            </div>
            <p className="text-xl font-semibold text-slate-900">{gate.exitRate}/min</p>
          </div>
        )}
        {gate.type === 'entry-only' && (
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Users size={16} />
              <span className="text-xs font-medium">Congestion</span>
            </div>
            <p className="text-xl font-semibold text-slate-900">{gate.congestion}%</p>
          </div>
        )}
      </div>

      {/* Congestion Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span>Congestion Level</span>
          <span>{gate.congestion}%</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              gate.congestion >= 80 ? 'bg-red-500' :
              gate.congestion >= 60 ? 'bg-amber-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${gate.congestion}%` }}
          />
        </div>
      </div>

      {/* AI Recommendation */}
      {gate.recommendation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800">{gate.recommendation}</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusChange('open')}
          disabled={gate.status === 'open' || isUpdating}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            gate.status === 'open'
              ? 'bg-emerald-200 text-emerald-800 cursor-not-allowed'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
        >
          Open
        </button>
        <button
          onClick={() => handleStatusChange('restricted')}
          disabled={gate.status === 'restricted' || isUpdating}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            gate.status === 'restricted'
              ? 'bg-amber-200 text-amber-800 cursor-not-allowed'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          Restrict
        </button>
        <button
          onClick={() => handleStatusChange('closed')}
          disabled={gate.status === 'closed' || isUpdating}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            gate.status === 'closed'
              ? 'bg-red-200 text-red-800 cursor-not-allowed'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function QueueStatus({ zones }) {
  const queueZone = zones?.find(z => z.id === 'darshan-queue');

  if (!queueZone) return null;

  return (
    <div className="card">
      <h3 className="card-header">Darshan Queue Status</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-xl">
              <Clock size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Current Wait Time</p>
              <p className="text-2xl font-semibold text-slate-900">{queueZone.waitTime} min</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">People in Queue</p>
            <p className="text-2xl font-semibold text-slate-900">
              {queueZone.currentCount?.toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Queue Capacity</span>
            <span>{queueZone.density}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                queueZone.density >= 85 ? 'bg-red-500' :
                queueZone.density >= 70 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${queueZone.density}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowSummary({ gates }) {
  const totalEntry = gates?.reduce((sum, g) => sum + g.entryRate, 0) || 0;
  const totalExit = gates?.filter(g => g.type === 'entry-exit')
    .reduce((sum, g) => sum + g.exitRate, 0) || 0;

  return (
    <div className="card">
      <h3 className="card-header">Flow Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <ArrowUpRight size={20} />
            <span className="text-sm font-medium">Total Entry</span>
          </div>
          <p className="text-3xl font-semibold text-slate-900">{totalEntry}</p>
          <p className="text-sm text-slate-500">people/min</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ArrowDownRight size={20} />
            <span className="text-sm font-medium">Total Exit</span>
          </div>
          <p className="text-3xl font-semibold text-slate-900">{totalExit}</p>
          <p className="text-sm text-slate-500">people/min</p>
        </div>
      </div>
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Net Flow</span>
          <span className={`text-sm font-semibold ${
            totalEntry > totalExit ? 'text-emerald-600' : 'text-blue-600'
          }`}>
            {totalEntry > totalExit ? '+' : ''}{totalEntry - totalExit}/min
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GateManagement() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading gate data...</p>
        </div>
      </div>
    );
  }

  const { gates, zones } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Gate & Queue Management</h1>
        <p className="text-slate-500 mt-1">Dynamic control of entry/exit points and queue flow</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QueueStatus zones={zones} />
        <FlowSummary gates={gates} />
      </div>

      {/* Gate Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Gate Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gates?.map((gate) => (
            <GateCard key={gate.id} gate={gate} />
          ))}
        </div>
      </div>
    </div>
  );
}
