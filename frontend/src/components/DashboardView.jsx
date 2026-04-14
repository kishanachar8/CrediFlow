import React from 'react';

export function DashboardView({ loanStats, loanForm, handleLoanInput, submitLoan, activeLoans, loadEmis, deleteLoan, formatCurrency }) {
  return (
    <>
      <section className="summary-panel">
        <article className="summary-card">
          <span className="eyebrow">Active loans</span>
          <h3>{loanStats.activeLoans}</h3>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Total loans</span>
          <h3>{loanStats.totalLoans}</h3>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Completed loans</span>
          <h3>{loanStats.completedLoans}</h3>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Outstanding balance</span>
          <h3>{formatCurrency(loanStats.outstandingBalance)}</h3>
        </article>
      </section>

      <section className="panel-grid">
        <article className="card panel-card">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">New loan</span>
              <h2>Create a loan</h2>
            </div>
          </div>

          <form onSubmit={submitLoan} className="grid-form">
            <label className="field-label">
              EMI per month
              <input
                name="monthlyEmi"
                type="number"
                value={loanForm.monthlyEmi}
                onChange={handleLoanInput}
                placeholder="1250"
                required
              />
            </label>
            <label className="field-label">
              Number of months
              <input
                name="termMonths"
                type="number"
                value={loanForm.termMonths}
                onChange={handleLoanInput}
                placeholder="12"
                required
              />
            </label>
            <label className="field-label">
              Start date
              <input name="startDate" type="date" value={loanForm.startDate} onChange={handleLoanInput} />
            </label>
            <button className="primary-button" type="submit">
              Add loan
            </button>
          </form>
        </article>

        <article className="card panel-card loans-card">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Loan portfolio</span>
              <h2>My loans</h2>
            </div>
          </div>

          {activeLoans.length === 0 ? (
            <p className="empty-state">No active loans remaining. Create a new loan or switch to Analytics for overall progress.</p>
          ) : (
            <div className="loans-list">
              {activeLoans.map((loan) => (
                <div key={loan._id} className="loan-item">
                  <div className="loan-details">
                    <span className="loan-label">Loan amount</span>
                    <strong>{formatCurrency(loan.principal)}</strong>
                  </div>
                  <div className="loan-details">
                    <span className="loan-label">Monthly EMI</span>
                    <strong>{formatCurrency(loan.monthlyEmi)}</strong>
                  </div>
                  <div className="loan-details">
                    <span className="loan-label">Remaining</span>
                    <strong>{formatCurrency(loan.remainingBalance)}</strong>
                  </div>
                  <div className="loan-details">
                    <span className="loan-label">Status</span>
                    <strong>{loan.status}</strong>
                  </div>
                  <div className="loan-actions">
                    <button className="secondary-button" onClick={() => loadEmis(loan)}>
                      View EMIs
                    </button>
                    <button className="secondary-button delete-button" onClick={() => deleteLoan(loan._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </>
  );
}
