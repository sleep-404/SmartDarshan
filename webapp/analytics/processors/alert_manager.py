"""Alert management for crowd analytics."""

from typing import Dict, Any, List, Optional, Callable
from enum import Enum
from dataclasses import dataclass, field
from collections import deque
import time
import uuid


class AlertLevel(Enum):
    """Alert severity levels."""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertType(Enum):
    """Types of alerts."""
    HIGH_DENSITY = "high_density"
    CRITICAL_DENSITY = "critical_density"
    LOW_VELOCITY = "low_velocity"
    CONGESTION = "congestion"
    CROWD_SURGE = "crowd_surge"
    LONG_QUEUE = "long_queue"
    ANOMALY = "anomaly"


@dataclass
class Alert:
    """Represents a single alert."""
    id: str
    type: AlertType
    level: AlertLevel
    message: str
    timestamp: float
    zone: str = "general"
    acknowledged: bool = False
    resolved: bool = False
    data: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "type": self.type.value,
            "level": self.level.value,
            "message": self.message,
            "timestamp": self.timestamp,
            "zone": self.zone,
            "acknowledged": self.acknowledged,
            "resolved": self.resolved,
            "data": self.data
        }


class AlertManager:
    """Manages alert generation, tracking, and notification."""

    def __init__(self):
        """Initialize the alert manager."""
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: deque = deque(maxlen=1000)

        # Alert thresholds
        self.thresholds = {
            "density_warning": 2.5,     # people/m²
            "density_critical": 3.5,    # people/m²
            "velocity_warning": 0.5,    # m/s
            "velocity_critical": 0.3,   # m/s
            "queue_long": 45,           # minutes
            "queue_very_long": 60,      # minutes
            "congestion_duration": 120  # seconds before alert
        }

        # Tracking for duration-based alerts
        self._condition_start_times: Dict[str, float] = {}

        # Alert callbacks
        self._callbacks: List[Callable[[Alert], None]] = []

        # Cooldown to prevent alert spam
        self._last_alert_times: Dict[str, float] = {}
        self.cooldown_seconds = 60  # Minimum time between same alert type

    def check_metrics(
        self,
        metrics: Dict[str, Any],
        zone: str = "general"
    ) -> List[Alert]:
        """Check metrics and generate alerts if thresholds exceeded.

        Args:
            metrics: Current metrics dictionary
            zone: Zone identifier

        Returns:
            List of new alerts generated
        """
        new_alerts = []
        current_time = time.time()

        density = metrics.get("density", 0)
        velocity = metrics.get("velocity", 1.0)
        congestion_status = metrics.get("congestionStatus", "free")
        queue_wait = metrics.get("waitTimeMinutes", 0)

        # Check density thresholds
        if density >= self.thresholds["density_critical"]:
            alert = self._create_alert_if_not_exists(
                AlertType.CRITICAL_DENSITY,
                AlertLevel.CRITICAL,
                f"Critical crowd density: {density:.1f} people/m² in {zone}",
                zone,
                {"density": density}
            )
            if alert:
                new_alerts.append(alert)
        elif density >= self.thresholds["density_warning"]:
            alert = self._create_alert_if_not_exists(
                AlertType.HIGH_DENSITY,
                AlertLevel.WARNING,
                f"High crowd density: {density:.1f} people/m² in {zone}",
                zone,
                {"density": density}
            )
            if alert:
                new_alerts.append(alert)
        else:
            # Resolve density alerts if below threshold
            self._resolve_alerts_of_type([AlertType.HIGH_DENSITY, AlertType.CRITICAL_DENSITY], zone)

        # Check velocity threshold
        if velocity <= self.thresholds["velocity_critical"]:
            alert = self._create_alert_if_not_exists(
                AlertType.LOW_VELOCITY,
                AlertLevel.CRITICAL,
                f"Very slow crowd movement: {velocity:.2f} m/s in {zone}",
                zone,
                {"velocity": velocity}
            )
            if alert:
                new_alerts.append(alert)
        elif velocity <= self.thresholds["velocity_warning"]:
            alert = self._create_alert_if_not_exists(
                AlertType.LOW_VELOCITY,
                AlertLevel.WARNING,
                f"Slow crowd movement: {velocity:.2f} m/s in {zone}",
                zone,
                {"velocity": velocity}
            )
            if alert:
                new_alerts.append(alert)
        else:
            self._resolve_alerts_of_type([AlertType.LOW_VELOCITY], zone)

        # Check congestion (duration-based)
        if congestion_status in ["congested", "severe"]:
            condition_key = f"congestion_{zone}"
            if condition_key not in self._condition_start_times:
                self._condition_start_times[condition_key] = current_time
            elif current_time - self._condition_start_times[condition_key] > self.thresholds["congestion_duration"]:
                alert = self._create_alert_if_not_exists(
                    AlertType.CONGESTION,
                    AlertLevel.CRITICAL if congestion_status == "severe" else AlertLevel.WARNING,
                    f"Sustained congestion detected in {zone}",
                    zone,
                    {"status": congestion_status, "duration": current_time - self._condition_start_times[condition_key]}
                )
                if alert:
                    new_alerts.append(alert)
        else:
            self._condition_start_times.pop(f"congestion_{zone}", None)
            self._resolve_alerts_of_type([AlertType.CONGESTION], zone)

        # Check queue wait time
        if queue_wait >= self.thresholds["queue_very_long"]:
            alert = self._create_alert_if_not_exists(
                AlertType.LONG_QUEUE,
                AlertLevel.CRITICAL,
                f"Very long queue wait time: {queue_wait:.0f} minutes in {zone}",
                zone,
                {"waitTime": queue_wait}
            )
            if alert:
                new_alerts.append(alert)
        elif queue_wait >= self.thresholds["queue_long"]:
            alert = self._create_alert_if_not_exists(
                AlertType.LONG_QUEUE,
                AlertLevel.WARNING,
                f"Long queue wait time: {queue_wait:.0f} minutes in {zone}",
                zone,
                {"waitTime": queue_wait}
            )
            if alert:
                new_alerts.append(alert)
        else:
            self._resolve_alerts_of_type([AlertType.LONG_QUEUE], zone)

        # Notify callbacks
        for alert in new_alerts:
            for callback in self._callbacks:
                try:
                    callback(alert)
                except Exception:
                    pass

        return new_alerts

    def _create_alert_if_not_exists(
        self,
        alert_type: AlertType,
        level: AlertLevel,
        message: str,
        zone: str,
        data: Dict[str, Any]
    ) -> Optional[Alert]:
        """Create an alert if one doesn't already exist for this type/zone.

        Args:
            alert_type: Type of alert
            level: Alert severity level
            message: Alert message
            zone: Zone identifier
            data: Additional alert data

        Returns:
            New alert if created, None if alert already exists or in cooldown
        """
        current_time = time.time()
        alert_key = f"{alert_type.value}_{zone}"

        # Check if active alert exists
        for alert in self.active_alerts.values():
            if alert.type == alert_type and alert.zone == zone and not alert.resolved:
                return None

        # Check cooldown
        if alert_key in self._last_alert_times:
            if current_time - self._last_alert_times[alert_key] < self.cooldown_seconds:
                return None

        # Create new alert
        alert = Alert(
            id=str(uuid.uuid4())[:8],
            type=alert_type,
            level=level,
            message=message,
            timestamp=current_time,
            zone=zone,
            data=data
        )

        self.active_alerts[alert.id] = alert
        self.alert_history.append(alert)
        self._last_alert_times[alert_key] = current_time

        return alert

    def _resolve_alerts_of_type(self, alert_types: List[AlertType], zone: str):
        """Resolve all active alerts of the specified types in a zone.

        Args:
            alert_types: List of alert types to resolve
            zone: Zone identifier
        """
        for alert in self.active_alerts.values():
            if alert.type in alert_types and alert.zone == zone and not alert.resolved:
                alert.resolved = True

    def acknowledge_alert(self, alert_id: str) -> bool:
        """Acknowledge an alert.

        Args:
            alert_id: Alert ID to acknowledge

        Returns:
            True if successful
        """
        if alert_id in self.active_alerts:
            self.active_alerts[alert_id].acknowledged = True
            return True
        return False

    def resolve_alert(self, alert_id: str) -> bool:
        """Resolve an alert.

        Args:
            alert_id: Alert ID to resolve

        Returns:
            True if successful
        """
        if alert_id in self.active_alerts:
            self.active_alerts[alert_id].resolved = True
            return True
        return False

    def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get all active (unresolved) alerts.

        Returns:
            List of alert dictionaries
        """
        return [
            alert.to_dict()
            for alert in self.active_alerts.values()
            if not alert.resolved
        ]

    def get_alert_count(self) -> Dict[str, int]:
        """Get count of active alerts by level.

        Returns:
            Dictionary with counts by level
        """
        counts = {"info": 0, "warning": 0, "critical": 0}
        for alert in self.active_alerts.values():
            if not alert.resolved:
                counts[alert.level.value] += 1
        return counts

    def get_alert_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent alert history.

        Args:
            limit: Maximum number of alerts to return

        Returns:
            List of alert dictionaries
        """
        alerts = list(self.alert_history)[-limit:]
        return [alert.to_dict() for alert in alerts]

    def register_callback(self, callback: Callable[[Alert], None]):
        """Register a callback for new alerts.

        Args:
            callback: Function to call when new alert is generated
        """
        self._callbacks.append(callback)

    def set_threshold(self, key: str, value: float):
        """Update an alert threshold.

        Args:
            key: Threshold key
            value: New threshold value
        """
        if key in self.thresholds:
            self.thresholds[key] = value

    def clear_resolved(self):
        """Remove all resolved alerts from active alerts."""
        self.active_alerts = {
            id: alert
            for id, alert in self.active_alerts.items()
            if not alert.resolved
        }
