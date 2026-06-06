import React from 'react';

const TaskSchedulerPanel = () => {
  return (
    <div className="enterprise-panel">
      <div className="panel-header">
        <h2>Task Scheduler</h2>
        <p className="subtitle">Manage background tasks and cron jobs</p>
      </div>
      <div className="panel-content">
        <div className="empty-state">
          <h3>No Scheduled Tasks</h3>
          <p>You can schedule automated tasks or routines for the AI to run in the background.</p>
        </div>
      </div>
    </div>
  );
};

export default TaskSchedulerPanel;
