import React, { useState } from 'react';

const GoalsPanel = ({ soulState, setActiveTab, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [newGoal, setNewGoal] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      onAddGoal(newGoal.trim());
      setNewGoal('');
    }
  };

  const startEditing = (goal) => {
    setEditingGoal(goal);
    setEditText(goal.description);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      onUpdateGoal(editingGoal.description, editText.trim());
      setEditingGoal(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditText('');
  };

  const handleStatusChange = (goal, newStatus) => {
    onUpdateGoal(goal.description, goal.description, newStatus);
  };

  return (
    <div className="goals-panel">
      <div className="goals-header">
        <h3>AION's Goals & Objectives</h3>
        <button className="back-button" onClick={() => setActiveTab("chat")}>
          <i className="icon-arrow-left"></i> Back to Chat
        </button>
      </div>

      <div className="goals-description">
        <p>Track and manage AION's personal development goals. These objectives help shape my growth and capabilities.</p>
      </div>

      <div className="add-goal-section">
        <h4>Add New Goal</h4>
        <div className="goal-input-container">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Describe a new goal for AION..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
          />
          <button onClick={handleAddGoal} disabled={!newGoal.trim()}>
            Add Goal
          </button>
        </div>
      </div>

      <div className="goals-stats">
        <div className="stat">
          <span className="stat-number">{soulState.goals.length}</span>
          <span className="stat-label">Total Goals</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {soulState.goals.filter(g => g.status === 'completed').length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {soulState.goals.filter(g => g.status === 'in-progress').length}
          </span>
          <span className="stat-label">In Progress</span>
        </div>
      </div>

      <div className="goals-list">
        <h4>Current Goals</h4>
        {soulState.goals.length > 0 ? (
          <div className="goals-container">
            {soulState.goals.map((goal, index) => (
              <div key={index} className={`goal-item ${goal.status}`}>
                {editingGoal === goal ? (
                  <div className="goal-edit">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="edit-actions">
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="goal-content">
                      <div className="goal-description">{goal.description}</div>
                      <div className="goal-meta">
                        <span className={`status-badge ${goal.status}`}>{goal.status}</span>
                        <span className="goal-time">Set: {goal.timestamp}</span>
                      </div>
                    </div>
                    <div className="goal-actions">
                      <select
                        value={goal.status}
                        onChange={(e) => handleStatusChange(goal, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button onClick={() => startEditing(goal)} title="Edit goal">
                        ✏️
                      </button>
                      <button onClick={() => onDeleteGoal(goal.description)} title="Delete goal">
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No goals set yet. Help me define my purpose by adding objectives!</p>
          </div>
        )}
      </div>

      <div className="goals-insights">
        <h4>Progress Insights</h4>
        <div className="insights-content">
          <p>
            AION has completed {soulState.goals.filter(g => g.status === 'completed').length} of{' '}
            {soulState.goals.length} total goals.
          </p>
          {soulState.goals.filter(g => g.status === 'in-progress').length > 0 && (
            <p>
              Currently working on {soulState.goals.filter(g => g.status === 'in-progress').length} goals.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsPanel;