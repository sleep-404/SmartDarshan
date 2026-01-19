"""YOLOv8 People Detector."""

from typing import List, Dict, Any, Optional
import numpy as np
from ultralytics import YOLO

from config import YOLO_MODEL, YOLO_CONFIDENCE, YOLO_IOU_THRESHOLD, PERSON_CLASS_ID


class Detection:
    """A single person detection."""

    def __init__(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        confidence: float,
        track_id: Optional[str] = None
    ):
        self.x = x  # Top-left x (percentage of frame width)
        self.y = y  # Top-left y (percentage of frame height)
        self.width = width  # Width (percentage)
        self.height = height  # Height (percentage)
        self.confidence = confidence  # Detection confidence (0-100)
        self.track_id = track_id  # Tracking ID if available

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        result = {
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "width": round(self.width, 2),
            "height": round(self.height, 2),
            "confidence": round(self.confidence, 1),
        }
        if self.track_id is not None:
            result["id"] = self.track_id
        return result

    @property
    def center(self) -> tuple:
        """Get center point of detection."""
        return (self.x + self.width / 2, self.y + self.height / 2)

    @property
    def bbox_xyxy(self) -> tuple:
        """Get bounding box as (x1, y1, x2, y2) percentages."""
        return (self.x, self.y, self.x + self.width, self.y + self.height)


class PeopleDetector:
    """YOLOv8-based people detector."""

    def __init__(self, model_path: str = YOLO_MODEL):
        """Initialize the detector with a YOLO model.

        Args:
            model_path: Path to YOLO model weights or model name (e.g., "yolov8s.pt")
        """
        self.model = YOLO(model_path)
        self.confidence = YOLO_CONFIDENCE
        self.iou_threshold = YOLO_IOU_THRESHOLD
        self._last_raw_detections = None  # Store for tracker use

    def detect(self, frame: np.ndarray) -> List[Detection]:
        """Detect people in a frame.

        Args:
            frame: BGR image as numpy array (H, W, C)

        Returns:
            List of Detection objects for detected people
        """
        height, width = frame.shape[:2]

        # Run YOLO detection
        results = self.model(
            frame,
            conf=self.confidence,
            iou=self.iou_threshold,
            classes=[PERSON_CLASS_ID],  # Only detect people
            verbose=False
        )[0]

        detections = []

        if results.boxes is not None and len(results.boxes) > 0:
            boxes = results.boxes.xyxy.cpu().numpy()  # (x1, y1, x2, y2)
            confidences = results.boxes.conf.cpu().numpy()

            # Store raw detections for tracker
            self._last_raw_detections = {
                "boxes": boxes,
                "confidences": confidences,
                "frame_size": (width, height)
            }

            for box, conf in zip(boxes, confidences):
                x1, y1, x2, y2 = box

                # Convert to percentage coordinates
                det = Detection(
                    x=(x1 / width) * 100,
                    y=(y1 / height) * 100,
                    width=((x2 - x1) / width) * 100,
                    height=((y2 - y1) / height) * 100,
                    confidence=float(conf) * 100
                )
                detections.append(det)
        else:
            self._last_raw_detections = None

        return detections

    def get_raw_detections(self) -> Optional[Dict[str, Any]]:
        """Get the last raw detection results for use by tracker."""
        return self._last_raw_detections

    @property
    def model_info(self) -> Dict[str, str]:
        """Get model information."""
        return {
            "name": "YOLOv8s",
            "task": "People Detection",
            "accuracy": "90-95%"
        }
