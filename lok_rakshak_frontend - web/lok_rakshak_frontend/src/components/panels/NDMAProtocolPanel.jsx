import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, VolumeX, Send, Zap } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { BACKEND_URL } from '../../config';

const CustomAnnouncementCard = () => {
  const { systemStatus, personCount, addLiveAlert } = useDashboardStore();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const handleBroadcast = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    try {
      await fetch(`${BACKEND_URL}/api/triggers/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_text: msg })
      });
      
      // Log to timeline
      addLiveAlert({
        id: Date.now(),
        type: 'WARNING',
        title: 'CUSTOM_BROADCAST',
        location: 'STATION_WIDE',
        message: `Operator broadcast: "${msg}"`,
        time: new Date().toLocaleTimeString(),
        priority: 'P1',
        source: 'HITL_VOICE'
      });
      
      setMsg('');
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  return (
    <div className="p-8 rounded-[2rem] border border-[#4FC3F7]/30 bg-[#0B1E2D]/60 backdrop-blur-xl mb-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
        <VolumeX size={48} className="text-[#4FC3F7]" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#4FC3F7]/10 rounded-xl text-[#4FC3F7]">
          <Zap size={20} />
        </div>
        <h4 className="text-sm font-bold text-[#E3F2FD] tracking-widest uppercase">Custom Live Broadcast</h4>
      </div>

      <textarea
        className="w-full h-24 bg-[#0B1E2D]/70 border border-[#1B3F63]/50 rounded-2xl p-4 text-xs font-mono text-[#E3F2FD] focus:outline-none focus:border-[#4FC3F7] transition-all mb-4 placeholder-[#78909C]"
        placeholder="ENTER ANNOUNCEMENT TEXT..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />

      <button
        onClick={handleBroadcast}
        disabled={busy || !msg.trim()}
        className="w-full py-4 bg-[#4FC3F7] text-[#132F4C] rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-[#00E5FF] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {busy ? 'BROADCASTING...' : (
          <>
            <Send size={16} />
            PUSH TO STATION SPEAKERS
          </>
        )}
      </button>
    </div>
  );
};

const ProtocolStep = ({ number, title, status, description }) => {
  const { systemStatus, personCount, addLiveAlert } = useDashboardStore();

  const speak = async (status, density) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/triggers/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, density })
      });
      const data = await res.json();
      
      // Log to timeline
      addLiveAlert({
        id: Date.now(),
        type: status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        title: `PROTOCOL_${number}_EXECUTION`,
        location: 'SECTOR_7',
        message: data.message,
        time: new Date().toLocaleTimeString(),
        priority: 'P1',
        source: 'AUTO_VOICE'
      });
    } catch (e) {
      console.warn('[VOICE] Backend speak failed:', e);
    }
  };

  const handleExecute = () => {
    if (status !== 'ACTIVE') return;
    speak(systemStatus, personCount);
  };

  return (
    <div className={`p-8 rounded-[2rem] border backdrop-blur-md transition-all duration-500 shadow-2xl ${status === 'ACTIVE' ? 'bg-[#1B3F63]/80 border-[#4FC3F7] shadow-[#4FC3F7]/15 scale-[1.02]' : 'bg-[#0B1E2D]/40 border-[#1B3F63]/40 opacity-50 hover:opacity-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono bg-[#4FC3F7] text-[#132F4C] px-3 py-1 rounded-full font-bold shadow-sm">{number}</span>
          <h4 className="text-xs font-bold text-[#E3F2FD] tracking-widest uppercase">{title}</h4>
        </div>
      </div>
      <p className="text-xs text-[#B0BEC5] mb-5 leading-relaxed font-medium">{description}</p>
      <button 
        onClick={handleExecute}
        className={`w-full py-4 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all transform active:scale-95 ${status === 'ACTIVE' ? 'bg-[#4FC3F7] text-[#132F4C] hover:bg-[#00E5FF] shadow-[0_4px_15px_rgba(79,195,247,0.3)]' : 'bg-[#1B3F63]/50 text-[#78909C]'}`}
      >
        {status === 'ACTIVE' ? 'EXECUTE CORE PROTOCOL' : 'AUTHORIZATION REQUIRED'}
      </button>
    </div>
  );
};

const NDMAProtocolPanel = () => {
  const protocols = [
    { number: 'P1', title: 'CROWD DIVERSION', status: 'ACTIVE', description: 'Initiate automated voice announcements and redirect personnel to secondary exits in Sector-7.' },
    { number: 'P2', title: 'ENTRY RESTRICTION', status: 'LOCKED', description: 'Lockdown of all primary entrance turnstiles. Divert arriving passengers to holding areas.' },
    { number: 'P3', title: 'FULL EVACUATION', status: 'LOCKED', description: 'State-wide emergency protocols. All platform gates opened. Emergency services dispatched.' },
  ];

  const handleStopAudio = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/triggers/stop-audio`, { method: 'POST' });
      addLiveAlert({
        id: Date.now(),
        type: 'WARNING',
        title: 'EMERGENCY_STOP',
        location: 'AUDIO_ENGINE',
        message: 'All ongoing voice broadcasts have been terminated by operator.',
        time: new Date().toLocaleTimeString(),
        priority: 'P1',
        source: 'HITL_STOP'
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full gap-8 drawer-card p-6">
      <CustomAnnouncementCard />

      <div className="flex items-center justify-between p-5 bg-[#D32F2F]/10 border border-[#D32F2F]/20 rounded-[2rem] backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-[#D32F2F]" size={24} />
          <div>
            <div className="text-[11px] font-bold text-[#D32F2F] tracking-[0.2em] uppercase">Emergency Core</div>
            <div className="text-[10px] text-[#78909C] font-mono">STATUS: READY</div>
          </div>
        </div>
        <button 
          onClick={handleStopAudio}
          className="p-3 bg-[#D32F2F] text-white rounded-xl hover:bg-red-600 transition-all shadow-lg active:scale-90"
          title="STOP ALL AUDIO"
        >
          <VolumeX size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <h3 className="section-heading px-2">NDMA Standard Protocols</h3>
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
