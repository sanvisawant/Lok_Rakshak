import React, { useEffect, useState } from 'react';
import { Sun, Moon, ShieldAlert } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import Sidebar from './Sidebar';
import RightDrawer from './RightDrawer';
import CameraGrid from '../widgets/CameraGrid';
import SpatialAwareness from '../widgets/SpatialAwareness';
import RiskMeter from '../widgets/RiskMeter';
import MetricsGrid from '../widgets/MetricsGrid';
import AlertOverlay from '../widgets/AlertOverlay';
import '../../index.css';

const STATUS_META = {
  GREEN:    { color: '#00FFC2', label: 'NOMINAL // ACTIVE' },
  YELLOW:   { color: '#FFB300', label: 'ELEVATED // MONITORING' },
  RED:      { color: '#FF3B3B', label: 'THREAT // HITL ACTIVE' },
  CRITICAL: { color: '#FF3B3B', label: 'CRITICAL // NDMA LIVE' },
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { hour12: true }));
  useEffect(() => {
    const t = setInterval(() =>
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: true })), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      className="text-[12px] font-mono tabular-nums"
      style={{ color: 'var(--accent-primary)', letterSpacing: '0.1em' }}
    >
      {time}
    </span>
  );
};

const Divider = () => (
  <div style={{ width: 1, height: 26, backgroundColor: 'var(--border-subtle)' }} />
);

const DashboardLayout = ({ theme, toggleTheme }) => {
  const { criticalAlert, systemStatus, wsConnected } = useDashboardStore();
  useWebSocket();

  const statusMeta = STATUS_META[systemStatus] || STATUS_META.GREEN;
  const isCritical  = systemStatus === 'CRITICAL' || systemStatus === 'RED';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isCritical ? 'ring-2 ring-inset ring-[#FF3B3B]/35' : ''
      }`}
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <Sidebar />

      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* ── Aero-Tech Header ─────────────────────────────────── */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 transition-all duration-500"
          style={{
            height: 'var(--header-height)',
            backgroundColor:
              isCritical         ? 'rgba(255,59,59,0.10)' :
              systemStatus === 'YELLOW' ? 'rgba(255,179,0,0.07)' :
              'rgba(16,16,16,0.95)',
            borderBottom: `1px solid ${isCritical ? 'rgba(255,59,59,0.25)' : 'var(--border-faint)'}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* ── LEFT: Brand ──────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Glyph */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                border: '1px solid var(--accent-primary)',
                boxShadow: '0 0 12px rgba(0,255,194,0.2)',
                backgroundColor: 'rgba(0,255,194,0.06)',
              }}
            >
              <ShieldAlert size={16} style={{ color: 'var(--accent-primary)' }} />
            </div>

            {/* Logo text */}
            <div className="flex flex-col leading-none">
              <span
                className="text-[15px] font-black tracking-[0.22em] font-mono"
                style={{
                  color: '#FFFFFF',
                  textShadow: '0 0 18px rgba(0,255,194,0.25)',
                }}
              >
                LOK-<span style={{ color: 'var(--accent-primary)' }}>RAKSHAK</span>
              </span>
              <span
                className="text-[8px] font-mono tracking-[0.4em] mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                ICCC · COMMAND CENTER
              </span>
            </div>
          </div>

          {/* ── RIGHT: Status cluster ────────────────────── */}
          <div className="flex items-center gap-4">

            {/* Brain link */}
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: wsConnected ? 'var(--status-safe)' : 'var(--status-danger)' }}
              />
              <span className="text-[8px] font-mono tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>
                {wsConnected ? 'BRAIN_LINK·LIVE' : 'BRAIN_LINK·DOWN'}
              </span>
            </div>

            <Divider />

            {/* System status */}
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[7px] font-mono tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                SYS·STATUS
              </span>
              <span
                className="text-[10px] font-mono font-black tracking-widest"
                style={{ color: statusMeta.color, textShadow: `0 0 8px ${statusMeta.color}` }}
              >
                {statusMeta.label}
              </span>
            </div>

            <Divider />

            <LiveClock />

            <Divider />

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: 'rgba(0,255,194,0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* ── Dashboard Body ────────────────────────────────────── */}
        <div
          className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden"
          style={{ backgroundColor: 'var(--bg-main)' }}
        >
          {/* Cameras — 7 cols */}
          <section className="col-span-7 flex flex-col gap-3 overflow-hidden">
            <CameraGrid />
          </section>

          {/* Risk + Metrics — 2 cols */}
          <section className="col-span-2 flex flex-col gap-3 overflow-hidden">
            <div className="h-[54%] flex-shrink-0">
              <RiskMeter />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
              <MetricsGrid />
            </div>
          </section>

          {/* Spatial — 3 cols */}
          <section className="col-span-3 flex flex-col overflow-hidden rounded-xl"
            style={{ border: '1px solid var(--border-subtle)' }}>
            <SpatialAwareness />
          </section>
        </div>

        {criticalAlert && <AlertOverlay />}
      </main>

      <RightDrawer />
    </div>
  );
};

export default DashboardLayout;
