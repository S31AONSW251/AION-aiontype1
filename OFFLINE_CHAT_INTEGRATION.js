/**
 * AION ULTRA - Offline Chat Integration Example
 * Shows how to integrate offline responses into your chat component
 */

/**
 * EXAMPLE 1: Simple Chat Handler with Offline Support
 * 
 * This shows how to modify your existing chat message handler
 * to support offline mode with intelligent fallback.
 */
export async function example_simpleChatWithOffline(userInput) {
  const offlineManager = window.OFFLINE_RESPONSE_MANAGER;
  
  try {
    // If online, try server first
    if (navigator.onLine) {
      console.log('🌐 Trying server...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          response: data.message,
          source: 'server',
          confidence: 0.95
        };
      }
    }
  } catch (error) {
    console.warn('Server request failed:', error);
  }

  // Fallback to offline metadata
  console.log('📚 Using offline metadata...');
  const offline_response = await offlineManager.generateOfflineResponse(userInput);
  
  return {
    response: offline_response.response,
    source: 'offline',
    confidence: offline_response.confidence,
    offline_mode: true
  };
}

/**
 * EXAMPLE 2: Advanced Chat Handler with Queueing
 * 
 * This handler queues requests when offline and syncs them later.
 */
export async function example_advancedChatWithQueue(userInput) {
  const offlineManager = window.OFFLINE_RESPONSE_MANAGER;
  const isOnline = navigator.onLine && offlineManager.is_online;

  if (isOnline) {
    try {
      // Try server request
      const serverResponse = await attemptServerRequest(userInput);
      return {
        response: serverResponse,
        source: 'server',
        confidence: 0.95,
        queued: false
      };
    } catch (error) {
      console.warn('Server failed, queuing for later sync');
      
      // Queue for later sync
      return new Promise((resolve) => {
        offlineManager.queueOfflineRequest(userInput, (synced_response) => {
          resolve({
            response: synced_response.response,
            source: 'server_synced',
            confidence: synced_response.confidence,
            queued: true,
            synced_at: new Date()
          });
        });

        // Meanwhile, provide offline response immediately
        offlineManager.generateOfflineResponse(userInput).then(offline => {
          resolve({
            response: offline.response,
            source: 'offline_cached',
            confidence: offline.confidence,
            queued: true,
            note: 'Will sync with server response when connection restored'
          });
        });
      });
    }
  } else {
    // Offline mode
    console.log('🔴 OFFLINE - Using local metadata');
    
    const offline_response = await offlineManager.generateOfflineResponse(userInput);
    
    // Queue for sync when back online
    offlineManager.queueOfflineRequest(userInput, (result) => {
      console.log('✅ Synced:', result);
      // Could emit event to update chat with better response
    });

    return {
      response: offline_response.response,
      source: 'offline',
      confidence: offline_response.confidence,
      offline_mode: true,
      will_sync: true
    };
  }
}

/**
 * EXAMPLE 3: Chat Message Component Integration
 * 
 * React component showing how to display offline responses with indicators
 */
export const ChatMessageExample = ({ message, isOffline, confidence, source }) => {
  const getBadgeColor = () => {
    if (source === 'server') return '#00d4ff'; // Quantum cyan
    if (source === 'offline_cached') return '#b24bff'; // Purple
    if (confidence > 0.85) return '#00ff88'; // Green
    if (confidence > 0.70) return '#ffaa00'; // Orange
    return '#ff0066'; // Red
  };

  const getBadgeText = () => {
    if (source === 'server') return '🌐 Live';
    if (isOffline) return '📚 Offline';
    if (source === 'offline_cached') return '💾 Cached';
    return '🤖 AI';
  };

  return (
    <div className="chat-message ai-message">
      <div className="message-content">
        <p>{message}</p>
      </div>
      <div className="message-meta">
        <span 
          className="source-badge" 
          style={{ 
            backgroundColor: getBadgeColor(),
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#fff'
          }}
        >
          {getBadgeText()}
        </span>
        {confidence && (
          <span className="confidence-score">
            {(confidence * 100).toFixed(0)}% confident
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * EXAMPLE 4: Full Chat Component Hook
 * 
 * Complete example of a React hook handling all offline scenarios
 */
export function useAionChat() {
  const [messages, setMessages] = React.useState([]);
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = React.useState(false);

  React.useEffect(() => {
    // Setup online/offline listeners
    const handleOnline = () => {
      setIsOffline(false);
      console.log('🟢 ONLINE - Syncing requests...');
      // Trigger sync
      window.OFFLINE_RESPONSE_MANAGER.syncOfflineRequests();
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log('🔴 OFFLINE - Using local metadata...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const sendMessage = async (userInput) => {
    // Add user message
    setMessages(prev => [...prev, {
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    }]);

    try {
      // Get response
      const offlineManager = window.OFFLINE_RESPONSE_MANAGER;
      const result = await offlineManager.processInput(userInput);

      // Add AI response
      setMessages(prev => [...prev, {
        text: result.response,
        sender: 'ai',
        timestamp: new Date(),
        source: result.source,
        confidence: result.confidence,
        offline: isOffline
      }]);

    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        text: 'Sorry, I encountered an error processing your message.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      }]);
    }
  };

  return {
    messages,
    isOffline,
    isSyncing,
    sendMessage,
    clearMessages: () => setMessages([])
  };
}

/**
 * EXAMPLE 5: Offline Status Indicator Component
 * 
 * React component to display offline status prominently
 */
export const OfflineStatusIndicator = () => {
  const [status, setStatus] = React.useState(null);

  React.useEffect(() => {
    const offlineManager = window.OFFLINE_RESPONSE_MANAGER;
    
    const updateStatus = () => {
      setStatus(offlineManager.getDetailedStatus());
    };

    updateStatus();
    
    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    // Update on network change
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!status) return null;

  return (
    <div className="offline-status-indicator">
      <div className={`status-bar ${status.online_status.is_online ? 'online' : 'offline'}`}>
        <span className="status-icon">
          {status.online_status.is_online ? '🟢' : '🔴'}
        </span>
        
        <span className="status-text">
          {status.online_status.is_online ? 'Online' : 'Offline Mode'}
        </span>
        
        <span className="network-type">
          {status.online_status.network_type && `(${status.online_status.network_type})`}
        </span>
        
        <span className="cache-info">
          {status.cache_status.total_cached} cached
        </span>
        
        {status.sync_status.pending_requests > 0 && (
          <span className="sync-info">
            {status.sync_status.pending_requests} pending
          </span>
        )}
      </div>

      <style>{`
        .offline-status-indicator {
          padding: 8px 12px;
          background: #050810;
          border-bottom: 2px solid var(--status-color);
          font-size: 12px;
          color: #fff;
          font-family: 'Courier New', monospace;
        }

        .status-bar {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .status-bar.online {
          --status-color: #00ff88;
        }

        .status-bar.offline {
          --status-color: #ff0066;
        }

        .status-icon {
          font-size: 14px;
        }

        .status-text {
          font-weight: bold;
          color: var(--status-color);
        }

        .network-type, .cache-info, .sync-info {
          opacity: 0.8;
          font-size: 11px;
        }

        .sync-info {
          color: #ffaa00;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/**
 * EXAMPLE 6: Settings Panel for Offline Features
 * 
 * React component for user control over offline features
 */
export const OfflineSettingsPanel = () => {
  const [cacheSize, setCacheSize] = React.useState(0);
  const [settings, setSettings] = React.useState({
    use_offline_mode: true,
    prefer_server: true,
    auto_cache: true,
    cache_expiry_hours: 24,
    sync_on_reconnect: true
  });

  React.useEffect(() => {
    // Get initial cache size
    const manager = window.OFFLINE_RESPONSE_MANAGER;
    const status = manager.getDetailedStatus();
    setCacheSize(status.cache_status.total_cached);
  }, []);

  const handleClearCache = () => {
    const manager = window.OFFLINE_RESPONSE_MANAGER;
    const result = manager.clearOldCache(0); // Clear all
    setCacheSize(0);
    alert(`✅ Cleared ${result.cleared} cache entries`);
  };

  const handleExportCache = () => {
    const manager = window.OFFLINE_RESPONSE_MANAGER;
    const backup = manager.exportCache();
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aion-cache-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="offline-settings-panel">
      <h3>🔌 Offline Settings</h3>

      <div className="settings-section">
        <h4>Cache Management</h4>
        <div className="setting">
          <label>Cached Responses: <strong>{cacheSize}</strong></label>
          <button onClick={handleExportCache} className="btn-secondary">
            💾 Export Cache
          </button>
          <button onClick={handleClearCache} className="btn-danger">
            🗑️ Clear Cache
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h4>Offline Behavior</h4>
        
        <div className="setting">
          <label>
            <input 
              type="checkbox" 
              checked={settings.use_offline_mode}
              onChange={(e) => setSettings({
                ...settings, 
                use_offline_mode: e.target.checked
              })}
            />
            Enable Offline Mode
          </label>
        </div>

        <div className="setting">
          <label>
            <input 
              type="checkbox" 
              checked={settings.prefer_server}
              onChange={(e) => setSettings({
                ...settings, 
                prefer_server: e.target.checked
              })}
            />
            Prefer Server When Available
          </label>
        </div>

        <div className="setting">
          <label>
            <input 
              type="checkbox" 
              checked={settings.auto_cache}
              onChange={(e) => setSettings({
                ...settings, 
                auto_cache: e.target.checked
              })}
            />
            Auto Cache Responses
          </label>
        </div>

        <div className="setting">
          <label>
            Cache Expiry (hours):
            <input 
              type="number" 
              value={settings.cache_expiry_hours}
              onChange={(e) => setSettings({
                ...settings, 
                cache_expiry_hours: parseInt(e.target.value)
              })}
              min="1"
              max="168"
            />
          </label>
        </div>

        <div className="setting">
          <label>
            <input 
              type="checkbox" 
              checked={settings.sync_on_reconnect}
              onChange={(e) => setSettings({
                ...settings, 
                sync_on_reconnect: e.target.checked
              })}
            />
            Auto Sync on Reconnect
          </label>
        </div>
      </div>

      <style>{`
        .offline-settings-panel {
          background: linear-gradient(135deg, #050810, #0a1a30);
          border: 2px solid #00d4ff;
          border-radius: 12px;
          padding: 20px;
          color: #fff;
          font-family: 'Courier New', monospace;
        }

        .offline-settings-panel h3 {
          margin-top: 0;
          color: #00d4ff;
          border-bottom: 2px solid #b24bff;
          padding-bottom: 10px;
        }

        .settings-section {
          margin: 15px 0;
        }

        .settings-section h4 {
          color: #b24bff;
          margin: 10px 0 8px 0;
          font-size: 12px;
          text-transform: uppercase;
        }

        .setting {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0;
          flex-wrap: wrap;
        }

        .setting label {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .setting input[type="checkbox"] {
          cursor: pointer;
        }

        .setting input[type="number"] {
          width: 60px;
          padding: 4px;
          background: #1a2a3a;
          border: 1px solid #00d4ff;
          color: #fff;
          border-radius: 4px;
        }

        .btn-secondary, .btn-danger {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: bold;
          transition: all 0.3s;
        }

        .btn-secondary {
          background: #b24bff;
          color: #fff;
        }

        .btn-secondary:hover {
          background: #d066ff;
          box-shadow: 0 0 10px #b24bff;
        }

        .btn-danger {
          background: #ff0066;
          color: #fff;
        }

        .btn-danger:hover {
          background: #ff3385;
          box-shadow: 0 0 10px #ff0066;
        }
      `}</style>
    </div>
  );
};

/**
 * EXAMPLE 7: Offline Data Visualization
 * 
 * Component showing real-time offline statistics
 */
export const OfflineStatsPanel = () => {
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    const updateStats = () => {
      const manager = window.OFFLINE_RESPONSE_MANAGER;
      setStats(manager.getAnalytics());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="offline-stats-panel">
      <div className="stat">
        <span className="label">Total Cached</span>
        <span className="value">{stats.total_cached_responses}</span>
      </div>
      
      <div className="stat">
        <span className="label">Cache Hits</span>
        <span className="value">{stats.cached_hit_responses}</span>
      </div>
      
      <div className="stat">
        <span className="label">Hit Rate</span>
        <span className="value">{stats.cache_hit_rate}</span>
      </div>
      
      <div className="stat">
        <span className="label">Avg Confidence</span>
        <span className="value">{stats.average_confidence}</span>
      </div>
      
      <div className="stat">
        <span className="label">Pending Sync</span>
        <span className="value">{stats.sync_queue_size}</span>
      </div>

      <style>{`
        .offline-stats-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          padding: 10px;
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 8px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          border-left: 3px solid #00d4ff;
        }

        .label {
          font-size: 11px;
          color: #b24bff;
          text-transform: uppercase;
          font-weight: bold;
        }

        .value {
          font-size: 18px;
          color: #00ff88;
          font-weight: bold;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Attempt server request with timeout
 */
async function attemptServerRequest(userInput) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server timeout'));
    }, 5000);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    })
      .then(res => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(data => resolve(data.message))
      .catch(err => {
        clearTimeout(timeout);
        reject(err);
      });
  });
}

/**
 * Export for use in React components
 */
export default {
  example_simpleChatWithOffline,
  example_advancedChatWithQueue,
  ChatMessageExample,
  useAionChat,
  OfflineStatusIndicator,
  OfflineSettingsPanel,
  OfflineStatsPanel
};
