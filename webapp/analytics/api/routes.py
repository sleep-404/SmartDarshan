"""REST API routes for video analytics."""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import json
import time
import numpy as np

from processors.video_processor import VideoProcessor, MultiVideoProcessor
from processors.queue_analyzer import QueueAnalyzer
from processors.alert_manager import AlertManager
from processors.gate_counter import BiDirectionalGateCounter, VirtualGate
from processors.flow_detector import FlowAnalyzer
from processors.dwell_analyzer import DwellTimeAnalyzer, DwellZone
from processors.anomaly_detector import AnomalyDetector
from config import VIDEO_FILES


def convert_numpy_types(obj):
    """Recursively convert numpy types to Python native types."""
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj


router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Global processor manager
processor_manager = MultiVideoProcessor()

# Active streaming processors
active_streams: Dict[str, VideoProcessor] = {}

# Queue analyzers per video
queue_analyzers: Dict[str, QueueAnalyzer] = {}

# Global alert manager
alert_manager = AlertManager()

# Gate counters per video
gate_counters: Dict[str, BiDirectionalGateCounter] = {}

# Flow analyzers per video
flow_analyzers: Dict[str, FlowAnalyzer] = {}

# Dwell time analyzers per video
dwell_analyzers: Dict[str, DwellTimeAnalyzer] = {}

# Anomaly detectors per video
anomaly_detectors: Dict[str, AnomalyDetector] = {}


@router.get("/status")
async def get_status() -> Dict[str, Any]:
    """Health check and status endpoint.

    Returns:
        System status information
    """
    return {
        "status": "healthy",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "available_videos": list(VIDEO_FILES.keys()),
        "active_streams": list(active_streams.keys()),
        "version": "1.0.0"
    }


@router.get("/videos")
async def list_videos() -> List[Dict[str, str]]:
    """List available videos for analysis.

    Returns:
        List of video information
    """
    return [
        {"id": video_id, "filename": filename}
        for video_id, filename in VIDEO_FILES.items()
    ]


@router.get("/frame/{video_id}")
async def analyze_frame(
    video_id: str,
    frame_number: Optional[int] = Query(None, description="Specific frame to analyze")
) -> Dict[str, Any]:
    """Analyze a single frame from a video.

    Args:
        video_id: ID of the video to analyze
        frame_number: Optional specific frame number

    Returns:
        Frame analysis results with detections and metrics
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(
            status_code=404,
            detail=f"Video '{video_id}' not found. Available: {list(VIDEO_FILES.keys())}"
        )

    try:
        processor = VideoProcessor(video_id)
        result = processor.get_single_frame_analysis(frame_number)
        return convert_numpy_types(result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stream/{video_id}")
async def stream_analysis(video_id: str):
    """Stream continuous video analysis as Server-Sent Events.

    Args:
        video_id: ID of the video to analyze

    Returns:
        SSE stream of analysis results
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(
            status_code=404,
            detail=f"Video '{video_id}' not found"
        )

    async def event_generator():
        processor = VideoProcessor(video_id)
        active_streams[video_id] = processor

        try:
            for result in processor.process_stream():
                data = json.dumps(result)
                yield f"data: {data}\n\n"
        finally:
            if video_id in active_streams:
                del active_streams[video_id]

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/stream/{video_id}/stop")
async def stop_stream(video_id: str) -> Dict[str, str]:
    """Stop a running stream.

    Args:
        video_id: ID of the stream to stop

    Returns:
        Confirmation message
    """
    if video_id in active_streams:
        active_streams[video_id].is_processing = False
        del active_streams[video_id]
        return {"status": "stopped", "video_id": video_id}

    raise HTTPException(
        status_code=404,
        detail=f"No active stream for '{video_id}'"
    )


@router.get("/velocity/{video_id}")
async def get_velocity(video_id: str) -> Dict[str, Any]:
    """Get velocity analysis for a video.

    Args:
        video_id: ID of the video

    Returns:
        Velocity metrics
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    # If there's an active stream, get current velocity
    if video_id in active_streams:
        processor = active_streams[video_id]
        return {
            "video_id": video_id,
            "velocity": round(processor.velocity_estimator.velocity_history[-1] if processor.velocity_estimator.velocity_history else 0, 2),
            "unit": "m/s",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

    # Otherwise, process a few frames to get an estimate
    try:
        processor = VideoProcessor(video_id)
        processor.open()

        velocities = []
        for _ in range(10):  # Process 10 frames
            ret, frame = processor.cap.read()
            if not ret:
                break
            vel, _ = processor.velocity_estimator.estimate(frame)
            velocities.append(vel)

        processor.close()

        avg_velocity = sum(velocities) / len(velocities) if velocities else 0

        return {
            "video_id": video_id,
            "velocity": round(avg_velocity, 2),
            "unit": "m/s",
            "sample_frames": len(velocities),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flow-rate/{video_id}")
async def get_flow_rate(video_id: str) -> Dict[str, Any]:
    """Get flow rate for a video.

    Args:
        video_id: ID of the video

    Returns:
        Flow rate metrics
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    if video_id in active_streams:
        processor = active_streams[video_id]
        return {
            "video_id": video_id,
            "flowRate": processor.tracker.get_flow_rate(),
            "unit": "people/minute",
            "activeTracked": processor.tracker.active_track_count,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

    return {
        "video_id": video_id,
        "flowRate": 0,
        "unit": "people/minute",
        "note": "Start stream to get real-time flow rate",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/density/{video_id}")
async def get_density(
    video_id: str,
    zone_area_sqm: float = Query(100.0, description="Zone area in square meters")
) -> Dict[str, Any]:
    """Get density analysis for a video.

    Args:
        video_id: ID of the video
        zone_area_sqm: Area of the zone in square meters

    Returns:
        Density metrics
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    # Get current count from stream or analyze frame
    if video_id in active_streams:
        processor = active_streams[video_id]
        count = len(processor.last_detections)
    else:
        processor = VideoProcessor(video_id)
        result = processor.get_single_frame_analysis()
        count = result["metrics"]["peopleCount"]

    density = count / zone_area_sqm if zone_area_sqm > 0 else 0

    # Determine status
    if density < 1.5:
        status = "free"
    elif density < 2.5:
        status = "moderate"
    elif density < 3.5:
        status = "congested"
    else:
        status = "severe"

    return {
        "video_id": video_id,
        "peopleCount": count,
        "zoneAreaSqm": zone_area_sqm,
        "density": round(density, 2),
        "unit": "people/m²",
        "status": status,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/trends/{video_id}")
async def get_trends(
    video_id: str,
    metric: str = Query("density", description="Metric to get trends for"),
    points: int = Query(20, description="Number of data points")
) -> Dict[str, Any]:
    """Get historical trend data for a video.

    Args:
        video_id: ID of the video
        metric: Which metric ("density", "count", "velocity")
        points: Number of data points

    Returns:
        Trend data for charts
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    if video_id in active_streams:
        processor = active_streams[video_id]
        trend_data = processor.metrics_aggregator.get_trend_data(metric, points)
    else:
        # Return empty trend if no active stream
        trend_data = []

    return {
        "video_id": video_id,
        "metric": metric,
        "data": trend_data,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


# ============================================================================
# QUEUE ANALYSIS ENDPOINTS
# ============================================================================

@router.get("/queue/{video_id}")
async def get_queue_analysis(
    video_id: str,
    service_rate: float = Query(2.0, description="People processed per minute")
) -> Dict[str, Any]:
    """Get queue length and wait time analysis.

    Args:
        video_id: ID of the video
        service_rate: Average service rate

    Returns:
        Queue analysis results
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    # Get or create queue analyzer
    if video_id not in queue_analyzers:
        queue_analyzers[video_id] = QueueAnalyzer(service_rate=service_rate)

    analyzer = queue_analyzers[video_id]
    analyzer.set_service_rate(service_rate)

    # Get detections from active stream or analyze frame
    if video_id in active_streams:
        processor = active_streams[video_id]
        detections = [d.to_dict() for d in processor.last_detections]
        velocity = processor.last_metrics.get("velocity", 0.8)
    else:
        processor = VideoProcessor(video_id)
        result = processor.get_single_frame_analysis()
        detections = result["detections"]
        velocity = result["metrics"].get("velocity", 0.8)

    # Analyze queue
    analysis = analyzer.analyze(detections, velocity)

    return {
        "video_id": video_id,
        **analysis,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


# ============================================================================
# ALERT ENDPOINTS
# ============================================================================

@router.get("/alerts")
async def get_active_alerts() -> Dict[str, Any]:
    """Get all active alerts.

    Returns:
        Active alerts and counts
    """
    return {
        "alerts": alert_manager.get_active_alerts(),
        "counts": alert_manager.get_alert_count(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/alerts/history")
async def get_alert_history(
    limit: int = Query(50, description="Maximum alerts to return")
) -> Dict[str, Any]:
    """Get alert history.

    Args:
        limit: Maximum number of alerts

    Returns:
        Historical alerts
    """
    return {
        "alerts": alert_manager.get_alert_history(limit),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str) -> Dict[str, Any]:
    """Acknowledge an alert.

    Args:
        alert_id: Alert ID to acknowledge

    Returns:
        Confirmation
    """
    if alert_manager.acknowledge_alert(alert_id):
        return {"status": "acknowledged", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str) -> Dict[str, Any]:
    """Resolve an alert.

    Args:
        alert_id: Alert ID to resolve

    Returns:
        Confirmation
    """
    if alert_manager.resolve_alert(alert_id):
        return {"status": "resolved", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")


@router.post("/alerts/check/{video_id}")
async def check_alerts(video_id: str) -> Dict[str, Any]:
    """Check current metrics and generate alerts if needed.

    Args:
        video_id: Video to check

    Returns:
        Any new alerts generated
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    # Get current metrics
    if video_id in active_streams:
        metrics = active_streams[video_id].last_metrics
    else:
        processor = VideoProcessor(video_id)
        result = processor.get_single_frame_analysis()
        metrics = result["metrics"]

    # Check for queue metrics too
    if video_id in queue_analyzers:
        queue_data = queue_analyzers[video_id].analyze([], metrics.get("velocity", 0.8))
        metrics["waitTimeMinutes"] = queue_data.get("waitTimeMinutes", 0)

    # Check metrics and generate alerts
    new_alerts = alert_manager.check_metrics(metrics, zone=video_id)

    return {
        "video_id": video_id,
        "newAlerts": [a.to_dict() for a in new_alerts],
        "activeCount": sum(alert_manager.get_alert_count().values()),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


# ============================================================================
# GATE COUNTING ENDPOINTS (Tier 3)
# ============================================================================

def _get_gate_counter(video_id: str) -> BiDirectionalGateCounter:
    """Get or create gate counter for a video."""
    if video_id not in gate_counters:
        gate_counters[video_id] = BiDirectionalGateCounter()
    return gate_counters[video_id]


@router.get("/gates/{video_id}")
async def get_gate_stats(video_id: str) -> Dict[str, Any]:
    """Get bi-directional gate counting statistics.

    Args:
        video_id: ID of the video

    Returns:
        Gate crossing statistics for all gates
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    counter = _get_gate_counter(video_id)

    # Update with current detections if stream is active
    if video_id in active_streams:
        processor = active_streams[video_id]
        detections = [d.to_dict() for d in processor.last_detections]
        counter.update(detections)

    return {
        "video_id": video_id,
        "gates": counter.get_gate_stats(),
        "recent_crossings": counter.get_recent_crossings(10),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/gates/{video_id}/flow-rate")
async def get_gate_flow_rate(
    video_id: str,
    gate_id: str = Query("main_entrance", description="Gate ID"),
    window_seconds: float = Query(60.0, description="Time window in seconds")
) -> Dict[str, Any]:
    """Get entry/exit flow rate for a specific gate.

    Args:
        video_id: ID of the video
        gate_id: ID of the gate
        window_seconds: Time window for rate calculation

    Returns:
        Flow rate metrics
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    counter = _get_gate_counter(video_id)
    return {
        "video_id": video_id,
        **counter.get_flow_rate(gate_id, window_seconds),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.post("/gates/{video_id}/reset")
async def reset_gate_counters(
    video_id: str,
    gate_id: Optional[str] = Query(None, description="Specific gate to reset")
) -> Dict[str, str]:
    """Reset gate counters.

    Args:
        video_id: ID of the video
        gate_id: Optional specific gate to reset

    Returns:
        Confirmation
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    counter = _get_gate_counter(video_id)
    counter.reset(gate_id)

    return {"status": "reset", "video_id": video_id, "gate_id": gate_id or "all"}


# ============================================================================
# FLOW ANALYSIS ENDPOINTS (Tier 3)
# ============================================================================

def _get_flow_analyzer(video_id: str) -> FlowAnalyzer:
    """Get or create flow analyzer for a video."""
    if video_id not in flow_analyzers:
        flow_analyzers[video_id] = FlowAnalyzer()
    return flow_analyzers[video_id]


@router.get("/flow/{video_id}")
async def get_flow_analysis(video_id: str) -> Dict[str, Any]:
    """Get crowd flow direction analysis.

    Args:
        video_id: ID of the video

    Returns:
        Flow analysis including dominant direction and counter-flow events
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    analyzer = _get_flow_analyzer(video_id)

    # Update with current detections if stream is active
    if video_id in active_streams:
        processor = active_streams[video_id]
        detections = [d.to_dict() for d in processor.last_detections]
        result = analyzer.update(detections)
    else:
        result = analyzer.get_counter_flow_summary()

    return {
        "video_id": video_id,
        **result,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/flow/{video_id}/heatmap")
async def get_direction_heatmap(video_id: str) -> Dict[str, Any]:
    """Get direction heatmap data for visualization.

    Args:
        video_id: ID of the video

    Returns:
        Heatmap grid with movement direction data
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    analyzer = _get_flow_analyzer(video_id)

    return {
        "video_id": video_id,
        "heatmap": analyzer.get_direction_heatmap(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/flow/{video_id}/counter-flow")
async def get_counter_flow_events(video_id: str) -> Dict[str, Any]:
    """Get counter-flow detection summary.

    Args:
        video_id: ID of the video

    Returns:
        Counter-flow events and statistics
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    analyzer = _get_flow_analyzer(video_id)

    return {
        "video_id": video_id,
        **analyzer.get_counter_flow_summary(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


# ============================================================================
# DWELL TIME ENDPOINTS (Tier 3)
# ============================================================================

def _get_dwell_analyzer(video_id: str) -> DwellTimeAnalyzer:
    """Get or create dwell time analyzer for a video."""
    if video_id not in dwell_analyzers:
        dwell_analyzers[video_id] = DwellTimeAnalyzer()
    return dwell_analyzers[video_id]


@router.get("/dwell/{video_id}")
async def get_dwell_analysis(video_id: str) -> Dict[str, Any]:
    """Get dwell time analysis for all zones.

    Args:
        video_id: ID of the video

    Returns:
        Dwell time statistics per zone
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    analyzer = _get_dwell_analyzer(video_id)

    # Update with current detections if stream is active
    if video_id in active_streams:
        processor = active_streams[video_id]
        detections = [d.to_dict() for d in processor.last_detections]
        result = analyzer.update(detections)
    else:
        result = analyzer.get_summary()

    return {
        "video_id": video_id,
        **result
    }


@router.get("/dwell/{video_id}/anomalies")
async def get_dwell_anomalies(video_id: str) -> Dict[str, Any]:
    """Get people with anomalously long dwell times.

    Args:
        video_id: ID of the video

    Returns:
        List of anomalous dwell situations
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    analyzer = _get_dwell_analyzer(video_id)

    return {
        "video_id": video_id,
        "anomalies": analyzer.get_anomalous_dwells(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/dwell/{video_id}/history/{zone_id}")
async def get_zone_occupancy_history(
    video_id: str,
    zone_id: str,
    window_seconds: float = Query(300.0, description="Time window in seconds")
) -> Dict[str, Any]:
    """Get occupancy history for a specific zone.

    Args:
        video_id: ID of the video
        zone_id: ID of the zone
        window_seconds: Time window for history

    Returns:
        Occupancy history data
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    analyzer = _get_dwell_analyzer(video_id)

    return {
        "video_id": video_id,
        "zone_id": zone_id,
        "history": analyzer.get_zone_occupancy_history(zone_id, window_seconds),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


# ============================================================================
# ANOMALY DETECTION ENDPOINTS (Tier 3)
# ============================================================================

def _get_anomaly_detector(video_id: str) -> AnomalyDetector:
    """Get or create anomaly detector for a video."""
    if video_id not in anomaly_detectors:
        anomaly_detectors[video_id] = AnomalyDetector()
    return anomaly_detectors[video_id]


@router.get("/anomalies/{video_id}")
async def get_anomaly_analysis(video_id: str) -> Dict[str, Any]:
    """Get anomaly detection analysis.

    Args:
        video_id: ID of the video

    Returns:
        Anomaly detection results including falls, surges, etc.
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    detector = _get_anomaly_detector(video_id)

    # Update with current detections if stream is active
    if video_id in active_streams:
        processor = active_streams[video_id]
        detections = [d.to_dict() for d in processor.last_detections]
        result = detector.update(detections)
    else:
        result = {
            "new_anomalies": [],
            "total_anomalies": len(detector.anomaly_events),
            "average_crowd_velocity": detector.average_crowd_velocity,
            "active_tracks": len(detector.track_history)
        }

    return {
        "video_id": video_id,
        **result,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/anomalies/{video_id}/active")
async def get_active_anomalies(
    video_id: str,
    max_age_seconds: float = Query(300.0, description="Maximum age of anomalies to return")
) -> Dict[str, Any]:
    """Get recent/active anomalies.

    Args:
        video_id: ID of the video
        max_age_seconds: Maximum age of anomalies to return

    Returns:
        List of recent anomaly events
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    detector = _get_anomaly_detector(video_id)

    return {
        "video_id": video_id,
        "anomalies": detector.get_active_anomalies(max_age_seconds),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.get("/anomalies/{video_id}/summary")
async def get_anomaly_summary(video_id: str) -> Dict[str, Any]:
    """Get anomaly detection summary by type and severity.

    Args:
        video_id: ID of the video

    Returns:
        Summary statistics of all anomalies
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    detector = _get_anomaly_detector(video_id)

    return {
        "video_id": video_id,
        **detector.get_anomaly_summary(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@router.post("/anomalies/{video_id}/reset")
async def reset_anomaly_detection(video_id: str) -> Dict[str, str]:
    """Reset anomaly detection state.

    Args:
        video_id: ID of the video

    Returns:
        Confirmation
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    detector = _get_anomaly_detector(video_id)
    detector.reset()

    return {"status": "reset", "video_id": video_id}


# ============================================================================
# COMBINED TIER 3 ANALYSIS ENDPOINT
# ============================================================================

@router.get("/advanced/{video_id}")
async def get_advanced_analytics(video_id: str) -> Dict[str, Any]:
    """Get all Tier 3 advanced analytics in one call.

    Args:
        video_id: ID of the video

    Returns:
        Combined advanced analytics data
    """
    if video_id not in VIDEO_FILES:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    # Get or create all analyzers
    gate_counter = _get_gate_counter(video_id)
    flow_analyzer = _get_flow_analyzer(video_id)
    dwell_analyzer = _get_dwell_analyzer(video_id)
    anomaly_detector = _get_anomaly_detector(video_id)

    # Update all if stream is active
    if video_id in active_streams:
        processor = active_streams[video_id]
        detections = [d.to_dict() for d in processor.last_detections]

        gate_counter.update(detections)
        flow_analyzer.update(detections)
        dwell_analyzer.update(detections)
        anomaly_detector.update(detections)

    return convert_numpy_types({
        "video_id": video_id,
        "gates": gate_counter.get_gate_stats(),
        "flow": flow_analyzer.get_counter_flow_summary(),
        "dwell": dwell_analyzer.get_summary(),
        "anomalies": anomaly_detector.get_anomaly_summary(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    })
