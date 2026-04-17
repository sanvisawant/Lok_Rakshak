import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import useDashboardStore from '../../store/useDashboardStore';

const AnalyticsPanel = () => {
  const { history, metrics } = useDashboardStore();

  // If no history yet, use some placeholders or empty
  const chartData = history.length > 0 ? history : [
    { time: '00:00:00', density: 0, risk: 0 }
  ];

  return (
    <div className="flex flex-col gap-8 drawer-card p-6">
      <div>
        <h3 className="section-heading">Live Crowd Density (Real-time)</h3>
        <div className="h-56 w-full bg-[#0B1E2D]/70 border border-[#1B3F63]/50 rounded-[2rem] p-6 shadow-xl backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B3F63" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="time" 
                hide={true}
              />
              <YAxis hide={true} domain={[0, 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#132F4C', border: '1px solid #1B3F63', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#4FC3F7' }}
              />
              <Line 
                type="monotone" 
                dataKey="density" 
                stroke="#4FC3F7" 
                strokeWidth={3} 
                dot={false}
                isAnimationActive={false} // Faster updates
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0B1E2D]/65 border border-[#1B3F63]/50 p-5 rounded-[2rem] shadow-lg backdrop-blur-sm">
           <div className="text-[10px] text-[#78909C] mb-2 font-bold tracking-widest uppercase">Detection Count</div>
           <div className="text-2xl font-mono font-bold text-[#E3F2FD]">{chartData[chartData.length - 1]?.density || 0}</div>
        </div>
        <div className="bg-[#0B1E2D]/65 border border-[#1B3F63]/50 p-5 rounded-[2rem] shadow-lg backdrop-blur-sm">
           <div className="text-[10px] text-[#78909C] mb-2 font-bold tracking-widest uppercase">Current Risk</div>
           <div className="text-2xl font-mono font-bold text-[#FF1744]">{chartData[chartData.length - 1]?.risk || 0}%</div>
        </div>
      </div>

      <div>
        <h3 className="section-heading">Risk Factor Distribution</h3>
        <div className="h-48 w-full bg-[#0B1E2D]/70 border border-[#1B3F63]/50 rounded-[2rem] p-6 shadow-xl backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar 
                dataKey="risk" 
                fill="#1B3F63" 
                radius={[4, 4, 0, 0]} 
                hover={{ fill: '#FF1744' }}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 bg-[#0B1E2D]/80 border border-[#D32F2F]/20 rounded-[2rem] text-[10px] text-[#94A3B8] italic leading-relaxed shadow-inner">
        Note: Predictive models are currently prioritizing the live video stream telemetry. Incident ratio is adjusted based on detected crowd chaos.
      </div>
    </div>
  );
};

export default AnalyticsPanel;
