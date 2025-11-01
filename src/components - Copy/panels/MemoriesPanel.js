import React, { useState, useCallback, useEffect } from 'react';
import Icon from '../../components/ui/Icon';
import Tooltip from '../../components/ui/Tooltip';
import './MemoriesPanel.css';

// Ultra Memory Manager Component (enhanced)
const MemoryManager = ({ 
  soulState, 
  onMemoryUpdate,
  onMemoryRetrieval,
  onMemoryConsolidation
}) => {
  const [memoryQuery, setMemoryQuery] = useState('');
  const [retrievalResults, setRetrievalResults] = useState([]);
  const [consolidationStatus, setConsolidationStatus] = useState('idle');
  const [memoryStats, setMemoryStats] = useState({
    total: 0,
    shortTerm: 0,
    longTerm: 0,
    episodic: 0,
    procedural: 0
  });
  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aion_pinned_memories') || '[]'); } catch(e){ return []; }
  });
  const [palette, setPalette] = useState(() => {
    try { return localStorage.getItem('aion_memories_palette') || 'default'; } catch(e){ return 'default'; }
  });
  const [compactView, setCompactView] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aion_memories_compact') || 'false'); } catch(e){ return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('aion_memories_palette', palette); } catch(e){}
  }, [palette]);
  useEffect(() => {
    try { localStorage.setItem('aion_memories_compact', JSON.stringify(!!compactView)); } catch(e){}
  }, [compactView]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Keep stats in sync when soulState changes
  useEffect(() => updateMemoryStats(), [soulState]);

  // Enhanced memory retrieval with semantic search
  // Update memory statistics
  const updateMemoryStats = useCallback(() => {
    if (!soulState) return;
    
    const stats = {
      total: (soulState.memories?.length || 0) + 
             (soulState.longTermMemory?.length || 0) +
             (soulState.episodicMemory?.length || 0) +
             (soulState.proceduralMemory?.length || 0),
      shortTerm: soulState.memories?.length || 0,
      longTerm: soulState.longTermMemory?.length || 0,
      episodic: soulState.episodicMemory?.length || 0,
      procedural: soulState.proceduralMemory?.length || 0
    };
    
    setMemoryStats(stats);
  }, [soulState]);

  // persist pinned ids
  useEffect(() => {
    try { localStorage.setItem('aion_pinned_memories', JSON.stringify(pinnedIds)); } catch(e){}
  }, [pinnedIds]);

  // Enhanced memory retrieval with semantic search
  const handleMemoryRetrieval = useCallback(async (query) => {
    if (!query.trim()) return;
    
    try {
      setConsolidationStatus('searching');
      
      // This would connect to a vector database or semantic search system
      const results = await onMemoryRetrieval(query);
      
      setRetrievalResults(results);
      setConsolidationStatus('complete');
      
      // Update statistics
      updateMemoryStats();
      
    } catch (error) {
      console.error("Memory retrieval error:", error);
      setConsolidationStatus('error');
    }
  }, [onMemoryRetrieval, updateMemoryStats]);

  // Memory consolidation process
  const handleMemoryConsolidation = useCallback(async () => {
    try {
      setConsolidationStatus('consolidating');
      
      // This would trigger the memory consolidation process
      await onMemoryConsolidation();
      
      setConsolidationStatus('complete');
      updateMemoryStats();
      
      setTimeout(() => setConsolidationStatus('idle'), 2000);
    } catch (error) {
      console.error("Memory consolidation error:", error);
      setConsolidationStatus('error');
    }
  }, [onMemoryConsolidation, updateMemoryStats]);


  // Memory cleanup process
  const handleMemoryCleanup = useCallback(async () => {
    try {
      setConsolidationStatus('cleaning');
      
      // This would trigger a memory cleanup/pruning process
      // based on importance, recency, and relevance
      
      setTimeout(() => {
        setConsolidationStatus('complete');
        updateMemoryStats();
        setTimeout(() => setConsolidationStatus('idle'), 1500);
      }, 1000);
    } catch (error) {
      console.error("Memory cleanup error:", error);
      setConsolidationStatus('error');
    }
  }, [updateMemoryStats]);

  const togglePin = (id) => {
    setPinnedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev];
      return next;
    });
  };

  const exportMemories = () => {
    try {
      const data = JSON.stringify(retrievalResults, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'aion-memories-export.json'; document.body.appendChild(a); a.click(); a.remove();
      try { URL.revokeObjectURL(url); } catch(e){}
    } catch (e) { console.error(e); }
  };

  const importMemories = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setRetrievalResults(parsed || []);
      } catch (err) { console.error('Import failed', err); }
    };
    reader.readAsText(file);
  };

  const filteredResults = retrievalResults
    .filter(r => filterType === 'all' ? true : (r.metadata?.type === filterType))
    .sort((a,b) => {
      if (sortBy === 'relevance') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'time') return new Date(b.metadata?.timestamp || 0) - new Date(a.metadata?.timestamp || 0);
      return 0;
    });

  // Highlight matches (simple token regex) for showing snippets
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
  const highlightMatches = (text, query) => {
    if (!query) return escapeHtml(text || '');
    const tokens = query.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    if (!tokens.length) return escapeHtml(text || '');
    const re = new RegExp('(' + tokens.join('|') + ')', 'ig');
    return escapeHtml(text || '').replace(re, '<mark>$1</mark>');
  };

  // Fuzzy snippet extraction: return a short highlighted snippet around the best match
  const generateSnippet = (text = '', query = '', maxLen = 140) => {
    const raw = String(text || '');
    if (!query || !raw) return { snippet: escapeHtml(raw.slice(0, maxLen)), score: 0 };
    const tokens = query.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    if (!tokens.length) return { snippet: escapeHtml(raw.slice(0, maxLen)), score: 0 };

    const re = new RegExp(tokens.join('|'), 'ig');
    let match;
    const matches = [];
    while ((match = re.exec(raw)) !== null) {
      matches.push({ index: match.index, text: match[0] });
      if (re.lastIndex === match.index) re.lastIndex++;
    }

    if (!matches.length) return { snippet: escapeHtml(raw.slice(0, maxLen)), score: 0 };

    const best = matches.reduce((a,b) => (a.index <= b.index ? a : b));
    const center = best.index;
    const half = Math.floor(maxLen/2);
    let start = Math.max(0, center - half);
    let end = Math.min(raw.length, start + maxLen);
    if (end - start < maxLen) start = Math.max(0, end - maxLen);
    const window = raw.slice(start, end);
    const highlighted = highlightMatches(window, query);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < raw.length ? '…' : '';
    return { snippet: prefix + highlighted + suffix, score: matches.length };
  };

  const pinnedResults = retrievalResults.filter(r => pinnedIds.includes(r.id));
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pinnedDrawerOpen, setPinnedDrawerOpen] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  // derive pinned results in pinnedIds order (preserve order and allow missing items)
  const orderedPinnedResults = pinnedIds.map(id => retrievalResults.find(r => r.id === id)).filter(Boolean);

  // Drag-and-drop handlers for pinned reorder
  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch(e){}
  };

  const onDragOver = (e, overId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDropOnPinned = (e, overId) => {
    e.preventDefault();
    const id = draggingId || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
    if (!id) return;
    const fromIndex = pinnedIds.indexOf(id);
    const toIndex = Math.max(0, pinnedIds.indexOf(overId));
    if (fromIndex === -1) return;
    const next = [...pinnedIds];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, id);
    setPinnedIds(next);
    setDraggingId(null);
  };

  const onDropToEnd = (e) => {
    e.preventDefault();
    const id = draggingId || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
    if (!id) return;
    const next = pinnedIds.filter(x => x !== id);
    next.push(id);
    setPinnedIds(next);
    setDraggingId(null);
  };

  const bulkUnpinAll = () => setPinnedIds([]);

  const [editingDraft, setEditingDraft] = useState(null);

  // Keyboard reordering helpers for accessibility
  const movePinnedUp = (id) => {
    setPinnedIds(prev => {
      const i = prev.indexOf(id);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i-1], next[i]] = [next[i], next[i-1]];
      return next;
    });
  };

  const movePinnedDown = (id) => {
    setPinnedIds(prev => {
      const i = prev.indexOf(id);
      if (i === -1 || i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i+1]] = [next[i+1], next[i]];
      return next;
    });
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setEditingDraft(item ? { ...item } : null);
  };

  const closeEdit = () => {
    setEditingItem(null);
    setEditingDraft(null);
  };

  const saveEdit = () => {
    const updated = editingDraft;
    if (!updated) return;
    setRetrievalResults(prev => prev.map(r => r.id === updated.id ? updated : r));
    try { onMemoryUpdate && onMemoryUpdate(updated); } catch(e){}
    closeEdit();
  };

  return (
  <div className="memory-manager">
      <div className={`memory-hero hero-palette-${palette}`} style={{'--palette': palette}}>
        <div className="hero-icon" aria-hidden>
          {/* use shared Icon component so theming is consistent */}
          <Icon name="katex" size={28} className="hero-icon-svg" />
        </div>
        <div className="hero-texts">
          <h2>Memories</h2>
          <p className="hero-sub">Search, pin, and curate the agent's memories. Use semantic retrieval to find relevant memories fast.</p>
        </div>
        <div className="hero-actions">
          <Tooltip text={pinnedDrawerOpen ? 'Close pin manager' : 'Open pin manager'}>
            <button className="action-btn ghost" onClick={() => setPinnedDrawerOpen(s => !s)}>{pinnedDrawerOpen ? 'Close Pins' : 'Pins'}</button>
          </Tooltip>
          <Tooltip text="Export currently visible results">
            <button className="action-btn" onClick={() => exportMemories()}>Export</button>
          </Tooltip>
          <div className="palette-toggle" role="group" aria-label="Palette selector">
            <button className={`action-btn ${palette==='default'?'active':''}`} title="Default palette" onClick={() => setPalette('default')}>Default</button>
            <button className={`action-btn ${palette==='magenta'?'active':''}`} title="Magenta / Cyan" onClick={() => setPalette('magenta')}>Magenta</button>
            <button className={`action-btn ${palette==='cyan'?'active':''}`} title="Cyan / Lime" onClick={() => setPalette('cyan')}>Cyan</button>
          </div>
          <Tooltip text={compactView ? 'Switch to expanded view' : 'Switch to compact view'}>
            <button className="action-btn" onClick={() => setCompactView(s => !s)}>{compactView ? 'Expanded' : 'Compact'}</button>
          </Tooltip>
        </div>
      </div>
      
      <div className="memory-stats">
        <div className="stat">
          <span className="stat-label">Total Memories:</span>
          <span className="stat-value">{memoryStats.total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Short-Term:</span>
          <span className="stat-value">{memoryStats.shortTerm}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Long-Term:</span>
          <span className="stat-value">{memoryStats.longTerm}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Episodic:</span>
          <span className="stat-value">{memoryStats.episodic}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Procedural:</span>
          <span className="stat-value">{memoryStats.procedural}</span>
        </div>
      </div>
      
  <div className="memory-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search memories semantically..."
            value={memoryQuery}
            onChange={(e) => setMemoryQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="search-btn"
            onClick={() => handleMemoryRetrieval(memoryQuery)}
          >
            Retrieve
          </button>
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <label style={{fontSize:12, color:'var(--muted)'}}>Filter</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="episodic">Episodic</option>
            <option value="procedural">Procedural</option>
            <option value="longterm">Long-term</option>
          </select>

          <label style={{fontSize:12, color:'var(--muted)'}}>Sort</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="time">Newest</option>
          </select>
        </div>

  <div className="management-buttons">
          <button 
            className={`consolidate-btn ${consolidationStatus}`}
            onClick={handleMemoryConsolidation}
            disabled={consolidationStatus === 'consolidating'}
          >
            {consolidationStatus === 'consolidating' 
              ? 'Consolidating...' 
              : 'Consolidate'}
          </button>
          
          <button 
            className="cleanup-btn"
            onClick={handleMemoryCleanup}
            disabled={consolidationStatus === 'cleaning'}
          >
            {consolidationStatus === 'cleaning' 
              ? 'Cleaning...' 
              : 'Cleanup'}
          </button>
        </div>

      </div>

      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
        <button className="action-btn" onClick={() => setPinnedDrawerOpen(s => !s)}>{pinnedDrawerOpen ? 'Close Pins' : 'Manage Pins'}</button>
        <button className="action-btn" onClick={() => setShowOnlyPinned(s => !s)}>{showOnlyPinned ? 'Show All' : 'Show Pinned'}</button>
        <div style={{flex:1}} />
        {orderedPinnedResults.length > 0 && (
          <div style={{display:'flex', gap:8}}>
            {orderedPinnedResults.slice(0,5).map(p => {
              const s = generateSnippet(p.text, memoryQuery, 80);
              return (
                <div key={p.id} className={`pinned-card ${pinnedIds.includes(p.id)?'shimmer':''}`} title={(p.text||'').slice(0,120)} onClick={() => openEdit(p)} dangerouslySetInnerHTML={{__html: s.snippet}} />
              );
            })}
          </div>
        )}
      </div>
      
      {((showOnlyPinned ? pinnedResults : filteredResults).length > 0) && (
        <div className="retrieval-results">
          <h3>Retrieval Results</h3>
          <div className={`results-list ${compactView ? 'compact' : ''}`} role="list">
            {(showOnlyPinned ? pinnedResults : filteredResults).map((result, index) => (
              <div key={index} className={`result-item ${compactView? 'compact':''}`} role="listitem" aria-label={`memory-${result.id}`}>
                <div className="pin-indicator">
                  <button className="action-btn" onClick={() => togglePin(result.id)} aria-pressed={pinnedIds.includes(result.id)} aria-label={pinnedIds.includes(result.id) ? 'Unpin memory' : 'Pin memory'}>{pinnedIds.includes(result.id) ? '📌' : '📍'}</button>
                </div>
                <div className="result-score">Relevance: {result.score?.toFixed ? result.score.toFixed(4) : (result.score || 0)}</div>
                {/* render a compact highlighted snippet */}
                {(() => {
                  const sn = generateSnippet(result.text, memoryQuery, 140);
                  return <div className="result-content" dangerouslySetInnerHTML={{ __html: sn.snippet }} />;
                })()}
                {result.metadata && (
                  <div className="result-metadata">
                    {result.metadata.timestamp && (
                      <span className="result-time">{result.metadata.timestamp}</span>
                    )}
                    {result.metadata.type && (
                      <span className="result-type">{result.metadata.type}</span>
                    )}
                  </div>
                )}
                <div className="result-actions">
                  <button className="action-btn" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(result.text); }}>Copy</button>
                  <button className="action-btn" onClick={() => openEdit(result)}>Edit</button>
                </div>
              </div>
            ))}
          </div>

          <div className="export-controls">
            <button onClick={exportMemories} className="action-btn">Export Results</button>
            <label className="action-btn" style={{cursor:'pointer'}}>
              Import
              <input type="file" accept="application/json" style={{display:'none'}} onChange={(e) => importMemories(e.target.files[0])} />
            </label>
            {orderedPinnedResults.length > 0 && (
              <button className="action-btn" onClick={bulkUnpinAll}>Unpin All</button>
            )}
          </div>
        </div>
      )}

      {pinnedDrawerOpen && (
        <div className="pins-drawer" onDragOver={(e)=>e.preventDefault()} onDrop={onDropToEnd}>
          <h4>Pinned Memories</h4>
          <div className="drawer-actions">
            <button className="action-btn" onClick={() => setPinnedDrawerOpen(false)}>Close</button>
            <button className="action-btn" onClick={bulkUnpinAll}>Unpin All</button>
          </div>
          {orderedPinnedResults.map((p, idx) => (
            <div key={p.id}
                 role="listitem"
                 draggable
                 aria-grabbed={draggingId===p.id}
                 tabIndex={0}
                 onKeyDown={(e) => {
                   if (e.key === 'ArrowUp') { e.preventDefault(); movePinnedUp(p.id); }
                   if (e.key === 'ArrowDown') { e.preventDefault(); movePinnedDown(p.id); }
                   if (e.key === 'Enter') { e.preventDefault(); togglePin(p.id); }
                 }}
                 onDragStart={(e)=>onDragStart(e,p.id)}
                 onDragOver={(e)=>onDragOver(e,p.id)}
                 onDrop={(e)=>onDropOnPinned(e,p.id)}
                 className={`draggable-item ${draggingId===p.id ? 'dragging':''}`}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <strong>{p.metadata?.type || 'Memory'}</strong>
                  <div style={{fontSize:13,color:'var(--muted)'}} dangerouslySetInnerHTML={{ __html: generateSnippet(p.text||'', memoryQuery, 120).snippet }} />
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <button className={`action-btn ${pinnedIds.includes(p.id) ? 'pinned':''}`} onClick={() => togglePin(p.id)} aria-pressed={pinnedIds.includes(p.id)}>{pinnedIds.includes(p.id)?'Unpin':'Pin'}</button>
                  <div style={{display:'flex',gap:6}}>
                    <button className="action-btn" onClick={() => movePinnedUp(p.id)} aria-label="Move pin up">↑</button>
                    <button className="action-btn" onClick={() => movePinnedDown(p.id)} aria-label="Move pin down">↓</button>
                    <button className="action-btn" onClick={() => openEdit(p)}>Edit</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="status-indicator">
        Status: <span className={`status-${consolidationStatus}`}>{consolidationStatus}</span>
      </div>

      {editingItem && editingDraft && (
        <div className="mem-edit-backdrop">
          <div className="mem-edit-modal">
            <h3>Edit Memory</h3>
            <label style={{fontSize:12,color:'var(--muted)'}}>Type</label>
            <input style={{width:'100%',padding:8,borderRadius:6,marginBottom:8,border:'1px solid var(--glass-border)'}} value={editingDraft.metadata?.type || ''} onChange={(e) => setEditingDraft(d => ({ ...d, metadata: { ...d.metadata, type: e.target.value } }))} />
            <label style={{fontSize:12,color:'var(--muted)'}}>Timestamp</label>
            <input style={{width:'100%',padding:8,borderRadius:6,marginBottom:8,border:'1px solid var(--glass-border)'}} value={editingDraft.metadata?.timestamp || ''} onChange={(e) => setEditingDraft(d => ({ ...d, metadata: { ...d.metadata, timestamp: e.target.value } }))} />
            <label style={{fontSize:12,color:'var(--muted)'}}>Content</label>
            <textarea value={editingDraft.text} onChange={(e) => setEditingDraft(d => ({ ...d, text: e.target.value }))} />
            <div className="mem-edit-footer">
              <button className="action-btn" onClick={closeEdit}>Cancel</button>
              <button className="action-btn" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryManager;
