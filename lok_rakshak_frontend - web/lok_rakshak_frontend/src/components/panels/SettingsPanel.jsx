import React from 'react';
import { ToggleLeft, ToggleRight, Sliders, Bell } from 'lucide-react';

const C     = '#00FFC2';
const AMBER = '#FFB300';
const RED   = '#FF3B3B';
const GREY  = '#7A7A7A';
const WHITE = '#FFFFFF';
const PANEL = 'rgba(18,18,18,0.85)';
const BORDER = 'rgba(0,255,194,0.10)';

/* Slider with neon-cyan thumb + track */
const AeroSlider = ({ label, value, onChange, valueDisplay }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-[8px] font-mono font-bold tracking-[0.28em] uppercase" style={{ color: GREY }}>
        {label}
      </span>
      <span className="text-[9px] font-mono font-black" style={{ color: C }}>{valueDisplay}</span>
    </div>
    <div className="relative h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,255,194,0.08)' }}>
      <div className="absolute top-0 left-0 h-full rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: C, boxShadow: `0 0 6px ${C}` }} />
      <input type="range" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        value={value} onChange={onChange} min={0} max={100}
        style={{ appearance: 'none' }}
      />
    </div>
  </div>
);

/* Toggle row */
const SettingToggle = ({ label, active, description, onToggle }) => (
  <div onClick={onToggle}
    className="flex justify-between items-start p-4 rounded-2xl mb-2 cursor-pointer transition-all"
    style={{
      backgroundColor: active ? 'rgba(0,255,194,0.04)' : PANEL,
      border: `1px solid ${active ? 'rgba(0,255,194,0.18)' : BORDER}`,
    }}>
    <div className="max-w-[76%]">
      <span className="text-[10px] font-mono font-black tracking-[0.18em] uppercase block mb-1.5"
        style={{ color: active ? WHITE : GREY }}>
        {label}
      </span>
      <span className="text-[8.5px] font-mono leading-relaxed block" style={{ color: GREY }}>
        {description}
      </span>
    </div>
    <div style={{ color: active ? C : GREY, flexShrink: 0 }}>
      {active
        ? <ToggleRight size={32} style={{ filter: `drop-shadow(0 0 5px ${C})` }} />
        : <ToggleLeft  size={32} style={{ opacity: 0.3 }} />
      }
    </div>
  </div>
);

/* Section heading */
const SectionHead = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={13} style={{ color: C }} />
    <span className="text-[8px] font-mono font-black tracking-[0.4em] uppercase" style={{ color: C }}>
      {label}
    </span>
  </div>
);

const SettingsPanel = () => {
  const [config, setConfig] = React.useState({
    autoEscalate: true, hapticAlerts: true, anomalyRecord: false,
    densityTrigger: 85, sensitivity: 50,
  });
  const [saving, setSaving] = React.useState(false);
  const toggle = (k) => setConfig(p => ({ ...p, [k]: !p[k] }));
  const handleSync = () => { setSaving(true); setTimeout(() => setSaving(false), 1200); };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Control Thresholds ── */}
      <div className="p-4 rounded-2xl" style={{ backgroundColor: PANEL, border: `1px solid ${BORDER}` }}>
        <SectionHead icon={Sliders} label="Control Thresholds" />
        <AeroSlider
          label="CRITICAL_DENSITY_TRIGGER"
          value={config.densityTrigger}
          onChange={(e) => setConfig(p => ({ ...p, densityTrigger: parseInt(e.target.value) }))}
          valueDisplay={`${config.densityTrigger}%`}
        />
        <AeroSlider
          label="ALERT_SENSITIVITY"
          value={config.sensitivity}
          onChange={(e) => setConfig(p => ({ ...p, sensitivity: parseInt(e.target.value) }))}
          valueDisplay={config.sensitivity > 70 ? 'HIGH' : config.sensitivity > 30 ? 'MEDIUM' : 'LOW'}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'rgba(0,255,194,0.06)' }} />

      {/* ── Notification Config ── */}
      <div>
        <SectionHead icon={Bell} label="Notification Config" />
        <SettingToggle
          label="AUTO_ESCALATION"
          active={config.autoEscalate}
          description="Allow AI to automatically escalate risk levels based on multi-vector analysis."
          onToggle={() => toggle('autoEscalate')}
        />
        <SettingToggle
          label="SQUAD_HAPTIC_ALERTS"
          active={config.hapticAlerts}
          description="Send vibration alerts to on-duty personnel when density > 70%."
          onToggle={() => toggle('hapticAlerts')}
        />
        <SettingToggle
          label="ANOMALY_RECORDING"
          active={config.anomalyRecord}
          description="Automatically save local 10s clips when anomalous movement is detected."
          onToggle={() => toggle('anomalyRecord')}
        />
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-col gap-2 mt-2">
        <button className="w-full py-3 rounded-xl text-[9px] font-mono font-bold tracking-[0.25em] uppercase transition-all"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: GREY }}
          onMouseEnter={(e) => { e.currentTarget.style.color = WHITE; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = GREY; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
          RESET ALL TO DEFAULTS
        </button>
        <button onClick={handleSync} disabled={saving}
          className="w-full py-3 rounded-xl text-[9px] font-mono font-bold tracking-[0.25em] uppercase transition-all disabled:opacity-40"
          style={{ backgroundColor: C, color: '#0D0D0D', boxShadow: saving ? 'none' : `0 0 14px rgba(0,255,194,0.3)` }}>
          {saving ? 'SYNCING...' : 'APPLY GLOBAL SYNC'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
