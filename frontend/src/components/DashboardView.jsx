import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  PlusCircle,
  Trash2,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export function DashboardView({
  loanStats,
  loanForm,
  handleLoanInput,
  submitLoan,
  activeLoans,
  loadEmis,
  deleteLoan,
  formatCurrency,
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1.5">
            Financial Overview
          </p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
            EMI Tracker
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Loans"    value={loanStats.activeLoans}                    icon={<TrendingUp size={17} />}  variant="blue"    />
        <StatCard label="Total Loans"     value={loanStats.totalLoans}                     icon={<CreditCard size={17} />}  variant="indigo"  />
        <StatCard label="Completed"       value={loanStats.completedLoans}                 icon={<CheckCircle2 size={17} />} variant="emerald" />
        <StatCard label="Outstanding"     value={formatCurrency(loanStats.outstandingBalance)} icon={<AlertCircle size={17} />} variant="rose" highlight />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-8 lg:grid-cols-12">

        {/* New Loan Form */}
        <div className="lg:col-span-4">
          <Card className="p-7 lg:sticky lg:top-6">
            {/* Card header accent */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
                <PlusCircle size={17} />
              </div>
              <div>
                <h2 className="font-bold text-[var(--text-primary)] leading-tight text-base">New Loan</h2>
                <p className="text-xs text-[var(--text-muted)]">Set up a repayment schedule</p>
              </div>
            </div>

            <form onSubmit={submitLoan} className="space-y-4">
              <FormField label="Monthly EMI (₹)" id="monthlyEmi" type="number" placeholder="10,000" value={loanForm.monthlyEmi} onChange={handleLoanInput} required />
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Duration (months)" id="termMonths" type="number" placeholder="24" value={loanForm.termMonths} onChange={handleLoanInput} required />
                <FormField label="Start Date" id="startDate" type="date" value={loanForm.startDate} onChange={handleLoanInput} />
              </div>

              {/* Live principal preview */}
              {loanForm.monthlyEmi && loanForm.termMonths && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Total Principal</span>
                  <span className="font-black text-sm gradient-text">
                    {formatCurrency(Number(loanForm.monthlyEmi) * Number(loanForm.termMonths))}
                  </span>
                </div>
              )}

              <Button type="submit" className="w-full py-3 text-sm font-bold mt-1">
                <Sparkles size={14} className="mr-2 opacity-80" />
                Create Loan Schedule
              </Button>
            </form>
          </Card>
        </div>

        {/* Loan List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Active Portfolio
            </h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {activeLoans.length} {activeLoans.length === 1 ? 'loan' : 'loans'}
            </span>
          </div>

          {activeLoans.length === 0 ? <EmptyState /> : (
            <div className="space-y-3">
              {activeLoans.map((loan) => (
                <LoanCard key={loan._id} loan={loan} formatCurrency={formatCurrency} loadEmis={loadEmis} deleteLoan={deleteLoan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── StatCard ───────────────────────────────────────────────────────── */

const STAT_CFG = {
  blue:    { bar: 'from-blue-400 to-indigo-500',   icon: 'bg-blue-500/10 text-blue-500',    num: 'text-[var(--text-primary)]'   },
  indigo:  { bar: 'from-indigo-400 to-violet-500', icon: 'bg-indigo-500/10 text-indigo-500', num: 'text-[var(--text-primary)]'   },
  emerald: { bar: 'from-emerald-400 to-teal-500',  icon: 'bg-emerald-500/10 text-emerald-500', num: 'text-[var(--text-primary)]' },
  rose:    { bar: 'from-rose-400 to-pink-500',     icon: 'bg-rose-500/10 text-rose-500',    num: 'gradient-text-rose'            },
};

function StatCard({ label, value, icon, variant, highlight }) {
  const c = STAT_CFG[variant] || STAT_CFG.blue;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] group hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all duration-300 cursor-default">
      {/* Gradient top accent */}
      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${c.bar}`} />

      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-4 ${c.icon}`}>
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
        {label}
      </p>
      <p className={`text-2xl font-black tracking-tight ${highlight ? c.num : 'text-[var(--text-primary)]'}`}>
        {value}
      </p>
    </div>
  );
}

/* ─── LoanCard ───────────────────────────────────────────────────────── */

function LoanCard({ loan, formatCurrency, loadEmis, deleteLoan }) {
  const progress    = loan.progress ?? 0;
  const isOverdue   = (loan.overdueCount ?? 0) > 0;
  const paidCount   = loan.paidPayments ?? 0;
  const totalCount  = loan.totalPayments ?? loan.termMonths ?? 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all duration-300">
      {/* Left glow accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${isOverdue ? 'from-rose-400 to-rose-600' : 'from-blue-400 to-indigo-500'}`} />

      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* Top row: ID + status + EMI */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
              #{loan._id.slice(-6).toUpperCase()}
            </span>
            {isOverdue ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertTriangle size={9} /> {loan.overdueCount} overdue
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Active
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">EMI / mo</p>
            <p className="text-base font-black text-[var(--text-primary)]">{formatCurrency(loan.monthlyEmi)}</p>
          </div>
        </div>

        {/* Amounts */}
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Principal</p>
            <p className="text-xl font-black text-[var(--text-primary)]">{formatCurrency(loan.principal)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Remaining</p>
            <p className="text-xl font-black gradient-text-blue">{formatCurrency(loan.remainingBalance)}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>{paidCount}/{totalCount} paid</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--surface-muted)] overflow-hidden">
            <div
              className="progress-shimmer h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Next due */}
        {loan.nextDueDate && (
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Calendar size={11} className="text-blue-400" />
            Next:&nbsp;
            <span className="font-semibold text-[var(--text-secondary)]">
              {new Date(loan.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-strong)]">
        <button
          onClick={() => deleteLoan(loan._id)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-rose-500 transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
        <Button variant="ghost" onClick={() => loadEmis(loan)} className="h-8 px-4 text-xs font-bold text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 border-0">
          View Schedule <ChevronRight size={13} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function FormField({ label, id, ...props }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[var(--text-secondary)] pl-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/12 transition-all"
        {...props}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-[var(--border)] text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-muted)] flex items-center justify-center mb-4">
        <CreditCard size={24} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--text-muted)]">No active loans</p>
      <p className="text-xs text-[var(--text-muted)] opacity-60 mt-1">Create your first loan above</p>
    </div>
  );
}
