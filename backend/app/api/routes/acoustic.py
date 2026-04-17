# app/api/routes/acoustic.py
# ─────────────────────────────────────────────────────────────────────────────
# LAPTOP 2 → LAPTOP C LINK
# Laptop 2 runs acoustic_node.py and POSTs here when it hears a panic word.
# ─────────────────────────────────────────────────────────────────────────────
from fastapi import APIRouter
from pydantic import BaseModel
import app.app_state as app_state

router = APIRouter()


class AcousticPayload(BaseModel):
    score: int          # 0 = Normal, 1 = Warning, 3 = Critical
    keyword: str = ""   # The detected word e.g. "fire", "bomb"
    location: str = "Unknown"


@router.post("/feed")
async def receive_acoustic_feed(data: AcousticPayload):
    """
    Called by Laptop 2 (acoustic_node.py) when a panic keyword is detected.
    Directly updates the shared acoustic_score and can force CRITICAL state.
    """
    app_state.acoustic_score = data.score
    print(f"[ACOUSTIC] 🎤 Score={data.score} | Keyword='{data.keyword}' | Location={data.location}")

    if data.score == 3 and app_state.state_machine is not None:
        # Bypass the 15s HITL timer — acoustic panic = immediate CRITICAL
        app_state.state_machine.force_critical(
            sector=data.location,
            density=app_state.vision_data.get("density", 0)
        )
        # Broadcast the CRITICAL state immediately via WebSocket
        if app_state.manager is not None:
            protocol = app_state.state_machine._get_response()
            await app_state.manager.broadcast({
                "status":  protocol["status"],
                "action":  protocol["protocol"].get("action", ""),
                "signage": protocol["protocol"].get("signage_message", ""),
                "density": app_state.vision_data.get("density", 0),
                "source":  "ACOUSTIC",
                "keyword": data.keyword,
            })
        return {
            "status":  "CRITICAL_TRIGGERED",
            "message": f"Acoustic panic word '{data.keyword}' detected — NDMA protocols activated."
        }

    return {
        "status":  "LOGGED",
        "score":   data.score,
        "message": f"Acoustic score updated to {data.score}"
    }


@router.get("/status")
async def get_acoustic_status():
    return {"acoustic_score": app_state.acoustic_score}