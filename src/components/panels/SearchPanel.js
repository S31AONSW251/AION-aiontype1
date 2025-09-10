import React, { useState, useEffect, useRef } from "react";

// Helper function to safely extract hostname from URLs
const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    // If URL is invalid, try to extract domain manually
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
    return match ? match[1] : 'unknown';
  }
};

// A simple hook for handling clicks outside an element
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// Add this component before the KnowledgeGraph component
const ImageGallery = ({ images, query }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="image-gallery-container">
      <h4>Visual Results for "{query}"</h4>
      <div className="image-grid">
        {images.map((img, index) => (
          <div key={index} className="image-item">
            <a href={img.url} target="_blank" rel="noopener noreferrer">
              <img 
                src={img.src} 
                alt={img.alt || `Visual result for ${query}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </a>
            {img.title && <p className="image-caption">{img.title}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 🧠 NEW: Interactive, DOM-based Knowledge Graph Component
const KnowledgeGraph = ({ query, entities, onNodeClick }) => {
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        if (!entities || entities.length === 0) return;
        
        const width = 300; // Fixed width for predictability
        const height = 300; // Fixed height
        const radius = Math.min(width, height) / 2.8;

        const centerNode = { id: 'center', label: query, x: width / 2, y: height / 2, isCenter: true };
        const entityNodes = entities.map((entity, i) => {
            const angle = (i / entities.length) * 2 * Math.PI;
            return {
                id: entity,
                label: entity,
                x: width / 2 + radius * Math.cos(angle),
                y: height / 2 + radius * Math.sin(angle),
                isCenter: false,
            };
        });
        setNodes([centerNode, ...entityNodes]);
    }, [query, entities]);

    if (!entities || entities.length === 0) return null;

    return (
        <div className="knowledge-graph-svg-wrapper">
            <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%' }}>
                {/* Draw Edges */}
                {nodes.slice(1).map(node => (
                    <line
                        key={`edge-${node.id}`}
                        x1={nodes[0].x}
                        y1={nodes[0].y}
                        x2={node.x}
                        y2={node.y}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="1"
                    />
                ))}

                {/* Draw Nodes and Labels */}
                {nodes.map(node => (
                    <g
                        key={`node-${node.id}`}
                        transform={`translate(${node.x}, ${node.y})`}
                        className={`graph-node ${node.isCenter ? 'center-node' : ''}`}
                        onClick={() => !node.isCenter && onNodeClick(node.label)}
                    >
                        <circle r={node.isCenter ? 12 : 8} />
                        <text
                            textAnchor="middle"
                            y={node.isCenter ? 25 : 20}
                            fontSize={node.isCenter ? "14px" : "12px"}
                            fontWeight={node.isCenter ? "bold" : "normal"}
                        >
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// Main Search Panel Component
const SearchPanel = ({
  agentStatus,
  searchPlan,
  thoughtProcessLog,
  searchResults,
  isSearching,
  onNewSearch,
  suggestedQueries = [],
  searchSummary,
  keyEntities = [],
  searchQuery,
  searchError, // + New prop for error messages
  onExport,    // + New prop for handling export
}) => {
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("relevance");
  
  // + State for collapsible sections
  const [planVisible, setPlanVisible] = useState(true);
  const [thoughtsVisible, setThoughtsVisible] = useState(false); // Default to hidden

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      onNewSearch(query);
      setQuery('');
    }
  };

  const sortedResults = [...searchResults].sort((a, b) => {
      if (sortOption === "relevance") return (b.score || 0) - (a.score || 0);
      if (sortOption === "date")
        return new Date(b.date || 0) - new Date(a.date || 0);
      return 0;
    });

  const completedSteps = searchPlan.filter(step => step.status === 'completed').length;
  const totalSteps = searchPlan.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  // 🚦 Find the current active step for the dynamic loading message
  const currentStep = searchPlan.find(step => step.status === 'in_progress') || 
                      searchPlan.find(step => step.status === 'pending');

  // Process images from search results
  const imageResults = searchResults
    .filter(result => result.image)
    .map((result, index) => ({
      src: result.image,
      url: result.url,
      alt: result.title,
      title: result.title,
      id: index
    }));

  const renderContent = () => {
    if (isSearching && !searchSummary) {
        return (
            <div className="search-loading agent-card">
                <div className="spinner"></div>
                <h4>{agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}...</h4>
                {/* 🚦 Dynamic Loading Message */}
                <p>{currentStep ? `Step ${completedSteps + 1}/${totalSteps}: ${currentStep.action} - ${currentStep.query}` : "Initiating research..."}</p>
                <p className="loading-subtext">AION is executing its research plan...</p>
            </div>
        );
    }
    
    if (agentStatus === 'error') {
       return (
           <div className="search-error agent-card">
              <h4>Research Failed</h4>
              <p>AION was unable to complete the research task.</p>
              <p className="error-message">{searchError || "An unknown error occurred."}</p>
           </div>
       )
    }

    if (!searchSummary && !isSearching) {
        return (
            <div className="no-results agent-card">
                <h3>Welcome to the Research Panel</h3>
                <p>Ask AION to investigate a topic, for example:</p>
                <div className="example-prompts">
                   <button className="suggestion-button" onClick={() => onNewSearch("The impact of quantum computing on cryptography")}>
                      "The impact of quantum computing on cryptography"
                   </button>
                   <button className="suggestion-button" onClick={() => onNewSearch("Recent breakthroughs in generative AI")}>
                      "Recent breakthroughs in generative AI"
                   </button>
                </div>
            </div>
        );
    }

    // Default view with results
    return (
        <>
            {searchSummary && (
                <div className="search-summary agent-card">
                    <div className="summary-header">
                        <h4>Synthesized Summary</h4>
                        {/* 🎛️ Export Button */}
                        <button onClick={onExport} className="export-button" title="Export as Markdown">
                            Export
                        </button>
                    </div>
                    <p>{searchSummary}</p>
                </div>
            )}

            {/* NEW: Image Gallery Block */}
            {imageResults.length > 0 && (
              <div className="image-gallery-block agent-card">
                <ImageGallery images={imageResults} query={searchQuery} />
              </div>
            )}

            {searchResults.length > 0 && (
                <div className="search-results-container agent-card">
                    <div className="results-header">
                        <h4>
                            Knowledge Sources
                            <span className="result-count">({searchResults?.length || 0} found)</span>
                        </h4>
                        <div className="sort-controls">
                            <label>Sort by:</label>
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                <option value="relevance">Relevance</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                    </div>

                    <div className="search-results">
                        {sortedResults.map((result, index) => (
                            <div key={index} className="search-result">
                                <div className="result-main">
                                    {/* ✨ Favicon - Fixed with safe URL handling */}
                                    <img 
                                      src={`https://www.google.com/s2/favicons?domain=${getHostname(result.url)}&sz=32`} 
                                      alt="source favicon" 
                                      className="result-favicon" 
                                    />
                                    <div className="result-content">
                                        <h4>
                                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                                                {result.title}
                                            </a>
                                        </h4>
                                        {/* ✨ Snippet */}
                                        <p className="result-snippet">{result.snippet || "No snippet available."}</p>
                                    </div>
                                </div>
                                <div className="result-meta">
                                    {/* ✨ Result source - Fixed with safe URL handling */}
                                    <span className="result-source">{getHostname(result.url)}</span>
                                    {/* ✨ Date */}
                                    {result.date && <span className="result-date">{new Date(result.date).toLocaleDateString()}</span>}
                                    {result.score !== undefined && (<span className="result-score">Relevance: {(result.score * 100).toFixed(0)}%</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {!isSearching && suggestedQueries?.length > 0 && (
                <div className="suggested-queries agent-card">
                    <h4>Suggested Follow-up Research</h4>
                    <ul>
                        {suggestedQueries.map((s, i) => (
                            <li key={i}>
                                <button className="suggestion-button" onClick={() => onNewSearch(s)}>
                                    {s}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
  };
  

  return (
    <div className="search-panel">
      <div className="search-panel-header">
        <h3>Autonomous Web Agent</h3>
        <div className="agent-status-container">
          <span className={`status-indicator ${agentStatus}`}></span>
          <strong>Agent Status:</strong>
          <span className={`agent-status ${agentStatus}`}>{agentStatus}</span>
        </div>
      </div>

      <div className="search-input-container">
        <input
          type="text"
          value={query}
          placeholder="Ask AION to research a new topic..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
        />
        <button onClick={() => { if (query.trim()) onNewSearch(query); setQuery(''); }} disabled={!query.trim() || isSearching}>
          {isSearching ? 'Working...' : 'Initiate Research'}
        </button>
      </div>

      <div className="agent-dashboard">
        {/* Left Column: Plan & Thoughts */}
        <div className="agent-left-column">
          {searchPlan?.length > 0 && (
            <div className="agent-plan agent-card">
              <div className="card-header" onClick={() => setPlanVisible(!planVisible)}>
                 <h4>Research Plan</h4>
                 <button className="toggle-vis-button">{planVisible ? 'Hide' : 'Show'}</button>
              </div>
              {planVisible && (
                <>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  </div>
                  <ol>
                    {searchPlan.map((step, index) => (
                      <li key={index} className={`plan-step ${step.status}`}>
                        <span className="step-icon"></span>
                        <strong>{step.action}:</strong> {step.query}
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}

          {thoughtProcessLog?.length > 1 && ( // Only show if there's more than the initial log
            <div className="agent-thought-process agent-card">
              <div className="card-header" onClick={() => setThoughtsVisible(!thoughtsVisible)}>
                <h4>Thought Process Log</h4>
                <button className="toggle-vis-button">{thoughtsVisible ? 'Hide' : 'Show'}</button>
              </div>
              {thoughtsVisible && <pre>{thoughtProcessLog.join("\n")}</pre>}
            </div>
          )}
          
          {keyEntities.length > 0 && (
            <div className="key-entities-container agent-card">
              <h4>Knowledge Graph</h4>
              <div className="graph-wrapper">
                 <KnowledgeGraph query={searchQuery} entities={keyEntities} onNodeClick={onNewSearch} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results & Suggestions */}
        <div className="agent-right-column">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;