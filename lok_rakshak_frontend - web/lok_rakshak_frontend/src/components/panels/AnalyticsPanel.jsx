import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AnalyticsPanel = () => {
  const data = [
    { time: '12:00', value: 400 },
    { time: '12:30', value: 700 },
    { time: '13:00', value: 600 },
    { time: '13:30', value: 900 },
    { time: '14:00', value: 1200 },
    { time: '14:30', value: 1500 },
  ];

  return (
    <div className="flex flex-col gap-8 drawer-card p-6">
      <div>
        <h3 className="section-heading">Crowd Density (6H Trend)</h3>
        <div className="h-56 w-full bg-[#0B1E2D]/70 border border-[#1B3F63]/50 rounded-[2rem] p-6 shadow-xl backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="value" stroke="#4FC3F7" strokeWidth={3} dot={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#132F4C', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#4FC3F7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0B1E2D]/65 border border-[#1B3F63]/50 p-5 rounded-[2rem] shadow-lg backdrop-blur-sm">
           <div className="text-[10px] text-[#78909C] mb-2 font-bold tracking-widest">PREDICTION_ACCURACY</div>
           <div className="text-2xl font-mono font-bold text-[#4FC3F7]">94.2%</div>
        </div>
        <div className="bg-[#0B1E2D]/65 border border-[#1B3F63]/50 p-5 rounded-[2rem] shadow-lg backdrop-blur-sm">
           <div className="text-[10px] text-[#78909C] mb-2 font-bold tracking-widest">ANOMALY_CONFIDENCE</div>
           <div className="text-2xl font-mono font-bold text-[#F9A825]">12.8%</div>
        </div>
      </div>

      <div>
        <h3 className="section-heading">Sector Allocation</h3>
        <div className="h-48 w-full bg-[#0B1E2D]/70 border border-[#1B3F63]/50 rounded-[2rem] p-6 shadow-xl backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="value" fill="#1B3F63" radius={[4, 4, 0, 0]} hover={{ fill: '#4FC3F7' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 bg-[#0B1E2D]/80 border border-[#D32F2F]/20 rounded-[2rem] text-[10px] text-[#94A3B8] italic leading-relaxed shadow-inner">
        Note: Predictive models are currently prioritizing Sector-7 due to the sudden influx detected at 14:12 UTC. Accuracy reflects last 30 minutes of telemetry.
      </div>
    </div>
  );
};

export default AnalyticsPanel;
