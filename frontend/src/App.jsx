import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const initialForm = { name: '', email: '', password: '' };
const initialLoanForm = { monthlyEmi: '', termMonths: '', startDate: '' };

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [emis, setEmis] = useState([]);
  const [loanForm, setLoanForm] = useState(initialLoanForm);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    api.profile()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user) {
      loadLoans();
    }
  }, [user]);

  useEffect(() => {
    if (!message.text) return undefined;
    const timeout = setTimeout(() => setMessage({ text: '', type: 'info' }), 5000);
    return () => clearTimeout(timeout);
  }, [message.text]);

  const loanStats = useMemo(() => {
    const totalLoans = loans.length;
    const activeLoans = loans.filter((loan) => loan.status === 'active').length;
    const completedLoans = loans.filter((loan) => loan.status === 'completed').length;
    const outstandingBalance = loans.reduce((sum, loan) => sum + Number(loan.remainingBalance || 0), 0);
    return { totalLoans, activeLoans, completedLoans, outstandingBalance };
  }, [loans]);

  const activeLoans = useMemo(() => loans.filter((loan) => loan.status === 'active'), [loans]);

  const analytics = useMemo(() => {
    const totalPaid = loans.reduce((sum, loan) => sum + Number(loan.totalPaid || 0), 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + Number(loan.remainingBalance || 0), 0);
    const totalDebt = totalPaid + totalRemaining;
    const paidPercent = totalDebt ? Math.round((totalPaid / totalDebt) * 100) : 0;
    const debtFreeDate = loans
      .filter((loan) => loan.remainingBalance > 0 && loan.debtFreeDate)
      .map((loan) => new Date(loan.debtFreeDate))
      .sort((a, b) => a - b)
      .pop();
    return {
      totalPaid,
      totalRemaining,
      paidPercent,
      debtFreeDate: debtFreeDate ? formatDate(debtFreeDate) : 'Cleared',
    };
  }, [loans]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoanInput = (event) => {
    const { name, value } = event.target;
    setLoanForm((prev) => ({ ...prev, [name]: value }));
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    showMessage('');

    try {
      const data = mode === 'login' ? await api.login(form) : await api.register(form);
      setUser(data.user);
      setForm(initialForm);
      setSelectedLoan(null);
      setEmis([]);
      loadLoans();
      showMessage(`${mode === 'login' ? 'Signed in' : 'Account created'} successfully`, 'success');
    } catch (error) {
      showMessage(error.message || 'Authentication failed', 'error');
    }
  };

  const loadLoans = async () => {
    try {
      const data = await api.getLoans();
      setLoans(data.loans);
    } catch (error) {
      showMessage(error.message || 'Failed to load loans', 'error');
    }
  };

  const submitLoan = async (event) => {
    event.preventDefault();
    showMessage('');

    try {
      const monthlyEmi = Number(loanForm.monthlyEmi);
      const termMonths = Number(loanForm.termMonths);
      const principal = monthlyEmi * termMonths;

      if (!monthlyEmi || !termMonths) {
        throw new Error('Please provide monthly EMI and number of months.');
      }

      const loanPayload = {
        principal,
        monthlyEmi,
        termMonths,
        startDate: loanForm.startDate || undefined,
      };

      const data = await api.createLoan(loanPayload);
      setLoans((prev) => [data.loan, ...prev]);
      setLoanForm(initialLoanForm);
      showMessage('Loan created successfully', 'success');
    } catch (error) {
      showMessage(error.message || 'Failed to create loan', 'error');
    }
  };

  const loadEmis = async (loan) => {
    try {
      const data = await api.getEmisByLoan(loan._id);
      const nextDueDate = data.emis.find((emi) => !emi.paid)?.dueDate;
      setSelectedLoan({
        ...data.loan,
        remainingBalance: data.remainingBalance,
        totalPaid: data.totalPaid,
        nextDueDate,
      });
      setEmis(data.emis);
      setPage('loanDetail');
    } catch (error) {
      showMessage(error.message || 'Failed to load EMIs', 'error');
    }
  };

  const payEmi = async (emiId) => {
    try {
      const data = await api.payEmi(emiId);
      setEmis((prev) => prev.map((emi) => (emi._id === emiId ? data.emi : emi)));
      setSelectedLoan((prev) =>
        prev
          ? {
              ...prev,
              remainingBalance: data.remainingBalance ?? prev.remainingBalance,
              status: data.loanStatus || prev.status,
            }
          : prev,
      );
      await loadLoans();
      if (selectedLoan) {
        await loadEmis(selectedLoan);
      }
      showMessage('EMI marked as paid', 'success');
    } catch (error) {
      showMessage(error.message || 'Failed to update EMI status', 'error');
    }
  };

  const deleteLoan = async (loanId) => {
    const confirmed = window.confirm('Delete this loan and all its EMI schedule?');
    if (!confirmed) return;

    try {
      await api.deleteLoan(loanId);
      setLoans((prev) => prev.filter((loan) => loan._id !== loanId));
      if (selectedLoan?.id === loanId || selectedLoan?._id === loanId) {
        setSelectedLoan(null);
        setEmis([]);
      }
      showMessage('Loan deleted successfully', 'success');
    } catch (error) {
      showMessage(error.message || 'Failed to delete loan', 'error');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setLoans([]);
    setEmis([]);
    setSelectedLoan(null);
    setPage('dashboard');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <span className="eyebrow">Loan performance dashboard</span>
          <h1>CrediFlow</h1>
          <p className="hero-copy">Manage loans, payments, and EMI schedules with confidence.</p>
        </div>
        {user && (
          <>
            <div className="account-panel">
              <div>
                <span className="small-label">Signed in as</span>
                <p>{user.name}</p>
              </div>
              <button className="secondary-button" onClick={logout}>
                Logout
              </button>
            </div>
            <div className="page-tabs">
              <button className={`tab-button ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>
                Dashboard
              </button>
              <button className={`tab-button ${page === 'analytics' ? 'active' : ''}`} onClick={() => setPage('analytics')}>
                Analytics
              </button>
            </div>
          </>
        )}
      </header>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      {!user ? (
        <section className="card auth-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">Secure access</span>
              <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
              <p className="section-copy">Access your loan portfolio and track EMI progress from one central workspace.</p>
            </div>
          </div>

          <form onSubmit={submitAuth} className="auth-form">
            {mode === 'register' && (
              <label className="field-label">
                Full name
                <input name="name" value={form.name} onChange={handleInput} placeholder="Jane Doe" required />
              </label>
            )}
            <label className="field-label">
              Email address
              <input name="email" type="email" value={form.email} onChange={handleInput} placeholder="hello@example.com" required />
            </label>
            <label className="field-label">
              Password
              <input name="password" type="password" value={form.password} onChange={handleInput} placeholder="••••••••" required />
            </label>
            <button className="primary-button" type="submit">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="card-footer">
            <p>{mode === 'login' ? 'New to CrediFlow?' : 'Already have an account?'}</p>
            <button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
        </section>
      ) : (
        <div
          className={
            page === 'dashboard'
              ? 'dashboard'
              : page === 'analytics'
              ? 'analytics-page'
              : 'loan-detail-page'
          }
        >
          {page === 'dashboard' ? (
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
          ) : page === 'analytics' ? (
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
          ) : (
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
                      <strong>
                        {selectedLoan.nextDueDate ? formatDate(selectedLoan.nextDueDate) : 'No upcoming payment'}
                      </strong>
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
          )}
        </div>
      )}
    </div>
  );
}
