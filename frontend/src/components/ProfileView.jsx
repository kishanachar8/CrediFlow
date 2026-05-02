import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Award, 
  Briefcase, 
  ChevronRight, 
  Clock, 
  Settings,
  LogOut
} from 'lucide-react';

export function ProfileView({ user, loanStats, logout }) {
  // Extract initials and first name for a personal touch
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const firstName = user.name?.split(' ')[0];

  return (
    <main className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Profile Hero Card */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar with Ring Effect */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-[2rem] bg-white/20 blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/10 text-4xl font-black backdrop-blur-xl border border-white/30 shadow-2xl">
              {initials}
            </div>
          </div>

          <div className="text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Verified Member</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Hi, {firstName}!</h2>
            <p className="text-blue-100/70 flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
              <Mail size={16} className="opacity-60" /> {user.email}
            </p>
          </div>
        </div>

        {/* Abstract Background Flourish */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </section>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Identity Details - Spans 2 cols */}
        <Card className="md:col-span-2 p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
            <div className="flex items-center gap-3">
               <User size={20} className="text-blue-500" />
               <h3 className="font-black text-[var(--text)] text-lg tracking-tight uppercase opacity-50">Identity</h3>
            </div>
            <Settings size={18} className="text-[var(--text-muted)] cursor-pointer hover:rotate-90 transition-transform duration-500" />
          </div>
          
          <div className="space-y-6">
            <DetailRow label="Display Name" value={user.name} />
            <DetailRow label="Primary Email" value={user.email} />
            <DetailRow label="Membership" value="CrediFlow Pro" />
          </div>
          
          <Button variant="secondary" className="w-full gap-2 py-4">
            Edit Profile <ChevronRight size={16} />
          </Button>
        </Card>

        {/* Activity & Stats - Spans 3 cols */}
        <Card className="md:col-span-3 p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-5">
            <Briefcase size={20} className="text-blue-500" />
            <h3 className="font-black text-[var(--text)] text-lg tracking-tight uppercase opacity-50">Account Activity</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatBox 
              icon={<Award size={24} className="text-amber-500" />}
              label="Settled" 
              value={loanStats.completedLoans} 
              color="amber"
            />
            <StatBox 
              icon={<Clock size={24} className="text-blue-500" />}
              label="Active" 
              value={loanStats.activeLoans} 
              color="blue"
            />
          </div>

          <div className="relative overflow-hidden p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <p className="relative z-10 text-sm font-semibold text-blue-600 leading-relaxed">
              Success Rate: <span className="text-blue-700 font-black">100%</span>
              <br />
              <span className="font-medium opacity-80 text-xs">
                You have successfully managed {loanStats.totalLoans} credit lines with zero defaults. Keep it up!
              </span>
            </p>
            <TrendingUpIcon className="absolute -right-4 -bottom-4 text-blue-500/10 w-24 h-24" />
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
          >
            <LogOut size={16} /> Sign out of all sessions
          </button>
        </Card>
      </div>
    </main>
  );
}

/** * Internal Helpers */

function DetailRow({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{label}</span>
      <p className="text-base font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <div className="group p-6 rounded-[2rem] bg-[var(--surface-strong)]/30 border border-[var(--border)] flex flex-col items-center text-center transition-all hover:bg-[var(--surface-strong)]/50">
      <div className={`mb-3 p-3 rounded-2xl bg-${color}-500/10 transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{label}</span>
      <span className="text-3xl font-black text-[var(--text)] tracking-tighter">{value}</span>
    </div>
  );
}

// Simple illustrative icon for the success box
function TrendingUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}