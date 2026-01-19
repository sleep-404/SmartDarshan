# Source Video Audit Report

**Date:** 2026-01-19
**Purpose:** Identify usable segments for demo video clips

---

## Videos Audited

### 1. wheelchair_darshan.mp4 (969 seconds)
**Location:** `webapp/public/videos/downloads/`
**Format:** Vertical (portrait) video with "Being on Wheels" watermark

| Timestamp | Content | Usability |
|-----------|---------|-----------|
| 100s | View from inside vehicle approaching temple | Not usable - no people |
| 200s | Gate area with few people, STOP sign visible | Limited - sparse people |
| 400s | Wheelchair user from behind on road | Good for accessibility clip (already used) |
| 600s | Crowd of people walking in open area | Moderate - could work for safety/flow |
| 700s | Dining hall interior with tables | Not usable - no people |
| 800s | Woman sitting on floor with prasad | Not usable - single person |
| 900s | Interior shot | Not usable |

**Best segments:** 400s (accessibility), 600s (crowd)

---

### 2. tirumala_ai_cctv.mp4 (236 seconds)
**Location:** `webapp/public/videos/downloads/`
**Format:** NDTV news broadcast with overlays

| Timestamp | Content | Usability |
|-----------|---------|-----------|
| 30s | Temple gopuram exterior | Not usable - no people |
| 60s | Temple and hill landscape | Not usable - scenic |
| 90s | 3D render/animation | Not usable |
| 120s | Gate entrance with few people | Limited - very sparse |
| 150s | Temple exterior | Not usable |
| 180s | Golden structure (vimana) | Not usable |
| 210s | Temple structures | Not usable |

**Best segments:** 120s is only moderately usable, heavy news overlays

---

### 3. tirumala_queue_walk.mp4 (107 seconds)
**Location:** `webapp/public/videos/downloads/`
**Format:** National Geographic documentary

| Timestamp | Content | Usability |
|-----------|---------|-----------|
| 10s | Temple interior with crowd | Moderate - has people but NatGeo logo |
| 30s | 3D architectural render | Not usable - CGI |
| 50s | 3D render "AINA MAHAL" | Not usable - CGI |
| 70s | 3D render "BANGARU VAKILI" | Not usable - CGI |
| 90s | 3D render | Not usable - CGI |

**Best segments:** 10s only, rest is 3D renders

---

### 4. senior_queue_line.mp4 (53 seconds)
**Location:** `webapp/public/videos/downloads/`
**Format:** YouTube screen recording

| Timestamp | Content | Usability |
|-----------|---------|-----------|
| 5s | Temple with cartoon overlay | Not usable - graphics |
| 15s | App screenshot | Not usable |
| 25s | Senior couple photo | Not usable |
| 35s | Text/graphics | Not usable |
| 45s | Text/graphics | Not usable |

**Best segments:** None - this is a YouTube explainer video, not footage

---

### 5. tirupati_queue.mp4 (210 seconds)
**Location:** `webapp/public/videos/`
**Format:** NTV news broadcast with header banner

| Timestamp | Content | Usability |
|-----------|---------|-----------|
| 30s | News graphic split screen | Not usable |
| 60s | Queue interior with crowd | Moderate - news overlay |
| 90s | Outdoor queue area with people | Good - clear footage |
| 120s | Interior shot | Limited |
| **145s** | **Gate with dense crowd flowing through** | **EXCELLENT - Gate counting** |
| **150s** | **Dense crowd at temple gate with railings** | **EXCELLENT - Queue analysis** |
| **155s** | **Very dense crowd close-up** | **EXCELLENT - Safety monitoring** |
| **175s** | **Queue corridor with railings, people walking** | **EXCELLENT - Queue analysis** |
| **180s** | **Dense crowd with officials, people lingering** | **GOOD - Dwell time** |
| 185s | Continued crowd scene | Good |

**Best segments:** 145s-185s has excellent footage for multiple analytics

---

## Recommended Clip Replacements

Based on the audit, tirupati_queue.mp4 (145s-185s range) provides the best source material for the problematic clips:

| Clip | Purpose | Source | Start Time | Notes |
|------|---------|--------|------------|-------|
| clip_02_queue | Queue Analysis | tirupati_queue.mp4 | 170s | Queue corridor with railings visible |
| clip_03_gate | Gate Counting | tirupati_queue.mp4 | 142s | Gate with bidirectional flow |
| clip_05_safety | Safety Monitoring | tirupati_queue.mp4 | 153s | Dense crowd for monitoring |
| clip_07_dwell | Dwell Time | tirupati_queue.mp4 | 178s | People lingering in area |

**Note:** All clips will have NTV news banner at top (~40px) and logo at bottom-left. This is acceptable for demo purposes as the main video content is clearly visible.

---

## Clips Verified as Good (No Changes Needed)

| Clip | Purpose | Current Content | Status |
|------|---------|-----------------|--------|
| clip_01_density | Crowd Density | Dense festival crowd | ✓ Good |
| clip_04_flow | Flow Detection | Crowd moving directionally | ✓ Good |
| clip_06_accessibility | Accessibility | Wheelchair user at temple | ✓ Good |
| clip_08_anomaly | Anomaly Detection | Aerial temple view | ✓ Good |
