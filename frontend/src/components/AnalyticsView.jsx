import React from 'react';

export function AnalyticsView({ analytics, loanStats, formatCurrency }) {
  return (
    <main className="analytics-page">
      <section className="analytics-panel">
        <article className="card chart-card">
          <div className="chart-header">
            <div>
              <span className="eyebrow">Portfolio analysis</span>
              <h2>Paid vs remaining</h2>
            </div>
            <div className="chart-value">{analytics.paidPercent}% paid</div>
          </div>
          <div className="chart-content">
            <svg viewBox="0 0 120 120" className="donut-chart">
              <circle className="donut-ring" cx="60" cy="60" r="52" />
              <circle
                className="donut-segment"
                cx="60"
                cy="60"
                r="52"
                style={{
                  strokeDasharray: `${2 * Math.PI * 52}`,
                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - analytics.paidPercent / 100)}`,
                }}
              />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="donut-text">
                {analytics.paidPercent}%
              </text>
            </svg>
            <div className="chart-legend">
              <div>
                <span className="legend-dot paid" />
                <span>Paid</span>
                <strong>{formatCurrency(analytics.totalPaid)}</strong>
              </div>
              <div>
                <span className="legend-dot remaining" />
                <span>Remaining</span>
                <strong>{formatCurrency(analytics.totalRemaining)}</strong>
              </div>
            </div>
          </div>
        </article>
        <article className="card chart-card">
          <div className="chart-header">
            <div>
              <span className="eyebrow">Debt free projection</span>
              <h2>Debt free by</h2>
            </div>
          </div>
          <div className="chart-summary">
            <p>{analytics.debtFreeDate}</p>
            <p className="summary-note">Based on current schedules across all active loans.</p>
          </div>
        </article>
      </section>

      <section className="summary-panel">
        <article className="summary-card">
          <span className="eyebrow">Total paid</span>
          <h3>{formatCurrency(analytics.totalPaid)}</h3>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Total remaining</span>
          <h3>{formatCurrency(analytics.totalRemaining)}</h3>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Active loans</span>
          <h3>{loanStats.activeLoans}</h3>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Completed loans</span>
          <h3>{loanStats.completedLoans}</h3>
        </article>
      </section>
    </main>
  );
}
