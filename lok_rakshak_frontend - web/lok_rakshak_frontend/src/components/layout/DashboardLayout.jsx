import React, { useEffect } from 'react';
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

const DashboardLayout = () => {
  const { criticalAlert, systemStatus, wsConnected } = useDashboardStore();

  // Mount the WebSocket bridge — runs once at the root layout level
  useWebSocket();

  const statusMeta = STATUS_COLORS[systemStatus] || STATUS_COLORS.GREEN;
  const isCritical = systemStatus === 'CRITICAL' || systemStatus === 'RED';

  return (
    <div
      className={`flex h-screen w-screen bg-[#0B1E2D] text-[#E3F2FD] overflow-hidden transition-all duration-700 ${
        isCritical ? 'border-4 border-[#FF1744]/60' : ''
      }`}
    >
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header
          className={`h-[60px] border-b border-[#1B3F63] flex items-center justify-between px-6 transition-colors duration-700 flex-shrink-0 ${
            systemStatus === 'CRITICAL' ? 'bg-[#D32F2F]/30 animate-pulse' :
            systemStatus === 'RED'      ? 'bg-[#7B1818]/20' :
            systemStatus === 'YELLOW'   ? 'bg-[#3D2A00]/30' :
            'bg-[#132F4C]'
          }`}
        >
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-wider text-[#4FC3F7]">
              LOKRAKSHAK <span className="text-xs font-normal text-[#B0BEC5] ml-2">// COMMAND CENTER</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* WebSocket connection indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[#388E3C] animate-pulse' : 'bg-[#D32F2F]'}`} />
              <span className="text-[9px] font-mono text-[#78909C] tracking-widest">
                {wsConnected ? 'BRAIN_LINK_LIVE' : 'BRAIN_LINK_DOWN'}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-[#1B3F63]" />

            <div className="text-right">
              <div className="text-xs text-[#78909C]">SYSTEM STATUS</div>
              <div className={`text-sm font-mono font-bold ${statusMeta.text}`}>
                {statusMeta.label}
              </div>
            </div>

            <div className="h-8 w-[1px] bg-[#1B3F63]" />
            <div className="text-sm font-mono">{new Date().toLocaleTimeString()}</div>
          </div>
        </header>

        {/* Dashboard Body — 3 columns */}
        {/*
          Col layout (12 cols):
            Left  — col-span-6 : Camera feeds (large primary + 3 small + anomaly bar)
            Mid   — col-span-3 : Risk meter + Metrics
            Right — col-span-3 : Spatial vector map (compact)
        */}
        <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden bg-[radial-gradient(circle_at_center,_#132F4C_0%,_#0B1E2D_100%)]">

          {/* ── Left: Camera section (6 cols) ── */}
          <section className="col-span-6 flex flex-col gap-3 overflow-hidden">
            <CameraGrid />
          </section>

          {/* ── Middle: Risk + Metrics (3 cols) ── */}
          <section className="col-span-3 flex flex-col gap-3 overflow-hidden">
            <div className="h-[40%] flex-shrink-0">
              <RiskMeter />
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              <MetricsGrid />
            </div>
          </section>

          {/* ── Right: Spatial Awareness vector map (3 cols) ── */}
          <section className="col-span-3 flex flex-col gap-3 overflow-hidden">
            <div className="flex-1 bg-[#132F4C] border border-[#1B3F63] rounded shadow-2xl relative overflow-hidden">
              <SpatialAwareness />
            </div>
          </section>

        </div>

        {/* Global Alert Overlay */}
        {criticalAlert && <AlertOverlay />}
      </main>

      {/* Slide-out Panel */}
      <RightDrawer />
    </div>
  );
};

export default DashboardLayout;
