# app/ml/yolo_inference.py
import cv2
import numpy as np
from ultralytics import YOLO

class VisionEngine:
    def __init__(self):
        # Using YOLOv8n (nano) for maximum speed during the hackathon
        self.model = YOLO('yolov8n.pt')
        self.prev_gray = None
        self._frame_count = 0
        self._last_boxes = []      # cache boxes between YOLO runs
        self._last_count = 0       # cache person count between YOLO runs

    def process_frame(self, frame, run_yolo=True):
        """
        Args:
            frame     : BGR numpy array (already resized to 640×480)
            run_yolo  : if False, skip YOLO inference and reuse cached results
                        (set by the caller for frame-skipping to reduce lag)
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # ── 1. YOLO Person Detection (every N-th frame) ────────────────────────
        if run_yolo:
            # Lower confidence (0.10) to catch every person. Use iou (0.45) for NMS.
            results = self.model(frame, classes=[0], verbose=False, conf=0.10, iou=0.45)
            self._last_boxes = results[0].boxes
            self._last_count = len(self._last_boxes)

        person_count = self._last_count

        # Draw yellow bounding boxes (thick) on the frame
        for box in self._last_boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0]) if hasattr(box, 'conf') else 1.0
            # Yellow box, thickness 2 (sleeker but visible)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            # Confidence label
            label = f"P {conf:.2f}"
            cv2.putText(
                frame, label, (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1
            )

        # ── 2. Optical Flow (Crowd Physics) ───────────────────────────────────
        vector_variance = 0.0
        if self.prev_gray is not None:
            flow = cv2.calcOpticalFlowFarneback(
                self.prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )
            magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            vector_variance = float(np.var(angle))  # High variance = chaotic movement

        self.prev_gray = gray

        # ── 3. Compression score (0.0 – 1.0) ─────────────────────────────────
        compression_score = min(person_count / 50.0, 1.0)

        return {
            "density": person_count,
            "vector_variance": float(vector_variance),
            "compression_score": float(compression_score),
        }