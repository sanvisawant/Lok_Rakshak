// src/hooks/useWebSocket.js
// ─────────────────────────────────────────────────────────────────────────────
// Real-time WebSocket bridge: Laptop C → Laptop 4 Dashboard
// Connects to /ws/risk, parses JSON, writes to Zustand store.
// Auto-reconnects with 2s backoff if the connection drops.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { WS_URL } from '../config';
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
