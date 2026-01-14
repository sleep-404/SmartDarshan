# Smart Darshan: Admin Dashboard - Page Structure

## Overview

This document outlines the pages required for the off-ground administrative staff dashboard for the AI-Enabled Intelligent Crowd Management and Devotee Assistance Platform.

**Target Users:** Off-ground intelligence layer (temple administrators with computer access who make operational decisions)

**Pilot Location:** Kanaka Durga Temple / Sri Venkateswara Swamy Vari Devasthanam, Dwarakatirumala

---

## Priority Legend

| Priority | Definition | Rationale |
|----------|------------|-----------|
| **P0** | Must-have for POC | Directly maps to challenge.json expected solutions and POC success criteria |
| **P1** | Important for POC completeness | Supports P0 features; needed for operational effectiveness |
| **P2** | Post-POC / Enhancement | Valuable but not required for POC success criteria |
| **P3** | Future roadmap | Nice-to-have; can be added after successful POC |

---

## Page List

### 1. Live Overview / Command Center
**Priority:** P0

**Purpose:** Central nervous system of the platform. Provides at-a-glance situational awareness for decision-makers.

**Key Components:**
- Real-time temple-wide density heatmap (11 zones)
- Current footfall counter
- Active alerts panel (unresolved)
- Average darshan wait time
- Gate status summary (4 Gopurams)
- Quick action buttons: Trigger PA announcement, Send staff alert, Activate emergency protocol

**Maps to Challenge Requirement:** "Real-time visibility for temple administrators through dashboards"

---

### 2. Video Analytics & Anomaly Detection
**Priority:** P0

**Purpose:** AI-powered video intelligence layer. Transforms 324 CCTV cameras from passive recording to active monitoring.

**Key Components:**
- Live crowd density estimation per camera/zone
- Congestion hotspot visualization
- Anomaly detection feed (stampede patterns, unusual crowding, blocked exits)
- Detection confidence scores
- Camera thumbnail grid with density color-coding
- Alert triggers when thresholds exceeded

**Maps to Challenge Requirement:** "AI-Based Video Analytics: Use computer vision to process CCTV feeds and estimate crowd density, identify congestion hotspots, and detect anomalies in real time."

**POC Success Criteria:** ≥80% accuracy in real-time crowd density estimation and congestion detection

---

### 3. Crowd Forecast
**Priority:** P0

**Purpose:** Predictive intelligence for proactive planning instead of reactive management.

**Key Components:**
- Hourly footfall prediction (next 24-72 hours)
- Daily footfall prediction (next 7 days)
- Event calendar integration (Mukkoti Ekadasi, Kalyanotsavams, Dasara, Sankranthi, weekends)
- Weather impact overlay (temperature, humidity from 22-29°C, 60-90% humidity range)
- Historical comparison (same event last year)
- Prediction confidence intervals
- Event-type specific patterns (Ekadasi vs Sankranthi vs regular weekend)

**Maps to Challenge Requirement:** "Predictive Modeling: Leverage historical footfall, festival schedules, weather patterns, and event timelines to predict peak hours and alert temple administrators."

**POC Success Criteria:** ≥80% accuracy in peak-hour prediction using historical data

**Data Sources:** 5 years of daily footfall data, weather records, event calendar

---

### 4. Gate & Queue Management
**Priority:** P0

**Purpose:** Dynamic optimization of crowd flow through entry/exit points.

**Key Components:**
- Live status of 4 Gopurams (South, East, West, North-entry only)
- Entry/exit load per gate (people per minute)
- Queue waiting time per darshan line
- AI recommendations: "Open West Gopuram," "Restrict South entry," "Activate additional queue line"
- Barricade configuration suggestions
- Manual override controls
- Historical gate utilization patterns

**Maps to Challenge Requirement:** "Dynamic Queue and Gate Management: Recommend optimized use of entry and exit gates and barricades based on live crowd data."

---

### 5. Alerts & Notifications
**Priority:** P0

**Purpose:** Automated escalation system replacing manual observation-based announcements.

**Key Components:**
- Active alerts dashboard (severity: Critical, Warning, Info)
- Alert history log with timestamps
- Threshold configuration per zone (e.g., density > 80% triggers alert)
- Alert channels: PA system, SMS to staff, dashboard notification
- Manual broadcast interface (compose PA announcement)
- Escalation tracking (alert → acknowledged → resolved)
- Auto-triggered vs manual alert differentiation

**Maps to Challenge Requirement:** "Automated Alerts and Notifications: Trigger real-time audio and visual alerts through the temple PA system and dashboards to manage crowd movement dynamically."

---

### 6. Chatbot & Devotee Communication Monitor
**Priority:** P0

**Purpose:** Visibility into the multilingual virtual assistant performance and devotee queries.

**Key Components:**
- Live query feed (what devotees are asking right now)
- Query volume by language (Telugu, Hindi, English)
- Query categories: Wait times, facilities, navigation, safety, general
- Response accuracy metrics
- Unanswered/failed queries requiring manual intervention
- Escalated queries to human staff
- Sample conversations review
- What information is being communicated (current wait times, gate recommendations)

**Maps to Challenge Requirement:** "Multilingual Virtual Assistant: Deploy chatbots or IVR systems in Telugu, Hindi, and English to guide devotees on queue timings, temple facilities, and safety advisories."

**POC Success Criteria:** ≥80% accuracy in multilingual chatbot/voice assistant responses

---

### 7. System Health & Connectivity
**Priority:** P0

**Purpose:** Infrastructure monitoring to ensure offline resilience and identify failures.

**Key Components:**
- Camera connectivity status (324 cameras)
- HikCentral VMS integration health
- Edge processing node status
- Network connectivity per zone
- Offline zones flagged
- Deferred sync queue (data waiting to upload)
- PA system connectivity
- Fallback mode status (SMS/IVR active when network down)
- Last successful sync timestamps

**Maps to Challenge Requirement:** "Offline and Low-Connectivity Support: Implement deferred data sync and fallback SMS/IVR modes for remote temple zones."

---

### 8. Zone Monitor
**Priority:** P1

**Purpose:** Granular per-zone operational visibility beyond the command center overview.

**Key Components:**
- Drill-down into 11 zones:
  1. Temple & Core Areas
  2. Darshan, Queue & Devotee Facilities
  3. Parking and Roads
  4. Choulties and Dormitory
  5. Sub-temples
  6. Boats and Tanks
  7. Counters
  8. Gosala
  9. Kesakandana Sala
  10. Annadanam
  11. Prasadam Preparation
- Zone-specific density trends
- Camera feeds for selected zone
- Zone-level alerts
- Historical comparison (same time yesterday/last week/last event)

**Supports:** Video Analytics (P0), Gate Management (P0)

---

### 9. Spatial Flow & Evacuation Planner
**Priority:** P1

**Purpose:** Crowd flow modeling and emergency preparedness using layout maps.

**Key Components:**
- Temple layout map with live crowd flow overlay
- Bottleneck identification (where crowd is stuck)
- Barricade placement simulation (drag-and-drop)
- Evacuation route visualization
- "What-if" scenario modeling (if South gate closes, show flow impact)
- Emergency exit accessibility status
- Integration with Master Plan layout data

**Maps to Challenge Requirement:** Supports "Dynamic Queue and Gate Management" with spatial intelligence

**Data Sources:** Master Plan / Layout maps, Geo-coordinates (16.9499°N, 81.2991°E)

---

### 10. Staff Deployment
**Priority:** P1

**Purpose:** Data-driven workforce allocation based on predicted crowd conditions.

**Key Components:**
- Current staff positions (from face attendance system)
- Staff categories: Security, temple staff, sanitation, volunteers
- Shift rosters and schedules
- Coverage gaps identification
- AI-recommended deployment based on:
  - Predicted crowd load (from Forecast)
  - Current zone density (from Video Analytics)
- Redeployment suggestions: "Move 3 security from Zone A to Zone B"
- Historical deployment effectiveness

**Data Sources:** Face attendance system, manual rosters

---

### 11. Incidents & Emergency
**Priority:** P1

**Purpose:** Incident management and emergency protocol coordination.

**Key Components:**
- Incident logging (type, location, time, severity)
- Incident categories: Queue delay, medical emergency, crowd surge, security issue
- Emergency protocol activation panel:
  - Fire
  - Medical emergency
  - Crowd surge / stampede prevention
  - Power failure
  - Natural calamities
- Protocol checklist tracking
- Response time logging
- Drill/mock drill scheduler and records
- AI-triggered early warning visibility (what triggered the alert)
- Post-incident report generation

**Data Sources:** Existing drill protocols, incident logs (no major incidents, occasional queue delays)

---

### 12. Devotee Feedback
**Priority:** P2

**Purpose:** Transform unused feedback data into actionable insights.

**Key Components:**
- Complaint categories (auto-classified using NLP)
- Sentiment analysis trends
- Recurring issue identification
- Feedback sources: Complaint registers, phone records, audio feedback, video feedback
- Action tracking on complaints
- Response time metrics
- Feedback volume trends

**Data Sources:** 1 year of audio/video feedback, complaint registers, phone records

---

### 13. Analytics & Reports
**Priority:** P2

**Purpose:** Historical analysis and KPI tracking for continuous improvement.

**Key Components:**
- Historical footfall trends (5-year view)
- Event-wise performance comparison
- Operational KPIs:
  - Average wait time (before/after AI recommendations)
  - Incident frequency
  - Alert response times
  - Chatbot accuracy trends
  - Prediction accuracy trends
- Exportable reports (PDF, Excel)
- Custom date range selection
- Comparison mode (this Ekadasi vs last Ekadasi)

---

### 14. Amenities Management
**Priority:** P2

**Purpose:** Manage facility information that feeds into devotee communication.

**Key Components:**
- Facility status management (open/closed/under maintenance):
  - Drinking water points
  - Toilets/washrooms
  - Prasadam counters
  - Annadanam halls
  - Waiting halls/shelters
  - Medical/first aid
  - Wheelchair & elderly support
- Utilization metrics per amenity
- Maintenance scheduling
- Capacity information
- Location mapping for chatbot integration

---

### 15. Parking Monitor
**Priority:** P2

**Purpose:** Real-time parking availability management.

**Key Components:**
- Live parking slot availability per zone
- Vehicle count (entry/exit via CCTV)
- Occupancy percentage per lot
- Redirect recommendations when lots full
- Historical parking patterns
- Peak parking hours identification

**Note:** Not explicitly required in challenge.json but supported by existing CCTV infrastructure in parking zones.

---

### 16. Settings
**Priority:** P3

**Purpose:** System configuration and administration.

**Key Components:**
- Alert thresholds per zone (density %, wait time minutes)
- User role management (admin, viewer, operator)
- Camera-to-zone mapping configuration
- Integration settings:
  - HikCentral API
  - PA system
  - SMS gateway
  - WhatsApp Business API
- Language preferences
- Notification preferences
- Data retention policies

---

## Development Phasing Summary

| Phase | Pages | Objective |
|-------|-------|-----------|
| **Phase 1 (POC Core)** | 1, 2, 3, 4, 5, 6, 7 | Meet all POC success criteria; demonstrate core AI capabilities |
| **Phase 2 (POC Complete)** | 8, 9, 10, 11 | Operational completeness for pilot run |
| **Phase 3 (Post-POC)** | 12, 13, 14, 15 | Enhancements based on pilot feedback |
| **Phase 4 (Scale)** | 16 | Multi-temple deployment readiness |

---

## POC Success Criteria Mapping

| Criteria | Measured Via |
|----------|--------------|
| ≥80% accuracy in real-time crowd density estimation and congestion detection | Page 2: Video Analytics & Anomaly Detection |
| ≥80% accuracy in peak-hour prediction using historical data | Page 3: Crowd Forecast |
| ≥80% accuracy in multilingual chatbot/voice assistant responses | Page 6: Chatbot & Devotee Communication Monitor |

---

## Data Compliance Note

Per challenge.json requirements, all pages handling video, images, or devotee interaction data must:
- Comply with Digital Personal Data Protection (DPDP) Act, 2023
- Anonymize images and video data
- Store data within state-approved servers
- Follow explicit consent protocols for analytics and reporting
