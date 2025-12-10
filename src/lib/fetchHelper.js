// Lightweight fetch helper used across the frontend.
export const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '/api';

function joinBase(path) {
  const base = API_BASE.replace(/\/$/, '');
  if (!path) return base;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
}

export async function apiFetch(path, opts = {}) {
  const target = joinBase(path);
  const res = await fetch(target, opts);
  return res;
}

export async function safeJson(response) {
  // Return parsed JSON when possible; otherwise return text and metadata.
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json();
      return { ok: response.ok, status: response.status, json };
    }
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } catch (e) {
    const text = await response.text().catch(() => null);
    return { ok: false, status: response.status || 0, error: String(e), text };
  }
}

