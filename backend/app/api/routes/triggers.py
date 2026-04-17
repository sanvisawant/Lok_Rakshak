# app/api/routes/triggers.py
# ─────────────────────────────────────────────────────────────────────────────
# HITL MANUAL OVERRIDE ENDPOINTS
# Called by the operator on Laptop 4 (React dashboard).
# ─────────────────────────────────────────────────────────────────────────────
from fastapi import APIRouter
import app.app_state as app_state

router = APIRouter()


@router.post("/dismiss")
async def dismiss_alert():
    """
    Operator clicks 'DISMISS THREAT' on the dashboard.
    Resets state machine to GREEN and broadcasts the new state.
    """
    if app_state.state_machine is not None:
        app_state.state_machine.manual_reset()
        # Reset injected scores too so we don't immediately re-trigger
        app_state.acoustic_score = 0
        app_state.sdk_score      = 20

    if app_state.manager is not None:
        await app_state.manager.broadcast({
            "status":  "GREEN",
            "action":  "Threat dismissed by operator. System nominal.",
            "signage": "Trains running on time. Have a safe journey.",
            "density": app_state.vision_data.get("density", 0),
            "source":  "HITL_DISMISS",
        })

    return {"status": "GREEN", "action": "Threat dismissed. Returning to GREEN."}


@router.post("/escalate")
async def manual_escalate():
    """
    Operator manually forces CRITICAL (e.g. they see something on CCTV).
    """
    if app_state.state_machine is not None:
        app_state.state_machine.force_critical(
            sector="Manual Override — Operator",
            density=app_state.vision_data.get("density", 0),
        )

    if app_state.manager is not None:
        await app_state.manager.broadcast({
            "status":  "CRITICAL",
            "action":  "MANUAL OVERRIDE — Operator activated CRITICAL. NDMA protocols live.",
            "signage": "STOP. PLATFORM CLOSED. USE ALTERNATE EXITS.",
            "density": app_state.vision_data.get("density", 0),
            "source":  "HITL_ESCALATE",
        })

    return {"status": "CRITICAL", "action": "Manual override. NDMA protocols activated."}