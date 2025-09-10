// components/panels/SystemPanel.js
import React from 'react';

const SystemPanel = ({ systemStatus = {}, onRequestAccess, onSystemAction }) => {
  const stats = systemStatus?.stats || { cpu: 0, memory: 0, network: false };
  const resources = systemStatus?.resources || {};
  const permissions = systemStatus?.permissions || {};

  return (
    <div className="system-panel">
      <h3>System Integration</h3>
      <div className="system-metaphor">{systemStatus?.metaphor ?? ''}</div>
      
      <div className="system-status">
        <h4>Current System Status</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">CPU Usage:</span>
            <span className="value">{Number(stats.cpu ?? 0).toFixed(1)}%</span>
          </div>
          <div className="status-item">
            <span className="label">Memory Usage:</span>
            <span className="value">{Number(stats.memory ?? 0).toFixed(1)}%</span>
          </div>
          <div className="status-item">
            <span className="label">Network:</span>
            <span className="value">{stats.network ? 'Online' : 'Offline'}</span>
          </div>
          <div className="status-item">
            <span className="label">Access Level:</span>
            <span className="value">{systemStatus?.accessLevel ?? 'unknown'}</span>
          </div>
        </div>
      </div>
      
      <div className="system-actions">
        <h4>System Actions</h4>
        <div className="action-buttons">
          <button 
            onClick={() => onSystemAction && onSystemAction('beep')}
            disabled={!permissions.basicControl}
            type="button"
          >
            Test Sound
          </button>
          
          <button 
            onClick={() => onSystemAction && onSystemAction('vibrate')}
            disabled={!permissions.basicControl || !resources.vibration}
            type="button"
          >
            Test Vibration
          </button>
          
          <button 
            onClick={() => onRequestAccess && onRequestAccess()}
            type="button"
          >
            Request More Access
          </button>
        </div>
      </div>
      
      <div className="system-permissions">
        <h4>Current Permissions</h4>
        <ul>
          <li>Monitor System: {permissions.monitor ? '✓' : '✗'}</li>
          <li>Send Notifications: {permissions.notify ? '✓' : '✗'}</li>
          <li>Basic Control: {permissions.basicControl ? '✓' : '✗'}</li>
          <li>File Access: {permissions.fileAccess ? '✓' : '✗'}</li>
          <li>Process Management: {permissions.processManagement ? '✓' : '✗'}</li>
        </ul>
      </div>
    </div>
  );
};

export default SystemPanel;