# start_server.py  — Lok-Rakshak Brain (Laptop C)
# Load .env secrets (Twilio creds, SERVER_HOST) before anything else
from dotenv import load_dotenv
load_dotenv()  # Reads backend/.env if it exists — silently skips if not found
# ─────────────────────────────────────────────────────────────────────────────
# KEY FIXES vs original:
#   1. cv2 capture runs in ThreadPoolExecutor — NEVER blocks the event loop
#   2. CORS middleware added — React dashboard & mobile SDK can call this
#   3. MJPEG video stream endpoint — live webcam in the React CameraGrid
#   4. reload=False — reload=True + background tasks = double-execution crash
#   5. All routes share app_state — consistent global state across all modules
# ─────────────────────────────────────────────────────────────────────────────
import asyncio
import json
import cv2
import numpy as np
import shutil
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# ── Core imports ──────────────────────────────────────────────────────────────
import app.app_state as app_state
from app.ml.yolo_inference import VisionEngine
from app.core.risk_engine import RiskEngine
from app.core.state_machine import SystemStateMachine
from app.websocket.manager import ConnectionManager

# ── Route imports ──────────────────────────────────────────────────────────────
from app.api.routes import acoustic, triggers, sdk

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="Lok-Rakshak Control Plane", version="2.0.0")

# CORS — required so Laptop 4 (React) and phones can hit this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Hackathon: allow all. In prod, lock to dashboard IP.
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the citizen SDK app as static HTML
import os
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Register route modules
app.include_router(acoustic.router, prefix="/api/acoustic", tags=["Acoustic Node"])
app.include_router(triggers.router, prefix="/api/triggers", tags=["HITL Controls"])
app.include_router(sdk.router,      prefix="/api/sdk",      tags=["B2G SDK"])

# ── Initialise singletons & inject into shared state ─────────────────────────
_vision_engine = VisionEngine()
_risk_engine   = RiskEngine()
_state_machine = SystemStateMachine()
_manager       = ConnectionManager()

app_state.state_machine = _state_machine
app_state.manager       = _manager
app_state.risk_engine   = _risk_engine

# Thread pool for blocking cv2 work (keeps the async loop free)
_executor = ThreadPoolExecutor(max_workers=2)


# ── WebSocket endpoint ────────────────────────────────────────────────────────
@app.websocket("/ws/risk")
async def websocket_endpoint(websocket: WebSocket):
    await _manager.connect(websocket)
    print(f"[WS] Dashboard connected — {len(_manager.active_connections)} client(s)")
    try:
        while True:
            # Keep the connection alive; we send data via broadcast(), not receive
            await websocket.receive_text()
    except WebSocketDisconnect:
        _manager.disconnect(websocket)
        print(f"[WS] Dashboard disconnected — {len(_manager.active_connections)} client(s)")


# ── MJPEG Live Video Stream ───────────────────────────────────────────────────
def _generate_mjpeg():
    """Generator that yields JPEG frames for the browser <img> tag."""
    while True:
        frame_bytes = app_state.latest_frame_bytes
        if frame_bytes:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame_bytes +
                b"\r\n"
            )

@app.get("/api/video_feed")
async def video_feed():
    """
    MJPEG stream — point an <img src="..."> at this to see live YOLO feed.
    Works with Chrome and Firefox without any plugins.
    """
    return StreamingResponse(
        _generate_mjpeg(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


# ── Citizen SDK Web App (served as HTML page) ─────────────────────────────────
@app.get("/sdk", response_class=HTMLResponse)
async def serve_sdk():
    sdk_path = os.path.join(static_dir, "sdk_app.html")
    if os.path.exists(sdk_path):
        with open(sdk_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<h1>SDK app not found</h1>", status_code=404)


# ── QR Code for SDK URL ───────────────────────────────────────────────────────
@app.get("/api/sdk_qr")
async def get_sdk_qr():
    """Returns a PNG QR code pointing to the /sdk citizen app."""
    try:
        import qrcode
        import io
        from fastapi.responses import Response
        # The QR points to this server's /sdk endpoint
        # We use a relative URL so it works on any IP
        host = os.getenv("SERVER_HOST", "192.168.1.100")
        url  = f"http://{host}:8000/sdk"
        img  = qrcode.make(url)
        buf  = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return Response(content=buf.read(), media_type="image/png")
    except ImportError:
        return {"error": "qrcode package not installed. Run: pip install qrcode[pil]"}


# ── Status endpoint (polled by citizen app) ───────────────────────────────────
@app.get("/api/status")
async def system_status():
    return {
        "status":       app_state.state_machine.current_state,
        "density":      app_state.vision_data.get("density", 0),
        "acoustic":     app_state.acoustic_score,
        "sdk_score":    app_state.sdk_score,
    }


# ── Video Source Endpoints ───────────────────────────────────────────────────
@app.post("/api/upload_video")
async def upload_video(file: UploadFile = File(...)):
    """Uploads a video file and switches the vision pipeline to use it."""
    # Always save relative to the backend directory so cv2 can find the file
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    save_path = os.path.join(backend_dir, "uploads", file.filename)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    app_state.video_source = save_path
    print(f"[UPLOAD] Switched to uploaded video: {save_path}")
    return {"status": "success", "file": save_path}

@app.post("/api/set_camera")
async def set_camera():
    """Switches back to the live webcam feed."""
    app_state.video_source = 0
    return {"status": "success"}


# ── Frame skip counter (module-level) ───────────────────────────────────────
_frame_skip_counter = 0
YOLO_EVERY_N_FRAMES = 3   # Run YOLO inference only every 3rd frame → ~3× less lag

# ── Background Task: Vision Pipeline ─────────────────────────────────────────
def _capture_and_process_frame(cap: cv2.VideoCapture):
    """
    Runs in a ThreadPoolExecutor (NOT the async loop).
    Does the heavy cv2 + YOLO work and returns packaged results.
    Frame-skipping: YOLO runs every YOLO_EVERY_N_FRAMES frames.
    Cached bounding boxes are redrawn on skipped frames to keep feed smooth.
    """
    global _frame_skip_counter

    ret, frame = cap.read()
    if not ret:
        return None, None, None

    frame = cv2.resize(frame, (640, 480))

    # Decide whether to run YOLO this frame
    _frame_skip_counter += 1
    run_yolo = (_frame_skip_counter % YOLO_EVERY_N_FRAMES == 0)

    # Vision ML (YOLO + Optical Flow) — passes run_yolo flag for frame-skipping
    vision_data = _vision_engine.process_frame(frame, run_yolo=run_yolo)

    # ── Overlay bar at the top of the frame ──────────────────────────────────
    state   = app_state.state_machine.current_state
    density = vision_data['density']
    colors  = {
        "GREEN":    (0, 210, 0),
        "YELLOW":   (0, 210, 210),
        "RED":      (0, 60, 230),
        "CRITICAL": (0, 0, 255),
    }
    bar_color = colors.get(state, (0, 210, 0))

    # Dark bar background (taller for larger text)
    cv2.rectangle(frame, (0, 0), (640, 52), (0, 0, 0), -1)

    # Status + state label  (font scale 0.8 → readable even when the img is small)
    cv2.putText(
        frame,
        f"LOK-RAKSHAK  |  {state}",
        (10, 26),
        cv2.FONT_HERSHEY_SIMPLEX, 0.75, bar_color, 2
    )

    # Person count — larger, right-aligned so it stands out
    count_text = f"PERSONS: {density}"
    text_size, _ = cv2.getTextSize(count_text, cv2.FONT_HERSHEY_SIMPLEX, 0.85, 2)
    cx = 640 - text_size[0] - 10
    cv2.putText(
        frame, count_text,
        (cx, 42),
        cv2.FONT_HERSHEY_SIMPLEX, 0.85,
        (0, 255, 255),   # Cyan — same as YOLO boxes
        2
    )

    # Encode to JPEG — slightly higher quality so text stays sharp
    _, jpeg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])

    return vision_data, jpeg.tobytes(), frame


async def _video_pipeline():
    """
    Async coroutine that owns the camera lifecycle.
    All blocking work is offloaded to the thread pool.
    """
    current_source = app_state.video_source
    cap = cv2.VideoCapture(current_source)
    if not cap.isOpened():
        print(f"[VISION] ⚠️  No camera found on index {current_source}. Video feed will show blank.")

    loop = asyncio.get_event_loop()

    while True:
        # Check if source changed
        if app_state.video_source != current_source:
            cap.release()
            current_source = app_state.video_source
            cap = cv2.VideoCapture(current_source)
            if not cap.isOpened():
                print(f"[VISION] ⚠️  Could not open new source: {current_source}")

        if not cap.isOpened():
            await asyncio.sleep(1)
            continue

        try:
            # Offload blocking capture+ML to thread — event loop stays free
            vision_data, frame_bytes, _ = await loop.run_in_executor(
                _executor, _capture_and_process_frame, cap
            )

            if vision_data is None:
                # If we reached the end of an uploaded video, loop it
                if isinstance(current_source, str):
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                # Camera read failed — wait and retry
                await asyncio.sleep(0.5)
                continue

            # Update shared state
            app_state.vision_data       = vision_data
            app_state.latest_frame_bytes = frame_bytes

            # Risk Engine: combine all three data streams
            predicted_risk = _risk_engine.calculate_risk(
                vision_data,
                acoustic_score=app_state.acoustic_score,
                sdk_score=app_state.sdk_score,
            )

            # State Machine: apply HITL timer + NDMA logic
            system_response = _state_machine.update_state(predicted_risk)

            # Broadcast to all WebSocket clients (Laptop 4 dashboard)
            payload = {
                "status":   system_response["status"],
                "action":   system_response["protocol"].get("action", ""),
                "signage":  system_response["protocol"].get("signage_message", ""),
                "density":  vision_data["density"],
                "variance": round(vision_data["vector_variance"], 3),
                "compress": round(vision_data["compression_score"], 3),
                "acoustic": app_state.acoustic_score,
                "sdk":      app_state.sdk_score,
                "source":   "VISION",
            }
            await _manager.broadcast(payload)

        except Exception as e:
            print(f"[VISION] Pipeline error: {e}")

        # ~10 FPS — fast enough for demo, light enough not to melt the laptop
        await asyncio.sleep(0.1)


# ── Startup ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print("  LOK-RAKSHAK CONTROL PLANE  |  v2.0  |  ACTIVE")
    print("=" * 60)
    asyncio.create_task(_video_pipeline())
    print("[SERVER] Vision pipeline started.")
    print("[SERVER] WebSocket endpoint: ws://0.0.0.0:8000/ws/risk")
    print("[SERVER] Citizen SDK:        http://0.0.0.0:8000/sdk")
    print("[SERVER] Live video:         http://0.0.0.0:8000/api/video_feed")


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # IMPORTANT: reload=False — reload=True with asyncio background tasks
    # causes them to run TWICE (once per process), doubling YOLO load and
    # causing instant memory exhaustion on a demo laptop.
    uvicorn.run(
        "start_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )