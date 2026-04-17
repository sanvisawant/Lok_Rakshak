import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────────────
   INDIA PATH — SVG viewBox "0 0 260 310"
   Simplified clockwise outline from J&K → South tip → NE
────────────────────────────────────────────────────────────────── */
const INDIA_PATH = `
  M 80,14 C 88,8 102,6 118,8 L 138,10 L 158,14 L 178,19
  C 195,24 212,32 226,46 L 234,62 L 236,80
  C 234,93 224,100 215,96 L 205,88
  C 200,96 208,112 222,128
  C 232,142 240,158 238,174
  C 233,180 222,177 214,183
  C 206,196 198,212 186,228
  C 174,244 161,260 148,273
  C 138,283 126,292 115,292
  C 106,280 97,264 88,244
  C 78,224 66,210 50,202
  C 36,195 24,186 22,172
  C 26,160 38,152 36,138
  C 30,126 22,114 26,102
  C 30,90 44,82 56,75
  C 64,65 60,52 64,40
  C 68,28 76,18 80,14 Z
`.trim();

/* City coordinates */
const CITIES = [
  { id: 'delhi',     cx: 100, cy: 88,  label: 'DEL', delay: 0.3 },
  { id: 'mumbai',    cx: 52,  cy: 188, label: 'BOM', delay: 0.6 },
  { id: 'bangalore', cx: 102, cy: 248, label: 'BLR', delay: 0.9 },
  { id: 'kolkata',   cx: 182, cy: 148, label: 'CCU', delay: 0.5 },
  { id: 'chennai',   cx: 128, cy: 246, label: 'MAA', delay: 0.7 },
  { id: 'hyderabad', cx: 112, cy: 212, label: 'HYD', delay: 0.4 },
  { id: 'lucknow',   cx: 132, cy: 106, label: 'LKO', delay: 0.5 },
  { id: 'srinagar',  cx: 70,  cy: 30,  label: 'SXR', delay: 0.2 },
  { id: 'guwahati',  cx: 214, cy: 112, label: 'GAU', delay: 0.8 },
];

const CONNECTIONS = [
  ['delhi', 'mumbai'], ['delhi', 'kolkata'], ['delhi', 'lucknow'],
  ['delhi', 'hyderabad'], ['mumbai', 'bangalore'], ['bangalore', 'chennai'],
  ['hyderabad', 'bangalore'], ['kolkata', 'guwahati'],
];

const BOOT_MSGS = [
  'Initializing AI Risk Engine...',
  'Connecting to CCTV Feeds...',
  'Syncing Urban Mobility Network...',
  'Calibrating Vector Models...',
  'Establishing Secure Uplink...',
  'SYSTEM READY.',
];

/* Coordinate grid lines */
const LAT_LINES = [{ y: 62, label: '30°N' }, { y: 119, label: '25°N' }, { y: 176, label: '20°N' }, { y: 233, label: '15°N' }];
const LON_LINES = [{ x: 26, label: '70°E' }, { x: 71, label: '75°E' }, { x: 116, label: '80°E' }, { x: 161, label: '85°E' }, { x: 206, label: '90°E' }];

const NEON_CYAN = '#00FFC2';

const LandingScreen = ({ onComplete }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [exiting,  setExiting]  = useState(false);

  useEffect(() => {
    if (exiting) return;
    const iv = setInterval(() =>
      setMsgIndex(p => p < BOOT_MSGS.length - 1 ? p + 1 : p), 700);
    return () => clearInterval(iv);
  }, [exiting]);

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 600);
    }, 5200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: exiting ? 1.06 : 1, filter: exiting ? 'blur(8px)' : 'none' }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[999] overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#0D0D0D' }}
    >

      {/* ── BACKGROUND: India wireframe map (full-screen, faint) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <svg
          viewBox="-30 -20 320 350"
          style={{ width: '70vmin', height: '70vmin', maxWidth: 640, maxHeight: 720 }}
          className="opacity-[0.09]"
        >
          <defs>
            {/* Clip India shape */}
            <clipPath id="indiaClipBg">
              <path d={INDIA_PATH} />
            </clipPath>
            {/* Grid pattern inside India */}
            <pattern id="indiaTechGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={NEON_CYAN} strokeWidth="0.4" />
            </pattern>
          </defs>

          {/* Interior wireframe grid */}
          <rect x="-30" y="-20" width="320" height="350"
            fill="url(#indiaTechGrid)"
            clipPath="url(#indiaClipBg)"
          />
          {/* Outline */}
          <path d={INDIA_PATH} fill="none" stroke={NEON_CYAN} strokeWidth="1.5" />
        </svg>
      </div>

      {/* ── COORDINATE GRID (full-screen faint lines) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,194,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,194,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── SCAN LINE ── */}
      <motion.div
        className="absolute inset-x-0 h-32 pointer-events-none"
        initial={{ y: '-100%' }}
        animate={{ y: '150vh' }}
        transition={{ duration: 5.2, ease: 'linear', repeat: Infinity }}
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,255,194,0.03), transparent)' }}
      />

      {/* ── HUD PANEL (floating glassmorphism) ── */}
      <div className="relative z-10 flex flex-col" style={{ width: 360 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            backgroundColor: 'rgba(13,13,13,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid rgba(0,255,194,0.15)`,
            borderRadius: '1.5rem',
            boxShadow: '0 0 60px rgba(0,255,194,0.06), 0 32px 64px rgba(0,0,0,0.7)',
            padding: '36px 32px 28px',
          }}
        >
          {/* Top: status row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: NEON_CYAN }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(0,255,194,0.5)', letterSpacing: '0.35em' }}>
                SYSTEM ONLINE
              </span>
            </div>
            <div className="flex gap-1 items-center">
              {[...Array(3)].map((_, i) => (
                <motion.div key={i} className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: NEON_CYAN }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                />
              ))}
            </div>
          </div>

          {/* Brand title */}
          <div className="text-center mb-2">
            <h1
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: '0.2em',
                lineHeight: 1,
                color: '#FFFFFF',
              }}
            >
              LOK-<span style={{ color: NEON_CYAN, textShadow: `0 0 20px ${NEON_CYAN}` }}>RAKSHAK</span>
            </h1>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8,
              letterSpacing: '0.45em',
              color: '#7A7A7A',
              marginTop: 8,
              textTransform: 'uppercase',
            }}>
              National Crowd Intelligence Grid
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: 'rgba(0,255,194,0.08)', margin: '20px 0' }} />

          {/* India mini-map reference */}
          <div className="flex items-center justify-center mb-5">
            <svg viewBox="-10 -10 280 330" style={{ width: 90, height: 108 }}>
              {/* Mini city nodes */}
              {CONNECTIONS.map(([n1, n2], idx) => {
                const s = CITIES.find(c => c.id === n1);
                const e = CITIES.find(c => c.id === n2);
                if (!s || !e) return null;
                return (
                  <line key={idx}
                    x1={s.cx} y1={s.cy} x2={e.cx} y2={e.cy}
                    stroke={NEON_CYAN} strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="2 4"
                  />
                );
              })}
              {/* Coordinate lat lines */}
              {LAT_LINES.map(l => (
                <line key={l.label} x1={0} y1={l.y} x2={260} y2={l.y}
                  stroke={NEON_CYAN} strokeWidth="0.4" strokeOpacity="0.08" strokeDasharray="2 5" />
              ))}
              {LON_LINES.map(l => (
                <line key={l.label} x1={l.x} y1={0} x2={l.x} y2={310}
                  stroke={NEON_CYAN} strokeWidth="0.4" strokeOpacity="0.08" strokeDasharray="2 5" />
              ))}

              {/* Outline */}
              <motion.path d={INDIA_PATH} fill="rgba(0,255,194,0.04)" stroke={NEON_CYAN}
                strokeWidth="1.2" strokeOpacity="0.45"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 2, ease: 'easeInOut' }}
              />

              {/* City dots */}
              {CITIES.map(node => (
                <g key={node.id}>
                  <motion.circle cx={node.cx} cy={node.cy} r={6}
                    fill="none" stroke={NEON_CYAN} strokeWidth="0.8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.6, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: node.delay }}
                  />
                  <circle cx={node.cx} cy={node.cy} r={2} fill={NEON_CYAN} fillOpacity={0.8} />
                </g>
              ))}
            </svg>
          </div>

          {/* Progress bar */}
          <div style={{ height: 1, backgroundColor: 'rgba(0,255,194,0.07)', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
            <motion.div
              style={{ height: '100%', backgroundColor: NEON_CYAN, boxShadow: `0 0 6px ${NEON_CYAN}` }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>

          {/* Boot message */}
          <div className="flex items-center gap-2.5" style={{
            backgroundColor: 'rgba(0,255,194,0.04)',
            border: '1px solid rgba(0,255,194,0.1)',
            borderRadius: 10,
            padding: '10px 14px',
          }}>
            <motion.div
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: NEON_CYAN }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={msgIndex}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.2 }}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: NEON_CYAN, letterSpacing: '0.06em' }}
              >
                {BOOT_MSGS[msgIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Below panel: sub-labels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-5"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '0.4em', color: 'rgba(0,255,194,0.22)' }}
        >
          MONITORING · PREDICTING · PREVENTING
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LandingScreen;
