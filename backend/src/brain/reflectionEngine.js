module.exports = class ReflectionEngine {
  constructor(memoryEngine) {
    this.memoryEngine = memoryEngine;
  }

  async generateReflection(periodDays = 7) {
    const mems = await (this.memoryEngine && this.memoryEngine.exportMemory ? this.memoryEngine.exportMemory() : []);
    const recents = mems.filter(m => (Date.now() - (m.createdAt || 0)) <= periodDays * 24 * 60 * 60 * 1000);
    const themes = {};
    recents.forEach(m => {
      const txt = (m.text || '').slice(0, 200);
      const words = (txt.toLowerCase().match(/\b\w+\b/g) || []);
      words.forEach(w => {
        if (w.length > 3) themes[w] = (themes[w] || 0) + 1;
      });
    });
    const top = Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(t => t[0]);
    return {
      periodDays,
      memoryCount: recents.length,
      topThemes: top,
      narrative: `In the last ${periodDays} days you added ${recents.length} memories. Top themes: ${top.join(', ')}`
    };
  }

  async generateDailyReflection(period) {
    return this.generateReflection(period || 7);
  }

  async summarizeGrowth() {
    const mems = await (this.memoryEngine && this.memoryEngine.exportMemory ? this.memoryEngine.exportMemory() : []);
    return { totalMemories: mems.length, summary: `Saved ${mems.length} memories.` };
  }
};
