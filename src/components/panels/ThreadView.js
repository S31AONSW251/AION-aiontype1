import React, { useState, useRef, useEffect } from 'react';
import './ThreadView.css';

const ThreadView = ({
  thread,
  onReply,
  onClose,
  onReact,
  onPin,
  onEdit,
  onDelete,
  isTyping
}) => {
  const [replyText, setReplyText] = useState('');
  const threadEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText('');
    }
  };

  return (
    <div className="thread-view">
      <div className="thread-header">
        <div className="thread-info">
          <h3>Thread</h3>
          <span className="message-count">
            {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button className="close-button" onClick={onClose} aria-label="Close thread">
          <i className="icon-close"></i>
        </button>
      </div>

      <div className="thread-content">
        {/* Original message */}
        <div className="original-message">
          <div className="message-info">
            <span className="author">{thread.originalMessage.author}</span>
            <span className="timestamp">
              {new Date(thread.originalMessage.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="message-content">
            {thread.originalMessage.content}
          </div>
        </div>

        {/* Thread replies */}
        <div className="thread-replies">
          {thread.messages.map((message) => (
            <div key={message.id} className="thread-reply">
              <div className="message-info">
                <span className="author">{message.author}</span>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          <div ref={threadEndRef}></div>
        </div>
      </div>

      {/* Reply input */}
      <form className="thread-reply-form" onSubmit={handleSubmit}>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply to thread..."
          rows={3}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!replyText.trim()}
        >
          <i className="icon-send"></i>
        </button>
      </form>
    </div>
  );
};

export default ThreadView;