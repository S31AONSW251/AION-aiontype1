import React from 'react';

const ProjectIntelligencePanel = () => {
  return (
    <div className="enterprise-panel">
      <div className="panel-header">
        <h2>Project Intelligence</h2>
        <p className="subtitle">Analyze codebase, structure, and context</p>
      </div>
      <div className="panel-content">
        <div className="empty-state">
          <h3>No Active Project</h3>
          <p>Connect a repository or upload a folder to start indexing and generating insights.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectIntelligencePanel;
