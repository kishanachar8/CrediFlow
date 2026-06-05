import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from './ui/button.jsx';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export function AuthView({ mode, setMode, form, handleInput, submitAuth, onGoogleSuccess, onGoogleError, googleEnabled }) {
  const isLogin = mode === 'login';

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px]">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-[0_8px_30px_rgba(99,102,241,0.45)] mb-4">
            C
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {isLogin ? 'Welcome back' : 'Get started'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            {isLogin ? 'Sign in to your CrediFlow account' : 'Create your account — it\'s free'}
          </p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] p-8">

          {/* Email/password form */}
          <form onSubmit={submitAuth} className="space-y-4">
            {!isLogin && (
              <AuthInput label="Full Name" id="name" icon={<User size={15} />} placeholder="Jane Doe" value={form.name} onChange={handleInput} />
            )}
            <AuthInput label="Email" id="email" type="email" icon={<Mail size={15} />} placeholder="you@example.com" value={form.email} onChange={handleInput} />
            <AuthInput label="Password" id="password" type="password" icon={<Lock size={15} />} placeholder="••••••••" value={form.password} onChange={handleInput} />

            <Button type="submit" className="w-full py-3 font-bold text-sm mt-2">
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={15} className="ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Google */}
          {googleEnabled ? (
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              render={(rp) => (
                <GoogleButton onClick={rp.onClick} disabled={rp.disabled} />
              )}
            />
          ) : (
            <GoogleButton disabled />
          )}

          {/* Toggle mode */}
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(isLogin ? 'register' : 'login')}
              className="font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Trust badge */}
        <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] opacity-40 mt-6">
          256-bit encrypted · Private by default
        </p>
      </div>
    </div>
  );
}

function AuthInput({ label, id, icon, ...props }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[var(--text-secondary)] pl-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-indigo-500">
          {icon}
        </div>
        <input
          id={id}
          name={id}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          required
          {...props}
        />
      </div>
    </div>
  );
}

function GoogleButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:shadow-[var(--shadow)] transition-all disabled:opacity-40 disabled:pointer-events-none"
    >
      {/* Google "G" SVG icon */}
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
        <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}
