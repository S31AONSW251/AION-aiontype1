import React, { useEffect, useState } from 'react';
import syncService from '../services/syncService';
import { pendingCount } from '../lib/offlineQueue';

const Header = ({
  soulState = {},
  setShowSettings = () => {},
  showSettings = false,
  showSoulPanel = false,
  setShowSoulPanel = () => {},
  isOnline = true,
  onSync = () => {},
  offlineEnabled = false,
  onToggleOffline = () => {}
}) => {
  // mood and energy values are available on soulState if needed for UI enhancements

  const [online, setOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [providerStatus, setProviderStatus] = useState({});

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const refreshCount = async () => setQueueCount(await pendingCount());
    refreshCount();
    syncService.onQueueChange(refreshCount);

    let stopped = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status/providers');
        if (!res.ok) return;
        const j = await res.json();
        if (j && j.providers) setProviderStatus(j.providers);
      } catch (e) {
        // ignore network errors
      }
    };
    fetchStatus();
    const pid = setInterval(() => { if (!stopped) fetchStatus(); }, 10000);

    return () => {
      stopped = true;
      clearInterval(pid);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      syncService.offQueueChange(refreshCount);
    };
  }, []);

  return (
    <header className="app-header header-reordered">
      <div className="header-left">
        {/* Online/offline icon moved to left per user request */}
        <button
          className={`icon-button left-online ${online ? 'online' : 'offline'}`}
          title={online ? 'Online' : 'Offline'}
          aria-pressed={online}
          type="button"
          onClick={() => onToggleOffline(!offlineEnabled)}
        >
          <span className="sr-only">{online ? 'Online' : 'Offline'}</span>
          {online ? '●' : '○'}
        </button>
        {queueCount > 0 && (
          <div className="queue-pill left-pill" title={`${queueCount} queued`} aria-hidden="true">{queueCount}</div>
        )}
      </div>

      <div className="header-center">
        {/* Centered AION wordmark */}
        <div className="brand-center">
          <span className="brand-logo" aria-hidden="false">AION</span>
          <h1 className="sr-only">AION</h1>
        </div>
      </div>

      <div className="header-right">
        <button
          className={`icon-button ${showSettings ? 'active' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
          aria-pressed={showSettings}
          type="button"
        >
          <i className="icon-settings" aria-hidden="true"></i>
          <span className="sr-only">Settings</span>
        </button>
      </div>
      {providerStatus && Object.keys(providerStatus).length > 0 && (
        Object.values(providerStatus).some(s => !s.online) ? (
          <div className="provider-banner" role="status" aria-live="polite">
            <strong>Warning:</strong> One or more model providers are offline. Check the status page for details.
          </div>
        ) : null
      )}
    </header>
  );
};

export default Header;