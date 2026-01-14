import { useData } from '../context/DataContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  MessageSquare,
  Users,
  Globe,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const LANGUAGE_COLORS = {
  telugu: '#ee7712',
  hindi: '#3b82f6',
  english: '#10b981'
};

function StatCard({ title, value, subtitle, icon: Icon, color = 'slate' }) {
  const colorClasses = {
    slate: 'bg-slate-50 text-slate-600',
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
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
    </div>
  );
}

function LanguageDistribution({ languages }) {
  const data = Object.entries(languages || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: LANGUAGE_COLORS[name]
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card">
      <h3 className="card-header">Language Distribution</h3>
      <div className="flex items-center">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-slate-900">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({((item.value / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryBreakdown({ categories }) {
  const data = Object.entries(categories || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    value
  }));

  return (
    <div className="card">
      <h3 className="card-header">Query Categories</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#64748b' }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill="#ee7712" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function QueryCard({ query }) {
  const getLanguageFlag = (lang) => {
    switch (lang) {
      case 'telugu': return '🇮🇳';
      case 'hindi': return '🇮🇳';
      case 'english': return '🇬🇧';
      default: return '🌐';
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{getLanguageFlag(query.language)}</span>
          <span className="text-xs text-slate-500 capitalize">{query.language}</span>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(query.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm text-slate-700 mb-1">{query.query}</p>
      {query.translation && query.language !== 'english' && (
        <p className="text-xs text-slate-500 italic mb-2">"{query.translation}"</p>
      )}
      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-slate-200">
        {query.successful ? (
          <CheckCircle size={14} className="text-emerald-500 mt-0.5" />
        ) : (
          <AlertCircle size={14} className="text-red-500 mt-0.5" />
        )}
        <p className="text-sm text-slate-600">{query.response}</p>
      </div>
    </div>
  );
}

export default function ChatbotMonitor() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading chatbot data...</p>
        </div>
      </div>
    );
  }

  const { chatbot } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Chatbot Monitor</h1>
        <p className="text-slate-500 mt-1">Multilingual virtual assistant performance and queries</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Queries"
          value={chatbot?.totalQueries?.toLocaleString()}
          subtitle="today"
          icon={MessageSquare}
          color="primary"
        />
        <StatCard
          title="Active Conversations"
          value={chatbot?.activeConversations}
          subtitle="right now"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Response Accuracy"
          value={`${chatbot?.accuracy}%`}
          subtitle="success rate"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Escalated Queries"
          value={chatbot?.escalatedQueries}
          subtitle="need human help"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LanguageDistribution languages={chatbot?.languages} />
        <CategoryBreakdown categories={chatbot?.categories} />
      </div>

      {/* Recent Queries */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-header mb-0">Recent Queries</h3>
          <span className="text-sm text-slate-500">Live feed</span>
        </div>
        <div className="space-y-3">
          {chatbot?.recentQueries?.map((query) => (
            <QueryCard key={query.id} query={query} />
          ))}
        </div>
      </div>

      {/* Communication Summary */}
      <div className="card">
        <h3 className="card-header">Current Information Being Communicated</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Wait Times</p>
            <p className="text-2xl font-semibold text-blue-900">{data.realtime?.avgWaitTime} min</p>
            <p className="text-xs text-blue-600 mt-1">for darshan</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-emerald-800 mb-1">Recommended Gate</p>
            <p className="text-lg font-semibold text-emerald-900">East Gopuram</p>
            <p className="text-xs text-emerald-600 mt-1">lowest congestion</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-1">Parking Available</p>
            <p className="text-2xl font-semibold text-amber-900">340</p>
            <p className="text-xs text-amber-600 mt-1">slots in Zone A</p>
          </div>
        </div>
      </div>
    </div>
  );
}
