import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from './ui/button.jsx';
import { Card } from './ui/card'; // Using the Card we refactored earlier
import { Mail, Lock, User, ArrowRight, Globe } from 'lucide-react';

export function AuthView({ mode, setMode, form, handleInput, submitAuth, onGoogleSuccess, onGoogleError, googleEnabled }) {
  const isLogin = mode === 'login';

  return (
    <div className="mx-auto w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <Card className="p-8 shadow-2xl shadow-blue-500/5 border-blue-500/10">
        
        {/* Header Section */}
        <div className="mb-8 space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/5">
            <Lock size={28} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
            Secure Gateway
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text)]">
            {isLogin ? 'Welcome back' : 'Get started'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] px-4">
            {isLogin 
              ? 'Enter your credentials to manage your loan portfolio.' 
              : 'Join CrediFlow to track and optimize your repayments.'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={submitAuth} className="space-y-5">
          {!isLogin && (
            <InputField
              label="Full Name"
              id="name"
              icon={<User size={18} />}
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleInput}
            />
          )}

          <InputField
            label="Email Address"
            id="email"
            type="email"
            icon={<Mail size={18} />}
            placeholder="name@company.com"
            value={form.email}
            onChange={handleInput}
          />

          <InputField
            label="Password"
            id="password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="••••••••"
            value={form.password}
            onChange={handleInput}
            rightElement={isLogin && (
              <button type="button" className="text-[10px] font-bold text-blue-500 hover:underline">
                Forgot?
              </button>
            )}
          />

          <Button 
            type="submit" 
            className="group w-full py-6 text-lg"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
          </Button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          <div className="h-px flex-1 bg-[var(--border)] opacity-50" />
          <span className="shrink-0">Or continue with</span>
          <div className="h-px flex-1 bg-[var(--border)] opacity-50" />
        </div>

        {/* Social Auth */}
        <div className="w-full">
          {googleEnabled ? (
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              render={(renderProps) => (
                <Button 
                  type="button"
                  variant="secondary" 
                  className="w-full gap-3 py-4 font-medium"
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  <Globe size={18} className="text-blue-500" />
                  Google Account
                </Button>
              )}
            />
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-3 py-4 font-medium"
              disabled
            >
              <Globe size={18} className="text-blue-500" />
              Google login unavailable
            </Button>
          )}
        </div>

        {/* Toggle link */}
        <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
          {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
          <button
            type="button"
            className="font-bold text-blue-500 hover:text-blue-600 transition-colors"
            onClick={() => setMode(isLogin ? 'register' : 'login')}
          >
            {isLogin ? 'Sign up for free' : 'Log in here'}
          </button>
        </p>
      </Card>

      {/* Trust Badges */}
      <div className="mt-8 flex items-center justify-center gap-8 opacity-30 grayscale contrast-125">
        <span className="text-[9px] font-black tracking-tighter">256-BIT ENCRYPTION</span>
        <div className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
        <span className="text-[9px] font-black tracking-tighter">PCI-DSS COMPLIANT</span>
      </div>
    </div>
  );
}

/**
 * Internal Input Component to keep things DRY
 */
function InputField({ label, id, icon, rightElement, ...props }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <label htmlFor={id} className="text-xs font-semibold text-[var(--text)]">
          {label}
        </label>
        {rightElement}
      </div>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-blue-500">
          {icon}
        </div>
        <input
          id={id}
          name={id}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-[var(--text-muted)]/50"
          required
          {...props}
        />
      </div>
    </div>
  );
}