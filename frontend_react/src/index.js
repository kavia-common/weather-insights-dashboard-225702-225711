import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as sw from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker in production; expose a simple update hook if needed
sw.register({
  onUpdate: () => {
    // Optionally prompt user to refresh; noop for now
  },
  onSuccess: () => {
    // SW installed successfully
  }
});

// Forward SW messages to a global event for interested components
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event?.data?.type === 'CACHE_HIT') {
      const ev = new CustomEvent('app:cache-hit', { detail: { url: event.data.url } });
      window.dispatchEvent(ev);
    }
  });
}
