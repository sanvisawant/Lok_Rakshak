import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_MESSAGES = [
  "Initializing AI Risk Engine...",
  "Connecting to CCTV Feeds...",
  "Syncing Urban Mobility Network...",
  "Calibrating Vector Models...",
  "Establishing Secure Uplink...",
  "System Ready.",
];

// City nodes — mapped to SVG viewBox "0 0 260 310"
// Real approx geographic placement
const CITY_NODES = [
  { id: 'delhi',     cx: 100, cy: 88,  label: 'DEL',  delay: 0.3 },
  { id: 'mumbai',    cx: 52,  cy: 188, label: 'BOM',  delay: 0.6 },
  { id: 'bangalore', cx: 102, cy: 248, label: 'BLR',  delay: 0.9 },
  { id: 'kolkata',   cx: 182, cy: 148, label: 'CCU',  delay: 0.5 },
  { id: 'chennai',   cx: 128, cy: 246, label: 'MAA',  delay: 0.7 },
  { id: 'hyderabad', cx: 112, cy: 212, label: 'HYD',  delay: 0.4 },
  { id: 'lucknow',   cx: 132, cy: 106, label: 'LKO',  delay: 0.5 },
  { id: 'srinagar',  cx: 70,  cy: 30,  label: 'SXR',  delay: 0.2 },
  { id: 'guwahati',  cx: 214, cy: 112, label: 'GAU',  delay: 0.8 },
  { id: 'pune',      cx: 64,  cy: 205, label: 'PNQ',  delay: 0.45 },
];

// Sparse connections — only major ones to keep it clean
const CONNECTIONS = [
  ['delhi', 'mumbai'],
  ['delhi', 'kolkata'],
  ['delhi', 'lucknow'],
  ['delhi', 'hyderabad'],
  ['mumbai', 'bangalore'],
  ['bangalore', 'chennai'],
  ['hyderabad', 'bangalore'],
  ['kolkata', 'guwahati'],
];

// India SVG path — simplified outline, clockwise from J&K
// ViewBox: "0 0 260 310"
const INDIA_PATH = `
  M 80,14
  C 88,8 102,6 118,8
  L 138,10 L 158,14 L 178,19
  C 195,24 212,32 226,46
  L 234,62 L 236,80
  C 234,93 224,100 215,96
  L 205,88
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
  C 68,28 76,18 80,14
  Z
`.trim();

// Lat/Lon grid config — where lines fall in SVG coords
// Latitude: 10°N=290, 15°N=233, 20°N=176, 25°N=119, 30°N=62
// Longitude: 70°E=26, 75°E=71, 80°E=116, 85°E=161, 90°E=206
const LAT_LINES = [
  { y: 62,  label: '30°N' },
  { y: 119, label: '25°N' },
  { y: 176, label: '20°N' },
  { y: 233, label: '15°N' },
];
const LON_LINES = [
  { x: 26,  label: '70°E' },
  { x: 71,  label: '75°E' },
  { x: 116, label: '80°E' },
  { x: 161, label: '85°E' },
  { x: 206, label: '90°E' },
];

const LandingScreen = ({ onComplete }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  // Cycle boot messages
  useEffect(() => {
    if (exiting) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) =>
        prev < BOOT_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 700);
    return () => clearInterval(interval);
  }, [exiting]);

  // Trigger exit after 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 600);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: exiting ? 1.08 : 1, filter: exiting ? 'blur(8px)' : 'none' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0D2036 0%, #060F18 100%)' }}
    >
      {/* Subtle animated scanning line */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: '200%' }}
        transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
        className="absolute inset-x-0 h-40 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(79,195,247,0.04), transparent)',
        }}
      />

      {/* ── MAIN LAYOUT ── spacious, centered */}
      <div className="relative z-20 flex flex-col items-center gap-12 px-8 w-full max-w-3xl">

        {/* TOP: Titles */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center"
        >
          <h1
            className="text-5xl font-black tracking-[0.25em] mb-3"
            style={{
              color: '#4FC3F7',
              textShadow: '0 0 40px rgba(79,195,247,0.3)',
            }}
          >
            LOK-RAKSHAK
          </h1>
          <p className="text-[13px] tracking-[0.5em] text-[#B0BEC5] uppercase mb-2">
            National Crowd Intelligence Grid
          </p>
          <p className="text-[11px] tracking-[0.35em] text-[#546E7A] uppercase">
            Monitoring • Predicting • Preventing
          </p>
        </motion.div>

        {/* CENTRE: India Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.0 }}
          className="relative"
          style={{ width: 260, height: 310 }}
        >
          <svg
            viewBox="0 0 260 310"
            width="260"
            height="310"
            className="overflow-visible"
          >
            {/* Lat/Lon grid */}
            <defs>
              <clipPath id="indiaClip">
                <path d={INDIA_PATH} />
              </clipPath>
            </defs>

            {/* Horizontal latitude lines */}
            {LAT_LINES.map((l) => (
              <g key={l.label}>
                <line
                  x1={0} y1={l.y} x2={260} y2={l.y}
                  stroke="#4FC3F7" strokeWidth="0.5"
                  strokeDasharray="3 6"
                  strokeOpacity="0.12"
                />
                <text
                  x={-4} y={l.y + 3}
                  textAnchor="end"
                  fontSize="6"
                  fill="#4FC3F7"
                  fillOpacity="0.35"
                  fontFamily="monospace"
                >
                  {l.label}
                </text>
              </g>
            ))}

            {/* Vertical longitude lines */}
            {LON_LINES.map((l) => (
              <g key={l.label}>
                <line
                  x1={l.x} y1={0} x2={l.x} y2={310}
                  stroke="#4FC3F7" strokeWidth="0.5"
                  strokeDasharray="3 6"
                  strokeOpacity="0.12"
                />
                <text
                  x={l.x} y={-4}
                  textAnchor="middle"
                  fontSize="6"
                  fill="#4FC3F7"
                  fillOpacity="0.35"
                  fontFamily="monospace"
                >
                  {l.label}
                </text>
              </g>
            ))}

            {/* India fill (very subtle) */}
            <motion.path
              d={INDIA_PATH}
              fill="#4FC3F7"
              fillOpacity={0.04}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            />

            {/* India outline */}
            <motion.path
              d={INDIA_PATH}
              fill="none"
              stroke="#4FC3F7"
              strokeWidth="1.2"
              strokeOpacity="0.55"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 2.5, ease: 'easeInOut' }}
            />

            {/* Connecting lines */}
            {CONNECTIONS.map(([n1, n2], idx) => {
              const start = CITY_NODES.find((n) => n.id === n1);
              const end   = CITY_NODES.find((n) => n.id === n2);
              if (!start || !end) return null;
              return (
                <motion.line
                  key={idx}
                  x1={start.cx} y1={start.cy}
                  x2={end.cx}   y2={end.cy}
                  stroke="#4FC3F7"
                  strokeWidth="0.6"
                  strokeOpacity="0.2"
                  strokeDasharray="2 4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + idx * 0.12, duration: 0.6 }}
                />
              );
            })}

            {/* City nodes */}
            {CITY_NODES.map((node) => (
              <g key={node.id}>
                {/* Pulse ring */}
                <motion.circle
                  cx={node.cx} cy={node.cy} r={7}
                  fill="none"
                  stroke="#4FC3F7"
                  strokeWidth="1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.8, 0.8] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: node.delay, repeatDelay: 0.5 }}
                />
                {/* Core dot */}
                <motion.circle
                  cx={node.cx} cy={node.cy} r={2.5}
                  fill="#E3F2FD"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + node.delay, duration: 0.4 }}
                />
                {/* Label */}
                <motion.text
                  x={node.cx + 5} y={node.cy + 3}
                  fontSize="6"
                  fill="#78909C"
                  fontFamily="monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  transition={{ delay: 1.5 + node.delay, duration: 0.4 }}
                >
                  {node.label}
                </motion.text>
              </g>
            ))}
          </svg>
        </motion.div>

        {/* BOTTOM: Boot Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="flex flex-col items-center gap-6 w-full max-w-md"
        >
          {/* Progress bar */}
          <div className="w-full h-px bg-[#1B3F63]/60 overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-[#4FC3F7]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4.8, ease: 'easeInOut' }}
            />
          </div>

          {/* Cycling text */}
          <div
            className="flex items-center gap-3 px-6 py-3 rounded-xl w-full justify-center"
            style={{
              background: 'rgba(19,47,76,0.5)',
              border: '1px solid rgba(79,195,247,0.12)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={msgIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-[11px] font-mono tracking-wider"
                style={{ color: '#00E5FF' }}
              >
                {BOOT_MESSAGES[msgIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default LandingScreen;
