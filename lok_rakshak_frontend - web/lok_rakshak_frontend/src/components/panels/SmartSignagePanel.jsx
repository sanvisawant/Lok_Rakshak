import React, { useState } from 'react';
import { Monitor, Send, Edit3, Zap } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { BACKEND_URL } from '../../config';

// Status → signage message style
const STATUS_SIGNAGE_STYLE = {
  GREEN:    { border: 'border-[#388E3C]/40', text: 'text-[#4FC3F7]', badge: 'bg-[#388E3C]/20 text-[#388E3C] border-[#388E3C]/30' },
  YELLOW:   { border: 'border-[#F9A825]/60', text: 'text-[#F9A825]', badge: 'bg-[#F9A825]/20 text-[#F9A825] border-[#F9A825]/30' },
  RED:      { border: 'border-[#FF1744]/60', text: 'text-[#FF1744]', badge: 'bg-[#FF1744]/20 text-[#FF1744] border-[#FF1744]/30' },
  CRITICAL: { border: 'border-[#FF1744]',    text: 'text-[#FF1744] animate-pulse font-bold', badge: 'bg-[#FF1744]/30 text-white border-[#FF1744] animate-pulse' },
};

const SignageCard = ({ id, status, lastUpdate, liveMessage, liveStyle }) => (
  <div className="bg-[#0B1E2D]/60 border border-[#1B3F63]/50 rounded-[2rem] p-8 mb-8 shadow-2xl backdrop-blur-sm transition-all hover:bg-[#0B1E2D]/80 group">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-5">
        <div className="p-3 bg-[#132F4C] rounded-2xl text-[#4FC3F7] shadow-inner group-hover:text-white transition-colors">
          <Monitor size={24} />
        </div>
        <span className="text-[11px] font-bold tracking-[0.3em] text-[#B0BEC5] uppercase">{id}</span>
      </div>
      <div className={`text-[9px] font-mono font-bold px-4 py-2 rounded-full border ${liveStyle?.badge || 'bg-[#388E3C]/20 text-[#388E3C] border-[#388E3C]/30'}`}>
        {status}
      </div>
    </div>

    {/* Live message from backend */}
    <div className={`bg-[#071622]/80 border p-4 rounded-xl mb-4 group-hover:opacity-90 transition-all shadow-inner ${liveStyle?.border || 'border-[#1B3F63]/50'}`}>
      <p className={`text-[13px] font-mono leading-relaxed tracking-tight ${liveStyle?.text || 'text-[#4FC3F7]'}`}>
        {liveMessage}
      </p>
    </div>

    <div className="flex items-center justify-between text-[9px] text-[#78909C] font-mono uppercase tracking-widest pt-2">
      <span>REFRESHED: {lastUpdate}</span>
      <div className="flex gap-3">
        <button className="p-2 bg-[#1B3F63]/50 hover:bg-[#4FC3F7] hover:text-[#132F4C] rounded-lg transition-all shadow-sm">
          <Edit3 size={16} />
        </button>
        <button className="p-2 bg-[#1B3F63]/50 hover:bg-[#4FC3F7] hover:text-[#132F4C] rounded-lg transition-all shadow-sm">
          <Send size={16} />
        </button>
      </div>
    </div>
  </div>
);

const SmartSignagePanel = () => {
  const { systemStatus, signageMessage } = useDashboardStore();
  const [customMsg, setCustomMsg] = useState('EMERGENCY: PLEASE PROCEED TO NEAREST EXIT. DO NOT PANIC.');
  const [deploying, setDeploying] = useState(false);

  const liveStyle = STATUS_SIGNAGE_STYLE[systemStatus] || STATUS_SIGNAGE_STYLE.GREEN;
  const now = new Date().toLocaleTimeString();

  // Escalate message manually via the backend
  const deployGlobalMessage = async () => {
    setDeploying(true);
    try {
      // POST as a manual override trigger
      await fetch(`${BACKEND_URL}/api/triggers/escalate`, { method: 'POST' });
    } catch (e) {
      console.warn('[SIGNAGE] Deploy failed:', e);
    }
    setTimeout(() => setDeploying(false), 1000);
  };

  const displays = [
    {
      id:          'BOARD-A-01',
      status:      systemStatus === 'GREEN' ? 'ACTIVE' : 'OVERRIDE',
      lastUpdate:  now,
      liveMessage: signageMessage,
      liveStyle,
    },
    {
      id:          'BOARD-A-02',
      status:      systemStatus === 'CRITICAL' || systemStatus === 'RED' ? 'OVERRIDE' : 'ACTIVE',
      lastUpdate:  now,
      liveMessage: systemStatus === 'CRITICAL'
        ? 'DANGER: PLATFORM CLOSED — USE ALTERNATE EXITS IMMEDIATELY'
        : systemStatus === 'RED'
          ? 'WARNING: HIGH DENSITY — DO NOT BOARD APPROACHING TRAIN'
          : 'CAUTION: HEAVY CROWDS // USE ALTERNATE EXIT AT NORTH GATE',
      liveStyle,
    },
  ];

  return (
    <div className="flex flex-col gap-6 drawer-card p-6">
      {/* Live indicator */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl border ${liveStyle.border} bg-[#0B1E2D]/40`}>
        <Zap size={16} className={liveStyle.text} />
        <div>
          <div className={`text-[10px] font-bold tracking-widest ${liveStyle.text}`}>
            LIVE STATE: {systemStatus}
          </div>
          <div className="text-[9px] text-[#78909C] font-mono">
            All boards auto-update from backend WS feed
          </div>
        </div>
      </div>

      {/* Global override textarea */}
      <div className="space-y-3">
        <h3 className="section-heading">Global Signage Override</h3>
        <textarea
          className="w-full h-24 bg-[#0B1E2D]/70 border border-[#1B3F63]/50 rounded-[2rem] p-4 text-xs font-mono text-[#4FC3F7] focus:outline-none focus:border-[#4FC3F7]"
          placeholder="ENTER BROADCAST MESSAGE..."
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
        />
        <button
          onClick={deployGlobalMessage}
          disabled={deploying}
          className="w-full mt-2 py-3 bg-[#4FC3F7] text-[#132F4C] rounded-[2rem] text-[10px] font-bold tracking-[0.2em] hover:bg-[#00E5FF] transition-all disabled:opacity-60"
        >
          {deploying ? 'DEPLOYING...' : 'DEPLOY GLOBAL MESSAGE'}
        </button>
      </div>

      {/* Individual boards — driven by live WS signageMessage */}
      <div className="border-t border-[#1B3F63] pt-4">
        <h3 className="section-heading">Individual Boards</h3>
        {displays.map((disp) => (
          <SignageCard key={disp.id} {...disp} />
        ))}
      </div>
    </div>
  );
};

export default SmartSignagePanel;
