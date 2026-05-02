import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import loanReducer from '../features/loan/loanSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loan: loanReducer,
  },
});
