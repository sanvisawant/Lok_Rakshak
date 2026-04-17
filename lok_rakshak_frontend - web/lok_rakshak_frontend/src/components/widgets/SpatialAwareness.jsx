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
    <div className="w-full h-full flex flex-col bg-[#071622]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1B3F63] flex-shrink-0 bg-[#0B1E2D]">
        <div className="flex items-center gap-2">
          <MapIcon size={14} className="text-[#4FC3F7]" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#B0BEC5]">VECTOR MOVEMENT ANALYSIS</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-[#4FC3F7] animate-ping" />
          <span className="text-[8px] font-mono text-[#78909C]">LIVE_MAP_SYNC</span>
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

        {/* Actionable annotations */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm border border-[#1B3F63] px-2 py-1 rounded">
             <div className="text-[7px] text-[#78909C] font-bold uppercase">Primary Density</div>
             <div className="text-[10px] font-mono font-bold text-[#E3F2FD]">SECTOR-7 PLATFORM</div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 text-right pointer-events-none">
          <div className="bg-black/40 px-2 py-1 rounded border border-[#FF1744]/30 backdrop-blur-sm">
            <div className="text-[7px] text-[#FF1744] font-bold">CHAOS_INDEX</div>
            <div className="text-[11px] font-mono text-white">{(variance * 2).toFixed(2)}</div>
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
                style={{ filter: 'blur(8px)', animationDelay: `${i * 0.4}s` }}
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
      <div className="bg-[#0B1E2D] p-3 border-t border-[#1B3F63] flex-shrink-0">
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_5px_#FF1744]" />
             <span className="text-[8px] text-[#78909C] uppercase font-bold">Congested Areas</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-[2px] bg-[#4FC3F7]" />
             <span className="text-[8px] text-[#78909C] uppercase font-bold">Movement Speed</span>
          </div>
        </div>
        <p className="text-[7px] text-[#4FC3F7]/70 leading-tight italic border-t border-[#1B3F63]/50 pt-1">
          Arrows indicate movement direction. Larger circles indicate higher density groups. 
          Use for platform deployment & crowd control decisions.
        </p>
      </div>
    </div>
  );
};

export default SpatialAwareness;
