import React, { useEffect, useState } from 'react';

const humanFileSize = (size) => {
  if (size === 0) return '0 B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  return (size / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

const AssetsLibrary = ({ open = false }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/assets');
      if (!resp.ok) throw new Error('Failed to list assets');
      const data = await resp.json();
      setAssets(data.assets || []);
    } catch (e) {
      console.error('fetchAssets', e);
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchAssets();
  }, [open]);

  const handleDelete = async (fname) => {
    if (!window.confirm(`Delete ${fname}?`)) return;
    try {
      const resp = await fetch(`/api/assets/${encodeURIComponent(fname)}`, { method: 'DELETE' });
      const data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.error || 'Delete failed');
      setAssets(a => a.filter(x => x.filename !== fname));
    } catch (e) {
      alert('Failed to delete: ' + (e.message || e));
    }
  };

  if (!open) return null;

  return (
    <div className="assets-library agent-card">
      <div className="assets-header">
        <h4>Assets Library</h4>
        <div className="assets-actions">
          <button onClick={fetchAssets} className="btn-small">Refresh</button>
        </div>
      </div>

      {loading && <div className="assets-loading">Loading assets...</div>}
      {error && <div className="assets-error">Error: {error}</div>}

      <div className="assets-grid">
        {assets.map(a => (
          <div key={a.filename} className="asset-item">
            <div className="asset-preview">
              {a.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={a.url} alt={a.filename} loading="lazy" />
              ) : a.filename.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={a.url} controls preload="metadata" />
              ) : (
                <div className="file-icon">{a.filename.split('.').pop().toUpperCase()}</div>
              )}
            </div>
            <div className="asset-meta">
              <div className="asset-name"><a href={a.url} target="_blank" rel="noreferrer">{a.filename}</a></div>
              <div className="asset-size">{humanFileSize(a.size)}</div>
            </div>
            <div className="asset-actions">
              <a className="btn-small" href={a.url} download>Download</a>
              <button className="btn-small danger" onClick={() => handleDelete(a.filename)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && !loading && <div className="assets-empty">No assets saved yet.</div>}
    </div>
  );
};

export default AssetsLibrary;
