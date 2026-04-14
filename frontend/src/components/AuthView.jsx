import React from 'react';

export function AuthView({ mode, setMode, form, handleInput, submitAuth }) {
  return (
    <section className="card auth-card">
      <div className="card-header">
        <div>
          <span className="eyebrow">Secure access</span>
          <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <p className="section-copy">Access your loan portfolio and track EMI progress from one central workspace.</p>
        </div>
      </div>

      <form onSubmit={submitAuth} className="auth-form">
        {mode === 'register' && (
          <label className="field-label">
            Full name
            <input name="name" value={form.name} onChange={handleInput} placeholder="Jane Doe" required />
          </label>
        )}
        <label className="field-label">
          Email address
          <input name="email" type="email" value={form.email} onChange={handleInput} placeholder="hello@example.com" required />
        </label>
        <label className="field-label">
          Password
          <input name="password" type="password" value={form.password} onChange={handleInput} placeholder="••••••••" required />
        </label>
        <button className="primary-button" type="submit">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="card-footer">
        <p>{mode === 'login' ? 'New to CrediFlow?' : 'Already have an account?'}</p>
        <button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'Sign in instead'}
        </button>
      </div>
    </section>
  );
}
