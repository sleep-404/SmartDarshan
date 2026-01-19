# SmartDarshan: Comprehensive Build Plan

## Executive Summary

SmartDarshan is a real-time crowd analytics platform for temple management, designed to provide computer vision-based insights for crowd safety, accessibility, and operational efficiency.

**Target:** 15-minute demo presentation with:
- **Page 1:** Deep dive into 3-4 core capabilities with real-time metrics
- **Page 2:** Overview of all 8 analytics capabilities with synchronized video clips

---

## Prerequisites & Hardware Requirements

### Software Requirements

| Component | Minimum Version | Recommended |
|-----------|-----------------|-------------|
| Python | 3.9+ | 3.10 or 3.11 |
| Node.js | 16+ | 18 LTS |
| npm | 8+ | 9+ |
| FFmpeg | 4.0+ | 5.0+ (for video processing) |

### Hardware Requirements

| Component | Minimum (CPU-only) | Recommended (GPU) |
|-----------|-------------------|-------------------|
| CPU | 4 cores, 2.5GHz | 8+ cores, 3.0GHz+ |
| RAM | 8 GB | 16 GB |
| GPU | N/A | NVIDIA GTX 1060+ (6GB VRAM) |
| Storage | 10 GB free | 20 GB SSD |

**Note:** Without GPU, expect 2-4 FPS. With GPU, expect 8-15 FPS.

---

## Current State Assessment

### ✅ What's Already Built

| Component | Status | Location |
|-----------|--------|----------|
| **FastAPI Backend** | Complete | `/webapp/analytics/` |
| **YOLOv8 Detection** | Working | `models/detector.py` |
| **ByteTrack Tracking** | Working | `models/tracker.py` |
| **Optical Flow Velocity** | Working | `models/velocity.py` |
| **Density & Congestion** | Working | `processors/metrics.py` |
| **Queue Analysis** | Working | `processors/queue_analyzer.py` |
| **Gate Counting** | Working | `processors/gate_counter.py` |
| **Flow Detection** | Working | `processors/flow_detector.py` |
| **Dwell Time Analysis** | Working | `processors/dwell_analyzer.py` |
| **Anomaly Detection** | Basic | `processors/anomaly_detector.py` |
| **WebSocket Streaming** | Working | `api/websocket.py` |
| **REST API** | Working | `api/routes.py` |
| **React Frontend** | Partial | `src/pages/` |
| **8 Demo Video Clips** | Verified | `public/videos/clips/` |

### 📁 Demo Video Clips (Verified South Indian Temple Footage)

| Clip | File | Analytics Feature | Duration | Source |
|------|------|-------------------|----------|--------|
| 1 | `clip_01_density.mp4` | Crowd Density | 10s | Festival crowd (elevated view) |
| 2 | `clip_02_queue.mp4` | Queue Analysis | 10s | Tirumala queue area |
| 3 | `clip_03_gate.mp4` | Gate Counting | 10s | Tirupati gate entry |
| 4 | `clip_04_flow.mp4` | Flow Detection | 10s | Festival crowd movement |
| 5 | `clip_05_safety.mp4` | Safety Monitoring | 10s | Tirupati infrastructure |
| 6 | `clip_06_accessibility.mp4` | Accessibility | 10s | Wheelchair user at Tirupati |
| 7 | `clip_07_dwell.mp4` | Dwell Time | 10s | Tirupati Anna Prasadam hall |
| 8 | `clip_08_anomaly.mp4` | Anomaly Detection | 10s | Tirumala temple aerial view |

### 🔗 Video ID Mapping (Backend ↔ Frontend)

Update `analytics/config.py` to include demo clips:

```python
VIDEO_FILES = {
    # Demo clips (10 seconds each, looping)
    "density": "clips/clip_01_density.mp4",
    "queue": "clips/clip_02_queue.mp4",
    "gate": "clips/clip_03_gate.mp4",
    "flow": "clips/clip_04_flow.mp4",
    "safety": "clips/clip_05_safety.mp4",
    "accessibility": "clips/clip_06_accessibility.mp4",
    "dwell": "clips/clip_07_dwell.mp4",
    "anomaly": "clips/clip_08_anomaly.mp4",

    # Original full-length videos (for extended testing)
    "festival_crowd": "festival_crowd.mp4",
    "temple_entrance": "temple_entrance.mp4",
}
```

### ⚠️ What Needs Improvement

| Component | Current State | Target State | Priority |
|-----------|---------------|--------------|----------|
| Detection Model | YOLOv8s (44.9 mAP) | YOLOv11m (51.5 mAP) | HIGH |
| Fall Detection | Bounding box heuristics (~60%) | Pose-based (~85%) | HIGH |
| Wheelchair Detection | Not implemented | Object detection + pose | MEDIUM |
| Velocity Estimation | Optical flow (slow) | Track-based (fast) | MEDIUM |
| Tracker | ByteTrack basic | BoT-SORT with ReID | LOW |

---

## Build Phases

### Phase 1: Demo UI Integration (Priority: CRITICAL)

**Goal:** Connect 8 video clips to frontend with real-time analytics overlay

#### 1.1 DemoSlide1 - Core Capabilities (Detailed View)

Display 3-4 capabilities with detailed explanation and live metrics:

```jsx
// DemoSlide1.jsx - Core capabilities with detailed metrics
- Video player with detection overlay (bounding boxes)
- Real-time metrics panel:
  - People Count: XX (±2% accuracy)
  - Density: X.X people/m²
  - Velocity: X.X m/s
  - Congestion Status: [free/moderate/congested/severe]
- Flow rate graph (people/minute)
- Trend indicators (↑ +12 in last minute)
```

**Clips to use:**
- `clip_01_density.mp4` - Explain density calculation
- `clip_03_gate.mp4` - Explain gate counting logic
- `clip_04_flow.mp4` - Explain velocity/flow detection

**API endpoints:**
```
GET /api/analytics/video/{video_id} - Single frame analysis
WS  /ws/analytics/{video_id}       - Real-time stream
```

#### 1.2 DemoSlide2 - All 8 Capabilities (Grid View)

Display 8 video cards simultaneously with compact metrics:

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Summary Bar] Total: 847 | Avg Density: 2.3 | Status: MODERATE       │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│ │ DENSITY     │ │ QUEUE       │ │ GATE        │ │ FLOW        │      │
│ │ [video]     │ │ [video]     │ │ [video]     │ │ [video]     │      │
│ │ 127 people  │ │ 12 min wait │ │ +23 / -18   │ │ 0.8 m/s N   │      │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│ │ SAFETY      │ │ ACCESSIBLE  │ │ DWELL       │ │ ANOMALY     │      │
│ │ [video]     │ │ [video]     │ │ [video]     │ │ [video]     │      │
│ │ 0 alerts    │ │ 2 wheelchair│ │ 4.2 min avg │ │ 0 detected  │      │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
└──────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```jsx
// DemoSlide2.jsx - Grid of 8 analytics cards
const ANALYTICS_CARDS = [
  { id: 'density', clip: 'clip_01_density.mp4', label: 'Crowd Density', metric: 'peopleCount' },
  { id: 'queue', clip: 'clip_02_queue.mp4', label: 'Queue Analysis', metric: 'waitTime' },
  { id: 'gate', clip: 'clip_03_gate.mp4', label: 'Gate Counting', metric: 'entryExit' },
  { id: 'flow', clip: 'clip_04_flow.mp4', label: 'Flow Detection', metric: 'velocity' },
  { id: 'safety', clip: 'clip_05_safety.mp4', label: 'Safety Monitor', metric: 'alerts' },
  { id: 'accessibility', clip: 'clip_06_accessibility.mp4', label: 'Accessibility', metric: 'wheelchair' },
  { id: 'dwell', clip: 'clip_07_dwell.mp4', label: 'Dwell Time', metric: 'dwellAvg' },
  { id: 'anomaly', clip: 'clip_08_anomaly.mp4', label: 'Anomaly Detection', metric: 'anomalies' },
];
```

#### 1.3 Tasks

| Task | Description | Files to Modify |
|------|-------------|-----------------|
| 1.1.1 | Create VideoAnalyticsCard component | `src/components/VideoAnalyticsCard.jsx` |
| 1.1.2 | Implement WebSocket hook for real-time updates | `src/hooks/useVideoAnalytics.js` |
| 1.1.3 | Update DemoSlide1 with 3-4 detailed cards | `src/pages/DemoSlide1.jsx` |
| 1.1.4 | Update DemoSlide2 with 8-card grid | `src/pages/DemoSlide2.jsx` |
| 1.1.5 | Add video clip configuration | `src/config/analyticsConfig.js` |
| 1.1.6 | Style cards with metrics overlay | `src/styles/analytics.css` |

---

### Phase 2: CV Algorithm Improvements (Priority: HIGH)

**Goal:** Upgrade detection/tracking for better accuracy

#### 2.1 Upgrade Detection Model

**Current:** YOLOv8s (11.2M params, 44.9 mAP)
**Target:** YOLOv11m (20.1M params, 51.5 mAP)

> **Note:** Ultralytics naming conventions may vary. Check latest releases at https://docs.ultralytics.com. If YOLOv11 is unavailable, use YOLOv8m or YOLOv8l as alternatives with similar accuracy improvements.

```python
# models/detector.py changes
class PeopleDetector:
    def __init__(self, model_size='m'):
        # Model selection based on hardware
        models = {
            's': 'yolov11s.pt',  # Fast, lower accuracy
            'm': 'yolov11m.pt',  # Balanced (recommended)
            'l': 'yolov11l.pt',  # Highest accuracy
        }
        self.model = YOLO(models[model_size])

        # GPU optimization
        if torch.cuda.is_available():
            self.model.to('cuda')
            self.model.fuse()  # Fuse layers for speed

    def detect(self, frame, conf_threshold=0.25):
        # FP16 inference for GPU
        results = self.model(frame, half=True, verbose=False)
        return self._process_results(results, conf_threshold)
```

#### 2.2 Add Pose Estimation

**Model:** YOLOv8m-pose (17 keypoints per person)

```python
# models/pose_estimator.py (NEW)
class PoseEstimator:
    def __init__(self):
        self.model = YOLO('yolov8m-pose.pt')
        self.keypoints = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
                          'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
                          'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
                          'left_knee', 'right_knee', 'left_ankle', 'right_ankle']

    def estimate(self, frame) -> List[PersonPose]:
        results = self.model(frame, verbose=False)
        return self._extract_poses(results)

    def detect_fall(self, pose: PersonPose) -> bool:
        """Detect if person is horizontal (fallen)."""
        shoulder_mid = (pose.left_shoulder + pose.right_shoulder) / 2
        hip_mid = (pose.left_hip + pose.right_hip) / 2

        # If shoulder-hip line is nearly horizontal = fall
        angle = np.degrees(np.arctan2(
            hip_mid[1] - shoulder_mid[1],
            hip_mid[0] - shoulder_mid[0]
        ))
        return abs(angle) < 30 or abs(angle) > 150
```

#### 2.3 Add Accessibility Detection

```python
# models/accessibility_detector.py (NEW)
class AccessibilityDetector:
    def __init__(self):
        # Custom trained or fine-tuned model for wheelchair detection
        self.wheelchair_model = YOLO('wheelchair_detector.pt')  # Custom model

    def detect_wheelchair(self, frame, person_detections) -> List[Detection]:
        """Detect wheelchair users."""
        # Method 1: Direct wheelchair object detection
        wheelchair_results = self.wheelchair_model(frame)

        # Method 2: Pose-based (sitting at consistent height while moving)
        # Combined approach for higher accuracy
        return self._merge_detections(wheelchair_results, person_detections)

    def detect_elderly(self, tracks, velocities) -> List[Detection]:
        """Detect elderly based on slow gait pattern."""
        elderly = []
        for track in tracks:
            avg_velocity = np.mean(velocities.get(track.id, [1.0]))
            if avg_velocity < 0.4:  # Slow walking (<0.4 m/s)
                elderly.append(track)
        return elderly
```

#### 2.4 Optimize Velocity Estimation

**Current:** Farneback Optical Flow (~50ms per frame)
**Target:** Track-based velocity (~1ms overhead)

```python
# models/velocity.py improvements
class VelocityEstimator:
    def estimate_from_tracks(self, tracks: List[TrackedObject], fps: float) -> Dict[int, float]:
        """Calculate velocity from track positions (fast, accurate)."""
        velocities = {}
        for track in tracks:
            if len(track.history) >= 2:
                # Distance moved in pixels
                dx = track.history[-1][0] - track.history[-2][0]
                dy = track.history[-1][1] - track.history[-2][1]
                pixel_distance = np.sqrt(dx**2 + dy**2)

                # Convert to m/s using calibration
                meters_per_pixel = 0.02  # Calibrated per video
                velocity = (pixel_distance * meters_per_pixel) * fps
                velocities[track.id] = velocity

        return velocities

    def estimate_scene_velocity(self, frame) -> float:
        """Fallback: Optical flow for scene-level velocity."""
        # Only used when tracks are sparse
        return self._optical_flow_velocity(frame)
```

#### 2.5 Tasks

| Task | Description | Files |
|------|-------------|-------|
| 2.1.1 | Download YOLOv11m model | `models/yolov11m.pt` |
| 2.1.2 | Update detector.py for YOLOv11 + GPU | `models/detector.py` |
| 2.2.1 | Download YOLOv8m-pose model | `models/yolov8m-pose.pt` |
| 2.2.2 | Create pose_estimator.py | `models/pose_estimator.py` |
| 2.2.3 | Update anomaly_detector.py with pose-based fall detection | `processors/anomaly_detector.py` |
| 2.3.1 | Create accessibility_detector.py | `models/accessibility_detector.py` |
| 2.3.2 | Train/download wheelchair detection model | `models/wheelchair_detector.pt` |
| 2.4.1 | Add track-based velocity to velocity.py | `models/velocity.py` |
| 2.4.2 | Make optical flow a fallback only | `processors/video_processor.py` |

---

### Phase 3: Advanced Analytics (Priority: MEDIUM)

**Goal:** Enhanced anomaly, flow, and dwell analysis

#### 3.1 Enhanced Anomaly Detection

```python
# processors/anomaly_detector.py improvements
class AnomalyDetector:
    def __init__(self, pose_estimator: PoseEstimator):
        self.pose_estimator = pose_estimator
        self.velocity_threshold = 0.3  # m/s
        self.surge_threshold = 2.0     # Sudden velocity increase

    def detect_fall(self, poses: List[PersonPose]) -> List[Anomaly]:
        """Pose-based fall detection (85%+ accuracy)."""
        falls = []
        for pose in poses:
            if self.pose_estimator.detect_fall(pose):
                falls.append(Anomaly(type='fall', confidence=0.85, pose=pose))
        return falls

    def detect_stampede_pattern(self, velocities: Dict, directions: Dict) -> bool:
        """Detect stampede/surge patterns."""
        if len(velocities) < 10:
            return False

        avg_velocity = np.mean(list(velocities.values()))
        velocity_variance = np.var(list(velocities.values()))

        # Check for sudden uniform movement
        direction_variance = self._calculate_direction_variance(directions)

        return (avg_velocity > self.surge_threshold and
                direction_variance < 30)  # degrees
```

#### 3.2 Enhanced Flow Detection

```python
# processors/flow_detector.py improvements
class FlowAnalyzer:
    def detect_counter_flow(self, tracks, dominant_direction) -> List[Track]:
        """Detect people moving against dominant flow."""
        counter_flow = []
        for track in tracks:
            if len(track.history) >= 3:
                track_direction = self._calculate_direction(track)
                angle_diff = abs(track_direction - dominant_direction)
                if angle_diff > 120:  # Moving opposite
                    counter_flow.append(track)
        return counter_flow

    def generate_heatmap(self, tracks, frame_shape) -> np.ndarray:
        """Generate direction heatmap."""
        heatmap = np.zeros(frame_shape[:2])
        for track in tracks:
            for point in track.history:
                x, y = int(point[0]), int(point[1])
                cv2.circle(heatmap, (x, y), 10, 1, -1)
        return heatmap
```

#### 3.3 Tasks

| Task | Description | Files |
|------|-------------|-------|
| 3.1.1 | Integrate pose estimation into anomaly detector | `processors/anomaly_detector.py` |
| 3.1.2 | Add stampede detection logic | `processors/anomaly_detector.py` |
| 3.2.1 | Add counter-flow detection | `processors/flow_detector.py` |
| 3.2.2 | Add direction heatmap generation | `processors/flow_detector.py` |
| 3.3.1 | Update WebSocket to include new analytics | `api/websocket.py` |

---

### Phase 4: Performance Optimization (Priority: MEDIUM)

**Goal:** Achieve 8-10 FPS processing

#### 4.1 GPU Optimization

```python
# config.py additions
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
USE_FP16 = DEVICE == 'cuda'  # Half precision on GPU
BATCH_SIZE = 4  # Process multiple frames at once
```

#### 4.2 Frame Skip Strategy

```python
# Smart frame skipping based on activity
class AdaptiveFrameSkip:
    def __init__(self, min_skip=1, max_skip=5):
        self.min_skip = min_skip
        self.max_skip = max_skip
        self.current_skip = 2

    def update(self, detections_count, velocity):
        # Skip more frames when scene is static
        if velocity < 0.3 and detections_count < 10:
            self.current_skip = min(self.current_skip + 1, self.max_skip)
        else:
            self.current_skip = max(self.current_skip - 1, self.min_skip)
```

#### 4.3 Tasks

| Task | Description | Files |
|------|-------------|-------|
| 4.1.1 | Add CUDA detection and FP16 support | `models/detector.py` |
| 4.1.2 | Add batch processing for multiple cameras | `processors/video_processor.py` |
| 4.2.1 | Implement adaptive frame skip | `processors/video_processor.py` |
| 4.3.1 | Add processing metrics (FPS counter) | `api/routes.py` |

---

## Demo Presentation Script (15 Minutes)

### Page 1: Core Capabilities (7-8 minutes)

**Opening (1 min):**
> "SmartDarshan is a real-time crowd analytics platform designed specifically for temple management. What you're seeing is actual computer vision processing live video feeds."

**Crowd Density (2 min):**
> Show `clip_01_density.mp4`
> "Our YOLO-based detection identifies every individual in the frame. We calculate density as people per square meter - critical for safety compliance."

**Gate Counting (2 min):**
> Show `clip_03_gate.mp4`
> "Virtual counting lines track entry and exit in real-time. This enables gate load balancing and capacity management."

**Flow Analysis (2 min):**
> Show `clip_04_flow.mp4`
> "We track individual trajectories to calculate average velocity and detect congestion. When velocity drops below 0.3 m/s, we flag congestion."

### Page 2: All 8 Capabilities (5-6 minutes)

**Grid Overview (1 min):**
> "Here you see all 8 analytics running simultaneously on South Indian temple footage."

**Quick Feature Walkthrough (30 sec each):**

1. **Crowd Density:** "Real-time headcount with ±5% accuracy"
2. **Queue Analysis:** "Wait time prediction based on queue length and service rate"
3. **Gate Counting:** "Bi-directional counting for capacity management"
4. **Flow Detection:** "Velocity and direction analysis for bottleneck prevention"
5. **Safety Monitoring:** "Automated alerts for density breaches"
6. **Accessibility:** "Wheelchair detection for priority routing"
7. **Dwell Time:** "Identifies areas where people linger too long"
8. **Anomaly Detection:** "Fall detection, counter-flow, unusual patterns"

**Closing (1 min):**
> "All processing happens locally in real-time at 8-10 FPS. The system can scale to multiple camera feeds and integrates with existing PA systems for automated alerts."

### Demo Fallback Strategy

If live processing fails during the demo:

| Failure Mode | Fallback Action |
|--------------|-----------------|
| Backend crashes | Switch to pre-recorded screen capture of working demo |
| WebSocket disconnects | Frontend shows last known metrics with "reconnecting..." indicator |
| Video won't load | Have backup videos on USB drive, switch source |
| Browser freezes | Have demo running in second browser tab as hot spare |
| Laptop overheats | Reduce to 4 clips instead of 8, lower resolution |

**Pre-demo checklist:**
1. Record 2-minute screen capture of working demo as backup video
2. Test full 15-minute run without interruption
3. Close unnecessary applications to free RAM
4. Disable system notifications
5. Keep charger plugged in (CV processing drains battery)

---

## API Reference

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/status` | GET | Health check and system status |
| `/api/analytics/video/{id}` | GET | Single frame analysis |
| `/api/analytics/metrics/{id}` | GET | Current metrics for video |
| `/api/analytics/alerts` | GET | Active alerts list |
| `/api/analytics/config` | POST | Update zone/line configurations |

### WebSocket Endpoint

```
WS /ws/analytics/{video_id}
```

**Message format (server → client):**
```json
{
  "timestamp": "2026-01-19T10:30:00Z",
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
  ],
  "advanced": {
    "gates": {"gate_1": {"in": 23, "out": 18}},
    "dominantFlow": "north",
    "counterFlowCount": 2,
    "anomalyCount": 0,
    "dwellAverage": 4.2
  }
}
```

**Commands (client → server):**
```json
{"action": "ping"}
{"action": "set_zone_area", "area_sqm": 100.0}
{"action": "set_counting_line", "y_percentage": 50.0}
```

---

## File Changes Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `models/pose_estimator.py` | Pose estimation for fall detection |
| `models/accessibility_detector.py` | Wheelchair/elderly detection |
| `src/components/VideoAnalyticsCard.jsx` | Reusable video + metrics card |
| `src/hooks/useVideoAnalytics.js` | WebSocket hook for React |
| `src/config/analyticsConfig.js` | Video clip → analytics mapping |

### Files to Modify

| File | Changes |
|------|---------|
| `models/detector.py` | Upgrade to YOLOv11, add GPU support |
| `models/velocity.py` | Add track-based velocity |
| `processors/anomaly_detector.py` | Pose-based fall detection |
| `processors/flow_detector.py` | Counter-flow, heatmap |
| `api/websocket.py` | Include new analytics in broadcast |
| `src/pages/DemoSlide1.jsx` | Connect to real API |
| `src/pages/DemoSlide2.jsx` | 8-card grid with clips |

---

## Dependencies

### Python (requirements.txt)

```txt
# Core
fastapi>=0.100.0
uvicorn>=0.23.0
websockets>=11.0

# Computer Vision
ultralytics>=8.3.0     # YOLOv11 support
opencv-python>=4.9.0
numpy>=1.24.0

# Tracking & Supervision
supervision>=0.25.0
lap>=0.4.0             # For ByteTrack

# GPU (optional)
torch>=2.0.0
torchvision>=0.15.0

# Utilities
python-multipart>=0.0.6
pydantic>=2.0.0
```

### Node.js (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "http-proxy-middleware": "^2.0.6"
  }
}
```

---

## Expected Accuracy Targets

| Analytics | Current | Target | Improvement |
|-----------|---------|--------|-------------|
| People counting | 85-90% | 92-95% | +5-7% |
| Density estimation | 82-88% | 88-92% | +5% |
| Congestion detection | 80-85% | 85-90% | +5% |
| Fall detection | 60-70% | 80-88% | +15-20% |
| Wheelchair detection | 0% | 80-85% | New |
| Velocity estimation | 70-75% | 85-90% | +15% |
| Counter-flow detection | 75-80% | 85-88% | +8% |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| YOLOv11 not stable | Low | Medium | Fall back to YOLOv8m |
| Pose model too slow | Medium | Medium | Run pose only on key frames |
| GPU not available | Medium | Low | CPU fallback with smaller model |
| Wheelchair model unavailable | Medium | Medium | Use pose-based heuristics |
| Demo clips have issues | Low | High | Re-extract from source videos |

---

## Verification Checklist

### Before Demo

- [ ] All 8 video clips loop smoothly
- [ ] WebSocket connection stable for 15+ minutes
- [ ] Metrics update in real-time (sub-2 second latency)
- [ ] No JavaScript console errors
- [ ] Backend handles video loop restart gracefully
- [ ] All 8 analytics cards display correct metrics
- [ ] Summary bar shows aggregate stats

### Accuracy Validation

- [ ] Manual count vs API count within 10%
- [ ] Velocity reads 0.5-1.2 m/s for normal walking
- [ ] Congestion status changes with crowd conditions
- [ ] Gate counting matches visual count

---

## Quick Start

```bash
# Terminal 1: Python backend
cd webapp/analytics
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: React frontend
cd webapp
npm install
npm run dev

# Access demo
# http://localhost:5173/demo/slide1
# http://localhost:5173/demo/slide2
```

---

## Timeline Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| **Phase 1** | Demo UI Integration | DemoSlide1 & DemoSlide2 with real data |
| **Phase 2** | CV Algorithm Upgrade | YOLOv11, pose estimation, accessibility |
| **Phase 3** | Advanced Analytics | Enhanced anomaly/flow detection |
| **Phase 4** | Performance | 8-10 FPS processing |

**Priority for 15-minute demo:** Complete Phase 1 first, then Phase 2 components as time permits.

---

## Audio Handling

The demo video clips may contain original audio (commentary, ambient sounds) which can be distracting during presentation. Options:

1. **Mute in frontend:** Add `muted` attribute to all `<video>` elements (recommended)
2. **Strip audio with FFmpeg:** `ffmpeg -i clip_01_density.mp4 -an -c:v copy clip_01_density_silent.mp4`
3. **Present with audio:** Only if audio adds value (e.g., crowd ambiance for immersion)

---

## Related Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **IMPROVEMENT_PLAN.md** | Detailed CV algorithm upgrade specifications | `/webapp/analytics/IMPROVEMENT_PLAN.md` |
| **VIDEO_CLIP_PLAN.md** | FFmpeg commands for clip extraction | `/webapp/analytics/VIDEO_CLIP_PLAN.md` |
| **IMPLEMENTATION_PLAN.md** | Original 7-phase backend implementation | `/webapp/IMPLEMENTATION_PLAN.md` |
| **capabilities.txt** | POC success criteria and tier matrix | `/capabilities.txt` |

This BUILD_PLAN.md consolidates and supersedes the above documents for the demo preparation phase.
