import React from 'react';

const Notification = ({ notification }) => {
  if (!notification) return null;

  const { message = '', type = 'info' } = notification;

  // Use polite live region for non-critical, assertive for errors
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={`notification ${type}`}
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {message}
    </div>
  );
};

export default Notification;