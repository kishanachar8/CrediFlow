import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  ReceiptText,
  ShieldCheck,
  CreditCard,
  Lock,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';

export function LoanDetailView({ selectedLoan, emis, formatCurrency, formatDate, payEmi, setPage }) {
  if (!selectedLoan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-muted)] flex items-center justify-center mb-5">
          <ReceiptText size={28} className="text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">No loan selected</h3>
        <Button variant="secondary" className="mt-6" onClick={() => setPage('dashboard')}>
          <ArrowLeft size={14} className="mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const paidCount = emis.filter((e) => e.paid).length;
  const progressPercent = emis.length > 0 ? (paidCount / emis.length) * 100 : 0;
  const nextDue = emis.find((e) => !e.paid);
  const overdueCount = emis.filter((e) => !e.paid && new Date(e.dueDate) < new Date()).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div className="space-y-2">
          <button
            onClick={() => setPage('dashboard')}
            className="group flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Repayment Schedule
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] glass text-xs font-semibold text-[var(--text-muted)]">
          <ShieldCheck size={13} className="text-emerald-400" />
          Loan #{selectedLoan._id.slice(-6).toUpperCase()}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard label="Principal" value={formatCurrency(selectedLoan.principal)} icon={<CreditCard size={13} />} />
        <MiniCard label="Monthly EMI" value={formatCurrency(selectedLoan.monthlyEmi)} accent />
        <MiniCard label="Remaining" value={formatCurrency(selectedLoan.remainingBalance)} />
        <MiniCard
          label="Next Due"
          value={nextDue ? formatDate(nextDue.dueDate) : 'Cleared'}
          icon={<Calendar size={13} />}
          danger={overdueCount > 0}
        />
      </div>

      {/* ── Progress Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 shadow-[0_12px_40px_rgba(99,102,241,0.4)]">
        {/* Noise pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200/70 mb-2">Repayment Progress</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black tracking-tight text-white leading-none">
                  {Math.round(progressPercent)}%
                </span>
                <span className="text-sm text-blue-200/70 mb-1 font-medium">
                  {paidCount} / {emis.length} cleared
                </span>
              </div>
            </div>
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-400/30 text-xs font-bold text-rose-200">
                <AlertTriangle size={12} /> {overdueCount} overdue
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-white/15 rounded-full overflow-hidden">
            <div
              className="progress-shimmer h-full bg-white rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-blue-200/50 font-medium">
            <span>Started</span>
            <span>Debt-free: {selectedLoan.debtFreeDate ? formatDate(selectedLoan.debtFreeDate) : '—'}</span>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-10 w-36 h-36 rounded-full bg-violet-900/30 blur-2xl pointer-events-none" />
      </div>

      {/* ── Schedule Table ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Zap size={15} className="text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Payment Schedule
          </h3>
        </div>

        <div className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow)]">
          {/* Table header */}
          <div className="grid grid-cols-[2.5rem_1fr_1fr_auto] gap-3 px-5 py-3.5 bg-[var(--surface-strong)] border-b border-[var(--border)]">
            {['', 'Installment', 'Amount', 'Action'].map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {emis.map((emi, index) => (
              <InstallmentRow
                key={emi._id}
                emi={emi}
                index={index}
                isLocked={index > 0 && !emis[index - 1].paid}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                payEmi={payEmi}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function MiniCard({ label, value, icon, accent, danger }) {
  if (accent) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 shadow-[0_8px_24px_rgba(99,102,241,0.35)]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100/70 mb-1">{label}</p>
        <p className="text-lg font-black text-white">{value}</p>
      </div>
    );
  }
  return (
    <Card className={`p-5 ${danger ? 'border-rose-500/30 bg-rose-500/5' : ''}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-[var(--text-muted)]">{icon}</span>}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
      </div>
      <p className={`text-lg font-black ${danger ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>{value}</p>
    </Card>
  );
}

function InstallmentRow({ emi, index, isLocked, formatCurrency, formatDate, payEmi }) {
  const isPaid    = emi.paid;
  const isOverdue = !isPaid && new Date(emi.dueDate) < new Date();
  const num       = emi.paymentNumber ?? index + 1;

  return (
    <div className={`grid grid-cols-[2.5rem_1fr_1fr_auto] gap-3 items-center px-5 py-4 transition-colors ${
      isPaid    ? 'bg-[var(--surface-strong)]/50'
    : isOverdue ? 'bg-rose-500/3'
    : isLocked  ? 'opacity-40'
    : 'hover:bg-[var(--surface-muted)]/50'
    }`}>

      {/* Status icon */}
      <div className={`flex items-center justify-center w-8 h-8 rounded-xl border ${
        isPaid    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
        : isOverdue ? 'border-rose-400/40 bg-rose-500/10 text-rose-500'
        : isLocked  ? 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'
        : 'border-[var(--border)] text-[var(--text-muted)]'
      }`}>
        {isPaid ? <CheckCircle2 size={14} />
        : isLocked ? <Lock size={12} />
        : isOverdue ? <AlertTriangle size={12} />
        : <Clock size={12} />}
      </div>

      {/* Number + date */}
      <div>
        <p className="text-xs font-bold text-[var(--text-primary)]">#{num}</p>
        <p className="text-[11px] text-[var(--text-muted)]">{formatDate(emi.dueDate)}</p>
      </div>

      {/* Amount */}
      <p className={`text-sm font-bold ${
        isPaid    ? 'text-[var(--text-muted)] line-through'
        : isOverdue ? 'text-rose-500'
        : 'text-[var(--text-primary)]'
      }`}>
        {formatCurrency(emi.amount)}
      </p>

      {/* Action */}
      <div className="flex justify-end">
        {isPaid ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <CheckCircle2 size={12} /> Paid
          </span>
        ) : isLocked ? (
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Locked</span>
        ) : (
          <Button
            size="sm"
            onClick={() => payEmi(emi._id)}
            className={`h-8 px-4 text-xs font-bold ${isOverdue ? 'from-rose-500 to-rose-600 shadow-[0_4px_15px_rgba(244,63,94,0.4)]' : ''}`}
          >
            Pay
          </Button>
        )}
      </div>
    </div>
  );
}
