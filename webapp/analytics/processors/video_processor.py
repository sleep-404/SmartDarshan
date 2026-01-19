"""Main video processing pipeline."""

from typing import Dict, Any, Optional, Generator, List
from pathlib import Path
import time
import cv2
import numpy as np

from models.detector import PeopleDetector, Detection
from models.tracker import PeopleTracker
from models.velocity import VelocityEstimator
from processors.metrics import MetricsAggregator
from config import PROCESS_FPS, get_video_path


class VideoProcessor:
    """Main video processing pipeline combining detection, tracking, and velocity."""

    def __init__(self, video_id: str):
        """Initialize the video processor.

        Args:
            video_id: ID of the video to process (e.g., "tirupati_queue")
        """
        self.video_id = video_id
        self.video_path = get_video_path(video_id)

        # Initialize models
        self.detector = PeopleDetector()
        self.tracker = PeopleTracker()
        self.velocity_estimator = VelocityEstimator()
        self.metrics_aggregator = MetricsAggregator()

        # Video capture
        self.cap: Optional[cv2.VideoCapture] = None
        self.video_fps: float = 30.0
        self.frame_skip: int = 1
        self.frame_count: int = 0
        self.total_frames: int = 0

        # Processing state
        self.is_processing = False
        self.last_frame: Optional[np.ndarray] = None
        self.last_detections: List[Detection] = []
        self.last_metrics: Dict[str, Any] = {}

    def open(self) -> bool:
        """Open the video file.

        Returns:
            True if video opened successfully
        """
        if not self.video_path.exists():
            raise FileNotFoundError(f"Video not found: {self.video_path}")

        self.cap = cv2.VideoCapture(str(self.video_path))

        if not self.cap.isOpened():
            return False

        self.video_fps = self.cap.get(cv2.CAP_PROP_FPS) or 30.0
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Calculate frame skip to achieve target PROCESS_FPS
        self.frame_skip = max(1, int(self.video_fps / PROCESS_FPS))

        return True

    def close(self):
        """Close the video file."""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
        self.is_processing = False

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """Process a single frame.

        Args:
            frame: BGR image as numpy array

        Returns:
            Dictionary with detections and metrics
        """
        # Run detection
        detections = self.detector.detect(frame)
        self.last_detections = detections

        # Get raw detections for tracker
        raw_dets = self.detector.get_raw_detections()

        # Update tracker
        tracked_objects = []
        if raw_dets is not None:
            tracked_objects = self.tracker.update(
                raw_dets["boxes"],
                raw_dets["confidences"],
                raw_dets["frame_size"]
            )

            # Update detection IDs from tracker
            for i, det in enumerate(detections):
                if i < len(tracked_objects):
                    det.track_id = f"T{tracked_objects[i].track_id:03d}"

        # Estimate velocity
        velocity, flow = self.velocity_estimator.estimate(
            frame,
            fps=PROCESS_FPS
        )

        # Get flow direction
        direction = self.velocity_estimator.get_motion_direction(flow)

        # Update metrics aggregator
        self.metrics_aggregator.update(
            people_count=len(detections),
            velocity=velocity,
            flow_rate=self.tracker.get_flow_rate()
        )

        # Get aggregated metrics
        metrics = self.metrics_aggregator.get_metrics()
        metrics["direction"] = direction
        self.last_metrics = metrics

        # Store last frame
        self.last_frame = frame

        return {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "frame_number": self.frame_count,
            "metrics": metrics,
            "detections": [d.to_dict() for d in detections]
        }

    def process_stream(self) -> Generator[Dict[str, Any], None, None]:
        """Process video as a stream, yielding results for each frame.

        Yields:
            Dictionary with frame analysis results
        """
        if not self.open():
            raise RuntimeError(f"Failed to open video: {self.video_path}")

        self.is_processing = True
        self.frame_count = 0

        try:
            while self.is_processing:
                ret, frame = self.cap.read()

                if not ret:
                    # Loop video
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    self.tracker.reset_flow_count()
                    continue

                self.frame_count += 1

                # Skip frames for efficiency
                if self.frame_count % self.frame_skip != 0:
                    continue

                # Process frame
                result = self.process_frame(frame)
                yield result

                # Control processing rate
                time.sleep(1.0 / PROCESS_FPS)

        finally:
            self.close()

    def get_single_frame_analysis(self, frame_number: Optional[int] = None) -> Dict[str, Any]:
        """Analyze a single frame from the video.

        Args:
            frame_number: Optional specific frame to analyze. If None, uses current/random.

        Returns:
            Dictionary with frame analysis results
        """
        if not self.open():
            raise RuntimeError(f"Failed to open video: {self.video_path}")

        try:
            if frame_number is not None:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            else:
                # Jump to a frame in the middle for better representation
                middle_frame = self.total_frames // 2
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)

            ret, frame = self.cap.read()

            if not ret:
                raise RuntimeError("Failed to read frame")

            return self.process_frame(frame)

        finally:
            self.close()

    def get_status(self) -> Dict[str, Any]:
        """Get current processing status.

        Returns:
            Status dictionary
        """
        return {
            "video_id": self.video_id,
            "video_path": str(self.video_path),
            "is_processing": self.is_processing,
            "frame_count": self.frame_count,
            "total_frames": self.total_frames,
            "video_fps": self.video_fps,
            "process_fps": PROCESS_FPS,
            "models": {
                "detector": self.detector.model_info,
                "tracker": self.tracker.model_info,
                "velocity": self.velocity_estimator.model_info
            }
        }


class MultiVideoProcessor:
    """Manage multiple video processors."""

    def __init__(self):
        self.processors: Dict[str, VideoProcessor] = {}

    def get_processor(self, video_id: str) -> VideoProcessor:
        """Get or create a processor for a video.

        Args:
            video_id: Video identifier

        Returns:
            VideoProcessor instance
        """
        if video_id not in self.processors:
            self.processors[video_id] = VideoProcessor(video_id)
        return self.processors[video_id]

    def stop_all(self):
        """Stop all processors."""
        for processor in self.processors.values():
            processor.is_processing = False
            processor.close()
