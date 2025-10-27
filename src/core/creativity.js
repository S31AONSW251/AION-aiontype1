import { AION_CONFIG } from './config.js';

class CreativityEngine {
  constructor(core = null) {
    // core (AionCore) is optional but allows using providers and cache
    this.core = core;
    this.creativeTemplates = new Map();
    this.initializeTemplates();
    this.cachePrefix = 'creative:';
    this.defaultVariants = 3;
    // Seed for deterministic variants if provided via config
    this.seed = (typeof AION_CONFIG !== 'undefined' && AION_CONFIG.creativity && AION_CONFIG.creativity.seed) || null;
  }

  initializeTemplates() {
    // Creative response templates
    this.creativeTemplates.set('metaphor', {
      apply: async (response, opts) => await this.applyMetaphor(response, opts)
    });
    
    this.creativeTemplates.set('story', {
      apply: async (response, opts) => await this.applyStorytelling(response, opts)
    });
    
    // Add more creative templates (poetry, analogy, visual-description)...
  }

  async enhanceResponse(response, opts = {}) {
    // Select appropriate creative enhancement
    const enhancementType = this.selectEnhancementType(response);

    if (!enhancementType || enhancementType === 'none') return response;

    const cacheKey = `${this.cachePrefix}${enhancementType}:${this._hash(response)}:${opts.seed||this.seed||''}`;
    // Try cache from core if available
    if (this.core && this.core.cache) {
      const cached = this.core.cache.get(cacheKey);
      if (cached) return cached;
    }

    try {
      // prefer provider-backed creative model if available
      if (this.core && this.core.providers && this.core.providers.get('creativeModel')) {
        // request multiple variants and pick best
        const variants = opts.variants || this.defaultVariants;
        const responses = [];
        for (let i = 0; i < variants; i++) {
          try {
            const prov = await this.core.callProvider('creativeModel', 'generate', { prompt: `${enhancementType}: ${response}`, temperature: opts.temperature || 0.8, seed: opts.seed || this.seed }, { __timeoutMs: 5000 });
            if (prov && prov.text) responses.push(prov.text);
          } catch (e) {
            // continue to fallback
          }
        }
        const chosen = this._selectBestVariant(response, responses);
        if (this.core && this.core.cache) this.core.cache.set(cacheKey, chosen, opts.ttl || this.core.defaultCacheTTL);
        return chosen;
      }

      // Otherwise use local template-driven enhancement
      if (this.creativeTemplates.has(enhancementType)) {
        const enhanced = await this.creativeTemplates.get(enhancementType).apply(response, opts);
        if (this.core && this.core.cache) this.core.cache.set(cacheKey, enhanced, opts.ttl || this.core.defaultCacheTTL);
        return enhanced;
      }

      return response;
    } catch (e) {
      // on failure, return original response
      if (this.core && this.core.logger) this.core.logger.warn && this.core.logger.warn('CreativityEngine failed', e && e.message ? e.message : e);
      return response;
    }
  }

  selectEnhancementType(response) {
    // Determine the best creative enhancement based on response content
    const text = (typeof response === 'string') ? response : (response.content || '');
    const responseLength = text.length;
    const complexity = this.estimateComplexity(text || '');

    if (responseLength > 120 && complexity > 0.6) return 'metaphor';
    if (responseLength > 60 && complexity > 0.45) return 'story';
    if (complexity > 0.75) return 'metaphor';
    return 'none';
  }

  async applyMetaphor(response, opts = {}) {
    const text = typeof response === 'string' ? response : (response.content || JSON.stringify(response));
    // Simple, safe metaphor generator fallback
    const topics = this._extractKeyNouns(text).slice(0, 2);
    const base = topics.length ? `Like ${topics.join(' and ')}` : 'Like a hidden current';
    return `${text}\n\n${base} — it weaves through the idea, making connections that feel both familiar and new.`;
  }

  async applyStorytelling(response, opts = {}) {
    const text = typeof response === 'string' ? response : (response.content || JSON.stringify(response));
    const nouns = this._extractKeyNouns(text).slice(0, 3);
    const protagonist = nouns[0] || 'a seeker';
    const setting = nouns[1] ? `in the realm of ${nouns[1]}` : 'in a curious place';
    const miniStory = `${protagonist} ${setting} discovered that ${text.toLowerCase()}. Through trials and reflection, a new insight emerged.`;
    return `${text}\n\nStory: ${miniStory}`;
  }

  estimateComplexity(text) {
    if (!text || !text.length) return 0;
    // rough heuristic: longer sentences and many long words => higher complexity
    const words = text.split(/\s+/);
    const longWords = words.filter(w => w.length > 6).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
    return Math.min(1, (longWords / words.length) * 0.6 + Math.min(1, sentences / 6) * 0.4);
  }

  _extractKeyNouns(text) {
    // naive noun extraction: pick words with capitalization or length > 5
    const words = (text || '').replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
    const candidates = words.filter(w => w.length > 4).slice(0, 6);
    return candidates.map(w => w.toLowerCase());
  }

  _hash(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0).toString(36);
  }

  _selectBestVariant(orig, variants) {
    if (!variants || variants.length === 0) return orig;
    // choose the variant with most shared keywords + length bonus
    const origWords = new Set((orig || '').toLowerCase().split(/\W+/).filter(Boolean));
    let best = variants[0];
    let bestScore = -Infinity;
    for (const v of variants) {
      const words = (v || '').toLowerCase().split(/\W+/).filter(Boolean);
      const shared = words.filter(w => origWords.has(w)).length;
      const score = shared * 2 + Math.min(50, words.length);
      if (score > bestScore) { bestScore = score; best = v; }
    }
    return best;
  }
}

export { CreativityEngine };
