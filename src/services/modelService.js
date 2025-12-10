// Centralized model service to call the backend streaming endpoint with robust fallbacks
import { localModel } from '../lib/localModel';
import { offlineReply } from '../lib/offlineResponder';

const defaultApiBase = (() => {
  try {
    if (process && process.env && process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
  } catch (e) { /* ignore */ }
  try {
    if (typeof window !== 'undefined' && window.location && (window.location.port === '3000' || window.location.hostname === 'localhost')) {
      return 'http://127.0.0.1:5000';
    }
  } catch (e) {}
  return '';
})();

export async function generateStreaming(promptPayload, onPiece = null, opts = {}) {
  try {
    const controller = new AbortController();
    const res = await fetch('/api/generate/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptPayload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.text().catch(() => `${res.status} ${res.statusText}`);
      throw new Error(err || `HTTP ${res.status}`);
    }

    // streaming response parser
    const reader = res.body && res.body.getReader ? res.body.getReader() : null;
    if (!reader) {
      const text = await res.text();
      if (onPiece) await onPiece({ type: 'text', data: text });
      return text;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop();
      for (const part of parts) {
        const line = part.trim();
        if (!line) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed && parsed.type && onPiece) {
            await onPiece(parsed);
          } else if (parsed && typeof parsed === 'object') {
            const textField = parsed.response || parsed.text || parsed.data || parsed.token || parsed.chunk;
            if (textField !== undefined && onPiece) await onPiece({ type: 'text', data: String(textField), meta: parsed });
            else if (onPiece) await onPiece({ type: 'json', data: parsed });
          } else if (onPiece) {
            await onPiece({ type: 'text', data: String(parsed) });
          }
        } catch (err) {
          if (onPiece) await onPiece({ type: 'text', data: line });
        }
      }
    }
    if (buffer && buffer.trim()) {
      const last = buffer.trim();
      try {
        const parsed = JSON.parse(last);
        if (parsed && parsed.type && onPiece) { await onPiece(parsed); }
        else if (parsed && typeof parsed === 'object') {
          const textField = parsed.response || parsed.text || parsed.data || parsed.token || parsed.chunk;
          if (textField !== undefined && onPiece) await onPiece({ type: 'text', data: String(textField), meta: parsed });
          else if (onPiece) await onPiece({ type: 'json', data: parsed });
        } else if (onPiece) await onPiece({ type: 'text', data: String(parsed) });
      } catch (err) {
        if (onPiece) await onPiece({ type: 'text', data: String(last) });
      }
    }
    return null;
  } catch (e) {
    console.warn('modelService streaming failed, falling back:', e);
    // try local model fallback
    try {
      if (!localModel.available) await localModel.init();
      if (localModel.available) {
        const localOut = await localModel.generate(promptPayload.prompt || JSON.stringify(promptPayload), opts);
        if (onPiece) await onPiece({ type: 'text', data: localOut });
        return localOut;
      }
    } catch (lmErr) {
      console.warn('localModel fallback failed', lmErr);
    }

    // Fallback to offline responder (cached knowledge / template)
    try {
      const q = (promptPayload && promptPayload.prompt) ? String(promptPayload.prompt) : '';
      const offline = await offlineReply(q || '');
      if (onPiece) await onPiece({ type: 'text', data: offline.text });
      return offline.text;
    } catch (offErr) {
      console.error('offlineReply fallback failed', offErr);
      // Last resort: return the original error
      throw e;
    }
  }
}

export default { generateStreaming, defaultApiBase };
