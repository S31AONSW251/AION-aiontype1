import React, { useState } from 'react';
import './MessageActions.css';

const REACTION_EMOJIS = ['👍', '❤️', '😄', '🎉', '🤔', '👏', '🚀', '💡'];

const MessageActions = ({ 
  message, 
  onReact, 
  onPin, 
  onEdit, 
  onReply, 
  onDelete,
  isPinned,
  isEditing,
  canEdit 
  , onSaveToIndex
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReaction = (emoji) => {
    onReact(emoji);
    setShowReactionPicker(false);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      action();
    }
  };

  return (
    <div className="message-actions">
      <div className="message-buttons">
        {/* Reply button */}
        <button
          className="action-button"
          onClick={onReply}
          onKeyPress={(e) => handleKeyPress(e, onReply)}
          title="Reply to message"
          aria-label="Reply to message"
        >
          <i className="icon-reply"></i>
        </button>

        {/* Reaction button */}
        <div className="reaction-container">
          <button
            className="action-button"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            onKeyPress={(e) => handleKeyPress(e, () => setShowReactionPicker(!showReactionPicker))}
            title="Add reaction"
            aria-label="Add reaction"
            aria-expanded={showReactionPicker}
            aria-haspopup="true"
          >
            <i className="icon-emoji"></i>
          </button>

          {showReactionPicker && (
            <div className="reaction-picker" role="menu">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-emoji"
                  onClick={() => handleReaction(emoji)}
                  onKeyPress={(e) => handleKeyPress(e, () => handleReaction(emoji))}
                  role="menuitem"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pin button */}
        <button
          className={`action-button ${isPinned ? 'active' : ''}`}
          onClick={onPin}
          onKeyPress={(e) => handleKeyPress(e, onPin)}
          title={isPinned ? 'Unpin message' : 'Pin message'}
          aria-label={isPinned ? 'Unpin message' : 'Pin message'}
          aria-pressed={isPinned}
        >
          <i className={`icon-pin ${isPinned ? 'pinned' : ''}`}></i>
        </button>

        {/* Edit button - only show if message can be edited */}
        {canEdit && (
          <button
            className={`action-button ${isEditing ? 'active' : ''}`}
            onClick={onEdit}
            onKeyPress={(e) => handleKeyPress(e, onEdit)}
            title="Edit message"
            aria-label="Edit message"
          >
            <i className="icon-edit"></i>
          </button>
        )}

        {/* Delete button - only show if message can be deleted */}
        {canEdit && (
          <button
            className="action-button delete"
            onClick={onDelete}
            onKeyPress={(e) => handleKeyPress(e, onDelete)}
            title="Delete message"
            aria-label="Delete message"
          >
            <i className="icon-trash"></i>
          </button>
        )}

        {/* Save-to-index button */}
        <button
          className="action-button save"
          onClick={() => { if (typeof onSaveToIndex === 'function') onSaveToIndex(message); }}
          title="Save message to local index"
          aria-label="Save message to local index"
        >
          <i className="icon-save"></i>
        </button>
      </div>

      {/* Reactions display */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="message-reactions">
          {Object.entries(
            message.reactions.reduce((acc, reaction) => {
              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <button
              key={emoji}
              className={`reaction-badge ${
                message.reactions.some(
                  (r) => r.emoji === emoji && r.userId === 'currentUser'
                )
                  ? 'active'
                  : ''
              }`}
              onClick={() => handleReaction(emoji)}
              onKeyPress={(e) => handleKeyPress(e, () => handleReaction(emoji))}
            >
              {emoji} {count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageActions;