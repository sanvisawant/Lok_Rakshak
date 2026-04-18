import os
from dotenv import load_dotenv
import requests

load_dotenv("c:/Users/vishr/OneDrive/Desktop/Lok_Rakshak/backend/.env")
sarvam_key = os.environ.get("SARVAM_API_KEY")
gemini_key = os.environ.get("GEMINI_API_KEY")

print(f"Loaded SARVAM_API_KEY: {bool(sarvam_key)}")
print(f"Loaded GEMINI_API_KEY: {bool(gemini_key)}")

def test_sarvam():
    url = "https://api.sarvam.ai/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": sarvam_key or ""
    }
    data = {
        "model": "sarvam-1",
        "messages": [
            {"role": "user", "content": "hi"}
        ],
        "temperature": 0.2, "max_tokens": 100
    }
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=5)
        print("Sarvam HTTP:", resp.status_code)
        print("Sarvam Resp:", resp.text)
    except Exception as e:
        print("Sarvam Error:", e)

def test_gemini():
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": "hi"}]}]}
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=5)
        print("Gemini HTTP:", resp.status_code)
        print("Gemini Resp:", resp.text)
    except Exception as e:
        print("Gemini Error:", e)

test_sarvam()
test_gemini()
