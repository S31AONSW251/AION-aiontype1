import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from './ErrorBoundary';
import "./App.css";
import syncService from './services/syncService';
import { enqueue } from './lib/offlineQueue';

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
      <App />
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
    const res = await fetch(`/api/${type}`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    // enqueue and rethrow so syncService can backoff
    await enqueue(type, payload);
    throw err;
  }
};

syncService.startAutoSync(apiSend);