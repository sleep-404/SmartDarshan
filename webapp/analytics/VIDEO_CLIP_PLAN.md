# Video Clip Preparation Plan for Demo

## Executive Summary

**Goal**: Prepare 5-10 second video clips for each of the 8 analytics features in the demo.

---

## Final Clip Mapping (8 Analytics Features)

| # | Analytics Feature | Source Video | Timestamp | Crop/Notes | Status |
|---|-------------------|--------------|-----------|------------|--------|
| 1 | **Crowd Density** | festival_crowd.mp4 | 30-40s | Crop right edge slightly | Ready |
| 2 | **Queue Analysis** | temple_entrance.mp4 | 115-125s | Crop bottom 40px (watermark) | Ready |
| 3 | **Gate Counting** | temple_entrance.mp4 | 15-25s | Crop bottom 40px (watermark) | Ready |
| 4 | **Flow Detection** | festival_crowd.mp4 | 45-55s | None needed | Ready |
| 5 | **Safety Monitoring** | temple_entrance.mp4 | 60-70s | Crop bottom 40px (watermark) | Ready |
| 6 | **Accessibility** | wheelchair_darshan.mp4 | 395-405s | Crop to remove black bars | Ready |
| 7 | **Dwell Time** | temple_entrance.mp4 | 240-250s | Crop bottom 40px (watermark) | Ready |
| 8 | **Anomaly Detection** | tirumala_ai_cctv.mp4 | 145-155s | Crop text overlays if possible | Ready |

---

## Video Source Analysis

### Existing Videos (Original)

| Video | Duration | Usable Portions |
|-------|----------|-----------------|
| **festival_crowd.mp4** | 94s | 30-60s (clean festival crowd, good for density & flow) |
| **temple_entrance.mp4** | 301s | 15-250s (documentary style, watermark at bottom) |
| **ayodhya_crowd.mp4** | 763s | 550-650s (aerial crowd, heavy crop needed) |
| **tirupati_queue.mp4** | 210s | Limited (heavy news overlays) |

### Downloaded Videos (New)

| Video | Duration | Usable Portions |
|-------|----------|-----------------|
| **wheelchair_darshan.mp4** | 970s | 395-410s (wheelchair user visible), 600s (crowd at temple) |
| **tirumala_ai_cctv.mp4** | 236s | 145-160s (aerial temple view), 195-210s (AI interface demo) |
| **tirumala_queue_walk.mp4** | 108s | Contains NatGeo 3D rendering (not real footage) |
| **wheelchair_temple.mp4** | 343s | Vlog style (not clean CCTV footage) |
| **senior_queue_line.mp4** | 53s | YouTube short (thumbnail only, not useful) |

---

## FFmpeg Extraction Commands

### Clip 1: Crowd Density (festival_crowd 30-40s)
```bash
ffmpeg -ss 30 -i festival_crowd.mp4 -t 10 -vf "crop=1240:720:20:0" -c:v libx264 -crf 23 -c:a aac clip_01_density.mp4
```

### Clip 2: Queue Analysis (temple_entrance 115-125s)
```bash
ffmpeg -ss 115 -i temple_entrance.mp4 -t 10 -vf "crop=1280:680:0:0" -c:v libx264 -crf 23 -c:a aac clip_02_queue.mp4
```

### Clip 3: Gate Counting (temple_entrance 15-25s)
```bash
ffmpeg -ss 15 -i temple_entrance.mp4 -t 10 -vf "crop=1280:680:0:0" -c:v libx264 -crf 23 -c:a aac clip_03_gate.mp4
```

### Clip 4: Flow Detection (festival_crowd 45-55s)
```bash
ffmpeg -ss 45 -i festival_crowd.mp4 -t 10 -c:v libx264 -crf 23 -c:a aac clip_04_flow.mp4
```

### Clip 5: Safety Monitoring (temple_entrance 60-70s)
```bash
ffmpeg -ss 60 -i temple_entrance.mp4 -t 10 -vf "crop=1280:680:0:0" -c:v libx264 -crf 23 -c:a aac clip_05_safety.mp4
```

### Clip 6: Accessibility (wheelchair_darshan 395-405s)
```bash
ffmpeg -ss 395 -i wheelchair_darshan.mp4 -t 10 -vf "crop=320:500:20:34,scale=640:1000" -c:v libx264 -crf 23 -c:a aac clip_06_accessibility.mp4
```

### Clip 7: Dwell Time (temple_entrance 240-250s)
```bash
ffmpeg -ss 240 -i temple_entrance.mp4 -t 10 -vf "crop=1280:680:0:0" -c:v libx264 -crf 23 -c:a aac clip_07_dwell.mp4
```

### Clip 8: Anomaly Detection (tirumala_ai_cctv 145-155s)
```bash
ffmpeg -ss 145 -i tirumala_ai_cctv.mp4 -t 10 -vf "crop=600:320:20:20" -c:v libx264 -crf 23 -c:a aac clip_08_anomaly.mp4
```

---

## Output Structure

```
webapp/public/videos/
├── clips/                      # Demo-ready clips (10s each)
│   ├── clip_01_density.mp4     # Crowd density - festival crowd
│   ├── clip_02_queue.mp4       # Queue analysis - temple entrance
│   ├── clip_03_gate.mp4        # Gate counting - temple gate
│   ├── clip_04_flow.mp4        # Flow detection - festival movement
│   ├── clip_05_safety.mp4      # Safety - temple crowd
│   ├── clip_06_accessibility.mp4 # Wheelchair user at Tirupati
│   ├── clip_07_dwell.mp4       # Dwell time - temple area
│   └── clip_08_anomaly.mp4     # Anomaly - aerial Tirumala crowd
├── downloads/                  # Downloaded raw videos
│   ├── wheelchair_darshan.mp4
│   ├── tirumala_ai_cctv.mp4
│   └── ...
└── (original videos)
    ├── festival_crowd.mp4
    ├── temple_entrance.mp4
    └── ...
```

---

## Key Features of Each Clip

| Clip | Analytics Feature | What It Demonstrates |
|------|-------------------|---------------------|
| clip_01_density | Crowd Density | Dense crowd in festival, elevated view |
| clip_02_queue | Queue Analysis | People standing in queue formation |
| clip_03_gate | Gate Counting | Entry/exit through gate with clear doorway |
| clip_04_flow | Flow Detection | Directional crowd movement |
| clip_05_safety | Safety Monitoring | General crowd monitoring scene |
| clip_06_accessibility | Accessibility | Wheelchair user navigating temple area |
| clip_07_dwell | Dwell Time | People lingering in temple courtyard |
| clip_08_anomaly | Anomaly Detection | Wide aerial view for pattern detection |

---

## Demo Talking Points

**For 15-minute presentation:**

**Page 1 (Core Capabilities - Detailed Explanation):**
- Show clip_01_density and explain: "Given any video feed, we calculate real-time crowd density"
- Show clip_03_gate and explain: "Virtual gate lines track entry/exit counts"
- Show metrics overlay explaining people count, density level, velocity

**Page 2 (All 8 Capabilities - Quick Overview):**
- Display all 8 clips simultaneously with live metrics overlays
- Each card shows: Video + Real-time extracted data
- Briefly mention each capability (30 seconds per capability)

**Key phrase:** "All of this happens in real-time - what you're seeing is actual computer vision processing the video frame by frame."

---

## Quality Checklist

For each clip, verify:
- [ ] No heavy news channel overlays
- [ ] People are clearly visible
- [ ] Duration is exactly 10 seconds
- [ ] Resolution is at least 640x360
- [ ] File size under 10MB
- [ ] Loops cleanly for continuous playback
