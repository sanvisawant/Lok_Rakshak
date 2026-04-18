import React from 'react';
import { Lock, Unlock, Siren, HelpCircle, PhoneCall, AlertTriangle } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { BACKEND_URL } from '../../config';

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
  const { setCriticalAlert, addLiveAlert, systemStatus } = useDashboardStore();

  const [toast, setToast] = React.useState(null);

  const initiateManualDispatch = async (level) => {
    setToast(`DISPATCHING ${level.toUpperCase()} PROTOCOLS...`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/triggers/dispatch-emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dispatch_level: level,
          live_link: `${BACKEND_URL}/api/video_feed` 
        })
      });
      if (res.ok) {
        setToast(`✅ SUCCESS: ${level === 'all' ? 'ALL AGENCIES' : 'POLICE & AMBULANCE'} DISPATCHED`);
      } else {
        setToast(`❌ ERROR: DISPATCH SYSTEM UNAVAILABLE`);
      }
    } catch (e) {
      console.error(e);
      setToast(`❌ NETWORK ERROR: COULD NOT REACH BACKEND`);
    }
    setTimeout(() => setToast(null), 6000);
  };

  return (
    <div className="flex flex-col gap-6 drawer-card p-6">
      {/* ── MANUAL DISPATCH OVERRIDES (N8N) ── */}
      <div className="p-6 bg-[#0B1E2D]/60 border border-[#1B3F63]/50 rounded-[2rem] mb-2 backdrop-blur-sm shadow-xl">
         <div className="flex items-center gap-3 text-[#E3F2FD] mb-2">
            <PhoneCall size={20} className="text-[#4FC3F7]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#4FC3F7]">Manual Dispatch Overrides</span>
         </div>
         <p className="text-[9px] text-[#78909C] leading-relaxed font-mono mb-5">
           Triggers the external n8n webhook via FastAPI backend. Agencies will receive instant incident details.
         </p>
         
         <div className="flex flex-col gap-3">
           <button 
             onClick={() => initiateManualDispatch('standard')} 
             className="w-full flex items-center justify-between bg-[#F9A825]/10 hover:bg-[#F9A825]/20 text-[#F9A825] border border-[#F9A825]/30 px-5 py-4 rounded-xl transition-all shadow-[0_0_10px_rgba(249,168,37,0.15)] group"
           >
             <div className="flex items-center gap-3">
               <AlertTriangle size={16} />
               <span className="text-[10px] font-mono font-bold tracking-widest text-[#FFF8E1]">Dispatch Standard Emergency</span>
             </div>
             <span className="text-[8px] font-mono opacity-70 group-hover:opacity-100">(Police & Ambulance)</span>
           </button>
           
           <button 
             onClick={() => initiateManualDispatch('all')} 
             className="w-full flex items-center justify-between bg-[#FF1744]/10 hover:bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/30 px-5 py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,23,68,0.2)] group"
           >
             <div className="flex items-center gap-3">
               <Siren size={16} />
               <span className="text-[10px] font-mono font-bold tracking-widest text-[#FFEBEE]">Dispatch ALL AGENCIES</span>
             </div>
             <span className="text-[8px] font-mono opacity-70 group-hover:opacity-100">(Police, Fire, EMS)</span>
           </button>
         </div>

         {/* Visual Toast Notification */}
         {toast && (
           <div className={`mt-4 px-4 py-3 rounded-lg text-[9px] font-mono font-bold tracking-widest text-center border animate-in fade-in slide-in-from-top-2 ${toast.includes('SUCCESS') ? 'bg-[#388E3C]/20 border-[#388E3C]/50 text-[#C8E6C9]' : toast.includes('ERROR') ? 'bg-[#FF1744]/20 border-[#FF1744]/50 text-[#FFCDD2]' : 'bg-[#4FC3F7]/10 border-[#4FC3F7]/30 text-[#E1F5FE]'}`}>
             {toast}
           </div>
         )}
      </div>    </div>
  );
};

export default ManualTriggerPanel;
