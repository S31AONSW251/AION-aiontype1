const fs = require('fs').promises;
const path = require('path');

class MissionEngine {
  constructor(opts = {}) {
    this.dataDir = path.resolve(__dirname, '../../data');
    this.path = opts.goalsPath || path.join(this.dataDir, 'goals.json');
    this._init();
  }

  async _init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        await fs.access(this.path);
      } catch (e) {
        await fs.writeFile(this.path, '[]', 'utf8');
      }
    } catch (e) {
      console.warn('MissionEngine init failed', e);
    }
  }

  async _read() {
    try {
      const raw = await fs.readFile(this.path, 'utf8');
      return JSON.parse(raw || '[]');
    } catch (e) {
      return [];
    }
  }

  async _write(arr) {
    await fs.writeFile(this.path, JSON.stringify(arr, null, 2), 'utf8');
  }

  _generateId() {
    return `goal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async createGoal({ title = 'New Goal', description = '', steps = [] } = {}) {
    const arr = await this._read();
    const g = { id: this._generateId(), title, description, steps, createdAt: Date.now(), status: 'active' };
    arr.push(g);
    await this._write(arr);
    return g;
  }

  async updateGoal(id, patch = {}) {
    const arr = await this._read();
    const g = arr.find(x => x.id === id);
    if (!g) throw new Error('goal not found');
    Object.assign(g, patch);
    g.updatedAt = Date.now();
    await this._write(arr);
    return g;
  }

  async breakGoalIntoSteps(goal) {
    if (!goal || !goal.description) return [];
    return goal.description.split('.').map(s => s.trim()).filter(Boolean).slice(0, 10).map((t, i) => ({ id: `${goal.id || 'g'}-s-${i}`, title: t }));
  }

  async suggestNextAction(goalId) {
    const arr = await this._read();
    const g = arr.find(x => x.id === goalId);
    if (!g) throw new Error('goal not found');
    const steps = g.steps && g.steps.length ? g.steps : await this.breakGoalIntoSteps(g);
    return steps[0] || { title: 'Clarify the goal' };
  }
}

module.exports = MissionEngine;
