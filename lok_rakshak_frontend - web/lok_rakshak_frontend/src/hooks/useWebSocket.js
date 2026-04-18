// src/hooks/useWebSocket.js
// ─────────────────────────────────────────────────────────────────────────────
// Real-time WebSocket bridge: Laptop C → Laptop 4 Dashboard
// Connects to /ws/risk, parses JSON, writes to Zustand store.
// Auto-reconnects with 2s backoff if the connection drops.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { WS_URL, VIDEO_FEED } from '../config';
import useDashboardStore from '../store/useDashboardStore';

export function useWebSocket() {
  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);

  const {
    setSystemStatus,
    setSignageMessage,
    setPersonCount,
    setWsConnected,
    addLiveAlert,
  } = useDashboardStore();

  const connect = () => {
    // Clean up any existing socket before reconnecting
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    console.log(`[WS] Connecting to ${WS_URL}...`);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] ✅ Connected to Lok-Rakshak brain.');
      setWsConnected(true);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // data shape: { status, action, signage, density, variance, compress, acoustic, sdk, source }

        setSystemStatus(data.status);
        setSignageMessage(data.signage || '');
        setPersonCount(data.density || 0);

        if (data.variance !== undefined) {
          useDashboardStore.getState().setVariance(data.variance || 0);
          useDashboardStore.getState().setCompression(data.compress || 0);
        }

        // Generate a live alert for timeline if state is RED or CRITICAL
        if (data.status === 'RED' || data.status === 'CRITICAL') {
          // 1. Determine emergency dispatch code based on action text
          const actionText = (data.action || '').toUpperCase();
          const dispatch_code = actionText.includes('MEDICAL') ? 'MEDICAL_ONLY'
                              : actionText.includes('SECURITY') || actionText.includes('THEFT') || actionText.includes('WEAPON') ? 'SECURITY_ONLY'
                              : 'ALL';
                              
          // 2. Extract dynamic location from the first camera node
          const locationName = useDashboardStore.getState().cameras[0]?.name || 'XIE Mumbai Main Gate';

          // 3. Trigger external n8n Emergency Dispatch API
          fetch('https://mariee.app.n8n.cloud/webhook/emergency-dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dispatch_code,
              location: locationName,
              live_link: VIDEO_FEED
            })
          }).then(res => {
             if (res.ok) console.log('[N8N DISPATCH] Emergency successfully escalated (200 OK).');
             else console.warn(`[N8N DISPATCH] Failed with status: ${res.status}`);
          }).catch(err => console.error('[N8N DISPATCH] Network error:', err));

          // 4. Update internal dashboard UI timeline
          addLiveAlert({
            id:       Date.now(),
            type:     data.status,
            title:    data.status === 'CRITICAL' ? 'CRITICAL EVENT' : 'THREAT DETECTED',
            location: 'CAM_01 — Platform 4',
            message:  data.action || 'Elevated risk detected.',
            time:     new Date().toLocaleTimeString(),
            priority: data.status === 'CRITICAL' ? 'P1' : 'P2',
            source:   data.source || 'VISION',
          });
        }
      } catch (err) {
        console.warn('[WS] Parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('[WS] Connection error:', err);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.warn('[WS] Disconnected. Retrying in 2s...');
      setWsConnected(false);
      reconnectTimer.current = setTimeout(connect, 2000);
    };
  };

  useEffect(() => {
    connect();
    return () => {
      // Cleanup on component unmount
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
