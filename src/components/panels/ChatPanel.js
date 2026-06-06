import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ComposerInput from './ComposerInput';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatPanel.css';
import '../../styles/aion-production-ui.css';


// Small utility: friendly timestamp formatter
const formatTime = (raw) => {
  try {
    const d = raw ? new Date(raw) : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return raw || '';
  }
};

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
                {isCopied ? 'Copied' : 'Copy'}
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

const WelcomeMessage = React.memo(({ onExampleClick }) => (
  <div className="welcome-hero-container" role="region" aria-label="Welcome to AION">
    <div className="welcome-hero-inner">
      <div className="welcome-badge">AION NEURAL CORE v2.5</div>
      <h1 className="welcome-hero-title">How can we assist you today?</h1>
      <p className="welcome-hero-subtitle">
        Access real-time intelligence, local inference models, file analysis, and agent-driven workspace upgrades.
      </p>

      <div className="welcome-actions-grid">
        <div className="welcome-action-card" onClick={() => onExampleClick && onExampleClick('Summarize project context and file structure.')}>
          <div className="action-card-icon">📁</div>
          <div className="action-card-title">Project Summary</div>
          <div className="action-card-desc">Scan codebase directory for insights & layout mapping</div>
        </div>
        <div className="welcome-action-card" onClick={() => onExampleClick && onExampleClick('Perform security audit on active modules.')}>
          <div className="action-card-icon">🛡</div>
          <div className="action-card-title">Security & Audit</div>
          <div className="action-card-desc">Inspect code files for structural patterns or vulnerabilities</div>
        </div>
        <div className="welcome-action-card" onClick={() => onExampleClick && onExampleClick('Generate test suite for App controller.')}>
          <div className="action-card-icon">⚛</div>
          <div className="action-card-title">Test Suite Generation</div>
          <div className="action-card-desc">Write robust Jest or React Testing Library suites</div>
        </div>
        <div className="welcome-action-card" onClick={() => onExampleClick && onExampleClick('Refactor App.css with clean variables.')}>
          <div className="action-card-icon">⚡</div>
          <div className="action-card-title">Refactoring</div>
          <div className="action-card-desc">Clean up css rules and resolve unused component assets</div>
        </div>
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
      <div className={`user-avatar ${isEditing ? 'pulse' : ''}`}>
        <span className="avatar-icon">U</span>
      </div>
      <div className="message-content">
        <div className="message-header user-header">
          <span className="username">You</span>
          <span className="time">{formatTime(entry.time)}</span>
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
  const [reactions, setReactions] = useState(() => (entry.reactions || {}));

  const toggleReaction = useCallback((emoji) => {
    setReactions((prev) => {
      const next = { ...prev };
      if (!next[emoji]) next[emoji] = 0;
      next[emoji] = next[emoji] + 1;
      return next;
    });
  }, []);

  const handleCopy = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1600);
  }, []);

  const confidenceLevel = useMemo(() => {
    const baseConfidence = 85;
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
          <span className="time">{formatTime(entry.time)}</span>
          <span className="message-id">#{entry.id?.slice(-4) || '0000'}</span>
        </div>

        <div className="message-body">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {entry.response || ''}
          </ReactMarkdown>
        </div>
        {entry.provenance && Array.isArray(entry.provenance) && (
          <div className="provenance-list static">
            {entry.provenance.slice(0,3).map((p, idx) => (
              <span key={idx} className="prov-badge">{p.id?.slice(0,6) || 'mem'} ({(p.score||0).toFixed(2)})</span>
            ))}
          </div>
        )}
        
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

        <div className="message-actions">
          <CopyToClipboard text={entry.response || ''} onCopy={handleCopy}>
            <button 
              className={`action-btn ${isCopied ? 'copied' : ''}`} 
              title="Copy to Clipboard"
            >
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          </CopyToClipboard>
          
          <button 
            className="action-btn" 
            title="Regenerate" 
            onClick={() => onRegenerate(entry.question)}
          >
            Retry
          </button>
          
          <button 
            className={`action-btn ${isSpeaking ? 'speaking' : ''}`} 
            title="Read Aloud" 
            onClick={() => onSpeak(entry.response)}
          >
            {isSpeaking ? 'Stop' : 'Speak'}
          </button>
          
          <button 
            className="action-btn" 
            title={expanded ? 'Collapse' : 'Expand'} 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '−' : '+'}
          </button>
          <button className="action-btn" title="Save message to local index" onClick={() => onSaveToIndex && onSaveToIndex(entry)}>
            Save
          </button>
          <div className="reactions" role="group" aria-label="Response feedback">
            {['Useful','Accurate','Save','Review'].map((r) => (
              <button key={r} className="reaction-btn" onClick={() => toggleReaction(r)} aria-label={`Mark ${r}`}>{r} {reactions[r] ? reactions[r] : ''}</button>
            ))}
          </div>
        </div>
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
        
        <div className="message-body streaming-body">
          {typeof content === 'object' ? (
            <>
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {content.__text || ''}
              </ReactMarkdown>
            </>
          ) : (
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {content || ''}
            </ReactMarkdown>
          )}
          {content && content.__provenance && Array.isArray(content.__provenance) && (
            <div className="provenance-list">
              {content.__provenance.slice(0,3).map((p, idx) => (
                <span key={idx} className="prov-badge">{p.id?.slice(0,6) || 'mem'} ({(p.score||0).toFixed(2)})</span>
              ))}
            </div>
          )}
        </div>
        
        {isStreaming && (
          <div className="streaming-controls">
            <div className="streaming-indicator">
              <div className="wave-animation">
                <div></div><div></div><div></div>
              </div>
              <span>Generating response</span>
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

const ChatPanel = React.memo((props) => {
  const {
    chatContainerRef,
    conversationHistory,
    reply,
    soulState,
    // sentimentScore,
    isThinking,
    isStreaming,
    streamingResponse,
    onSpeak,
    onRegenerate,
    onCancel,
    onExamplePrompt,
    onEditMessage,
    onFeedback,
    uploadedFiles,
    onInsertFile,
    // onOpenFile,
    onFilesSelected,
    onSend,
    onSaveToIndex,
    // offlineHelpers,
  } = props;

  const enhancedHistory = useMemo(() => {
    return (conversationHistory || []).map((msg, idx) => ({
      ...msg,
      id: msg.id || `msg-${idx}-${msg.time || Date.now()}`,
    }));
  }, [conversationHistory]);

  const [, setDragOver] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState(null);

  // Helper to safely produce a preview URL or use existing URLs.
  const getPreview = (item) => {
    if (!item) return null;
    try {
      if (typeof item === 'string') return item;
      if (item.url) return item.url;
      if (item.preview) return item.preview;

      try {
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          if (item instanceof Blob) return URL.createObjectURL(item);
          if (item && typeof item === 'object' && typeof item.size === 'number' && typeof item.type === 'string' && typeof item.arrayBuffer === 'function') {
            return URL.createObjectURL(item);
          }
        }
      } catch (err) {
        console.debug('getPreview: createObjectURL failed or item not a Blob', err);
      }
    } catch (e) {
      // ignore
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

  const uploadTimers = useRef({});

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
    const duration = 1500 + Math.floor(Math.random() * 1500);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setAttachments((prev) => prev.map(a => a.id === item.id ? { ...a, progress: pct } : a));
      if (pct >= 100) {
        setAttachments((prev) => prev.map(a => a.id === item.id ? { ...a, status: 'done', progress: 100 } : a));
        delete uploadTimers.current[item.id];
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
      const accepted = files.filter((f) => f.size == null || f.size <= 10 * 1024 * 1024);
      const newItems = accepted.map((f, i) => ({ id: `local-${Date.now()}-${i}`, file: f, preview: getPreview(f), progress: 0, status: 'uploading' }));
      setAttachments((prev) => {
        const next = [...prev, ...newItems];
        newItems.forEach((item) => simulateUpload(item));
        try { onFilesSelected(next.map(a => a.file)); } catch (e) {}
        return next;
      });
    }
    e.target.value = null;
  }, [onFilesSelected, simulateUpload]);

  useEffect(() => {
    if (!Array.isArray(uploadedFiles)) return;
    const items = uploadedFiles.map((f, i) => ({ id: `upd-${Date.now()}-${i}`, file: f, preview: getPreview(f) }));
    setAttachments((prev) => {
      prev.forEach(a => { try { if (a.preview) URL.revokeObjectURL(a.preview); } catch (e) {} });
      return items;
    });
  }, [uploadedFiles]);

  const handleSend = useCallback(() => {
    const text = (composerText || '').trim();
    if (!text && (!attachments || attachments.length === 0)) return;
    const filesToSend = attachments.map(a => a.file);
    try {
      onSend({ text, attachments: filesToSend, feeling: selectedFeeling });
    } catch (e) {
      console.error('onSend handler error', e);
    }
    setComposerText('');
    setSelectedFeeling(null);
    setAttachments((prev) => {
      prev.forEach(a => { try { if (a.preview) URL.revokeObjectURL(a.preview); } catch (e) {} });
      return [];
    });
  }, [composerText, attachments, onSend, selectedFeeling]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLightboxItem(null);
  }, []);

  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    const el = chatContainerRef?.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setIsAtBottom(true);
  }, [chatContainerRef]);

  useEffect(() => {
    const el = chatContainerRef?.current;
    if (!el) return;
    const onScroll = () => {
      const buffer = 60;
      const atBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) <= buffer;
      setIsAtBottom(atBottom);
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [chatContainerRef]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [enhancedHistory.length, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const el = chatContainerRef?.current;
    if (!el) return;
    const onClick = (e) => {
      const img = e.target.closest && e.target.closest('img');
      if (img && el.contains(img)) {
        const src = img.src || img.getAttribute('src');
        if (src) {
          setLightboxItem({ src, type: 'image', name: img.alt || '' });
          setLightboxOpen(true);
        }
      }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [chatContainerRef]);

  const [themeClass, setThemeClass] = useState('');
  useEffect(() => {
    if (typeof document === 'undefined') {
      setThemeClass('light-theme');
      return;
    }

    const determine = () => {
      try {
        if (document.documentElement.classList.contains('dark-theme') || document.body.classList.contains('dark-theme')) {
          setThemeClass('dark-theme');
        } else if (document.documentElement.classList.contains('light-theme') || document.body.classList.contains('light-theme')) {
          setThemeClass('light-theme');
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setThemeClass('dark-theme');
        } else {
          setThemeClass('light-theme');
        }
      } catch (e) {
        setThemeClass('light-theme');
      }
    };

    determine();

    const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const onMqlChange = () => determine();
    if (mql) {
      if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onMqlChange);
      else if (typeof mql.addListener === 'function') mql.addListener(onMqlChange);
    }

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          determine();
          break;
        }
      }
    });
    try {
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {
      // ignore
    }

    return () => {
      if (mql) {
        if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onMqlChange);
        else if (typeof mql.removeListener === 'function') mql.removeListener(onMqlChange);
      }
      try { obs.disconnect(); } catch (e) {}
    };
  }, []);

  return (
    <div className={`chat-workstation-wrapper ${themeClass}`}>
      <div 
        className="chat-left-pane"
        style={{
          '--accent': 'var(--cp-accent-1)',
          '--accent-2': 'var(--cp-accent-2)',
          width: '100%'
        }}
      >
        <div
          className="chat-container enterprise-chat-override"
          ref={chatContainerRef}
          style={{ width: '100%', height: '100%', border: 'none', margin: '0 auto', maxWidth: '100%' }}
        >
          <div className="decorative-art" aria-hidden="true" />

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

          {!isAtBottom && (
            <div className="jump-to-bottom-wrap">
              <button className="jump-to-bottom" onClick={scrollToBottom} aria-label="Jump to latest messages">New messages</button>
            </div>
          )}

          <div className="chat-composer-area">
            <div className="chat-composer-wrapper-card">
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
              <button className="composer-send-btn" onClick={handleSend} title="Send message">
                <span className="send-icon">▲</span>
              </button>
            </div>

            <div className="chat-footer">
              <div className="conversation-stats">
                <span>{enhancedHistory.length} messages</span>
                <span>Connection: {soulState?.connectionLevel || 0}%</span>
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
});

export default ChatPanel;
