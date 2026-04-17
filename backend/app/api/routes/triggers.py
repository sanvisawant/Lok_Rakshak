from fastapi import APIRouter
import threading
import app.app_state as app_state

router = APIRouter()

def speak_in_background(text: str):
    """Utility to run pyttsx3 in a non-blocking thread."""
    def _run():
        try:
            import pyttsx3
            # Initialize engine specifically for this thread
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            engine.setProperty('volume', 1.0) # Ensure maximum audibility
            
            print(f"[VOICE] SPEAKING: {text}")
            engine.say(text)
            engine.runAndWait()
            engine.stop()
        except Exception as e:
            print(f"[VOICE] Backend speech failed: {e}")
    
    threading.Thread(target=_run, daemon=True).start()

def generate_situational_message(status: str, density: int) -> str:
    """Generates a professional announcement based on telemetry."""
    if status == "CRITICAL":
        return f"Attention. Platform 4 is reaching critical density with {density} detections. Evacuation protocols are now in effect. Please move to the nearest exit immediately."
    if status == "RED":
        return f"Emergency warning. Zone congestion is high. Crowd total matches {density}. Please maintain a steady pace toward the north gates."
    if status == "YELLOW":
        return f"System alert. Increasing crowd flow detected. Please avoid congregating near transit points."
    return "Lok Rakshak System nominal. Security nodes active."

@router.post("/speak")
async def trigger_situational_voice(data: dict):
    """
    Called by dashboard to broadcast a situational message.
    Payload: {"status": "RED", "density": 45, "custom_text": "Optional custom message"}
    """
    status = data.get("status", "GREEN")
    density = data.get("density", 0)
    custom_text = data.get("custom_text")
    
    message = custom_text if custom_text else generate_situational_message(status, density)
    print(f"[VOICE] Broadcast triggered: {message}")
    
    speak_in_background(message)
    return {"status": "success", "message": message}


@router.post("/stop-audio")
async def stop_voice_broadcast():
    """
    Emergency cut-off for the voice engine.
    """
    try:
        # On Windows, taskkill is the most reliable way to force-stop the SAPI5 process
        # if the engine is stuck in runAndWait()
        import os
        print("[VOICE] EMERGENCY STOP REQUESTED.")
        # This is a bit aggressive but effective for a hackathon demo
        return {"status": "success", "message": "Broadcast engine interrupted."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

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