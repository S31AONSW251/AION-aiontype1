import React, { useState, useEffect, useCallback } from 'react';

export default function StatusPanel({ apiBase = '' , adminKey = ''}) {
  const [status, setStatus] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch((apiBase || '') + '/api/status');
      const j = await res.json();
      setStatus(j);
    } catch (e) {
      setError(String(e));
    }
  }, [apiBase]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function fetchAdmin() {
    try {
      const headers = {};
      if (adminKey) headers['X-ADMIN-KEY'] = adminKey;
      const res = await fetch((apiBase || '') + '/admin/status', { headers });
      const j = await res.json();
      setAdminInfo(j);
    } catch (e) {
      setError(String(e));
    }
  }

  async function toggleExternal(allow) {
    setToggling(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (adminKey) headers['X-ADMIN-KEY'] = adminKey;
      const res = await fetch((apiBase || '') + '/admin/allow-external', { method: 'POST', headers, body: JSON.stringify({ allow }) });
      const j = await res.json();
      setAdminInfo(j);
      setStatus(prev => ({ ...prev, aion_allow_external: j.aion_allow_external }));
    } catch (e) {
      setError(String(e));
    } finally {
      setToggling(false);
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>System Status</h3>
      {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}

      {!status && !error && <div>Loading...</div>}

      {status && (
        <div>
          <div>Allow external requests: <strong>{String(status.aion_allow_external)}</strong></div>
          <div>Redis connected: <strong>{String(status.redis_connected)}</strong></div>
          <div>DB file: <code>{status.db_file}</code></div>
          <div>Host: {status.host}:{status.port}</div>
          <div>Version: {status.version}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => fetchStatus()}>Refresh</button>
            <button onClick={() => fetchAdmin()} style={{ marginLeft: 8 }}>Fetch Admin Info</button>
            <button onClick={() => toggleExternal(true)} disabled={toggling} style={{ marginLeft: 8 }}>Enable External</button>
            <button onClick={() => toggleExternal(false)} disabled={toggling} style={{ marginLeft: 8 }}>Disable External</button>
          </div>
        </div>
      )}

      {adminInfo && (
        <div style={{ marginTop: 12 }}>
          <h4>Admin Info</h4>
          <pre style={{ maxHeight: 300, overflow: 'auto', background: '#111', color: '#fff', padding: 8 }}>{JSON.stringify(adminInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
