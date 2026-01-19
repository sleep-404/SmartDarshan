# Clip Verification Log

**Verification Date:** 2026-01-19
**Verified By:** Automated verification process

---

## Clip 1: clip_01_density.mp4
**Purpose:** Crowd Density Analysis
**Source:** festival_crowd.mp4 (original)
**Content:** Night festival crowd with many people carrying items on heads
**Verification:**
- [x] Shows dense crowd suitable for density counting
- [x] Multiple people visible in frame
- [x] Good visibility despite nighttime setting
**Duration:** 10.0s | **Resolution:** 1280x720 | **Size:** 4.0M
**Status:** ✅ APPROVED

---

## Clip 2: clip_02_queue.mp4
**Purpose:** Queue Analysis
**Source:** tirupati_queue.mp4 at 170s
**FFmpeg Command:**
```bash
ffmpeg -ss 170 -i tirupati_queue.mp4 -t 10 -c:v libx264 -crf 23 -an clip_02_queue.mp4
```
**Content:** Queue corridor with metal railings, people walking in line formation
**Verification:**
- [x] Shows clear queue/line formation
- [x] Railings visible indicating queue structure
- [x] Multiple people in line
**Duration:** 10.0s | **Resolution:** 1280x720 | **Size:** 3.0M
**Overlay:** NTV news banner at top (minimal, does not obstruct view)
**Status:** ✅ APPROVED

---

## Clip 3: clip_03_gate.mp4
**Purpose:** Gate Counting (Entry/Exit)
**Source:** tirupati_queue.mp4 at 142s
**FFmpeg Command:**
```bash
ffmpeg -ss 142 -i tirupati_queue.mp4 -t 10 -c:v libx264 -crf 23 -an clip_03_gate.mp4
```
**Content:** Temple gate with dense crowd flowing through, barriers visible
**Verification:**
- [x] Shows gate/entrance structure
- [x] People flowing through in both directions
- [x] Good for counting entry/exit
**Duration:** 10.0s | **Resolution:** 1280x720 | **Size:** 4.0M
**Overlay:** NTV news banner at top (minimal)
**Status:** ✅ APPROVED

---

## Clip 4: clip_04_flow.mp4
**Purpose:** Flow Detection
**Source:** festival_crowd.mp4 (original)
**Content:** Festival crowd moving directionally at night
**Verification:**
- [x] Shows crowd with directional movement
- [x] Flow pattern visible
- [x] Suitable for flow analysis
**Duration:** 10.0s | **Resolution:** 1280x720 | **Size:** 4.0M
**Status:** ✅ APPROVED

---

## Clip 5: clip_05_safety.mp4
**Purpose:** Safety Monitoring
**Source:** tirupati_queue.mp4 at 153s
**FFmpeg Command:**
```bash
ffmpeg -ss 153 -i tirupati_queue.mp4 -t 10 -c:v libx264 -crf 23 -an clip_05_safety.mp4
```
**Content:** Very dense crowd close-up, people packed together
**Verification:**
- [x] Shows dense crowd suitable for safety monitoring
- [x] Can detect potential crowding issues
- [x] Multiple people clearly visible
**Duration:** 10.0s | **Resolution:** 1280x720 | **Size:** 3.0M
**Overlay:** NTV news banner at top (minimal)
**Status:** ✅ APPROVED

---

## Clip 6: clip_06_accessibility.mp4
**Purpose:** Accessibility Monitoring
**Source:** wheelchair_darshan.mp4 at ~400s (original)
**Content:** Wheelchair user at Tirupati temple
**Verification:**
- [x] Shows wheelchair user clearly
- [x] Accessibility-related content
- [x] Temple environment visible
**Duration:** 10.0s | **Resolution:** 360x568 | **Size:** 796K
**Overlay:** "Being on Wheels" watermark (acceptable)
**Status:** ✅ APPROVED

---

## Clip 7: clip_07_dwell.mp4
**Purpose:** Dwell Time Analysis
**Source:** tirupati_queue.mp4 at 178s
**FFmpeg Command:**
```bash
ffmpeg -ss 178 -i tirupati_queue.mp4 -t 10 -c:v libx264 -crf 23 -an clip_07_dwell.mp4
```
**Content:** Dense queue area with people waiting/lingering
**Verification:**
- [x] Shows people lingering in one area
- [x] Not just passing through - dwelling behavior visible
- [x] Multiple people in frame
**Duration:** 10.0s | **Resolution:** 1280x720 | **Size:** 4.0M
**Overlay:** NTV news banner at top (minimal)
**Status:** ✅ APPROVED

---

## Clip 8: clip_08_anomaly.mp4
**Purpose:** Anomaly Detection
**Source:** tirumala_ai_cctv.mp4 (original aerial shot)
**Content:** Wide aerial view of Tirupati temple with crowd in plaza
**Verification:**
- [x] Shows wide view suitable for pattern detection
- [x] Can identify unusual crowd patterns
- [x] Temple and crowd visible
**Duration:** 10.0s | **Resolution:** 600x240 | **Size:** 324K
**Status:** ✅ APPROVED

---

## Summary

| Clip | Status | Source Changed |
|------|--------|----------------|
| clip_01_density | ✅ | No |
| clip_02_queue | ✅ | **Yes** - from wheelchair_darshan to tirupati_queue |
| clip_03_gate | ✅ | **Yes** - from wheelchair_darshan to tirupati_queue |
| clip_04_flow | ✅ | No |
| clip_05_safety | ✅ | **Yes** - from wheelchair_darshan to tirupati_queue |
| clip_06_accessibility | ✅ | No |
| clip_07_dwell | ✅ | **Yes** - from wheelchair_darshan to tirupati_queue |
| clip_08_anomaly | ✅ | No |

**All 8 clips verified and approved for demo use.**
