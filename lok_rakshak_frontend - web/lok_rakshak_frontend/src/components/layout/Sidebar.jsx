import React from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  Activity, 
  History, 
  Monitor,
  LayoutDashboard,
  LogOut,
  Smartphone
} from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { SDK_QR_URL } from '../../config';

const Sidebar = () => {
  const { setActiveDrawer } = useDashboardStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'COMMAND', id: 'main' },
    { icon: BarChart3, label: 'ANALYTICS', id: 'analytics' },
    { icon: ShieldAlert, label: 'PROTOCOLS', id: 'ndma' },
    { icon: History, label: 'EVENTS', id: 'timeline' },
    { icon: Monitor, label: 'SIGNAGE', id: 'signage' },
    { icon: Settings, label: 'CONFIG', id: 'settings' },
  ];

  return (
    <aside className="w-[80px] bg-[#071622] border-r border-[#1B3F63] flex flex-col items-center py-6 gap-8 z-50">
      <div className="w-12 h-12 bg-[#132F4C] border border-[#4FC3F7] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,195,247,0.2)] mb-4">
        <ShieldAlert size={28} className="text-[#4FC3F7]" />
      </div>

      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveDrawer(item.id === 'main' ? null : item.id)}
            className="group relative w-12 h-12 flex items-center justify-center rounded-lg transition-all hover:bg-[#132F4C] text-[#78909C] hover:text-[#4FC3F7]"
          >
            <item.icon size={22} />
            <span className="absolute left-16 px-2 py-1 bg-[#132F4C] text-[#E3F2FD] text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#1B3F63] z-[100]">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-4 mt-auto">
        {/* SDK App QR Code */}
        <div className="relative group flex flex-col items-center mb-2">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-0.5 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <img src={SDK_QR_URL} alt="SDK App QR" className="w-full h-full object-contain" />
          </div>
          <span className="text-[8px] font-mono mt-1 text-[#4FC3F7]">SDK APP</span>
          
          <div className="absolute left-16 bottom-0 p-2 bg-[#132F4C] text-[#E3F2FD] text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#1B3F63] z-[100] flex flex-col items-center shadow-2xl">
             <span className="font-bold mb-1 text-[#4FC3F7]"><Smartphone size={12} className="inline mr-1 -mt-0.5" />SCAN TO OPEN CITIZEN SDK</span>
             <div className="w-32 h-32 bg-white p-1 rounded">
               <img src={SDK_QR_URL} alt="SDK App QR Large" className="w-full h-full object-contain" />
             </div>
          </div>
        </div>

        <button className="w-12 h-12 flex items-center justify-center rounded-lg text-[#78909C] hover:text-[#FF1744] transition-colors">
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
