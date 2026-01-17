import React, { useState, useRef } from 'react';
import { apiFetch, safeJson } from '../lib/fetchHelper';

export default function RagPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  async function runQuery() {
    if (!query || query.trim().length === 0) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const resp = await apiFetch('/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 6 })
      });
      const wrap = await safeJson(resp).catch(() => null);
      const data = wrap ? (wrap.json || null) : null;
      if (!resp || !resp.ok) throw new Error((wrap && wrap.text) || (data && data.error) || 'Query failed');
      setResults((data && data.results) || []);
      // Focus first result for keyboard users
      setTimeout(() => {
        const el = document.querySelector('.rag-result');
        if (el) el.focus();
      }, 50);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function ingestSample() {
    setLoading(true);
    setError(null);
    try {
      const docs = [
        { id: 'sample-1', text: 'AION is an experimental AI system that uses retrieval and models to answer questions.', metadata: { source: 'sample' } },
        { id: 'sample-2', text: 'The sky is blue during the day because scattering of sunlight by the atmosphere.', metadata: { source: 'sample' } }
      ];
      const resp = await apiFetch('/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: docs })
      });
      const wrap = await safeJson(resp).catch(() => null);
      const data = wrap ? (wrap.json || null) : null;
      if (!resp || !resp.ok) throw new Error((wrap && wrap.text) || (data && data.error) || 'Ingest failed');
      setResults([{ id: 'ingested', text: `Ingested ${((data && data.ingested) || 'some')} documents.`, metadata: { source: 'system' }, score: 1.0 }]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
  }

  return (
    React.createElement('section', { role: 'region', 'aria-label': 'Retrieval Augmented Generation Panel' }, [
      React.createElement('h2', { key: 'h', style: { marginBottom: 8 } }, 'AION — RAG Panel'),

      React.createElement('div', { key: 'controls', style: { marginBottom: 12 } }, [
        React.createElement('label', { key: 'lbl', htmlFor: 'rag-query', style: { display: 'block', marginBottom: 6, color: 'rgba(230,238,246,0.85)' } }, 'Ask AION (Ctrl/Cmd+Enter to submit)'),
        React.createElement('textarea', {
          id: 'rag-query',
          key: 't',
          ref: textareaRef,
          rows: 4,
          value: query,
          onChange: e => setQuery(e.target.value),
          onKeyDown,
          placeholder: 'Enter your question or query here',
          style: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,8,16,0.5)', color: '#e6eef6' }
        }),

        React.createElement('div', { key: 'btns', style: { marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }, [
          React.createElement('button', { key: 'q', onClick: runQuery, disabled: loading || !query.trim(), className: 'submit-btn' }, loading ? 'Querying...' : 'Query RAG'),
          React.createElement('button', { key: 'i', onClick: ingestSample, disabled: loading, className: 'btn-outline' }, 'Ingest sample docs'),
          React.createElement('button', { key: 'demo', onClick: () => { setQuery('what color is the sky?'); setTimeout(runQuery, 120); }, disabled: loading, className: 'btn-outline' }, 'Try demo query')
        ])
      ]),

      error ? React.createElement('div', { key: 'err', role: 'alert', style: { color: '#ffb6b6', background: '#2b0b0b', padding: 10, borderRadius: 8 } }, String(error)) : null,

      loading && !results ? React.createElement('div', { key: 'skeleton', 'aria-hidden': true }, [
        ...[0,1,2].map(i => React.createElement('div', { key: i, style: { height: 80, borderRadius: 8, background: 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', marginBottom: 10 } }))
      ]) : null,

      results ? React.createElement('div', { key: 'res', style: { marginTop: 12, display: 'grid', gap: 12 } }, [
        React.createElement('h3', { key: 'rh' }, 'Results'),
        results.length === 0 ? React.createElement('div', { key: 'empty', style: { color: '#9fb0bf' } }, 'No results — try ingesting sample docs.') : null,
        results.map((r, i) => React.createElement('article', {
          key: String(i),
          tabIndex: 0,
          className: 'rag-result',
          style: { padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, rgba(7,18,38,0.6), rgba(10,20,40,0.45))', border: '1px solid rgba(255,255,255,0.04)', outline: 'none' }
        }, [
          React.createElement('div', { key: 'meta', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
            React.createElement('strong', { key: 'id', style: { color: '#c6d6e6' } }, r.metadata && r.metadata.source ? `${r.metadata.source} — ${r.id}` : (r.id || 'result')),
            React.createElement('span', { key: 'score', style: { fontSize: 12, color: '#9fb0bf' } }, `score: ${typeof r.score === 'number' ? r.score.toFixed(4) : r.score}`)
          ]),
          React.createElement('div', { key: 'text', style: { marginTop: 8, color: '#dbeef8' } }, r.text || r.content || r.snippet || ''),
          React.createElement('div', { key: 'actions', style: { marginTop: 10, display: 'flex', gap: 8 } }, [
            React.createElement('button', { key: 'copy', onClick: () => { navigator.clipboard && navigator.clipboard.writeText(r.text || r.content || ''); }, className: 'btn-outline' }, 'Copy'),
            React.createElement('button', { key: 'use', onClick: () => { setQuery(r.text || r.content || ''); textareaRef.current && textareaRef.current.focus(); }, className: 'btn-outline' }, 'Use in query')
          ])
        ]))
      ]) : null
    ])
  );
}
