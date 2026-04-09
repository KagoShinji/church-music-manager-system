import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Music, BookTemplate, CalendarDays, FolderOpen, ExternalLink, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', end: true },
  { to: '/planner', icon: Calendar, label: 'Mass Planner' },
  { to: '/library', icon: Music, label: 'Song Library' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/files', icon: FolderOpen, label: 'File Manager' },
];

const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/planner': 'Mass Planner',
  '/library': 'Song Library',
  '/templates': 'Templates',
  '/calendar': 'Calendar',
  '/files': 'File Manager',
};

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const currentPage = PAGE_LABELS[location.pathname] ?? 'Dashboard';
  const now = new Date();
  const formatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Music size={20} color="white" />
            </div>
            <div>
              <span className="sidebar-brand-name">Gethsemane Choir</span>
              <span className="sidebar-brand-sub">Music Manager System</span>
            </div>
          </div>
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} color="rgba(255,255,255,0.7)" />
          </button>
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
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              transition: 'color 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            <ExternalLink size={12} />
            View Choir Homepage
          </NavLink>
        </div>
      </aside>

      {/* Main area */}
      <main className="main-content w-full">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="topbar-breadcrumb">
              <span>Home</span>
              <span className="sep">/</span>
              <span className="current">{currentPage}</span>
            </div>
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
