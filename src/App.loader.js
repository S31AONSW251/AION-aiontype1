import React, { Suspense, useEffect, useState } from 'react';
import { apiFetch } from './lib/fetchHelper';

// Load the full App (restores Chat and all panels) so we mount the complete UI during normal runs.
const LazyApp = React.lazy(() => import('./App'));

function ImportErrorReport(err, phase = 'dynamic-import') {
  try {
    apiFetch('/log-client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err), stack: err && err.stack ? err.stack : null, when: phase })
    }).catch(() => {});
  } catch (e) {}
}

export default function AppLoader() {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      import('./App.full').catch((err) => {
        console.error('Dynamic import failed:', err);
        setHasError(true);
        setErrorMsg(String(err));
        ImportErrorReport(err, 'dynamic-import-warmup');
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      React.createElement('div', { style: { padding: 24, color: '#900', background: '#fff' } }, [
        React.createElement('h2', { key: 'h' }, 'Application failed to load'),
        React.createElement('pre', { key: 'p', style: { whiteSpace: 'pre-wrap' } }, errorMsg || 'Unknown import error'),
        React.createElement('button', { key: 'r', onClick: () => window.location.reload() }, 'Reload')
      ])
    );
  }

  return (
    React.createElement(Suspense, { fallback: React.createElement('div', { style: { padding: 24 } }, 'Loading AION...') },
      React.createElement(LazyApp, null)
    )
  );
}
