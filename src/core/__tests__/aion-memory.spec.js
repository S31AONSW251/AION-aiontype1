// Jest tests for AdvancedAionMemory (focused, lightweight)

// Mock heavy dependencies to keep tests fast and deterministic
jest.mock('../quantum-memory.js', () => ({
  QuantumMemoryEngine: function() { return { isAvailable: () => false, dispose: () => {} }; }
}));

jest.mock('../neural-memory-mapper.js', () => ({
  NeuralMemoryMapper: function() {
    return {
      textToVector: async (text) => {
        // simple deterministic vector from char codes
        const vec = Array.from({ length: 8 }).map((_, i) => ((text.charCodeAt(i) || 0) % 10) / 10);
        return vec;
      },
      categorizeText: async (text) => ({ primary: 'general' }),
      extractConcepts: async (text) => [{ text: 'concept1' }],
      extractEntities: (text) => [],
      dispose: () => {}
    };
  }
}));

jest.mock('../holographic-memory.js', () => ({
  HolographicMemoryProjector: function() {
    return {
      projectTextToSpace: (t) => Array.from({length:8}).map(() => 0.1),
      generateInsights: async () => null
    };
  }
}));

// Mock DB service
jest.mock('../../services/AionDB', () => {
  const store = new Map();
  return {
    db: {
      memories: {
        async toArray() { return Array.from(store.values()); },
        async put(item) { store.set(item.id, item); return item; },
        async bulkPut(items) { for (const it of items) store.set(it.id, it); return items.length; },
        async delete(id) { store.delete(id); },
        async get(id) { return store.get(id); }
      }
    }
  };
});

const { AdvancedAionMemory } = require('../aion-memory.js');

describe('AdvancedAionMemory basic behaviors', () => {
  let memSys;

  beforeEach(() => {
    memSys = new AdvancedAionMemory();
  });

  afterEach(async () => {
    try { memSys.dispose(); } catch (e) {}
  });

  test('pin/unpin prevents cleanup from deleting pinned memories', async () => {
    const m = { id: 'mem_test_1', text: 'hello world', vector: [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8], timestamp: new Date(), category: 'general', importance: 0.1, accessPattern: { accessCount: 0 } };
    memSys.memoryIndex.set(m.id, m);
    // ensure episodic DB contains it
    await memSys.episodicMemory.put(m);
    memSys.pinMemory(m.id);

    // cleanup with maxMemories = 0 should attempt to delete extras but skip pinned
    await memSys.cleanupMemories(0);
    const still = await memSys.episodicMemory.get(m.id);
    expect(still).toBeDefined();
  });

  test('snapshotMemory enqueues low-importance items and forcePersist flushes them', async () => {
    const m = { id: 'mem_test_2', text: 'persist me', vector: [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1], timestamp: new Date(), category: 'general', importance: 0.2 };
    // call snapshotMemory (importance low -> queued)
    const ok = await memSys.snapshotMemory(m);
    expect(ok).toBeTruthy();
    // force flush
    await memSys.forcePersist();
    const stored = await memSys.episodicMemory.get(m.id);
    expect(stored).toBeDefined();
    expect(stored.id).toBe(m.id);
  });

  test('findSimilarMemories returns expected top result using ANN cache', async () => {
    // create two memories with distinct vectors
    const a = { id: 'm_a', text: 'aaa', vector: [1,0,0,0,0,0,0,0], timestamp: new Date(), category: 'general', importance: 0.5 };
    const b = { id: 'm_b', text: 'bbb', vector: [0,1,0,0,0,0,0,0], timestamp: new Date(), category: 'general', importance: 0.5 };
    await memSys.episodicMemory.put(a);
    await memSys.episodicMemory.put(b);
    // rebuild ann index
    await memSys.buildAnnIndex();
    const results = await memSys.findSimilarMemories('aaa', 1);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].id).toBe('m_a');
  });
});
