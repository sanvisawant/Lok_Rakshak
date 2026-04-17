import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { Users, TrendingUp, Clock, AlertTriangle, Zap, UserCheck } from 'lucide-react';

const NEON_CYAN  = '#00FFC2';
const NEON_AMBER = '#FFB300';
const NEON_RED   = '#FF3B3B';
const LABEL_GREY = '#7A7A7A';
const VAL_WHITE  = '#FFFFFF';

/**
 * MetricCard — Aero-Tech HUD
 * Icon → absolute top-left (never affects centering)
 * Trend → absolute top-right
 * Label + Value → perfectly centered via flex-col items-center
 */
const MetricCard = ({ label, value, icon: Icon, trend, accentColor }) => {
  const accent = accentColor || NEON_CYAN;
  const isTrendUp = typeof trend === 'string' && trend.startsWith('+');

  return (
    <div
      className="relative flex flex-col justify-center min-w-0 min-h-[86px] rounded-xl"
      style={{
        backgroundColor: 'rgba(18,18,18,0.85)',
        backdropFilter: 'blur(10px)',
        border: `1px solid rgba(0,255,194,0.08)`,
        padding: '12px 10px 10px 36px',  /* left padding clears the absolute icon */
      }}
    >
      {/* Icon — absolute top-left, zero layout impact */}
      <div
        className="absolute top-3 left-2.5 flex items-center justify-center"
        style={{ color: `${accent}60` }}
      >
        <Icon size={11} />
      </div>

      {/* Trend badge — absolute top-right */}
      {trend && (
        <span
          className="absolute top-2 right-2 text-[7px] font-mono font-bold"
          style={{ color: isTrendUp ? NEON_RED : NEON_CYAN }}
        >
          {trend}
        </span>
      )}

      {/* Left-aligned label */}
      <span
        className="text-[7px] font-mono font-bold tracking-[0.28em] uppercase block"
        style={{ color: LABEL_GREY }}
      >
        {label}
      </span>

      {/* Left-aligned value */}
      <span
        className="text-[15px] font-mono font-black block leading-tight mt-0.5 w-full truncate"
        style={{
          color: accentColor ? accentColor : VAL_WHITE,
          textShadow: accentColor ? `0 0 8px ${accentColor}` : 'none',
        }}
        title={value}
      >
        {value}
      </span>
    </div>
  );
};

const MetricsGrid = () => {
  const { metrics, personCount } = useDashboardStore();

  const cards = [
    { label: 'TOTAL PERS.',  value: metrics.totalPersonnel.toLocaleString(), icon: Users,         trend: `+${(personCount * 0.1).toFixed(1)}%` },
    { label: 'FLOW RATE',    value: `${metrics.flowRate} p/m`,               icon: TrendingUp,    trend: personCount > 40 ? `-${((personCount - 40) * 0.5).toFixed(1)}%` : 'NORMAL' },
    { label: 'AVG WAIT',     value: metrics.avgWaitTime,                     icon: Clock,         accentColor: NEON_AMBER },
    { label: 'INCIDENTS',    value: metrics.incidentRatio,                   icon: AlertTriangle, accentColor: NEON_RED },
    { label: 'PEAK LOAD',    value: metrics.peakLoad,                        icon: Zap,           accentColor: NEON_AMBER },
    { label: 'SQUAD',        value: personCount > 60 ? '22 ACTV' : '14 ACTV', icon: UserCheck,   accentColor: NEON_CYAN },
  ];

  const capacityPct = Math.min(Math.round((metrics.totalPersonnel / 18000) * 100), 100);
  const barColor    = capacityPct > 85 ? NEON_RED : capacityPct > 65 ? NEON_AMBER : NEON_CYAN;

  return (
    <div className="grid grid-cols-2 gap-1.5 pb-3">
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}

      {/* Capacity bar — full width */}
      <div
        className="col-span-2 rounded-xl p-3"
        style={{
          backgroundColor: 'rgba(18,18,18,0.85)',
          backdropFilter: 'blur(10px)',
          border: 'rgba(0,255,194,0.08) 1px solid',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[7px] font-mono font-bold tracking-[0.28em] uppercase"
            style={{ color: LABEL_GREY }}>
            STATION CAPACITY
          </span>
          <span className="text-[10px] font-mono font-black"
            style={{ color: barColor, textShadow: `0 0 6px ${barColor}` }}>
            {capacityPct}%
          </span>
        </div>

        <div className="flex gap-0.5 h-3">
          {[...Array(20)].map((_, i) => {
            const seg    = (i + 1) * 5;
            const active = capacityPct >= seg;
            const c      = seg > 85 ? NEON_RED : seg > 65 ? NEON_AMBER : NEON_CYAN;
            return (
              <div key={i} className="flex-1 rounded-sm transition-colors duration-500"
                style={{
                  backgroundColor: active ? c : 'rgba(255,255,255,0.04)',
                  boxShadow: active ? `0 0 3px ${c}` : 'none',
                }} />
            );
          })}
        </div>

        <div className="flex justify-between mt-1.5"
          style={{ fontSize: '7px', fontFamily: 'JetBrains Mono, monospace', color: LABEL_GREY }}>
          <span>0%</span><span>75% OPTIMAL</span><span>MAX</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsGrid;
