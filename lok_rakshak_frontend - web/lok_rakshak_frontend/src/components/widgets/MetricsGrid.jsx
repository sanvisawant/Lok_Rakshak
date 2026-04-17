import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { Users, TrendingUp, Clock, AlertTriangle, Zap, UserCheck } from 'lucide-react';

/**
 * MetricCard — text fully centered.
 * Icon sits top-center, label + value centered below.
 * Trend badge is absolute top-right so it doesn't push text.
 */
const MetricCard = ({ label, value, icon: Icon, trend, colorClass }) => (
  <div
    className="glass-panel relative flex flex-col items-center justify-center text-center py-4 px-2 gap-1 group transition-all duration-200 hover:shadow-lg min-w-0 min-h-[90px]"
  >
    {/* Trend badge — absolutely positioned top-right, doesn't affect layout */}
    {trend && (
      <span
        className={`absolute top-2 right-2 text-[8px] font-mono font-bold ${
          typeof trend === 'string' && trend.startsWith('+')
            ? 'text-[#D32F2F]'
            : 'text-[#388E3C]'
        }`}
      >
        {trend}
      </span>
    )}

    {/* Centered icon */}
    <div
      className="p-1.5 rounded-lg flex items-center justify-center mb-1 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--accent-primary)',
        border: '1px solid var(--border-faint)',
      }}
    >
      <Icon size={14} />
    </div>

    {/* Centered label */}
    <div
      className="text-[8px] font-bold tracking-widest w-full truncate"
      style={{ color: 'var(--text-muted)' }}
      title={label}
    >
      {label}
    </div>

    {/* Centered value */}
    <div
      className={`text-sm font-mono font-bold w-full truncate ${colorClass || ''}`}
      style={{ color: colorClass ? undefined : 'var(--text-primary)', lineHeight: 1.2 }}
      title={value}
    >
      {value}
    </div>
  </div>
);

const MetricsGrid = () => {
  const { metrics, personCount } = useDashboardStore();

  const cards = [
    {
      label: 'TOTAL PERS.',
      value: metrics.totalPersonnel.toLocaleString(),
      icon: Users,
      trend: `+${(personCount * 0.1).toFixed(1)}%`,
    },
    {
      label: 'FLOW RATE',
      value: `${metrics.flowRate} p/m`,
      icon: TrendingUp,
      trend: personCount > 40 ? `-${((personCount - 40) * 0.5).toFixed(1)}%` : 'NORMAL',
    },
    {
      label: 'AVG WAIT',
      value: metrics.avgWaitTime,
      icon: Clock,
    },
    {
      label: 'INCIDENTS',
      value: metrics.incidentRatio,
      icon: AlertTriangle,
      colorClass: 'text-[#F9A825]',
    },
    {
      label: 'PEAK LOAD',
      value: metrics.peakLoad,
      icon: Zap,
    },
    {
      label: 'SQUAD',
      value: personCount > 60 ? '22 ACTV' : '14 ACTV',
      icon: UserCheck,
      colorClass: 'text-[#388E3C]',
    },
  ];

  const capacityPct = Math.min(Math.round((metrics.totalPersonnel / 18000) * 100), 100);

  return (
    <div className="grid grid-cols-2 gap-2 pb-4">
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}

      {/* Capacity Bar — full width */}
      <div className="col-span-2 glass-panel p-3 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span
            className="text-[9px] font-bold tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            STATION CAPACITY
          </span>
          <span
            className={`text-[11px] font-mono font-bold ${
              capacityPct > 85 ? 'text-[#FF1744]' : 'text-[#4FC3F7]'
            }`}
          >
            {capacityPct}%
          </span>
        </div>
        {/* Segmented bar */}
        <div className="flex gap-0.5 h-4">
          {[...Array(20)].map((_, i) => {
            const segmentCap = (i + 1) * 5;
            const isActive   = capacityPct >= segmentCap;
            const isDanger   = segmentCap > 75;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-colors duration-500"
                style={{
                  backgroundColor: isActive
                    ? isDanger ? '#FF1744' : '#4FC3F7'
                    : 'var(--bg-surface)',
                }}
              />
            );
          })}
        </div>
        <div
          className="flex justify-between mt-1.5 text-[8px]"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>0%</span>
          <span>75% OPTIMAL</span>
          <span>MAX</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsGrid;
