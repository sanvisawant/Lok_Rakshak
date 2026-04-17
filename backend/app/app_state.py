# app/app_state.py
# ─────────────────────────────────────────────────────────────────────────────
# SHARED STATE SINGLETON
# Every FastAPI route imports from here.  One process, one truth.
# ─────────────────────────────────────────────────────────────────────────────

# Numeric risk scores injected by external nodes
acoustic_score: int = 0      # Laptop 2 writes here  (0=OK, 1=WARN, 3=CRITICAL)
sdk_score: int = 0           # Citizen phones write here (0-100)

# Latest vision data (written by the video loop in start_server.py)
vision_data: dict = {
    "density": 0,
    "vector_variance": 0.0,
    "compression_score": 0.0,
}

# Latest JPEG frame bytes (written by video loop, read by /api/video_feed)
latest_frame_bytes: bytes = b""

# These are assigned by start_server.py after construction
state_machine = None   # SystemStateMachine instance
manager = None         # ConnectionManager (WebSocket broadcaster)
risk_engine = None     # RiskEngine instance

video_source: any = 0  # 0 for webcam, or str path for uploaded video
