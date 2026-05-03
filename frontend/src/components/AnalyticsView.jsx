import React from 'react';
import { Card } from './ui/card'; 

export function AnalyticsView({ analytics, loanStats, formatCurrency }) {
  const { paidPercent, totalPaid, totalRemaining, debtFreeDate } = analytics;

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Panel: Charts and Projections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Progress Card */}
        <Card className="flex flex-col">
          <Card.Header>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Portfolio Analysis</span>
            <h2 className="text-2xl font-bold">Paid vs Remaining</h2>
          </Card.Header>
          
          <Card.Body className="flex flex-col sm:flex-row items-center gap-8 py-4">
            {/* Donut Chart Component */}
            <DonutChart percentage={paidPercent} />
            
            {/* Legend */}
            <div className="space-y-4 w-full">
              <LegendItem 
                label="Paid" 
                value={formatCurrency(totalPaid)} 
                color="bg-sky-500" 
              />
              <LegendItem 
                label="Remaining" 
                value={formatCurrency(totalRemaining)} 
                color="bg-[var(--border)]" 
              />
            </div>
          </Card.Body>
        </Card>

        {/* Projection Card */}
        <Card className="flex flex-col justify-between">
          <Card.Header>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Debt Free Projection</span>
            <h2 className="text-2xl font-bold">Debt free by</h2>
          </Card.Header>
          <Card.Body className="flex flex-col justify-center py-8">
            <p className="text-4xl font-black text-indigo-500 tracking-tight">
              {debtFreeDate}
            </p>
          </Card.Body>
          <Card.Footer className="justify-start">
            <p className="text-sm text-[var(--text-muted)]">
              Based on current schedules across all {loanStats.activeLoans} active loans.
            </p>
          </Card.Footer>
        </Card>
      </section>

      {/* Bottom Panel: Stat Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Paid" value={formatCurrency(totalPaid)} />
        <StatCard label="Total Remaining" value={formatCurrency(totalRemaining)} />
        <StatCard label="Active Loans" value={loanStats.activeLoans} />
        <StatCard label="Completed" value={loanStats.completedLoans} />
      </section>
    </main>
  );
}

/** * Internal Sub-components for a cleaner main view
 */

function DonutChart({ percentage }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
        <circle className="stroke-[var(--border)] fill-none" cx="60" cy="60" r={radius} strokeWidth="12" />
        <circle
          className="stroke-sky-500 fill-none transition-all duration-1000 ease-out"
          cx="60" cy="60" r={radius}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold tracking-tighter">
        {percentage}%
      </span>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">{label}</span>
      <p className="text-xl font-bold mt-1">{value}</p>
    </Card>
  );
}

function LegendItem({ label, value, color }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm text-[var(--text-muted)]">{label}</span>
      </div>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}