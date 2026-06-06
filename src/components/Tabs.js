import React from 'react';

const Tabs = ({ activeTab, setActiveTab, settings, mathSolution, isMathQuery, userInput, setShowSettings, showSettings }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const cb = document.getElementById("mobile-sidebar-toggle");
    if (cb) {
      cb.checked = false;
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    const cb = document.getElementById("mobile-sidebar-toggle");
    if (cb) {
      cb.checked = false;
    }
  };

  return (
    <nav className="tab-container enterprise-sidebar" aria-label="AION workspace">
      <input type="checkbox" id="mobile-sidebar-toggle" className="mobile-sidebar-checkbox" style={{ display: 'none' }} />
      <label htmlFor="mobile-sidebar-toggle" className="mobile-sidebar-backdrop" aria-label="Close menu"></label>
      
      <div className="sidebar-brand-block">
        <div className="brand-logo-container">
          <span className="brand-logo-text">AION</span>
          <span className="brand-logo-sub">OS</span>
        </div>
        <label htmlFor="mobile-sidebar-toggle" className="mobile-sidebar-close-btn" aria-label="Close menu">×</label>
        <div className="sidebar-status-pill">
          <span className="status-dot"></span>
          <span className="status-text">SYSTEM ACTIVE</span>
        </div>
      </div>

      <div className="sidebar-scrollable-content">
        <div className="sidebar-group">
          <div className="sidebar-section-title">Home</div>
          <button
            className={`tab-button ${activeTab === "workspace" ? 'active' : ''}`}
            onClick={() => handleTabClick("workspace")}
          >
            <span className="tab-icon">⌂</span>
            <span className="tab-label">Workspace</span>
          </button>
          <button
            className={`tab-button ${activeTab === "chat" ? 'active' : ''}`}
            onClick={() => handleTabClick("chat")}
          >
            <span className="tab-icon">⚡</span>
            <span className="tab-label">Chat Interface</span>
          </button>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-section-title">Intelligence</div>
          <button
            className={`tab-button ${activeTab === "projectIntelligence" ? 'active' : ''}`}
            onClick={() => handleTabClick("projectIntelligence")}
          >
            <span className="tab-icon">◈</span>
            <span className="tab-label">Project Intelligence</span>
          </button>
          <button
            className={`tab-button ${activeTab === "upgradeAgent" ? 'active' : ''}`}
            onClick={() => handleTabClick("upgradeAgent")}
          >
            <span className="tab-icon">▲</span>
            <span className="tab-label">Upgrade Agent</span>
          </button>
          {settings.enableWebSearch && (
            <button
              className={`tab-button ${activeTab === "search" ? 'active' : ''}`}
              onClick={() => handleTabClick("search")}
            >
              <span className="tab-icon">⌥</span>
              <span className="tab-label">Web Search</span>
            </button>
          )}
        </div>

        <div className="sidebar-group">
          <div className="sidebar-section-title">System & Agents</div>
          <button
            className={`tab-button ${activeTab === "taskScheduler" ? 'active' : ''}`}
            onClick={() => handleTabClick("taskScheduler")}
          >
            <span className="tab-icon">⏰</span>
            <span className="tab-label">Task Scheduler</span>
          </button>
          <button
            className={`tab-button ${activeTab === "localModelStatus" ? 'active' : ''}`}
            onClick={() => handleTabClick("localModelStatus")}
          >
            <span className="tab-icon">⚙</span>
            <span className="tab-label">Local Models</span>
          </button>
          <button
            className={`tab-button ${activeTab === "systemActivity" ? 'active' : ''}`}
            onClick={() => handleTabClick("systemActivity")}
          >
            <span className="tab-icon">☱</span>
            <span className="tab-label">System Activity</span>
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? 'active' : ''}`}
            onClick={() => handleTabClick("history")}
          >
            <span className="tab-icon">⎋</span>
            <span className="tab-label">History</span>
          </button>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-section-title">Legacy / Core</div>
          <button
            className={`tab-button ${activeTab === "soul" ? 'active' : ''}`}
            onClick={() => handleTabClick("soul")}
          >
            <span className="tab-icon">⚛</span>
            <span className="tab-label">Soul</span>
          </button>
          <button
            className={`tab-button ${activeTab === "memories" ? 'active' : ''}`}
            onClick={() => handleTabClick("memories")}
          >
            <span className="tab-icon">▥</span>
            <span className="tab-label">Memories</span>
          </button>
          {settings.enableMathSolving && (
            <button
              className={`tab-button ${activeTab === "math" ? 'active' : ''}`}
              onClick={() => {
                handleTabClick("math");
              }}
              disabled={!mathSolution && !isMathQuery(userInput)}
            >
              <span className="tab-icon">√</span>
              <span className="tab-label">Math</span>
            </button>
          )}
          {settings.enableQuantum && (
            <button
              className={`tab-button ${activeTab === "quantum" ? 'active' : ''}`}
              onClick={() => handleTabClick("quantum")}
            >
              <span className="tab-icon">✇</span>
              <span className="tab-label">Quantum</span>
            </button>
          )}
          {settings.enableNeural && (
            <button
              className={`tab-button ${activeTab === "neural" ? 'active' : ''}`}
              onClick={() => handleTabClick("neural")}
            >
              <span className="tab-icon">🧠</span>
              <span className="tab-label">Neural</span>
            </button>
          )}
          {settings.enableCreativeGeneration && (
            <button
              className={`tab-button ${activeTab === "creative" ? 'active' : ''}`}
              onClick={() => handleTabClick("creative")}
            >
              <span className="tab-icon">✦</span>
              <span className="tab-label">Creative</span>
            </button>
          )}
          {settings.goalTracking && (
            <button
              className={`tab-button ${activeTab === "goals" ? 'active' : ''}`}
              onClick={() => handleTabClick("goals")}
            >
              <span className="tab-icon">🎯</span>
              <span className="tab-label">Goals</span>
            </button>
          )}
          {settings.knowledgeBase && (
            <button
              className={`tab-button ${activeTab === "knowledge" ? 'active' : ''}`}
              onClick={() => handleTabClick("knowledge")}
            >
              <span className="tab-icon">▤</span>
              <span className="tab-label">Knowledge</span>
            </button>
          )}
          <button
            className={`tab-button ${activeTab === "fileUpload" ? 'active' : ''}`}
            onClick={() => handleTabClick("fileUpload")}
          >
            <span className="tab-icon">📁</span>
            <span className="tab-label">File Analysis</span>
          </button>
          {settings.enableProceduralMemory && (
            <button
              className={`tab-button ${activeTab === 'procedures' ? 'active' : ''}`}
              onClick={() => handleTabClick('procedures')}
            >
              <span className="tab-icon">⎔</span>
              <span className="tab-label">Procedures</span>
            </button>
          )}
        </div>
        <div className="sidebar-group settings-group" style={{ marginTop: 'auto', borderTop: '1px solid var(--enterprise-border)', paddingTop: '12px' }}>
          <button
            className={`tab-button ${showSettings ? 'active' : ''}`}
            onClick={handleSettingsClick}
          >
            <span className="tab-icon">⚙</span>
            <span className="tab-label">Settings</span>
          </button>
        </div>
      </div>

    </nav>
  );
};

export default Tabs;
