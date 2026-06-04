const fs = require('fs').promises;
const path = require('path');

class IdentityEngine {
  constructor(opts = {}) {
    this.dataDir = path.resolve(__dirname, '../../data');
    this.filePath = opts.filePath || path.join(this.dataDir, 'identity.json');
    this._init();
  }

  async _init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch (e) {
        const def = { id: 'aion-core', name: 'AION', role: 'assistant', tone: 'calm', createdAt: Date.now() };
        await fs.writeFile(this.filePath, JSON.stringify(def, null, 2), 'utf8');
      }
    } catch (e) {
      console.warn('IdentityEngine init failed', e);
    }
  }

  async getIdentity() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  async update(patch = {}) {
    const id = (await this.getIdentity()) || {};
    const merged = Object.assign({}, id, patch);
    await fs.writeFile(this.filePath, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  }
}

module.exports = IdentityEngine;
