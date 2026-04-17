import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { Clock, ExternalLink } from 'lucide-react';

const AlertTimeline = () => {
  const { alerts, addLiveAlert } = useDashboardStore();
  const [selectedId, setSelectedId] = React.useState(null);

  const simulateAlert = () => {
    addLiveAlert({
      id: Date.now(),
      type: 'WARNING',
      title: 'DENSITY_PEAK_DETECTED',
      location: 'SECTOR-7 NORTH',
      message: 'Sudden influx of 25+ persons detected. Monitoring flow rate.',
      time: new Date().toLocaleTimeString(),
      priority: 'P2',
      source: 'VISION'
    });
  };

  return (
    <div className="flex flex-col h-full gap-6 drawer-card p-6">
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-[10px] text-[#78909C] uppercase tracking-[0.3em]">Live System Logs</span>
        <button 
           onClick={simulateAlert}
           className="text-[10px] text-[#4FC3F7] hover:underline uppercase font-bold"
        >
          [Simulate Log]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative border-l-2 border-[#1B3F63]/30 ml-4 pl-8 space-y-8 pb-8">
          {alerts.map((alert) => (
            <div key={alert.id} className="relative">
              {/* Timeline Dot */}
              <div className={`absolute -left-[41px] top-2 w-4 h-4 rounded-full border-4 border-[#132F4C] shadow-2xl ${
                alert.type === 'CRITICAL' ? 'bg-[#FF1744] shadow-[#FF1744]/50' : 
                alert.type === 'RED' ? 'bg-[#F9A825] shadow-[#F9A825]/40' : 'bg-[#4FC3F7]'
              }`} />
              
              <div 
                onClick={() => setSelectedId(selectedId === alert.id ? null : alert.id)}
                className={`bg-[#0B1E2D]/60 border border-[#1B3F63]/50 p-6 rounded-[2rem] shadow-xl hover:bg-[#0B1E2D]/80 transition-all cursor-pointer backdrop-blur-sm ${selectedId === alert.id ? 'border-[#4FC3F7]/50 ring-1 ring-[#4FC3F7]/20 scale-[1.02]' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[8px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full bg-[#0B1E2D] border ${
                    alert.type === 'CRITICAL' ? 'text-[#FF1744] border-[#FF1744]/30' : 'text-[#F9A825] border-[#F9A825]/30'
                  }`}>
                    {alert.type} // {alert.priority}
                  </span>
                  <span className="text-[8px] font-mono text-[#78909C] flex items-center gap-1 opacity-60">
                    <Clock size={10} /> {alert.time}
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-[#E3F2FD] mb-2 tracking-wide uppercase">{alert.title}</h4>
                <p className={`text-[10px] text-[#94A3B8] leading-relaxed ${selectedId === alert.id ? '' : 'line-clamp-2'}`}>
                  {alert.message}
                </p>
                
                {selectedId === alert.id && (
                  <div className="mt-4 pt-4 border-t border-[#1B3F63]/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-mono font-bold text-[#4FC3F7]">{alert.location}</span>
                    </div>
                    <span className="text-[8px] text-[#78909C] bg-[#132F4C] px-2 py-1 rounded">ID: {alert.id.toString().slice(-6)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[#1B3F63]">
        <button className="w-full py-3 bg-transparent border border-[#1B3F63] rounded-[2rem] text-[10px] font-bold tracking-widest text-[#78909C] hover:bg-[#1B3F63] hover:text-[#E3F2FD] transition-all">
          LOAD ARCHIVED LOGS (24H)
        </button>
      </div>
    </div>
  );
};

export default AlertTimeline;
