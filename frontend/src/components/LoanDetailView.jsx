import React, { useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  ArrowLeft, CheckCircle2, Clock, Calendar, 
  ReceiptText, ShieldCheck, CreditCard, Lock 
} from 'lucide-react';

export function LoanDetailView({ selectedLoan, emis, formatCurrency, formatDate, payEmi, setPage }) {
  if (!selectedLoan) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[var(--surface-strong)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-inner mb-6">
          <ReceiptText size={48} className="text-blue-500/20" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">No Loan Selected</h3>
        <Button variant="outline" className="mt-8" onClick={() => setPage('dashboard')}>
          <ArrowLeft size={16} className="mr-2" /> Return to Dashboard
        </Button>
      </div>
    );
  }

  const paidCount = emis.filter(e => e.paid).length;
  const progressPercent = emis.length > 0 ? (paidCount / emis.length) * 100 : 0;

  return (
    <main className="max-w-full mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-3">
          <button onClick={() => setPage('dashboard')} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Back to Overview
          </button>
          <div className="flex items-center gap-4">
             <div className="h-12 w-1.5 bg-blue-500 rounded-full" />
             <h2 className="text-4xl font-black tracking-tighter text-[var(--text)]">Repayment Timeline</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-strong)]/50 rounded-2xl border border-[var(--border)] backdrop-blur-md">
           <ShieldCheck size={14} className="text-emerald-500" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
             Verified Account: {selectedLoan._id.slice(-6).toUpperCase()}
           </span>
        </div>
      </header>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Principal" value={formatCurrency(selectedLoan.principal)} icon={<CreditCard size={14}/>} />
        <SummaryCard label="Monthly EMI" value={formatCurrency(selectedLoan.monthlyEmi)} highlight />
        <SummaryCard label="Remaining" value={formatCurrency(selectedLoan.remainingBalance)} />
        <SummaryCard label="Next Due" value={selectedLoan.nextDueDate ? formatDate(selectedLoan.nextDueDate) : 'N/A'} />
      </section>

      <Card className="p-8 border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative shadow-blue-500/20">
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Collection Progress</p>
              <h4 className="text-3xl font-black mt-1">{Math.round(progressPercent)}%</h4>
            </div>
            <p className="text-sm font-medium opacity-80 italic">{paidCount} of {emis.length} installments cleared</p>
          </div>
          <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
            <div className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out rounded-full" 
                 style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-blue-500" />
            <h3 className="font-black text-lg tracking-tight uppercase opacity-50">Schedule Details</h3>
          </div>
        </div>
        <Card className="p-0 overflow-hidden border-[var(--border)]">
          <div className="divide-y divide-[var(--border)]">
            {emis.map((emi, index) => (
              <InstallmentRow 
                key={emi._id} 
                emi={emi} 
                // CRITICAL: We pass the status of the previous EMI to determine if this one is locked
                isLocked={index > 0 && !emis[index - 1].paid}
                formatCurrency={formatCurrency} 
                formatDate={formatDate} 
                payEmi={payEmi} 
              />
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, highlight, icon }) {
  return (
    <Card className={`p-5 transition-all duration-500 ${highlight ? 'bg-blue-600 border-none text-white shadow-lg' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="opacity-50">{icon}</span>}
        <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>{label}</span>
      </div>
      <p className="text-xl font-black tracking-tight">{value}</p>
    </Card>
  );
}

function InstallmentRow({ emi, isLocked, formatCurrency, formatDate, payEmi }) {
  const isPaid = emi.paid;

  return (
    <div className={`group flex flex-col md:flex-row md:items-center justify-between p-6 transition-all 
      ${isPaid ? 'bg-[var(--surface-strong)]/10' : ''} 
      ${isLocked ? 'opacity-40 select-none' : 'hover:bg-[var(--surface-strong)]/30'}`}
    >
      <div className="flex items-center gap-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all 
          ${isPaid 
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 rotate-12' 
            : isLocked
              ? 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] group-hover:text-blue-500'
          }`}
        >
          {isLocked ? <Lock size={16} /> : <span className="text-sm font-black">#{emi.paymentNumber}</span>}
        </div>
        
        <div className="space-y-1">
          <p className={`font-black text-xl tracking-tight ${isPaid ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}`}>
            {formatCurrency(emi.amount)}
          </p>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
               <Calendar size={12} /> {formatDate(emi.dueDate)}
             </div>
             {isPaid && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Processed</span>}
             {!isPaid && isLocked && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Awaiting Previous Payment</span>}
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-0 flex items-center justify-end gap-6">
        {isPaid ? (
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Cleared</span>
          </div>
        ) : (
          <Button 
            variant={isLocked ? "ghost" : "primary"} 
            size="sm" 
            onClick={() => !isLocked && payEmi(emi._id)} 
            disabled={isLocked} // Disable the button so it cannot be clicked
            className={`px-6 py-2 h-auto text-xs ${isLocked ? 'cursor-not-allowed border-dashed opacity-50' : ''}`}
          >
            {isLocked ? 'Locked' : 'Mark as Paid'}
          </Button>
        )}
      </div>
    </div>
  );
}