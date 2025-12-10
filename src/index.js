import React from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from './ErrorBoundary';
import "./App.css";
import "./theme-compat.css";
import syncService from './services/syncService';
import { enqueue } from './lib/offlineQueue';
import { apiFetch, safeJson } from './lib/fetchHelper';

// Safely require App to catch module-evaluation/runtime errors during import.
let AppComponent = null;
try {
  // Use require to allow catching exceptions thrown during module evaluation
  // (e.g., syntax/runtime errors inside `App.js` that happen before React render)
  // eslint-disable-next-line global-require
  // Use a safe loader during debugging to avoid import-time crashes.
  AppComponent = require('./App.loader').default;
} catch (err) {
  // Report the client-side boot error to backend for diagnostics
  try {
    apiFetch('/log-client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err), stack: err.stack || null, when: 'import-App' })
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
  // Create a minimal fallback component that displays the error
  AppComponent = function ImportErrorFallback() {
    return React.createElement('div', { style: { padding: 24, color: '#900', background: '#fff' } }, [
      React.createElement('h2', { key: 'h' }, 'Application failed to load'),
      React.createElement('pre', { key: 'p', style: { whiteSpace: 'pre-wrap' } }, String(err))
    ]);
  };
}

// Apply persisted premium theme before React mounts to avoid FOUC
try {
  const isPremium = window.localStorage && window.localStorage.getItem('theme-premium');
  if (isPremium === '1') {
    document.body.classList.add('theme-premium');
  }
} catch (e) {
  // ignore
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker if available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => console.warn('SW register failed', err));
  });
}

// start auto sync with a basic api sender that will fallback to queue when offline
const apiSend = async (type, payload) => {
  // map type to API endpoints - simple example
  if (!navigator.onLine) {
    // enqueue for later
    return enqueue(type, payload);
  }
  try {
    const res = await apiFetch(`${type}`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    if (!res || !res.ok) throw new Error(`HTTP ${res ? res.status : 'ERR'}`);
    const wrap = await safeJson(res).catch(() => null);
    return wrap ? (wrap.json || wrap.text) : null;
  } catch (err) {
    // enqueue and rethrow so syncService can backoff
    await enqueue(type, payload);
    throw err;
  }
};

syncService.startAutoSync(apiSend);