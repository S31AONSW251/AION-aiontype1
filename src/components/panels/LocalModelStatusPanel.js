import React from 'react';

const LocalModelStatusPanel = () => {
  return (
    <div className="enterprise-panel">
      <div className="panel-header">
        <h2>Local Model Status</h2>
        <p className="subtitle">Hardware utilization and model telemetry</p>
      </div>
      <div className="workspace-stats">
        <div className="stat-box">
          <span className="stat-value">0%</span>
          <span className="stat-label">GPU Usage</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">Idle</span>
          <span className="stat-label">Inference Status</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">4096</span>
          <span className="stat-label">Context Window</span>
        </div>
      </div>
    </div>
  );
};

export default LocalModelStatusPanel;
