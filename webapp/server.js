import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const PYTHON_BACKEND_URL = 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// Proxy analytics API requests to Python backend
app.use('/api/analytics', createProxyMiddleware({
  target: PYTHON_BACKEND_URL,
  changeOrigin: true,
  ws: true,  // Enable WebSocket proxying
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(503).json({
      error: 'Analytics service unavailable',
      message: 'Python backend is not running. Start it with: cd analytics && uvicorn main:app --port 8000'
    });
  }
}));

// Proxy WebSocket connections to Python backend
app.use('/ws', createProxyMiddleware({
  target: PYTHON_BACKEND_URL,
  changeOrigin: true,
  ws: true
}));

// Load dashboard data
const loadDashboardData = () => {
  const dataPath = join(__dirname, 'data', 'dashboard.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
};

// Load video analytics data
const loadVideoAnalyticsData = () => {
  const dataPath = join(__dirname, 'data', 'videoAnalytics.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
};

// API endpoint for dashboard data
app.get('/api/dashboard', (req, res) => {
  try {
    const data = loadDashboardData();
    // Add current timestamp
    data.timestamp = new Date().toISOString();
    res.json(data);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// API endpoint for alerts only
app.get('/api/alerts', (req, res) => {
  try {
    const data = loadDashboardData();
    res.json({
      alerts: data.alerts,
      sparkline: data.alertSparkline
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

// API endpoint to acknowledge an alert
app.post('/api/alerts/:id/acknowledge', (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    // In a real app, this would update a database
    res.json({ success: true, alertId, status: 'acknowledged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// API endpoint for zone data
app.get('/api/zones', (req, res) => {
  try {
    const data = loadDashboardData();
    res.json(data.zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load zone data' });
  }
});

// API endpoint for gate data
app.get('/api/gates', (req, res) => {
  try {
    const data = loadDashboardData();
    res.json(data.gateDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load gate data' });
  }
});

// API endpoint for video analytics data
app.get('/api/video-analytics', (req, res) => {
  try {
    const data = loadVideoAnalyticsData();
    data.timestamp = new Date().toISOString();
    res.json(data);
  } catch (error) {
    console.error('Error loading video analytics data:', error);
    res.status(500).json({ error: 'Failed to load video analytics data' });
  }
});

// API endpoint for video analytics zones
app.get('/api/video-analytics/zones', (req, res) => {
  try {
    const data = loadVideoAnalyticsData();
    res.json(data.zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load zones data' });
  }
});

// API endpoint for video analytics anomalies
app.get('/api/video-analytics/anomalies', (req, res) => {
  try {
    const data = loadVideoAnalyticsData();
    res.json(data.anomalies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load anomalies data' });
  }
});

// API endpoint for cameras
app.get('/api/video-analytics/cameras', (req, res) => {
  try {
    const data = loadVideoAnalyticsData();
    res.json(data.cameras);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load cameras data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Smart Darshan API server running on http://localhost:${PORT}`);
});
