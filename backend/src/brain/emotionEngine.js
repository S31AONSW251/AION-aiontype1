module.exports = class EmotionEngine {
  async detectEmotionalState(text = '') {
    text = (text || '').toString();
    const lower = text.toLowerCase();
    const scores = { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0 };
    const mapping = {
      joy: ['happy', 'joy', 'glad', 'excited', 'love', 'great', 'awesome'],
      sadness: ['sad', 'unhappy', 'down', 'depressed', 'sorrow', 'mourn'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'hate', 'irritate'],
      fear: ['afraid', 'scared', 'fear', 'nervous', 'anxious'],
      surprise: ['surprised', 'wow', 'unexpected', 'amazed']
    };

    Object.entries(mapping).forEach(([k, arr]) => {
      arr.forEach(w => {
        if (lower.includes(w)) scores[k] += 1;
      });
    });

    const exclam = (text.match(/!/g) || []).length;
    const upper = (text.match(/[A-Z]{2,}/g) || []).length;

    let label = 'neutral';
    let intensity = 0;
    Object.keys(scores).forEach(k => {
      if (scores[k] > intensity) {
        intensity = scores[k];
        label = k;
      }
    });

    intensity = Math.min(1, (intensity / 3) + exclam * 0.1 + upper * 0.05);

    return {
      label,
      intensity: Math.round(intensity * 100) / 100,
      reason: `keywords matched: ${label}`,
      suggestedResponseStyle: label === 'anger' ? 'calm, de-escalating' : label === 'joy' ? 'enthusiastic' : 'empathetic',
      supportiveQuestion: label === 'sadness' ? 'Would you like to talk about what happened?' : 'Can you tell me more?',
      groundingSuggestion: 'Take a deep breath and notice your surroundings.'
    };
  }
};
