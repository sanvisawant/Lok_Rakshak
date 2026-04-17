import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { Users, TrendingUp, Clock, AlertTriangle, Zap, UserCheck } from 'lucide-react';

const MetricCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-[#132F4C] border border-[#1B3F63] p-4 rounded flex flex-col justify-between hover:border-[#4FC3F7] transition-colors group">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-[#0B1E2D] rounded border border-[#1B3F63] text-[#78909C] group-hover:text-[#4FC3F7] transition-colors">
        <Icon size={16} />
      </div>
      {trend && (
        <span className={`text-[10px] font-mono ${trend.startsWith?.('+') ? 'text-[#D32F2F]' : 'text-[#388E3C]'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <div className="text-[10px] font-bold tracking-widest text-[#78909C] mb-1">{label}</div>
      <div className="text-2xl font-mono font-bold text-[#E3F2FD]">{value}</div>
    </div>
  </div>
);

const MetricsGrid = () => {
  const { metrics, personCount } = useDashboardStore();

  const cards = [
    { 
      label: 'TOTAL PERSONNEL', 
      value: metrics.totalPersonnel.toLocaleString(), 
      icon: Users, 
      trend: `+${(personCount * 0.1).toFixed(1)}%` 
    },
    { 
      label: 'FLOW RATE', 
      value: `${metrics.flowRate} p/m`, 
      icon: TrendingUp, 
      trend: personCount > 40 ? `-${((personCount - 40) * 0.5).toFixed(1)}%` : 'NORMAL'
    },
    { label: 'AVG WAIT TIME', value: metrics.avgWaitTime, icon: Clock },
    { label: 'INCIDENT RATIO', value: metrics.incidentRatio, icon: AlertTriangle, color: 'text-[#F9A825]' },
    { label: 'PEAK LOAD', value: metrics.peakLoad, icon: Zap },
    { label: 'SQUAD STATUS', value: personCount > 60 ? '22 ACTIVE' : '14 ACTIVE', icon: UserCheck, color: 'text-[#388E3C]' },
  ];

  const capacityPct = Math.min(Math.round((metrics.totalPersonnel / 18000) * 100), 100);

  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}
      
      {/* Capacity Indicator (Wide) */}
      <div className="col-span-2 bg-[#132F4C] border border-[#1B3F63] p-4 rounded">
         <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#78909C]">STATION CAPACITY</span>
            <span className={`text-[10px] font-mono ${capacityPct > 85 ? 'text-[#FF1744]' : 'text-[#4FC3F7]'}`}>
              {capacityPct}%
            </span>
         </div>
         <div className="flex gap-1 h-6">
            {[...Array(20)].map((_, i) => {
               const segmentCap = (i + 1) * 5;
               const isActive = capacityPct >= segmentCap;
               const isDanger = segmentCap > 75;
               return (
                  <div 
                     key={i} 
                     className={`flex-1 rounded-sm transition-colors duration-500 ${
                       isActive ? (isDanger ? 'bg-[#FF1744]' : 'bg-[#4FC3F7]') : 'bg-[#0B1E2D]'
                     }`}
                  />
               );
            })}
         </div>
         <div className="flex justify-between mt-2 text-[9px] text-[#78909C]">
            <span>0%</span>
            <span>OPTIMAL_LIMIT (75%)</span>
            <span>MAX_CAPACITY</span>
         </div>
      </div>
    </div>
  );
};

export default MetricsGrid;
