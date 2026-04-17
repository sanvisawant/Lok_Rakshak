import React from 'react';
import { ToggleLeft, ToggleRight, Sliders, Settings2, Bell, Monitor } from 'lucide-react';

const SettingToggle = ({ label, active, description }) => (
  <div className="flex justify-between items-start p-10 bg-[#0B1E2D]/40 border border-[#1B3F63]/30 rounded-3xl hover:border-[#4FC3F7]/30 transition-all duration-500 backdrop-blur-xl mb-10 shadow-2xl group">
    <div className="flex flex-col gap-4">
      <span className="text-[12px] font-bold text-[#E3F2FD] tracking-[0.2em] uppercase group-hover:text-[#4FC3F7] transition-colors">{label}</span>
      <span className="text-[11px] text-[#94A3B8] leading-relaxed max-w-[240px] font-medium">{description}</span>
    </div>
    <button className="text-[#4FC3F7] mt-1 transition-transform active:scale-[0.85]">
      {active ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="opacity-15" />}
    </button>
  </div>
);

const StatusItem = ({ label, value, status }) => (
  <div className="flex justify-between items-center p-6 bg-[#0B1E2D]/80 border border-[#1B3F63]/40 rounded-3xl hover:border-[#4FC3F7]/40 transition-all duration-500 shadow-2xl mb-4 group">
    <div className="flex items-center gap-5">
      <div className={`w-3 h-3 rounded-full ${status === 'ok' ? 'bg-[#388E3C] shadow-[0_0_15px_#388E3C]' : 'bg-[#F9A825] shadow-[0_0_15px_#F9A825]'} animate-pulse`} />
      <span className="text-[11px] text-[#B0BEC5] font-bold tracking-[0.2em] group-hover:text-white transition-colors">{label}</span>
    </div>
    <span className="text-[12px] font-mono font-bold text-[#4FC3F7]">{value}</span>
  </div>
);

const SignageCard = ({ id, currentMessage, status, lastUpdate }) => (
  <div className="bg-[#1B3F63]/30 border border-[#1B3F63] rounded-2xl p-6 mb-6 shadow-xl backdrop-blur-sm transition-all hover:bg-[#1B3F63]/40">
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-[#0B1E2D] rounded-xl text-[#4FC3F7]">
          <Monitor size={20} />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#B0BEC5]">{id}</span>
      </div>
      <div className={`text-[9px] font-mono font-bold px-2 py-1 rounded-full ${status === 'ACTIVE' ? 'bg-[#388E3C]/20 text-[#388E3C] border border-[#388E3C]/30' : 'bg-[#F9A825]/20 text-[#F9A825] border border-[#F9A825]/30'}`}>
        {status}
      </div>
    </div>
    <div className="text-[12px] text-[#E3F2FD] font-medium bg-[#0B1E2D]/50 p-4 rounded-xl border border-[#1B3F63]/30">
      {currentMessage}
    </div>
    <div className="mt-4 text-[9px] text-[#78909C] font-mono">LAST UPDATE: {lastUpdate}</div>
  </div>
);

const SettingsPanel = () => {
  return (
    <div className="flex flex-col gap-6 drawer-card p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 text-[#4FC3F7]">
          <Sliders size={16} />
          <h3 className="section-heading">Control Thresholds</h3>
        </div>
        
        <div className="space-y-2">
           <div className="flex justify-between text-[10px] text-[#78909C] mb-1 uppercase tracking-[0.18em]">
              <span>CRITICAL_DENSITY_TRIGGER</span>
              <span className="text-[#4FC3F7]">85%</span>
           </div>
           <div className="h-1.5 w-full bg-[#0B1E2D] rounded-full overflow-hidden border border-[#1B3F63]">
              <div className="h-full bg-[#4FC3F7] w-[85%]" />
           </div>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between text-[10px] text-[#78909C] mb-1 uppercase tracking-[0.18em]">
              <span>ALERT_SENSITIVITY</span>
              <span className="text-[#4FC3F7]">MEDIUM</span>
           </div>
           <div className="h-1.5 w-full bg-[#0B1E2D] rounded-full overflow-hidden border border-[#1B3F63]">
              <div className="h-full bg-[#4FC3F7] w-[50%]" />
           </div>
        </div>
      </div>

      <div className="h-[1px] bg-[#1B3F63]/50" />

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 text-[#B0BEC5]">
          <Bell size={16} />
          <h3 className="section-heading" style={{ marginBottom: 0 }}>Notification Config</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <SettingToggle 
            label="AUTO_ESCALATION" 
            active={true} 
            description="Allow AI to automatically escalate risk levels based on multi-vector analysis."
          />
          <SettingToggle 
            label="SQUAD_HAPTIC_ALERTS" 
            active={true} 
            description="Send vibration alerts to on-duty personnel when density > 70%."
          />
          <SettingToggle 
            label="ANOMALY_RECORDING" 
            active={false} 
            description="Automatically save local 10s clips when anomalous movement is detected."
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
         <button className="w-full py-3 bg-[#132F4C] border border-[#1B3F63] rounded text-[10px] font-bold tracking-widest text-[#E3F2FD] hover:bg-[#1B3F63] transition-all">
            RESET ALL TO DEFAULTS
         </button>
         <button className="w-full py-3 bg-[#4FC3F7] text-[#132F4C] rounded text-[10px] font-bold tracking-[0.2em] hover:bg-[#00E5FF] transition-all">
            APPLY GLOBAL SYNC
         </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
