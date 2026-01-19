"""Configuration settings for the video analytics backend."""

from pathlib import Path
from typing import Dict, Any

# Paths
BASE_DIR = Path(__file__).parent
WEBAPP_DIR = BASE_DIR.parent
VIDEO_DIR = WEBAPP_DIR / "public" / "videos"
DATA_DIR = BASE_DIR / "data"

# Model settings
YOLO_MODEL = "yolov8s.pt"  # Small model for balance of speed/accuracy
YOLO_CONFIDENCE = 0.4  # Minimum detection confidence
YOLO_IOU_THRESHOLD = 0.5  # NMS IoU threshold
PERSON_CLASS_ID = 0  # COCO person class

# Processing settings
PROCESS_FPS = 5  # Process 5 frames per second (skip frames for efficiency)
MAX_TRACK_AGE = 30  # Max frames to keep track alive without detection
MIN_TRACK_HITS = 3  # Min detections before track is confirmed

# Velocity estimation (optical flow)
OPTICAL_FLOW_SCALE = 0.5  # Downscale factor for optical flow computation
PIXELS_PER_METER = 50  # Approximate pixels per meter (calibration needed)

# Density thresholds (people per square meter)
DENSITY_THRESHOLDS = {
    "free": 1.5,
    "moderate": 2.5,
    "congested": 3.5,
    # above 3.5 = severe
}

# Velocity thresholds (meters per second)
VELOCITY_THRESHOLDS = {
    "free": 0.8,
    "moderate": 0.5,
    "congested": 0.3,
    # below 0.3 = severe
}

# Zone definitions (will be loaded from calibration.json)
DEFAULT_ZONE_AREA_SQM = 100.0  # Default zone area in square meters

# WebSocket settings
WS_UPDATE_INTERVAL = 1.0  # Seconds between WebSocket updates

# Video file mapping
VIDEO_FILES: Dict[str, str] = {
    # Demo clips (10 seconds each, looping) - verified South Indian temple footage
    "density": "clips/clip_01_density.mp4",      # Crowd density - festival crowd
    "queue": "clips/clip_02_queue.mp4",          # Queue analysis - Tirumala queue
    "gate": "clips/clip_03_gate.mp4",            # Gate counting - Tirupati gate entry
    "flow": "clips/clip_04_flow.mp4",            # Flow detection - festival movement
    "safety": "clips/clip_05_safety.mp4",        # Safety monitoring - Tirupati infrastructure
    "accessibility": "clips/clip_06_accessibility.mp4",  # Wheelchair user at Tirupati
    "dwell": "clips/clip_07_dwell.mp4",          # Dwell time - Anna Prasadam hall
    "anomaly": "clips/clip_08_anomaly.mp4",      # Anomaly detection - Tirumala aerial

    # Original full-length videos (for extended testing)
    "tirupati_queue": "tirupati_queue.mp4",
    "ayodhya_crowd": "ayodhya_crowd.mp4",
    "temple_entrance": "temple_entrance.mp4",
    "festival_crowd": "festival_crowd.mp4",
}

def get_video_path(video_id: str) -> Path:
    """Get the full path to a video file."""
    filename = VIDEO_FILES.get(video_id, f"{video_id}.mp4")
    return VIDEO_DIR / filename
