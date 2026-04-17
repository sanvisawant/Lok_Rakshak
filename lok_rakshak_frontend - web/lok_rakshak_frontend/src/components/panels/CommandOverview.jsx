import React from 'react';
import { Globe } from 'lucide-react';

const C     = '#00FFC2';
const AMBER = '#FFB300';
const RED   = '#FF3B3B';
const GREY  = '#7A7A7A';
const WHITE = '#FFFFFF';
const PANEL = 'rgba(18,18,18,0.85)';
const BORDER = 'rgba(0,255,194,0.10)';

const STATUS_DOT = {
  ok:      { color: '#00FFC2', glow: '#00FFC2' },
  warning: { color: '#FFB300', glow: '#FFB300' },
  error:   { color: '#FF3B3B', glow: '#FF3B3B' },
};

const StatusItem = ({ label, value, status }) => {
  const dot = STATUS_DOT[status] || STATUS_DOT.ok;
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl mb-2 transition-all group"
      style={{
        backgroundColor: PANEL,
        border: `1px solid ${BORDER}`,
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,194,0.22)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = BORDER}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: dot.color, boxShadow: `0 0 6px ${dot.glow}` }} />
        <span className="text-[9px] font-mono font-bold tracking-[0.22em] uppercase"
          style={{ color: GREY }}>
          {label}
        </span>
      </div>
      <span className="text-[10px] font-mono font-black" style={{ color: WHITE }}>
        {value}
      </span>
    </div>
  );
};

const CommandOverview = () => (
  <div className="flex flex-col gap-6">

    {/* System Infrastructure */}
    <div>
      <p className="text-[8px] font-mono font-bold tracking-[0.35em] uppercase mb-3" style={{ color: C }}>
        SYSTEM INFRASTRUCTURE
      </p>
      <StatusItem label="CORE_SERVER_A"      value="98.2% LOAD"  status="ok"      />
      <StatusItem label="DATABASE_CLUSTER"   value="12ms LATENCY" status="ok"     />
      <StatusItem label="AI_PROCESSING_UNIT" value="ACTIVE"       status="ok"     />
      <StatusItem label="NETWORK_GATEWAY"    value="82% CAP"      status="warning" />
    </div>

    {/* Geo-spatial coverage */}
    <div className="p-4 rounded-2xl" style={{ backgroundColor: PANEL, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Globe size={12} style={{ color: C }} />
        <span className="text-[8px] font-mono font-black tracking-[0.3em] uppercase" style={{ color: C }}>
          GEO-SPATIAL COVERAGE
        </span>
      </div>
      <div className="aspect-video rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(0,255,194,0.07)' }}>
        <div className="absolute inset-0"
          style={{ backgroundImage: `radial-gradient(rgba(0,255,194,0.08) 1px, transparent 0)`, backgroundSize: '12px 12px' }} />
        <span className="text-[8px] font-mono" style={{ color: 'rgba(0,255,194,0.35)' }}>
          SECTORMAP_NORTH_GRID_ACTIVE
        </span>
      </div>
    </div>

    {/* Squad logs */}
    <div>
      <p className="text-[8px] font-mono font-bold tracking-[0.35em] uppercase mb-3" style={{ color: C }}>
        ACTIVE SQUAD LOGS
      </p>
      <div className="rounded-2xl p-4 space-y-2.5"
        style={{ backgroundColor: PANEL, border: `1px solid ${BORDER}`, fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }}>
        {[
          { time: '[14:02:11]', color: C,     msg: 'SQUAD_ALPHA deployed to Gate 4.' },
          { time: '[14:05:45]', color: C,     msg: 'Barrier check complete at North Corridor.' },
          { time: '[14:10:22]', color: AMBER, msg: 'Rerouting personnel for Sector-7 crowd peak.' },
        ].map((log, i) => (
          <div key={i} className="flex gap-2">
            <span style={{ color: log.color, flexShrink: 0 }}>{log.time}</span>
            <span style={{ color: GREY }}>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CommandOverview;
