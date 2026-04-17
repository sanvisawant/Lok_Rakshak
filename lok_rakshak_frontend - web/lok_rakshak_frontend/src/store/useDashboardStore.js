// src/store/useDashboardStore.js
import { create } from 'zustand';

const useDashboardStore = create((set, get) => ({
  // ── Real-time backend state (written by useWebSocket hook) ────────────────
  systemStatus:   'GREEN',   // GREEN | YELLOW | RED | CRITICAL
  signageMessage: 'Trains running on time. Have a safe journey.',
  personCount:    0,
  variance:       0,
  compression:    0,
  wsConnected:    false,
  history:        [], // [{ time, density, risk }] for charts

  // ── Legacy metrics (kept for MetricsGrid cards) ──────────────────────────
  metrics: {
    totalPersonnel: 14208,
    flowRate:       242,
    riskLevel:      0,       // Now driven by personCount from WS
    avgWaitTime:    '02:45',
    incidentRatio:  '0.12%',
    peakLoad:       '16.8K',
    squadStatus:    '14 ACTIVE',
  },

  // ── Camera feeds ─────────────────────────────────────────────────────────
  cameras: [
    { id: 'CAM_01', name: 'SOUTH_GATE',   density: 'LIVE',       status: 'LIVE',    risk: 12 },
    { id: 'CAM_02', name: 'CENTRAL_HUB',  density: 'NORMAL',     status: 'LIVE',    risk: 5 },
    { id: 'CAM_03', name: 'ESCALATOR_7',  density: 'SIGNAL_LOSS',status: 'OFFLINE', risk: 0  },
    { id: 'CAM_04', name: 'NORTH_EXIT',   density: 'NORMAL',     status: 'LIVE',    risk: 8 },
  ],

  // ── Live alert timeline (grows as WS events come in) ─────────────────────
  alerts: [
    {
      id: 1, type: 'WARNING', title: 'SYSTEM ONLINE',
      location: 'Control Plane', priority: 'P3',
      message: 'Lok-Rakshak v2.0 connected. All nodes nominal.',
      time: new Date().toLocaleTimeString(),
    },
  ],

  // ── UI State ──────────────────────────────────────────────────────────────
  activeDrawer: null,
  criticalAlert: null,

  // ── Actions: WebSocket writes ─────────────────────────────────────────────
  setSystemStatus: (status) => set((state) => {
    const riskMap = { GREEN: 12, YELLOW: 48, RED: 78, CRITICAL: 97 };
    return {
      systemStatus: status,
      criticalAlert: (status === 'RED' || status === 'CRITICAL')
        ? { message: status === 'CRITICAL'
              ? '⚠️ CRITICAL — NDMA PROTOCOLS ACTIVE. EVACUATE PLATFORM 4.'
              : '🚨 RED ALERT — HITL VERIFICATION REQUIRED. 15s TO AUTO-ESCALATE.' }
        : null,
      metrics: {
        ...state.metrics,
        riskLevel: riskMap[status] ?? state.metrics.riskLevel,
      },
    };
  }),

  setSignageMessage: (msg)   => set({ signageMessage: msg }),
  setPersonCount: (count) => set((state) => {
    // Dynamic metrics based on actual crowd data
    const totalPersonnel = 14000 + count * 8;
    const flowRate = Math.max(5, 240 - count * 1.5); // More people = slower flow
    const avgWaitTime = `${Math.floor(count / 20) + 2}:${(count % 20).toString().padStart(2, '0')}`;
    
    // Risk level calculation (0-100)
    // Factors: personCount (60%), variance (20%), compression (20%)
    const baseRisk = Math.min((count / 80) * 100, 100);
    const varianceBonus = Math.min((state.variance / 5.0) * 100, 20); // Chaotic movement adds risk
    const compressionBonus = (state.compression * 20); // High density adds risk
    const totalRisk = Math.min(Math.round(baseRisk * 0.6 + varianceBonus + compressionBonus), 100);

    return {
      personCount: count,
      history: [...get().history, { 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
        density: count, 
        risk: totalRisk 
      }].slice(-20), // Keep last 20 points
      metrics: {
        ...state.metrics,
        totalPersonnel,
        flowRate: Math.round(flowRate),
        avgWaitTime,
        riskLevel: totalRisk,
        incidentRatio: `${(count * 0.002 + state.variance * 0.01).toFixed(2)}%`,
        peakLoad: count > 30 ? `${(totalPersonnel / 1000).toFixed(1)}K` : state.metrics.peakLoad,
        squadStatus: count > 50 ? '22 ACTIVE' : '14 ACTIVE',
      },
    };
  }),

  setVariance: (v) => set((state) => ({ 
    variance: v,
    metrics: {
      ...state.metrics,
      incidentRatio: `${(state.personCount * 0.002 + v * 0.01).toFixed(2)}%`,
    }
  })),

  setCompression: (c) => set((state) => ({ 
    compression: c,
    metrics: {
      ...state.metrics,
      peakLoad: state.personCount > 30 ? `${((14000 + state.personCount * 8) / 1000).toFixed(1)}K` : state.metrics.peakLoad,
    }
  })),

  setWsConnected: (val) => set({ wsConnected: val }),

  addLiveAlert: (alert) => set((state) => {
    // Also update history if the status changes significantly
    return {
      alerts: [alert, ...state.alerts].slice(0, 20),
    };
  }),

  // ── Actions: UI ────────────────────────────────────────────────────────────
  setActiveDrawer:  (drawer) => set({ activeDrawer: drawer }),
  setCriticalAlert: (alert)  => set({ criticalAlert: alert }),
  updateMetrics:    (m)      => set((state) => ({ metrics: { ...state.metrics, ...m } })),

  // Legacy — still used by MetricsGrid. Can remove after demo.
  triggerDataUpdate: () => {},
}));

export default useDashboardStore;
