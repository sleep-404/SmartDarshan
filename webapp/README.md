# Smart Darshan Command Center

AI-powered temple crowd management dashboard for Sri Venkateswara Swamy Vari Devasthanam, Dwarakatirumala.

## Quick Start

```bash
# Install dependencies
npm install

# Start API server (port 3001)
npm run server &

# Start dev server (port 5173)
npm run dev
```

Open http://localhost:5173

## Architecture

```
webapp/
├── data/
│   └── dashboard.json     # Mock data for dashboard
├── src/
│   ├── App.jsx            # Main dashboard component
│   ├── index.css          # Tailwind v4 + custom styles
│   └── main.jsx           # React entry point
├── server.js              # Express API server
├── vite.config.js         # Vite + Tailwind config
└── package.json
```

## Features

- **Sidebar Navigation** - 16 pages with icon-only buttons and tooltips
- **Header** - Temple info, live clock, peak window, data freshness
- **Critical Alert Banner** - Shows unacknowledged critical/warning alerts
- **Key Metrics** - Live footfall, wait time, crowd movement, gate status
- **Composite Scores** - Crowd stress, zone health, incident risk, experience
- **Zone Density Heatmap** - 11 zones with color-coded density
- **Gate Status Panel** - 4 gates with load indicators and flow rates
- **Active Alerts** - Filterable list with acknowledge/dismiss actions
- **Quick Actions FAB** - AI recommendations, PA, staff alerts, emergency protocols

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS v4
- Lucide React icons
- Express.js API server

## API Endpoints

- `GET /api/dashboard` - Full dashboard data
- `GET /api/alerts` - Alerts with sparkline
- `GET /api/zones` - Zone density data
- `GET /api/gates` - Gate status data
- `GET /api/health` - Server health check
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
