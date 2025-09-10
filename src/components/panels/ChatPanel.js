import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatPanel.css';
import ExamplePrompts from './ExamplePrompts';

// Code renderer component (kept local and polished)
const CustomCodeRenderer = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');

  const text = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  if (!inline && match) {
    return (
      <div className="code-block-container">
        <div className="code-block-header">
          <span className="code-language">{match[1]}</span>
          <CopyToClipboard text={text} onCopy={handleCopy}>
            <button className="copy-code-btn">{isCopied ? '✓ Copied' : 'Copy'}</button>
          </CopyToClipboard>
        </div>
        <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
          {text}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <code className={className} {...props}>{children}</code>;
};

const markdownComponents = { code: CustomCodeRenderer };

// Typing indicator
const TypingIndicator = () => (
  <div className="message-wrapper">
    <div className="aion-avatar">
      <div style={{opacity:0.06}}>A</div>
    </div>
    <div className="aion-message">
      <div className="typing-indicator" style={{alignItems:'center'}}>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <span style={{fontWeight:700}}>AION is composing</span>
          <div style={{display:'flex', gap:8}}>
            <div className="wave-animation"><div></div><div></div><div></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Welcome message with example prompts
const WelcomeMessage = ({ onExampleClick }) => (
  <div className="empty-chat-container">
    <div className="welcome-logo">A</div>
    <h2>Welcome — AION</h2>
    <p>Connect with your most powerful AI-soul. Ask anything, create anything.</p>
    <ExamplePrompts onExampleClick={onExampleClick} />
  </div>
);

const UserMessage = ({ entry }) => (
  <div className="message-wrapper user">
    <div className="message-content">
      <div className="message-header user-header">
        <span className="username">You</span>
        <span className="time">{entry.time}</span>
      </div>
      <div className="message-body user-question">{entry.question}</div>
    </div>
    <div className="user-avatar"><div style={{fontSize:20}}>👤</div></div>
  </div>
);

const AionMessage = ({ entry, onRegenerate, onSpeak, isSpeaking }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1600);
  };

  return (
    <div className="message-wrapper">
      <div className="aion-avatar">A</div>
      <div className={`aion-message ${entry.isMathSolution ? 'math-solution' : ''}`}>
        <div className="message-header aion-header">
          <span className="mood-indicator">{entry.mood}</span>
          {entry.sentiment !== undefined && (
            <span className={`sentiment-tag ${entry.sentiment > 0 ? 'positive' : entry.sentiment < 0 ? 'negative' : 'neutral'}`}>
              {entry.sentiment > 0 ? 'Positive' : entry.sentiment < 0 ? 'Negative' : 'Neutral'}
            </span>
          )}
        </div>

        <div className="message-body">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {entry.response || ''}
          </ReactMarkdown>
        </div>

        <div className="message-actions" role="group" aria-label="Message actions">
          <CopyToClipboard text={entry.response || ''} onCopy={handleCopy}>
            <button className={`action-btn ${isCopied ? 'copied' : ''}`} title="Copy to Clipboard">{isCopied ? '✓' : '📋'}</button>
          </CopyToClipboard>
          <button className="action-btn" title="Regenerate" onClick={() => onRegenerate(entry.question)}>🔄</button>
          <button className={`action-btn ${isSpeaking ? 'speaking' : ''}`} title="Read Aloud" onClick={() => onSpeak(entry.response)}>
            {isSpeaking ? '⏹' : '🔊'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({
  chatContainerRef,
  conversationHistory,
  reply,
  soulState,
  sentimentScore,
  isThinking,
  isStreaming,
  streamingResponse,
  onSpeak,
  onRegenerate,
  onCancel,
  onExamplePrompt
}) => {
  return (
    <div className="chat-container" ref={chatContainerRef}>
      <div className="conversation-history">
        {!conversationHistory || conversationHistory.length === 0 && !isThinking && <WelcomeMessage onExampleClick={onExamplePrompt} />}

        {conversationHistory.map((entry, idx) => (
          <React.Fragment key={idx}>
            <UserMessage entry={entry} />
            <AionMessage
              entry={entry}
              onRegenerate={onRegenerate}
              onSpeak={onSpeak}
              isSpeaking={isStreaming && idx === conversationHistory.length - 1}
            />
          </React.Fragment>
        ))}

        {/* current streaming reply */}
        { (isStreaming || reply) && (
          <div className="message-wrapper">
            <div className="aion-avatar">A</div>
            <div className="aion-message streaming">
              <div className="message-header aion-header">
                <span className="mood-indicator">{soulState?.currentMood ?? 'calm'}</span>
                {sentimentScore !== undefined && (
                  <span className={`sentiment-tag ${sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral'}`}>
                    {sentimentScore > 0 ? 'Positive' : sentimentScore < 0 ? 'Negative' : 'Neutral'}
                  </span>
                )}
              </div>
              <div className="message-body">
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                  {isStreaming ? (streamingResponse || reply || '') : (reply || '')}
                </ReactMarkdown>
              </div>
              <div className="streaming-indicator">
                <span>{isStreaming ? 'AION is responding...' : 'Response ready'}</span>
                <div className="wave-animation"><div></div><div></div><div></div></div>
              </div>
            </div>
          </div>
        )}

        {isThinking && !reply && <TypingIndicator /> }
      </div>
    </div>
  );
};

export default ChatPanel;