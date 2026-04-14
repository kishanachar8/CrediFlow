import React from 'react';

export function Header({ user, page, setPage, navOpen, setNavOpen, logout }) {
  return (
    <header className="app-header">
      <div className="brand-block">
        <span className="eyebrow">Loan performance dashboard</span>
        <h1>CrediFlow</h1>
        <p className="hero-copy">Manage loans, payments, and EMI schedules with confidence.</p>
      </div>
      {user && (
        <>
          <div className="header-actions">
            <nav className="header-nav" aria-label="Primary navigation">
              <button
                className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setPage('dashboard');
                  setNavOpen(false);
                }}
              >
                Dashboard
              </button>
              <button
                className={`nav-item ${page === 'analytics' ? 'active' : ''}`}
                onClick={() => {
                  setPage('analytics');
                  setNavOpen(false);
                }}
              >
                Analytics
              </button>
            </nav>
          </div>

          <button
            className="profile-toggle"
            onClick={() => setNavOpen((prev) => !prev)}
            aria-expanded={navOpen}
            aria-label="Open account menu"
          >
            <span>{user.name?.[0]?.toUpperCase() || 'U'}</span>
          </button>

          <nav className={`nav-menu ${navOpen ? 'open' : ''}`}>
            <div className="nav-profile">
              <span className="nav-profile-name">{user.name}</span>
              <span className="nav-profile-email">{user.email}</span>
            </div>
            <button
              className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setPage('dashboard');
                setNavOpen(false);
              }}
            >
              Dashboard
            </button>
            <button
              className={`nav-item ${page === 'analytics' ? 'active' : ''}`}
              onClick={() => {
                setPage('analytics');
                setNavOpen(false);
              }}
            >
              Analytics
            </button>
            <button
              className={`nav-item ${page === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setPage('profile');
                setNavOpen(false);
              }}
            >
              Profile
            </button>
            <button
              className="nav-item logout-item"
              onClick={() => {
                setNavOpen(false);
                logout();
              }}
            >
              Logout
            </button>
          </nav>
        </>
      )}
    </header>
  );
}
