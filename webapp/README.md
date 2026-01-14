# SmartDarshan Admin Dashboard

AI-Enabled Intelligent Crowd Management Platform for Sri Venkateswara Swamy Vari Devasthanam, Dwarakatirumala.

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev
```

Then open http://localhost:5173 in your browser.

## Architecture

```
webapp/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express + WebSocket + ffmpeg
└── data/              # JSON source of truth + HLS stream
```

## Features (P0 - POC Core)

1. **Command Center** - Real-time overview with zone heatmap, alerts, gate status
2. **Video Analytics** - Live crowd density, anomaly detection, camera grid
3. **Crowd Forecast** - Hourly/daily predictions with weather integration
4. **Gate Management** - Dynamic gate control with AI recommendations
5. **Alerts** - Automated alerts with PA broadcast and threshold config
6. **Chatbot Monitor** - Multilingual query analytics and performance
7. **System Health** - Infrastructure monitoring, camera status, connectivity

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Express.js, WebSocket (real-time updates)
- **Video**: ffmpeg (HLS streaming from looped video)
- **Data**: JSON file (simulated real-time updates every 3s)

## API Endpoints

- `GET /api/data` - Full temple data
- `GET /api/zones` - Zone status
- `GET /api/gates` - Gate information
- `GET /api/alerts` - Alert list
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/gates/:id/control` - Control gate (open/restrict/close)
- `GET /hls/stream.m3u8` - Live video stream (HLS)
- `ws://localhost:3001` - WebSocket for real-time updates

## Data Simulation

The backend simulates real-time data changes every 3 seconds:
- Footfall counts fluctuate
- Zone densities change
- Gate entry/exit rates vary
- Alerts may be triggered based on thresholds

## Requirements

- Node.js 18+
- ffmpeg (for video streaming)
