"""Bi-directional gate counting using virtual counting lines."""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import time


@dataclass
class GateCrossing:
    """Represents a gate crossing event."""
    track_id: str
    direction: str  # 'entry' or 'exit'
    timestamp: float
    gate_id: str
    position: Tuple[float, float]


@dataclass
class VirtualGate:
    """A virtual counting line/gate."""
    gate_id: str
    # Line defined by two points (x1, y1) to (x2, y2) as percentages of frame
    x1: float
    y1: float
    x2: float
    y2: float
    # Direction vector: which side is 'entry' (normalized)
    entry_direction: Tuple[float, float] = (0, 1)  # Default: downward is entry

    def get_line_points(self, frame_width: int, frame_height: int) -> Tuple[Tuple[int, int], Tuple[int, int]]:
        """Get actual pixel coordinates of the line."""
        p1 = (int(self.x1 * frame_width), int(self.y1 * frame_height))
        p2 = (int(self.x2 * frame_width), int(self.y2 * frame_height))
        return p1, p2


class BiDirectionalGateCounter:
    """
    Counts people crossing virtual gates/lines with direction detection.

    Uses track positions to determine when tracks cross a virtual line
    and in which direction (entry vs exit).
    """

    def __init__(self):
        self.gates: Dict[str, VirtualGate] = {}
        self.track_positions: Dict[str, List[Tuple[float, float, float]]] = defaultdict(list)  # track_id -> [(x, y, time), ...]
        self.crossings: List[GateCrossing] = []
        self.entry_count: Dict[str, int] = defaultdict(int)
        self.exit_count: Dict[str, int] = defaultdict(int)
        self.crossed_tracks: Dict[str, set] = defaultdict(set)  # gate_id -> set of track_ids that crossed

        # Initialize default gates for temple scenarios
        self._init_default_gates()

    def _init_default_gates(self):
        """Initialize default virtual gates."""
        # Main entrance gate - horizontal line at 60% height
        self.add_gate(VirtualGate(
            gate_id="main_entrance",
            x1=0.1, y1=0.6,
            x2=0.9, y2=0.6,
            entry_direction=(0, 1)  # Downward movement is entry
        ))

        # Secondary gate - horizontal line at 40% height
        self.add_gate(VirtualGate(
            gate_id="inner_gate",
            x1=0.2, y1=0.4,
            x2=0.8, y2=0.4,
            entry_direction=(0, 1)
        ))

    def add_gate(self, gate: VirtualGate):
        """Add a virtual gate."""
        self.gates[gate.gate_id] = gate
        self.entry_count[gate.gate_id] = 0
        self.exit_count[gate.gate_id] = 0
        self.crossed_tracks[gate.gate_id] = set()

    def remove_gate(self, gate_id: str):
        """Remove a virtual gate."""
        if gate_id in self.gates:
            del self.gates[gate_id]
            del self.entry_count[gate_id]
            del self.exit_count[gate_id]
            del self.crossed_tracks[gate_id]

    def _cross_product_sign(self, p1: Tuple[float, float], p2: Tuple[float, float], p3: Tuple[float, float]) -> float:
        """Calculate cross product to determine which side of a line a point is on."""
        return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0])

    def _lines_intersect(self,
                         l1_start: Tuple[float, float], l1_end: Tuple[float, float],
                         l2_start: Tuple[float, float], l2_end: Tuple[float, float]) -> bool:
        """Check if two line segments intersect."""
        d1 = self._cross_product_sign(l2_start, l2_end, l1_start)
        d2 = self._cross_product_sign(l2_start, l2_end, l1_end)
        d3 = self._cross_product_sign(l1_start, l1_end, l2_start)
        d4 = self._cross_product_sign(l1_start, l1_end, l2_end)

        if ((d1 > 0 and d2 < 0) or (d1 < 0 and d2 > 0)) and \
           ((d3 > 0 and d4 < 0) or (d3 < 0 and d4 > 0)):
            return True
        return False

    def _get_crossing_direction(self,
                                prev_pos: Tuple[float, float],
                                curr_pos: Tuple[float, float],
                                gate: VirtualGate) -> str:
        """Determine if the crossing was an entry or exit."""
        # Movement vector
        move_x = curr_pos[0] - prev_pos[0]
        move_y = curr_pos[1] - prev_pos[1]

        # Dot product with entry direction
        dot = move_x * gate.entry_direction[0] + move_y * gate.entry_direction[1]

        return "entry" if dot > 0 else "exit"

    def update(self, tracked_objects: List[Dict]) -> List[GateCrossing]:
        """
        Update gate crossings with new tracked positions.

        Args:
            tracked_objects: List of tracked objects with 'id', 'x', 'y' fields

        Returns:
            List of new gate crossings detected this frame
        """
        current_time = time.time()
        new_crossings = []

        for obj in tracked_objects:
            track_id = obj.get('id', str(obj.get('track_id', '')))
            # Normalize position to 0-1 range (assuming x, y are percentages or need conversion)
            x = obj.get('x', 0)
            y = obj.get('y', 0)

            # If coordinates are in percentage (0-100), normalize to 0-1
            if x > 1 or y > 1:
                x = x / 100.0
                y = y / 100.0

            # Get previous positions
            prev_positions = self.track_positions[track_id]

            if prev_positions:
                prev_x, prev_y, _ = prev_positions[-1]

                # Check crossing for each gate
                for gate_id, gate in self.gates.items():
                    # Skip if this track already crossed this gate
                    if track_id in self.crossed_tracks[gate_id]:
                        continue

                    # Check if track path crosses the gate line
                    if self._lines_intersect(
                        (prev_x, prev_y), (x, y),
                        (gate.x1, gate.y1), (gate.x2, gate.y2)
                    ):
                        direction = self._get_crossing_direction(
                            (prev_x, prev_y), (x, y), gate
                        )

                        crossing = GateCrossing(
                            track_id=track_id,
                            direction=direction,
                            timestamp=current_time,
                            gate_id=gate_id,
                            position=(x, y)
                        )

                        self.crossings.append(crossing)
                        new_crossings.append(crossing)
                        self.crossed_tracks[gate_id].add(track_id)

                        if direction == "entry":
                            self.entry_count[gate_id] += 1
                        else:
                            self.exit_count[gate_id] += 1

            # Store current position
            self.track_positions[track_id].append((x, y, current_time))

            # Keep only last 30 positions per track
            if len(self.track_positions[track_id]) > 30:
                self.track_positions[track_id] = self.track_positions[track_id][-30:]

        return new_crossings

    def get_gate_stats(self, gate_id: str = None) -> Dict:
        """Get statistics for a gate or all gates."""
        if gate_id:
            if gate_id not in self.gates:
                return {}
            return {
                "gate_id": gate_id,
                "entry_count": self.entry_count[gate_id],
                "exit_count": self.exit_count[gate_id],
                "net_count": self.entry_count[gate_id] - self.exit_count[gate_id],
                "total_crossings": self.entry_count[gate_id] + self.exit_count[gate_id]
            }

        return {
            gate_id: {
                "entry_count": self.entry_count[gate_id],
                "exit_count": self.exit_count[gate_id],
                "net_count": self.entry_count[gate_id] - self.exit_count[gate_id],
                "total_crossings": self.entry_count[gate_id] + self.exit_count[gate_id]
            }
            for gate_id in self.gates
        }

    def get_flow_rate(self, gate_id: str, window_seconds: float = 60.0) -> Dict:
        """Calculate entry/exit flow rate over a time window."""
        current_time = time.time()
        cutoff_time = current_time - window_seconds

        recent_crossings = [
            c for c in self.crossings
            if c.gate_id == gate_id and c.timestamp > cutoff_time
        ]

        entries = sum(1 for c in recent_crossings if c.direction == "entry")
        exits = sum(1 for c in recent_crossings if c.direction == "exit")

        # Convert to per-minute rate
        rate_multiplier = 60.0 / window_seconds

        return {
            "gate_id": gate_id,
            "entry_rate": round(entries * rate_multiplier, 1),
            "exit_rate": round(exits * rate_multiplier, 1),
            "net_rate": round((entries - exits) * rate_multiplier, 1),
            "window_seconds": window_seconds
        }

    def get_recent_crossings(self, limit: int = 20) -> List[Dict]:
        """Get most recent crossings."""
        recent = sorted(self.crossings, key=lambda x: x.timestamp, reverse=True)[:limit]
        return [
            {
                "track_id": c.track_id,
                "direction": c.direction,
                "gate_id": c.gate_id,
                "timestamp": c.timestamp,
                "position": {"x": c.position[0], "y": c.position[1]}
            }
            for c in recent
        ]

    def reset(self, gate_id: str = None):
        """Reset counters for a gate or all gates."""
        if gate_id:
            self.entry_count[gate_id] = 0
            self.exit_count[gate_id] = 0
            self.crossed_tracks[gate_id] = set()
            self.crossings = [c for c in self.crossings if c.gate_id != gate_id]
        else:
            for gid in self.gates:
                self.entry_count[gid] = 0
                self.exit_count[gid] = 0
                self.crossed_tracks[gid] = set()
            self.crossings = []
            self.track_positions.clear()
