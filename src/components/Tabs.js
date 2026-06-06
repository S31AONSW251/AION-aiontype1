import React from 'react';

const Tabs = ({ activeTab, setActiveTab, settings, mathSolution, isMathQuery, userInput, setShowSettings, showSettings }) => {
  return (
    <nav className="tab-container enterprise-sidebar" aria-label="AION workspace">
      <input type="checkbox" id="mobile-sidebar-toggle" className="mobile-sidebar-checkbox" style={{ display: 'none' }} />
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
            onClick={() => setActiveTab("workspace")}
          >
            <span className="tab-icon">⌂</span>
            <span className="tab-label">Workspace</span>
          </button>
          <button
            className={`tab-button ${activeTab === "chat" ? 'active' : ''}`}
            onClick={() => setActiveTab("chat")}
          >
            <span className="tab-icon">⚡</span>
            <span className="tab-label">Chat Interface</span>
          </button>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-section-title">Intelligence</div>
          <button
            className={`tab-button ${activeTab === "projectIntelligence" ? 'active' : ''}`}
            onClick={() => setActiveTab("projectIntelligence")}
          >
            <span className="tab-icon">◈</span>
            <span className="tab-label">Project Intelligence</span>
          </button>
          <button
            className={`tab-button ${activeTab === "upgradeAgent" ? 'active' : ''}`}
            onClick={() => setActiveTab("upgradeAgent")}
          >
            <span className="tab-icon">▲</span>
            <span className="tab-label">Upgrade Agent</span>
          </button>
          {settings.enableWebSearch && (
            <button
              className={`tab-button ${activeTab === "search" ? 'active' : ''}`}
              onClick={() => setActiveTab("search")}
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
            onClick={() => setActiveTab("taskScheduler")}
          >
            <span className="tab-icon">⏰</span>
            <span className="tab-label">Task Scheduler</span>
          </button>
          <button
            className={`tab-button ${activeTab === "localModelStatus" ? 'active' : ''}`}
            onClick={() => setActiveTab("localModelStatus")}
          >
            <span className="tab-icon">⚙</span>
            <span className="tab-label">Local Models</span>
          </button>
          <button
            className={`tab-button ${activeTab === "systemActivity" ? 'active' : ''}`}
            onClick={() => setActiveTab("systemActivity")}
          >
            <span className="tab-icon">☱</span>
            <span className="tab-label">System Activity</span>
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? 'active' : ''}`}
            onClick={() => setActiveTab("history")}
          >
            <span className="tab-icon">⎋</span>
            <span className="tab-label">History</span>
          </button>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-section-title">Legacy / Core</div>
          <button
            className={`tab-button ${activeTab === "soul" ? 'active' : ''}`}
            onClick={() => setActiveTab("soul")}
          >
            <span className="tab-icon">⚛</span>
            <span className="tab-label">Soul</span>
          </button>
          <button
            className={`tab-button ${activeTab === "memories" ? 'active' : ''}`}
            onClick={() => setActiveTab("memories")}
          >
            <span className="tab-icon">▥</span>
            <span className="tab-label">Memories</span>
          </button>
          {settings.enableMathSolving && (
            <button
              className={`tab-button ${activeTab === "math" ? 'active' : ''}`}
              onClick={() => {
                setActiveTab("math");
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
              onClick={() => setActiveTab("quantum")}
            >
              <span className="tab-icon">✇</span>
              <span className="tab-label">Quantum</span>
            </button>
          )}
          {settings.enableNeural && (
            <button
              className={`tab-button ${activeTab === "neural" ? 'active' : ''}`}
              onClick={() => setActiveTab("neural")}
            >
              <span className="tab-icon">🧠</span>
              <span className="tab-label">Neural</span>
            </button>
          )}
          {settings.enableCreativeGeneration && (
            <button
              className={`tab-button ${activeTab === "creative" ? 'active' : ''}`}
              onClick={() => setActiveTab("creative")}
            >
              <span className="tab-icon">✦</span>
              <span className="tab-label">Creative</span>
            </button>
          )}
          {settings.goalTracking && (
            <button
              className={`tab-button ${activeTab === "goals" ? 'active' : ''}`}
              onClick={() => setActiveTab("goals")}
            >
              <span className="tab-icon">🎯</span>
              <span className="tab-label">Goals</span>
            </button>
          )}
          {settings.knowledgeBase && (
            <button
              className={`tab-button ${activeTab === "knowledge" ? 'active' : ''}`}
              onClick={() => setActiveTab("knowledge")}
            >
              <span className="tab-icon">▤</span>
              <span className="tab-label">Knowledge</span>
            </button>
          )}
          <button
            className={`tab-button ${activeTab === "fileUpload" ? 'active' : ''}`}
            onClick={() => setActiveTab("fileUpload")}
          >
            <span className="tab-icon">📁</span>
            <span className="tab-label">File Analysis</span>
          </button>
          {settings.enableProceduralMemory && (
            <button
              className={`tab-button ${activeTab === 'procedures' ? 'active' : ''}`}
              onClick={() => setActiveTab('procedures')}
            >
              <span className="tab-icon">⎔</span>
              <span className="tab-label">Procedures</span>
            </button>
          )}
        </div>
        <div className="sidebar-group settings-group" style={{ marginTop: 'auto', borderTop: '1px solid var(--enterprise-border)', paddingTop: '12px' }}>
          <button
            className={`tab-button ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
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
