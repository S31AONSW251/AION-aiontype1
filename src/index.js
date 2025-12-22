import React from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from './ErrorBoundary';
// Load shared theme tokens first so all components and App.css can use them
import './styles/theme-vars.css';
import "./App.css";
import "./theme-compat.css";
import syncService from './services/syncService';
import { enqueue } from './lib/offlineQueue';
import { apiFetch, safeJson } from './lib/fetchHelper';

// Ensure test workers and early runtime have a handler for unhandled rejections
// so Jest child processes don't crash on background promise rejections during import.
try {
  if (typeof process !== 'undefined' && process && process.on) {
    process.on('unhandledRejection', (reason) => {
      try { console.warn('Early unhandledRejection captured in index.js:', reason); } catch (e) {}
    });
  }
} catch (e) {}

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

// Global error surface: capture unhandled errors and promise rejections and
// report them to the backend endpoint. Also show a small visible overlay so
// users encountering a blank page can copy the error text for debugging.
function showClientErrorOverlay(text) {
  try {
    let el = document.getElementById('client-error-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'client-error-overlay';
      el.style.position = 'fixed';
      el.style.left = '12px';
      el.style.right = '12px';
      el.style.bottom = '12px';
      el.style.zIndex = 99999;
      el.style.padding = '12px 16px';
      el.style.borderRadius = '8px';
      el.style.background = 'linear-gradient(90deg, rgba(255,90,193,0.95), rgba(138,43,255,0.95))';
      el.style.color = '#fff';
      el.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6)';
      el.style.fontFamily = 'monospace';
      el.style.fontSize = '12px';
      el.style.maxHeight = '40vh';
      el.style.overflow = 'auto';
      el.style.whiteSpace = 'pre-wrap';
      document.body.appendChild(el);
    }
    el.textContent = text;
  } catch (e) {
    // ignore overlay errors
  }
}

window.addEventListener('error', function (ev) {
  try {
    const msg = `Error: ${ev.message} at ${ev.filename}:${ev.lineno}:${ev.colno}`;
    showClientErrorOverlay(msg);
    fetch('/log-client-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg, stack: ev.error ? (ev.error.stack || null) : null }) }).catch(() => {});
  } catch (e) {}
});

window.addEventListener('unhandledrejection', function (ev) {
  try {
    const msg = `UnhandledRejection: ${String(ev.reason)}`;
    showClientErrorOverlay(msg);
    fetch('/log-client-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg, stack: ev.reason && ev.reason.stack ? ev.reason.stack : null }) }).catch(() => {});
  } catch (e) {}
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  </React.StrictMode>
);

// Signal successful boot so the inline boot-watchdog in index.html can
// clear its failure message if present.
try { window.__AION_BOOTED__ = true; } catch (e) {}

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

// Avoid starting long-running background sync tasks during tests to prevent
// unhandled rejections and flaky worker shutdowns. Tests mock/replace network
// behavior and do not need the auto sync running.
if (process.env.NODE_ENV !== 'test') {
  try { syncService.startAutoSync(apiSend); } catch (e) { console.warn('syncService auto-start failed:', e); }
}