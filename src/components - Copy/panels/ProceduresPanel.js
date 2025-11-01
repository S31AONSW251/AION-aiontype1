import React, { useEffect, useState, useRef, useCallback } from 'react';

const ProceduresPanel = ({ setActiveTab, notify, apiFetch }) => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [query, setQuery] = useState('');
  const socketRef = useRef(null);

  const fetchProcedures = useCallback(async () => {
    setLoading(true);
    try {
      const fetcher = apiFetch || fetch;
      const res = await fetcher('/api/procedures');
      const j = await res.json();
      if (j && j.ok) setProcedures(j.procedures || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchProcedures();
    // Setup simple SocketIO via browser native WebSocket to /socket.io/ if available
    try {
      // If socket.io.js is loaded globally
      if (window.io) {
        socketRef.current = window.io();
  socketRef.current.on('procedures_updated', () => fetchProcedures());
        socketRef.current.on('procedure_executed', (data) => {
          notify && notify({ type: 'info', text: `Procedure executed: ${data.name}` });
        });
      }
    } catch (e) {
      // ignore
    }
    return () => {
      try { socketRef.current && socketRef.current.disconnect(); } catch (e) {}
    };
  }, [fetchProcedures, notify]);

  const createProcedure = async (ev) => {
    ev && ev.preventDefault();
    if (!name || !stepsText) return;
    const steps = stepsText.split('\n').map(s => s.trim()).filter(Boolean);
    try {
  const fetcher = apiFetch || fetch;
  const res = await fetcher('/api/procedures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, steps }) });
      const j = await res.json();
      if (j && j.ok) {
        setName(''); setStepsText('');
        fetchProcedures();
        notify && notify({ type: 'success', text: 'Procedure created' });
      } else {
        notify && notify({ type: 'error', text: j && j.error ? j.error : 'Create failed' });
      }
    } catch (e) {
      notify && notify({ type: 'error', text: e.message });
    }
  };

  const executeProcedure = async (id) => {
    try {
  const fetcher = apiFetch || fetch;
  const res = await fetcher(`/api/procedures/${id}/execute`, { method: 'POST' });
      const j = await res.json();
      if (j && j.ok) {
        notify && notify({ type: 'success', text: `Executed ${j.name}` });
        fetchProcedures();
      } else {
        notify && notify({ type: 'error', text: j && j.error ? j.error : 'Execute failed' });
      }
    } catch (e) {
      notify && notify({ type: 'error', text: e.message });
    }
  };

  const searchProcedures = async () => {
    if (!query) return fetchProcedures();
    setLoading(true);
    try {
  const fetcher = apiFetch || fetch;
  const res = await fetcher(`/api/procedures/search?q=${encodeURIComponent(query)}`);
  const j = await res.json();
      if (j && j.ok) setProcedures(j.results || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <div className="panel-card procedures-panel">
      <div className="panel-header">
        <h3>Procedural Memory</h3>
        <button className="back-button" onClick={() => setActiveTab('chat')}>&larr; Back</button>
      </div>

      <div className="procedures-actions">
        <form onSubmit={createProcedure} className="create-procedure-form">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Procedure name" />
          <textarea value={stepsText} onChange={(e)=>setStepsText(e.target.value)} placeholder="Steps (one per line)" rows={4} />
          <button type="submit">Create Procedure</button>
        </form>

        <div className="procedure-search">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search procedures" />
          <button onClick={searchProcedures}>Search</button>
          <button onClick={()=>{ setQuery(''); fetchProcedures(); }}>Clear</button>
        </div>
      </div>

      <div className="procedure-list">
        {loading ? <p>Loading...</p> : (
          procedures.length ? procedures.map(p => (
            <div key={p.id} className="procedure-item">
              <div className="procedure-head">
                <strong>{p.name}</strong>
                <div className="procedure-actions">
                  <button onClick={()=>executeProcedure(p.id)}>Run</button>
                </div>
              </div>
              {Array.isArray(p.steps) ? (
                <ol>{p.steps.map((s,i)=>(<li key={i}>{s}</li>))}</ol>
              ) : (
                <pre>{String(p.steps)}</pre>
              )}
            </div>
          )) : <p>No procedures found.</p>
        )}
      </div>
    </div>
  );
};

export default ProceduresPanel;