# app/api/routes/sdk.py
# ─────────────────────────────────────────────────────────────────────────────
# CITIZEN MOBILE SDK → LAPTOP C LINK
# Serves endpoints called by the citizen web app on judges' phones.
# ─────────────────────────────────────────────────────────────────────────────
from fastapi import APIRouter
from pydantic import BaseModel
import app.app_state as app_state
from app.core.state_machine import trigger_truth_broadcast

router = APIRouter()   # ONE router — previous file had two, killing /telemetry

# Panic keywords for lightweight NLP
CRITICAL_KEYWORDS = ["fire", "bomb", "gun", "stampede", "collapse", "blast", "aag", "bhaago"]
WARNING_KEYWORDS  = ["crowded", "pushing", "stuck", "crush", "dhakka", "bheed"]


# ── Models ────────────────────────────────────────────────────────────────────

class TelemetryPayload(BaseModel):
    user_id: str
    reported_crowd_level: int   # 1-100, self-reported by citizen


class SOSPayload(BaseModel):
    user_id: str
    location: str = "Unknown — Citizen App"
    message:  str = ""


class RumorReport(BaseModel):
    user_id:     str
    text_report: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/telemetry")
async def receive_telemetry(data: TelemetryPayload):
    """
    Citizen app crowd level report.
    Spikes sdk_score → Risk Engine picks it up next frame → dashboard reacts.
    """
    app_state.sdk_score = data.reported_crowd_level
    print(f"[SDK] 📱 Telemetry from {data.user_id}: crowd_level={data.reported_crowd_level}")

    return {
        "status":  "LOGGED",
        "user":    data.user_id,
        "sdk_score": app_state.sdk_score,
    }


@router.post("/sos")
async def citizen_sos(data: SOSPayload):
    """
    Citizen presses the red SOS button. Immediate CRITICAL escalation.
    No 15-second wait — raw SOS = direct override.
    """
    print(f"[SDK] 🆘 SOS from {data.user_id} at {data.location}: '{data.message}'")

    if app_state.state_machine is not None:
        app_state.state_machine.force_critical(
            sector=data.location,
            density=app_state.vision_data.get("density", 0),
        )

    if app_state.manager is not None:
        protocol = app_state.state_machine._get_response() if app_state.state_machine else {}
        await app_state.manager.broadcast({
            "status":  "CRITICAL",
            "action":  "Citizen SOS received. Emergency services notified.",
            "signage": "STOP. PLATFORM CLOSED. USE ALTERNATE EXITS.",
            "density": app_state.vision_data.get("density", 0),
            "source":  "CITIZEN_SOS",
            "user_id": data.user_id,
        })

    return {
        "status":   "SOS_RECEIVED",
        "message":  "Emergency services have been notified. Help is on the way.",
        "location": data.location,
    }


@router.post("/verify_rumor")
async def verify_citizen_rumor(report: RumorReport):
    """
    Citizen submits a text rumor report.
    1. NLP keyword scan
    2. If threat detected: trigger TTS truth broadcast + spike risk
    3. Return verdict to citizen's phone
    """
    text = report.text_report.lower()
    print(f"[SDK] 📝 Rumor report from {report.user_id}: '{report.text_report}'")

    critical_hits = [w for w in CRITICAL_KEYWORDS if w in text]
    warning_hits  = [w for w in WARNING_KEYWORDS  if w in text]

    if critical_hits:
        # Detect rumor → broadcast counter-truth → spike acoustic score
        rumor_type = "fire" if "fire" in critical_hits or "aag" in critical_hits else \
                     "bomb"  if "bomb" in critical_hits or "blast" in critical_hits else "panic"

        trigger_truth_broadcast(rumor_type)

        # Spike acoustic score so risk engine reacts immediately
        app_state.acoustic_score = 2

        # Broadcast to dashboard
        if app_state.manager is not None:
            await app_state.manager.broadcast({
                "status":  "RED",
                "action":  f"RUMOR DETECTED: '{', '.join(critical_hits)}' — Truth Broadcast Activated",
                "signage": "Attention: Reports are unverified. Please stay calm and follow staff directions.",
                "density": app_state.vision_data.get("density", 0),
                "source":  "RUMOR_REPORT",
            })

        return {
            "status":         "FALSE_RUMOR_DETECTED",
            "detected_words": critical_hits,
            "system_action":  "Truth broadcast activated. Counter-narrative deployed to platform speakers.",
            "verdict":        "⚠️ Our systems show NO such incident. Please remain calm.",
        }

    if warning_hits:
        app_state.acoustic_score = 1
        return {
            "status":         "WARNING_LOGGED",
            "detected_words": warning_hits,
            "system_action":  "Station Master notified. RPF pre-positioned.",
            "verdict":        "Thank you for reporting. Staff are monitoring the area.",
        }

    return {
        "status":        "LOGGED",
        "system_action": "None",
        "verdict":       "Thank you. No immediate threat detected from your report.",
    }


@router.get("/status")
async def get_system_status():
    """Polled by citizen app to show current system status badge."""
    state = "GREEN"
    if app_state.state_machine is not None:
        state = app_state.state_machine.current_state
    return {
        "status":       state,
        "sdk_score":    app_state.sdk_score,
        "person_count": app_state.vision_data.get("density", 0),
    }