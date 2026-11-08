import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Building2, Shield, User, HardHat, BarChart3, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchDemoAccount } = useAuth();
  const location = useLocation();

  const getRoleClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'DEPARTMENT_OFFICER': return 'role-dept';
      default: return 'role-citizen';
    }
  };

  return (
    <>
      {/* Interactive Quick Role Switcher for Demo / Interviews */}
      <div className="demo-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>⚡ DevOps Demo Switcher:</span>
          <span>Click to instantly test workflows across personas:</span>
        </div>
        <div className="demo-buttons">
          <button
            className={`demo-btn ${user?.role === 'CITIZEN' ? 'active' : ''}`}
            onClick={() => switchDemoAccount('CITIZEN')}
          >
            Citizen
          </button>
          <button
            className={`demo-btn ${user?.role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => switchDemoAccount('ADMIN')}
          >
            Admin
          </button>
          <button
            className={`demo-btn ${user?.role === 'DEPARTMENT_OFFICER' ? 'active' : ''}`}
            onClick={() => switchDemoAccount('DEPARTMENT')}
          >
            Roads Dept
          </button>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="nav-brand">
            <Building2 size={24} color="#2563eb" />
            <span>SmartCity<span style={{ color: '#2563eb' }}>Ops</span></span>
            <span className="brand-badge">DevOps Production</span>
          </Link>

          {user && (
            <div className="nav-links">
              {user.role === 'CITIZEN' && (
                <Link
                  to="/citizen"
                  className={`nav-item ${location.pathname === '/citizen' ? 'active' : ''}`}
                >
                  <User size={18} />
                  <span>Citizen Portal</span>
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  <Shield size={18} />
                  <span>Admin Console</span>
                </Link>
              )}

              {user.role === 'DEPARTMENT_OFFICER' && (
                <Link
                  to="/department"
                  className={`nav-item ${location.pathname === '/department' ? 'active' : ''}`}
                >
                  <HardHat size={18} />
                  <span>Department Ops</span>
                </Link>
              )}

              <Link
                to="/analytics"
                className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}
              >
                <BarChart3 size={18} />
                <span>Infra Metrics</span>
              </Link>
            </div>
          )}

          <div className="user-controls">
            {user ? (
              <>
                <div className="user-pill">
                  <span>{user.full_name}</span>
                  <span className={`role-tag ${getRoleClass(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem' }} title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
