// Lightweight fetch helper used across the frontend.
// Resolve base URL in a way that's safe for Node/Jest (avoids top-level `import.meta` syntax)
let API_BASE = '/api';
try {
  // Access import.meta.env dynamically so parsers that don't support import.meta don't error
  // eslint-disable-next-line no-new-func
  const _env = Function('return (typeof import !== "undefined" && import.meta && import.meta.env) ? import.meta.env : undefined')();
  if (_env && _env.VITE_API_BASE) API_BASE = _env.VITE_API_BASE;
} catch (e) {
  // Fallback to process.env for Node/Jest environments
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) {
    API_BASE = process.env.REACT_APP_API_BASE;
  }
}
export { API_BASE };

function joinBase(path) {
  const base = API_BASE.replace(/\/$/, '');
  if (!path) return base;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
}

export async function apiFetch(path, opts = {}) {
  const target = joinBase(path);
  // Retry/backoff policy to handle transient network errors and 429 rate-limits
  const maxRetries = (opts && typeof opts._retries === 'number') ? opts._retries : 4;
  const baseDelay = (opts && typeof opts._retryDelay === 'number') ? opts._retryDelay : 500; // ms

  // Avoid sending internal retry options to the server
  const fetchOpts = { ...opts };
  delete fetchOpts._retries;
  delete fetchOpts._retryDelay;

  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(target, fetchOpts);
      // If not rate-limited, return response immediately
      if (!res || res.status !== 429) return res;

      // Handle 429 specially: check Retry-After header if present
      if (res.status === 429 && attempt < maxRetries) {
        const retryAfter = res.headers.get('Retry-After');
        let waitMs = baseDelay * Math.pow(2, attempt);
        if (retryAfter) {
          const parsed = parseInt(retryAfter, 10);
          if (!isNaN(parsed)) waitMs = parsed * 1000;
        }
        await new Promise(r => setTimeout(r, waitMs));
        attempt++;
        continue;
      }

      return res;
    } catch (err) {
      // Network or other error — retry with exponential backoff
      if (attempt < maxRetries) {
        const waitMs = baseDelay * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, waitMs));
        attempt++;
        continue;
      }
      throw err;
    }
  }
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

