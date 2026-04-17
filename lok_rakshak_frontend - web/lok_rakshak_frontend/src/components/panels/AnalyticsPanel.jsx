import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import useDashboardStore from '../../store/useDashboardStore';

const C = '#00FFC2';
const AMBER = '#FFB300';
const RED   = '#FF3B3B';
const GREY  = '#7A7A7A';
const WHITE = '#FFFFFF';
const PANEL = 'rgba(18,18,18,0.85)';
const BORDER = 'rgba(0,255,194,0.10)';

const card = {
  backgroundColor: PANEL,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${BORDER}`,
  borderRadius: '1rem',
};

const AnalyticsPanel = () => {
  const { history, metrics } = useDashboardStore();
  const chartData = history.length > 0 ? history : [{ time: '00:00:00', density: 0, risk: 0 }];
  const lastDensity = chartData[chartData.length - 1]?.density || 0;
  const lastRisk    = chartData[chartData.length - 1]?.risk    || 0;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Live Density Line Chart ── */}
      <div>
        <p className="text-[8px] font-mono font-bold tracking-[0.35em] uppercase mb-3"
          style={{ color: C }}>
          Live Crowd Density (Real-time)
        </p>
        <div className="h-52 w-full p-4 rounded-2xl" style={card}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(0,255,194,0.06)" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: WHITE }}
                itemStyle={{ color: C }}
                labelStyle={{ color: GREY }}
              />
              <Line type="monotone" dataKey="density" stroke={C} strokeWidth={2.5}
                dot={false} isAnimationActive={false}
                style={{ filter: `drop-shadow(0 0 4px ${C})` }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Detection Count */}
        <div className="p-4 rounded-2xl" style={card}>
          <p className="text-[8px] font-mono font-bold tracking-[0.3em] uppercase mb-2" style={{ color: GREY }}>
            DETECTION COUNT
          </p>
          <p className="text-3xl font-mono font-black" style={{ color: WHITE }}>
            {lastDensity}
          </p>
        </div>

        {/* Current Risk */}
        <div className="p-4 rounded-2xl" style={{ ...card, border: `1px solid rgba(255,59,59,0.15)` }}>
          <p className="text-[8px] font-mono font-bold tracking-[0.3em] uppercase mb-2" style={{ color: GREY }}>
            CURRENT RISK
          </p>
          <p className="text-3xl font-mono font-black"
            style={{ color: lastRisk > 70 ? RED : lastRisk > 40 ? AMBER : C, textShadow: `0 0 10px currentColor` }}>
            {lastRisk}%
          </p>
        </div>
      </div>

      {/* ── Risk Distribution Bar Chart ── */}
      <div>
        <p className="text-[8px] font-mono font-bold tracking-[0.35em] uppercase mb-3"
          style={{ color: C }}>
          Risk Factor Distribution
        </p>
        <div className="h-44 w-full p-4 rounded-2xl" style={card}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(0,255,194,0.05)" vertical={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                itemStyle={{ color: AMBER }}
              />
              <Bar dataKey="risk" fill="rgba(0,255,194,0.15)" radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                stroke={C} strokeWidth={0.5}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Note ── */}
      <div className="p-4 rounded-2xl" style={{ ...card, border: '1px solid rgba(255,179,0,0.10)' }}>
        <p className="text-[9px] font-mono leading-relaxed italic" style={{ color: GREY }}>
          Note: Predictive models are currently prioritizing the live video stream telemetry.
          Incident ratio is adjusted based on detected crowd chaos.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
