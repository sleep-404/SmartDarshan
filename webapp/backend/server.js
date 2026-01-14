const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const DATA_PATH = path.join(__dirname, '../data/temple_data.json');
const VIDEO_PATH = path.join(__dirname, '../../D Tirumala Video.mp4');
const HLS_DIR = path.join(__dirname, '../data/hls');

// Ensure HLS directory exists
if (!fs.existsSync(HLS_DIR)) {
  fs.mkdirSync(HLS_DIR, { recursive: true });
}

// Serve HLS files
app.use('/hls', express.static(HLS_DIR));

// Load temple data
function loadData() {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

// Save temple data
function saveData(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

// API Routes
app.get('/api/data', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/realtime', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.realtime);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/zones', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.zones);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/gates', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.gates);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/alerts', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.alerts);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const data = loadData();
  if (data) {
    const alert = data.alerts.find(a => a.id === req.params.id);
    if (alert) {
      alert.acknowledged = true;
      saveData(data);
      res.json(alert);
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/forecast', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.forecast);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/chatbot', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.chatbot);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/system-health', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.systemHealth);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/video-analytics', (req, res) => {
  const data = loadData();
  if (data) {
    res.json(data.videoAnalytics);
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Gate control
app.post('/api/gates/:id/control', (req, res) => {
  const { status } = req.body;
  const data = loadData();
  if (data) {
    const gate = data.gates.find(g => g.id === req.params.id);
    if (gate) {
      gate.status = status;
      saveData(data);
      res.json(gate);
    } else {
      res.status(404).json({ error: 'Gate not found' });
    }
  } else {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Start ffmpeg HLS stream
let ffmpegProcess = null;

function startVideoStream() {
  if (ffmpegProcess) {
    console.log('Video stream already running');
    return;
  }

  console.log('Starting video stream...');
  console.log('Video path:', VIDEO_PATH);
  console.log('HLS directory:', HLS_DIR);

  // Check if video file exists
  if (!fs.existsSync(VIDEO_PATH)) {
    console.error('Video file not found:', VIDEO_PATH);
    return;
  }

  ffmpegProcess = spawn('ffmpeg', [
    '-re',                          // Read input at native frame rate
    '-stream_loop', '-1',           // Loop infinitely
    '-i', VIDEO_PATH,               // Input file
    '-c:v', 'libx264',              // Video codec
    '-preset', 'ultrafast',         // Fast encoding
    '-tune', 'zerolatency',         // Low latency
    '-c:a', 'aac',                  // Audio codec
    '-f', 'hls',                    // HLS format
    '-hls_time', '2',               // Segment duration
    '-hls_list_size', '3',          // Keep 3 segments
    '-hls_flags', 'delete_segments+append_list', // Delete old segments
    '-hls_segment_filename', path.join(HLS_DIR, 'segment_%03d.ts'),
    path.join(HLS_DIR, 'stream.m3u8')
  ]);

  ffmpegProcess.stdout.on('data', (data) => {
    console.log(`ffmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on('data', (data) => {
    // ffmpeg outputs progress to stderr
    const output = data.toString();
    if (output.includes('Error') || output.includes('error')) {
      console.error(`ffmpeg error: ${output}`);
    }
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
    ffmpegProcess = null;
  });

  ffmpegProcess.on('error', (err) => {
    console.error('Failed to start ffmpeg:', err);
    ffmpegProcess = null;
  });
}

// Simulate real-time data updates
function simulateRealtimeUpdates() {
  const data = loadData();
  if (!data) return;

  // Update timestamp
  data.realtime.lastUpdated = new Date().toISOString();

  // Simulate footfall changes
  const footfallChange = Math.floor(Math.random() * 100) - 30;
  data.realtime.currentFootfall = Math.max(5000, Math.min(20000,
    data.realtime.currentFootfall + footfallChange));

  // Simulate wait time changes
  const waitChange = Math.floor(Math.random() * 6) - 2;
  data.realtime.avgWaitTime = Math.max(10, Math.min(120,
    data.realtime.avgWaitTime + waitChange));

  // Simulate zone density changes
  data.zones.forEach(zone => {
    const densityChange = Math.floor(Math.random() * 8) - 3;
    zone.density = Math.max(10, Math.min(95, zone.density + densityChange));

    // Update status based on density
    if (zone.density >= 85) zone.status = 'critical';
    else if (zone.density >= 70) zone.status = 'high';
    else if (zone.density >= 50) zone.status = 'moderate';
    else if (zone.density >= 30) zone.status = 'normal';
    else zone.status = 'low';

    // Update current count based on density
    zone.currentCount = Math.floor(zone.capacity * (zone.density / 100));
  });

  // Simulate gate flow changes
  data.gates.forEach(gate => {
    gate.entryRate = Math.max(20, Math.min(200,
      gate.entryRate + Math.floor(Math.random() * 20) - 10));
    if (gate.type === 'entry-exit') {
      gate.exitRate = Math.max(20, Math.min(200,
        gate.exitRate + Math.floor(Math.random() * 20) - 10));
    }
    gate.congestion = Math.max(10, Math.min(90,
      gate.congestion + Math.floor(Math.random() * 10) - 5));
  });

  // Update overall density
  const totalDensity = data.zones.reduce((sum, z) => sum + z.density, 0);
  data.realtime.overallDensity = Math.floor(totalDensity / data.zones.length);

  // Update chatbot stats
  data.chatbot.totalQueries += Math.floor(Math.random() * 5);
  data.chatbot.activeConversations = Math.max(50, Math.min(300,
    data.chatbot.activeConversations + Math.floor(Math.random() * 10) - 5));

  // Update system health
  data.systemHealth.vms.cpu = Math.max(20, Math.min(80,
    data.systemHealth.vms.cpu + Math.floor(Math.random() * 10) - 5));
  data.systemHealth.vms.memory = Math.max(40, Math.min(85,
    data.systemHealth.vms.memory + Math.floor(Math.random() * 6) - 3));
  data.systemHealth.lastSync = new Date().toISOString();

  saveData(data);

  // Broadcast update via WebSocket
  broadcastUpdate(data);
}

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

function broadcastUpdate(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify({
        type: 'update',
        data: {
          realtime: data.realtime,
          zones: data.zones,
          gates: data.gates,
          alerts: data.alerts.filter(a => !a.acknowledged || a.type === 'warning'),
          systemHealth: data.systemHealth
        }
      }));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Send initial data
  const data = loadData();
  if (data) {
    ws.send(JSON.stringify({
      type: 'initial',
      data: data
    }));
  }

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);

  // Start video stream
  startVideoStream();

  // Start real-time simulation (every 3 seconds)
  setInterval(simulateRealtimeUpdates, 3000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGTERM');
  }
  process.exit();
});
