import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Calendar, CalendarDays, GitBranch,
  RadioTower, AlertTriangle, Map, HardHat, BarChart3, Flame,
  ClipboardCheck, Database, Settings,
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
      { to: '/tasks', label: 'Task Register', icon: ClipboardList },
      { to: '/block-planner', label: 'Block Planner', icon: Map },
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
        style={{ width: 300, background: 'linear-gradient(180deg, #131c2f 0%, #0f172a 100%)', color: '#cbd5e1', borderRight: '1px solid #223049' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #223049', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 16, flexShrink: 0, boxShadow: '0 4px 12px -2px rgba(59,130,246,.5)' }}>A</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: 16, lineHeight: 1.15, letterSpacing: '-0.01em' }}>AI-ABPS</div>
            <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AI Block Planning System</div>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 10px 12px', scrollbarWidth: 'thin' }}>
          {NAV.map(sec => (
            <div className="nav-section" key={sec.group}>
              <div className="nav-section-label">{sec.group}</div>
              {sec.items.map(it => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <it.icon width={17} height={17} />
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid #223049' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(148,163,184,0.08)', borderRadius: 10, border: '1px solid rgba(148,163,184,0.14)' }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 12 }}>{(user?.name || 'DP').slice(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Demo Planner'}</div>
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
  const { theme, toggleTheme, notifications, clearNotifications, datasource, user } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <header className="top-bar sticky top-0 z-30" style={{ height: 62 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%', padding: '0 16px' }}>
        <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setMobileNav(v => !v)} title="Open navigation"><PanelLeft width={18} height={18} /></button>
        <MobileSidebar open={mobileNav} onClose={() => setMobileNav(false)} />
        <div className="top-search">
          <Search width={16} height={16} />
          <input className="field-input" placeholder="Search blocks, tasks, corridors…" />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge info hidden md:inline-flex" style={{ fontSize: 11 }}><Database width={12} height={12} /> {datasource?.label || 'Synthetic Demo Dataset'}</span>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setNotifOpen(v => !v); if (!notifOpen) clearNotifications(); }} title="Notifications">
              <Bell width={18} height={18} />
              {notifications.length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 99, background: 'var(--red)' }} />}
            </button>
            {notifOpen && (
              <div className="notif-pop">
                <div className="notif-head">
                  <span>Notifications</span>
                  {notifications.length > 0 && <span className="badge info">{notifications.length}</span>}
                </div>
                <div className="notif-body">
                  {notifications.length === 0 ? <div className="note" style={{ padding: '10px 0' }}>No new notifications</div> :
                    notifications.map(n => (
                      <div key={n.id} className="notif-item">{n.message}</div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
          </button>
          <div className="realtime-dot" title="Realtime" />
          <span className="badge low hidden lg:inline-flex" style={{ fontSize: 11 }}>REALTIME</span>
          <div className="profile-chip lg:hidden" title={`Signed in as ${user?.name || 'Demo Planner'}`} style={{ marginLeft: 2 }}>
            <span className="profile-chip-avatar">{(user?.name || 'Demo Planner').slice(0, 2).toUpperCase()}</span>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="profile-chip-name">{user?.name || 'Demo Planner'}</span>
              <span className="profile-chip-role">{user?.role || 'Planner'}</span>
            </span>
          </div>
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
          <span>AI-ABPS · AI Block Planning System · Synthetic demo data</span>
          <span>Prototype · Not an operational authority</span>
        </footer>
      </div>
      <FloatingAssistant />
    </div>
  );
}