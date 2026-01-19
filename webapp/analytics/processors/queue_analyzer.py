"""Queue length and wait time analysis."""

from typing import Dict, Any, List, Optional, Tuple
from collections import deque
import time
import math


class QueueAnalyzer:
    """Analyzes queue characteristics from detection data."""

    def __init__(
        self,
        service_rate: float = 2.0,  # People processed per minute
        queue_zone: Optional[Tuple[float, float, float, float]] = None  # (x1, y1, x2, y2) percentage
    ):
        """Initialize the queue analyzer.

        Args:
            service_rate: Average number of people processed per minute
            queue_zone: Zone to consider as queue area (percentage coords)
        """
        self.service_rate = service_rate
        self.queue_zone = queue_zone or (0, 30, 100, 100)  # Default: bottom 70% of frame

        # Queue history for trend analysis
        self.queue_history: deque = deque(maxlen=300)  # 5 minutes at 1/sec

        # Moving average for smoothing
        self.length_buffer: deque = deque(maxlen=10)

    def analyze(
        self,
        detections: List[Dict[str, Any]],
        velocity: float = 0.8
    ) -> Dict[str, Any]:
        """Analyze queue from detections.

        Args:
            detections: List of detection dictionaries with x, y, width, height
            velocity: Current average velocity in m/s

        Returns:
            Queue analysis results
        """
        # Count people in queue zone
        queue_count = self._count_in_zone(detections)
        self.length_buffer.append(queue_count)

        # Smoothed queue length
        smoothed_length = int(sum(self.length_buffer) / len(self.length_buffer))

        # Estimate wait time based on queue length and service rate
        # Adjust for velocity (slower = longer wait)
        velocity_factor = max(0.3, velocity) / 0.8  # Normalize to normal walking speed
        effective_service_rate = self.service_rate * velocity_factor

        wait_time_minutes = smoothed_length / effective_service_rate if effective_service_rate > 0 else 0

        # Record history
        current_time = time.time()
        self.queue_history.append({
            "time": current_time,
            "length": smoothed_length,
            "wait_time": wait_time_minutes
        })

        # Calculate queue sections (based on density distribution)
        sections = self._estimate_sections(detections)

        # Calculate trend
        trend = self._calculate_trend()

        return {
            "queueLength": smoothed_length,
            "waitTimeMinutes": round(wait_time_minutes, 1),
            "queueSections": sections,
            "trend": trend,
            "serviceRate": round(effective_service_rate, 1),
            "status": self._get_queue_status(wait_time_minutes)
        }

    def _count_in_zone(self, detections: List[Dict[str, Any]]) -> int:
        """Count detections within the queue zone.

        Args:
            detections: List of detection dictionaries

        Returns:
            Number of detections in queue zone
        """
        x1, y1, x2, y2 = self.queue_zone
        count = 0

        for det in detections:
            # Get center of detection
            cx = det.get("x", 0) + det.get("width", 0) / 2
            cy = det.get("y", 0) + det.get("height", 0) / 2

            # Check if in zone
            if x1 <= cx <= x2 and y1 <= cy <= y2:
                count += 1

        return count

    def _estimate_sections(self, detections: List[Dict[str, Any]]) -> int:
        """Estimate number of queue sections based on detection clustering.

        Args:
            detections: List of detection dictionaries

        Returns:
            Estimated number of queue sections
        """
        if len(detections) < 5:
            return 1

        # Simple heuristic: divide frame into sections and count occupied
        sections = 4  # Divide into 4 horizontal sections
        section_width = 100 / sections

        occupied = set()
        for det in detections:
            cx = det.get("x", 0) + det.get("width", 0) / 2
            section_idx = min(int(cx / section_width), sections - 1)
            occupied.add(section_idx)

        return len(occupied)

    def _calculate_trend(self) -> str:
        """Calculate queue trend over recent history.

        Returns:
            Trend indicator: "increasing", "decreasing", or "stable"
        """
        if len(self.queue_history) < 10:
            return "stable"

        # Compare recent average to older average
        recent = list(self.queue_history)[-10:]
        older = list(self.queue_history)[-30:-10] if len(self.queue_history) >= 30 else recent

        recent_avg = sum(h["length"] for h in recent) / len(recent)
        older_avg = sum(h["length"] for h in older) / len(older) if older else recent_avg

        diff_pct = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0

        if diff_pct > 10:
            return "increasing"
        elif diff_pct < -10:
            return "decreasing"
        return "stable"

    def _get_queue_status(self, wait_time_minutes: float) -> str:
        """Get queue status based on wait time.

        Args:
            wait_time_minutes: Estimated wait time

        Returns:
            Status string
        """
        if wait_time_minutes < 15:
            return "short"
        elif wait_time_minutes < 30:
            return "moderate"
        elif wait_time_minutes < 60:
            return "long"
        return "very_long"

    def set_zone(self, zone: Tuple[float, float, float, float]):
        """Update the queue zone.

        Args:
            zone: New zone coordinates (x1, y1, x2, y2) as percentages
        """
        self.queue_zone = zone

    def set_service_rate(self, rate: float):
        """Update the service rate.

        Args:
            rate: New service rate (people per minute)
        """
        self.service_rate = max(0.1, rate)

    def get_history(self, minutes: int = 5) -> List[Dict[str, Any]]:
        """Get queue history for the specified duration.

        Args:
            minutes: Number of minutes of history to return

        Returns:
            List of historical queue data points
        """
        cutoff = time.time() - (minutes * 60)
        return [h for h in self.queue_history if h["time"] >= cutoff]
