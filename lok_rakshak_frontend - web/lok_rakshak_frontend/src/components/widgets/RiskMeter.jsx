import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { motion } from 'framer-motion';

// Status → display config
const STATUS_CONFIG = {
  GREEN:    { color: 'var(--status-safe)',     label: 'SAFE_ZONE',      pct: 12  },
  YELLOW:   { color: 'var(--status-warning)',  label: 'ELEVATED_RISK',  pct: 48  },
  RED:      { color: 'var(--status-danger)',   label: 'THREAT_ACTIVE',  pct: 78  },
  CRITICAL: { color: 'var(--status-critical)', label: 'CRITICAL_LEVEL', pct: 97  },
};

const RiskMeter = () => {
  const { systemStatus, personCount, metrics } = useDashboardStore();
  const config = STATUS_CONFIG[systemStatus] || STATUS_CONFIG.GREEN;

  const radius           = 75;
  const stroke           = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference    = normalizedRadius * 2 * Math.PI;
  
  // Use live riskLevel from metrics instead of static config.pct
  const displayPct = metrics.riskLevel || 0;
  const offset = circumference - (displayPct / 100) * circumference;

  const isCritical = systemStatus === 'CRITICAL';
  const isRed      = systemStatus === 'RED';

  return (
    <div
      className={`w-full h-full bg-[#132F4C] border rounded p-4 flex flex-col items-center relative transition-all duration-700 ${
        isCritical ? 'border-[#FF1744] animate-pulse shadow-[0_0_40px_rgba(211,47,47,0.5)]' :
        isRed      ? 'border-[#FF1744] shadow-[0_0_20px_rgba(255,23,68,0.3)]' :
        'border-[#1B3F63]'
      }`}
    >
      <div className="w-full flex justify-between items-center mb-2">
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#B0BEC5]">
          AI RISK INDEX
        </h3>
        <span className={`font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border ${
          systemStatus === 'GREEN'    ? 'border-[#388E3C] text-[#388E3C]' :
          systemStatus === 'YELLOW'   ? 'border-[#F9A825] text-[#F9A825]' :
          'border-[#FF1744] text-[#FF1744]'
        }`}>
          {systemStatus}
        </span>
      </div>

      {/* Circular meter at the top */}
      <div className="relative flex items-center justify-center my-2">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          {/* Background track */}
          <circle stroke="#0B1E2D" strokeWidth={stroke} fill="transparent"
            r={normalizedRadius} cx={radius} cy={radius} />
          {/* Animated progress */}
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

        {/* Centre readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold text-[#E3F2FD]">{displayPct}%</span>
          <span className={`text-[8px] font-bold tracking-tight uppercase ${
            isCritical || isRed ? 'text-[#FF1744]' : 'text-[#78909C]'
          }`}>
            {config.label.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Detailed metrics below */}
      <div className="w-full mt-2 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[9px]">
            <span className="text-[#78909C]">THREAT CONFIDENCE</span>
            <span className="text-[#E3F2FD] font-mono">{displayPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#0B1E2D] rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${displayPct}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
              className="h-full"
              style={{ backgroundColor: config.color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0B1E2D]/50 p-2 rounded border border-[#1B3F63]">
            <div className="text-[8px] text-[#78909C] mb-1">DETECTION</div>
            <div className="text-xs font-mono font-bold text-[#4FC3F7]">{personCount} PERS</div>
          </div>
          <div className="bg-[#0B1E2D]/50 p-2 rounded border border-[#1B3F63]">
            <div className="text-[8px] text-[#78909C] mb-1">CROWD PHY.</div>
            <div className="text-xs font-mono font-bold text-[#F9A825]">NOMINAL</div>
          </div>
        </div>

        <p className="text-[8px] text-[#78909C] text-center leading-tight pt-1">
          AI Monitoring Active. Sector-7 Platform 4 under real-time observation.
        </p>
      </div>
    </div>
  );
};

export default RiskMeter;
