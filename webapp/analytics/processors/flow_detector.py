"""Counter-flow and direction analysis for crowd movement."""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict
import numpy as np
import time
import math


@dataclass
class FlowVector:
    """Represents a movement flow vector."""
    x: float
    y: float
    magnitude: float
    angle: float  # In degrees, 0 = right, 90 = down


@dataclass
class CounterFlowEvent:
    """Represents a counter-flow detection event."""
    track_id: str
    timestamp: float
    position: Tuple[float, float]
    movement_angle: float
    dominant_flow_angle: float
    deviation_angle: float
    severity: str  # 'mild', 'moderate', 'severe'


class FlowAnalyzer:
    """
    Analyzes crowd flow patterns and detects counter-flow movements.

    Counter-flow: people moving against the dominant direction of the crowd,
    which can cause congestion and safety issues in temples.
    """

    def __init__(self, angle_threshold: float = 120.0):
        """
        Initialize flow analyzer.

        Args:
            angle_threshold: Minimum angle deviation (degrees) to consider counter-flow
        """
        self.angle_threshold = angle_threshold
        self.track_positions: Dict[str, List[Tuple[float, float, float]]] = defaultdict(list)
        self.flow_history: List[FlowVector] = []
        self.counter_flow_events: List[CounterFlowEvent] = []
        self.dominant_flow: Optional[FlowVector] = None

        # Heatmap for direction visualization
        self.direction_heatmap: Optional[np.ndarray] = None
        self.heatmap_size = (50, 50)  # Grid resolution

    def _calculate_angle(self, dx: float, dy: float) -> float:
        """Calculate angle in degrees from movement vector."""
        angle = math.degrees(math.atan2(dy, dx))
        return angle % 360

    def _angle_difference(self, angle1: float, angle2: float) -> float:
        """Calculate the smallest difference between two angles."""
        diff = abs(angle1 - angle2)
        return min(diff, 360 - diff)

    def _calculate_dominant_flow(self, recent_vectors: List[FlowVector]) -> Optional[FlowVector]:
        """Calculate the dominant flow direction from recent movement vectors."""
        if not recent_vectors:
            return None

        # Weight by magnitude (faster movements have more influence)
        total_weight = sum(v.magnitude for v in recent_vectors)
        if total_weight == 0:
            return None

        # Convert to x, y components and average
        avg_x = sum(v.x * v.magnitude for v in recent_vectors) / total_weight
        avg_y = sum(v.y * v.magnitude for v in recent_vectors) / total_weight

        magnitude = math.sqrt(avg_x ** 2 + avg_y ** 2)
        if magnitude > 0:
            angle = self._calculate_angle(avg_x, avg_y)
            return FlowVector(
                x=avg_x / magnitude,
                y=avg_y / magnitude,
                magnitude=magnitude,
                angle=angle
            )
        return None

    def update(self, tracked_objects: List[Dict]) -> Dict:
        """
        Update flow analysis with new tracked positions.

        Args:
            tracked_objects: List of tracked objects with 'id', 'x', 'y' fields

        Returns:
            Dict with flow analysis results
        """
        current_time = time.time()
        current_vectors: List[FlowVector] = []
        new_counter_flow: List[CounterFlowEvent] = []

        for obj in tracked_objects:
            track_id = obj.get('id', str(obj.get('track_id', '')))
            x = obj.get('x', 0)
            y = obj.get('y', 0)

            # Normalize coordinates
            if x > 1 or y > 1:
                x = x / 100.0
                y = y / 100.0

            prev_positions = self.track_positions[track_id]

            if prev_positions:
                prev_x, prev_y, prev_time = prev_positions[-1]
                dt = current_time - prev_time

                if dt > 0 and dt < 2.0:  # Ignore if too old
                    dx = x - prev_x
                    dy = y - prev_y
                    magnitude = math.sqrt(dx ** 2 + dy ** 2)

                    if magnitude > 0.005:  # Minimum movement threshold
                        angle = self._calculate_angle(dx, dy)
                        vector = FlowVector(
                            x=dx / magnitude,
                            y=dy / magnitude,
                            magnitude=magnitude,
                            angle=angle
                        )
                        current_vectors.append(vector)

                        # Update direction heatmap
                        self._update_heatmap(x, y, angle)

                        # Check for counter-flow
                        if self.dominant_flow:
                            deviation = self._angle_difference(angle, self.dominant_flow.angle)

                            if deviation > self.angle_threshold:
                                severity = self._classify_severity(deviation, magnitude)
                                event = CounterFlowEvent(
                                    track_id=track_id,
                                    timestamp=current_time,
                                    position=(x, y),
                                    movement_angle=angle,
                                    dominant_flow_angle=self.dominant_flow.angle,
                                    deviation_angle=deviation,
                                    severity=severity
                                )
                                self.counter_flow_events.append(event)
                                new_counter_flow.append(event)

            # Store position
            self.track_positions[track_id].append((x, y, current_time))

            # Keep only recent positions
            if len(self.track_positions[track_id]) > 20:
                self.track_positions[track_id] = self.track_positions[track_id][-20:]

        # Update flow history
        self.flow_history.extend(current_vectors)

        # Keep only last 100 vectors for dominant flow calculation
        if len(self.flow_history) > 100:
            self.flow_history = self.flow_history[-100:]

        # Update dominant flow
        self.dominant_flow = self._calculate_dominant_flow(self.flow_history[-50:])

        return {
            "dominant_flow": self._flow_to_dict(self.dominant_flow) if self.dominant_flow else None,
            "current_vectors_count": len(current_vectors),
            "counter_flow_detected": len(new_counter_flow) > 0,
            "counter_flow_events": [self._event_to_dict(e) for e in new_counter_flow],
            "total_counter_flow_count": len(self.counter_flow_events)
        }

    def _classify_severity(self, deviation: float, magnitude: float) -> str:
        """Classify counter-flow severity."""
        if deviation > 160 and magnitude > 0.02:
            return "severe"
        elif deviation > 140 or magnitude > 0.015:
            return "moderate"
        return "mild"

    def _update_heatmap(self, x: float, y: float, angle: float):
        """Update the direction heatmap."""
        if self.direction_heatmap is None:
            # Initialize with 4 channels: count, avg_angle_sin, avg_angle_cos, magnitude
            self.direction_heatmap = np.zeros((self.heatmap_size[0], self.heatmap_size[1], 4))

        # Map position to grid cell
        grid_x = min(int(x * self.heatmap_size[1]), self.heatmap_size[1] - 1)
        grid_y = min(int(y * self.heatmap_size[0]), self.heatmap_size[0] - 1)

        # Update cell with running average
        cell = self.direction_heatmap[grid_y, grid_x]
        count = cell[0] + 1
        angle_rad = math.radians(angle)

        # Running average of sin/cos for angle (avoids wraparound issues)
        cell[1] = (cell[1] * cell[0] + math.sin(angle_rad)) / count
        cell[2] = (cell[2] * cell[0] + math.cos(angle_rad)) / count
        cell[3] = (cell[3] * cell[0] + 1) / count  # Magnitude accumulator
        cell[0] = count

    def _flow_to_dict(self, flow: FlowVector) -> Dict:
        """Convert FlowVector to dict."""
        return {
            "x": round(flow.x, 3),
            "y": round(flow.y, 3),
            "magnitude": round(flow.magnitude, 4),
            "angle": round(flow.angle, 1),
            "direction": self._angle_to_direction(flow.angle)
        }

    def _angle_to_direction(self, angle: float) -> str:
        """Convert angle to compass direction."""
        directions = ["right", "down-right", "down", "down-left",
                      "left", "up-left", "up", "up-right"]
        idx = int((angle + 22.5) / 45) % 8
        return directions[idx]

    def _event_to_dict(self, event: CounterFlowEvent) -> Dict:
        """Convert CounterFlowEvent to dict."""
        return {
            "track_id": event.track_id,
            "timestamp": event.timestamp,
            "position": {"x": round(event.position[0], 3), "y": round(event.position[1], 3)},
            "movement_angle": round(event.movement_angle, 1),
            "dominant_flow_angle": round(event.dominant_flow_angle, 1),
            "deviation_angle": round(event.deviation_angle, 1),
            "severity": event.severity
        }

    def get_direction_heatmap(self) -> Dict:
        """Get the direction heatmap data for visualization."""
        if self.direction_heatmap is None:
            return {"grid": [], "size": self.heatmap_size}

        heatmap_data = []
        for y in range(self.heatmap_size[0]):
            row = []
            for x in range(self.heatmap_size[1]):
                cell = self.direction_heatmap[y, x]
                count = int(cell[0])
                if count > 0:
                    # Calculate average angle from sin/cos
                    avg_angle = math.degrees(math.atan2(cell[1], cell[2])) % 360
                    row.append({
                        "count": count,
                        "angle": round(avg_angle, 1),
                        "intensity": min(count / 10, 1.0)  # Normalized intensity
                    })
                else:
                    row.append(None)
            heatmap_data.append(row)

        return {
            "grid": heatmap_data,
            "size": {"width": self.heatmap_size[1], "height": self.heatmap_size[0]}
        }

    def get_counter_flow_summary(self) -> Dict:
        """Get summary of counter-flow events."""
        if not self.counter_flow_events:
            return {
                "total_events": 0,
                "severity_breakdown": {"mild": 0, "moderate": 0, "severe": 0},
                "recent_events": []
            }

        # Count by severity
        severity_counts = {"mild": 0, "moderate": 0, "severe": 0}
        for event in self.counter_flow_events:
            severity_counts[event.severity] += 1

        # Get recent events
        recent = sorted(self.counter_flow_events, key=lambda x: x.timestamp, reverse=True)[:10]

        return {
            "total_events": len(self.counter_flow_events),
            "severity_breakdown": severity_counts,
            "recent_events": [self._event_to_dict(e) for e in recent],
            "dominant_flow": self._flow_to_dict(self.dominant_flow) if self.dominant_flow else None
        }

    def reset(self):
        """Reset flow analysis state."""
        self.track_positions.clear()
        self.flow_history.clear()
        self.counter_flow_events.clear()
        self.dominant_flow = None
        self.direction_heatmap = None
