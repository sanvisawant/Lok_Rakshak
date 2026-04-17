import React, { useState } from 'react';
import { ShieldCheck, VolumeX, Send, Zap, AlertCircle } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { BACKEND_URL } from '../../config';

/* ── Palette ── */
const C        = '#00FFC2';
const AMBER    = '#FFB300';
const RED      = '#FF3B3B';
const GREY     = '#7A7A7A';
const WHITE    = '#FFFFFF';
const ICE      = '#E0F7FA';   /* desaturated heading tint — less eye-strain than pure cyan */
const PANEL    = 'rgba(18,18,18,0.88)';
const BORDER   = 'rgba(0,255,194,0.10)';

/* ── Shared button styles ── */
const BTN = {
  primary: {
    backgroundColor: C,
    color: '#0D0D0D',
    borderRadius: '0.65rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 800,
    letterSpacing: '0.22em',
    fontSize: 10,
  },
  ghost: {
    backgroundColor: 'rgba(0,255,194,0.04)',
    border: `1px solid rgba(0,255,194,0.13)`,
    borderRadius: '0.65rem',
    color: GREY,
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    letterSpacing: '0.20em',
    fontSize: 10,
  },
};

/* ── Section label (the uppercase cyan sub-heading) ── */
const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: '0.38em',
    textTransform: 'uppercase',
    color: 'rgba(0,255,194,0.55)',
    marginBottom: 12,
  }}>
    {children}
  </p>
);

/* ── Custom Broadcast card ── */
const CustomAnnouncementCard = () => {
  const { addLiveAlert } = useDashboardStore();
  const [msg, setMsg]   = useState('');
  const [busy, setBusy] = useState(false);

  const handleBroadcast = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    try {
      await fetch(`${BACKEND_URL}/api/triggers/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_text: msg }),
      });
      addLiveAlert({
        id: Date.now(), type: 'WARNING', title: 'CUSTOM_BROADCAST',
        location: 'STATION_WIDE', message: `Operator broadcast: "${msg}"`,
        time: new Date().toLocaleTimeString(), priority: 'P1', source: 'HITL_VOICE',
      });
      setMsg('');
    } catch (e) { console.error(e); }
    setBusy(false);
  };

  return (
    <div style={{
      backgroundColor: PANEL,
      backdropFilter: 'blur(12px)',
      border: `1px solid rgba(0,255,194,0.14)`,
      borderRadius: '1rem',
      padding: '20px 20px 18px',
      marginBottom: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.05, pointerEvents: 'none' }}>
        <VolumeX size={42} color={C} />
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          padding: '6px 7px',
          borderRadius: 8,
          backgroundColor: 'rgba(0,255,194,0.07)',
          border: `1px solid ${BORDER}`,
          color: C,
          display: 'flex',
          alignItems: 'center',
        }}>
          <Zap size={14} />
        </div>
        <h4 style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: ICE,    /* Ice White — not pure cyan */
          margin: 0,
        }}>
          Custom Live Broadcast
        </h4>
      </div>

      {/* Textarea — padded generously */}
      <textarea
        style={{
          width: '100%',
          height: 88,
          backgroundColor: 'rgba(0,0,0,0.55)',
          color: WHITE,
          border: `1px solid rgba(0,255,194,0.13)`,
          borderRadius: 10,
          padding: '14px 14px',   /* ≥12px internal padding */
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          lineHeight: 1.7,
          resize: 'none',
          outline: 'none',
          caretColor: C,
          marginBottom: 12,
          display: 'block',
          boxSizing: 'border-box',
        }}
        placeholder="ENTER ANNOUNCEMENT TEXT..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />

      <button
        onClick={handleBroadcast}
        disabled={busy || !msg.trim()}
        style={{
          ...BTN.primary,
          width: '100%',
          padding: '10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: busy || !msg.trim() ? 0.45 : 1,
          cursor: busy || !msg.trim() ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        <Send size={12} />
        {busy ? 'BROADCASTING...' : 'PUSH TO STATION SPEAKERS'}
      </button>
    </div>
  );
};

/* ── Protocol step card ── */
const ProtocolStep = ({ number, title, status, description }) => {
  const { systemStatus, personCount, addLiveAlert } = useDashboardStore();
  const isActive = status === 'ACTIVE';

  const speak = async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/triggers/speak`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: systemStatus, density: personCount }),
      });
      const data = await res.json();
      addLiveAlert({
        id: Date.now(),
        type: systemStatus === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        title: `PROTOCOL_${number}_EXECUTION`,
        location: 'SECTOR_7', message: data.message,
        time: new Date().toLocaleTimeString(), priority: 'P1', source: 'AUTO_VOICE',
      });
    } catch (e) { console.warn('[VOICE] Backend speak failed:', e); }
  };

  return (
    <div style={{
      padding: '18px 18px 16px',
      borderRadius: 14,
      backgroundColor: isActive ? 'rgba(0,255,194,0.04)' : 'rgba(14,14,14,0.72)',
      border: isActive ? '1px solid rgba(0,255,194,0.22)' : '1px solid rgba(255,255,255,0.04)',
      boxShadow: isActive ? '0 0 20px rgba(0,255,194,0.06)' : 'none',
      opacity: isActive ? 1 : 0.52,
      transition: 'all 0.3s',
      marginBottom: 14,   /* 14px gap between protocols */
    }}>
      {/* Number badge + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          fontWeight: 900,
          padding: '2px 8px',
          borderRadius: 999,
          color: '#0D0D0D',
          backgroundColor: isActive ? C : GREY,
          flexShrink: 0,
        }}>
          {number}
        </span>
        {/* Title — bolder than description, Ice White */}
        <h4 style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          fontWeight: 900,           /* bolder */
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: isActive ? ICE : GREY,
          margin: 0,
        }}>
          {title}
        </h4>
      </div>

      {/* Description — lighter weight, grey, indented past badge */}
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9,
        fontWeight: 400,             /* lighter than title */
        lineHeight: 1.75,
        color: GREY,
        paddingLeft: 32,             /* aligns with title text */
        marginBottom: 14,
        margin: '0 0 14px 32px',
      }}>
        {description}
      </p>

      <button
        onClick={() => isActive && speak()}
        disabled={!isActive}
        style={{
          ...(isActive ? BTN.primary : BTN.ghost),
          width: '100%',
          padding: '10px 0',
          display: 'block',
          cursor: isActive ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        {isActive ? 'EXECUTE CORE PROTOCOL' : 'AUTHORIZATION REQUIRED'}
      </button>
    </div>
  );
};

/* ── Main panel ── */
const NDMAProtocolPanel = () => {
  const handleStopAudio = async () => {
    try { await fetch(`${BACKEND_URL}/api/triggers/stop-audio`, { method: 'POST' }); }
    catch (e) { console.error(e); }
  };

  const protocols = [
    { number: 'P1', title: 'CROWD DIVERSION',  status: 'ACTIVE', description: 'Initiate automated voice announcements and redirect personnel to secondary exits in Sector-7.' },
    { number: 'P2', title: 'ENTRY RESTRICTION', status: 'LOCKED', description: 'Lockdown of all primary entrance turnstiles. Divert arriving passengers to holding areas.' },
    { number: 'P3', title: 'FULL EVACUATION',   status: 'LOCKED', description: 'State-wide emergency protocols. All platform gates opened. Emergency services dispatched.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Custom Broadcast ── */}
      <CustomAnnouncementCard />

      {/* ── Emergency Core ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 14,
        backgroundColor: 'rgba(255,59,59,0.06)',
        border: '1px solid rgba(255,59,59,0.18)',
        marginBottom: 24,    /* generous 24px before protocol list */
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={18} color={RED} />
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#FF6B6B',    /* softer red — not harsh */
            }}>
              Emergency Core
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: GREY, marginTop: 3 }}>
              STATUS: READY
            </div>
          </div>
        </div>
        <button
          onClick={handleStopAudio}
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            backgroundColor: 'rgba(255,59,59,0.12)',
            border: '1px solid rgba(255,59,59,0.28)',
            color: RED,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <VolumeX size={15} />
        </button>
      </div>

      {/* ── Protocol list ── */}
      <div style={{ marginBottom: 10 }}>
        <SectionLabel>NDMA Standard Protocols</SectionLabel>
        {protocols.map((p) => <ProtocolStep key={p.number} {...p} />)}
      </div>

      {/* ── SOP Reminder ── gradient border glow, no solid yellow ── */}
      <div style={{
        padding: '16px 18px',
        borderRadius: 14,
        backgroundColor: 'rgba(255,179,0,0.03)',
        /* gradient border via box-shadow instead of solid border */
        boxShadow: `inset 0 0 0 1px rgba(255,179,0,0.12), 0 0 18px rgba(255,179,0,0.05)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Left accent bar — gradient fade */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: 'linear-gradient(to bottom, transparent, rgba(255,179,0,0.7), transparent)',
          borderRadius: 2,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, marginBottom: 8 }}>
          <AlertCircle size={13} color={AMBER} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: AMBER,
          }}>
            SOP Reminder (Sec 4.2)
          </span>
        </div>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          fontWeight: 400,
          lineHeight: 1.75,
          color: GREY,
          paddingLeft: 12,
          margin: 0,
        }}>
          Ensure clear horizontal lines for exit paths. Do not initiate lockdown without visual confirmation if risk &lt; 85%.
        </p>
      </div>
    </div>
  );
};

export default NDMAProtocolPanel;
