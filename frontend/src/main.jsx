import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

// State & Logic
import { store } from './app/store.js';
import App from './App.jsx';

// Styling
/** * Ensure your loanmate-theme.css contains the variable definitions
 * we used in the view refactors (e.g., --surface, --border, --text).
 */
import './loanmate-theme.css'; 

/**
 * Root initialization
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Ensure index.html has <div id='root'></div>");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* Redux Store Provider wraps the entire tree to grant access to 
        auth and loan state throughout CrediFlow */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);