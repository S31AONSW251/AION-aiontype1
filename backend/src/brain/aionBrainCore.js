const MemoryEngine = require('./memoryEngine');
const EmotionEngine = require('./emotionEngine');
const ReflectionEngine = require('./reflectionEngine');
const MissionEngine = require('./missionEngine');
const SelfUpgradeEngine = require('./selfUpgradeEngine');
const IdentityEngine = require('./identityEngine');

class AionBrainCore {
  constructor(opts = {}) {
    this.memory = new MemoryEngine(opts);
    this.emotion = new EmotionEngine();
    this.reflection = new ReflectionEngine(this.memory);
    this.mission = new MissionEngine(opts);
    this.selfUpgrade = new SelfUpgradeEngine(opts);
    this.identity = new IdentityEngine(opts);
  }

  async getStatus() {
    const mems = await this.memory.exportMemory();
    const id = await this.identity.getIdentity();
    return { memCount: mems.length, identity: id, pid: process.pid, uptime: process.uptime() };
  }

  async think(input, context = {}) {
    const emotion = await this.emotion.detectEmotionalState(input || '');
    const related = await this.memory.searchMemory(input || '');
    const question = this.generateNextBestQuestion(input, context, related);
    const response = `AION brain: detected ${emotion.label} (${Math.round(emotion.intensity * 100)}%), found ${related.length} related memories. ${question}`;
    try {
      await this.memory.saveMemory({ type: 'interaction', text: input || '', tags: [emotion.label], metadata: { context }, createdAt: Date.now() });
    } catch (e) {
      // do not fail on save
    }
    return { response, emotion, related: related.slice(0, 5), suggestedQuestion: question };
  }

  generateNextBestQuestion(input, context, related) {
    if (!input) return 'What would you like to talk about today?';
    if (related && related.length === 0) return 'Can you tell me more about that?';
    return `You mentioned "${(input || '').slice(0, 40)}" — would you like to explore this further or create a goal?`;
  }

  async reflectOnMemory() {
    return await this.reflection.generateReflection();
  }

  async detectEmotionalState(text) {
    return await this.emotion.detectEmotionalState(text);
  }

  async createActionPlan(goal) {
    return await this.mission.createGoal(goal);
  }

  async summarizeUserGrowth() {
    return await this.reflection.summarizeGrowth();
  }

  async updateIdentityState(patch) {
    return await this.identity.update(patch);
  }

  async generateDailyReflection(period) {
    return await this.reflection.generateDailyReflection(period);
  }

  async suggestSelfUpgrade() {
    return await this.selfUpgrade.suggestUpgradePlan();
  }
}

module.exports = AionBrainCore;
