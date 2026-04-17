import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { motion } from 'framer-motion';

// Status → display config
const STATUS_CONFIG = {
  GREEN:    { color: 'var(--status-safe)',     label: 'SAFE ZONE',      pct: 12  },
  YELLOW:   { color: 'var(--status-warning)',  label: 'ELEVATED RISK',  pct: 48  },
  RED:      { color: 'var(--status-danger)',   label: 'THREAT ACTIVE',  pct: 78  },
  CRITICAL: { color: 'var(--status-critical)', label: 'CRITICAL LEVEL', pct: 97  },
};

const RiskMeter = () => {
  const { systemStatus, personCount, metrics } = useDashboardStore();
  const config = STATUS_CONFIG[systemStatus] || STATUS_CONFIG.GREEN;

  const radius           = 72;
  const stroke           = 9;
  const normalizedRadius = radius - stroke * 2;
  const circumference    = normalizedRadius * 2 * Math.PI;

  // Use live riskLevel from metrics instead of static config.pct
  const displayPct = metrics.riskLevel || 0;
  const offset = circumference - (displayPct / 100) * circumference;

  const isCritical = systemStatus === 'CRITICAL';
  const isRed      = systemStatus === 'RED';

  // YOLO bar percentage (same formula as old anomaly bar)
  const yoloPct   = Math.min(personCount * 3, 100);
  const yoloLabel = personCount > 0
    ? `${personCount} persons detected via YOLO`
    : 'No persons in frame';

  return (
    <div
      className={`w-full h-full modern-card p-4 flex flex-col gap-3 relative transition-all duration-700 bg-gradient-to-b from-[#132F4C] to-[#0B1E2D] ${
        isCritical ? 'border-[#FF1744]/50 shadow-[0_0_40px_rgba(211,47,47,0.2)] animate-pulse' :
        isRed      ? 'border-[#FF1744]/50 shadow-[0_0_20px_rgba(255,23,68,0.15)]' :
        ''
      }`}
    >
      {/* Header — title centred, status badge absolute top-right */}
      <div className="relative flex items-center justify-center w-full mb-1">
        <h3 className="text-[10px] font-bold tracking-[0.25em]" style={{ color: 'var(--text-secondary)' }}>
          AI RISK INDEX
        </h3>
        <span
          className={`absolute right-2 font-mono font-bold text-[9px] px-2 py-0.5 rounded-md border ${
            systemStatus === 'GREEN'  ? 'border-[#388E3C]/60 text-[#388E3C] bg-[#388E3C]/10' :
            systemStatus === 'YELLOW' ? 'border-[#F9A825]/60 text-[#F9A825] bg-[#F9A825]/10' :
            'border-[#FF1744]/60 text-[#FF1744] bg-[#FF1744]/10'
          }`}
        >
          {systemStatus}
        </span>
      </div>

      {/* Circular gauge */}
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          {/* Background track */}
          <circle stroke="#0B1E2D" strokeWidth={stroke} fill="transparent"
            r={normalizedRadius} cx={radius} cy={radius} />
          {/* Animated progress arc */}
          <motion.circle
            stroke={config.color}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          />
        </svg>

        {/* Centre readout — percentage + SAFE ZONE / THREAT label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-black text-[#E3F2FD] leading-none">{displayPct}%</span>
          <span className={`text-[8px] font-bold tracking-widest uppercase mt-1.5 ${
            isCritical || isRed ? 'text-[#FF1744]' :
            systemStatus === 'YELLOW' ? 'text-[#F9A825]' :
            'text-[#388E3C]'
          }`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* ── Live Crowd Density Bar (merged from old AI Risk bar) ── */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[9px]">
          <span className="text-[#78909C] tracking-widest font-bold">LIVE CROWD DENSITY</span>
          <span className="font-mono font-bold text-[#4FC3F7] bg-[#0B1E2D] px-2 py-0.5 rounded">
            {yoloPct.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 w-full bg-[#0B1E2D] rounded-full overflow-hidden shadow-inner">
          <motion.div
            animate={{ width: `${yoloPct}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            className="h-full bg-gradient-to-r from-[#388E3C] via-[#F9A825] to-[#FF1744]"
          />
        </div>
        <p className="text-[9px] text-[#78909C] leading-relaxed">{yoloLabel}</p>
      </div>

      {/* Mini stats row — centered */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div
          className="flex flex-col items-center justify-center text-center py-3 px-2 rounded-xl shadow-inner"
          style={{ backgroundColor: 'rgba(11,30,45,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="text-[8px] font-bold tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            PERSONS
          </div>
          <div className="text-base font-mono font-bold" style={{ color: 'var(--accent-primary)', lineHeight: 1 }}>
            {personCount}
          </div>
        </div>
        <div
          className="flex flex-col items-center justify-center text-center py-3 px-2 rounded-xl shadow-inner"
          style={{ backgroundColor: 'rgba(11,30,45,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="text-[8px] font-bold tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            CROWD PHY.
          </div>
          <div className="text-sm font-mono font-bold text-[#F9A825]" style={{ lineHeight: 1 }}>
            NOMINAL
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMeter;
