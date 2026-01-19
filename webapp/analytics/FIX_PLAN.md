# Fix Plan: Demo Video Clips & AI Processing

## Problem Summary

**Issues Found:**
1. 4 out of 8 video clips do NOT match their analytics purpose
2. YOLO models not downloaded - AI shows fake/simulated data
3. Plan documents not updated when sources changed
4. No proper verification done before marking clips "ready"
5. **CRITICAL: Port mismatch - Frontend can't connect to backend at all!**
6. **CRITICAL: WebSocket URL points to wrong port (8080 vs 8000)**

**Clips with Problems:**
| Clip | Label | Actual Content | Required Content |
|------|-------|----------------|------------------|
| clip_02_queue | Queue Analysis | Temple gate, NO queue visible | People standing in line formation |
| clip_03_gate | Gate Counting | ~4 people, minimal activity | Gate with people entering AND exiting |
| clip_05_safety | Safety Monitoring | Woman's back, distant buildings | Crowd scene suitable for monitoring |
| clip_07_dwell | Dwell Time | Single woman sitting with phone | Multiple people lingering in an area |

**Clips that are OK:**
| Clip | Label | Content | Status |
|------|-------|---------|--------|
| clip_01_density | Crowd Density | Dense festival crowd | ✓ Good |
| clip_04_flow | Flow Detection | Crowd moving directionally | ✓ Good |
| clip_06_accessibility | Accessibility | Wheelchair user at Tirupati | ✓ Good |
| clip_08_anomaly | Anomaly Detection | Aerial temple view | ✓ Good |

---

## PHASE 0: Fix Critical Connection Bugs (MUST DO FIRST)

### Task 0.1: Fix Express Proxy Port
**File:** `webapp/server.js` line 13
```javascript
// CURRENT (WRONG):
const PYTHON_BACKEND_URL = 'http://localhost:8080';

// SHOULD BE:
const PYTHON_BACKEND_URL = 'http://localhost:8000';
```
- [x] Edit server.js to change port from 8080 to 8000 ✅ DONE
- [ ] Restart Express server

### Task 0.2: Fix WebSocket URL in Hook
**File:** `webapp/src/hooks/useVideoAnalytics.js`
```javascript
// CURRENT (WRONG):
const WS_BASE = 'ws://localhost:8080/ws/analytics';

// SHOULD BE:
const WS_BASE = 'ws://localhost:8000/ws/analytics';
```
- [x] Edit useVideoAnalytics.js to change port from 8080 to 8000 ✅ DONE

### Task 0.3: Verify Connection Works
- [ ] Restart both servers (Express + Python backend)
- [ ] Open browser console on demo page
- [ ] Verify NO "WebSocket connection failed" errors
- [ ] Verify API calls return data (not 503 errors)

### Task 0.4: Verify Vite Proxy Config
**File:** `webapp/vite.config.js`
```javascript
// CURRENT:
proxy: {
  '/api': 'http://localhost:3001'
}
```
- [x] Confirm this points to Express server (3001) - this is correct ✅ VERIFIED
- [x] Express then proxies to Python backend (8000) ✅ VERIFIED

---

## PHASE 1: Audit Source Videos

### Task 1.1: Sample wheelchair_darshan.mp4
- [ ] Extract frames at: 100s, 200s, 300s, 400s, 500s, 600s, 700s, 800s, 900s
- [ ] Look for:
  - Queue footage (people in line)
  - Gate with bidirectional traffic
  - Crowded area (safety monitoring)
  - People lingering/dwelling in one spot
- [ ] Document timestamps with descriptions

### Task 1.2: Sample tirumala_ai_cctv.mp4
- [ ] Extract frames at: 30s, 60s, 90s, 120s, 150s, 180s, 210s
- [ ] Look for:
  - Queue footage
  - Gate activity
  - Crowd scenes
- [ ] Document timestamps with descriptions

### Task 1.3: Sample tirupati_queue.mp4
- [ ] Extract frames at: 30s, 60s, 90s, 120s, 150s, 180s
- [ ] Look for:
  - Actual queue footage (despite news overlays)
  - Assess if overlays can be cropped out
- [ ] Document timestamps with descriptions

### Task 1.4: Create Source Video Audit Document
- [ ] Create file: `SOURCE_VIDEO_AUDIT.md`
- [ ] Document all usable segments found
- [ ] Include: video name, timestamp, duration, content description, crop needed

---

## PHASE 2: Extract Corrected Clips

### Task 2.1: Fix clip_02_queue.mp4
**Requirement:** Must show people standing IN A LINE/QUEUE formation
- [ ] Select best source from audit (Phase 1)
- [ ] Identify 10-second segment with clear queue
- [ ] Run FFmpeg extraction command
- [ ] Verify output shows queue formation

**Expected FFmpeg command format:**
```bash
ffmpeg -ss [START] -i [SOURCE].mp4 -t 10 -vf "[CROP_IF_NEEDED]" -c:v libx264 -crf 23 -an clip_02_queue.mp4
```

### Task 2.2: Fix clip_03_gate.mp4
**Requirement:** Must show gate/entrance with people entering AND exiting
- [ ] Select best source from audit (Phase 1)
- [ ] Identify 10-second segment with gate + bidirectional traffic
- [ ] Run FFmpeg extraction command
- [ ] Verify output shows gate activity

### Task 2.3: Fix clip_05_safety.mp4
**Requirement:** Must show crowded area suitable for safety monitoring
- [ ] Select best source from audit (Phase 1)
- [ ] Identify 10-second segment with visible crowd
- [ ] Run FFmpeg extraction command
- [ ] Verify output shows crowd scene

### Task 2.4: Fix clip_07_dwell.mp4
**Requirement:** Must show multiple people lingering/staying in an area
- [ ] Select best source from audit (Phase 1)
- [ ] Identify 10-second segment with people dwelling (not walking through)
- [ ] Run FFmpeg extraction command
- [ ] Verify output shows dwelling behavior

---

## PHASE 3: Verify All 8 Clips

### Task 3.1: Frame Extraction for Verification
For EACH of the 8 clips, extract frames at 1s, 5s, 9s:
```bash
for clip in clip_*.mp4; do
  ffmpeg -ss 1 -i "$clip" -vframes 1 "${clip%.mp4}_1s.jpg"
  ffmpeg -ss 5 -i "$clip" -vframes 1 "${clip%.mp4}_5s.jpg"
  ffmpeg -ss 9 -i "$clip" -vframes 1 "${clip%.mp4}_9s.jpg"
done
```

### Task 3.2: Visual Verification Checklist
| Clip | Purpose | Frame 1s | Frame 5s | Frame 9s | Verdict |
|------|---------|----------|----------|----------|---------|
| clip_01_density | Dense crowd for counting | [ ] | [ ] | [ ] | |
| clip_02_queue | Queue/line formation | [ ] | [ ] | [ ] | |
| clip_03_gate | Gate + entry/exit traffic | [ ] | [ ] | [ ] | |
| clip_04_flow | Crowd movement | [ ] | [ ] | [ ] | |
| clip_05_safety | Crowd for monitoring | [ ] | [ ] | [ ] | |
| clip_06_accessibility | Wheelchair user visible | [ ] | [ ] | [ ] | |
| clip_07_dwell | People lingering | [ ] | [ ] | [ ] | |
| clip_08_anomaly | Wide view for patterns | [ ] | [ ] | [ ] | |

### Task 3.3: Quality Checks
For each clip verify:
- [ ] No heavy news channel overlays blocking view
- [ ] People are clearly visible (not too dark/blurry)
- [ ] Duration is exactly 10 seconds
- [ ] Resolution is at least 640x360
- [ ] File size under 10MB
- [ ] Content matches the analytics label

---

## PHASE 4: Update Documentation

### Task 4.1: Update VIDEO_CLIP_PLAN.md
- [ ] Update "Final Clip Mapping" table with correct sources
- [ ] Update FFmpeg commands with actual commands used
- [ ] Update "Key Features of Each Clip" with verified descriptions
- [ ] Check all boxes in "Quality Checklist"
- [ ] Add "Last Verified" date

### Task 4.2: Update BUILD_PLAN.md
- [ ] Update "Demo Video Clips" section with correct info
- [ ] Update any references to clip sources
- [ ] Add note about verification process

### Task 4.3: Create Verification Log
- [ ] Create `CLIP_VERIFICATION_LOG.md`
- [ ] Document each clip with:
  - Source video and timestamp
  - FFmpeg command used
  - Verification frames reviewed
  - Sign-off that content matches purpose

---

## PHASE 5: Fix AI Processing

### Task 5.1: Download YOLO Model
```bash
cd webapp/analytics
source venv/bin/activate
python -c "from ultralytics import YOLO; YOLO('yolov8s.pt')"
```
- [ ] Verify model file exists: `ls -la yolov8s.pt`
- [ ] Move to models directory if needed

### Task 5.2: Test YOLO Detection
```bash
python -c "
from ultralytics import YOLO
import cv2
model = YOLO('yolov8s.pt')
results = model('public/videos/clips/clip_01_density.mp4', stream=True)
for r in results:
    print(f'Detected {len(r.boxes)} people')
    break
"
```
- [ ] Confirm detection count > 0
- [ ] Confirm no errors

### Task 5.3: Test WebSocket Real-time Detection
- [ ] Start backend: `uvicorn main:app --reload --port 8000`
- [ ] Connect to WebSocket: `ws://localhost:8000/ws/analytics/density`
- [ ] Verify response contains:
  - `detections` array with bounding boxes
  - `metrics.peopleCount` > 0
  - Real values (not hardcoded)

---

## PHASE 6: End-to-End Testing

### Task 6.1: Test DemoSlide1 (Quality Page)
- [ ] Open http://localhost:5173/demo/slide1
- [ ] Verify header shows "Real-time AI Processing" (green), NOT "Demo Mode"
- [ ] Verify each video card shows:
  - Green "AI" badge (not red "LIVE")
  - Bounding boxes on detected people
  - Metrics updating in real-time
- [ ] Take screenshot for evidence

### Task 6.2: Test DemoSlide2 (Quantity Page)
- [ ] Open http://localhost:5173/demo/slide2
- [ ] Verify all 8 cards show:
  - Videos playing correctly
  - AI indicators (green badges)
  - Real metrics (changing values)
- [ ] Verify each video matches its label:
  - Density card → shows crowd
  - Queue card → shows queue
  - Gate card → shows gate traffic
  - etc.
- [ ] Take screenshot for evidence

### Task 6.3: Final Verification
- [ ] Review screenshots
- [ ] Confirm no "Demo Mode" or "Simulated" indicators
- [ ] Confirm videos match their analytics labels
- [ ] Confirm bounding boxes appear on people
- [ ] Sign off on demo readiness

---

## Success Criteria

Before marking this fix complete, ALL must be true:

1. [ ] All 8 clips visually match their analytics purpose
2. [ ] YOLO model downloaded and working
3. [ ] WebSocket returns real detections (not simulated)
4. [ ] DemoSlide1 shows "AI Processing" with bounding boxes
5. [ ] DemoSlide2 shows all 8 analytics with real data
6. [ ] VIDEO_CLIP_PLAN.md updated with correct sources
7. [ ] All clips verified with frame extraction
8. [ ] Screenshots captured as evidence

---

## Estimated Tasks: 30 total
- **Phase 0 (Connection Bugs): 4 tasks** ← MUST DO FIRST
- Phase 1 (Audit): 4 tasks
- Phase 2 (Extract): 4 tasks
- Phase 3 (Verify): 3 tasks
- Phase 4 (Documentation): 3 tasks
- Phase 5 (AI Setup): 3 tasks
- Phase 6 (Testing): 3 tasks
- Success Criteria: 8 checkboxes
