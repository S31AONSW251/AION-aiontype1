import React, {useEffect, useState} from 'react';

export default function AdminEscalationPanel(){
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFlags = async ()=>{
    setLoading(true);
    try{
      const res = await fetch('/api/memory/flags');
      const j = await res.json();
      if(j.ok) setFlags(j.flags||[]);
    }catch(e){console.error(e)}finally{setLoading(false)}
  }

  useEffect(()=>{ fetchFlags(); }, []);

  const resolve = async (id, action='dismiss')=>{
    try{
      const res = await fetch('/api/memory/flag/resolve', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer changeme'}, body: JSON.stringify({id, action})});
      const j = await res.json();
      if(j.ok) setFlags(f=>f.filter(x=>x.id!==id));
    }catch(e){console.error(e)}
  }

  return (
    <div style={{padding:12}}>
      <h3>Flagged memories</h3>
      {loading && <div>Loading...</div>}
      {!loading && flags.length===0 && <div>No flagged memories</div>}
      <ul>
        {flags.map(f=> (
          <li key={f.id} style={{marginBottom:8}}>
            <div><strong>{f.id}</strong> — {f.reason}</div>
            <div style={{fontSize:12,color:'#666'}}>reported by {f.reporter || 'unknown'} at {new Date(f.ts*1000).toLocaleString()}</div>
            <div style={{marginTop:6}}>
              <button onClick={()=>resolve(f.id,'dismiss')}>Dismiss</button>
              <button onClick={()=>resolve(f.id,'delete')} style={{marginLeft:8}}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
