import React, { useState } from 'react';
import './FloatingDashboardButton.css';
import AdvancedAIONDashboard from './AdvancedAIONDashboard';

/**
 * Floating Dashboard Button - Premium floating action button
 * Opens the advanced AION dashboard with translate & deep search features
 */
const FloatingDashboardButton = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="floating-button-container">
        <button
          className={`floating-button ${isHovered ? 'hovered' : ''}`}
          onClick={toggleDashboard}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title="Open AION Advanced Dashboard"
        >
          {/* Brain Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="floating-icon"
          >
            <path d="M9.5 2a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 3.5-3.5 3.5 3.5 0 0 1 3.5 3.5v10a7 7 0 1 1-14 0V5.5A3.5 3.5 0 0 1 9.5 2Z" />
          </svg>

          {/* Pulse Ring */}
          <span className="pulse-ring"></span>
          <span className="pulse-ring pulse-ring-2"></span>

          {/* Tooltip */}
          <span className="floating-tooltip">AION Dashboard</span>
        </button>

        {/* Floating Badge */}
        <div className="floating-badge">
          <span className="badge-text">AI</span>
          <span className="badge-pulse"></span>
        </div>
      </div>

      {/* Dashboard Modal */}
      {isDashboardOpen && (
        <AdvancedAIONDashboard onClose={() => setIsDashboardOpen(false)} />
      )}
    </>
  );
};

export default FloatingDashboardButton;
