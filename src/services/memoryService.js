import Dexie from 'dexie';

// Simple memory service using Dexie (IndexedDB wrapper) for episodic and long-term memory
const db = new Dexie('AionMemoryDB');

// Schema: episodes & longTerm (both store text and meta)
db.version(1).stores({
  episodes: '++id, timestamp, type, title, excerpt, content',
  longTerm: '++id, key, timestamp, tags, content',
});

let initialized = false;

export async function initMemoryDB() {
  if (initialized) return db;
  try {
    await db.open();
    initialized = true;
    return db;
  } catch (err) {
    console.warn('Memory DB failed to open', err);
    throw err;
  }
}

export async function storeEpisode(episode) {
  try {
    await initMemoryDB();
    const item = {
      timestamp: episode.timestamp || new Date().toISOString(),
      type: episode.type || 'interaction',
      title: episode.title || '',
      excerpt: episode.excerpt || (episode.content || '').slice(0, 500),
      content: episode.content || '',
    };
    const id = await db.episodes.add(item);
    return { id, ...item };
  } catch (err) {
    console.error('storeEpisode error', err);
    throw err;
  }
}

export async function queryEpisodes(q = '', limit = 10) {
  try {
    await initMemoryDB();
    if (!q || q.trim() === '') {
      return await db.episodes.orderBy('timestamp').reverse().limit(limit).toArray();
    }
    const lower = q.toLowerCase();
    const items = await db.episodes.filter(ep => (ep.title && ep.title.toLowerCase().includes(lower)) || (ep.excerpt && ep.excerpt.toLowerCase().includes(lower)) || (ep.content && ep.content.toLowerCase().includes(lower))).reverse().limit(limit).toArray();
    return items;
  } catch (err) {
    console.error('queryEpisodes error', err);
    return [];
  }
}

export async function getRecentEpisodes(limit = 10) {
  try {
    await initMemoryDB();
    return await db.episodes.orderBy('timestamp').reverse().limit(limit).toArray();
  } catch (err) {
    console.error('getRecentEpisodes error', err);
    return [];
  }
}

export async function getAllEpisodes() {
  try {
    await initMemoryDB();
    return await db.episodes.toArray();
  } catch (err) {
    console.error('getAllEpisodes error', err);
    return [];
  }
}

export async function clearMemory() {
  try {
    await initMemoryDB();
    await db.episodes.clear();
    await db.longTerm.clear();
    return true;
  } catch (err) {
    console.error('clearMemory error', err);
    return false;
  }
}

const memoryService = {
  initMemoryDB,
  storeEpisode,
  queryEpisodes,
  getRecentEpisodes,
  getAllEpisodes,
  clearMemory,
};

export default memoryService;
