import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Calendar, CalendarDays, GitBranch,
  RadioTower, AlertTriangle, Map, HardHat, BarChart3, Flame,
  ClipboardCheck, Database, Settings,
  Moon, Sun, Bell, LogOut, PanelLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FloatingAssistant } from './FloatingAssistant';
import { GlobalSearch } from './GlobalSearch';
import { UserIdentity } from './UserIdentity';
import radarLogo from '../assets/radar-logo.png';

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
  const { logout } = useApp();
  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 40, display: 'block' }} />
      )}
      <aside
        className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative inset-y-0 lg:inset-y-auto left-0 z-50 flex h-[100dvh] lg:h-auto flex-col overflow-hidden transition-transform lg:translate-x-0`}
        style={{ width: 300, flexShrink: 0, background: 'linear-gradient(180deg, #131c2f 0%, #0f172a 100%)', color: '#cbd5e1', borderRight: '1px solid #223049' }}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #223049', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 16, flexShrink: 0, boxShadow: '0 4px 12px -2px rgba(59,130,246,.5)' }}>
            <img src={radarLogo} alt="RADAR" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10, display: 'block' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: 16, lineHeight: 1.15, letterSpacing: '-0.01em' }}>RADAR</div>
            <div style={{ fontSize: 11, lineHeight: 1.25, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Railway Automated Detection &amp; Analytics Resource</div>
          </div>
        </div>
        <nav className="sidebar-nav">
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
        <div style={{ padding: 12, borderTop: '1px solid #223049', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(148,163,184,0.08)', borderRadius: 10, border: '1px solid rgba(148,163,184,0.14)' }}>
            <UserIdentity variant="sidebar" />
            <button className="btn btn-ghost btn-sm" style={{ color: '#94a3b8', flexShrink: 0 }} onClick={logout} title="Sign out"><LogOut width={15} height={15} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ onToggleMobileNav }) {
  const { theme, toggleTheme, notifications, clearNotifications, datasource } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <header className="top-bar" style={{ height: 62, flex: '0 0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%', padding: '0 16px' }}>
        <button className="btn btn-ghost btn-sm lg:hidden" onClick={onToggleMobileNav} title="Open navigation"><PanelLeft width={18} height={18} /></button>
        <GlobalSearch />
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
          <span className="lg:hidden" style={{ marginLeft: 2, display: 'inline-flex' }}>
            <UserIdentity variant="chip" />
          </span>
        </div>
      </div>
    </header>
  );
}

function MobileSidebar({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      {/* No separate scrim here: <Sidebar open> already renders a single
          full-viewport dim overlay wired to onClose. Two stacked overlays
          would dim the page twice. */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 70 }}>
        <Sidebar open onClose={onClose} />
      </div>
    </>
  );
}

export function AppLayout() {
  // The mobile drawer is rendered at shell level, NOT inside the topbar: the
  // topbar sets `backdrop-filter`, which makes it the containing block for
  // `position: fixed` descendants. Nesting the drawer there clamped its scrim
  // to the 61px header, so the dim overlay never covered the page and
  // click-outside-to-close could not fire.
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={false} onClose={() => {}} />
      <div className="app-column">
        <Topbar onToggleMobileNav={() => setMobileNav(v => !v)} />
        <main className="app-main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>RADAR · Railway Automated Detection &amp; Analytics Resource · Synthetic demo data</span>
          <span>Prototype · Not an operational authority</span>
        </footer>
      </div>
      <FloatingAssistant />
      <MobileSidebar open={mobileNav} onClose={() => setMobileNav(false)} />
    </div>
  );
}