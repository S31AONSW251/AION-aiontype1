import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ComposerInput.css';

// Rich text actions
const RICH_TEXT_ACTIONS = [
  { 
    icon: 'icon-bold',
    tooltip: 'Bold (Ctrl+B)',
    wrapper: '**',
    shortcut: { key: 'b', ctrl: true }
  },
  { 
    icon: 'icon-italic',
    tooltip: 'Italic (Ctrl+I)',
    wrapper: '_',
    shortcut: { key: 'i', ctrl: true }
  },
  { 
    icon: 'icon-code',
    tooltip: 'Code (Ctrl+E)',
    wrapper: '`',
    shortcut: { key: 'e', ctrl: true }
  }
];

// Slash commands configuration
const SLASH_COMMANDS = [
  { 
    command: '/search', 
    description: 'Search for something',
    icon: 'icon-search',
    handler: (args) => ({ type: 'search', query: args.join(' ') })
  },
  { 
    command: '/image', 
    description: 'Generate an image',
    icon: 'icon-image',
    handler: (args) => ({ type: 'image', prompt: args.join(' ') })
  },
  { 
    command: '/code', 
    description: 'Generate code',
    icon: 'icon-code',
    handler: (args) => ({ type: 'code', language: args[0], prompt: args.slice(1).join(' ') })
  },
  { 
    command: '/math', 
    description: 'Solve a math problem',
    icon: 'icon-calculator',
    handler: (args) => ({ type: 'math', expression: args.join(' ') })
  },
  { 
    command: '/help', 
    description: 'Show available commands',
    icon: 'icon-help',
    handler: () => ({ type: 'help' })
  }
];

const ComposerInput = ({
  value = '',
  onChange,
  onSubmit,
  onCommand,
  onFileUpload,
  onTypingStart,
  onTypingEnd,
  onFeelingChange, // optional callback when a feeling is selected
  mentionables = [], // List of users/items that can be mentioned
  placeholder = 'Type a message...',
  disabled = false,
  isTyping = false // Show typing indicator from other users
}) => {
  // Optional prop: onFeelingChange(selectedFeeling)
  const [showCommands, setShowCommands] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [commandFilter, setCommandFilter] = useState('');
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const inputRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === composerRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  // Handle typing indicators
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        onTypingEnd?.();
      }
    };
  }, [typingTimeout, onTypingEnd]);

  const handleTyping = useCallback(() => {
    onTypingStart?.();
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      onTypingEnd?.();
      setTypingTimeout(null);
    }, 1000);
    
    setTypingTimeout(timeout);
  }, [onTypingStart, onTypingEnd, typingTimeout]);

  // Filter commands and mentions based on input
  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.command.toLowerCase().includes(commandFilter.toLowerCase())
  );

  const filteredMentions = mentionables.filter(item =>
    item.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  // Handle input changes
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for slash commands
    if (newValue.startsWith('/')) {
      setShowCommands(true);
      setCommandFilter(newValue.slice(1));
      setSelectedIndex(0);
    } else {
      setShowCommands(false);
    }

    // Check for mentions
    const lastWord = newValue.split(' ').pop();
    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.slice(1));
      setSelectedIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  // Handle special key presses
  // Handle rich text actions
  const handleRichTextAction = (action) => {
    const textarea = inputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;
    
    // If text is selected, wrap it
    if (start !== end) {
      const newText = 
        text.substring(0, start) +
        action.wrapper +
        text.substring(start, end) +
        action.wrapper +
        text.substring(end);
      
      onChange(newText);
      
      // Restore selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + action.wrapper.length,
          end + action.wrapper.length
        );
      }, 0);
    }
    // If no text is selected, just insert wrappers and place cursor between them
    else {
      const newText =
        text.substring(0, start) +
        action.wrapper +
        action.wrapper +
        text.substring(end);
      
      onChange(newText);
      
      // Place cursor between wrappers
      setTimeout(() => {
        textarea.focus();
        const newCursor = start + action.wrapper.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
      e.target.value = ''; // Reset input
    }
  };

  const FEELINGS = [
    { key: '🙂', label: 'Pleasant' },
    { key: '😊', label: 'Happy' },
    { key: '🤔', label: 'Curious' },
    { key: '😮', label: 'Surprised' },
    { key: '😢', label: 'Sad' },
    { key: '😡', label: 'Frustrated' }
  ];

  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling.key);
    if (typeof onFeelingChange === 'function') {
      try { onFeelingChange(feeling); } catch (e) { /* ignore */ }
    }
  };

  const handleKeyDown = (e) => {
    // Handle rich text shortcuts
    if (e.ctrlKey || e.metaKey) {
      const action = RICH_TEXT_ACTIONS.find(
        action => action.shortcut.key === e.key.toLowerCase()
      );
      
      if (action) {
        e.preventDefault();
        handleRichTextAction(action);
        return;
      }
    }

    if (showCommands || showMentions) {
      const items = showCommands ? filteredCommands : filteredMentions;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
          break;
          
        case 'Tab':
        case 'Enter':
          e.preventDefault();
          if (items[selectedIndex]) {
            if (showCommands) {
              handleCommandSelect(items[selectedIndex]);
            } else {
              handleMentionSelect(items[selectedIndex]);
            }
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          setShowCommands(false);
          setShowMentions(false);
          break;
          
        default:
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle command selection
  const handleCommandSelect = (command) => {
    setShowCommands(false);
    const args = value.slice(command.command.length + 1).trim().split(' ');
    const result = command.handler(args);
    onCommand(result);
  };

  // Handle mention selection
  const handleMentionSelect = (mention) => {
    setShowMentions(false);
    const words = value.split(' ');
    words[words.length - 1] = `@${mention.name}`;
    onChange(words.join(' ') + ' ');
  };

  // Handle form submission
  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value);
      onChange('');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (composerRef.current && !composerRef.current.contains(event.target)) {
        setShowCommands(false);
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className={`composer-wrapper ${isDragging ? 'dragging' : ''}`} 
      ref={composerRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drag-overlay">
          <i className="icon-upload"></i>
          <span>Drop files to upload</span>
        </div>
      )}
      
      {/* Rich text toolbar */}
      <div className="rich-text-toolbar">
        {RICH_TEXT_ACTIONS.map((action, index) => (
          <button
            key={index}
            className="rich-text-button"
            title={action.tooltip}
            onClick={() => handleRichTextAction(action)}
            type="button"
          >
            <i className={action.icon}></i>
          </button>
        ))}
        <label className="file-upload-button" title="Upload files">
          <i className="icon-paperclip"></i>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            hidden
          />
        </label>
      </div>

      <div className="composer-input-wrapper">
        {isTyping && (
          <div className="typing-indicator">
            AION is typing<span>.</span><span>.</span><span>.</span>
          </div>
        )}
        <textarea
          ref={inputRef}
          className="composer-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />
      </div>

      {/* Feeling / express bar under the input */}
      <div className="feeling-bar" role="tablist" aria-label="Express feeling">
        {FEELINGS.map(f => (
          <button
            key={f.key}
            type="button"
            className={`feeling-btn ${selectedFeeling === f.key ? 'selected' : ''}`}
            title={f.label}
            onClick={() => handleFeelingSelect(f)}
          >
            <span aria-hidden="true">{f.key}</span>
            <span className="sr-only">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Command suggestions */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="suggestions-dropdown commands-dropdown">
          {filteredCommands.map((cmd, index) => (
            <button
              key={cmd.command}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleCommandSelect(cmd)}
            >
              <i className={cmd.icon}></i>
              <span className="command-name">{cmd.command}</span>
              <span className="command-description">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mention suggestions */}
      {showMentions && filteredMentions.length > 0 && (
        <div className="suggestions-dropdown mentions-dropdown">
          {filteredMentions.map((mention, index) => (
            <button
              key={mention.id}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleMentionSelect(mention)}
            >
              {mention.avatar && (
                <img 
                  src={mention.avatar} 
                  alt={mention.name} 
                  className="mention-avatar"
                />
              )}
              <span className="mention-name">@{mention.name}</span>
              {mention.description && (
                <span className="mention-description">{mention.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComposerInput;