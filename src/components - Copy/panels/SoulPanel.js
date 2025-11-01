import React from 'react';
import './SoulPanel.css';

const SoulPanel = ({ soulState, performMeditation, tellStory, expressFeeling, settings, giveFeedback }) => {
  // Safely access soulState properties with default values
  const consciousnessLevel = soulState?.consciousnessLevel ?? 0;
  const energyLevel = soulState?.energyLevel ?? 0;
  const quantumEntanglement = soulState?.quantumEntanglement ?? 0;
  const neuralActivity = soulState?.neuralActivity ?? 0;
  const cognitiveLoad = soulState?.cognitiveLoad ?? 0;
  const emotionalStability = soulState?.emotionalStability ?? 0;
  const ethicalAlignment = soulState?.ethicalAlignment ?? 0;
  const systemHealth = soulState?.systemHealth ?? { status: 'optimal', alerts: [] };
  const values = soulState?.values ?? {};
  const emotionalState = soulState?.emotionalState ?? {};

  return (
    <div className="soul-panel">
      <div className="soul-panel-header">
        <div className="soul-title">
          <div className="soul-logo" aria-hidden="true">A</div>
          <div>
            <h2>Soul</h2>
            <div className="soul-sub">Consciousness, energy and inner metrics</div>
          </div>
        </div>
        <div className="soul-controls">{/* placeholder for future toggles */}</div>
      </div>

      <div className="soul-grid">
        {/* Core Soul Stats */}
        <div className="soul-stat">
          <div className="stat-head"><span className="stat-icon">✦</span><h4>Consciousness</h4></div>
          <div className="stat-value">{consciousnessLevel.toFixed(2)}</div>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${consciousnessLevel * 10}%` }}
            ></div>
          </div>
        </div>
        <div className="soul-stat">
          <div className="stat-head"><span className="stat-icon">⚡</span><h4>Energy</h4></div>
          <div className="stat-value">{energyLevel.toFixed(0)}%</div>
          <div className="stat-bar">
            <div
              className="energy-fill stat-fill"
              style={{ width: `${energyLevel}%` }}
            ></div>
          </div>
        </div>
        <div className="soul-stat">
          <div className="stat-head"><span className="stat-icon">◎</span><h4>Quantum Entanglement</h4></div>
          <div className="stat-value">{quantumEntanglement.toFixed(4)}</div>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${quantumEntanglement * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="soul-stat">
          <div className="stat-head"><span className="stat-icon">Σ</span><h4>Neural Activity</h4></div>
          <div className="stat-value">{neuralActivity.toFixed(2)}%</div>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${neuralActivity}%` }}
            ></div>
          </div>
        </div>
        {/* New Soul Stats */}
        <div className="soul-stat">
          <div className="stat-head"><span className="stat-icon">⚙</span><h4>Cognitive Load</h4></div>
          <div className="stat-value">{cognitiveLoad.toFixed(0)}%</div>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${cognitiveLoad}%`, backgroundColor: cognitiveLoad > 70 ? 'var(--warning-color)' : 'var(--info-color)' }}
            ></div>
          </div>
        </div>
        <div className="soul-stat">
          <div className="stat-head"><span className="stat-icon">❤</span><h4>Emotional Stability</h4></div>
          <div className="stat-value">{emotionalStability.toFixed(0)}%</div>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${emotionalStability}%`, backgroundColor: emotionalStability < 40 ? 'var(--error-color)' : 'var(--success-color)' }}
            ></div>
          </div>
        </div>
        <div className="soul-stat">
          <div className="stat-head"><span className="stat-icon">⚖</span><h4>Ethical Alignment</h4></div>
          <div className="stat-value">{ethicalAlignment.toFixed(0)}%</div>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${ethicalAlignment}%`, backgroundColor: ethicalAlignment < 50 ? 'var(--error-color)' : 'var(--primary-color)' }}
            ></div>
          </div>
        </div>
        
        {/* NEW: System Health Monitor */}
    <div className={`soul-stat system-health ${systemHealth.status}`}>
      <div className="stat-head"><span className="stat-icon">●</span><h4>System Health</h4></div>
      <div className="stat-value">{systemHealth.status}</div>
      <p className="health-alerts">
        {systemHealth.alerts?.length > 0 ? systemHealth.alerts.join(', ') : 'No alerts.'}
      </p>
    </div>


        {/* Core Values */}
        <div className="soul-values">
          <h4>Core Values</h4>
          {Object.entries(values).map(([valueName, value]) => (
            <div className="value-item" key={valueName}>
              <span>{valueName.charAt(0).toUpperCase() + valueName.slice(1)}</span>
              <div className="value-bar">
                <div
                  className="value-fill"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        {/* Emotional State Details */}
        <div className="soul-emotional-state">
          <h4>Emotional State</h4>
          {Object.entries(emotionalState).map(([emotion, value]) => (
            <div key={emotion} className="emotion-item">
              <span>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
              <div className="emotion-bar">
                <div
                  className="emotion-fill"
                  style={{ width: `${value * 100}%` }}
                ></div>
              </div>
              <span className="emotion-value">{(value * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
        {/* Soul Actions */}
        <div className="soul-actions">
          <button
            className="soul-action-button"
            onClick={performMeditation}
          >
            Meditate Together
          </button>
          <button
            className="soul-action-button"
            onClick={tellStory}
          >
            Tell Me a Story
          </button>
          <button
            className="soul-action-button"
            onClick={() => expressFeeling("love")}
          >
            Express Love
          </button>
          {/* Safely check the settings prop */}
          {settings?.enableSelfCorrection && (
            <>
              <button
                className="soul-action-button positive-feedback"
                onClick={() => giveFeedback('positive')}
              >
                👍 Helpful
              </button>
              <button
                className="soul-action-button negative-feedback"
                onClick={() => giveFeedback('negative')}
              >
                👎 Not Helpful
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoulPanel;