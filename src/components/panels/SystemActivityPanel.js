import React from 'react';

const SystemActivityPanel = () => {
  return (
    <div className="enterprise-panel">
      <div className="panel-header">
        <h2>System Activity</h2>
        <p className="subtitle">Real-time agent and system logs</p>
      </div>
      <div className="panel-content" style={{ minHeight: '300px', backgroundColor: '#0a0a0a' }}>
        <p style={{ color: '#00ff00', fontFamily: 'monospace', margin: 0, padding: '10px' }}>[SYSTEM] AION Enterprise initialized and ready.</p>
        <p style={{ color: '#00ff00', fontFamily: 'monospace', margin: 0, padding: '10px' }}>[SYSTEM] Monitoring background processes...</p>
      </div>
    </div>
  );
};

export default SystemActivityPanel;
