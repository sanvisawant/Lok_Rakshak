import React from 'react';
import { Activity, Shield, Globe, Cpu, Server } from 'lucide-react';

const StatusItem = ({ label, value, status }) => (
  <div className="flex justify-between items-center p-6 bg-[#0B1E2D]/80 border border-[#1B3F63]/40 rounded-3xl hover:border-[#4FC3F7]/40 transition-all duration-500 shadow-2xl mb-4 group animate-in fade-in slide-in-from-right-4">
    <div className="flex items-center gap-5">
      <div className={`w-3 h-3 rounded-full ${status === 'ok' ? 'bg-[#388E3C] shadow-[0_0_15px_#388E3C]' : 'bg-[#F9A825] shadow-[0_0_15px_#F9A825]'} animate-pulse`} />
      <span className="text-[11px] text-[#B0BEC5] font-bold tracking-[0.2em] group-hover:text-white transition-colors uppercase">{label}</span>
    </div>
    <span className="text-[12px] font-mono font-bold text-[#4FC3F7]">{value}</span>
  </div>
);

const CommandOverview = () => {
  return (
    <div className="flex flex-col gap-6 drawer-card p-6">
      <div className="space-y-4">
        <h3 className="section-heading">SYSTEM INFRASTRUCTURE</h3>
        
        <div className="grid grid-cols-1 gap-3">
          <StatusItem label="CORE_SERVER_A" value="98.2% LOAD" status="ok" />
          <StatusItem label="DATABASE_CLUSTER" value="12ms LATENCY" status="ok" />
          <StatusItem label="AI_PROCESSING_UNIT" value="ACTIVE" status="ok" />
          <StatusItem label="NETWORK_GATEWAY" value="82% CAP" status="warning" />
        </div>
      </div>

      <div className="p-5 bg-[#0B1E2D]/65 border border-[#1B3F63]/50 rounded-[2rem] shadow-inner">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={16} className="text-[#4FC3F7]" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#4FC3F7] uppercase">GEO-SPATIAL COVERAGE</span>
        </div>
        <div className="aspect-video bg-[#0B1E2D] rounded-[2rem] border border-[#1B3F63]/50 flex items-center justify-center relative overflow-hidden">
           {/* Simple map placeholder grid */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4FC3F7 1px, transparent 0)', backgroundSize: '10px 10px' }} />
           <div className="text-[8px] font-mono text-[#78909C]">SECTORMAP_NORTH_GRID_ACTIVE</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="section-heading">ACTIVE SQUAD LOGS</h3>
        <div className="bg-[#0B1E2D]/60 border border-[#1B3F63]/50 rounded-[2rem] p-4 space-y-3">
          <div className="flex gap-2">
            <span className="text-[#388E3C]">[14:02:11]</span>
            <span>SQUAD_ALPHA deployed to Gate 4.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#388E3C]">[14:05:45]</span>
            <span>Barrier check complete at North Corridor.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#F9A825]">[14:10:22]</span>
            <span>Rerouting personnel for Sector-7 crowd peak.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandOverview;
