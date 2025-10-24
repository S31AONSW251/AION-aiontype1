import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIAnalysisModal = ({ open = false, analysis = null, fileName = '', onClose = () => {} }) => {
  if (!open) return null;

  const content = analysis || {};
  const summary = content.content_summary || content.extracted_text || content.ai_understanding?.summary || '';
  const raw = JSON.stringify(content, null, 2);

  return (
    <div className="ai-analysis-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Analysis for ${fileName}`} onClick={onClose}>
      <div className="ai-analysis-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-analysis-header">
          <h3>Analysis — {fileName || 'File'}</h3>
          <button className="close-modal" onClick={onClose} aria-label="Close">✖</button>
        </div>

        <div className="ai-analysis-body">
          {summary ? (
            <div className="ai-analysis-summary">
              <h4>Summary</h4>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
            </div>
          ) : null}

          <div className="ai-analysis-full">
            <h4>Full analysis</h4>
            <pre className="mono" style={{ whiteSpace: 'pre-wrap', maxHeight: '54vh', overflow: 'auto' }}>{raw}</pre>
          </div>
        </div>

        <div className="ai-analysis-footer">
          <button className="btn primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
