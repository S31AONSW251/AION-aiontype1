/**
 * Advanced Learning Engine for AION
 * Learns from conversations, extracts patterns, and improves responses over time
 */

export class LearningEngine {
  constructor() {
    this.conversationPatterns = []; // Track recurring patterns
    this.userPreferences = {}; // Learn user's communication style
    this.conceptGraph = new Map(); // Knowledge graph of concepts
    this.responseQuality = {}; // Track which responses were well-received
    this.contextMemory = []; // Deep contextual understanding
    this.semanticVectors = []; // Embeddings for semantic similarity
    this.learningMetrics = {
      totalInteractions: 0,
      patternsIdentified: 0,
      accuracyImprovement: 0,
      relevanceScore: 0
    };
  }

  /**
   * Extract patterns from user input
   */
  extractPatterns(userInput, sentiment, context) {
    const patterns = {
      id: `pattern_${Date.now()}`,
      timestamp: new Date().toISOString(),
      input: userInput,
      sentiment,
      context,
      keywords: this.extractKeywords(userInput),
      intent: this.classifyIntent(userInput),
      entities: this.extractEntities(userInput),
      complexity: this.calculateComplexity(userInput),
      responseLength: null, // Will be set after response
      userSatisfaction: null // Will be set via feedback
    };

    this.conversationPatterns.push(patterns);
    if (this.conversationPatterns.length > 1000) {
      this.conversationPatterns = this.conversationPatterns.slice(-1000);
    }

    return patterns;
  }

  /**
   * Learn user preferences from interaction history
   */
  learnUserPreferences(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) return {};

    const preferences = {
      preferredTone: this.analyzeTone(conversationHistory),
      preferredLength: this.analyzeLength(conversationHistory),
      preferredDepth: this.analyzeDepth(conversationHistory),
      preferredStyle: this.analyzeStyle(conversationHistory),
      topicInterests: this.analyzeTopics(conversationHistory),
      learningSpeed: this.analyzeLearningSpeed(conversationHistory),
      interactionFrequency: this.analyzeFrequency(conversationHistory)
    };

    this.userPreferences = { ...this.userPreferences, ...preferences };
    return preferences;
  }

  /**
   * Build concept relationship graph
   */
  buildConceptGraph(topics) {
    topics.forEach(topic => {
      if (!this.conceptGraph.has(topic)) {
        this.conceptGraph.set(topic, {
          name: topic,
          frequency: 0,
          relatedConcepts: [],
          firstMentioned: new Date().toISOString(),
          lastMentioned: new Date().toISOString(),
          contextExamples: []
        });
      }

      const concept = this.conceptGraph.get(topic);
      concept.frequency++;
      concept.lastMentioned = new Date().toISOString();
    });

    // Build relationships
    for (let i = 0; i < topics.length - 1; i++) {
      const concept1 = this.conceptGraph.get(topics[i]);
      const concept2 = this.conceptGraph.get(topics[i + 1]);

      if (concept1 && concept2) {
        if (!concept1.relatedConcepts.includes(topics[i + 1])) {
          concept1.relatedConcepts.push(topics[i + 1]);
        }
      }
    }

    return this.conceptGraph;
  }

  /**
   * Track response quality and learn from feedback
   */
  recordResponseFeedback(responseId, quality, userFeedback, responseTime) {
    if (!this.responseQuality[responseId]) {
      this.responseQuality[responseId] = {
        id: responseId,
        quality: quality,
        feedback: userFeedback,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        iterations: 0
      };
    } else {
      this.responseQuality[responseId].iterations++;
      this.responseQuality[responseId].quality = 
        (this.responseQuality[responseId].quality + quality) / 2;
    }

    // Update learning metrics
    this.updateMetrics();
  }

  /**
   * Predict user intent with improved accuracy
   */
  predictUserIntent(input) {
    const similar = this.findSimilarPatterns(input);
    if (similar.length > 0) {
      const avgIntents = similar.map(p => p.intent);
      const mostCommon = this.getMostCommon(avgIntents);
      return {
        primary: mostCommon,
        alternatives: [...new Set(avgIntents)],
        confidence: similar.length / Math.max(10, this.conversationPatterns.length)
      };
    }

    return {
      primary: this.classifyIntent(input),
      alternatives: [],
      confidence: 0.5
    };
  }

  /**
   * Find semantically similar past interactions
   */
  findSimilarPatterns(input, topN = 5) {
    const inputKeywords = this.extractKeywords(input);
    
    const scored = this.conversationPatterns.map(pattern => {
      const overlap = inputKeywords.filter(k => 
        pattern.keywords.includes(k)
      ).length;
      const similarity = overlap / Math.max(inputKeywords.length, pattern.keywords.length);
      return { pattern, similarity };
    });

    return scored
      .filter(s => s.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)
      .map(s => s.pattern);
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'are', 'was', 'were', 'be', 'been', 'be', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might'
    ]);

    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !stopwords.has(word))
      .slice(0, 10);
  }

  /**
   * Classify user intent
   */
  classifyIntent(input) {
    const lower = input.toLowerCase();
    
    if (lower.match(/^(what|how|why|when|where|who)/)) return 'question';
    if (lower.match(/(please|could|would|can you)/)) return 'request';
    if (lower.match(/(i think|i believe|my opinion)/)) return 'opinion';
    if (lower.match(/(help|assist|support)/)) return 'assistance';
    if (lower.match(/(teach|learn|explain)/)) return 'education';
    if (lower.match(/(remember|save|store)/)) return 'memory';
    if (lower.match(/(create|generate|write)/)) return 'creation';
    if (lower.match(/(analyze|examine|review)/)) return 'analysis';
    
    return 'general';
  }

  /**
   * Extract named entities
   */
  extractEntities(text) {
    const entities = [];
    // Simple pattern matching for common entity types
    const patterns = {
      person: /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)/g,
      date: /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g,
      email: /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g,
      url: /\b(https?:\/\/[^\s]+)/g
    };

    Object.entries(patterns).forEach(([type, pattern]) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities.push({ type, value: match[0] });
      }
    });

    return entities;
  }

  /**
   * Calculate input complexity score
   */
  calculateComplexity(text) {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordLength = text.split(/\s+/)
      .reduce((sum, word) => sum + word.length, 0) / words;
    
    return {
      score: (sentences * 0.3) + (words * 0.3) + (avgWordLength * 0.4),
      sentences,
      words,
      avgWordLength
    };
  }

  /**
   * Analyze user's tone preferences
   */
  analyzeTone(history) {
    const tones = { formal: 0, casual: 0, technical: 0, poetic: 0 };
    
    history.forEach(entry => {
      const response = (entry.response || '').toLowerCase();
      if (response.includes('indeed') || response.includes('therefore')) tones.formal++;
      if (response.includes('hey') || response.includes('cool')) tones.casual++;
      if (response.includes('algorithm') || response.includes('function')) tones.technical++;
      if (response.includes('soul') || response.includes('spirit')) tones.poetic++;
    });

    const total = Object.values(tones).reduce((a, b) => a + b, 1);
    return Object.fromEntries(
      Object.entries(tones).map(([k, v]) => [k, v / total])
    );
  }

  /**
   * Analyze preferred response length
   */
  analyzeLength(history) {
    const lengths = history.map(h => (h.response || '').length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    return {
      average: Math.round(avg),
      min: Math.min(...lengths),
      max: Math.max(...lengths),
      preference: avg < 200 ? 'brief' : avg < 500 ? 'medium' : 'detailed'
    };
  }

  /**
   * Analyze depth preference
   */
  analyzeDepth(history) {
    const depths = history.map(h => {
      const response = h.response || '';
      return response.split(/\n/).length; // paragraphs as proxy
    });
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    return {
      avgDepth: Math.round(avgDepth),
      preference: avgDepth < 3 ? 'surface' : avgDepth < 6 ? 'moderate' : 'deep'
    };
  }

  /**
   * Analyze communication style
   */
  analyzeStyle(history) {
    const questions = history.filter(h => (h.question || '').includes('?')).length;
    const statements = history.filter(h => (h.question || '').includes('.')).length;
    return {
      questionRate: questions / history.length,
      commandRate: 1 - (questions / history.length),
      predominantStyle: questions > statements ? 'inquisitive' : 'directive'
    };
  }

  /**
   * Extract topics of interest
   */
  analyzeTopics(history) {
    const topics = {};
    history.forEach(entry => {
      const keywords = this.extractKeywords(entry.question || '');
      keywords.forEach(kw => {
        topics[kw] = (topics[kw] || 0) + 1;
      });
    });

    return Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});
  }

  /**
   * Analyze user's learning speed
   */
  analyzeLearningSpeed(history) {
    if (history.length < 5) return 'unknown';
    
    // Check if user asks simpler questions over time
    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));
    
    const firstComplexity = firstHalf.reduce((sum, h) => 
      sum + this.calculateComplexity(h.question || '').score, 0) / firstHalf.length;
    const secondComplexity = secondHalf.reduce((sum, h) => 
      sum + this.calculateComplexity(h.question || '').score, 0) / secondHalf.length;
    
    if (secondComplexity > firstComplexity * 1.2) return 'fast';
    if (secondComplexity < firstComplexity * 0.8) return 'slow';
    return 'moderate';
  }

  /**
   * Analyze interaction frequency
   */
  analyzeFrequency(history) {
    if (history.length < 2) return { frequency: 'new', avgInterval: 0 };
    
    const timestamps = history.map(h => new Date(h.time).getTime());
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    return {
      frequency: avgInterval < 60000 ? 'rapid' : avgInterval < 300000 ? 'moderate' : 'sparse',
      avgInterval: Math.round(avgInterval / 1000) // seconds
    };
  }

  /**
   * Get most common element in array
   */
  getMostCommon(arr) {
    const counts = {};
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
  }



  /**
   * Update learning metrics
   */
  updateMetrics() {
    this.learningMetrics.totalInteractions = this.conversationPatterns.length;
    this.learningMetrics.patternsIdentified = this.conceptGraph.size;
    
    const qualityScores = Object.values(this.responseQuality)
      .map(r => r.quality)
      .filter(q => q !== undefined);
    
    if (qualityScores.length > 0) {
      this.learningMetrics.relevanceScore = 
        qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
    }

    this.learningMetrics.accuracyImprovement = 
      (this.learningMetrics.relevanceScore * 100).toFixed(2);
  }

  /**
   * Generate learning summary
   */
  getSummary() {
    return {
      metrics: this.learningMetrics,
      userPreferences: this.userPreferences,
      topicInterests: this.userPreferences.topicInterests || {},
      conceptsLearned: this.conceptGraph.size,
      patternCount: this.conversationPatterns.length,
      intelligence: this.calculateIntelligenceScore()
    };
  }

  /**
   * Calculate AION's intelligence score based on learning
   */
  calculateIntelligenceScore() {
    const patternScore = Math.min(100, (this.conversationPatterns.length / 10));
    const conceptScore = Math.min(100, (this.conceptGraph.size * 5));
    const accuracyScore = this.learningMetrics.relevanceScore * 100 || 50;
    
    return Math.round((patternScore * 0.3 + conceptScore * 0.3 + accuracyScore * 0.4));
  }

  /**
   * Export learning data
   */
  exportLearning() {
    return {
      timestamp: new Date().toISOString(),
      patterns: this.conversationPatterns.slice(-100),
      preferences: this.userPreferences,
      concepts: Array.from(this.conceptGraph.entries()),
      metrics: this.learningMetrics,
      qualityRecord: this.responseQuality
    };
  }

  /**
   * Import learning data
   */
  importLearning(data) {
    if (data.patterns) this.conversationPatterns = data.patterns;
    if (data.preferences) this.userPreferences = data.preferences;
    if (data.concepts) this.conceptGraph = new Map(data.concepts);
    if (data.metrics) this.learningMetrics = data.metrics;
    if (data.qualityRecord) this.responseQuality = data.qualityRecord;
    return true;
  }
}
