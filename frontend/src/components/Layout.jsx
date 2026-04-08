import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Calendar, Music, BookTemplate, CalendarDays, FolderOpen } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Dashboard', end: true },
  { to: '/planner', icon: Calendar, label: 'Mass Planner' },
  { to: '/library', icon: Music, label: 'Song Library' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/files', icon: FolderOpen, label: 'File Manager' },
];

const PAGE_LABELS = {
  '/': 'Dashboard',
  '/planner': 'Mass Planner',
  '/library': 'Song Library',
  '/templates': 'Templates',
  '/calendar': 'Calendar',
  '/files': 'File Manager',
};

const Layout = () => {
  const location = useLocation();
  const currentPage = PAGE_LABELS[location.pathname] ?? 'Dashboard';
  const now = new Date();
  const formatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Music size={20} color="white" />
            </div>
            <div>
              <span className="sidebar-brand-name">Gethsemane Choir</span>
              <span className="sidebar-brand-sub">Music Manager System</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Navigation</span>
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <Icon size={18} className="nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            Church Music Manager System v1.0<br />
            © 2026 Gethsemane Choir
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="main-content w-full">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-breadcrumb">
            <span>Home</span>
            <span className="sep">/</span>
            <span className="current">{currentPage}</span>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatted}</span>
            <div className="avatar">CM</div>
          </div>
        </div>

        <div className="page-wrapper animate-fade-in">
          <div className="page-body">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
