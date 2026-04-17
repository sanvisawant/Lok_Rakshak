import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
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

// Status → colour mapping reused across header
const STATUS_COLORS = {
  GREEN:    { text: 'text-[#388E3C]', label: 'NOMINAL // ACTIVE' },
  YELLOW:   { text: 'text-[#F9A825]', label: 'ELEVATED // MONITORING' },
  RED:      { text: 'text-[#FF1744]', label: 'THREAT // HITL ACTIVE' },
  CRITICAL: { text: 'text-[#FF1744]', label: 'CRITICAL // NDMA LIVE' },
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{time}</span>;
};

const DashboardLayout = ({ theme, toggleTheme }) => {
  const { criticalAlert, systemStatus, wsConnected } = useDashboardStore();
  useWebSocket();

  const statusMeta = STATUS_COLORS[systemStatus] || STATUS_COLORS.GREEN;
  const isCritical = systemStatus === 'CRITICAL' || systemStatus === 'RED';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden transition-all duration-700 ${
        isCritical ? 'ring-2 ring-inset ring-[#FF1744]/40' : ''
      }`}
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* ── Header ── */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 transition-all duration-500"
          style={{
            height: 'var(--header-height)',
            backgroundColor:
              systemStatus === 'CRITICAL' ? 'rgba(211,47,47,0.18)' :
              systemStatus === 'RED'      ? 'rgba(180,30,30,0.12)' :
              systemStatus === 'YELLOW'   ? 'rgba(249,168,37,0.10)' :
              'var(--bg-panel)',
            borderBottom: '1px solid var(--border-faint)',
          }}
        >
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black tracking-[0.18em]" style={{ color: 'var(--accent-primary)' }}>
              LOK-RAKSHAK
            </h1>
            <span
              className="text-[10px] font-mono tracking-widest hidden md:block"
              style={{ color: 'var(--text-muted)' }}
            >
              // ICCC COMMAND CENTER
            </span>
          </div>

          {/* Right: Status row */}
          <div className="flex items-center gap-5">

            {/* WS indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${wsConnected ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: wsConnected ? 'var(--status-safe)' : 'var(--status-danger)' }}
              />
              <span className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {wsConnected ? 'BRAIN_LINK_LIVE' : 'BRAIN_LINK_DOWN'}
              </span>
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-subtle)' }} />

            {/* System status */}
            <div className="text-right">
              <div className="text-[9px] tracking-widest" style={{ color: 'var(--text-muted)' }}>SYSTEM STATUS</div>
              <div className={`text-[11px] font-mono font-bold ${statusMeta.text}`}>
                {statusMeta.label}
              </div>
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-subtle)' }} />

            <LiveClock />

            <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-subtle)' }} />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark'
                ? <Sun size={15} />
                : <Moon size={15} />
              }
            </button>
          </div>
        </header>

        {/* ── Dashboard Body — 12 col grid ── */}
        <div
          className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 30% 50%, var(--bg-panel) 0%, var(--bg-main) 100%)',
          }}
        >
          {/* Left: Camera (7 cols) */}
          <section className="col-span-7 flex flex-col gap-4 overflow-hidden">
            <CameraGrid />
          </section>

          {/* Middle: Risk + Metrics (2 cols) */}
          <section className="col-span-2 flex flex-col gap-4 overflow-hidden">
            <div className="h-[55%] flex-shrink-0">
              <RiskMeter />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <MetricsGrid />
            </div>
          </section>

          {/* Right: Spatial (3 cols) */}
          <section className="col-span-3 flex flex-col overflow-hidden">
            <div className="flex-1 relative overflow-hidden modern-card">
              <SpatialAwareness />
            </div>
          </section>
        </div>

        {/* Global Alert Overlay */}
        {criticalAlert && <AlertOverlay />}
      </main>

      {/* Slide-out Drawer */}
      <RightDrawer />
    </div>
  );
};

export default DashboardLayout;
