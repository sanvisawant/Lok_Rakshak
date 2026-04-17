import React from 'react';
import { ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';

const ProtocolStep = ({ number, title, status, description }) => (
  <div className={`p-8 rounded-[2rem] border backdrop-blur-md transition-all duration-500 shadow-2xl ${status === 'ACTIVE' ? 'bg-[#1B3F63]/80 border-[#4FC3F7] shadow-[#4FC3F7]/15 scale-[1.02]' : 'bg-[#0B1E2D]/40 border-[#1B3F63]/40 opacity-50 hover:opacity-100 hover:bg-[#0B1E2D]/60'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono bg-[#4FC3F7] text-[#132F4C] px-3 py-1 rounded-full font-bold shadow-sm">{number}</span>
        <h4 className="text-xs font-bold text-[#E3F2FD] tracking-widest uppercase">{title}</h4>
      </div>
      {status === 'ACTIVE' && (
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-bold text-[#388E3C] tracking-tighter">RECOMMENDED</span>
          <div className="p-1.5 bg-[#388E3C] rounded-full animate-pulse shadow-[0_0_10px_#388E3C]" />
        </div>
      )}
    </div>
    <p className="text-xs text-[#B0BEC5] mb-5 leading-relaxed font-medium">{description}</p>
    <button className={`w-full py-3 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all transform active:scale-95 ${status === 'ACTIVE' ? 'bg-[#4FC3F7] text-[#132F4C] hover:bg-[#00E5FF] shadow-[0_4px_15px_rgba(79,195,247,0.3)]' : 'bg-[#1B3F63]/50 text-[#78909C]'}`}>
      {status === 'ACTIVE' ? 'EXECUTE CORE PROTOCOL' : 'AUTHORIZATION REQUIRED'}
    </button>
  </div>
);

const NDMAProtocolPanel = () => {
  const protocols = [
    { number: 'P1', title: 'CROWD DIVERSION', status: 'ACTIVE', description: 'Initiate automated voice announcements and redirect personnel to secondary exits in Sector-7.' },
    { number: 'P2', title: 'ENTRY RESTRICTION', status: 'LOCKED', description: 'Lockdown of all primary entrance turnstiles. Divert arriving passengers to holding areas.' },
    { number: 'P3', title: 'FULL EVACUATION', status: 'LOCKED', description: 'State-wide emergency protocols. All platform gates opened. Emergency services dispatched.' },
  ];

  return (
    <div className="flex flex-col h-full gap-8 drawer-card p-6">
      <div className="flex items-center gap-4 p-5 bg-[#4FC3F7]/5 border border-[#4FC3F7]/10 rounded-[2rem] backdrop-blur-sm">
        <ShieldCheck className="text-[#4FC3F7]" size={24} />
        <div>
          <div className="text-[11px] font-bold text-[#4FC3F7] tracking-[0.2em] uppercase">Auto-Protocol Engine</div>
          <div className="text-[10px] text-[#78909C] font-mono">STATUS: MONITORING_SECTOR_7</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {protocols.map((p) => (
          <ProtocolStep key={p.number} {...p} />
        ))}
      </div>

      <div className="mt-auto p-6 border border-[#F9A825]/20 bg-[#F9A825]/5 rounded-[2rem] relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-1 h-full bg-[#F9A825] opacity-40 group-hover:opacity-100 transition-opacity" />
         <div className="flex items-center gap-3 mb-3 text-[#F9A825]">
            <AlertCircle size={18} />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase">SOP Reminder (Sec 4.2)</span>
         </div>
         <p className="text-[11px] text-[#94A3B8] leading-relaxed font-medium">
            Ensure clear horizontal lines for exit paths. Do not initiate lockdown without visual confirmation if risk &lt; 85%.
         </p>
      </div>
    </div>
  );
};

export default NDMAProtocolPanel;
