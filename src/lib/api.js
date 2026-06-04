// Shared API helpers for the CRA app. Use REACT_APP_API_BASE when provided;
// otherwise same-origin calls are proxied in development by setupProxy.js.
export const API_BASE = process.env.REACT_APP_API_BASE || '';

async function readJsonResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || `Request failed: ${res.status}`);
  }
  return json;
}

export async function generateImage(prompt) {
  const res = await fetch(`${API_BASE}/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return readJsonResponse(res);
}

export async function generateCode(prompt, model = "llama3") {
  const res = await fetch(`${API_BASE}/generate-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });
  return readJsonResponse(res);
}

export async function webSearch(query) {
  const res = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`);
  return readJsonResponse(res);
}
