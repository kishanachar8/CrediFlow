const BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchJson(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(responseBody?.message || 'Request failed');
  }

  return responseBody;
}

export const api = {
  register: (body) => fetchJson('/api/auth/register', { method: 'POST', body }),
  login: (body) => fetchJson('/api/auth/login', { method: 'POST', body }),
  logout: () => fetchJson('/api/auth/logout', { method: 'POST' }),
  profile: () => fetchJson('/api/auth/profile', { method: 'GET' }),
  createLoan: (body) => fetchJson('/api/loans', { method: 'POST', body }),
  getLoans: () => fetchJson('/api/loans', { method: 'GET' }),
  deleteLoan: (loanId) => fetchJson(`/api/loans/${loanId}`, { method: 'DELETE' }),
  getEmisByLoan: (loanId) => fetchJson(`/api/emis/loan/${loanId}`, { method: 'GET' }),
  payEmi: (emiId) => fetchJson(`/api/emis/${emiId}/pay`, { method: 'POST' }),
};
