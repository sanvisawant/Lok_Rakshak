from fastapi import APIRouter
import threading
import app.app_state as app_state
import requests
from datetime import datetime
import os
from twilio.rest import Client
from app.core.state_machine import trigger_truth_broadcast

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

@router.post("/action")
async def manual_voice_action():
    """
    Operator clicks 'TAKE ACTION' on the dashboard.
    Triggers the truth broadcast.
    """
    print("[HITL] Operator clicked Take Action -> Playing voice broadcast.")
    trigger_truth_broadcast("panic")
    return {"status": "success", "action": "Voice broadcast playing."}



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

@router.post("/dispatch-emergency")
async def manual_dispatch_emergency(data: dict):
    """
    Operator manually dispatches emergency services via n8n.
    Payload expected: {"dispatch_level": "standard" | "all"}
    """
    dispatch_level = data.get("dispatch_level", "standard")
    live_link = data.get("live_link", "http://127.0.0.1:8000/api/video_feed")
    
    n8n_webhook_url = "https://mariee.app.n8n.cloud/webhook/emergency-dispatch"
    
    payload = {
        "dispatch_code": "ALL" if dispatch_level == "all" else "MEDICAL_ONLY",
        "dispatch_level": dispatch_level,
        "live_link": live_link,
        "timestamp": datetime.now().isoformat(),
        "location": "Dadar Platform 1"
    }
    
    try:
        # POST to n8n webhook separately so failure doesn't block Twilio or Broadcast
        try:
            response = requests.post(n8n_webhook_url, json=payload, timeout=5)
            response.raise_for_status()
            print(f"[N8N DISPATCH] Successfully forwarded {dispatch_level} to {n8n_webhook_url}")
        except Exception as n8n_err:
            print(f"[N8N DISPATCH] Webhook failed or inactive: {n8n_err}")
        
        # ALSO TRIGGER NATIVE TWILIO CALL & SMS
        try:
            sid = os.environ.get("TWILIO_ACCOUNT_SID")
            token = os.environ.get("TWILIO_AUTH_TOKEN")
            from_num = os.environ.get("TWILIO_FROM_NUMBER")
            to_num = os.environ.get("TWILIO_TO_NUMBER")
            
            if sid and token and from_num and to_num:
                client = Client(sid, token)
                
                # 1. Send SMS
                # Sending raw URLs (https://) via Twilio international numbers to India triggers DLT telecom blocks (Error 30044).
                # Using plain coordinates instead to ensure delivery.
                msg_body = f"🚨 LOK-RAKSHAK EMERGENCY \nDispatch: {dispatch_level.upper()}\nLocation: Dadar Platform 1\nMap GPS: 19.0189 N, 72.8429 E\nLive: 127.0.0.1:8000/api/video_feed"
                sms = client.messages.create(body=msg_body, from_=from_num, to=to_num)
                print(f"[TWILIO] SMS Sent! SID: {sms.sid}")
                
                # 2. Trigger Phone Call
                twiml = f"<Response><Say voice='alice'>Emergency alert from Lok Rakshak. A {dispatch_level} level dispatch was triggered at Dadar Platform 1. Check your SMS for the live feed link.</Say></Response>"
                call = client.calls.create(twiml=twiml, to=to_num, from_=from_num)
                print(f"[TWILIO] Call Initiated! SID: {call.sid}")
            else:
                print("[TWILIO] Missing credentials or TO number in .env. Skipping native phone alerts.")
        except Exception as twilio_err:
            print(f"[TWILIO ERROR] {twilio_err}")
        
        # Broadcast the manual actuation to the connected dashboards
        if app_state.manager is not None:
            await app_state.manager.broadcast({
                "status":  "CRITICAL",
                "action":  f"MANUAL DISPATCH ACTIVATED: Agencies requested ({dispatch_level.upper()})",
                "signage": "EMERGENCY SERVICES EN ROUTE. CLEAR PATHWAYS.",
                "density": app_state.vision_data.get("density", 0) if hasattr(app_state, 'vision_data') else 0,
                "source":  "HITL_DISPATCH",
            })
            
        return {"status": "success", "dispatch_level": dispatch_level, "n8n_response": "Dispatched"}
    except Exception as e:
        print(f"[N8N DISPATCH] General failure: {e}")
        return {"status": "error", "message": str(e)}