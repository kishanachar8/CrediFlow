import React from 'react';
import { Card } from './ui/card';
import { TrendingUp, Target, CheckCircle2, Clock, Layers } from 'lucide-react';

export function AnalyticsView({ analytics, loanStats, formatCurrency }) {
  const { paidPercent, totalPaid, totalRemaining, debtFreeDate } = analytics;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">

      {/* Page Header */}
      <div className="pt-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1.5">Portfolio Insights</p>
        <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Analytics</h1>
      </div>

      {/* ── Top Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Donut card */}
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-0.5">Portfolio Analysis</p>
          <h2 className="text-xl font-black text-[var(--text-primary)] mb-6">Paid vs Remaining</h2>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <DonutChart percentage={paidPercent} />

            <div className="w-full space-y-4">
              <LegendBar label="Paid" value={formatCurrency(totalPaid)} color="blue" percent={paidPercent} />
              <LegendBar label="Remaining" value={formatCurrency(totalRemaining)} color="muted" percent={100 - paidPercent} />
              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Total Debt</span>
                  <span className="font-black text-sm text-[var(--text-primary)]">
                    {formatCurrency(totalPaid + totalRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Debt-free card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 shadow-[0_12px_40px_rgba(139,92,246,0.35)] flex flex-col">
          <div className="relative z-10 flex-1 flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-200/70 mb-0.5">Projection</p>
            <h2 className="text-xl font-black text-white mb-6">Debt-Free Date</h2>

            <div className="flex items-center gap-3 mb-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <Target size={22} className="text-white" />
              </div>
              <p className="text-3xl font-black text-white tracking-tight leading-tight">{debtFreeDate}</p>
            </div>

            <p className="text-sm text-indigo-200/70 font-medium">
              Based on {loanStats.activeLoans} active {loanStats.activeLoans === 1 ? 'loan' : 'loans'} on current schedules.
            </p>

            {/* Mini progress */}
            <div className="mt-5 h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
              <div
                className="progress-shimmer h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-indigo-200/50 mt-2 font-bold">{paidPercent}% cleared</p>
          </div>

          {/* Decorative */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-10 w-36 h-36 rounded-full bg-purple-900/40 blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* ── Metric Grid ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-4 px-1">Portfolio Breakdown</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<CheckCircle2 size={17} />} label="Total Paid"   value={formatCurrency(totalPaid)}      iconClass="text-emerald-500 bg-emerald-500/10" barColor="bg-emerald-500" />
          <MetricCard icon={<Clock size={17} />}        label="Remaining"    value={formatCurrency(totalRemaining)} iconClass="text-rose-500 bg-rose-500/10"       barColor="bg-rose-500" />
          <MetricCard icon={<TrendingUp size={17} />}   label="Active Loans" value={loanStats.activeLoans}         iconClass="text-blue-500 bg-blue-500/10"       barColor="bg-blue-500" />
          <MetricCard icon={<Layers size={17} />}       label="Completed"    value={loanStats.completedLoans}      iconClass="text-indigo-500 bg-indigo-500/10"   barColor="bg-indigo-500" />
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function DonutChart({ percentage }) {
  const r   = 48;
  const c   = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, percentage)) / 100);

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="136" height="136" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={r}
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3b82f6" />
            <stop offset="50%"  stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tracking-tight gradient-text leading-none">{percentage}%</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">paid</span>
      </div>
    </div>
  );
}

function LegendBar({ label, value, color, percent }) {
  const barClass = color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-[var(--border)]';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="font-bold text-[var(--text-primary)]">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--surface-muted)] overflow-hidden">
        <div className={`h-full rounded-full ${barClass} transition-all duration-700`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, iconClass, barColor }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all duration-300 cursor-default group">
      <div className={`absolute top-0 inset-x-0 h-[2px] ${barColor} opacity-70 group-hover:opacity-100 transition-opacity`} />
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-4 ${iconClass}`}>{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-black text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
