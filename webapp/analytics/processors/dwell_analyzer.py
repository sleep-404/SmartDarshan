"""Dwell time analysis for crowd tracking."""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import time
import numpy as np


@dataclass
class DwellZone:
    """A zone for measuring dwell time."""
    zone_id: str
    name: str
    # Polygon defined as list of (x, y) points (normalized 0-1)
    polygon: List[Tuple[float, float]]
    # Expected dwell time for this zone type
    expected_dwell_seconds: float = 60.0


@dataclass
class DwellRecord:
    """Record of a person's dwell time in a zone."""
    track_id: str
    zone_id: str
    entry_time: float
    exit_time: Optional[float] = None
    dwell_seconds: float = 0.0
    is_active: bool = True


class DwellTimeAnalyzer:
    """
    Analyzes how long people spend in different zones.

    Key metrics:
    - Average dwell time per zone
    - Current occupancy per zone
    - Anomalous dwell times (too long = potential issue)
    """

    def __init__(self):
        self.zones: Dict[str, DwellZone] = {}
        self.active_dwells: Dict[str, Dict[str, DwellRecord]] = defaultdict(dict)  # zone_id -> {track_id: record}
        self.completed_dwells: List[DwellRecord] = []
        self.track_positions: Dict[str, Tuple[float, float]] = {}

        # Initialize default temple zones
        self._init_default_zones()

    def _init_default_zones(self):
        """Initialize default zones for temple monitoring."""
        # Darshan zone - where devotees view deity
        self.add_zone(DwellZone(
            zone_id="darshan_zone",
            name="Darshan Area",
            polygon=[(0.3, 0.2), (0.7, 0.2), (0.7, 0.5), (0.3, 0.5)],
            expected_dwell_seconds=30.0
        ))

        # Queue waiting area
        self.add_zone(DwellZone(
            zone_id="queue_area",
            name="Queue Area",
            polygon=[(0.1, 0.5), (0.9, 0.5), (0.9, 0.9), (0.1, 0.9)],
            expected_dwell_seconds=300.0  # 5 minutes expected wait
        ))

        # Entry/exit zone
        self.add_zone(DwellZone(
            zone_id="entry_zone",
            name="Entry Area",
            polygon=[(0.0, 0.8), (0.3, 0.8), (0.3, 1.0), (0.0, 1.0)],
            expected_dwell_seconds=15.0
        ))

    def add_zone(self, zone: DwellZone):
        """Add a dwell time zone."""
        self.zones[zone.zone_id] = zone
        self.active_dwells[zone.zone_id] = {}

    def remove_zone(self, zone_id: str):
        """Remove a zone."""
        if zone_id in self.zones:
            del self.zones[zone_id]
            if zone_id in self.active_dwells:
                del self.active_dwells[zone_id]

    def _point_in_polygon(self, x: float, y: float, polygon: List[Tuple[float, float]]) -> bool:
        """Check if point is inside polygon using ray casting."""
        n = len(polygon)
        inside = False

        j = n - 1
        for i in range(n):
            xi, yi = polygon[i]
            xj, yj = polygon[j]

            if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
                inside = not inside
            j = i

        return inside

    def _get_zones_for_point(self, x: float, y: float) -> List[str]:
        """Get all zones that contain the given point."""
        zones = []
        for zone_id, zone in self.zones.items():
            if self._point_in_polygon(x, y, zone.polygon):
                zones.append(zone_id)
        return zones

    def update(self, tracked_objects: List[Dict]) -> Dict:
        """
        Update dwell time tracking with new positions.

        Args:
            tracked_objects: List of tracked objects with 'id', 'x', 'y' fields

        Returns:
            Dict with dwell time analysis results
        """
        current_time = time.time()
        current_track_ids = set()
        zone_updates = defaultdict(list)

        for obj in tracked_objects:
            track_id = obj.get('id', str(obj.get('track_id', '')))
            x = obj.get('x', 0)
            y = obj.get('y', 0)

            # Normalize coordinates
            if x > 1 or y > 1:
                x = x / 100.0
                y = y / 100.0

            current_track_ids.add(track_id)
            self.track_positions[track_id] = (x, y)

            # Check which zones this track is in
            current_zones = set(self._get_zones_for_point(x, y))

            # For each zone, update dwell records
            for zone_id in self.zones:
                is_in_zone = zone_id in current_zones
                has_active_dwell = track_id in self.active_dwells[zone_id]

                if is_in_zone and not has_active_dwell:
                    # Person entered zone
                    record = DwellRecord(
                        track_id=track_id,
                        zone_id=zone_id,
                        entry_time=current_time
                    )
                    self.active_dwells[zone_id][track_id] = record
                    zone_updates[zone_id].append({
                        "event": "entry",
                        "track_id": track_id
                    })

                elif not is_in_zone and has_active_dwell:
                    # Person exited zone
                    record = self.active_dwells[zone_id][track_id]
                    record.exit_time = current_time
                    record.dwell_seconds = current_time - record.entry_time
                    record.is_active = False
                    self.completed_dwells.append(record)
                    del self.active_dwells[zone_id][track_id]
                    zone_updates[zone_id].append({
                        "event": "exit",
                        "track_id": track_id,
                        "dwell_seconds": round(record.dwell_seconds, 1)
                    })

        # Handle tracks that disappeared (consider them as exited)
        for zone_id in self.zones:
            tracks_to_remove = []
            for track_id, record in self.active_dwells[zone_id].items():
                if track_id not in current_track_ids:
                    # Track disappeared, mark as exited
                    record.exit_time = current_time
                    record.dwell_seconds = current_time - record.entry_time
                    record.is_active = False
                    self.completed_dwells.append(record)
                    tracks_to_remove.append(track_id)

            for track_id in tracks_to_remove:
                del self.active_dwells[zone_id][track_id]

        # Keep only recent completed dwells (last 1000)
        if len(self.completed_dwells) > 1000:
            self.completed_dwells = self.completed_dwells[-1000:]

        return self.get_summary()

    def get_summary(self) -> Dict:
        """Get current dwell time summary."""
        current_time = time.time()
        zone_stats = {}

        for zone_id, zone in self.zones.items():
            active_records = self.active_dwells[zone_id]
            completed_zone = [r for r in self.completed_dwells if r.zone_id == zone_id]

            # Current occupancy
            occupancy = len(active_records)

            # Active dwell times
            active_dwell_times = []
            anomalous_dwells = []
            for record in active_records.values():
                dwell = current_time - record.entry_time
                active_dwell_times.append(dwell)
                if dwell > zone.expected_dwell_seconds * 2:
                    anomalous_dwells.append({
                        "track_id": record.track_id,
                        "dwell_seconds": round(dwell, 1),
                        "expected_seconds": zone.expected_dwell_seconds
                    })

            # Calculate averages from completed dwells
            if completed_zone:
                recent_completed = completed_zone[-50:]  # Last 50
                avg_dwell = sum(r.dwell_seconds for r in recent_completed) / len(recent_completed)
                min_dwell = min(r.dwell_seconds for r in recent_completed)
                max_dwell = max(r.dwell_seconds for r in recent_completed)
            else:
                avg_dwell = sum(active_dwell_times) / len(active_dwell_times) if active_dwell_times else 0
                min_dwell = min(active_dwell_times) if active_dwell_times else 0
                max_dwell = max(active_dwell_times) if active_dwell_times else 0

            zone_stats[zone_id] = {
                "zone_name": zone.name,
                "occupancy": occupancy,
                "average_dwell_seconds": round(avg_dwell, 1),
                "min_dwell_seconds": round(min_dwell, 1),
                "max_dwell_seconds": round(max_dwell, 1),
                "expected_dwell_seconds": zone.expected_dwell_seconds,
                "anomalous_count": len(anomalous_dwells),
                "anomalous_dwells": anomalous_dwells[:5],  # Top 5 anomalies
                "total_completed": len(completed_zone)
            }

        return {
            "zones": zone_stats,
            "total_active_tracks": sum(len(self.active_dwells[z]) for z in self.zones),
            "total_completed_dwells": len(self.completed_dwells),
            "timestamp": current_time
        }

    def get_zone_occupancy_history(self, zone_id: str, window_seconds: float = 300.0) -> List[Dict]:
        """Get occupancy history for a zone (approximated from completed dwells)."""
        if zone_id not in self.zones:
            return []

        current_time = time.time()
        cutoff_time = current_time - window_seconds

        # Sample at 10-second intervals
        samples = []
        sample_interval = 10.0
        t = cutoff_time

        while t <= current_time:
            # Count how many dwells were active at time t
            count = 0
            for record in self.completed_dwells:
                if record.zone_id == zone_id:
                    if record.entry_time <= t and (record.exit_time is None or record.exit_time >= t):
                        count += 1

            # Also count currently active
            for record in self.active_dwells[zone_id].values():
                if record.entry_time <= t:
                    count += 1

            samples.append({
                "timestamp": t,
                "relative_seconds": round(t - cutoff_time, 0),
                "occupancy": count
            })
            t += sample_interval

        return samples

    def get_anomalous_dwells(self) -> List[Dict]:
        """Get all current anomalous dwell situations."""
        current_time = time.time()
        anomalies = []

        for zone_id, zone in self.zones.items():
            for record in self.active_dwells[zone_id].values():
                dwell = current_time - record.entry_time
                if dwell > zone.expected_dwell_seconds * 1.5:
                    severity = "moderate" if dwell < zone.expected_dwell_seconds * 2 else "high"
                    anomalies.append({
                        "track_id": record.track_id,
                        "zone_id": zone_id,
                        "zone_name": zone.name,
                        "dwell_seconds": round(dwell, 1),
                        "expected_seconds": zone.expected_dwell_seconds,
                        "excess_ratio": round(dwell / zone.expected_dwell_seconds, 2),
                        "severity": severity
                    })

        return sorted(anomalies, key=lambda x: x["excess_ratio"], reverse=True)

    def reset(self, zone_id: str = None):
        """Reset dwell tracking for a zone or all zones."""
        if zone_id:
            if zone_id in self.active_dwells:
                self.active_dwells[zone_id].clear()
            self.completed_dwells = [r for r in self.completed_dwells if r.zone_id != zone_id]
        else:
            for z in self.zones:
                self.active_dwells[z].clear()
            self.completed_dwells.clear()
            self.track_positions.clear()
