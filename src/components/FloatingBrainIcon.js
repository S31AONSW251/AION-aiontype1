import React, { useState } from 'react';
import './FloatingBrainIcon.css';
import AIONUltraDashboard from './AIONUltraDashboard';

/**
 * Floating Brain Icon - Premium floating action button
 * Opens the AION Ultra Dashboard as a modal when clicked
 */
const FloatingBrainIcon = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  return (
    <>
      {/* Floating Brain Button */}
      <div className="floating-brain-container">
        <button
          className={`floating-brain-button ${isHovered ? 'hovered' : ''} ${isDashboardOpen ? 'active' : ''}`}
          onClick={toggleDashboard}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title="Open AION Dashboard"
          aria-label="Open AION Dashboard"
          aria-pressed={isDashboardOpen}
        >
          {/* Brain Icon SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="brain-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Brain shape */}
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>

          {/* Pulse animation rings */}
          <span className="brain-pulse-ring"></span>
          <span className="brain-pulse-ring brain-pulse-ring-2"></span>
          <span className="brain-pulse-ring brain-pulse-ring-3"></span>

          {/* Tooltip */}
          <span className="brain-tooltip">
            {isDashboardOpen ? 'Close Dashboard' : 'Open Dashboard'}
          </span>
        </button>

        {/* Floating Status Badge */}
        <div className={`brain-badge ${isDashboardOpen ? 'active' : ''}`}>
          <span className="badge-dot"></span>
        </div>
      </div>

      {/* Dashboard Modal - Opens in overlay */}
      {isDashboardOpen && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-container">
            <button
              className="dashboard-close-button"
              onClick={toggleDashboard}
              title="Close Dashboard"
              aria-label="Close Dashboard"
            >
              ✕
            </button>
            <AIONUltraDashboard />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingBrainIcon;
