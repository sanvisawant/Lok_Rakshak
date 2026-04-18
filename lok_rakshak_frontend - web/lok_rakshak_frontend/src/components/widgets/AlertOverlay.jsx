import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, X, ShieldOff } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { BACKEND_URL } from '../../config';

const AlertOverlay = () => {
  const { criticalAlert, setCriticalAlert, systemStatus } = useDashboardStore();

  const handleDismiss = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/triggers/dismiss`, { method: 'POST' });
      console.log('[HITL] Dismiss sent to Laptop C');
    } catch (err) {
      console.error('[HITL] Dismiss failed:', err);
    }
    // Optimistically clear the alert — WS will confirm
    setCriticalAlert(null);
  };

  const handleAction = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/triggers/action`, { method: 'POST' });
      console.log('[HITL] Action (voice) sent to Laptop C');
    } catch (err) {
      console.error('[HITL] Action failed:', err);
    }
  };

  const isCritical = systemStatus === 'CRITICAL';

  return (
    <AnimatePresence>
      {criticalAlert && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{   opacity: 0, y: -60, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
        >
          <div
            className={`border-2 shadow-2xl rounded-xl p-4 flex items-center gap-6 text-white relative overflow-hidden ${
              isCritical
                ? 'bg-[#D32F2F] border-[#FF1744] shadow-[0_0_40px_rgba(211,47,47,0.7)] animate-pulse'
                : 'bg-[#7B3F00] border-[#F9A825] shadow-[0_0_30px_rgba(249,168,37,0.4)]'
            }`}
          >
            {/* Diagonal hazard pattern */}
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}
            />

            <div className={`p-3 rounded-full animate-pulse ${isCritical ? 'bg-white/20' : 'bg-white/10'}`}>
              <AlertOctagon size={32} />
            </div>

            <div className="flex-1">
              <div className="text-[10px] font-bold tracking-[0.3em] opacity-80 mb-1">
                {isCritical ? 'AUTONOMOUS OVERRIDE — NDMA ACTIVE' : 'IMMEDIATE EMERGENCY BROADCAST'}
              </div>
              <div className="text-lg font-bold tracking-tight uppercase leading-tight">
                {criticalAlert.message}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end shrink-0">
              {/* HITL Action Button — sends POST to backend /action */}
              <button
                onClick={handleAction}
                className="flex items-center gap-2 px-4 py-2 bg-[#f44336] hover:bg-[#d32f2f] border border-[#ff5252] rounded-lg text-[11px] font-bold text-white tracking-widest transition-all active:scale-95"
              >
                <AlertOctagon size={14} />
                PLAY VOICE WARNING
              </button>

              {/* HITL Dismiss Button — sends POST to backend */}
              <button
                onClick={handleDismiss}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/40 border border-white/30 rounded-lg text-[11px] font-bold tracking-widest transition-all active:scale-95"
              >
                <ShieldOff size={14} />
                DISMISS THREAT
              </button>

              {/* Close overlay only (doesn't reset backend) */}
              <button
                onClick={() => setCriticalAlert(null)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 15s HITL countdown (only for RED state) */}
          {systemStatus === 'RED' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 mx-auto w-fit bg-[#0B1E2D]/90 border border-[#F9A825]/40 px-4 py-1.5 rounded-full text-[10px] font-mono text-[#F9A825] tracking-widest"
            >
              ⏱ AUTO-ESCALATES TO CRITICAL IN 15s IF NOT DISMISSED
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertOverlay;
