import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { Header } from './components/Header.jsx';
import { AuthView } from './components/AuthView.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { AnalyticsView } from './components/AnalyticsView.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { LoanDetailView } from './components/LoanDetailView.jsx';
import { MessageBanner } from './components/MessageBanner.jsx';
import { formatCurrency, formatDate } from './utils/format.js';

const initialForm = { name: '', email: '', password: '' };
const initialLoanForm = { monthlyEmi: '', termMonths: '', startDate: '' };

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
  const [navOpen, setNavOpen] = useState(false);

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
      <Header user={user} page={page} setPage={setPage} navOpen={navOpen} setNavOpen={setNavOpen} logout={logout} />
      <MessageBanner message={message} />

      {!user ? (
        <AuthView mode={mode} setMode={setMode} form={form} handleInput={handleInput} submitAuth={submitAuth} />
      ) : (
        <div
          className={
            page === 'dashboard'
              ? 'dashboard'
              : page === 'analytics'
              ? 'analytics-page'
              : page === 'profile'
              ? 'profile-page'
              : 'loan-detail-page'
          }
        >
          {page === 'dashboard' ? (
            <DashboardView
              loanStats={loanStats}
              loanForm={loanForm}
              handleLoanInput={handleLoanInput}
              submitLoan={submitLoan}
              activeLoans={activeLoans}
              loadEmis={loadEmis}
              deleteLoan={deleteLoan}
              formatCurrency={formatCurrency}
            />
          ) : page === 'profile' ? (
            <ProfileView user={user} loanStats={loanStats} />
          ) : page === 'analytics' ? (
            <AnalyticsView analytics={analytics} loanStats={loanStats} formatCurrency={formatCurrency} />
          ) : (
            <LoanDetailView
              selectedLoan={selectedLoan}
              emis={emis}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              payEmi={payEmi}
              setPage={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
