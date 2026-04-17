import React from 'react';
import { Lock, Unlock, Siren, HelpCircle } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';

const TriggerButton = ({ label, icon: Icon, color, onClick, description }) => (
  <button 
    onClick={onClick}
    className={`group p-8 bg-[#0B1E2D]/60 border border-[#1B3F63]/50 rounded-[2rem] flex flex-col gap-5 transition-all duration-500 hover:bg-[#0B1E2D]/90 hover:border-[#4FC3F7]/50 shadow-2xl active:scale-95 text-left backdrop-blur-md`}
  >
    <div className="flex justify-between items-start w-full">
      <div className={`p-4 rounded-2xl bg-[#132F4C] border border-transparent group-hover:border-current shadow-inner ${color} transition-all`}>
        <Icon size={28} />
      </div>
      <HelpCircle size={14} className="text-[#78909C] opacity-40" />
    </div>
    <div>
      <div className={`text-xs font-bold tracking-[0.2em] uppercase mb-1 ${color}`}>{label}</div>
      <p className="text-[10px] text-[#94A3B8] leading-relaxed font-medium">{description}</p>
    </div>
  </button>
);

const ManualTriggerPanel = () => {
  const { setCriticalAlert } = useDashboardStore();

  const handleLockdown = () => {
    setCriticalAlert({ message: "LOCKDOWN INITIATED: ALL ENTRY POINTS SEALED" });
  };

  const handleEvacuate = () => {
    setCriticalAlert({ message: "FULL EVACUATION: FOLLOW EXIT BEACONS" });
  };

  return (
    <div className="flex flex-col gap-6 drawer-card p-6">
      <div className="p-6 bg-[#D32F2F]/10 border border-[#D32F2F]/30 rounded-[2rem] mb-4 backdrop-blur-sm">
         <div className="flex items-center gap-3 text-[#D32F2F] mb-3">
            <Siren size={22} className="animate-pulse shadow-sm" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase">DIRECT OVERRIDE INTERFACE</span>
         </div>
         <p className="text-[10px] text-[#78909C] leading-relaxed font-medium">Actions taken here bypass AI recommendation logic and require physical authorization on secondary terminal.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <TriggerButton 
          label="EXECUTE LOCKDOWN" 
          icon={Lock} 
          color="text-[#FF1744]" 
          onClick={handleLockdown}
          description="Reserves all entry gates. Seals internal partition barriers in Sector-7A."
        />
        <TriggerButton 
          label="OPEN ALL GATES" 
          icon={Unlock} 
          color="text-[#388E3C]" 
          onClick={() => setCriticalAlert(null)}
          description="Immediate release of all magnetic locks across 12 sectors."
        />
        <TriggerButton 
          label="SQUAD DEPLOYMENT" 
          icon={Siren} 
          color="text-[#F9A825]" 
          onClick={() => {}}
          description="Dispatch Rapid Response Team Alpha to current coordinates."
        />
        <TriggerButton 
          label="INITIATE EVACUATION" 
          icon={Siren} 
          color="text-[#FF1744]" 
          onClick={handleEvacuate}
          description="Flash evacuation signal across all signage. Alarm activation."
        />
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
         <div className="text-[9px] text-[#78909C] uppercase tracking-widest">Operator Authorization Required</div>
         <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
               <div key={i} className="w-8 h-8 bg-[#0B1E2D] border border-[#1B3F63] rounded" />
            ))}
         </div>
      </div>
    </div>
  );
};

export default ManualTriggerPanel;
