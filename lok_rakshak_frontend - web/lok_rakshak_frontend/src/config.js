// src/config.js
// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  SINGLE SOURCE OF TRUTH FOR NETWORK CONFIG
//  Before the demo, run `ipconfig` on Laptop C and set the IP below.
//  This is the ONLY file you need to change to reconnect all nodes.
// ─────────────────────────────────────────────────────────────────────────────

export const LAPTOP_C_IP   = "localhost";
export const BACKEND_URL   = `http://${LAPTOP_C_IP}:8000`;
export const WS_URL        = `ws://${LAPTOP_C_IP}:8000/ws/risk`;
export const VIDEO_FEED    = `http://${LAPTOP_C_IP}:8000/api/video_feed`;
export const SDK_QR_URL    = `http://${LAPTOP_C_IP}:8000/api/sdk_qr`;
