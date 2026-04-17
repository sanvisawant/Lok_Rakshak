import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { Map as MapIcon } from 'lucide-react';

const SpatialAwareness = () => {
  const { personCount, variance, compression, systemStatus } = useDashboardStore();

  // Dynamic visual parameters driven by live YOLO/ML data
  const baseIntensity =
    systemStatus === 'CRITICAL' || systemStatus === 'RED' ? 0.85 :
    systemStatus === 'YELLOW' ? 0.6 : 0.35;

  const hotspotColor =
    systemStatus === 'CRITICAL' || systemStatus === 'RED' ? '#D32F2F' :
    systemStatus === 'YELLOW' ? '#F9A825' : '#4FC3F7';

  // Scale blob radius to visible SVG size (400×300)
  const mainBlobR   = Math.max(25, Math.min(100, 25 + personCount * 1.2 + compression * 30));
  const secondBlobR = Math.max(15, mainBlobR * 0.5);

  // Optical flow arrows — scaled to fit 400×300
  const vectorLen = Math.max(20, 15 + variance * 35);
  const angle     = variance * Math.PI;
  const dx = Math.cos(angle) * vectorLen;
  const dy = Math.sin(angle) * vectorLen;

  // Hotspot positions relative to 400×300 SVG
  const hotspots = [
    { x: 200, y: 160, r: mainBlobR,   opacity: baseIntensity,        color: hotspotColor },
    { x: 320, y: 100, r: secondBlobR, opacity: baseIntensity * 0.65, color: hotspotColor },
    { x: 80,  y: 220, r: secondBlobR * 0.7, opacity: baseIntensity * 0.4, color: hotspotColor },
  ];

  const vectors = [
    { x1: 200, y1: 160, x2: 200 + dx, y2: 160 + dy },
    { x1: 320, y1: 100, x2: 320 - dy * 0.6, y2: 100 + dx * 0.6 },
  ];

  // Format variance as displayable number
  const varianceDisplay = (variance * 100).toFixed(1);
  const compressionPct  = (compression * 100).toFixed(0);

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* Panel header — title centred, sync badge absolute right */}
      <div
        className="relative flex items-center justify-center px-4 py-3 flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(27,63,99,0.3)',
          backgroundColor: 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2">
          <MapIcon size={14} style={{ color: 'var(--accent-primary)' }} />
          <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
            VECTOR MOVEMENT ANALYSIS
          </span>
        </div>
        <div className="absolute right-4 flex gap-1 items-center">
          <div className="w-1 h-1 rounded-full bg-[#4FC3F7] animate-ping" />
          <span className="text-[8px] font-mono" style={{ color: 'var(--text-muted)' }}>LIVE_MAP_SYNC</span>
        </div>
      </div>

      {/* SVG heatmap */}
      <div className="flex-1 relative overflow-hidden group">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#1B3F63 1px, transparent 1px), linear-gradient(90deg, #1B3F63 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Annotation pill — left (PRIMARY DENSITY) */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div
            className="flex flex-col items-center justify-center text-center px-4 py-2.5 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
              minWidth: '108px',
            }}
          >
            <span className="text-[8px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
              Primary Density
            </span>
            <span className="text-[11px] font-mono font-bold block mt-0.5" style={{ color: 'var(--text-primary)' }}>
              SECTOR-7
            </span>
          </div>
        </div>

        {/* Annotation pill — right (CHAOS INDEX) */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div
            className="flex flex-col items-center justify-center text-center px-4 py-2.5 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(211,47,47,0.25)',
              minWidth: '88px',
            }}
          >
            <span className="text-[8px] font-bold tracking-widest block" style={{ color: 'var(--status-danger)' }}>
              CHAOS
            </span>
            <span className="text-[14px] font-mono font-black block mt-0.5" style={{ color: '#fff' }}>
              {(variance * 2).toFixed(2)}
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="hotspotGrad">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <marker id="vArrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4FC3F7" />
            </marker>
          </defs>

          {/* Heatmap blobs with descriptive labels */}
          {hotspots.map((h, i) => (
            <g key={i}>
              <circle
                cx={h.x} cy={h.y}
                r={h.r}
                fill={h.color}
                fillOpacity={h.opacity}
                className="animate-pulse"
                style={{ 
                  filter: `drop-shadow(0 0 ${h.r * 0.4}px ${h.color}) blur(4px)`, 
                  animationDelay: `${i * 0.4}s` 
                }}
              />
              {/* Dynamic labels that follow hotspots */}
              {h.r > 40 && (
                <text 
                  x={h.x} 
                  y={h.y - h.r - 5} 
                  textAnchor="middle" 
                  className="fill-[#E3F2FD] text-[8px] font-bold tracking-tighter"
                  style={{ textShadow: '0 0 4px black' }}
                >
                  {i === 0 ? 'HIGH CROWD DENSITY' : 'CONGESTION POINT'}
                </text>
              )}
            </g>
          ))}

          {/* Flow vectors with movement descriptors */}
          {variance > 0 && vectors.map((v, i) => (
            <g key={i}>
              <line
                x1={v.x1} y1={v.y1}
                x2={v.x2} y2={v.y2}
                stroke="#4FC3F7"
                strokeWidth="2"
                strokeOpacity="0.8"
                markerEnd="url(#vArrow)"
              />
              <text 
                x={(v.x1 + v.x2) / 2 + 10} 
                y={(v.y1 + v.y2) / 2} 
                className="fill-[#4FC3F7] text-[7px] font-mono italic"
                style={{ textShadow: '0 0 2px black' }}
              >
                FLOW_DIR
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Simple Understanding Legend */}
      <div className="bg-black/30 p-4 border-t border-[#1B3F63]/30 flex-shrink-0 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_8px_#FF1744]" />
             <span className="text-[9px] tracking-widest text-[#78909C] uppercase font-bold">Congested Areas</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-[2px] bg-[#4FC3F7] shadow-[0_0_8px_#4FC3F7]" />
             <span className="text-[9px] tracking-widest text-[#78909C] uppercase font-bold">Movement Speed</span>
          </div>
        </div>
        <p className="text-[9px] text-[#4FC3F7]/70 leading-tight italic pt-2 mt-2 border-t border-white/5 block">
          Arrows indicate movement direction. Larger circles indicate higher density groups. 
          Use for platform deployment & crowd control decisions.
        </p>
      </div>
    </div>
  );
};

export default SpatialAwareness;
