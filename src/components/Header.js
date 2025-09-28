import React from 'react';

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
  const mood = soulState?.currentMood ?? 'calm';
  const energyRaw = Number(soulState?.energyLevel ?? 0);
  const energy = Number.isFinite(energyRaw) ? energyRaw : 0;
  const energyTitle = typeof energy === 'number' ? `${energy.toFixed(0)}%` : `${energy}%`;

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>AION</h1>
        <div className="soul-status" aria-label="Soul status">
          <span className={`mood ${mood}`}>{mood}</span>
          <div className="energy-bar" title={`Energy: ${energyTitle}`}>
            <div
              className="energy-fill"
              style={{ width: `${Math.max(0, Math.min(100, energy))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Centered brand: single source of truth for the AION wordmark */}
      <div className="header-center">
        <div className="brand">
          <span className="brand-logo" aria-hidden={false}>AION</span>
          <h1 className="sr-only">AION</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="connection-controls" aria-hidden={false}>
          <button className={`icon-indicator ${isOnline ? 'online' : 'offline'}`} title={isOnline ? 'Online' : 'Offline'} aria-pressed={isOnline} type="button">
            {isOnline ? '●' : '○'}
          </button>
          <button className="btn-sync" onClick={onSync} title="Sync queued items" type="button">Sync</button>
          <label className="offline-toggle">
            <input type="checkbox" checked={offlineEnabled} onChange={(e) => onToggleOffline(e.target.checked)} /> Offline
          </label>
        </div>
        <button
          className={`icon-button ${showSoulPanel ? 'active' : ''}`}
          onClick={() => setShowSoulPanel(!showSoulPanel)}
          title="Soul Panel"
          aria-pressed={showSoulPanel}
          type="button"
        >
          <i className="icon-soul" aria-hidden="true"></i>
        </button>
        <button
          className={`icon-button ${showSettings ? 'active' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
          aria-pressed={showSettings}
          type="button"
        >
          <i className="icon-settings" aria-hidden="true"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;