import React, { useState, useEffect } from 'react';

export default function WebCachePanel({ apiBase='' , apiFetch }){
  const [items, setItems] = useState([]);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('aion_session') || `sess-${Math.random().toString(36).slice(2,9)}`);
  const [consent, setConsent] = useState(false);

  useEffect(()=>{ localStorage.setItem('aion_session', sessionId); }, [sessionId]);

  async function load(){
    try{
      const res = await fetch((apiBase||'') + '/webcache');
      if(!res.ok) return;
      const j = await res.json();
      if(j && j.items) setItems(j.items);
    }catch(e){ console.warn(e); }
  }

  useEffect(()=>{ load(); }, []);

  async function setSessionConsent(v){
    try{
      const res = await fetch((apiBase||'') + '/session/consent', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ session_id: sessionId, consent: !!v }) });
      if(res.ok){ setConsent(!!v); }
    }catch(e){ console.warn(e); }
  }

  return (
    <div className="panel webcache-panel">
      <h3>Web Cache</h3>
      <div style={{marginBottom:8}}>
        <label>Session ID: <input value={sessionId} onChange={(e)=>setSessionId(e.target.value)} /></label>
        <button onClick={()=>setSessionConsent(!consent)} style={{marginLeft:8}}>{consent ? 'Revoke Consent' : 'Opt-in for Web Collection'}</button>
      </div>
      <div>
        <button onClick={load}>Refresh</button>
      </div>
      <ul>
        {items.map(it => (
          <li key={it.id} style={{marginBottom:6}}>
            <strong>{it.topic}</strong> — <em>{it.title}</em><br/>
            <small>{it.summary}</small><br/>
            <a href={`/webcache?id=${it.id}`} target="_blank" rel="noreferrer">Open</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
