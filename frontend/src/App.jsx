import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const initialForm = { name: '', email: '', password: '' };

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [emis, setEmis] = useState([]);
  const [loanForm, setLoanForm] = useState({ principal: '', annualInterestRate: '', termMonths: '', startDate: '' });

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

  const loanStats = useMemo(() => {
    const totalLoans = loans.length;
    const activeLoans = loans.filter((loan) => loan.status === 'active').length;
    const completedLoans = loans.filter((loan) => loan.status === 'completed').length;
    const outstandingBalance = loans.reduce((sum, loan) => sum + Number(loan.principal || 0), 0);
    return { totalLoans, activeLoans, completedLoans, outstandingBalance };
  }, [loans]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoanInput = (event) => {
    const { name, value } = event.target;
    setLoanForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      let data;
      if (mode === 'login') {
        data = await api.login(form);
      } else {
        data = await api.register(form);
      }
      setUser(data.user);
      setForm(initialForm);
      loadLoans();
    } catch (error) {
      setMessage(error.message || 'Authentication failed');
    }
  };

  const loadLoans = async () => {
    try {
      const data = await api.getLoans();
      setLoans(data.loans);
    } catch (error) {
      setMessage(error.message || 'Failed to load loans');
    }
  };

  const submitLoan = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const data = await api.createLoan(loanForm);
      setLoans((prev) => [data.loan, ...prev]);
      setLoanForm({ principal: '', annualInterestRate: '', termMonths: '', startDate: '' });
      setMessage('Loan created successfully');
    } catch (error) {
      setMessage(error.message || 'Failed to create loan');
    }
  };

  const loadEmis = async (loanId) => {
    try {
      const data = await api.getEmisByLoan(loanId);
      setSelectedLoan(loanId);
      setEmis(data.emis);
    } catch (error) {
      setMessage(error.message || 'Failed to load EMIs');
    }
  };

  const payEmi = async (emiId) => {
    try {
      const data = await api.payEmi(emiId);
      setEmis((prev) => prev.map((emi) => (emi._id === emiId ? data.emi : emi)));
      setMessage('EMI paid successfully');
      loadLoans();
    } catch (error) {
      setMessage(error.message || 'Failed to pay EMI');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setLoans([]);
    setEmis([]);
    setSelectedLoan(null);
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
          <div className="account-panel">
            <div>
              <span className="small-label">Signed in as</span>
              <p>{user.name}</p>
            </div>
            <button className="secondary-button" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {message && <div className="message">{message}</div>}

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
        <main className="dashboard">
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
              <h3>₹{loanStats.outstandingBalance.toLocaleString()}</h3>
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
                  Principal amount
                  <input name="principal" type="number" value={loanForm.principal} onChange={handleLoanInput} placeholder="15000" required />
                </label>
                <label className="field-label">
                  Annual interest rate
                  <input name="annualInterestRate" type="number" step="0.01" value={loanForm.annualInterestRate} onChange={handleLoanInput} placeholder="12.5" required />
                </label>
                <label className="field-label">
                  Term (months)
                  <input name="termMonths" type="number" value={loanForm.termMonths} onChange={handleLoanInput} placeholder="24" required />
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

              {loans.length === 0 ? (
                <p className="empty-state">No loans created yet. Add a loan to begin tracking EMIs.</p>
              ) : (
                <div className="loans-list">
                  {loans.map((loan) => (
                    <div key={loan._id} className="loan-item">
                      <div className="loan-details">
                        <span className="loan-label">Principal</span>
                        <strong>${loan.principal.toLocaleString()}</strong>
                      </div>
                      <div className="loan-details">
                        <span className="loan-label">Rate</span>
                        <strong>{loan.annualInterestRate}%</strong>
                      </div>
                      <div className="loan-details">
                        <span className="loan-label">Term</span>
                        <strong>{loan.termMonths} months</strong>
                      </div>
                      <div className="loan-details">
                        <span className="loan-label">Status</span>
                        <strong>{loan.status}</strong>
                      </div>
                      <button className="secondary-button" onClick={() => loadEmis(loan._id)}>
                        View EMIs
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          {selectedLoan && (
            <section className="card emi-panel">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">Repayment schedule</span>
                  <h2>EMI schedule</h2>
                </div>
              </div>

              {emis.length === 0 ? (
                <p className="empty-state">No EMI schedule found for this loan.</p>
              ) : (
                <div className="emis-list">
                  {emis.map((emi) => (
                    <div key={emi._id} className={`emi-item ${emi.paid ? 'paid' : ''}`}>
                      <div className="emi-row">
                        <span className="loan-label">Amount</span>
                        <strong>${emi.amount.toFixed(2)}</strong>
                      </div>
                      <div className="emi-row">
                        <span className="loan-label">Due date</span>
                        <strong>{new Date(emi.dueDate).toLocaleDateString()}</strong>
                      </div>
                      <div className="emi-row">
                        <span className="loan-label">Status</span>
                        <strong>{emi.paid ? 'Paid' : 'Pending'}</strong>
                      </div>
                      {!emi.paid && (
                        <button className="secondary-button" onClick={() => payEmi(emi._id)}>
                          Pay now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      )}
    </div>
  );
}
