import db from './offlineDb';
import { v4 as uuidv4 } from 'uuid';

export async function enqueue(type, payload, meta = {}) {
  const item = {
    uuid: uuidv4(),
    type,
    payload,
    meta,
    status: 'pending',
    attempts: 0,
    createdAt: Date.now()
  };
  await db.queue.add(item);
  return item;
}

export async function getPending(limit = 50) {
  try {
    return await db.queue.where('status').equals('pending').limit(limit).toArray();
  } catch (err) {
    // Fallback for older DBs where 'status' is not indexed: scan and filter in memory.
    const all = await db.queue.toArray();
    return all.filter(i => i.status === 'pending').slice(0, limit);
  }
}

export async function markDone(uuid, result = {}) {
  const item = await findByUuid(uuid);
  if (item) await db.queue.delete(item.id);
}

export async function incrementAttempts(uuid, error) {
  const item = await findByUuid(uuid);
  if (item) {
    await db.queue.update(item.id, { attempts: (item.attempts || 0) + 1, lastError: String(error) });
  }
}

export async function pendingCount() {
  try {
    return await db.queue.where('status').equals('pending').count();
  } catch (err) {
    const all = await db.queue.toArray();
    return all.filter(i => i.status === 'pending').length;
  }
}

export async function markFailed(uuid, reason) {
  const item = await findByUuid(uuid);
  if (item) {
    await db.queue.update(item.id, { status: 'failed', lastError: String(reason), attempts: item.attempts || 0 });
  }
}

// Helper: find an item by uuid with index fallback
async function findByUuid(uuid) {
  try {
    const item = await db.queue.where('uuid').equals(uuid).first();
    if (item) return item;
  } catch (err) {
    // index may not exist; fall through to scan
  }
  const all = await db.queue.toArray();
  return all.find(i => i.uuid === uuid) || null;
}
