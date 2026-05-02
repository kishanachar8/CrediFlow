import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loans: [],
  selectedLoan: null,
  emis: [],
};

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    setLoans(state, action) {
      state.loans = action.payload;
    },
    addLoan(state, action) {
      state.loans.unshift(action.payload);
    },
    removeLoan(state, action) {
      state.loans = state.loans.filter((loan) => loan._id !== action.payload);
    },
    setSelectedLoan(state, action) {
      state.selectedLoan = action.payload;
    },
    setEmis(state, action) {
      state.emis = action.payload;
    },
    clearLoans(state) {
      state.loans = [];
      state.selectedLoan = null;
      state.emis = [];
    },
  },
});

export const { setLoans, addLoan, removeLoan, setSelectedLoan, setEmis, clearLoans } = loanSlice.actions;
export default loanSlice.reducer;
