import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import CommandCenter from './pages/CommandCenter';
import VideoAnalytics from './pages/VideoAnalytics';
import CrowdForecast from './pages/CrowdForecast';
import GateManagement from './pages/GateManagement';
import Alerts from './pages/Alerts';
import ChatbotMonitor from './pages/ChatbotMonitor';
import SystemHealth from './pages/SystemHealth';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CommandCenter />} />
            <Route path="video-analytics" element={<VideoAnalytics />} />
            <Route path="forecast" element={<CrowdForecast />} />
            <Route path="gates" element={<GateManagement />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="chatbot" element={<ChatbotMonitor />} />
            <Route path="system-health" element={<SystemHealth />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
