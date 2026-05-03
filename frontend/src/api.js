const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let accessToken = null;
let csrfToken = null;

const setAccessToken = (token) => {
  accessToken = token;
};

const clearAccessToken = () => {
  accessToken = null;
};

const setCsrfToken = (token) => {
  csrfToken = token;
};

async function fetchJson(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(responseBody?.message || 'Request failed');
  }

  return responseBody;
}

const getCsrfToken = async () => {
  const data = await fetchJson('/api/auth/csrf-token', { method: 'GET' });
  setCsrfToken(data.csrfToken);
  return data.csrfToken;
};

const refreshToken = async () => {
  if (!csrfToken) {
    await getCsrfToken();
  }
  const data = await fetchJson('/api/auth/refresh', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  setAccessToken(data.accessToken);
  return data;
};

const initAuth = async () => {
  try {
    await getCsrfToken();
    return await refreshToken();
  } catch (error) {
    clearAccessToken();
    throw error;
  }
};

export const api = {
  setAccessToken,
  clearAccessToken,
  initAuth,
  refreshToken,
  register: (body) => fetchJson('/api/auth/register', { method: 'POST', body }),
  login: (body) => fetchJson('/api/auth/login', { method: 'POST', body }),
  loginWithGoogle: (credential) => fetchJson('/api/auth/google/token', { 
    method: 'POST', 
    body: { credential }
  }),
  logout: () => fetchJson('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken } }),
  profile: () => fetchJson('/api/auth/profile', { method: 'GET' }),
  createLoan: (body) => fetchJson('/api/loans', { method: 'POST', body }),
  getLoans: () => fetchJson('/api/loans', { method: 'GET' }),
  deleteLoan: (loanId) => fetchJson(`/api/loans/${loanId}`, { method: 'DELETE' }),
  getEmisByLoan: (loanId) => fetchJson(`/api/emis/loan/${loanId}`, { method: 'GET' }),
  payEmi: (emiId) => fetchJson(`/api/emis/${emiId}/pay`, { method: 'POST' }),
};
