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
  ArrowUpRight
} from 'lucide-react';

export function DashboardView({ 
  loanStats, 
  loanForm, 
  handleLoanInput, 
  submitLoan, 
  activeLoans, 
  loadEmis, 
  deleteLoan, 
  formatCurrency 
}) {
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Financial Overview</p>
          <h1 className="text-4xl font-black tracking-tight text-[var(--text)]">EMI Tracker</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-strong)] rounded-2xl border border-[var(--border)]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Live Updates: {new Date().toLocaleDateString()}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active" value={loanStats.activeLoans} icon={<TrendingUp size={18} />} color="blue" />
        <StatCard label="Total" value={loanStats.totalLoans} icon={<CreditCard size={18} />} color="indigo" />
        <StatCard label="Completed" value={loanStats.completedLoans} icon={<CheckCircle2 size={18} />} color="emerald" />
        <StatCard 
          label="Outstanding" 
          value={formatCurrency(loanStats.outstandingBalance)} 
          icon={<AlertCircle size={18} />} 
          color="rose" 
          highlight
        />
      </section>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Creation Form */}
        <section className="lg:col-span-5">
          <Card className="p-8 lg:sticky lg:top-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <PlusCircle className="text-blue-500" />
                New Loan
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Configure your repayment schedule.</p>
            </div>

            <form onSubmit={submitLoan} className="space-y-6">
              <InputField 
                label="Monthly EMI"
                id="monthlyEmi"
                type="number"
                placeholder="0.00"
                value={loanForm.monthlyEmi}
                onChange={handleLoanInput}
                prefix="₹"
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Duration (Months)"
                  id="termMonths"
                  type="number"
                  placeholder="12"
                  value={loanForm.termMonths}
                  onChange={handleLoanInput}
                />
                <InputField 
                  label="Start Date"
                  id="startDate"
                  type="date"
                  value={loanForm.startDate}
                  onChange={handleLoanInput}
                />
              </div>

              <Button type="submit" className="w-full py-7 shadow-xl shadow-blue-500/10">
                Create Loan
              </Button>
            </form>
          </Card>
        </section>

        {/* Loan List */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold italic tracking-tight uppercase opacity-50">Active Portfolio</h2>
            <span className="text-xs font-black bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">
              {activeLoans.length} Loans
            </span>
          </div>

          {activeLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-[var(--border)] rounded-[2rem] opacity-40">
              <CreditCard size={48} className="mb-4" />
              <p className="font-medium">No active loans found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <LoanListItem 
                  key={loan._id} 
                  loan={loan} 
                  formatCurrency={formatCurrency} 
                  loadEmis={loadEmis} 
                  deleteLoan={deleteLoan} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** * Refactored Sub-components 
 */

function StatCard({ label, value, icon, color, highlight }) {
  return (
    <Card className={`p-5 group hover:border-${color}-500/50 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-500`}>
          {icon}
        </div>
        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className={`text-2xl font-black tracking-tight ${highlight ? 'text-rose-500' : 'text-[var(--text)]'}`}>
          {value}
        </p>
      </div>
    </Card>
  );
}

function InputField({ label, id, prefix, ...props }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold text-[var(--text)] ml-1 uppercase tracking-wider opacity-70">
        {label}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">{prefix}</span>}
        <input
          id={id}
          name={id}
          className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] py-3 ${prefix ? 'pl-8' : 'px-4'} outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
          {...props}
        />
      </div>
    </div>
  );
}

function LoanListItem({ loan, formatCurrency, loadEmis, deleteLoan }) {
  const isCompleted = loan.status === 'completed';
  const progress = 65; // Replace with actual calculation

  return (
    <Card className={`p-6 hover:translate-x-1 transition-transform cursor-pointer border-l-4 ${isCompleted ? 'border-emerald-500' : 'border-blue-500'}`}>
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black bg-[var(--surface-strong)] px-2 py-1 rounded text-[var(--text-muted)]">
              #{loan._id.slice(-4).toUpperCase()}
            </span>
            <div className="h-1 w-1 rounded-full bg-[var(--border)]" />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-emerald-500' : 'text-blue-500'}`}>
              {loan.status}
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight">{formatCurrency(loan.principal)} <span className="text-sm font-medium text-[var(--text-muted)]">Principal</span></h3>
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Remaining</p>
          <p className="text-2xl font-black text-blue-500 italic">{formatCurrency(loan.remainingBalance)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase text-[var(--text-muted)]">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-[var(--surface-strong)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => loadEmis(loan)} className="h-8 px-3 text-xs">
            View Schedule
          </Button>
          <button 
            onClick={() => deleteLoan(loan._id)}
            className="text-[var(--text-muted)] hover:text-rose-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-[var(--text-muted)] block uppercase">Monthly EMI</span>
          <span className="font-black text-sm">{formatCurrency(loan.monthlyEmi)}</span>
        </div>
      </div>
    </Card>
  );
}