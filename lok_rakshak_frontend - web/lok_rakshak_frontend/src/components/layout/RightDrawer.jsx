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

const RightDrawer = () => {
  const { activeDrawer, setActiveDrawer } = useDashboardStore();

  const getTitle = () => {
    switch (activeDrawer) {
      case 'main': return 'COMMAND OVERVIEW';
      case 'analytics': return 'SYSTEM ANALYTICS';
      case 'ndma': return 'NDMA PROTOCOLS';
      case 'timeline': return 'ALERT TIMELINE';
      case 'signage': return 'SMART SIGNAGE';
      case 'manual': return 'MANUAL CONTROLS';
      case 'settings': return 'SYSTEM CONFIG';
      default: return '';
    }
  };

  const renderContent = () => {
    switch (activeDrawer) {
      case 'main': return <CommandOverview />;
      case 'analytics': return <AnalyticsPanel />;
      case 'ndma': return <NDMAProtocolPanel />;
      case 'timeline': return <AlertTimeline />;
      case 'signage': return <SmartSignagePanel />;
      case 'manual': return <ManualTriggerPanel />;
      case 'settings': return <SettingsPanel />;
      default: return null;
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
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[480px] bg-[#132F4C] border-l border-[#1B3F63]/50 z-[70] flex flex-col shadow-2xl rounded-l-[3rem] overflow-visible min-h-0"
          >
            <div className="pt-10 pl-12 pr-8 pb-6 border-b border-[#1B3F63]/30 flex items-center justify-between gap-4 bg-[#0B1E2D]/20">
              <h2 className="text-sm font-bold tracking-[0.3em] text-[#4FC3F7] uppercase">
                {getTitle()}
              </h2>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="p-2 hover:bg-[#D32F2F] hover:text-white rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pl-12 pr-8 py-8 custom-scrollbar scroll-smooth min-h-0">
              <div className="flex flex-col gap-8">
                {renderContent()}
              </div>
            </div>
            
            <div className="p-6 border-t border-[#1B3F63]/30 bg-[#071622]/80 text-[10px] text-[#78909C] flex justify-between font-mono tracking-widest px-8">
              <span>OPERATOR: ADMIN_772</span>
              <span>LOK_RAKSHAK // ICCC</span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default RightDrawer;
