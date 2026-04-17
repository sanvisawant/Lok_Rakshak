import React from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { Clock } from 'lucide-react';

const C     = '#00FFC2';
const AMBER = '#FFB300';
const RED   = '#FF3B3B';
const GREY  = '#7A7A7A';
const WHITE = '#FFFFFF';
const PANEL = 'rgba(18,18,18,0.85)';

const PRIORITY_CFG = {
  CRITICAL: { color: RED,   badgeBg: 'rgba(255,59,59,0.10)',  badgeBorder: 'rgba(255,59,59,0.30)'  },
  RED:      { color: RED,   badgeBg: 'rgba(255,59,59,0.08)',  badgeBorder: 'rgba(255,59,59,0.25)'  },
  WARNING:  { color: AMBER, badgeBg: 'rgba(255,179,0,0.08)',  badgeBorder: 'rgba(255,179,0,0.28)'  },
  INFO:     { color: C,     badgeBg: 'rgba(0,255,194,0.07)',  badgeBorder: 'rgba(0,255,194,0.22)'  },
};

const AlertTimeline = () => {
  const { alerts, addLiveAlert } = useDashboardStore();
  const [selectedId, setSelectedId] = React.useState(null);

  const simulateAlert = () => addLiveAlert({
    id: Date.now(), type: 'WARNING', title: 'DENSITY_PEAK_DETECTED',
    location: 'SECTOR-7 NORTH',
    message: 'Sudden influx of 25+ persons detected. Monitoring flow rate.',
    time: new Date().toLocaleTimeString(), priority: 'P2', source: 'VISION',
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Sub-header */}
      <div className="flex justify-between items-center">
        <span className="text-[8px] font-mono font-bold tracking-[0.35em] uppercase"
          style={{ color: GREY }}>
          Live System Logs
        </span>
        <button onClick={simulateAlert}
          className="text-[8px] font-mono font-bold tracking-widest transition-all"
          style={{ color: C }}>
          [SIMULATE LOG]
        </button>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-3">
        {alerts.length === 0 && (
          <div className="p-5 rounded-2xl text-center"
            style={{ backgroundColor: PANEL, border: '1px solid rgba(0,255,194,0.07)' }}>
            <p className="text-[9px] font-mono" style={{ color: GREY }}>NO ACTIVE ALERTS</p>
          </div>
        )}
        {alerts.map((alert) => {
          const cfg = PRIORITY_CFG[alert.type] || PRIORITY_CFG.INFO;
          const isOpen = selectedId === alert.id;
          return (
            <div key={alert.id}
              onClick={() => setSelectedId(isOpen ? null : alert.id)}
              className="cursor-pointer rounded-2xl p-4 transition-all duration-200"
              style={{
                backgroundColor: isOpen ? 'rgba(22,22,22,0.95)' : PANEL,
                border: `1px solid ${isOpen ? cfg.badgeBorder : 'rgba(0,255,194,0.08)'}`,
                boxShadow: isOpen ? `0 0 20px ${cfg.color}10` : 'none',
              }}
            >
              {/* Top row: badge + time */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-[7px] font-mono font-black tracking-[0.2em] px-2 py-0.5 rounded-full"
                  style={{ color: cfg.color, backgroundColor: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}` }}>
                  {alert.type} // {alert.priority}
                </span>
                <span className="text-[8px] font-mono flex items-center gap-1" style={{ color: GREY }}>
                  <Clock size={9} /> {alert.time}
                </span>
              </div>

              {/* Title */}
              <p className="text-[11px] font-mono font-black tracking-wide uppercase mb-1"
                style={{ color: WHITE }}>
                {alert.title}
              </p>

              {/* Message */}
              <p className={`text-[9px] font-mono leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}
                style={{ color: GREY }}>
                {alert.message}
              </p>

              {/* Expanded: location + ID */}
              {isOpen && (
                <div className="mt-3 pt-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid rgba(0,255,194,0.08)' }}>
                  <span className="text-[8px] font-mono font-bold" style={{ color: C }}>
                    {alert.location}
                  </span>
                  <span className="text-[7px] font-mono px-2 py-0.5 rounded"
                    style={{ color: GREY, backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    ID: {alert.id.toString().slice(-6)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load archived logs */}
      <button
        className="w-full py-3 rounded-2xl text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-200"
        style={{
          backgroundColor: 'rgba(0,255,194,0.04)',
          border: '1px solid rgba(0,255,194,0.12)',
          color: GREY,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C; e.currentTarget.style.borderColor = 'rgba(0,255,194,0.3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = GREY; e.currentTarget.style.borderColor = 'rgba(0,255,194,0.12)'; }}
      >
        LOAD ARCHIVED LOGS (24H)
      </button>
    </div>
  );
};

export default AlertTimeline;
