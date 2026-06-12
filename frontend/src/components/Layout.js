import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '✦', label: 'Dashboard' },
  { path: '/clients', icon: '♃', label: 'Clients' },
  { path: '/consultations', icon: '☽', label: 'Consultations' },
  { path: '/followups', icon: '◎', label: 'Follow-ups' },
];

const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>☽ AstroSync</h1>
          <p>Astrologer CRM</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">Astrologer</div>
          </div>
          <button className="btn-icon" onClick={handleLogout} title="Logout">⎋</button>
        </div>
      </aside>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
