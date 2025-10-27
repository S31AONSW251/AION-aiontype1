import React, {useEffect, useState} from 'react';

export default function AdminPanel(){
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = async ()=>{
    setLoading(true);
    try{
      const res = await fetch('/api/memory/pending');
      const j = await res.json();
      if(j.ok) setPending(j.pending || []);
    }catch(e){
      console.error(e);
    }finally{setLoading(false)}
  }

  useEffect(()=>{ fetchPending(); }, []);

  const approve = async (id)=>{
    try{
      const res = await fetch('/api/memory/pending/approve', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id})});
      const j = await res.json();
      if(j.ok) setPending(p=>p.filter(x=>x.id!==id));
    }catch(e){console.error(e)}
  }

  return (
    <div style={{padding:12}}>
      <h3>Admin — Pending Memories</h3>
      {loading && <div>Loading…</div>}
      {!loading && pending.length===0 && <div>No pending memories</div>}
      <ul>
        {pending.map(p=> (
          <li key={p.id} style={{marginBottom:8}}>
            <div><strong>{p.user_id}</strong> — {p.text.substring(0,200)}</div>
            <div style={{fontSize:12,color:'#666'}}>{JSON.stringify(p.metadata || {})}</div>
            <button onClick={()=>approve(p.id)} style={{marginTop:6}}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
