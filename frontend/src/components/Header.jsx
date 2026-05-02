import React from 'react';
import { Sun, Moon, LogOut, LayoutDashboard, BarChart3, UserCircle, ChevronRight } from 'lucide-react';

export function Header({ user, page, setPage, theme, toggleTheme, navOpen, setNavOpen, logout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ];

  const handleNavClick = (pageId) => {
    setPage(pageId);
    setNavOpen(false);
  };

  return (
    <header className="relative z-50 w-full rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)]/70 p-3 shadow-2xl backdrop-blur-2xl md:p-4 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">

        {/* Brand Section */}
        <div className="flex items-center gap-4 pl-2">
          <div onClick={() => {
            setPage('dashboard');
            setNavOpen(false);
          }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <span className="text-xl font-black">C</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-[var(--text)] leading-none">
              CrediFlow
            </h1>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-blue-500 mt-1">
              Portfolio
            </span>
          </div>
        </div>

        {/* Desktop Navigation & Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <nav className="hidden items-center gap-1 rounded-[1.5rem] bg-[var(--surface-strong)]/50 p-1.5 border border-[var(--border)] md:flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${page === item.id
                      ? 'bg-[var(--surface)] text-blue-500 shadow-md ring-1 ring-black/5'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="mx-2 h-4 w-px bg-[var(--border)]" />
              <button
                onClick={logout}
                className="group flex h-9 w-9 items-center justify-center rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} className="transition-transform group-hover:scale-110" />
              </button>
            </nav>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]/50 text-[var(--text)] shadow-inner transition-all hover:bg-[var(--surface-strong)] active:scale-90"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile / Mobile Toggle */}
          {user && (
            <button
              className="group flex h-11 items-center gap-2 rounded-2xl bg-blue-600 pl-1.5 pr-3 text-white transition-all hover:bg-blue-700 md:hidden"
              onClick={() => setNavOpen(!navOpen)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 font-bold uppercase">
                {user.name?.[0]}
              </div>
              <ChevronRight size={16} className={`transition-transform duration-300 ${navOpen ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Refined) */}
      {user && navOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+16px)] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl animate-in zoom-in-95 slide-in-from-top-4 duration-300 md:hidden">
          <div className="mb-2 flex items-center gap-4 rounded-2xl bg-[var(--surface-strong)] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white text-xl font-bold">
              {user.name?.[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[var(--text)] leading-tight">{user.name}</span>
              <span className="text-xs text-[var(--text-muted)] font-medium">{user.email}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-4 rounded-xl p-4 text-sm font-bold transition-all ${page === item.id
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-strong)]'
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <hr className="my-2 border-[var(--border)]" />
            <button
              onClick={logout}
              className="flex w-full items-center gap-4 rounded-xl p-4 text-sm font-bold text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}