import React, { useState, useCallback, useRef, useEffect } from 'react';
import './FileUploadPanel.css';

const FileUploadPanel = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});
  const fileInputRef = useRef(null);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      files.forEach(({preview}) => {
        if (preview) {
          try {
            URL.revokeObjectURL(preview);
          } catch (error) {
            console.error('Failed to revoke object URL:', error);
          }
        }
      });
    };
  }, [files]);

  const createObjectURL = useCallback((file) => {
    try {
      // Only create URL for valid File/Blob objects
      if (file instanceof Blob) {
        return URL.createObjectURL(file);
      }
      return null;
    } catch (error) {
      console.error('Failed to create object URL:', error);
      return null;
    }
  }, []);

  const handleFiles = useCallback(async (newFiles) => {
    // Convert files to objects with safe URL creation
    const processedFiles = newFiles.map(file => ({
      file,
      preview: file.type?.startsWith('image/') ? createObjectURL(file) : null
    }));
    
    setFiles(prev => [...prev, ...processedFiles]);
    
    for (const {file} of processedFiles) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (result.ok) {
          setAnalysisResults(prev => ({
            ...prev,
            [file.name]: result.analysis
          }));
        } else {
          console.error('Upload failed:', result.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
      setIsUploading(false);
    }
  }, [createObjectURL]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  }, [handleFiles]);

  const renderAnalysis = (analysis) => {
    if (!analysis) return null;

    return (
      <div className="analysis-container">
        <h4>File Analysis</h4>
        
        {/* Basic Info */}
        <div className="analysis-section">
          <h5>Basic Information</h5>
          <p>Type: {analysis.mime_type}</p>
          <p>Size: {analysis.size_human}</p>
          {analysis.created_at && <p>Created: {new Date(analysis.created_at).toLocaleString()}</p>}
        </div>

        {/* Content Info */}
        {analysis.content_type && (
          <div className="analysis-section">
            <h5>Content Information</h5>
            <p>Content Type: {analysis.content_type}</p>
            {analysis.metadata && Object.entries(analysis.metadata).map(([key, value]) => (
              <p key={key}>{key}: {JSON.stringify(value)}</p>
            ))}
          </div>
        )}

        {/* Content Summary */}
        {analysis.content_summary && (
          <div className="analysis-section">
            <h5>Content Preview</h5>
            <div className="content-preview">
              {analysis.content_summary}
            </div>
          </div>
        )}

        {/* AI Understanding */}
        {analysis.ai_understanding && (
          <div className="analysis-section">
            <h5>AI Understanding</h5>
            <div className="ai-analysis">
              {analysis.ai_understanding.type === 'structured' ? (
                <div>
                  {Object.entries(analysis.ai_understanding.analysis).map(([key, value]) => (
                    <div key={key} className="ai-analysis-section">
                      <h6>{key}</h6>
                      {Array.isArray(value) ? (
                        <ul>
                          {value.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : analysis.ai_understanding.type === 'unstructured' ? (
                <div className="ai-analysis-text">
                  {analysis.ai_understanding.analysis}
                </div>
              ) : (
                <div className="error">
                  {analysis.ai_understanding.error || 'Failed to analyze content'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Errors */}
        {analysis.error && (
          <div className="analysis-section error">
            <h5>Analysis Error</h5>
            <p>{analysis.error}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-upload-panel">
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          <i className="upload-icon">📁</i>
          <p>Drag and drop files here or</p>
          <button onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="upload-status">
          <p>Uploading and analyzing files...</p>
        </div>
      )}

      <div className="files-list">
        {files.map(({file, preview}, index) => (
          <div key={index} className="file-item">
            <div className="file-info">
              {preview && (
                <div className="file-preview">
                  <img src={preview} alt={`Preview of ${file.name}`} />
                </div>
              )}
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            {renderAnalysis(analysisResults[file.name])}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadPanel;