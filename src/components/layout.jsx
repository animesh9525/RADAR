import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Calendar, CalendarDays, GitBranch, Brain,
  RadioTower, AlertTriangle, Map, HardHat, BarChart3, Flame, Boxes,
  ChartNoAxesGantt, Kanban, ClipboardCheck, Sparkles, Database, Settings,
  Moon, Sun, Bell, LogOut, Search, PanelLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FloatingAssistant } from './FloatingAssistant';

const NAV = [
  {
    group: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Planning',
    items: [
      { to: '/tasks', label: 'Block Planner', icon: ClipboardList },
      { to: '/schedule', label: 'Weekly Planner', icon: Calendar },
      { to: '/monthly', label: 'Monthly Planner', icon: CalendarDays },
    ],
  },
  {
    group: 'Operations',
    items: [
      { to: '/network', label: 'Network Operations', icon: RadioTower },
      { to: '/conflicts', label: 'Conflict Center', icon: AlertTriangle },
      { to: '/what-if', label: 'What-If Simulator', icon: GitBranch },
      { to: '/resources', label: 'Resources & Crews', icon: HardHat },
    ],
  },
  {
    group: 'Analysis',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/heatmap', label: 'Traffic Heatmap', icon: Flame },
    ],
  },
  {
    group: 'Governance',
    items: [
      { to: '/approval', label: 'Approval & Audit', icon: ClipboardCheck },
    ],
  },
  {
    group: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useApp();
  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 40, display: 'block' }} />
      )}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-transform lg:translate-x-0`}
        style={{ width: 300, background: 'var(--navy)', color: '#cbd5e1', borderRight: '1px solid var(--navy3)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--navy3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 15, flexShrink: 0 }}>A</div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 17, lineHeight: 1.1 }}>AI-ABPS</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>AI Block Planning System</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', scrollbarWidth: 'thin' }}>
          {NAV.map(sec => (
            <div key={sec.group} style={{ marginBottom: 6 }}>
              <div style={{ padding: '10px 10px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{sec.group}</div>
              {sec.items.map(it => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) => (isActive ? 'sidebar-active' : '')}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                    color: isActive ? '#fff' : '#94a3b8',
                    background: isActive ? 'linear-gradient(135deg,var(--blue),var(--purple))' : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(59,130,246,.35)' : 'none',
                    marginBottom: 2,
                  })}
                >
                  <it.icon width={17} height={17} />
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid var(--navy3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--navy2)', borderRadius: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 12 }}>{(user?.name || 'DP').slice(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{user?.name || 'Demo Planner'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{user?.role || 'Planner'}</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ color: '#94a3b8' }} onClick={logout} title="Sign out"><LogOut width={15} height={15} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Topbar() {
  const { theme, toggleTheme, notifications, clearNotifications, datasource } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <header className="sticky top-0 z-30" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', height: 62 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%', padding: '0 16px' }}>
        <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setMobileNav(v => !v)}><PanelLeft width={18} height={18} /></button>
        <MobileSidebar open={mobileNav} onClose={() => setMobileNav(false)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <Search width={16} height={16} style={{ color: 'var(--muted)', position: 'absolute', left: 10 }} />
          <input className="field-input" placeholder="Search blocks, tasks, corridors…" style={{ width: 300, maxWidth: '100%', paddingLeft: 32 }} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge info" style={{ fontSize: 11, display: 'none', sm: 'inline-flex' }}><Database width={12} height={12} /> {datasource?.label || 'Synthetic Demo Dataset'}</span>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setNotifOpen(v => !v); if (!notifOpen) clearNotifications(); }} title="Notifications">
              <Bell width={18} height={18} />
              {notifications.length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 99, background: 'var(--red)' }} />}
            </button>
            {notifOpen && (
              <div style={{ position: 'absolute', right: 0, top: 40, width: 300, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-xl)', padding: 12, zIndex: 200 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Notifications</div>
                {notifications.length === 0 ? <div className="note">No new notifications</div> :
                  notifications.map(n => (
                    <div key={n.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>{n.message}</div>
                  ))}
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
          </button>
          <div className="realtime-dot" title="Realtime" />
          <span className="badge low" style={{ display: 'none', sm: 'inline-flex' }}>REALTIME</span>
        </div>
      </div>
    </header>
  );
}

function MobileSidebar({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 60 }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 70 }}>
        <Sidebar open onClose={onClose} />
      </div>
    </>
  );
}

export function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar open={false} onClose={() => {}} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main className="flex-1" style={{ padding: 20 }}>
          <Outlet />
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', padding: '10px 20px', fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', gap: 8, background: 'var(--surface)' }}>
          <span>AI-ABPS · Prototype AI Block Planning System · Synthetic Demo Data</span>
          <span>React + Tailwind port · legacy preserved</span>
        </footer>
      </div>
      <FloatingAssistant />
    </div>
  );
}