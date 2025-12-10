// src/lib/api.js (or wherever you call fetch/axios)
// Use VITE_API_BASE when provided, otherwise default to '/api' so
// production builds call the correct API path on the same origin (or can
// be proxied by the static server). If you need a different host, set
// VITE_API_BASE at build time (e.g. http://localhost:5000).
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function generateImage(prompt) {
  const res = await fetch(`${API_BASE}/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}

export async function generateCode(prompt, model = "llama3") {
  const res = await fetch(`${API_BASE}/generate-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });
  return res.json();
}

export async function webSearch(query) {
  // Ensure we don't produce `/api/api/...` when API_BASE already contains `/api`.
  const base = API_BASE.replace(/\/$/, '');
  const path = '/search';
  const res = await fetch(`${base}${path}?query=${encodeURIComponent(query)}`);
  return res.json();
}
