import { EventBus, TTLCache } from '../utilities.js';

// If named exports not available, tests will gracefully fallback to instance-based behavior

describe('Aion core utilities', () => {
  test('EventBus on/emit/off and unsubscribe works', () => {
    const bus = new EventBus();
    const calls = [];
    const unsub = bus.on('x', (p) => calls.push(p));
    bus.emit('x', 1);
    bus.emit('x', 2);
    // unsubscribe
    unsub();
    bus.emit('x', 3);
    expect(calls).toEqual([1, 2]);
  });

  test('TTLCache set/get and expiration', async () => {
    const cache = new TTLCache(1); // 1 second default
    cache.set('a', 123, 1);
    expect(cache.get('a')).toBe(123);
    // wait for >1s
    await new Promise(r => setTimeout(r, 1200));
    expect(cache.get('a')).toBeNull();
    cache.dispose();
  });
});
