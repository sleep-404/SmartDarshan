import { useData } from '../context/DataContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  Sun,
  Cloud,
  Droplets,
  TrendingUp,
  Calendar,
  ThermometerSun
} from 'lucide-react';

function WeatherCard({ weather }) {
  return (
    <div className="card">
      <h3 className="card-header">Weather Conditions</h3>
      <div className="flex items-center gap-4">
        <div className="p-4 bg-blue-50 rounded-xl">
          {weather?.condition?.includes('Cloudy') ? (
            <Cloud size={32} className="text-blue-600" />
          ) : (
            <Sun size={32} className="text-amber-500" />
          )}
        </div>
        <div>
          <p className="text-3xl font-semibold text-slate-900">{weather?.temperature}°C</p>
          <p className="text-sm text-slate-500">{weather?.condition}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-500" />
          <span className="text-sm text-slate-600">{weather?.humidity}% humidity</span>
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-3">{weather?.forecast}</p>
    </div>
  );
}

function HourlyChart({ data }) {
  const chartData = data?.map(item => ({
    ...item,
    predicted: item.predicted,
    actual: item.actual || null
  })) || [];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="card-header mb-0">Hourly Forecast</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary-500"></div>
            <span className="text-slate-600">Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-slate-600">Actual</span>
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => value?.toLocaleString() || '-'}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#ee7712"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DailyForecast({ data }) {
  return (
    <div className="card">
      <h3 className="card-header">7-Day Forecast</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { weekday: 'short' });
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => [value?.toLocaleString(), 'Predicted']}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <Bar
              dataKey="predicted"
              fill="#ee7712"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EventCard({ event }) {
  const isWeekend = event.event?.includes('Saturday') || event.event?.includes('Sunday');
  const isSpecial = !event.event?.includes('Regular') && !isWeekend;

  return (
    <div className={`p-4 rounded-lg border ${
      isSpecial ? 'bg-primary-50 border-primary-200' :
      isWeekend ? 'bg-amber-50 border-amber-200' :
      'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-xs text-slate-500 mt-1">{event.event}</p>
        </div>
        <p className="text-lg font-semibold text-slate-900">
          {(event.predicted / 1000).toFixed(0)}k
        </p>
      </div>
    </div>
  );
}

export default function CrowdForecast() {
  const { data } = useData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading forecast...</p>
        </div>
      </div>
    );
  }

  const { forecast } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Crowd Forecast</h1>
          <p className="text-slate-500 mt-1">Predictive modeling for proactive planning</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
          <TrendingUp size={20} />
          <span className="text-sm font-medium">{forecast?.confidence}% confidence</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-xl">
              <Calendar size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today's Prediction</p>
              <p className="text-2xl font-semibold text-slate-900">
                {(forecast?.daily?.[0]?.predicted / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              <TrendingUp size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Peak Expected</p>
              <p className="text-2xl font-semibold text-slate-900">
                {(Math.max(...(forecast?.hourly?.map(h => h.predicted) || [0])) / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
        <WeatherCard weather={forecast?.weather} />
      </div>

      {/* Hourly Chart */}
      <HourlyChart data={forecast?.hourly} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyForecast data={forecast?.daily} />

        {/* Upcoming Events */}
        <div className="card">
          <h3 className="card-header">Upcoming Days</h3>
          <div className="space-y-3">
            {forecast?.daily?.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
