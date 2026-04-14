import React from 'react';

export function ProfileView({ user, loanStats }) {
  return (
    <main className="profile-page">
      <section className="card profile-card">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Your profile</span>
            <h2>Account details</h2>
          </div>
        </div>
        <div className="loan-summary-grid">
          <div className="loan-summary-card">
            <span className="loan-label">Name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="loan-summary-card">
            <span className="loan-label">Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="loan-summary-card">
            <span className="loan-label">Active loans</span>
            <strong>{loanStats.activeLoans}</strong>
          </div>
          <div className="loan-summary-card">
            <span className="loan-label">Completed loans</span>
            <strong>{loanStats.completedLoans}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
