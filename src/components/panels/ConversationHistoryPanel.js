import React from 'react';

const ConversationHistoryPanel = () => {
  return (
    <div className="enterprise-panel">
      <div className="panel-header">
        <h2>Conversation History</h2>
        <p className="subtitle">Review and resume past sessions</p>
      </div>
      <div className="panel-content">
        <div className="empty-state">
          <h3>No Previous Conversations</h3>
          <p>Your chat history will be automatically saved here.</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistoryPanel;
