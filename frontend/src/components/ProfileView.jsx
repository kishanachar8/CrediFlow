import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { User, Mail, ShieldCheck, Award, Clock, LogOut, Edit2, X, KeyRound } from 'lucide-react';

export function ProfileView({ user, loanStats, logout, onProfileUpdate, onPasswordChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [feedback, setFeedback] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  useEffect(() => { setProfileForm({ name: user?.name || '', email: user?.email || '' }); }, [user]);

  const onPF = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const onPW = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault(); setFeedback(null);
    try { await onProfileUpdate(profileForm); setFeedback({ ok: true, msg: 'Profile updated.' }); setIsEditing(false); }
    catch (err) { setFeedback({ ok: false, msg: err.message || 'Update failed.' }); }
  };

  const savePassword = async (e) => {
    e.preventDefault(); setPasswordFeedback(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ ok: false, msg: 'Passwords do not match.' }); return;
    }
    try {
      await onPasswordChange({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      setPasswordFeedback({ ok: true, msg: 'Password changed.' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPasswordFeedback({ ok: false, msg: err.message || 'Failed.' }); }
  };

  const initials = (user?.name || 'U').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const isGoogle = user?.provider === 'google';
  const stats = { completedLoans: 0, activeLoans: 0, totalLoans: 0, ...(loanStats || {}) };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="pt-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1.5">Account</p>
        <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Profile</h1>
      </div>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 shadow-[0_12px_40px_rgba(99,102,241,0.4)]">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-inner shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-2">
              <ShieldCheck size={11} className="text-emerald-300" /> Verified Member
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{user?.name}</h2>
            <p className="text-sm text-blue-100/70 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail size={12} /> {user?.email}
            </p>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <StatBubble label="Active" value={stats.activeLoans} />
            <StatBubble label="Done" value={stats.completedLoans} green />
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">

        {/* Identity */}
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <User size={15} className="text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Identity</h3>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] hover:text-indigo-400 transition-colors">
                <Edit2 size={12} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={saveProfile} className="space-y-4">
              <PInput label="Name" name="name" value={profileForm.name} onChange={onPF} />
              <PInput label="Email" name="email" type="email" value={profileForm.email} onChange={onPF} />
              {feedback && <p className={`text-xs font-semibold ${feedback.ok ? 'text-emerald-500' : 'text-rose-500'}`}>{feedback.msg}</p>}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 py-2.5 text-sm">Save</Button>
                <button type="button" onClick={() => { setIsEditing(false); setFeedback(null); }}
                  className="w-10 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors">
                  <X size={14} />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <DRow label="Name" value={user?.name} />
              <DRow label="Email" value={user?.email} />
              <DRow label="Provider" value={isGoogle ? 'Google OAuth' : 'Email & Password'} />
            </div>
          )}
        </Card>

        {/* Activity */}
        <Card className="xl:col-span-3 p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border)]">
            <Award size={15} className="text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Activity</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total', value: stats.totalLoans, color: '' },
              { label: 'Active', value: stats.activeLoans, color: 'text-blue-500' },
              { label: 'Settled', value: stats.completedLoans, color: 'text-emerald-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)] text-center">
                <p className={`text-2xl font-black ${color || 'text-[var(--text-primary)]'}`}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/6 border border-indigo-500/12">
            <p className="text-sm text-indigo-600 font-semibold leading-relaxed">
              {stats.totalLoans === 0
                ? 'No loans yet. Add your first loan on the dashboard.'
                : `${stats.activeLoans} active loan${stats.activeLoans !== 1 ? 's' : ''}, ${stats.completedLoans} settled. Keep it up!`}
            </p>
          </div>

          <button onClick={logout} className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </Card>

        {/* Security */}
        <Card className="xl:col-span-5 p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border)]">
            <ShieldCheck size={15} className="text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Security</h3>
          </div>

          {isGoogle && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] mb-5 text-sm text-[var(--text-muted)]">
              <KeyRound size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>Signed in with Google. Set a password to also enable email/password login.</span>
            </div>
          )}

          <form onSubmit={savePassword} className="grid sm:grid-cols-3 gap-4">
            {!isGoogle && <PInput label="Current Password" name="oldPassword" type="password" value={passwordForm.oldPassword} onChange={onPW} placeholder="••••••••" />}
            <PInput label="New Password" name="newPassword" type="password" value={passwordForm.newPassword} onChange={onPW} placeholder="Min. 8 chars" />
            <PInput label="Confirm Password" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={onPW} placeholder="Repeat" />
            <div className="sm:col-span-3 flex flex-wrap items-center gap-4">
              <Button type="submit" className="py-2.5 px-6 text-sm">Update Password</Button>
              {passwordFeedback && (
                <p className={`text-sm font-semibold ${passwordFeedback.ok ? 'text-emerald-500' : 'text-rose-500'}`}>{passwordFeedback.msg}</p>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function StatBubble({ label, value, green }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2.5 rounded-xl border ${green ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-white/15 border-white/20'}`}>
      <span className="text-xl font-black text-white">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</span>
    </div>
  );
}

function DRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function PInput({ label, name, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--text-secondary)] pl-1">{label}</label>
      <input
        name={name}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/12 transition-all"
        {...props}
      />
    </div>
  );
}
