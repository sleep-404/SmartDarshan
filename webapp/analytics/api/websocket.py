"""WebSocket endpoints for real-time video analytics."""

from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import time

from processors.video_processor import VideoProcessor
from processors.gate_counter import BiDirectionalGateCounter
from processors.flow_detector import FlowAnalyzer
from processors.dwell_analyzer import DwellTimeAnalyzer
from processors.anomaly_detector import AnomalyDetector
from config import VIDEO_FILES, WS_UPDATE_INTERVAL


websocket_router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections for video streams."""

    def __init__(self):
        # Map of video_id -> set of connected websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of video_id -> processor
        self.processors: Dict[str, VideoProcessor] = {}
        # Map of video_id -> processing task
        self.tasks: Dict[str, asyncio.Task] = {}
        # Tier 3 analyzers per video
        self.gate_counters: Dict[str, BiDirectionalGateCounter] = {}
        self.flow_analyzers: Dict[str, FlowAnalyzer] = {}
        self.dwell_analyzers: Dict[str, DwellTimeAnalyzer] = {}
        self.anomaly_detectors: Dict[str, AnomalyDetector] = {}

    async def connect(self, websocket: WebSocket, video_id: str):
        """Accept a new WebSocket connection.

        Args:
            websocket: The WebSocket connection
            video_id: ID of the video to stream
        """
        await websocket.accept()

        if video_id not in self.active_connections:
            self.active_connections[video_id] = set()

        self.active_connections[video_id].add(websocket)

        # Start processing if not already running
        if video_id not in self.tasks or self.tasks[video_id].done():
            await self.start_processing(video_id)

    def disconnect(self, websocket: WebSocket, video_id: str):
        """Handle WebSocket disconnection.

        Args:
            websocket: The disconnecting WebSocket
            video_id: ID of the video stream
        """
        if video_id in self.active_connections:
            self.active_connections[video_id].discard(websocket)

            # Stop processing if no more connections
            if not self.active_connections[video_id]:
                self.stop_processing(video_id)
                del self.active_connections[video_id]

    async def start_processing(self, video_id: str):
        """Start video processing for a stream.

        Args:
            video_id: ID of the video to process
        """
        if video_id in self.processors:
            self.processors[video_id].is_processing = False

        processor = VideoProcessor(video_id)
        self.processors[video_id] = processor

        # Initialize Tier 3 analyzers for this video
        self.gate_counters[video_id] = BiDirectionalGateCounter()
        self.flow_analyzers[video_id] = FlowAnalyzer()
        self.dwell_analyzers[video_id] = DwellTimeAnalyzer()
        self.anomaly_detectors[video_id] = AnomalyDetector()

        # Create background task for processing
        self.tasks[video_id] = asyncio.create_task(
            self._process_loop(video_id, processor)
        )

    def stop_processing(self, video_id: str):
        """Stop video processing for a stream.

        Args:
            video_id: ID of the video stream
        """
        if video_id in self.processors:
            self.processors[video_id].is_processing = False

        if video_id in self.tasks:
            self.tasks[video_id].cancel()

        # Clean up Tier 3 analyzers
        if video_id in self.gate_counters:
            del self.gate_counters[video_id]
        if video_id in self.flow_analyzers:
            del self.flow_analyzers[video_id]
        if video_id in self.dwell_analyzers:
            del self.dwell_analyzers[video_id]
        if video_id in self.anomaly_detectors:
            del self.anomaly_detectors[video_id]

    async def _process_loop(self, video_id: str, processor: VideoProcessor):
        """Background processing loop.

        Args:
            video_id: ID of the video
            processor: VideoProcessor instance
        """
        try:
            if not processor.open():
                await self.broadcast(video_id, {
                    "error": f"Failed to open video: {video_id}"
                })
                return

            processor.is_processing = True

            while processor.is_processing and video_id in self.active_connections:
                # Read and process frame
                ret, frame = processor.cap.read()

                if not ret:
                    # Loop video
                    processor.cap.set(0, 0)  # Seek to beginning
                    processor.tracker.reset_flow_count()
                    continue

                processor.frame_count += 1

                # Skip frames for efficiency
                if processor.frame_count % processor.frame_skip != 0:
                    await asyncio.sleep(0.01)
                    continue

                # Process frame
                result = processor.process_frame(frame)

                # Run Tier 3 analyzers on detections
                detections = result.get("detections", [])
                if detections and video_id in self.gate_counters:
                    # Update gate counter
                    self.gate_counters[video_id].update(detections)

                    # Update flow analyzer
                    flow_result = self.flow_analyzers[video_id].update(detections)

                    # Update dwell analyzer
                    self.dwell_analyzers[video_id].update(detections)

                    # Update anomaly detector
                    anomaly_result = self.anomaly_detectors[video_id].update(detections)

                    # Add Tier 3 analytics to result (compact format for WebSocket)
                    result["advanced"] = {
                        "gates": self.gate_counters[video_id].get_gate_stats(),
                        "dominantFlow": flow_result.get("dominant_flow"),
                        "counterFlowCount": flow_result.get("total_counter_flow_count", 0),
                        "counterFlowDetected": flow_result.get("counter_flow_detected", False),
                        "anomalyCount": anomaly_result.get("total_anomalies", 0),
                        "newAnomalies": anomaly_result.get("new_anomalies", [])[:3]  # Limit for bandwidth
                    }

                # Broadcast to all connected clients
                await self.broadcast(video_id, result)

                # Control update rate
                await asyncio.sleep(WS_UPDATE_INTERVAL)

        except asyncio.CancelledError:
            pass
        except Exception as e:
            await self.broadcast(video_id, {"error": str(e)})
        finally:
            processor.close()

    async def broadcast(self, video_id: str, message: dict):
        """Broadcast a message to all connected clients.

        Args:
            video_id: ID of the video stream
            message: Message to send
        """
        if video_id not in self.active_connections:
            return

        disconnected = set()
        data = json.dumps(message)

        for websocket in self.active_connections[video_id]:
            try:
                await websocket.send_text(data)
            except Exception:
                disconnected.add(websocket)

        # Clean up disconnected
        for ws in disconnected:
            self.active_connections[video_id].discard(ws)


# Global connection manager
manager = ConnectionManager()


@websocket_router.websocket("/ws/analytics/{video_id}")
async def websocket_endpoint(websocket: WebSocket, video_id: str):
    """WebSocket endpoint for real-time video analytics.

    Args:
        websocket: WebSocket connection
        video_id: ID of the video to stream
    """
    if video_id not in VIDEO_FILES:
        await websocket.close(code=4004, reason=f"Video '{video_id}' not found")
        return

    await manager.connect(websocket, video_id)

    try:
        # Keep connection alive and handle client messages
        while True:
            try:
                # Wait for client messages (ping/pong or commands)
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )

                # Handle commands from client
                try:
                    command = json.loads(data)

                    if command.get("action") == "ping":
                        await websocket.send_json({"action": "pong"})

                    elif command.get("action") == "set_zone_area":
                        zone_area = command.get("area_sqm", 100.0)
                        if video_id in manager.processors:
                            manager.processors[video_id].metrics_aggregator.set_zone_area(zone_area)

                    elif command.get("action") == "set_counting_line":
                        y_pos = command.get("y_percentage", 50.0)
                        if video_id in manager.processors:
                            manager.processors[video_id].tracker.set_counting_line(y_pos)

                except json.JSONDecodeError:
                    pass

            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                try:
                    await websocket.send_json({"action": "ping"})
                except Exception:
                    break

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, video_id)


@websocket_router.get("/ws/status")
async def websocket_status():
    """Get WebSocket server status.

    Returns:
        Status information about active connections
    """
    return {
        "active_streams": {
            video_id: len(connections)
            for video_id, connections in manager.active_connections.items()
        },
        "processing": list(manager.processors.keys()),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
