import { useEffect, useState } from 'react';
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
      if (mode === 'login') {
        const data = await api.login(form);
        setUser(data.user);
      } else {
        const data = await api.register(form);
        setUser(data.user);
      }
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
      <header>
        <h1>CrediFlow</h1>
        {user && (
          <div className="header-right">
            <span>Welcome, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>

      {message && <div className="message">{message}</div>}

      {!user ? (
        <section className="card auth-card">
          <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={submitAuth}>
            {mode === 'register' && (
              <label>
                Name
                <input name="name" value={form.name} onChange={handleInput} required />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleInput} required />
            </label>
            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={handleInput} required />
            </label>
            <button type="submit">Submit</button>
          </form>
          <button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Have an account? Login'}
          </button>
        </section>
      ) : (
        <main>
          <section className="card">
            <h2>Create Loan</h2>
            <form onSubmit={submitLoan} className="grid-form">
              <label>
                Principal
                <input name="principal" type="number" value={loanForm.principal} onChange={handleLoanInput} required />
              </label>
              <label>
                Annual Interest Rate (%)
                <input name="annualInterestRate" type="number" step="0.01" value={loanForm.annualInterestRate} onChange={handleLoanInput} required />
              </label>
              <label>
                Term (Months)
                <input name="termMonths" type="number" value={loanForm.termMonths} onChange={handleLoanInput} required />
              </label>
              <label>
                Start Date
                <input name="startDate" type="date" value={loanForm.startDate} onChange={handleLoanInput} />
              </label>
              <button type="submit">Create Loan</button>
            </form>
          </section>

          <section className="card loans-card">
            <h2>My Loans</h2>
            {loans.length === 0 ? (
              <p>No loans yet.</p>
            ) : (
              <div className="loans-list">
                {loans.map((loan) => (
                  <div key={loan._id} className="loan-item">
                    <div>
                      <strong>Principal:</strong> {loan.principal}
                    </div>
                    <div>
                      <strong>Rate:</strong> {loan.annualInterestRate}%
                    </div>
                    <div>
                      <strong>Term:</strong> {loan.termMonths} months
                    </div>
                    <div>
                      <strong>Status:</strong> {loan.status}
                    </div>
                    <button onClick={() => loadEmis(loan._id)}>View EMIs</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {selectedLoan && (
            <section className="card">
              <h2>EMI Schedule</h2>
              {emis.length === 0 ? (
                <p>No EMI schedule found.</p>
              ) : (
                <div className="emis-list">
                  {emis.map((emi) => (
                    <div key={emi._id} className={`emi-item ${emi.paid ? 'paid' : ''}`}>
                      <div>
                        <strong>Amount:</strong> {emi.amount.toFixed(2)}
                      </div>
                      <div>
                        <strong>Due:</strong> {new Date(emi.dueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Status:</strong> {emi.paid ? 'Paid' : 'Pending'}
                      </div>
                      {!emi.paid && <button onClick={() => payEmi(emi._id)}>Pay Now</button>}
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
