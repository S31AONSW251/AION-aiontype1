import { getPending, markDone, incrementAttempts } from '../lib/offlineQueue';

let running = false;
let onChangeCallback = null;

export function onQueueChange(cb) {
  onChangeCallback = cb;
}

function notifyChange() {
  if (onChangeCallback) onChangeCallback();
}

async function processItem(item, apiSend) {
  try {
    // apiSend should be a function that takes type and payload and performs the network call
    await apiSend(item.type, item.payload);
    await markDone(item.uuid);
    notifyChange();
  } catch (err) {
    await incrementAttempts(item.uuid, err && err.message ? err.message : String(err));
    notifyChange();
    throw err;
  }
}

export async function runQueue(apiSend) {
  if (running) return;
  running = true;
  try {
    const items = await getPending(50);
    for (const item of items) {
      // naive sequential processing with backoff per item
      try {
        await processItem(item, apiSend);
      } catch (e) {
        const attempts = (item.attempts || 0) + 1;
        const maxAttempts = 5;
        if (attempts >= maxAttempts) {
          // import markFailed lazily to avoid circular imports
          const { markFailed } = await import('../lib/offlineQueue');
          await markFailed(item.uuid, e && e.message ? e.message : String(e));
        } else {
          // exponential backoff before next attempt
          const backoffMs = Math.min(30000, Math.pow(2, attempts) * 1000);
          await new Promise(res => setTimeout(res, backoffMs));
        }
        // continue to next queued item
        continue;
      }
    }
  } finally {
    running = false;
  }
}

export function startAutoSync(apiSend) {
  // process queue immediately if online
  if (navigator.onLine) {
    runQueue(apiSend).catch(() => {});
  }
  // hook online/offline events
  window.addEventListener('online', () => runQueue(apiSend).catch(() => {}));
}

export default { runQueue, startAutoSync, onQueueChange };
