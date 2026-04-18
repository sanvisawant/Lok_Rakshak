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
  Smartphone,
  AlertOctagon
} from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { SDK_QR_URL } from '../../config';

const Sidebar = () => {
  const { setActiveDrawer } = useDashboardStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'COMMAND',   id: 'main' },
    { icon: BarChart3,       label: 'ANALYTICS', id: 'analytics' },
    { icon: ShieldAlert,     label: 'PROTOCOLS', id: 'ndma' },
    { icon: History,         label: 'EVENTS',    id: 'timeline' },
    { icon: Monitor,         label: 'SIGNAGE',   id: 'signage' },
    { icon: AlertOctagon,    label: 'OVERRIDES', id: 'manual' },
    { icon: Settings,        label: 'CONFIG',    id: 'settings' },
  ];

  return (
    <aside
      className="w-[80px] flex flex-col items-center py-6 gap-8 z-50 flex-shrink-0 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--accent-primary)',
          boxShadow: '0 0 16px rgba(79,195,247,0.2)',
        }}
      >
        <ShieldAlert size={26} style={{ color: 'var(--accent-primary)' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => setActiveDrawer(item.id === 'main' ? null : item.id)}
            className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-panel-light)';
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <item.icon size={22} />
            {/* Tooltip */}
            <span
              className="absolute left-[60px] px-2.5 py-1 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] font-bold tracking-widest"
              style={{
                backgroundColor: 'var(--bg-panel)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-4 mt-auto">
        {/* SDK QR */}
        <div className="relative group flex flex-col items-center mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-0.5 shadow">
            <img src={SDK_QR_URL} alt="SDK App QR" className="w-full h-full object-contain" />
          </div>
          <span className="text-[8px] font-mono mt-1" style={{ color: 'var(--accent-primary)' }}>
            SDK APP
          </span>
          {/* Expanded QR tooltip */}
          <div
            className="absolute left-[60px] bottom-0 p-3 text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] flex flex-col items-center shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-panel)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span className="font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
              <Smartphone size={12} className="inline mr-1 -mt-0.5" />
              SCAN TO OPEN CITIZEN SDK
            </span>
            <div className="w-32 h-32 bg-white p-1 rounded-lg">
              <img src={SDK_QR_URL} alt="SDK App QR Large" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        <button
          className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--status-danger)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
