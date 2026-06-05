import React from 'react';
import { Sun, Moon, LogOut, LayoutDashboard, BarChart3, UserCircle, Menu, X } from 'lucide-react';

export function Header({ user, page, setPage, theme, toggleTheme, navOpen, setNavOpen, logout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={15} /> },
    { id: 'profile',   label: 'Profile',   icon: <UserCircle size={15} /> },
  ];

  const handleNavClick = (id) => { setPage(id); setNavOpen(false); };

  return (
    <header className="relative z-50">
      {/* ── Main Bar (glassmorphism) ── */}
      <div className="glass flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border border-[var(--border)] shadow-[var(--shadow-lg)]">

        {/* Brand */}
        <button onClick={() => handleNavClick('dashboard')} className="flex items-center gap-3 shrink-0 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.5)] group-hover:shadow-[0_6px_22px_rgba(99,102,241,0.65)] transition-shadow duration-300">
            <span className="text-base font-black">C</span>
          </div>
          <div className="hidden sm:block leading-none">
            <span className="block text-[15px] font-black tracking-tight text-[var(--text-primary)]">CrediFlow</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-indigo-400 mt-0.5">Portfolio</span>
          </div>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-1.5">

          {/* Desktop nav pill */}
          {user && (
            <nav className="hidden md:flex items-center gap-0.5 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all duration-200 ${
                    page === item.id
                      ? 'bg-[var(--surface)] text-indigo-500 shadow-[var(--shadow)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all duration-200"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Logout (desktop) */}
          {user && (
            <button
              onClick={logout}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-400/30 hover:bg-rose-500/5 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}

          {/* Mobile hamburger */}
          {user && (
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {navOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {user && navOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] glass rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] overflow-hidden md:hidden">
          {/* User chip */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  page === item.id
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <div className="pt-1 border-t border-[var(--border)] mt-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/8 transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
