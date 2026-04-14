import React from 'react';

export function LoanDetailView({ selectedLoan, emis, formatCurrency, formatDate, payEmi, setPage }) {
  return (
    <main className="loan-detail-page">
      <div className="page-header-row">
        <div>
          <span className="eyebrow">Loan details</span>
          <h2>EMI schedule</h2>
        </div>
        <button className="secondary-button" onClick={() => setPage('dashboard')}>
          Back to dashboard
        </button>
      </div>

      {selectedLoan ? (
        <>
          <section className="loan-summary-grid">
            <div className="loan-summary-card">
              <span className="loan-label">Loan amount</span>
              <strong>{formatCurrency(selectedLoan.principal)}</strong>
            </div>
            <div className="loan-summary-card">
              <span className="loan-label">Monthly EMI</span>
              <strong>{formatCurrency(selectedLoan.monthlyEmi)}</strong>
            </div>
            <div className="loan-summary-card">
              <span className="loan-label">Remaining balance</span>
              <strong>{formatCurrency(selectedLoan.remainingBalance)}</strong>
            </div>
            <div className="loan-summary-card">
              <span className="loan-label">Next payment</span>
              <strong>{selectedLoan.nextDueDate ? formatDate(selectedLoan.nextDueDate) : 'No upcoming payment'}</strong>
            </div>
          </section>

          {emis.length === 0 ? (
            <p className="empty-state">No EMI schedule found for this loan.</p>
          ) : (
            <div className="emis-list">
              {emis.map((emi) => (
                <div key={emi._id} className={`emi-item ${emi.paid ? 'paid' : ''}`}>
                  <div className="emi-row">
                    <span className="loan-label">Payment #{emi.paymentNumber}</span>
                    <strong>{formatCurrency(emi.amount)}</strong>
                  </div>
                  <div className="emi-row">
                    <span className="loan-label">Due date</span>
                    <strong>{formatDate(emi.dueDate)}</strong>
                  </div>
                  <div className="emi-row">
                    <span className="loan-label">Status</span>
                    <strong>{emi.paid ? 'Paid' : 'Pending'}</strong>
                  </div>
                  {!emi.paid && (
                    <button className="secondary-button" onClick={() => payEmi(emi._id)}>
                      Mark as paid
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="empty-state">Select a loan and view EMIs to see the repayment schedule.</p>
      )}
    </main>
  );
}
