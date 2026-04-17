import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import NDMAProtocolPanel from '../panels/NDMAProtocolPanel';
import AlertTimeline from '../panels/AlertTimeline';
import SmartSignagePanel from '../panels/SmartSignagePanel';
import ManualTriggerPanel from '../panels/ManualTriggerPanel';
import CommandOverview from '../panels/CommandOverview';
import AnalyticsPanel from '../panels/AnalyticsPanel';
import SettingsPanel from '../panels/SettingsPanel';

const NEON_CYAN = '#00FFC2';

const TITLES = {
  main:      'COMMAND OVERVIEW',
  analytics: 'SYSTEM ANALYTICS',
  ndma:      'NDMA PROTOCOLS',
  timeline:  'ALERT TIMELINE',
  signage:   'SMART SIGNAGE',
  manual:    'MANUAL CONTROLS',
  settings:  'SYSTEM CONFIG',
};

const RightDrawer = () => {
  const { activeDrawer, setActiveDrawer } = useDashboardStore();

  const renderContent = () => {
    switch (activeDrawer) {
      case 'main':      return <CommandOverview />;
      case 'analytics': return <AnalyticsPanel />;
      case 'ndma':      return <NDMAProtocolPanel />;
      case 'timeline':  return <AlertTimeline />;
      case 'signage':   return <SmartSignagePanel />;
      case 'manual':    return <ManualTriggerPanel />;
      case 'settings':  return <SettingsPanel />;
      default:          return null;
    }
  };

  return (
    <AnimatePresence>
      {activeDrawer && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDrawer(null)}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[480px] z-[70] flex flex-col shadow-2xl rounded-l-[2rem] overflow-hidden"
            style={{
              backgroundColor: 'rgba(13,13,13,0.95)',
              backdropFilter: 'blur(18px)',
              borderLeft: `1px solid rgba(0,255,194,0.12)`,
              boxShadow: `-4px 0 40px rgba(0,0,0,0.7), inset 1px 0 0 rgba(0,255,194,0.06)`,
            }}
          >
            {/* Header */}
            <div
              style={{
                paddingTop: 40,        /* extra top breathing room — clears rounded corner */
                paddingLeft: 44,
                paddingRight: 28,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(0,255,194,0.08)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              {/* Left: utility label + main title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Sub-label — dim utility text, sits above as hierarchy label */}
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 7.5,
                  letterSpacing: '0.42em',
                  textTransform: 'uppercase',
                  color: '#4A4A4A',      /* very dim — clear hierarchy below main title */
                  lineHeight: 1,
                }}>
                  LOK-RAKSHAK · ICCC
                </span>

                {/* Main panel title */}
                <h2 style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.26em',  /* ~3px at 14px size */
                  textTransform: 'uppercase',
                  lineHeight: 1.5,           /* prevents letter tops being clipped */
                  marginLeft: 10,            /* slight inset from panel edge */
                  margin: '0 0 0 10px',
                  color: '#E0F7FA',          /* Ice White — not full neon, easy on eyes */
                  textShadow: '0 0 18px rgba(0,255,194,0.22)',
                }}>
                  {TITLES[activeDrawer] || ''}
                </h2>
              </div>

              {/* Close button — 15px+ margin from the corner */}
              <button
                onClick={() => setActiveDrawer(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginRight: 4,            /* 4px extra buffer from rounded panel edge */
                  backgroundColor: 'rgba(255,59,59,0.06)',
                  border: '1px solid rgba(255,59,59,0.20)',
                  color: 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,59,59,0.18)';
                  e.currentTarget.style.color = '#FF3B3B';
                  e.currentTarget.style.borderColor = 'rgba(255,59,59,0.40)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,59,59,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                  e.currentTarget.style.borderColor = 'rgba(255,59,59,0.20)';
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content — 24px padding so nothing touches curvy edges */}
            <div
              className="flex-1 overflow-y-auto custom-scrollbar min-h-0"
              style={{ padding: '24px 28px 24px 28px' }}
            >
              {renderContent()}
            </div>

            {/* Footer */}
            <div
              className="px-12 py-4 flex justify-between items-center flex-shrink-0"
              style={{
                borderTop: `1px solid rgba(0,255,194,0.07)`,
                backgroundColor: 'rgba(0,255,194,0.02)',
              }}
            >
              <span className="text-[9px] font-mono tracking-[0.3em]"
                style={{ color: 'rgba(0,255,194,0.28)' }}>
                OPERATOR: ADMIN_772
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em]"
                style={{ color: 'rgba(0,255,194,0.28)' }}>
                LOK-RAKSHAK // ICCC
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default RightDrawer;
