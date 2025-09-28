// Create this new file at ./components/panels/ProceduresPanel.js

import React from 'react';

const ProceduresPanel = ({ soulState, setActiveTab }) => {
  const procedures = soulState.proceduralMemory || {};

  return (
    <div className="panel-card procedures-panel">
      <div className="panel-header">
        <h3>Procedural Memory</h3>
        <button className="back-button" onClick={() => setActiveTab('chat')}>
          &larr; Back to Chat
        </button>
      </div>
      <p className="panel-description">
        This is a list of workflows and procedures I have learned. You can ask me to perform them by name.
      </p>
      {Object.keys(procedures).length > 0 ? (
        <div className="procedure-list">
          {Object.values(procedures).map((proc, index) => (
            <div key={index} className="procedure-item">
              <h4>{proc.name}</h4>
              <ol>
                {proc.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      ) : (
        <p>I haven't learned any procedures yet. Try teaching me one by saying "create a procedure for..."</p>
      )}
    </div>
  );
};

export default ProceduresPanel;