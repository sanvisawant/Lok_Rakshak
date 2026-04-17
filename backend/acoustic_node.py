# acoustic_node.py — Laptop 2 (Acoustic Threat Node)
# ─────────────────────────────────────────────────────────────────────────────
# Run this script on Laptop 2:
#   python acoustic_node.py
#
# It listens to the microphone continuously, runs keyword NLP,
# and POSTs the risk score to Laptop C's FastAPI server.
#
# ⚙️  ONLY CHANGE NEEDED: set LAPTOP_C_IP below to Laptop C's actual LAN IP.
# ─────────────────────────────────────────────────────────────────────────────

import time
import requests
import speech_recognition as sr

# ══════════════════════════════════════════════════════════════════════════════
#  CONFIG — set this to Laptop C's IP before the demo
LAPTOP_C_IP = "192.168.1.100"   # ← CHANGE THIS
BACKEND_URL = f"http://{LAPTOP_C_IP}:8000/api/acoustic/feed"
# ══════════════════════════════════════════════════════════════════════════════

CRITICAL_KEYWORDS = ["fire", "bomb", "gun", "stampede", "collapse", "help",
                     "bhago", "bachao", "aag", "blast"]
WARNING_KEYWORDS  = ["crowded", "pushing", "stuck", "dhakka", "bheed", "slow"]

LOCATION = "Platform 4 — Acoustic Station"

def classify(text: str):
    """Returns (score, matched_keyword) for the transcribed text."""
    text = text.lower()
    for kw in CRITICAL_KEYWORDS:
        if kw in text:
            return 3, kw
    for kw in WARNING_KEYWORDS:
        if kw in text:
            return 1, kw
    return 0, ""


def post_score(score: int, keyword: str):
    payload = {"score": score, "keyword": keyword, "location": LOCATION}
    try:
        resp = requests.post(BACKEND_URL, json=payload, timeout=3)
        resp.raise_for_status()
        print(f"[ACOUSTIC] ✅ Posted score={score}, keyword='{keyword}' → {resp.json()['status']}")
    except requests.exceptions.ConnectionError:
        print(f"[ACOUSTIC] ❌ Cannot reach Laptop C at {LAPTOP_C_IP}:8000. Is the server running?")
    except Exception as e:
        print(f"[ACOUSTIC] ❌ POST failed: {e}")


def main():
    recognizer = sr.Recognizer()
    mic        = sr.Microphone()

    print("=" * 60)
    print("  LOK-RAKSHAK ACOUSTIC NODE  |  LISTENING...")
    print(f"  Sending to: {BACKEND_URL}")
    print("  Say: 'Fire', 'Bhago', 'Bomb', 'Stampede' to trigger CRITICAL")
    print("=" * 60)

    # Calibrate ambient noise once at startup
    with mic as source:
        print("[ACOUSTIC] Calibrating ambient noise (2s)...")
        recognizer.adjust_for_ambient_noise(source, duration=2)
        print("[ACOUSTIC] Calibration done. Listening...")

    last_score = 0

    while True:
        try:
            with mic as source:
                # phrase_time_limit: don't wait longer than 4s for a phrase
                audio = recognizer.listen(source, phrase_time_limit=4)

            text = recognizer.recognize_google(audio)
            print(f"[ACOUSTIC] 🎤 Heard: \"{text}\"")

            score, keyword = classify(text)

            if score > 0:
                print(f"[ACOUSTIC] 🚨 THREAT WORD DETECTED: '{keyword}' (score={score})")
                post_score(score, keyword)
                last_score = score

            elif last_score > 0:
                # Conditions returned to normal — send GREEN
                print("[ACOUSTIC] ✅ Returning to GREEN")
                post_score(0, "")
                last_score = 0

        except sr.UnknownValueError:
            # Could not understand audio — normal background noise
            pass
        except sr.WaitTimeoutError:
            pass
        except KeyboardInterrupt:
            print("\n[ACOUSTIC] Node shut down.")
            break
        except Exception as e:
            print(f"[ACOUSTIC] Error: {e}")
            time.sleep(1)


if __name__ == "__main__":
    main()
