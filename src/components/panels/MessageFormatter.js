import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './MessageFormatter.css';

const MessageFormatter = ({ content, isAIResponse = false }) => {
  // Custom renderers for markdown components
  const components = {
    // Code block renderer with syntax highlighting
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';
      
      if (!inline && lang) {
        return (
          <div className="code-block-wrapper">
            <div className="code-header">
              <span className="language-tag">{lang}</span>
              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(String(children))}
                title="Copy code"
              >
                <i className="icon-copy"></i>
              </button>
            </div>
            <SyntaxHighlighter
              language={lang}
              style={vscDarkPlus}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // Table renderer with custom styling
    table({ children }) {
      return (
        <div className="table-wrapper">
          <table>{children}</table>
        </div>
      );
    },

    // Link renderer with security and UX enhancements
    a({ node, children, href, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="enhanced-link"
          {...props}
        >
          {children}
          <i className="icon-external-link"></i>
        </a>
      );
    },

    // Image renderer with lazy loading and lightbox
    img({ node, src, alt, ...props }) {
      return (
        <div className="image-wrapper">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onClick={() => {
              // TODO: Implement lightbox view
            }}
            {...props}
          />
        </div>
      );
    },

    // Custom blockquote styling
    blockquote({ children }) {
      return (
        <blockquote className="enhanced-quote">
          {children}
        </blockquote>
      );
    }
  };

  return (
    <div className={`message-content ${isAIResponse ? 'ai-response' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
        className="markdown-content"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageFormatter;