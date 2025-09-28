import React from 'react';
import './MessageContext.css';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Within last minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Within last hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Within last 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Within last week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
  
  // Default to date
  return date.toLocaleString();
};

const MessageContext = ({
  timestamp,
  isRead,
  isDelivered,
  isTyping,
  typingUsers = [],
  readBy = [],
  editedAt = null
}) => {
  return (
    <div className="message-context">
      <div className="context-indicators">
        {/* Delivery/Read status */}
        <div className="status-indicators">
          {isDelivered && !isRead && (
            <span className="delivered-indicator" title="Delivered">
              <i className="icon-check"></i>
            </span>
          )}
          {isRead && (
            <span className="read-indicator" title="Read">
              <i className="icon-check-double"></i>
            </span>
          )}
        </div>

        {/* Timestamp */}
        <span className="timestamp" title={new Date(timestamp).toLocaleString()}>
          {formatTimestamp(timestamp)}
          {editedAt && (
            <span className="edited-indicator" title={`Edited ${formatTimestamp(editedAt)}`}>
              (edited)
            </span>
          )}
        </span>

        {/* Read receipts */}
        {readBy.length > 0 && (
          <div className="read-receipts">
            <span className="read-by-count" title={`Read by ${readBy.join(', ')}`}>
              {readBy.length > 1 ? `${readBy.length} read` : 'Read'}
            </span>
          </div>
        )}
      </div>

      {/* Typing indicator */}
      {isTyping && typingUsers.length > 0 && (
        <div className="typing-indicator">
          <div className="typing-avatar-group">
            {typingUsers.slice(0, 3).map((user, index) => (
              <div 
                key={user.id} 
                className="typing-avatar"
                style={{ 
                  backgroundImage: `url(${user.avatar})`,
                  zIndex: typingUsers.length - index
                }}
                title={user.name}
              />
            ))}
          </div>
          <span className="typing-text">
            {typingUsers.length === 1 
              ? `${typingUsers[0].name} is typing...`
              : `${typingUsers.length} people are typing...`}
          </span>
          <div className="typing-animation">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContext;