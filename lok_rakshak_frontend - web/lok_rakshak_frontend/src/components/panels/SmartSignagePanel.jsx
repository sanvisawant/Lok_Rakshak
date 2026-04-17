import React, { useState } from 'react';
import { Monitor, Send, Edit3, Zap } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { BACKEND_URL } from '../../config';

const C     = '#00FFC2';
const AMBER = '#FFB300';
const RED   = '#FF3B3B';
const GREY  = '#7A7A7A';
const WHITE = '#FFFFFF';
const PANEL = 'rgba(18,18,18,0.85)';
const BORDER = 'rgba(0,255,194,0.10)';

/* Status → text color for the live signage message */
const MSG_COLOR = {
  GREEN:    C,
  YELLOW:   AMBER,
  RED:      RED,
  CRITICAL: RED,
};

const SignageCard = ({ id, status, lastUpdate, liveMessage, msgColor }) => (
  <div className="p-4 rounded-2xl mb-3 transition-all"
    style={{ backgroundColor: PANEL, border: `1px solid ${BORDER}` }}>
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg"
          style={{ backgroundColor: 'rgba(0,255,194,0.06)', border: `1px solid ${BORDER}`, color: C }}>
          <Monitor size={14} />
        </div>
        <span className="text-[9px] font-mono font-black tracking-[0.25em] uppercase" style={{ color: WHITE }}>
          {id}
        </span>
      </div>
      <span className="text-[7px] font-mono font-bold px-2 py-0.5 rounded-full"
        style={{
          color: status === 'ACTIVE' ? C : AMBER,
          backgroundColor: status === 'ACTIVE' ? 'rgba(0,255,194,0.08)' : 'rgba(255,179,0,0.08)',
          border: `1px solid ${status === 'ACTIVE' ? 'rgba(0,255,194,0.25)' : 'rgba(255,179,0,0.25)'}`,
        }}>
        {status}
      </span>
    </div>

    {/* Live message */}
    <p className="text-[10px] font-mono leading-relaxed p-2 rounded-lg mb-2"
      style={{ color: msgColor || C, backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.04)' }}>
      {liveMessage}
    </p>

    <div className="flex items-center justify-between">
      <span className="text-[7px] font-mono uppercase tracking-widest" style={{ color: GREY }}>
        REFRESHED: {lastUpdate}
      </span>
      <div className="flex gap-2">
        {[Edit3, Send].map((Icon, i) => (
          <button key={i} className="p-1.5 rounded-lg transition-all"
            style={{ backgroundColor: 'rgba(0,255,194,0.05)', border: `1px solid ${BORDER}`, color: GREY }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,194,0.12)'; e.currentTarget.style.color = C; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,194,0.05)'; e.currentTarget.style.color = GREY; }}>
            <Icon size={12} />
          </button>
        ))}
      </div>
    </div>
  </div>
);

const SmartSignagePanel = () => {
  const { systemStatus, signageMessage, setSignageMessage } = useDashboardStore();
  const [customMsg, setCustomMsg] = useState(signageMessage);
  const [deploying, setDeploying] = useState(false);

  const msgColor = MSG_COLOR[systemStatus] || C;
  const now = new Date().toLocaleTimeString();

  const deployGlobalMessage = () => {
    setDeploying(true);
    setSignageMessage(customMsg);
    setTimeout(() => setDeploying(false), 800);
  };

  const displays = [
    { id: 'BOARD-A-01', status: systemStatus === 'GREEN' ? 'ACTIVE' : 'OVERRIDE', lastUpdate: now, liveMessage: signageMessage, msgColor },
    {
      id: 'BOARD-A-02',
      status: systemStatus === 'CRITICAL' || systemStatus === 'RED' ? 'OVERRIDE' : 'ACTIVE',
      lastUpdate: now,
      liveMessage:
        systemStatus === 'CRITICAL' ? 'DANGER: PLATFORM CLOSED — USE ALTERNATE EXITS IMMEDIATELY' :
        systemStatus === 'RED'      ? 'WARNING: HIGH DENSITY — DO NOT BOARD APPROACHING TRAIN' :
        'CAUTION: HEAVY CROWDS // USE ALTERNATE EXIT AT NORTH GATE',
      msgColor,
    },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Live state indicator */}
      <div className="flex items-center gap-3 p-3 rounded-xl"
        style={{ backgroundColor: 'rgba(0,255,194,0.04)', border: `1px solid ${BORDER}` }}>
        <Zap size={14} style={{ color: msgColor }} />
        <div>
          <div className="text-[9px] font-mono font-black tracking-[0.25em] uppercase" style={{ color: msgColor }}>
            LIVE STATE: {systemStatus}
          </div>
          <div className="text-[8px] font-mono" style={{ color: GREY }}>
            All boards auto-update from backend WS feed
          </div>
        </div>
      </div>

      {/* Global override */}
      <div>
        <p className="text-[8px] font-mono font-bold tracking-[0.35em] uppercase mb-3" style={{ color: C }}>
          GLOBAL SIGNAGE OVERRIDE
        </p>
        <textarea
          className="w-full h-24 rounded-xl p-3 text-[10px] font-mono resize-none focus:outline-none transition-all mb-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: WHITE, border: `1px solid ${BORDER}`, caretColor: C }}
          placeholder="ENTER BROADCAST MESSAGE..."
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
        />
        <button onClick={deployGlobalMessage} disabled={deploying}
          className="w-full py-3 transition-all disabled:opacity-40"
          style={{ backgroundColor: C, color: '#0D0D0D', borderRadius: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, letterSpacing: '0.22em', fontSize: 10 }}>
          {deploying ? 'DEPLOYING...' : 'DEPLOY GLOBAL MESSAGE'}
        </button>
      </div>

      {/* Individual boards */}
      <div>
        <p className="text-[8px] font-mono font-bold tracking-[0.35em] uppercase mb-3 pt-4"
          style={{ color: C, borderTop: '1px solid rgba(0,255,194,0.08)' }}>
          INDIVIDUAL BOARDS
        </p>
        {displays.map((d) => <SignageCard key={d.id} {...d} />)}
      </div>
    </div>
  );
};

export default SmartSignagePanel;
