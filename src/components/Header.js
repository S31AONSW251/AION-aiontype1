import React, { useEffect, useState } from 'react';

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
  const [providerStatus, setProviderStatus] = useState({});

  useEffect(() => {
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
    };
  }, []);

  return (
    <header className="app-header header-reordered">
      <div className="header-left">
        <label htmlFor="mobile-sidebar-toggle" className="mobile-hamburger-btn" aria-label="Toggle Navigation">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </label>
      </div>

      <div className="header-center">
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
          <span className="settings-label">Settings</span>
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
