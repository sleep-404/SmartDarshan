"""Anomaly and fall detection for crowd safety monitoring."""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict
import time
import math


@dataclass
class AnomalyEvent:
    """Represents an anomaly detection event."""
    event_id: str
    event_type: str  # 'fall', 'sudden_stop', 'unusual_position', 'crowd_surge', 'stationary_person'
    timestamp: float
    position: Tuple[float, float]
    track_id: Optional[str] = None
    confidence: float = 0.0
    severity: str = "low"  # 'low', 'medium', 'high', 'critical'
    details: Dict = None

    def __post_init__(self):
        if self.details is None:
            self.details = {}


class AnomalyDetector:
    """
    Detects anomalies in crowd behavior for safety monitoring.

    Anomaly types detected:
    1. Fall detection - person suddenly on ground or aspect ratio change
    2. Sudden stops - person stops moving abruptly in moving crowd
    3. Unusual positions - person lying down or in distress
    4. Crowd surge - sudden increase in movement speed
    5. Stationary person - someone not moving when everyone else is
    """

    def __init__(self):
        self.track_history: Dict[str, List[Dict]] = defaultdict(list)
        self.anomaly_events: List[AnomalyEvent] = []
        self.event_counter = 0

        # Detection parameters
        self.fall_aspect_ratio_threshold = 1.0  # Width > Height suggests fall
        self.sudden_stop_velocity_threshold = 0.005  # Minimum movement to not be "stopped"
        self.sudden_stop_window = 5  # Frames to check for sudden stop
        self.stationary_threshold = 0.002  # Movement threshold for stationary detection
        self.stationary_frames = 30  # Frames to be stationary to trigger
        self.surge_velocity_multiplier = 2.5  # How much faster than average to trigger surge

        # Global metrics
        self.average_crowd_velocity = 0.0
        self.velocity_history: List[float] = []

    def _generate_event_id(self) -> str:
        """Generate unique event ID."""
        self.event_counter += 1
        return f"ANM{self.event_counter:05d}"

    def _calculate_velocity(self, pos1: Tuple[float, float], pos2: Tuple[float, float], dt: float) -> float:
        """Calculate velocity between two positions."""
        if dt <= 0:
            return 0.0
        dx = pos2[0] - pos1[0]
        dy = pos2[1] - pos1[1]
        return math.sqrt(dx ** 2 + dy ** 2) / dt

    def _calculate_aspect_ratio(self, detection: Dict) -> float:
        """Calculate aspect ratio from detection bounding box."""
        width = detection.get('width', 1)
        height = detection.get('height', 1)
        if height == 0:
            return 0
        return width / height

    def _check_fall_detection(self, track_id: str, current: Dict, history: List[Dict]) -> Optional[AnomalyEvent]:
        """
        Check for potential fall based on:
        - Sudden change in aspect ratio (person goes horizontal)
        - Sudden drop in y-position (falling motion)
        - Reduction in bounding box height
        """
        if len(history) < 5:
            return None

        current_aspect = self._calculate_aspect_ratio(current)
        current_height = current.get('height', 0)
        current_y = current.get('y', 0)

        # Get average from recent history
        recent = history[-10:]
        avg_aspect = sum(self._calculate_aspect_ratio(h) for h in recent) / len(recent)
        avg_height = sum(h.get('height', 0) for h in recent) / len(recent)
        avg_y = sum(h.get('y', 0) for h in recent) / len(recent)

        # Check for fall indicators
        fall_indicators = 0
        details = {}

        # Aspect ratio change (person becomes horizontal)
        if current_aspect > avg_aspect * 1.5 and current_aspect > self.fall_aspect_ratio_threshold:
            fall_indicators += 2
            details['aspect_change'] = f"{avg_aspect:.2f} -> {current_aspect:.2f}"

        # Height reduction (person falls)
        if current_height < avg_height * 0.6 and avg_height > 0:
            fall_indicators += 2
            details['height_reduction'] = f"{avg_height:.1f} -> {current_height:.1f}"

        # Sudden downward movement
        if current_y > avg_y * 1.2 and current_y > 0:
            fall_indicators += 1
            details['downward_motion'] = True

        if fall_indicators >= 3:
            confidence = min(fall_indicators / 5.0, 1.0)
            severity = "critical" if confidence > 0.8 else "high" if confidence > 0.6 else "medium"

            return AnomalyEvent(
                event_id=self._generate_event_id(),
                event_type="fall",
                timestamp=time.time(),
                position=(current.get('x', 0), current.get('y', 0)),
                track_id=track_id,
                confidence=confidence,
                severity=severity,
                details=details
            )

        return None

    def _check_sudden_stop(self, track_id: str, current: Dict, history: List[Dict]) -> Optional[AnomalyEvent]:
        """Check for sudden stop in a moving crowd."""
        if len(history) < self.sudden_stop_window + 5:
            return None

        current_time = current.get('timestamp', time.time())
        current_pos = (current.get('x', 0), current.get('y', 0))

        # Calculate recent velocity
        recent = history[-3:]
        if not recent:
            return None

        recent_pos = (recent[-1].get('x', 0), recent[-1].get('y', 0))
        recent_time = recent[-1].get('timestamp', current_time - 0.1)
        dt = current_time - recent_time
        current_velocity = self._calculate_velocity(recent_pos, current_pos, dt) if dt > 0 else 0

        # Calculate previous velocity (before potential stop)
        older = history[-self.sudden_stop_window - 3:-self.sudden_stop_window]
        if len(older) >= 2:
            old_pos1 = (older[-2].get('x', 0), older[-2].get('y', 0))
            old_pos2 = (older[-1].get('x', 0), older[-1].get('y', 0))
            old_time_diff = older[-1].get('timestamp', 1) - older[-2].get('timestamp', 0)
            previous_velocity = self._calculate_velocity(old_pos1, old_pos2, old_time_diff) if old_time_diff > 0 else 0

            # Check for sudden stop: was moving, now stopped
            if (previous_velocity > self.sudden_stop_velocity_threshold * 3 and
                current_velocity < self.sudden_stop_velocity_threshold):

                # Only flag if crowd is moving (based on average velocity)
                if self.average_crowd_velocity > self.sudden_stop_velocity_threshold * 2:
                    return AnomalyEvent(
                        event_id=self._generate_event_id(),
                        event_type="sudden_stop",
                        timestamp=time.time(),
                        position=current_pos,
                        track_id=track_id,
                        confidence=0.7,
                        severity="medium",
                        details={
                            "previous_velocity": round(previous_velocity, 4),
                            "current_velocity": round(current_velocity, 4),
                            "crowd_velocity": round(self.average_crowd_velocity, 4)
                        }
                    )

        return None

    def _check_stationary_person(self, track_id: str, history: List[Dict]) -> Optional[AnomalyEvent]:
        """Check for person who has been stationary too long."""
        if len(history) < self.stationary_frames:
            return None

        recent = history[-self.stationary_frames:]

        # Calculate total movement over the window
        total_movement = 0.0
        for i in range(1, len(recent)):
            prev = recent[i - 1]
            curr = recent[i]
            dx = curr.get('x', 0) - prev.get('x', 0)
            dy = curr.get('y', 0) - prev.get('y', 0)
            total_movement += math.sqrt(dx ** 2 + dy ** 2)

        avg_movement = total_movement / len(recent)

        # If very little movement while crowd is moving
        if avg_movement < self.stationary_threshold and self.average_crowd_velocity > self.stationary_threshold * 3:
            latest = recent[-1]
            return AnomalyEvent(
                event_id=self._generate_event_id(),
                event_type="stationary_person",
                timestamp=time.time(),
                position=(latest.get('x', 0), latest.get('y', 0)),
                track_id=track_id,
                confidence=0.6,
                severity="low",
                details={
                    "stationary_frames": self.stationary_frames,
                    "avg_movement": round(avg_movement, 5),
                    "crowd_velocity": round(self.average_crowd_velocity, 4)
                }
            )

        return None

    def _check_crowd_surge(self, velocities: List[float]) -> Optional[AnomalyEvent]:
        """Check for sudden crowd surge (everyone moving fast)."""
        if not velocities or not self.velocity_history:
            return None

        current_avg = sum(velocities) / len(velocities)
        historical_avg = sum(self.velocity_history[-50:]) / len(self.velocity_history[-50:])

        if historical_avg > 0 and current_avg > historical_avg * self.surge_velocity_multiplier:
            return AnomalyEvent(
                event_id=self._generate_event_id(),
                event_type="crowd_surge",
                timestamp=time.time(),
                position=(0.5, 0.5),  # Center of frame
                track_id=None,
                confidence=min(current_avg / (historical_avg * 3), 1.0),
                severity="high",
                details={
                    "current_velocity": round(current_avg, 4),
                    "historical_velocity": round(historical_avg, 4),
                    "surge_ratio": round(current_avg / historical_avg, 2)
                }
            )

        return None

    def update(self, tracked_objects: List[Dict]) -> Dict:
        """
        Update anomaly detection with new tracked objects.

        Args:
            tracked_objects: List with 'id', 'x', 'y', 'width', 'height' fields

        Returns:
            Dict with anomaly detection results
        """
        current_time = time.time()
        new_anomalies = []
        frame_velocities = []

        for obj in tracked_objects:
            track_id = obj.get('id', str(obj.get('track_id', '')))
            x = obj.get('x', 0)
            y = obj.get('y', 0)

            # Normalize if needed
            if x > 1 or y > 1:
                x = x / 100.0
                y = y / 100.0

            # Create record with timestamp
            record = {
                'x': x,
                'y': y,
                'width': obj.get('width', 0),
                'height': obj.get('height', 0),
                'timestamp': current_time
            }

            history = self.track_history[track_id]

            # Calculate velocity for this track
            if history:
                prev = history[-1]
                dt = current_time - prev.get('timestamp', current_time - 0.1)
                if dt > 0:
                    velocity = self._calculate_velocity(
                        (prev['x'], prev['y']),
                        (x, y),
                        dt
                    )
                    frame_velocities.append(velocity)

            # Run anomaly checks
            fall = self._check_fall_detection(track_id, record, history)
            if fall:
                new_anomalies.append(fall)

            sudden_stop = self._check_sudden_stop(track_id, record, history)
            if sudden_stop:
                new_anomalies.append(sudden_stop)

            stationary = self._check_stationary_person(track_id, history)
            if stationary:
                # Only add if not already flagged recently
                recent_stationary = [e for e in self.anomaly_events
                                     if e.track_id == track_id and e.event_type == "stationary_person"
                                     and current_time - e.timestamp < 30]
                if not recent_stationary:
                    new_anomalies.append(stationary)

            # Update history
            self.track_history[track_id].append(record)
            if len(self.track_history[track_id]) > 100:
                self.track_history[track_id] = self.track_history[track_id][-100:]

        # Update average crowd velocity
        if frame_velocities:
            self.average_crowd_velocity = sum(frame_velocities) / len(frame_velocities)
            self.velocity_history.append(self.average_crowd_velocity)
            if len(self.velocity_history) > 200:
                self.velocity_history = self.velocity_history[-200:]

            # Check for crowd surge
            surge = self._check_crowd_surge(frame_velocities)
            if surge:
                # Only add if not recently flagged
                recent_surge = [e for e in self.anomaly_events
                                if e.event_type == "crowd_surge"
                                and current_time - e.timestamp < 60]
                if not recent_surge:
                    new_anomalies.append(surge)

        # Store new anomalies
        self.anomaly_events.extend(new_anomalies)

        # Keep only last 500 events
        if len(self.anomaly_events) > 500:
            self.anomaly_events = self.anomaly_events[-500:]

        return {
            "new_anomalies": [self._event_to_dict(e) for e in new_anomalies],
            "total_anomalies": len(self.anomaly_events),
            "average_crowd_velocity": round(self.average_crowd_velocity, 4),
            "active_tracks": len(self.track_history)
        }

    def _event_to_dict(self, event: AnomalyEvent) -> Dict:
        """Convert AnomalyEvent to dict."""
        return {
            "event_id": event.event_id,
            "event_type": event.event_type,
            "timestamp": event.timestamp,
            "position": {"x": round(event.position[0], 3), "y": round(event.position[1], 3)},
            "track_id": event.track_id,
            "confidence": round(event.confidence, 2),
            "severity": event.severity,
            "details": event.details
        }

    def get_active_anomalies(self, max_age_seconds: float = 300.0) -> List[Dict]:
        """Get recent anomalies within the time window."""
        current_time = time.time()
        cutoff = current_time - max_age_seconds

        recent = [e for e in self.anomaly_events if e.timestamp > cutoff]
        return [self._event_to_dict(e) for e in sorted(recent, key=lambda x: x.timestamp, reverse=True)]

    def get_anomaly_summary(self) -> Dict:
        """Get summary of all anomalies by type and severity."""
        type_counts = defaultdict(int)
        severity_counts = defaultdict(int)

        for event in self.anomaly_events:
            type_counts[event.event_type] += 1
            severity_counts[event.severity] += 1

        recent_critical = [
            self._event_to_dict(e) for e in self.anomaly_events
            if e.severity in ["critical", "high"]
        ][-10:]

        return {
            "total_events": len(self.anomaly_events),
            "by_type": dict(type_counts),
            "by_severity": dict(severity_counts),
            "recent_critical": recent_critical,
            "average_crowd_velocity": round(self.average_crowd_velocity, 4)
        }

    def reset(self):
        """Reset anomaly detection state."""
        self.track_history.clear()
        self.anomaly_events.clear()
        self.velocity_history.clear()
        self.average_crowd_velocity = 0.0
