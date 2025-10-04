import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ComposerInput from './ComposerInput';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatPanel.css';
// ExamplePrompts and AvatarBadge imports removed because they are not used in this file

// Enhanced Code renderer component
const CustomCodeRenderer = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');

  const text = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  }, []);

  if (!inline && match) {
    return (
      <div className="code-block-container">
        <div className="code-block-header">
          <span className="code-language">{match[1]}</span>
          <div className="code-actions">
            <CopyToClipboard text={text} onCopy={handleCopy}>
              <button className={`action-btn ${isCopied ? 'copied' : ''}`} title="Copy Code">
                {isCopied ? '✓ Copied' : '📋 Copy'}
              </button>
            </CopyToClipboard>
          </div>
        </div>
        <SyntaxHighlighter 
          style={atomDark} 
          language={match[1]} 
          PreTag="div" 
          customStyle={{ margin: 0 }}
          {...props}
        >
          {text}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <code className={className} {...props}>{children}</code>;
};

const markdownComponents = { code: CustomCodeRenderer };

// feeling emoji helper removed (unused)

// Enhanced Typing indicator
const TypingIndicator = React.memo(() => (
  <div className="message-wrapper">
    <div className="aion-avatar">
      <div className="avatar-pulse"></div>
      <span className="avatar-icon">A</span>
    </div>
    <div className="aion-message">
      <div className="typing-indicator">
        <span>AION is thinking</span>
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
));

// Minimal ultra-professional welcome message
const WelcomeMessage = React.memo(({ onExampleClick }) => (
  <div className="empty-chat-container minimal-welcome" role="region" aria-label="Welcome to AION">
    <div className="minimal-inner">
      <div className="brand-compact">
        <div className="brand-mark">
          {/* Removed duplicate visible AION to keep a single centered wordmark in the header */}
        </div>
        <div className="brand-line">
          {/* Accessible label for screen readers only */}
          <h2 className="sr-only">AION</h2>
        </div>
      </div>

      <div className="welcome-ctas">
        <button className="primary-cta" onClick={() => onExampleClick && onExampleClick('Summarize this page')}>Get started</button>
        <button className="ghost-cta" onClick={() => onExampleClick && onExampleClick('Show docs')}>Explore templates</button>
        <button className="ghost-cta" onClick={() => onExampleClick && onExampleClick('Open examples')}>Try examples</button>
      </div>
      <div className="welcome-context">
        <h4>Powerful. Fast. Delightful.</h4>
        <p>Ask AION anything — it analyses files, reasons over context, generates code, and helps you ship faster. Built for expert workflows and delightful exploration.</p>
      </div>
    </div>
  </div>
));

// User Message Component
const UserMessage = React.memo(({ entry, onEdit, onSaveToIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(entry.question);

  const handleSave = useCallback(() => {
    onEdit(entry, editedText);
    setIsEditing(false);
  }, [entry, editedText, onEdit]);

  const handleCancel = useCallback(() => {
    setEditedText(entry.question);
    setIsEditing(false);
  }, [entry.question]);

  return (
    <div className="message-wrapper user">
      <div className="user-avatar">
        <span className="avatar-icon">👤</span>
      </div>
      <div className="message-content">
        <div className="message-header user-header">
          <span className="username">You</span>
          <span className="time">{entry.time}</span>
          <span className="message-id">#{entry.id?.slice(-4) || '0000'}</span>
        </div>
        <div className="message-body">
          {isEditing ? (
            <div className="edit-container">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="edit-textarea"
                rows="3"
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleCancel} className="cancel">Cancel</button>
                <button onClick={handleSave} className="save">Save Changes</button>
              </div>
            </div>
          ) : (
            <>
              <div className="user-question">{entry.question}</div>
              <div className="message-actions">
                <button onClick={() => setIsEditing(true)} title="Edit message">
                  <i className="icon-edit"></i>
                </button>
                <button onClick={() => onSaveToIndex && onSaveToIndex(entry)} title="Save message to local index">
                  <i className="icon-save"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// AION Message Component
const AionMessage = React.memo(({ entry, onRegenerate, onSpeak, isSpeaking, onFeedback, sentimentScore, onSaveToIndex }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1600);
  }, []);

  // feedback handler removed (no feedback controls in this component)

  const confidenceLevel = useMemo(() => {
    // Calculate confidence based on various factors
    const baseConfidence = 85; // Base confidence percentage
    const sentimentBonus = Math.abs(sentimentScore) * 0.5;
    return Math.min(95, baseConfidence + sentimentBonus);
  }, [sentimentScore]);

  return (
    <div className="message-wrapper">
      <div className="aion-avatar">
        <span className="avatar-icon">A</span>
      </div>
      <div className={`aion-message ${expanded ? 'expanded' : ''}`}>
        <div className="message-header">
          <span className="username">AION</span>
          {entry.mood && <span className="mood-indicator">{entry.mood}</span>}
          <span className="time">{entry.time}</span>
          <span className="message-id">#{entry.id?.slice(-4) || '0000'}</span>
        </div>

        <div className="message-body">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {entry.response || ''}
          </ReactMarkdown>
        </div>
        
        {/* Confidence meter */}
        <div className="confidence-meter">
          <span className="confidence-label">Confidence:</span>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${confidenceLevel}%` }}
            ></div>
          </div>
          <span className="confidence-value">{confidenceLevel}%</span>
        </div>

        {/* Message actions */}
        <div className="message-actions">
          <CopyToClipboard text={entry.response || ''} onCopy={handleCopy}>
            <button 
              className={`action-btn ${isCopied ? 'copied' : ''}`} 
              title="Copy to Clipboard"
            >
              {isCopied ? '✓' : '📋'}
            </button>
          </CopyToClipboard>
          
          <button 
            className="action-btn" 
            title="Regenerate" 
            onClick={() => onRegenerate(entry.question)}
          >
            🔄
          </button>
          
          <button 
            className={`action-btn ${isSpeaking ? 'speaking' : ''}`} 
            title="Read Aloud" 
            onClick={() => onSpeak(entry.response)}
          >
            {isSpeaking ? '⏹' : '🔊'}
          </button>
          
          <button 
            className="action-btn" 
            title={expanded ? 'Collapse' : 'Expand'} 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '−' : '+'}
          </button>
          <button className="action-btn" title="Save message to local index" onClick={() => onSaveToIndex && onSaveToIndex(entry)}>
            💾
          </button>
        </div>
        {/* Feedback section */}
        {/* Header controls removed per user preference — only centered AION and header buttons remain. */}
      </div>
    </div>
  );
});

// Streaming Message Component
const StreamingMessage = React.memo(({ content, soulState, onCancel, isStreaming }) => {
  return (
    <div className="message-wrapper">
      <div className="aion-avatar">
        <span className="avatar-icon">A</span>
      </div>
      <div className="aion-message streaming">
        <div className="message-header">
          <span className="username">AION</span>
          <span className="mood-indicator">{soulState?.currentMood || 'contemplative'}</span>
        </div>
        
        <div className="message-body">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {content || ''}
          </ReactMarkdown>
        </div>
        
        {isStreaming && (
          <div className="streaming-controls">
            <div className="streaming-indicator">
              <div className="wave-animation">
                <div></div><div></div><div></div>
              </div>
              <span>Generating response...</span>
            </div>
            <button className="cancel-button" onClick={onCancel}>
              Stop Generation
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// Main ChatPanel Component
const ChatPanel = React.memo(({
  chatContainerRef,
  conversationHistory,
  reply,
  soulState,
  sentimentScore,
  isThinking,
  isStreaming,
  streamingResponse,
  onSaveToIndex,
  onSpeak,
  onRegenerate,
  onCancel,
  onExamplePrompt,
  onEditMessage,
  onFeedback,
  // uploads
  uploadedFiles = [],
  onFilesSelected = () => {},
  onInsertFile = () => {},
  onOpenFile = () => {},
  onSend = () => {},
}) => {
  // Generate unique IDs for messages if not present
  const enhancedHistory = useMemo(() => {
    return conversationHistory.map((entry, index) => ({
      ...entry,
      id: entry.id || `msg-${Date.now()}-${index}`
    }));
  }, [conversationHistory]);

  // Upload helpers (drag/drop + file input)
  const [, setDragOver] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  // Helper to safely produce a preview URL or use existing URLs.
  const getPreview = (item) => {
    if (!item) return null;
    try {
      // File/Blob (browser file input)
      // If it's already a URL string or has preview/url, return those first
      if (typeof item === 'string') return item;
      if (item.url) return item.url;
      if (item.preview) return item.preview;

      // Try to create an object URL for File/Blob-like objects. Prefer instanceof
      // checks to avoid calling createObjectURL on non-Blob values which throws.
      try {
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          // Some environments have cross-realm objects where instanceof may fail;
          // perform a duck-typing check as a fallback: presence of `size` and `type`.
          if (item instanceof Blob) return URL.createObjectURL(item);
          if (item && typeof item === 'object' && typeof item.size === 'number' && typeof item.type === 'string' && typeof item.arrayBuffer === 'function') {
            return URL.createObjectURL(item);
          }
        }
      } catch (err) {
        // Not a Blob/File or createObjectURL rejected it — fallthrough
        console.debug('getPreview: createObjectURL failed or item not a Blob', err);
      }
    } catch (e) {
      // Some environments may throw for instanceof checks; ignore and continue
    }
    return null;
  };

  // attachments stored as { id, file, preview }
  const [attachments, setAttachments] = useState(() => {
    return (uploadedFiles || []).map((f, i) => ({
      id: `init-${Date.now()}-${i}`,
      file: f,
      preview: getPreview(f),
      progress: 100,
      status: 'done'
    }));
  });

  // Keep track of timers for simulated uploads so they can be cancelled
  const uploadTimers = useRef({});

  // humanFileSize helper removed (unused)

  useEffect(() => {
    const el = chatContainerRef?.current;
    if (!el) return;
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const files = e.dataTransfer && e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []; if (files.length) onFilesSelected(files); };
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);
    return () => {
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, [chatContainerRef, onFilesSelected]);

  const simulateUpload = useCallback((item) => {
    // Simulate a progressive upload over 1.5-3 seconds
    const duration = 1500 + Math.floor(Math.random() * 1500);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setAttachments((prev) => prev.map(a => a.id === item.id ? { ...a, progress: pct } : a));
      if (pct >= 100) {
        setAttachments((prev) => prev.map(a => a.id === item.id ? { ...a, status: 'done', progress: 100 } : a));
        delete uploadTimers.current[item.id];
        // notify parent that a file has been inserted (server hook)
        try { onInsertFile && onInsertFile(item.file); } catch (e) {}
      } else {
        uploadTimers.current[item.id] = setTimeout(tick, 120);
      }
    };
    uploadTimers.current[item.id] = setTimeout(tick, 120);
  }, [onInsertFile]);

  const handleLocalFileInput = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      // limit file size to 10MB per file to avoid huge previews
      const accepted = files.filter((f) => f.size == null || f.size <= 10 * 1024 * 1024);
      const newItems = accepted.map((f, i) => ({ id: `local-${Date.now()}-${i}`, file: f, preview: getPreview(f), progress: 0, status: 'uploading' }));
      setAttachments((prev) => {
        const next = [...prev, ...newItems];
        // start simulated uploads for each new item
        newItems.forEach((item) => simulateUpload(item));
        try { onFilesSelected(next.map(a => a.file)); } catch (e) {}
        return next;
      });
    }
    e.target.value = null;
  }, [onFilesSelected, simulateUpload]);



  // cancelUpload removed (not used by UI)

  // Keep attachments in sync if parent supplies uploadedFiles
  useEffect(() => {
    // map uploadedFiles (from parent) into internal shape; create previews for images
    if (!Array.isArray(uploadedFiles)) return;
  const items = uploadedFiles.map((f, i) => ({ id: `upd-${Date.now()}-${i}`, file: f, preview: getPreview(f) }));
    // revoke previous previews
    setAttachments((prev) => {
      prev.forEach(a => { try { if (a.preview) URL.revokeObjectURL(a.preview); } catch (e) {} });
      return items;
    });
  }, [uploadedFiles]);

  // removeAttachment removed (not used by UI)

  const handleSend = useCallback(() => {
    const text = (composerText || '').trim();
    if (!text && (!attachments || attachments.length === 0)) return;
    const filesToSend = attachments.map(a => a.file);
    // Call parent handler with message, attachments and optional feeling
    try {
      onSend({ text, attachments: filesToSend, feeling: selectedFeeling });
    } catch (e) {
      console.error('onSend handler error', e);
    }
    // Clear composer and revoke previews
    setComposerText('');
    setSelectedFeeling(null);
    setAttachments((prev) => {
      prev.forEach(a => { try { if (a.preview) URL.revokeObjectURL(a.preview); } catch (e) {} });
      return [];
    });
  }, [composerText, attachments, onSend, selectedFeeling]);

  // Lightbox state for previewing images/videos
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null); // { src, type, name }

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLightboxItem(null);
  }, []);

  return (
    <div className="chat-container" ref={chatContainerRef}>
      <div className="chat-header brand-premium">
            <div className="chat-title-row">
              <div className="title-left">
                {/* Removed duplicate AION wordmark here; header now shows single centered wordmark in Header.js */}
              </div>
            </div>
        {/* Header subcontrols + composer removed per user request to keep header minimal */}
      </div>

      <div className="conversation-history">
        {enhancedHistory.length === 0 && !isThinking && (
          <WelcomeMessage onExampleClick={onExamplePrompt} />
        )}

        {enhancedHistory.map((entry) => (
          <React.Fragment key={entry.id}>
            <UserMessage entry={entry} onEdit={onEditMessage} onSaveToIndex={onSaveToIndex} />
            <AionMessage
              entry={entry}
              onRegenerate={onRegenerate}
              onSpeak={onSpeak}
              isSpeaking={false}
              onFeedback={onFeedback}
              sentimentScore={entry.sentiment || 0}
              onSaveToIndex={onSaveToIndex}
            />
          </React.Fragment>
        ))}

        {(isStreaming || (reply && enhancedHistory.length > 0)) && (
          <StreamingMessage
            content={streamingResponse || reply || ''}
            soulState={soulState}
            onCancel={onCancel}
            isStreaming={isStreaming}
          />
        )}

        {isThinking && !reply && !isStreaming && <TypingIndicator />}
      </div>

      <div className="chat-composer-area">
        <div className="chat-composer">
          <div className="composer-left" />
          <div className="composer-middle">
            <ComposerInput
              value={composerText}
              onChange={setComposerText}
              onSubmit={(val) => { setComposerText(''); onSend({ text: val, attachments: [], feeling: selectedFeeling }); setSelectedFeeling(null); }}
              onFileUpload={(files) => { handleLocalFileInput({ target: { files } }); }}
              onTypingStart={() => {}}
              onTypingEnd={() => {}}
              mentionables={[]}
              placeholder="Ask AION..."
              disabled={false}
              isTyping={false}
              onFeelingChange={(f) => setSelectedFeeling(f?.key || null)}
            />
          </div>
          <div className="composer-right">
            <button className="primary-cta" onClick={handleSend} title="Send">Send</button>
          </div>
        </div>

        <div className="chat-footer">
          <div className="conversation-stats">
            <span>{enhancedHistory.length} messages</span>
            <span>Connection: {soulState?.connectionLevel || 0}%</span>
          </div>
        </div>
      </div>
      {/* Lightbox overlay for previewing media */}
      {lightboxOpen && lightboxItem && (
        <div className="lightbox-overlay" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">✖</button>
            <div className="lightbox-media">
              {lightboxItem.type === 'image' ? (
                <img src={lightboxItem.src} alt={lightboxItem.name || 'preview'} className="lightbox-img" />
              ) : lightboxItem.type === 'video' ? (
                <video src={lightboxItem.src} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              ) : (
                <a href={lightboxItem.src} target="_blank" rel="noreferrer">Open file</a>
              )}
              {lightboxItem.name && <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>{lightboxItem.name}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ChatPanel;