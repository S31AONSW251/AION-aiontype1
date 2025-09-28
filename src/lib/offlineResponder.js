// Lightweight offline responder for AION
// Stores simple cache in IndexedDB via idb-keyval. Provides storeConversation, indexKnowledge, offlineReply

import { get, set } from 'idb-keyval';

async function readCache() {
  const data = await get('aion-cache');
  return data || { conversations: [], knowledge: [], outbox: [] };
}

export async function storeConversation(item) {
  const cache = await readCache();
  cache.conversations = (cache.conversations || []).concat(item).slice(-500);
  await set('aion-cache', cache);
}

export async function indexKnowledge(entries) {
  const cache = await readCache();
  cache.knowledge = (cache.knowledge || []).concat(entries).slice(-1000);
  await set('aion-cache', cache);
}

export async function queueOutgoing(item) {
  const cache = await readCache();
  cache.outbox = (cache.outbox || []).concat(item);
  await set('aion-cache', cache);
}

function simpleKeywordSearch(q, cache) {
  const ql = q.toLowerCase();
  const hits = (cache.knowledge || []).filter(k => {
    const title = (k.title || '').toLowerCase();
    const text = (k.text || k.body || k.snippet || '').toLowerCase();
    return title.includes(ql) || text.includes(ql);
  });
  return hits.slice(0,5);
}

export async function offlineReply(query) {
  const cache = await readCache();
  // simple math helper
  try {
    if (/^\s*[-+/*()0-9.\s]+$/.test(query)) {
      // evaluate safely using Function (not ideal but small scope). Could use mathjs.
      // guard: disallow letters
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${query})`)();
      if (typeof val === 'number' && isFinite(val)) {
        return { text: `Computed (offline): ${val}`, offline: true };
      }
    }
  } catch (e) {
    // not a simple math expression
  }

  const hits = simpleKeywordSearch(query, cache);
  if (hits && hits.length) {
    const combined = hits.map(h => `Source: ${h.title || 'cached'}\n${(h.snippet || h.text || '').slice(0,400)}`).join('\n\n---\n\n');
    return { text: `Answer from cached knowledge (offline):\n\n${combined}`, offline: true };
  }

  // fallback template
  return { text: "AION is currently offline. I can: compute simple math, search your cached knowledge, or save this question to answer later when the server is back online.", offline: true };
}

export async function tryResendOutbox() {
  const cache = await readCache();
  const items = cache.outbox || [];
  if (!items.length) return { sent: 0 };
  const sent = [];
  for (const it of items) {
    try {
      const res = await fetch('/api/sync-outgoing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(it) });
      if (res.ok) sent.push(it);
    } catch (e) { /* remain in outbox */ }
  }
  if (sent.length) {
    const remaining = items.filter(i => !sent.includes(i));
    const cache2 = await readCache();
    cache2.outbox = remaining;
    await set('aion-cache', cache2);
  }
  return { sent: sent.length };
}
