import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { Clock, ExternalLink } from 'lucide-react';

const AlertTimeline = () => {
  const { alerts } = useDashboardStore();

  return (
    <div className="flex flex-col gap-6 drawer-card p-6">
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-[10px] text-[#78909C] uppercase tracking-[0.3em]">LIVE SYSTEM LOGS</span>
        <button className="text-[10px] text-[#4FC3F7] hover:underline">EXPORT CSV</button>
      </div>

      <div className="relative border-l-2 border-[#1B3F63]/30 ml-6 pl-12 space-y-12 pb-12">
        {alerts.map((alert, i) => (
          <div key={alert.id} className="relative">
            {/* Timeline Dot with Glow */}
            <div className={`absolute -left-[60px] top-3 w-5 h-5 rounded-full border-4 border-[#132F4C] shadow-2xl ${alert.type === 'CRITICAL' ? 'bg-[#D32F2F] shadow-[#D32F2F]/50' : 'bg-[#F9A825] shadow-[#F9A825]/40'}`} />
            
            <div className="bg-[#0B1E2D]/60 border border-[#1B3F63]/50 p-8 rounded-[2rem] shadow-2xl hover:bg-[#0B1E2D]/80 transition-all duration-500 cursor-pointer group transform hover:scale-[1.02] backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] font-bold tracking-[0.3em] px-2 py-0.5 rounded-full bg-[#0B1E2D] ${alert.type === 'CRITICAL' ? 'text-[#FF1744] border border-[#FF1744]/30' : 'text-[#F9A825] border border-[#F9A825]/30'}`}>
                  {alert.type} // {alert.priority}
                </span>
                <span className="text-[9px] font-mono text-[#78909C] flex items-center gap-1.5 opacity-60">
                  <Clock size={11} /> {alert.time}
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-[#E3F2FD] mb-2 group-hover:text-[#4FC3F7] transition-colors tracking-wide">{alert.title}</h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">{alert.message}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-[#1B3F63]/60 group-hover:border-[#4FC3F7]/30 transition-colors">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#4FC3F7]" />
                   <span className="text-[10px] font-mono font-bold tracking-tight text-[#4FC3F7]">{alert.location}</span>
                </div>
                <ExternalLink size={14} className="text-[#78909C] group-hover:text-[#4FC3F7] transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-[#1B3F63]">
        <button className="w-full py-3 bg-transparent border border-[#1B3F63] rounded text-[10px] font-bold tracking-widest text-[#78909C] hover:bg-[#1B3F63] hover:text-[#E3F2FD] transition-all">
          LOAD ARCHIVED LOGS (24H)
        </button>
      </div>
    </div>
  );
};

export default AlertTimeline;
