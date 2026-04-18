# app/core/state_machine.py
import os
import time
import json
import threading

# ─────────────────────────────────────────────────────────────────────────────
# MODULE-LEVEL TTS FUNCTION  (was incorrectly inside the class — now fixed)
# Runs in a daemon thread so it NEVER blocks the FastAPI event loop.
# ─────────────────────────────────────────────────────────────────────────────
def trigger_truth_broadcast(rumor_type: str = "panic"):
    """Play a localized calming announcement from Laptop C's speaker."""
    messages = {
        "fire":      "Attention passengers. There is no fire on the platform. "
                     "The situation is completely secure. "
                     "Please do not panic and do not run.",
        "structure": "Attention passengers. The station infrastructure is entirely safe. "
                     "Please ignore false rumors and walk calmly to the nearest exit.",
        "panic":     "Attention passengers. Please remain calm. "
                     "Ignore unverified rumors. "
                     "Station staff are managing the situation. Walk — do not run.",
        "bomb":      "Attention passengers. There is no credible threat on this platform. "
                     "Please follow RPF instructions and walk calmly to the exits.",
    }
    message = messages.get(rumor_type, messages["panic"])

    def _speak():
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.setProperty("rate", 145)   # Slightly slower = clearer in crowd noise
            engine.say(message)
            engine.runAndWait()
            engine.stop()
        except Exception as e:
            print(f"[TTS] Warning: pyttsx3 unavailable — {e}")
            print(f"[TTS] Would have broadcast: {message}")

    t = threading.Thread(target=_speak, daemon=True)
    t.start()
    print(f"[TTS] 🔊 Truth broadcast triggered: type='{rumor_type}'")


# ─────────────────────────────────────────────────────────────────────────────
# RPF TACTICAL PING via Twilio SMS
# ─────────────────────────────────────────────────────────────────────────────
def send_rpf_sms(sector: str = "Platform 4 - South Gate", density: int = 0):
    """Fire an SMS to RPF duty officer via Twilio. Reads creds from .env."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token  = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_number = os.getenv("TWILIO_FROM_NUMBER", "")
    to_number   = os.getenv("TWILIO_TO_NUMBER", "")

    if not all([account_sid, auth_token, from_number, to_number]):
        print("[TWILIO] ⚠️  Credentials not set in .env — skipping SMS. "
              f"Would have pinged RPF: CRITICAL at {sector}, density={density}")
        return

    def _send():
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            body = (
                f"🚨 LOK-RAKSHAK ALERT | CRITICAL CROWD EVENT\n"
                f"Location : {sector}\n"
                f"Density  : {density} persons detected\n"
                f"Action   : IMMEDIATE DEPLOYMENT REQUIRED\n"
                f"System   : NDMA Auto-Protocol Activated"
            )
            message = client.messages.create(body=body, from_=from_number, to=to_number)
            print(f"[TWILIO] ✅ RPF SMS sent — SID: {message.sid}")
        except Exception as e:
            print(f"[TWILIO] ❌ SMS failed: {e}")

    threading.Thread(target=_send, daemon=True).start()


# ─────────────────────────────────────────────────────────────────────────────
# STATE MACHINE
# ─────────────────────────────────────────────────────────────────────────────
class SystemStateMachine:
    def __init__(self):
        self.current_state      = "GREEN"
        self.red_state_start    = None
        self.failover_seconds   = 15
        self._broadcast_fired   = False   # Guard: TTS fires only ONCE per CRITICAL event
        self._rpf_sms_fired     = False   # Guard: SMS fires only ONCE per CRITICAL event

        # Load NDMA protocols (path relative to where uvicorn is launched — backend/)
        protocols_path = os.path.join(os.path.dirname(__file__), "ndma_protocols.json")
        with open(protocols_path, "r") as f:
            self.protocols = json.load(f)

    # ── Public API ────────────────────────────────────────────────────────────

    def update_state(self, predicted_risk_level: str) -> dict:
        """
        Called every video frame. Applies the 15-second HITL timer logic.
        Returns the full response dict for WebSocket broadcast.
        """
        if self.current_state == "CRITICAL":
            self._handle_critical()
            return self._get_response()

        if predicted_risk_level == "RED":
            if self.current_state != "RED":
                self.current_state   = "RED"
                self.red_state_start = time.time()
                print("🚨 THREAT VERIFICATION REQUIRED — HITL Queue Activated (15s timer)")
            else:
                elapsed = time.time() - self.red_state_start
                if elapsed >= self.failover_seconds:
                    # User requested to disable autonomous escalation to critical
                    pass

        elif predicted_risk_level == "CRITICAL":
            self._enter_critical()

        else:
            # GREEN or YELLOW — reset timer and broadcast guard
            self.current_state    = predicted_risk_level
            self.red_state_start  = None
            self._broadcast_fired = False
            self._rpf_sms_fired   = False

        return self._get_response()

    def force_critical(self, sector: str = "Platform 4", density: int = 0):
        """Called directly by acoustic/SDK routes to skip the 15s timer."""
        print(f"⚡ FORCE CRITICAL — triggered by external node (sector={sector})")
        self._enter_critical(sector=sector, density=density)

    def manual_reset(self):
        """Called by the UI 'Dismiss Threat' button."""
        print("✅ Threat dismissed by operator. Returning to GREEN.")
        self.current_state    = "GREEN"
        self.red_state_start  = None
        self._broadcast_fired = False
        self._rpf_sms_fired   = False

    # ── Internal ──────────────────────────────────────────────────────────────

    def _enter_critical(self, sector: str = "Platform 4", density: int = 0):
        self.current_state = "CRITICAL"
        self._handle_critical(sector=sector, density=density)

    def _handle_critical(self, sector: str = "Platform 4", density: int = 0):
        """Side-effects for CRITICAL state — each fires only once."""
        if not self._broadcast_fired:
            # Removed automatic TTS broadcast per user request
            self._broadcast_fired = True

        if not self._rpf_sms_fired:
            send_rpf_sms(sector=sector, density=density)
            self._rpf_sms_fired = True

    def _get_response(self) -> dict:
        return {
            "status":   self.current_state,
            "protocol": self.protocols.get(self.current_state, {}),
        }