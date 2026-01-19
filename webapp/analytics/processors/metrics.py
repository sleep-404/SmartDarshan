"""Metrics aggregation and calculation."""

from typing import Dict, Any, List
from collections import deque
import time

from config import DENSITY_THRESHOLDS, VELOCITY_THRESHOLDS, DEFAULT_ZONE_AREA_SQM


class MetricsAggregator:
    """Aggregates and calculates crowd metrics over time."""

    def __init__(self, zone_area_sqm: float = DEFAULT_ZONE_AREA_SQM):
        """Initialize the metrics aggregator.

        Args:
            zone_area_sqm: Area of the zone being monitored in square meters
        """
        self.zone_area_sqm = zone_area_sqm

        # Current values
        self.people_count = 0
        self.velocity = 0.0
        self.flow_rate = 0.0

        # Historical data for trends (last 5 minutes at 1 sample/second)
        self.count_history: deque = deque(maxlen=300)
        self.velocity_history: deque = deque(maxlen=300)
        self.density_history: deque = deque(maxlen=300)

        # Timestamps for flow rate calculation
        self.flow_start_time = time.time()
        self.last_update_time = time.time()

        # Smoothing buffers
        self._count_buffer: deque = deque(maxlen=10)
        self._velocity_buffer: deque = deque(maxlen=10)

    def update(
        self,
        people_count: int,
        velocity: float,
        flow_rate: float
    ):
        """Update metrics with new measurements.

        Args:
            people_count: Number of people detected
            velocity: Average walking velocity in m/s
            flow_rate: Flow rate in people per minute
        """
        current_time = time.time()

        # Add to smoothing buffers
        self._count_buffer.append(people_count)
        self._velocity_buffer.append(velocity)

        # Calculate smoothed values
        self.people_count = int(sum(self._count_buffer) / len(self._count_buffer))
        self.velocity = sum(self._velocity_buffer) / len(self._velocity_buffer)
        self.flow_rate = flow_rate

        # Calculate density
        density = self.calculate_density()

        # Add to history
        self.count_history.append({
            "time": current_time,
            "value": self.people_count
        })
        self.velocity_history.append({
            "time": current_time,
            "value": self.velocity
        })
        self.density_history.append({
            "time": current_time,
            "value": density
        })

        self.last_update_time = current_time

    def calculate_density(self) -> float:
        """Calculate crowd density in people per square meter.

        Returns:
            Density value (people/m²)
        """
        if self.zone_area_sqm <= 0:
            return 0.0
        return self.people_count / self.zone_area_sqm

    def get_congestion_status(self) -> str:
        """Determine congestion status based on density and velocity.

        Returns:
            Congestion status: "free", "moderate", "congested", or "severe"
        """
        density = self.calculate_density()
        velocity = self.velocity

        # Determine status based on both metrics
        # Priority: velocity is more important indicator of actual flow

        if density >= DENSITY_THRESHOLDS["congested"] or velocity <= VELOCITY_THRESHOLDS["congested"]:
            return "severe"
        elif density >= DENSITY_THRESHOLDS["moderate"] or velocity <= VELOCITY_THRESHOLDS["moderate"]:
            return "congested"
        elif density >= DENSITY_THRESHOLDS["free"] or velocity <= VELOCITY_THRESHOLDS["free"]:
            return "moderate"
        else:
            return "free"

    def get_count_trend(self, window_seconds: float = 300.0) -> float:
        """Calculate count trend over a time window.

        Args:
            window_seconds: Time window for trend calculation

        Returns:
            Percentage change in count
        """
        if len(self.count_history) < 2:
            return 0.0

        current_time = time.time()
        window_start = current_time - window_seconds

        # Get old and new counts
        old_counts = [h["value"] for h in self.count_history if h["time"] < window_start + 60]
        new_counts = [h["value"] for h in self.count_history if h["time"] > current_time - 60]

        if not old_counts or not new_counts:
            return 0.0

        old_avg = sum(old_counts) / len(old_counts)
        new_avg = sum(new_counts) / len(new_counts)

        if old_avg == 0:
            return 0.0

        return ((new_avg - old_avg) / old_avg) * 100

    def get_metrics(self) -> Dict[str, Any]:
        """Get all current metrics.

        Returns:
            Dictionary with all metrics
        """
        density = self.calculate_density()
        congestion_status = self.get_congestion_status()
        count_trend = self.get_count_trend()

        return {
            "peopleCount": self.people_count,
            "density": round(density, 2),
            "congestionStatus": congestion_status,
            "velocity": round(self.velocity, 2),
            "flowRate": int(self.flow_rate),
            "countTrend": round(count_trend, 1)
        }

    def get_trend_data(self, metric: str = "density", points: int = 20) -> List[Dict[str, Any]]:
        """Get historical trend data for charts.

        Args:
            metric: Which metric to get ("density", "count", "velocity")
            points: Number of data points to return

        Returns:
            List of {time, value} dictionaries
        """
        if metric == "density":
            history = list(self.density_history)
        elif metric == "count":
            history = list(self.count_history)
        elif metric == "velocity":
            history = list(self.velocity_history)
        else:
            return []

        if not history:
            return []

        # Sample evenly spaced points
        step = max(1, len(history) // points)
        sampled = history[::step][-points:]

        # Format for frontend
        return [
            {
                "time": time.strftime("%H:%M", time.localtime(h["time"])),
                "value": round(h["value"], 2)
            }
            for h in sampled
        ]

    def set_zone_area(self, area_sqm: float):
        """Update the zone area.

        Args:
            area_sqm: New zone area in square meters
        """
        self.zone_area_sqm = area_sqm

    def reset(self):
        """Reset all metrics."""
        self.people_count = 0
        self.velocity = 0.0
        self.flow_rate = 0.0
        self.count_history.clear()
        self.velocity_history.clear()
        self.density_history.clear()
        self._count_buffer.clear()
        self._velocity_buffer.clear()
        self.flow_start_time = time.time()
