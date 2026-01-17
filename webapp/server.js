import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Load dashboard data
const loadDashboardData = () => {
  const dataPath = join(__dirname, 'data', 'dashboard.json');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Smart Darshan API server running on http://localhost:${PORT}`);
});
