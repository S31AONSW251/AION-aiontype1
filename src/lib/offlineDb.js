import Dexie from 'dexie';

const db = new Dexie('AionOfflineDB');

// Initial schema
db.version(1).stores({
  messages: 'id, createdAt, status',
  memories: 'id, updatedAt, dirty'
});

// Upgrade: add queue store with indexes for status and uuid so queries like
// where('status') and where('uuid') work without SchemaError.
db.version(2).stores({
  queue: '++id, uuid, type, status, createdAt, attempts'
});

export default db;
