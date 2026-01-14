import { NavLink, Outlet } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Video,
  TrendingUp,
  DoorOpen,
  Bell,
  MessageSquare,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Command Center' },
  { path: '/video-analytics', icon: Video, label: 'Video Analytics' },
  { path: '/forecast', icon: TrendingUp, label: 'Crowd Forecast' },
  { path: '/gates', icon: DoorOpen, label: 'Gate Management' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/chatbot', icon: MessageSquare, label: 'Chatbot Monitor' },
  { path: '/system-health', icon: Activity, label: 'System Health' },
];

export default function Layout() {
  const { isConnected, data } = useData();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-lg font-semibold text-slate-900">SmartDarshan</h1>
          <p className="text-xs text-slate-500 mt-1">Intelligent Crowd Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Connection Status */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi size={16} className="text-emerald-500" />
                <span className="text-slate-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-500" />
                <span className="text-slate-600">Reconnecting...</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Sri Venkateswara Swamy Vari Devasthanam, Dwarakatirumala
            </p>
          </div>
          <div className="flex items-center gap-4">
            {data?.realtime && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(data.realtime.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
