import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useDashboardStore from '../../store/useDashboardStore';

// ── Constants ──────────────────────────────────────────────────────────────────
const NEON_CYAN   = '#00FFC2';
const NEON_AMBER  = '#FFB300';
const NEON_RED    = '#FF3B3B';
const GRID_COLOR  = 'rgba(0, 255, 194, 0.07)';
const GRID_SIZE   = 28;
const SVG_W       = 400;
const SVG_H       = 290;

// -- SVG defs IDs must be unique per page to avoid collision
const GLOW_FILTER  = 'aeroGlow';
const AMBER_FILTER = 'amberGlow';
const ARROW_MARKER = 'aeroArrow';

const SpatialAwareness = () => {
  const { personCount, variance, compression, systemStatus } = useDashboardStore();

  // ── Live data derivations ─────────────────────────────────────────────────
  const isCritical  = systemStatus === 'CRITICAL' || systemStatus === 'RED';
  const isElevated  = systemStatus === 'YELLOW';
  const chaosIndex  = parseFloat((variance * 2).toFixed(2));
  const chaosHigh   = chaosIndex > 0.8;

  const blobColor =
    isCritical ? NEON_RED :
    isElevated  ? NEON_AMBER :
    NEON_CYAN;

  const baseIntensity =
    isCritical  ? 0.75 :
    isElevated  ? 0.55 : 0.35;

  const mainBlobR   = Math.max(28, Math.min(95, 28 + personCount * 1.1 + compression * 28));
  const secondBlobR = Math.max(14, mainBlobR * 0.48);

  const hotspots = [
    { x: 200, y: 158, r: mainBlobR,          opacity: baseIntensity,        color: blobColor },
    { x: 315, y: 95,  r: secondBlobR,         opacity: baseIntensity * 0.6, color: blobColor },
    { x: 80,  y: 215, r: secondBlobR * 0.65,  opacity: baseIntensity * 0.4, color: blobColor },
  ];

  const vectorLen = Math.max(22, 18 + variance * 40);
  const angle     = variance * Math.PI;
  const dx = Math.cos(angle) * vectorLen;
  const dy = Math.sin(angle) * vectorLen;

  const vectors = [
    { x1: 200, y1: 158, x2: 200 + dx,          y2: 158 + dy,          spd: (variance * 3).toFixed(1) },
    { x1: 315, y1: 95,  x2: 315 - dy * 0.6,     y2: 95  + dx * 0.6,   spd: (variance * 2).toFixed(1) },
    { x1: 80,  y1: 215, x2: 80  + dx * 0.55,    y2: 215 - dy * 0.55,  spd: (variance * 1.5).toFixed(1) },
  ];

  // ── Corner crosshair data ─────────────────────────────────────────────────
  const corners = [
    { x: 12,  y: 12  }, { x: SVG_W - 12, y: 12 },
    { x: 12,  y: SVG_H - 12 }, { x: SVG_W - 12, y: SVG_H - 12 },
  ];

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center px-4 py-2.5 flex-shrink-0"
        style={{
          borderBottom: `1px solid ${GRID_COLOR}`,
          backgroundColor: 'rgba(0,255,194,0.03)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Left: scan indicator */}
        <div className="absolute left-4 flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: NEON_CYAN }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[8px] font-mono font-bold tracking-[0.3em]"
            style={{ color: NEON_CYAN }}>
            LIVE
          </span>
        </div>

        {/* Centre: Title */}
        <span className="text-[10px] font-black tracking-[0.28em] uppercase"
          style={{ color: 'rgba(0,255,194,0.75)', letterSpacing: '0.28em' }}>
          VECTOR MOVEMENT ANALYSIS
        </span>

        {/* Right: mode badge */}
        <div className="absolute right-4 flex items-center gap-1">
          <span className="text-[8px] font-mono tracking-widest"
            style={{ color: 'rgba(0,255,194,0.4)' }}>
            MAP_SYNC·
          </span>
          <span className="text-[8px] font-mono font-bold"
            style={{ color: NEON_CYAN }}>
            ON
          </span>
        </div>
      </div>

      {/* ── SVG Canvas ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Neon-cyan grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${GRID_COLOR} 1px, transparent 1px),
              linear-gradient(90deg, ${GRID_COLOR} 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
        />

        {/* HUD Annotation Pills — glassmorphism */}
        {/* Primary Density */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div
            className="flex flex-col items-center justify-center text-center px-3 py-2 rounded-xl"
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(14px)',
              border: `1px solid rgba(0,255,194,0.18)`,
              boxShadow: `0 0 12px rgba(0,255,194,0.06)`,
              minWidth: '100px',
            }}
          >
            <span className="text-[7px] font-bold tracking-[0.3em] uppercase block"
              style={{ color: 'rgba(0,255,194,0.5)' }}>
              PRIMARY DENSITY
            </span>
            <span className="text-[11px] font-mono font-black block mt-0.5"
              style={{ color: NEON_CYAN, textShadow: `0 0 8px ${NEON_CYAN}` }}>
              SECTOR-7
            </span>
          </div>
        </div>

        {/* Chaos Index */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <motion.div
            className="flex flex-col items-center justify-center text-center px-3 py-2 rounded-xl"
            animate={{
              boxShadow: chaosHigh
                ? [`0 0 8px rgba(255,179,0,0.2)`, `0 0 20px rgba(255,179,0,0.45)`, `0 0 8px rgba(255,179,0,0.2)`]
                : `0 0 6px rgba(255,179,0,0.08)`,
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(14px)',
              border: chaosHigh
                ? `1px solid rgba(255,179,0,0.45)`
                : `1px solid rgba(255,179,0,0.18)`,
              minWidth: '88px',
            }}
          >
            <span className="text-[7px] font-bold tracking-[0.3em] uppercase block"
              style={{ color: chaosHigh ? NEON_AMBER : 'rgba(255,179,0,0.5)' }}>
              CHAOS IDX
            </span>
            <span
              className="text-[14px] font-mono font-black block mt-0.5"
              style={{
                color: chaosHigh ? NEON_AMBER : '#e0e0e0',
                textShadow: chaosHigh ? `0 0 10px ${NEON_AMBER}` : 'none',
              }}
            >
              {chaosIndex.toFixed(2)}
            </span>
          </motion.div>
        </div>

        {/* Bottom-left: person count HUD */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              border: `1px solid rgba(0,255,194,0.12)`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: NEON_CYAN }} />
            <span className="text-[8px] font-mono" style={{ color: 'rgba(0,255,194,0.5)' }}>DETECTED</span>
            <span className="text-[11px] font-mono font-black" style={{ color: NEON_CYAN }}>{personCount}</span>
          </div>
        </div>

        {/* Bottom-right: variance HUD */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              border: `1px solid rgba(0,255,194,0.12)`,
            }}
          >
            <span className="text-[8px] font-mono" style={{ color: 'rgba(0,255,194,0.5)' }}>FLOW·σ</span>
            <span className="text-[11px] font-mono font-black" style={{ color: NEON_CYAN }}>
              {(variance * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* SVG */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Neon cyan glow filter */}
            <filter id={GLOW_FILTER} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Amber glow filter */}
            <filter id={AMBER_FILTER} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Arrow marker — glowing neon cyan */}
            <marker
              id={ARROW_MARKER}
              viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 Z"
                fill={NEON_CYAN}
                style={{ filter: `drop-shadow(0 0 3px ${NEON_CYAN})` }}
              />
            </marker>

            {/* Radial gradient for density blobs */}
            <radialGradient id="blobGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={blobColor} stopOpacity="0.55" />
              <stop offset="60%"  stopColor={blobColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={blobColor} stopOpacity="0"    />
            </radialGradient>
          </defs>

          {/* Corner crosshairs — military HUD style */}
          {corners.map((c, i) => (
            <g key={i} style={{ opacity: 0.35 }}>
              <line x1={c.x - 8} y1={c.y} x2={c.x + 8} y2={c.y} stroke={NEON_CYAN} strokeWidth="0.8" />
              <line x1={c.x} y1={c.y - 8} x2={c.x} y2={c.y + 8} stroke={NEON_CYAN} strokeWidth="0.8" />
            </g>
          ))}

          {/* Density blobs */}
          {hotspots.map((h, i) => (
            <g key={i}>
              {/* Outer pulse ring */}
              <motion.circle
                cx={h.x} cy={h.y} r={h.r * 1.4}
                fill="none"
                stroke={h.color}
                strokeWidth="0.8"
                strokeOpacity="0.25"
                animate={{ r: [h.r * 1.2, h.r * 1.7, h.r * 1.2], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
              />
              {/* Core glow blob */}
              <circle
                cx={h.x} cy={h.y}
                r={h.r}
                fill="url(#blobGrad)"
                fillOpacity={h.opacity}
                style={{
                  filter: `drop-shadow(0 0 ${Math.round(h.r * 0.3)}px ${h.color})`,
                }}
              />
              {/* Inner bright core */}
              <circle
                cx={h.x} cy={h.y}
                r={Math.max(4, h.r * 0.18)}
                fill={h.color}
                fillOpacity={0.9}
                style={{ filter: `drop-shadow(0 0 4px ${h.color})` }}
              />
              {/* Label */}
              {h.r > 40 && (
                <text
                  x={h.x} y={h.y - h.r - 6}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="'Roboto Mono', monospace"
                  fontWeight="bold"
                  letterSpacing="0.08em"
                  fill={h.color}
                  style={{ filter: `drop-shadow(0 0 4px ${h.color})` }}
                >
                  {i === 0 ? 'HIGH DENSITY ZONE' : 'CONGESTION PT'}
                </text>
              )}
            </g>
          ))}

          {/* Flow vectors — glowing neon cyan trails */}
          {variance > 0 && vectors.map((v, i) => (
            <g key={i}>
              {/* Glow trail */}
              <line
                x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}
                stroke={NEON_CYAN}
                strokeWidth="4"
                strokeOpacity="0.12"
                strokeLinecap="round"
              />
              {/* Main vector */}
              <line
                x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}
                stroke={NEON_CYAN}
                strokeWidth="1.5"
                strokeOpacity="0.9"
                strokeLinecap="round"
                markerEnd={`url(#${ARROW_MARKER})`}
                style={{ filter: `drop-shadow(0 0 3px ${NEON_CYAN})` }}
              />
              {/* Speed label */}
              <text
                x={(v.x1 + v.x2) / 2 + 8}
                y={(v.y1 + v.y2) / 2 - 4}
                fontSize="6.5"
                fontFamily="'Roboto Mono', monospace"
                fill={NEON_CYAN}
                fillOpacity="0.65"
                fontStyle="italic"
              >
                {v.spd} m/s
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* ── Footer legend ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 py-2.5 flex items-center justify-between"
        style={{
          borderTop: `1px solid ${GRID_COLOR}`,
          backgroundColor: 'rgba(0,255,194,0.025)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full"
              style={{ backgroundColor: NEON_CYAN, boxShadow: `0 0 6px ${NEON_CYAN}` }} />
            <span className="text-[8px] font-mono font-bold tracking-widest"
              style={{ color: 'rgba(0,255,194,0.55)' }}>FLOW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full"
              style={{ backgroundColor: NEON_RED, boxShadow: `0 0 6px ${NEON_RED}` }} />
            <span className="text-[8px] font-mono font-bold tracking-widest"
              style={{ color: 'rgba(255,59,59,0.55)' }}>DENSITY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full"
              style={{ backgroundColor: NEON_AMBER, boxShadow: `0 0 6px ${NEON_AMBER}` }} />
            <span className="text-[8px] font-mono font-bold tracking-widest"
              style={{ color: 'rgba(255,179,0,0.55)' }}>CHAOS</span>
          </div>
        </div>
        <span className="text-[7.5px] font-mono italic"
          style={{ color: 'rgba(0,255,194,0.25)' }}>
          DADAR STN · PLATFORM 4
        </span>
      </div>
    </div>
  );
};

export default SpatialAwareness;
