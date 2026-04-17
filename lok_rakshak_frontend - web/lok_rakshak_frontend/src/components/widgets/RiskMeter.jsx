import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { motion } from 'framer-motion';

const NEON_CYAN  = '#00FFC2';
const NEON_AMBER = '#FFB300';
const NEON_RED   = '#FF3B3B';
const LABEL_GREY = '#7A7A7A';
const VAL_WHITE  = '#FFFFFF';

const STATUS_CONFIG = {
  GREEN:    { color: NEON_CYAN,  label: 'SAFE  ZONE',   badgeBg: 'rgba(0,255,194,0.08)',  badgeBorder: 'rgba(0,255,194,0.30)' },
  YELLOW:   { color: NEON_AMBER, label: 'ELEVATED RISK', badgeBg: 'rgba(255,179,0,0.08)',  badgeBorder: 'rgba(255,179,0,0.35)' },
  RED:      { color: NEON_RED,   label: 'THREAT ACTIVE', badgeBg: 'rgba(255,59,59,0.10)',  badgeBorder: 'rgba(255,59,59,0.40)' },
  CRITICAL: { color: NEON_RED,   label: 'CRITICAL LVL',  badgeBg: 'rgba(255,59,59,0.15)',  badgeBorder: 'rgba(255,59,59,0.50)' },
};

const RiskMeter = () => {
  const { systemStatus, personCount, metrics } = useDashboardStore();
  const config = STATUS_CONFIG[systemStatus] || STATUS_CONFIG.GREEN;

  const radius           = 72;
  const stroke           = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference    = normalizedRadius * 2 * Math.PI;

  const displayPct = metrics.riskLevel || 0;
  const offset     = circumference - (displayPct / 100) * circumference;

  const isCritical = systemStatus === 'CRITICAL';
  const isRed      = systemStatus === 'RED';

  const yoloPct   = Math.min(personCount * 3, 100);
  const yoloLabel = personCount > 0
    ? `${personCount} persons detected via YOLO`
    : 'No persons in frame';

  const barColor =
    yoloPct > 75 ? NEON_RED :
    yoloPct > 45 ? NEON_AMBER :
    NEON_CYAN;

  return (
    <div
      className="w-full h-full flex flex-col gap-3 p-4 relative overflow-hidden"
      style={{
        background: 'rgba(16,16,16,0.9)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isCritical || isRed ? 'rgba(255,59,59,0.30)' : 'var(--border-subtle)'}`,
        borderRadius: '0.875rem',
        boxShadow: isCritical
          ? `0 0 30px rgba(255,59,59,0.15), inset 0 0 0 1px rgba(255,59,59,0.08)`
          : `0 4px 24px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Scanning line animation */}
      <div className="absolute inset-0 overflow-hidden rounded-[0.875rem] pointer-events-none">
        <div className="aero-scan-line absolute inset-x-0 h-24" />
      </div>

      {/* ── Header ─────────────────────────────────── */}
      <div className="relative flex items-center justify-center w-full">
        <h3
          className="text-[9px] font-mono font-black tracking-[0.35em] uppercase"
          style={{ color: 'rgba(0,255,194,0.55)' }}
        >
          AI RISK INDEX
        </h3>
        {/* Status badge — absolute right */}
        <span
          className="absolute right-0 font-mono font-bold text-[8px] px-2 py-0.5 rounded-md"
          style={{
            color: config.color,
            backgroundColor: config.badgeBg,
            border: `1px solid ${config.badgeBorder}`,
            textShadow: `0 0 6px ${config.color}`,
          }}
        >
          {systemStatus}
        </span>
      </div>

      {/* ── Circular Gauge ─────────────────────────── */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          {/* Track */}
          <circle
            stroke="rgba(0,255,194,0.07)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius} cy={radius}
          />
          {/* Arc */}
          <motion.circle
            stroke={config.color}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius} cy={radius}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 55, damping: 14 }}
            style={{ filter: `drop-shadow(0 0 5px ${config.color})` }}
          />
        </svg>
        {/* Centre readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[2rem] font-mono font-black leading-none"
            style={{ color: VAL_WHITE }}
          >
            {displayPct}%
          </span>
          <span
            className="text-[7px] font-mono font-bold tracking-[0.2em] uppercase mt-1"
            style={{ color: config.color, textShadow: `0 0 6px ${config.color}` }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* ── Crowd Density Bar ──────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[7px] font-mono tracking-[0.28em] font-bold uppercase"
            style={{ color: LABEL_GREY }}>
            LIVE CROWD DENSITY
          </span>
          <span
            className="font-mono font-bold text-[9px] px-1.5 py-0.5 rounded"
            style={{ color: VAL_WHITE, backgroundColor: 'rgba(0,0,0,0.4)', border: `1px solid ${barColor}33` }}
          >
            {yoloPct.toFixed(0)}%
          </span>
        </div>
        {/* Bar track */}
        <div className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(0,255,194,0.06)' }}>
          <motion.div
            animate={{ width: `${yoloPct}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${NEON_CYAN}, ${NEON_AMBER}, ${NEON_RED})`,
              boxShadow: `0 0 6px ${barColor}`,
            }}
          />
        </div>
        <p className="text-[8px] font-mono leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {yoloLabel}
        </p>
      </div>

      {/* ── Mini Stat Tiles ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div
          className="flex flex-col items-center justify-center text-center py-3 px-2 rounded-xl"
          style={{
            backgroundColor: 'rgba(0,255,194,0.04)',
            border: '1px solid rgba(0,255,194,0.10)',
          }}
        >
          <span className="text-[7px] font-mono font-bold tracking-[0.25em] mb-1"
            style={{ color: 'var(--text-muted)' }}>PERSONS</span>
          <span className="text-[15px] font-mono font-black leading-none"
            style={{ color: NEON_CYAN, textShadow: `0 0 8px ${NEON_CYAN}` }}>
            {personCount}
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center text-center py-3 px-2 rounded-xl"
          style={{
            backgroundColor: 'rgba(255,179,0,0.04)',
            border: '1px solid rgba(255,179,0,0.12)',
          }}
        >
          <span className="text-[7px] font-mono font-bold tracking-[0.25em] mb-1"
            style={{ color: 'var(--text-muted)' }}>CROWD PHY.</span>
          <span className="text-[11px] font-mono font-black leading-none"
            style={{ color: NEON_AMBER, textShadow: `0 0 6px ${NEON_AMBER}` }}>
            NOMINAL
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskMeter;
