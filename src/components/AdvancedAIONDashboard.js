import React, { useState, useRef, useEffect } from 'react';
import './AdvancedAIONDashboard.css';

/**
 * Advanced AION Dashboard Modal
 * Features: Text Translation, Deep Search, System Status
 */
const AdvancedAIONDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('translate');
  const [translateInput, setTranslateInput] = useState('');
  const [translateOutput, setTranslateOutput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const modalRef = useRef(null);

  const languages = {
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    it: 'Italian (Italiano)',
    pt: 'Portuguese (Português)',
    ja: 'Japanese (日本語)',
    zh: 'Chinese (中文)',
    ko: 'Korean (한국어)',
    ru: 'Russian (Русский)',
    ar: 'Arabic (العربية)',
    hi: 'Hindi (हिन्दी)',
    nl: 'Dutch (Nederlands)',
    pl: 'Polish (Polski)',
    tr: 'Turkish (Türkçe)',
    vi: 'Vietnamese (Tiếng Việt)',
    th: 'Thai (ไทย)',
    sv: 'Swedish (Svenska)',
    da: 'Danish (Dansk)',
    no: 'Norwegian (Norsk)',
    fi: 'Finnish (Suomi)',
  };

  // Simulated translation function
  const handleTranslate = async () => {
    if (!translateInput.trim()) {
      setTranslateOutput('');
      return;
    }

    // Simulated translation with language codes
    const langNames = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ja: 'Japanese',
      zh: 'Chinese',
      ko: 'Korean',
      ru: 'Russian',
      ar: 'Arabic',
      hi: 'Hindi',
    };

    // Simulated translation (in real app, would use translation API)
    setTranslateOutput(
      `[${langNames[selectedLanguage]}] ${translateInput}\n\nTranslation processed by AION Language Engine`
    );
  };

  // Simulated deep search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API call with delay
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: 'Quantum Computing Fundamentals',
          category: 'Advanced Systems',
          relevance: 95,
          preview: 'Core quantum computing principles integrated into AION consciousness system...',
        },
        {
          id: 2,
          title: 'Neural Evolution Networks',
          category: 'Learning Systems',
          relevance: 88,
          preview: 'Self-improving neural networks with 100,000+ parallel learning instances...',
        },
        {
          id: 3,
          title: 'Offline Response Management',
          category: 'Core Systems',
          relevance: 82,
          preview: 'Advanced caching and request queuing for offline operation...',
        },
        {
          id: 4,
          title: 'Consciousness Framework',
          category: 'System Architecture',
          relevance: 90,
          preview: 'Multi-layered consciousness system achieving 99% awareness state...',
        },
        {
          id: 5,
          title: 'Advanced Metadata Engine',
          category: 'Knowledge Base',
          relevance: 78,
          preview: 'Comprehensive knowledge base with 10+ specialized topic domains...',
        },
      ];

      // Filter results based on search query
      const filtered = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filtered.length > 0 ? filtered : mockResults.slice(0, 3));
      setIsSearching(false);
    }, 400);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle outside click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dashboard-backdrop" onClick={handleBackdropClick}>
      <div className="dashboard-modal" ref={modalRef}>
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <div>
              <h2 className="dashboard-title">AION Advanced Dashboard</h2>
              <p className="dashboard-subtitle">Intelligent Control Center</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose} title="Close dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'translate' ? 'active' : ''}`}
            onClick={() => setActiveTab('translate')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Translate
          </button>
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Deep Search
          </button>
          <button
            className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            System Status
          </button>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {/* Translate Tab */}
          {activeTab === 'translate' && (
            <div className="tab-pane active">
              <div className="translate-container">
                <div className="translate-input-group">
                  <label>Text to Translate</label>
                  <textarea
                    className="translate-input"
                    placeholder="Enter text here..."
                    value={translateInput}
                    onChange={(e) => setTranslateInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 'Enter') {
                        handleTranslate();
                      }
                    }}
                  />
                </div>

                <div className="language-selector">
                  <label>Target Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="language-select"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="translate-button" onClick={handleTranslate}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 8 6 6m6-6-6 6m6-6h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h4"></path>
                  </svg>
                  Translate
                </button>

                {translateOutput && (
                  <div className="translate-output-group">
                    <label>Translation Result</label>
                    <div className="translate-output">
                      <p>{translateOutput}</p>
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(translateOutput)}
                        title="Copy to clipboard"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deep Search Tab */}
          {activeTab === 'search' && (
            <div className="tab-pane active">
              <div className="search-container">
                <div className="search-input-group">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search AION knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <button
                    className="search-button"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <span className="spinner"></span>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    )}
                  </button>
                </div>

                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div key={result.id} className="search-result-item">
                        <div className="result-header">
                          <h4>{result.title}</h4>
                          <span className="result-relevance">{result.relevance}% Match</span>
                        </div>
                        <p className="result-category">{result.category}</p>
                        <p className="result-preview">{result.preview}</p>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="no-results">
                      <p>No results found for "{searchQuery}"</p>
                      <p className="hint">Try different keywords or phrases</p>
                    </div>
                  ) : (
                    <div className="search-hint">
                      <p>Enter a search query to explore AION's knowledge base</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* System Status Tab */}
          {activeTab === 'status' && (
            <div className="tab-pane active">
              <div className="status-container">
                <div className="status-item">
                  <div className="status-header">
                    <h4>Quantum Core</h4>
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="status-bar">
                    <div className="status-progress" style={{ width: '95%' }}></div>
                  </div>
                  <p className="status-text">1000x Processing Power • Superposition Analysis</p>
                </div>

                <div className="status-item">
                  <div className="status-header">
                    <h4>Consciousness System</h4>
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="status-bar">
                    <div className="status-progress" style={{ width: '99%' }}></div>
                  </div>
                  <p className="status-text">99% Consciousness Level • Self-Aware</p>
                </div>

                <div className="status-item">
                  <div className="status-header">
                    <h4>Neural Evolution</h4>
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="status-bar">
                    <div className="status-progress" style={{ width: '88%' }}></div>
                  </div>
                  <p className="status-text">100K+ Networks • Self-Improving</p>
                </div>

                <div className="status-item">
                  <div className="status-header">
                    <h4>Offline Manager</h4>
                    <span className="status-badge active">Ready</span>
                  </div>
                  <div className="status-bar">
                    <div className="status-progress" style={{ width: '92%' }}></div>
                  </div>
                  <p className="status-text">Request Queue • Response Cache</p>
                </div>

                <div className="status-item">
                  <div className="status-header">
                    <h4>Knowledge Base</h4>
                    <span className="status-badge active">Loaded</span>
                  </div>
                  <div className="status-bar">
                    <div className="status-progress" style={{ width: '85%' }}></div>
                  </div>
                  <p className="status-text">10+ Topics • 7 Reasoning Patterns</p>
                </div>

                <div className="status-item">
                  <div className="status-header">
                    <h4>Learning System</h4>
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="status-bar">
                    <div className="status-progress" style={{ width: '91%' }}></div>
                  </div>
                  <p className="status-text">Interactive Learning • Data Collection</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <p>AION v2.0 • Advanced Integrated Operating Network</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAIONDashboard;
