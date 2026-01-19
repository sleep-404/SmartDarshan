# Dashboard Redesign Specification

## Context

This is a **Devotee Feedback Analysis Dashboard** for a Hindu temple (Dwarakatirumala). It displays AI-analyzed feedback extracted from video interviews with devotees. The feedback is in Telugu (translated to English) and categorized into complaints, grievances, and suggestions with severity levels.

**Primary Users**: Temple administrators, governance officials
**Goal**: Quickly understand devotee pain points and take action

---

## Data Structure

### Feedback Items (19 total)
Each item contains:
```json
{
  "timestamp": "00:36",
  "category": "complaint | grievance | suggestion",
  "topic": "Queue Management | Facilities | Staff Behavior | etc.",
  "severity": "critical | high | medium | low",
  "original_telugu": "Telugu text...",
  "translation": "English translation...",
  "speaker": "devotee"
}
```

### Summary Data
- **Complaints**: 11
- **Grievances**: 6
- **Suggestions**: 2
- **Overall Sentiment**: "extremely_negative"
- **4 Priority Issues** with recommendations

### Metadata
- Video Duration: 3:12
- Language: Telugu
- Location: Dwaraka Tirumala (Chinna Tirupati)
- Event: Mukkoti Ekadasi

---

## Required Features

### Must Have
1. Video player with playback controls
2. Display all 19 feedback items with full details
3. Category counts (complaints/grievances/suggestions)
4. Severity indicators for each item
5. Priority issues with action recommendations
6. Click feedback item → jump to video timestamp
7. Video timeline shows markers where issues occur
8. Real-time sync: playing video highlights current issue
9. Filter by category

### Nice to Have
- Search within feedback text
- Filter by topic
- Filter by severity
- Export/share functionality
- Keyboard shortcuts

---

## Creative Visualization Ideas

### 1. Sentiment & Category Overview

**Current**: 4 flat stat cards with numbers

**Alternative Ideas**:

| Idea | Description |
|------|-------------|
| **Emotion Gauge** | Semi-circular gauge showing sentiment from green (positive) to red (negative), needle pointing to current state |
| **Stacked Bar** | Horizontal bar showing proportion of complaints (red) / grievances (orange) / suggestions (green) |
| **Radial Progress** | Three concentric rings showing each category count as progress toward a threshold |
| **Icon Grid** | Grid of small human icons, colored by category—shows scale of affected devotees |
| **Bubble Chart** | Three bubbles sized by count, positioned along a sentiment axis |
| **Donut Chart** | Category distribution with total in center, hover reveals details |
| **Traffic Light** | Three large circles (red/amber/green) with counts, overall status indicator |

---

### 2. Severity Representation

**Current**: Small colored dots (8px)

**Alternative Ideas**:

| Idea | Description |
|------|-------------|
| **Flame Intensity** | Flame icon with varying heights/colors: critical = tall red flame, low = small blue flame |
| **Alert Badges** | Full-width colored banner at top of each card based on severity |
| **Pulsing Glow** | Critical items have animated red glow/pulse effect |
| **Size Variation** | Critical issues have larger cards, low severity has compact cards |
| **Border Intensity** | Thicker, more saturated borders for higher severity |
| **Icon Severity** | 🔴🟠🟡🟢 or ⚠️⚡🔔💡 icon progression |
| **Heat Gradient** | Card background gradient from red (critical) to cool blue (low) |

---

### 3. Timeline & Video Sync

**Current**: Dots on a progress bar, sidebar list

**Alternative Ideas**:

| Idea | Description |
|------|-------------|
| **Horizontal Swimlanes** | Three horizontal lanes (one per category) with issues as blocks positioned by timestamp |
| **Waveform Overlay** | Audio waveform with colored regions showing where issues occur |
| **Vertical Timeline** | Video on left, vertical timeline on right with cards emerging at correct positions |
| **Filmstrip View** | Thumbnail strip below video with issue markers as pins |
| **Arc Timeline** | Semicircular timeline around the video, issues as nodes on the arc |
| **Chapter Markers** | Video divided into chapters, each chapter shows issue density |
| **Floating Cards** | Issues appear as floating cards that animate in/out as video plays |
| **Picture-in-Picture Issues** | Small overlay card appears on video when issue timestamp is reached |

---

### 4. Priority Issues Display

**Current**: Stacked cards with text

**Alternative Ideas**:

| Idea | Description |
|------|-------------|
| **Kanban Board** | Columns for "Immediate", "Today", "This Week" with draggable issue cards |
| **Alert Banner** | Fixed top banner cycling through critical issues with dismiss/acknowledge |
| **Numbered Cards** | Large #1, #2, #3, #4 with issue as supporting text |
| **Icon + Metric** | Each priority has an icon (🚰 water, 🚻 restroom) with key metric ("mentioned 5 times") |
| **Action Checklist** | Toggle-able checklist format with recommendation as actionable task |
| **Split Cards** | Left side = problem, right side = recommended action, visually distinct |
| **Severity Rings** | Concentric rings with critical in center, radiating outward |

---

### 5. Topic Clustering

**Current**: Topics shown as small labels on each card

**Alternative Ideas**:

| Idea | Description |
|------|-------------|
| **Topic Pills** | Horizontal filter bar with topic pills, click to filter |
| **Grouped Sections** | Accordion sections by topic: "Queue Management (6)", "Facilities (4)", etc. |
| **Word Cloud** | Topics sized by frequency, clickable to filter |
| **Topic Cards** | Grid of topic cards with count badge, expand to see related issues |
| **Treemap** | Rectangles sized by issue count per topic |
| **Radial Menu** | Topics arranged in a circle, click to focus on that topic |
| **Tag Cloud with Icons** | Each topic has an icon: 🚶 Queue, 🚰 Water, 👔 Staff, etc. |

---

### 6. Bilingual Text Display (Telugu + English)

**Current**: Stacked with Telugu in italics below English

**Alternative Ideas**:

| Idea | Description |
|------|-------------|
| **Tab Toggle** | Toggle button to switch between English/Telugu view globally |
| **Side-by-Side** | Two columns within each card: Telugu left, English right |
| **Hover Reveal** | Show English by default, hover to reveal Telugu in tooltip |
| **Expandable Quote** | English summary visible, click to expand full quote with Telugu |
| **Quote Block** | Styled as a speech bubble or quotation with speaker attribution |
| **Audio Button** | Small play button to hear the original Telugu audio snippet |

---

### 7. Video Player Enhancements

**Current**: Basic HTML5 video with custom progress bar

**Alternative Ideas**:

| Idea | Description |
|------|-------------|
| **Annotated Video** | Subtitles/captions appear on video, highlighted when issue is discussed |
| **Split Screen** | Video on one side, current issue detail on other side |
| **Theater Mode** | Full-width video with issues as overlay sidebar |
| **Thumbnail Scrubber** | Hover on timeline shows thumbnail preview |
| **Speed Controls** | 0.5x, 1x, 1.5x, 2x playback speed |
| **Skip to Next Issue** | Previous/Next issue navigation buttons |
| **Loop Issue** | Button to loop the 10-second clip around an issue |
| **Transcript View** | Scrolling transcript synced with video, issues highlighted inline |

---

### 8. Overall Layout Options

#### Option A: Video Hero (Immersive Review)
```
┌──────────────────────────────────────────────────────────────┐
│  Header: Temple Name | Event | Date              [Export]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │                    LARGE VIDEO PLAYER                  │  │
│  │                    (60% of viewport)                   │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ Current Issue Overlay (appears during playback) │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┬──────────┬──────────┐    ┌──────────────────┐  │
│  │ 11       │ 6        │ 2        │    │ Sentiment Gauge  │  │
│  │Complaints│Grievances│Suggestions│   │ ◐ Very Negative  │  │
│  └──────────┴──────────┴──────────┘    └──────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ← ● ─────────●────●──●●●─────●●────●───────●──── →     │  │
│  │   Issue Timeline (horizontal, scrollable)              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### Option B: Dashboard Grid (Analytics Focus)
```
┌──────────────────────────────────────────────────────────────┐
│  Header                                                      │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Complaints│ │Grievances│ │Suggestions│ │ Sentiment Gauge │ │
│  │    11    │ │    6     │ │    2      │ │    ◐ Negative   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────┬────────────────────────────────┤
│                             │                                │
│  ┌───────────────────────┐  │  ┌──────────────────────────┐  │
│  │     VIDEO PLAYER      │  │  │    PRIORITY ACTIONS      │  │
│  │                       │  │  │    ┌──────────────────┐  │  │
│  │                       │  │  │    │ #1 Water Crisis  │  │  │
│  └───────────────────────┘  │  │    │ #2 Restrooms     │  │  │
│  Current: [Issue Banner]    │  │    │ #3 Queue Mgmt    │  │  │
│                             │  │    │ #4 VIP Bias      │  │  │
│  ┌───────────────────────┐  │  │    └──────────────────┘  │  │
│  │   TOPIC BREAKDOWN     │  │  └──────────────────────────┘  │
│  │   [Pie/Bar Chart]     │  │                                │
│  └───────────────────────┘  │  ┌──────────────────────────┐  │
│                             │  │    ALL ISSUES LIST       │  │
│                             │  │    (scrollable)          │  │
│                             │  └──────────────────────────┘  │
└─────────────────────────────┴────────────────────────────────┘
```

#### Option C: Timeline Focus (Investigation Mode)
```
┌──────────────────────────────────────────────────────────────┐
│  Header + Stats Bar (compact)                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  00:00          01:00          02:00          03:00    TIME  │
│  ├──────────────┼──────────────┼──────────────┼──────►       │
│  │              │              │              │              │
│  │ ┌──┐ ┌──┐    │  ┌──┐ ┌──┐   │ ┌──┐ ┌──┐    │              │
│  │ │  │ │  │    │  │  │ │  │   │ │  │ │  │    │  COMPLAINTS  │
│  │ └──┘ └──┘    │  └──┘ └──┘   │ └──┘ └──┘    │              │
│  │              │              │              │              │
│  │    ┌──┐      │     ┌──┐     │    ┌──┐      │  GRIEVANCES  │
│  │    └──┘      │     └──┘     │    └──┘      │              │
│  │              │              │              │              │
│  │              │              │      ┌──┐    │  SUGGESTIONS │
│  │              │              │      └──┘    │              │
│  ├──────────────┴──────────────┴──────────────┴──────────────┤
│                                                              │
│  ┌─────────────────────────┐  ┌────────────────────────────┐ │
│  │      VIDEO PLAYER       │  │     SELECTED ISSUE         │ │
│  │                         │  │     Full details here      │ │
│  └─────────────────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

#### Option D: Conversation View (Chat-like)
```
┌──────────────────────────────────────────────────────────────┐
│  Header + Summary Stats                                      │
├───────────────────────────────────┬──────────────────────────┤
│                                   │                          │
│  ┌─────────────────────────────┐  │  ┌────────────────────┐  │
│  │      VIDEO PLAYER           │  │  │ 00:36 ●            │  │
│  │                             │  │  │ "We paid 500..."   │  │
│  │                             │  │  │ [Complaint] Queue  │  │
│  └─────────────────────────────┘  │  └────────────────────┘  │
│                                   │           │              │
│  Priority Actions:                │           ▼              │
│  ┌─────────────────────────────┐  │  ┌────────────────────┐  │
│  │ 🚨 Water | 🚻 Restrooms     │  │  │ 00:44 ●            │  │
│  │ 🚶 Queues | 👔 VIP Bias     │  │  │ "Maintenance..."   │  │
│  └─────────────────────────────┘  │  │ [Grievance] Maint  │  │
│                                   │  └────────────────────┘  │
│                                   │           │              │
│                                   │           ▼              │
│                                   │  ┌────────────────────┐  │
│                                   │  │ 00:49 ●            │  │
│                                   │  │ "Maintenance..."   │  │
│                                   │  └────────────────────┘  │
│                                   │           │              │
│                                   │          ...             │
└───────────────────────────────────┴──────────────────────────┘
```

---

## Color Palette Suggestions

### Option 1: Temple Theme (Warm & Traditional)
- Primary: Deep Saffron `#FF6B00`
- Secondary: Temple Gold `#D4AF37`
- Background: Deep Maroon `#2D1B1B`
- Surface: Warm Gray `#3D2E2E`
- Complaint: Vermillion `#E34234`
- Grievance: Amber `#FFBF00`
- Suggestion: Temple Green `#228B22`

### Option 2: Modern Dark (Current, Enhanced)
- Primary: Electric Blue `#3B82F6`
- Secondary: Purple `#8B5CF6`
- Background: Navy `#0F172A`
- Surface: Slate `#1E293B`
- Complaint: Red `#EF4444`
- Grievance: Orange `#F97316`
- Suggestion: Green `#22C55E`

### Option 3: Clean Light Mode
- Primary: Deep Blue `#1E40AF`
- Secondary: Indigo `#4F46E5`
- Background: Off-white `#F8FAFC`
- Surface: White `#FFFFFF`
- Complaint: Rose `#E11D48`
- Grievance: Amber `#D97706`
- Suggestion: Emerald `#059669`

---

## Micro-interactions & Animations

| Interaction | Animation |
|-------------|-----------|
| Card hover | Lift with shadow, subtle scale (1.02) |
| Category filter click | Other cards fade out (opacity 0.3) |
| Active issue (during playback) | Pulsing glow, border animation |
| Seek to timestamp | Card slides into view, brief highlight |
| Severity indicator | Critical items have subtle pulse |
| Page load | Staggered card entrance animation |
| Stats counter | Count-up animation on load |
| Progress bar | Smooth fill with gradient |

---

## Typography Suggestions

| Element | Suggestion |
|---------|------------|
| Headings | Inter, Poppins, or DM Sans (bold, clean) |
| Body text | System UI or Inter (highly readable) |
| Timestamps | JetBrains Mono or Fira Code (monospace) |
| Telugu text | Noto Sans Telugu (Google Fonts) |
| Numbers/Stats | Tabular figures, bold weight |

---

## Responsive Considerations

- **Desktop (1200px+)**: Full two-column layout with video
- **Tablet (768-1199px)**: Stack video above timeline, collapsible sidebar
- **Mobile (< 768px)**: Single column, video fixed at top, swipeable issue cards

---

## Sample JSON Data for Prototyping

```json
{
  "event": "Mukkoti Ekadasi",
  "location": "Dwaraka Tirumala",
  "date": "2026-01-18",
  "video_duration": "03:12",
  "summary": {
    "total_complaints": 11,
    "total_grievances": 6,
    "total_suggestions": 2,
    "overall_sentiment": "extremely_negative",
    "top_topics": ["Queue Management", "Facilities", "Staff Behavior", "Amenities"]
  },
  "priority_issues": [
    { "issue": "Lack of Drinking Water", "severity": "critical", "mentions": 5 },
    { "issue": "No Restrooms for Elderly", "severity": "critical", "mentions": 2 },
    { "issue": "4-Hour Queue Delays", "severity": "high", "mentions": 6 },
    { "issue": "VIP Preferential Treatment", "severity": "high", "mentions": 1 }
  ],
  "items": [
    {
      "timestamp": "00:36",
      "category": "complaint",
      "topic": "Queue Management",
      "severity": "high",
      "original_telugu": "Memu 500 ticket teesukunnam andi...",
      "translation": "We bought the 500 rupees ticket. It took us 2 hours."
    }
  ]
}
```

---

## Key Design Principles

1. **Hierarchy**: Most critical issues should visually dominate
2. **Scannability**: Administrators should grasp the situation in 5 seconds
3. **Actionability**: Clear next steps for each priority issue
4. **Context**: Always show video context for any issue
5. **Accessibility**: High contrast, clear labels, keyboard navigable
6. **Performance**: Smooth 60fps animations, fast video loading

---

## Prompt for Design Tools

> Design a modern, visually rich dashboard for analyzing devotee feedback at a Hindu temple. The dashboard displays AI-analyzed video interviews categorized into complaints (red), grievances (orange), and suggestions (green) with severity levels (critical/high/medium/low). Key features: video player synced with an issue timeline, category filtering, priority action items, and bilingual display (Telugu + English). Use a dark theme with temple-inspired accents. Focus on making severity visually prominent, enabling quick scanning of critical issues, and providing satisfying micro-interactions. The layout should prioritize the video and real-time issue highlighting while keeping summary stats and priority actions visible.

