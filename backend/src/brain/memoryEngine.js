const fs = require('fs').promises;
const path = require('path');

class MemoryEngine {
  constructor(opts = {}) {
    this.dataDir = path.resolve(__dirname, '../../data');
    this.filePath = opts.filePath || path.join(this.dataDir, 'memories.json');
    this._init();
  }

  async _init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch (e) {
        await fs.writeFile(this.filePath, '[]', 'utf8');
      }
    } catch (err) {
      console.warn('MemoryEngine init failed', err);
    }
  }

  async _read() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw || '[]');
    } catch (e) {
      return [];
    }
  }

  async _write(arr) {
    try {
      const backupPath = this.filePath + `.bak-${Date.now()}`;
      try {
        await fs.copyFile(this.filePath, backupPath);
      } catch (e) {
        // ignore backup errors
      }
      await fs.writeFile(this.filePath, JSON.stringify(arr, null, 2), 'utf8');
    } catch (e) {
      console.warn('MemoryEngine write failed', e);
    }
  }

  _generateId() {
    return `mem-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async saveMemory({ type = 'note', text = '', tags = [], metadata = {}, createdAt = Date.now() }) {
    const arr = await this._read();
    const mem = { id: this._generateId(), type, text, tags, metadata, createdAt, forgotten: false };
    arr.push(mem);
    await this._write(arr);
    return mem;
  }

  async searchMemory(query, opts = {}) {
    const arr = await this._read();
    if (!query) return arr.slice().reverse();
    const q = query.toString().toLowerCase();
    const results = arr.filter(m => !m.forgotten && ((m.text && m.text.toLowerCase().includes(q)) || ((m.tags || []).some(t => (t || '').toLowerCase().includes(q)))));
    return results;
  }

  async summarizeMemory(id) {
    const arr = await this._read();
    const m = arr.find(x => x.id === id);
    if (!m) return null;
    return { id: m.id, summary: (m.text || '').slice(0, 120), tags: m.tags || [], createdAt: m.createdAt };
  }

  async connectRelatedMemories(id, relatedId) {
    const arr = await this._read();
    const m = arr.find(x => x.id === id);
    if (!m) throw new Error('memory not found');
    m.related = m.related || [];
    if (!m.related.includes(relatedId)) m.related.push(relatedId);
    await this._write(arr);
    return m;
  }

  async forgetMemoryById(id) {
    const arr = await this._read();
    const m = arr.find(x => x.id === id);
    if (!m) throw new Error('memory not found');
    m.forgotten = true;
    m.forgottenAt = Date.now();
    await this._write(arr);
    return m;
  }

  async exportMemory() {
    const arr = await this._read();
    return arr;
  }
}

module.exports = MemoryEngine;
