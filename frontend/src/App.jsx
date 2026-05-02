import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Features & Components
import { api } from './api.js';
import { Header } from './components/Header.jsx';
import { AuthView } from './components/AuthView.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { AnalyticsView } from './components/AnalyticsView.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { LoanDetailView } from './components/LoanDetailView.jsx';
import { MessageBanner } from './components/MessageBanner.jsx';

// Utilities & State
import { formatCurrency, formatDate } from './utils/format.js';
import { setUser, clearUser } from './features/auth/authSlice.js';
import { 
  setLoans, addLoan, removeLoan, setSelectedLoan, 
  setEmis, clearLoans 
} from './features/loan/loanSlice.js';

const INITIAL_FORM = { name: '', email: '', password: '' };
const INITIAL_LOAN_FORM = { monthlyEmi: '', termMonths: '', startDate: '' };

export default function App() {
  const dispatch = useDispatch();
  
  // --- Global State ---
  const user = useSelector((state) => state.auth.user);
  const { loans, selectedLoan, emis } = useSelector((state) => state.loan);

  // --- UI State ---
  const [page, setPage] = useState('dashboard');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(INITIAL_FORM);
  const [loanForm, setLoanForm] = useState(INITIAL_LOAN_FORM);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [navOpen, setNavOpen] = useState(false);

  // --- Theme Logic ---
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem('crediflow-theme');
    return stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    window.localStorage.setItem('crediflow-theme', theme);
  }, [theme]);

  // --- Derived State (Memoized for performance) ---
  const loanStats = useMemo(() => {
    const active = loans.filter(l => l.status === 'active');
    return {
      totalLoans: loans.length,
      activeLoans: active.length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      outstandingBalance: active.reduce((sum, l) => sum + Number(l.remainingBalance || 0), 0)
    };
  }, [loans]);

  const analytics = useMemo(() => {
    const totalPaid = loans.reduce((sum, l) => sum + Number(l.totalPaid || 0), 0);
    const totalRemaining = loans.reduce((sum, l) => sum + Number(l.remainingBalance || 0), 0);
    const totalDebt = totalPaid + totalRemaining;
    
    const debtFreeDate = loans
      .filter(l => l.remainingBalance > 0 && l.debtFreeDate)
      .map(l => new Date(l.debtFreeDate))
      .sort((a, b) => a - b)
      .pop();

    return {
      totalPaid,
      totalRemaining,
      paidPercent: totalDebt ? Math.round((totalPaid / totalDebt) * 100) : 0,
      debtFreeDate: debtFreeDate ? formatDate(debtFreeDate) : 'Cleared'
    };
  }, [loans]);

  // --- Utility Actions ---
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const loadLoans = useCallback(async () => {
    try {
      const data = await api.getLoans();
      dispatch(setLoans(data.loans));
    } catch (err) {
      showMessage(err.message || 'Failed to sync portfolio', 'error');
    }
  }, [dispatch, showMessage]);

  // --- Feature Handlers ---
  const loadEmis = useCallback(async (loan) => {
    try {
      const data = await api.getEmisByLoan(loan._id);
      const nextDue = data.emis.find(e => !e.paid)?.dueDate;
      dispatch(setSelectedLoan({ ...data.loan, ...data, nextDueDate: nextDue }));
      dispatch(setEmis(data.emis));
      setPage('loanDetail');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }, [dispatch, showMessage]);

  /**
   * Refactored payEmiHandler with Sequential Validation
   */
  const payEmiHandler = useCallback(async (emiId) => {
    const targetEmi = emis.find(e => e._id === emiId);
    
    // VALIDATION: Check if any installment before this one is still unpaid
    const hasUnpaidPrevious = emis.some(e => 
      e.paymentNumber < targetEmi.paymentNumber && !e.paid
    );

    if (hasUnpaidPrevious) {
      showMessage('Installments must be paid in chronological order.', 'warning');
      return;
    }

    try {
      const data = await api.payEmi(emiId);
      
      // 1. Update EMI list (Optimistic UI)
      dispatch(setEmis(emis.map(e => e._id === emiId ? data.emi : e)));
      
      // 2. Optimistically update local loan balance for immediate UI feedback
      const updatedLoans = loans.map(loan => {
        if (loan._id === selectedLoan?._id) {
          return {
            ...loan,
            remainingBalance: Math.max(0, loan.remainingBalance - data.emi.amount),
            totalPaid: (loan.totalPaid || 0) + data.emi.amount
          };
        }
        return loan;
      });
      dispatch(setLoans(updatedLoans));

      await loadLoans(); // Background sync
      showMessage('Payment Processed Successfully', 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }, [emis, loans, selectedLoan, dispatch, loadLoans, showMessage]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const data = mode === 'login' ? await api.login(form) : await api.register(form);
      api.setAccessToken(data.accessToken);
      dispatch(setUser(data.user));
      setForm(INITIAL_FORM);
      await loadLoans();
      showMessage('Welcome to CrediFlow', 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  // --- Lifecycle Hooks ---
  useEffect(() => {
    const init = async () => {
      try {
        await api.initAuth();
        const data = await api.profile();
        dispatch(setUser(data.user));
      } catch {
        dispatch(clearUser());
      }
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    if (user) loadLoans();
  }, [user, loadLoans]);

  const activeLoans = useMemo(() => loans.filter(l => l.status === 'active'), [loans]);

  return (
    <div className="min-h-screen w-full bg-[var(--surface-strong)] transition-colors duration-500">
      <div className="w-full max-w-none px-4 py-6 md:px-6 lg:px-12">
        
        <Header
          user={user}
          page={page}
          theme={theme}
          toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          setPage={setPage}
          navOpen={navOpen}
          setNavOpen={setNavOpen}
          logout={async () => {
            await api.logout();
            dispatch(clearUser());
            dispatch(clearLoans());
            setPage('dashboard');
          }}
        />
        
        <MessageBanner 
          message={message} 
          onClose={() => setMessage({ text: '', type: 'info' })} 
        />

        <main className="mt-8 w-full">
          {!user ? (
            <div className="flex justify-center items-center py-20">
              <AuthView 
                mode={mode} setMode={setMode} 
                form={form} 
                handleInput={(e) => setForm({ ...form, [e.target.name]: e.target.value })} 
                submitAuth={handleAuth} 
              />
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
              {page === 'dashboard' && (
                <DashboardView
                  loanStats={loanStats}
                  loanForm={loanForm}
                  handleLoanInput={(e) => setLoanForm({ ...loanForm, [e.target.name]: e.target.value })}
                  submitLoan={async (e) => {
                    e.preventDefault();
                    try {
                      const data = await api.createLoan({
                        ...loanForm,
                        principal: Number(loanForm.monthlyEmi) * Number(loanForm.termMonths)
                      });
                      dispatch(addLoan(data.loan));
                      setLoanForm(INITIAL_LOAN_FORM);
                      showMessage('Loan Account Created', 'success');
                    } catch (err) { showMessage(err.message, 'error'); }
                  }}
                  activeLoans={activeLoans}
                  loadEmis={loadEmis}
                  deleteLoan={async (id) => {
                    if (window.confirm('Terminate this loan record?')) {
                      await api.deleteLoan(id);
                      dispatch(removeLoan(id));
                      showMessage('Loan Deleted', 'success');
                    }
                  }}
                  formatCurrency={formatCurrency}
                />
              )}

              {page === 'profile' && <ProfileView user={user} loanStats={loanStats} />}

              {page === 'analytics' && (
                <AnalyticsView analytics={analytics} loanStats={loanStats} formatCurrency={formatCurrency} />
              )}

              {page === 'loanDetail' && (
                <LoanDetailView
                  selectedLoan={loans.find(l => l._id === selectedLoan?._id)}
                  emis={emis}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  payEmi={payEmiHandler}
                  setPage={setPage}
                />
              )}
            </div>
          )}
        </main>

        {user && (
          <footer className="mt-24 pb-12 border-t border-[var(--border)] pt-10 flex justify-between items-center opacity-40">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                CrediFlow Systems
              </p>
              <p className="text-[9px] text-[var(--text-muted)] font-medium italic">
                Secure Portfolio Management Dashboard
              </p>
            </div>
            <div className="flex gap-8 text-[9px] font-black uppercase tracking-tighter">
              <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500" /> API: Stable</span>
              <span>&copy; 2026</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}