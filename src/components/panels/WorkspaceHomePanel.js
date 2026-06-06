import React from 'react';
import '../../styles/aion-enterprise-premium.css';

const WorkspaceHomePanel = ({ setTab }) => {
  return (
    <div className="enterprise-panel workspace-home-panel workspace-clean-onboarding">
      <div className="workspace-welcome-content">
        <h1 className="welcome-aion-text">hello i am aion</h1>
        <button className="workspace-chat-navigate-btn" onClick={() => setTab('chat')}>
          chat to aion
        </button>
      </div>
    </div>
  );
};

export default WorkspaceHomePanel;
