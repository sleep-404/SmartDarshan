# Smart Darshan: Real Video Analytics Implementation Plan

## Objective
Replace simulated/mock video analytics with **real computer vision analysis** using Python + OpenCV + YOLOv8 to process temple crowd videos and display actual metrics in the React frontend.

---

## POC Success Criteria
| Criteria | Target | Status |
|----------|--------|--------|
| Real-time crowd density & congestion detection | ≥80% accuracy | To Build |
| Peak-hour prediction using historical data | ≥80% accuracy | Future Phase |
| Multilingual chatbot/voice assistant | ≥80% accuracy | Future Phase |

---

## Architecture

```
React Frontend (DemoSlide1.jsx, DemoSlide2.jsx)
    |
    |-- WebSocket (real-time updates)
    |-- REST API (initial load)
    |
Express.js (server.js - proxy)
    |
Python FastAPI Backend (port 8000)
    |
    |-- YOLOv8 (people detection)
    |-- ByteTrack (tracking)
    |-- Optical Flow (velocity)
    |
Video Files (/webapp/public/videos/)
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| CV Backend | Python 3.10+, FastAPI, uvicorn | REST/WebSocket server |
| Detection | Ultralytics YOLOv8s | People counting (90-95% acc) |
| Tracking | ByteTrack | Multi-object tracking, flow rate |
| Velocity | OpenCV Farneback Optical Flow | Walking speed (80-85% acc) |
| Video I/O | OpenCV VideoCapture | Frame extraction |

---

## File Structure (New)

```
/webapp/
├── server.js                    # Add proxy to Python backend
├── analytics/                   # NEW - Python backend
│   ├── requirements.txt
│   ├── main.py                  # FastAPI entry point
│   ├── config.py                # Settings
│   ├── models/
│   │   ├── detector.py          # YOLOv8 people detector
│   │   ├── tracker.py           # ByteTrack integration
│   │   └── velocity.py          # Optical flow
│   ├── processors/
│   │   ├── video_processor.py   # Main pipeline
│   │   └── metrics.py           # Aggregation
│   ├── api/
│   │   ├── routes.py            # REST endpoints
│   │   └── websocket.py         # Real-time updates
│   └── data/
│       └── calibration.json     # Video zone definitions
└── src/pages/
    ├── DemoSlide1.jsx           # Modify: consume real API
    └── DemoSlide2.jsx           # Modify: consume real API
```

---

## Implementation Phases

### Phase 1: Core Detection Engine (Priority: CRITICAL)
**Goal:** YOLOv8 detecting people with real counts

**Tasks:**
1. Create `/webapp/analytics/` directory structure
2. Create `requirements.txt`:
   - fastapi, uvicorn, ultralytics, opencv-python, numpy, websockets
3. Implement `models/detector.py`:
   - Load YOLOv8s model
   - Detect person class (class_id=0)
   - Return bounding boxes + confidence
4. Implement `processors/video_processor.py`:
   - Open video with OpenCV
   - Process at 5 FPS (skip frames for efficiency)
   - Run YOLO on each frame
5. Implement `api/routes.py`:
   - `GET /api/analytics/status` - health check
   - `GET /api/analytics/frame/{video_id}` - single frame analysis
   - `GET /api/analytics/stream/{video_id}` - continuous processing
6. Create `main.py` FastAPI app
7. Test with tirupati_queue.mp4

**Deliverables:**
- Working people counter showing real counts
- Real bounding boxes in API response

---

### Phase 2: Tracking & Flow Analysis (Priority: HIGH)
**Goal:** Track individuals, calculate flow rate and velocity

**Tasks:**
1. Implement `models/tracker.py`:
   - ByteTrack integration
   - Persistent IDs across frames
   - Track trajectories
2. Implement `models/velocity.py`:
   - Farneback optical flow
   - Average motion vectors
   - Pixel-to-meter conversion
3. Add flow rate calculation:
   - Define virtual counting lines
   - Count track crossings per minute
4. Update API with new endpoints:
   - `GET /api/analytics/velocity/{video_id}`
   - `GET /api/analytics/flow-rate/{video_id}`

**Deliverables:**
- Real flow rate (people/minute)
- Real walking velocity (m/s)

---

### Phase 3: Density & Congestion (Priority: HIGH)
**Goal:** Calculate density (people/sq.m) and congestion status

**Tasks:**
1. Implement density calculation in `processors/metrics.py`:
   - Count-based: `density = count / zone_area_sqm`
   - Define zone polygons for each video
2. Implement congestion logic:
   ```
   free: density < 1.5 AND velocity > 0.8
   moderate: density < 2.5 OR velocity > 0.5
   congested: density < 3.5 OR velocity > 0.3
   severe: density >= 3.5 OR velocity <= 0.3
   ```
3. Create `data/calibration.json` with zone definitions
4. Update API with density/congestion endpoints

**Deliverables:**
- Real density values (people/sq.m)
- Congestion status based on actual analysis

---

### Phase 4: WebSocket Real-Time Updates (Priority: MEDIUM)
**Goal:** Replace polling with WebSocket for live updates

**Tasks:**
1. Implement `api/websocket.py`:
   - FastAPI WebSocket endpoint
   - Broadcast metrics every 1-2 seconds
2. Create background video processing worker
3. Update `server.js` to proxy WebSocket connections
4. Update `DemoSlide1.jsx`:
   - Connect to WebSocket
   - Update metrics in real-time
   - Handle reconnection

**Deliverables:**
- WebSocket-based real-time updates
- Sub-2-second latency

---

### Phase 5: Frontend Integration (Priority: HIGH)
**Goal:** Wire DemoSlide1 and DemoSlide2 to real data

**Tasks:**
1. Modify `DemoSlide1.jsx`:
   - Remove simulated `setInterval` updates
   - Fetch real metrics from API/WebSocket
   - Update `detections` with real YOLO boxes
   - Update `metrics` with real analytics
2. Modify `DemoSlide2.jsx`:
   - Wire all 8 analytics cards to API
   - Update summary stats bar
3. Ensure data format matches existing frontend expectations

**Deliverables:**
- DemoSlide1 showing real video analytics
- DemoSlide2 cards powered by real data

---

### Phase 6: Tier 2 Features (Priority: MEDIUM)
**Goal:** Queue analysis, gate counting, alerts

**Tasks:**
1. Queue length estimation (people in queue zone)
2. Wait time prediction (queue_length / service_rate)
3. Gate entry/exit bi-directional counting
4. Alert triggers:
   - Density > 85% = warning
   - Density > 95% = critical
   - Velocity < 0.4 m/s for 2+ min = congestion alert

---

### Phase 7: Tier 3 Features (Priority: LOW - Nice to Have)
- Fall detection (pose estimation)
- Counter-flow detection
- Wheelchair/accessibility detection
- Direction heatmaps
- Dwell time analysis

---

## API Response Format (Must Match Frontend)

```json
{
  "timestamp": "2026-01-18T10:30:00Z",
  "metrics": {
    "peopleCount": 127,
    "density": 2.3,
    "congestionStatus": "moderate",
    "velocity": 0.72,
    "flowRate": 45,
    "countTrend": 12
  },
  "detections": [
    { "x": 15, "y": 30, "width": 8, "height": 20, "confidence": 94, "id": "T001" }
  ]
}
```

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `/webapp/analytics/*` | NEW - entire Python backend |
| `/webapp/server.js` | Add proxy to Python backend (port 8000) |
| `/webapp/src/pages/DemoSlide1.jsx` | Replace mock data with real API calls |
| `/webapp/src/pages/DemoSlide2.jsx` | Wire analytics cards to real API |
| `/webapp/package.json` | Add http-proxy-middleware dependency |

---

## Development Setup

```bash
# Terminal 1: Python backend
cd webapp/analytics
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: Express + Vite
cd webapp
npm run dev
```

---

## Verification Plan

1. **Detection Test**: Process tirupati_queue.mp4, verify people count within 10% of manual count
2. **Velocity Test**: Verify walking speed reads ~0.5-1.2 m/s for normal walking
3. **Density Test**: Verify density calculation matches manual estimate
4. **Congestion Test**: Verify status changes based on crowd conditions
5. **Frontend Test**: Open /demo/slide1, verify real metrics display and update
6. **End-to-End**: Run full system, verify all metrics update in real-time

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Core Detection | 2-3 days | Day 3 |
| Phase 2: Tracking & Flow | 2 days | Day 5 |
| Phase 3: Density & Congestion | 1-2 days | Day 7 |
| Phase 4: WebSocket | 1 day | Day 8 |
| Phase 5: Frontend Integration | 1-2 days | Day 10 |
| Phase 6: Tier 2 Features | 2-3 days | Day 13 |

**Total: ~2 weeks for full implementation**

---

## Dependencies to Install

**Python (requirements.txt):**
```
fastapi>=0.100.0
uvicorn>=0.23.0
ultralytics>=8.0.0
opencv-python>=4.8.0
numpy>=1.24.0
websockets>=11.0
python-multipart>=0.0.6
```

**Node.js (package.json):**
```
http-proxy-middleware
```
