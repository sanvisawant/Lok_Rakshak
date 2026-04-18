from fastapi import APIRouter
from pydantic import BaseModel
import app.app_state as app_state
import os
import requests

router = APIRouter()

class SOSPayload(BaseModel):
    user_id: str
    location: str = "Unknown — Citizen SDK"
    message: str = "Manual SOS triggered from citizen phone"

class VeritasPayload(BaseModel):
    text_report: str
    user_id: str = "Anonymous"

def _call_sarvam_api(prompt: str, api_key: str) -> str:
    # Based on Sarvam AI documentation structure
    url = "https://api.sarvam.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": api_key
    }
    data = {
        "model": "sarvam-1", # Using standard sarvam model, or adjust according to valid models
        "messages": [
            {"role": "system", "content": "You are Veritas, a Railway Safety AI. Your job is to classify text strictly as Fake or Verified."},
            {"role": "user", "content": f"Assess this report. You MUST start your response with 'Verdict: Fake.' or 'Verdict: Verified.' and then provide exactly 1 short sentence explaining why. Report: {prompt}"}
        ],
        "temperature": 0.4,
        "max_tokens": 250
    }
    resp = requests.post(url, headers=headers, json=data, timeout=5)
    resp.raise_for_status()
    # Handle both OpenAI-like struct or custom Sarvam structs
    json_resp = resp.json()
    if "choices" in json_resp and len(json_resp["choices"]) > 0:
        return json_resp["choices"][0]["message"]["content"]
    else:
        return str(json_resp)

def _call_gemini_api(prompt: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    data = {
        "system_instruction": {
            "parts": {"text": "You are Veritas, a Railway Safety AI. Determine if the user's report is 'Verified' or 'Fake/Unverified'. Briefly explain your verdict. Limit to 2 short sentences."}
        },
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 100
        }
    }
    resp = requests.post(url, headers=headers, json=data, timeout=5)
    resp.raise_for_status()
    result = resp.json()
    return result["candidates"][0]["content"]["parts"][0]["text"]

@router.post("/sos")
async def citizen_sos(data: SOSPayload):
    """
    Citizen presses the red SOS button. Immediate CRITICAL escalation.
    """
    print(f"[ALERTS] 🆘 SOS from {data.user_id} at {data.location}: '{data.message}'")

    if app_state.state_machine is not None:
        app_state.state_machine.force_critical(
            sector=data.location,
            density=app_state.vision_data.get("density", 0) if hasattr(app_state, 'vision_data') else 0,
        )

    if app_state.manager is not None:
        await app_state.manager.broadcast({
            "status":  "CRITICAL",
            "action":  "Citizen SOS received. Emergency services notified.",
            "signage": "STOP. PLATFORM CLOSED. USE ALTERNATE EXITS.",
            "density": app_state.vision_data.get("density", 0) if hasattr(app_state, 'vision_data') else 0,
            "source":  "CITIZEN_SOS",
            "user_id": data.user_id,
        })

    return {
        "status":   "SOS_RECEIVED",
        "message":  "Emergency services have been notified. Help is on the way.",
        "location": data.location,
    }


@router.post("/veritas")
async def verify_rumor(payload: VeritasPayload):
    """
    Veritas AI endpoint. Uses Sarvam AI -> Fallback to Gemini.
    """
    print(f"[VERITAS] Received request: {payload.text_report}")
    
    sarvam_key = os.environ.get("SARVAM_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")
    
    response_text = ""
    source = "None"
    
    if sarvam_key:
        try:
            print("[VERITAS] Attempting Sarvam API...")
            response_text = _call_sarvam_api(payload.text_report, sarvam_key)
            source = "Sarvam AI"
            print("[VERITAS] Sarvam API succeeded.")
        except Exception as e:
            print(f"[VERITAS] Sarvam API failed: {e}")
            response_text = ""
    
    if not response_text and gemini_key:
        try:
            print("[VERITAS] Attempting Gemini API Fallback...")
            response_text = _call_gemini_api(payload.text_report, gemini_key)
            source = "Gemini AI"
            print("[VERITAS] Gemini API succeeded.")
        except Exception as e:
            print(f"[VERITAS] Gemini API failed: {e}")
            response_text = ""
            
    if not response_text:
        source = "Fallback System"
        response_text = "System overloaded. Precautionary warning: Threat Unverified. Please avoid the area."
        
    return {
        "status": "VERIFIED" if "Verified" in response_text else "UNVERIFIED",
        "verdict": response_text,
        "source": source
    }
