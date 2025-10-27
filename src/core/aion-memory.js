// advanced-aion-memory.js - Ultra-advanced memory system with holographic recall and quantum entanglement
// Enhancements added:
// - Async persistence batching (enqueue + flush) to reduce DB I/O
// - Pin/unpin memories to protect from cleanup
// - Tiered promote/demote helpers for memory lifecycle control
// - In-memory normalized vector cache (simple ANN-like) for fast similarity
// - Incremental, non-blocking index updates to avoid startup stalls
// Exporting AdvancedAionMemory class for testability and instance control
import { db } from '../services/AionDB';
import { logger } from './logger.js';
import { AION_CONFIG } from './config.js';
import { PerformanceMonitor } from './perf.js';
import { QuantumMemoryEngine } from './quantum-memory.js';
import { NeuralMemoryMapper } from './neural-memory-mapper.js';
import { HolographicMemoryProjector } from './holographic-memory.js';

// Multidimensional Knowledge Graph with temporal connections
class MultidimensionalKnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.temporalLinks = new Map();
    this.conceptualClusters = new Map();
  }

  addNode(id, data) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        label: data.label,
        type: data.type,
        connections: 0,
        temporalWeight: 0,
        conceptualStrength: 1.0,
        emotionalValence: 0,
        lastAccessed: Date.now(),
        metadata: data.metadata || {}
      });
    }
  }

  addEdge(source, target, relationship, strength = 1.0) {
    this.addNode(source, { label: source, type: 'auto' });
    this.addNode(target, { label: target, type: 'auto' });
    
    const edgeId = `${source}-${target}-${relationship}`;
    this.edges.set(edgeId, {
      source,
      target,
      relationship,
      strength,
      createdAt: Date.now(),
      accessedCount: 0
    });
    
    this.nodes.get(source).connections++;
    this.nodes.get(target).connections++;
  }

  addTemporalLink(nodeId, timestamp, eventType, significance = 0.5) {
    if (!this.temporalLinks.has(nodeId)) {
      this.temporalLinks.set(nodeId, []);
    }
    this.temporalLinks.get(nodeId).push({
      timestamp,
      eventType,
      significance,
      memoryTrace: null
    });
  }

  formConceptualCluster(nodes, clusterId, theme) {
    this.conceptualClusters.set(clusterId, {
      nodes,
      theme,
      formedAt: Date.now(),
      coherence: this.calculateClusterCoherence(nodes)
    });
  }

  calculateClusterCoherence(nodes) {
    // Calculate how conceptually coherent these nodes are
    return nodes.length > 1 ? 0.8 : 0.2;
  }

  getRelatedNodes(nodeId, maxRelations = 10) {
    const related = new Set();
    for (const [edgeId, edge] of this.edges) {
      if (edge.source === nodeId) related.add(edge.target);
      if (edge.target === nodeId) related.add(edge.source);
      if (related.size >= maxRelations) break;
    }
    return Array.from(related);
  }

  getTemporalContext(nodeId, timeWindow = 7 * 24 * 60 * 60 * 1000) {
    const now = Date.now();
    return this.temporalLinks.get(nodeId)?.filter(link => 
      now - link.timestamp < timeWindow
    ) || [];
  }

  strengthenConnection(source, target, increment = 0.1) {
    const edgeId = `${source}-${target}-related`;
    if (this.edges.has(edgeId)) {
      this.edges.get(edgeId).strength += increment;
      this.edges.get(edgeId).strength = Math.min(1.0, this.edges.get(edgeId).strength);
    }
  }

  decayConnections(decayRate = 0.01) {
    for (const [edgeId, edge] of this.edges) {
      edge.strength -= decayRate;
      if (edge.strength <= 0) {
        this.edges.delete(edgeId);
      }
    }
  }
}

// Memory consolidation and compression system
class MemoryConsolidationEngine {
  constructor() {
    this.compressionRatio = 0.7;
    this.consolidationThreshold = 0.85;
  }

  async compressMemory(memory) {
    // Create a compressed representation of the memory
    const compressed = {
      essence: await this.extractEssence(memory.text),
      keyEmotions: this.extractEmotions(memory),
      coreConcepts: this.extractConcepts(memory.text),
      temporalContext: memory.timestamp,
      importance: memory.importance
    };
    
    return {
      ...memory,
      compressed: true,
      compressedData: compressed,
      originalSize: memory.text.length,
      compressedSize: JSON.stringify(compressed).length
    };
  }

  async extractEssence(text) {
    // Extract the core meaning of the text
    const sentences = text.split(/[.!?]+/);
    if (sentences.length <= 2) return text;
    
    // Simple essence extraction (would use NLP in production)
    return sentences.slice(0, 2).join('. ') + '.';
  }

  extractEmotions(memory) {
    return {
      sentiment: memory.sentiment || 0,
      intensity: Math.abs(memory.sentiment || 0),
      valence: memory.sentiment > 0 ? 'positive' : memory.sentiment < 0 ? 'negative' : 'neutral'
    };
  }

  extractConcepts(text) {
    // Extract key concepts from text
    const words = text.split(/\s+/);
    return words.filter(word => 
      word.length > 5 && 
      !['the', 'and', 'but', 'for', 'with'].includes(word.toLowerCase())
    ).slice(0, 5);
  }

  shouldConsolidate(memories) {
    if (memories.length < 3) return false;
    
    const avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;
    return avgImportance > this.consolidationThreshold;
  }

  async consolidateMemories(memories) {
    if (!this.shouldConsolidate(memories)) return memories;
    
    const consolidated = {
      text: await this.createConsolidatedSummary(memories),
      vectors: memories.flatMap(m => m.vector),
      timestamp: new Date(),
      importance: memories.reduce((max, m) => Math.max(max, m.importance), 0),
      category: 'consolidated',
      sourceMemories: memories.map(m => m.id),
      compressionRatio: this.calculateCompressionRatio(memories)
    };
    
    return consolidated;
  }

  async createConsolidatedSummary(memories) {
    const keyPoints = memories.map(m => this.extractEssence(m.text));
    return `Consolidated insights: ${keyPoints.join('; ')}`;
  }

  calculateCompressionRatio(memories) {
    const originalSize = memories.reduce((sum, m) => sum + (m.text?.length || 0), 0);
    const compressedSize = memories.length * 100; // Approximate
    return compressedSize / originalSize;
  }
}

// Advanced Aion Memory System
class AdvancedAionMemory {
  constructor() {
    this.perfMonitor = new PerformanceMonitor();
    this.quantumEngine = new QuantumMemoryEngine();
    this.neuralMapper = new NeuralMemoryMapper();
    this.holographicProjector = new HolographicMemoryProjector();
    this.consolidationEngine = new MemoryConsolidationEngine();
    
    this.categories = ['general', 'technical', 'personal', 'creative', 'educational', 
                      'philosophical', 'scientific', 'emotional', 'procedural', 'predictive'];
    
    this.importanceWeights = {
      sentiment: 0.25,
      recency: 0.35,
      interactionLength: 0.15,
      category: 0.10,
      emotionalIntensity: 0.15
    };
    
    // Initialize advanced memory architecture
    this.sensoryBuffer = [];        // Ultra-short term (seconds)
    this.workingMemory = [];        // Short-term (minutes)
    this.episodicMemory = db.memories; // Long-term specific events
    this.semanticMemory = [];       // Conceptual knowledge
    this.proceduralMemory = [];     // How-to knowledge
    this.emotionalMemory = [];      // Emotionally charged memories
    
    this.knowledgeGraph = new MultidimensionalKnowledgeGraph();
    this.memoryIndex = new Map();   // Fast lookup index
    this._maintenanceInterval = null;
    // Persistence batching queue to avoid frequent DB writes
    this._persistQueue = new Map(); // id -> memory snapshot
    this._persistTimer = null;
    this._persistDebounceMs = (AION_CONFIG && AION_CONFIG.memory && AION_CONFIG.memory.persistDebounceMs) || 2000;
    // Pinned memories will be protected from cleanup
    this._pinnedMemories = new Set();
    // Simple in-memory ANN cache for faster similarity searches
    this._annIndex = {
      normalized: new Map(), // id -> normalized vector
      dimensions: (AION_CONFIG && AION_CONFIG.memory && AION_CONFIG.memory.embeddingDimensions) || 512
    };
    this.initializeMemorySystems();
  }

  async initializeMemorySystems() {
    // Preload and index existing memories
    const existingMemories = await this.episodicMemory.toArray();
    for (const memory of existingMemories) {
      this.indexMemory(memory);
    }
    // Build ANN index asynchronously to avoid blocking init
    setTimeout(() => {
      this.buildAnnIndex().catch(e => logger.warn('buildAnnIndex failed during init', e));
    }, 0);
    // Start periodic maintenance
    // store interval id so we can clean up in tests or shutdown
    try {
      this._maintenanceInterval = setInterval(() => this.performMemoryMaintenance(), 5 * 60 * 1000); // Every 5 minutes
      if (typeof this._maintenanceInterval.unref === 'function') this._maintenanceInterval.unref();
    } catch (e) {
      // ignore in restricted environments
    }
  }

  // Clean up timers and background resources
  dispose() {
    try {
      if (this._maintenanceInterval) clearInterval(this._maintenanceInterval);
      if (this._persistTimer) clearTimeout(this._persistTimer);
    } catch (e) {}
    // If underlying engines expose dispose, call them safely
    try { this.quantumEngine && typeof this.quantumEngine.dispose === 'function' && this.quantumEngine.dispose(); } catch(e) {}
    try { this.neuralMapper && typeof this.neuralMapper.dispose === 'function' && this.neuralMapper.dispose(); } catch(e) {}
    // Flush pending persistence
    try { this._flushPersistQueueSync(); } catch (e) {}
  }

  /**
   * Quantum-enhanced vector embedding with semantic depth
   */
  async getVectorEmbedding(text) {
    this.perfMonitor.start('getVectorEmbedding');
    
    try {
      // Use quantum-enhanced embedding if available
      if (this.quantumEngine.isAvailable()) {
        return await this.quantumEngine.generateEmbedding(text);
      }
      
      // Fallback to advanced neural embedding
      const vector = await this.neuralMapper.textToVector(text, {
        dimensions: AION_CONFIG.memory.embeddingDimensions,
        semanticDepth: 'deep',
        emotionalContext: true
      });
      
      this.perfMonitor.end('getVectorEmbedding');
      return vector;
    } catch (error) {
      logger.error('Error in getVectorEmbedding', error);
      // Ultimate fallback to holographic embedding
      return this.holographicProjector.projectTextToSpace(text);
    }
  }

  /**
   * Advanced memory categorization with neural network
   */
  async categorizeMemory(text) {
    const categories = await this.neuralMapper.categorizeText(text, {
      detailed: true,
      confidenceThreshold: 0.7
    });
    
    return categories.primary || 'general';
  }

  /**
   * Calculate memory importance with emotional intelligence
   */
  calculateImportance(interaction) {
    let score = 0;
    
    // Emotional impact (with intensity consideration)
    if (interaction.sentiment) {
      const emotionalIntensity = Math.abs(interaction.sentiment);
      score += emotionalIntensity * this.importanceWeights.sentiment;
      score += (emotionalIntensity * 0.5) * this.importanceWeights.emotionalIntensity;
    }
    
    // Recency with nonlinear decay
    const age = Date.now() - new Date(interaction.time).getTime();
    const recency = Math.exp(-Math.pow(age / (AION_CONFIG.memory.recencyHalfLife * 24 * 60 * 60 * 1000), 0.7));
    score += recency * this.importanceWeights.recency;
    
    // Information density (length with complexity)
    const text = interaction.question + interaction.response;
    const complexity = this.calculateTextComplexity(text);
    const lengthScore = Math.min(1, Math.log(text.length + 1) / Math.log(500));
    score += lengthScore * complexity * this.importanceWeights.interactionLength;
    
    // Strategic importance by category
    const category = this.categorizeMemory(text);
    const categoryWeights = {
      technical: 1.0, educational: 0.9, scientific: 0.95,
      philosophical: 0.85, emotional: 0.8, procedural: 0.75,
      predictive: 0.9, creative: 0.7, personal: 0.6, general: 0.5
    };
    score += (categoryWeights[category] || 0.5) * this.importanceWeights.category;
    
    // Apply nonlinear scaling
    return Math.min(1, Math.max(0, Math.pow(score, 0.8)));
  }

  calculateTextComplexity(text) {
    // Calculate text complexity based on various factors
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgSentenceLength = wordCount / sentenceCount;
    const longWords = text.split(/\s+/).filter(word => word.length > 6).length;
    
    return Math.min(1, 0.3 + (longWords / wordCount) * 0.4 + (avgSentenceLength / 20) * 0.3);
  }

  /**
   * Store memory with advanced processing
   */
  async storeMemory(interaction) {
    this.perfMonitor.start('storeMemory');
    
    try {
      if (!interaction || !interaction.question || !interaction.response) {
        throw new Error('Invalid interaction data provided to storeMemory');
      }

      const memoryText = `User: "${interaction.question}"\nAION: "${interaction.response}"`;
      const vector = await this.getVectorEmbedding(memoryText);
      const category = await this.categorizeMemory(memoryText);
      const importance = this.calculateImportance(interaction);
      
      const memoryRecord = {
        id: this.generateMemoryId(),
        text: memoryText,
        vector: vector,
        timestamp: new Date(interaction.time),
        mood: interaction.mood,
        sentiment: interaction.sentiment,
        category: category,
        importance: importance,
        emotionalValence: interaction.sentiment || 0,
        metadata: {
          questionLength: interaction.question.length,
          responseLength: interaction.response.length,
          language: await this.detectLanguage(memoryText),
          complexity: this.calculateTextComplexity(memoryText),
          novelty: await this.calculateNovelty(memoryText)
        },
        accessPattern: {
          firstAccess: Date.now(),
          lastAccess: Date.now(),
          accessCount: 0
        }
      };
      
      // Process through memory stages
      this.sensoryBuffer.push(memoryRecord);
      setTimeout(() => this.transferToWorkingMemory(memoryRecord), 1000);
      
      logger.debug('Memory stored in sensory buffer', {
        category,
        importance: importance.toFixed(3),
        complexity: memoryRecord.metadata.complexity.toFixed(2)
      });
      
    } catch (error) {
      logger.error('Error storing memory', error);
      throw error;
    } finally {
      this.perfMonitor.end('storeMemory');
    }
  }

  async transferToWorkingMemory(memory) {
    // Remove from sensory buffer
    this.sensoryBuffer = this.sensoryBuffer.filter(m => m.id !== memory.id);
    
    // Add to working memory with enhanced context
    memory.workingMemoryContext = await this.generateContext(memory);
    this.workingMemory.push(memory);
    
    // Schedule consolidation check
    if (this.workingMemory.length > 15) {
      this.consolidateMemories();
    }

    // schedule spaced rehearsal for important memories
    try {
      this.scheduleRehearsal(memory);
    } catch (e) {
      logger.warn('Failed to schedule rehearsal', e);
    }
  }

  scheduleRehearsal(memory) {
    const importance = memory.importance || 0.1;
    const baseMs = 24 * 60 * 60 * 1000; // 1 day
    const interval = Math.max(60 * 1000, baseMs * (1 - importance));
    setTimeout(() => {
      this.rehearseMemory(memory.id).catch(e => logger.warn('Rehearsal errored', e));
    }, interval);
  }

  async rehearseMemory(memoryId) {
    const mem = this.findMemoryById(memoryId);
    if (!mem) return;
    try {
      mem.accessPattern.lastAccess = Date.now();
      mem.accessPattern.accessCount = (mem.accessPattern.accessCount || 0) + 1;
      // strengthen related graph nodes
      const related = this.knowledgeGraph.getRelatedNodes(mem.id, 5);
      for (const r of related) this.knowledgeGraph.strengthenConnection(mem.id, r, 0.02);
      // refine embedding slightly
      const newVec = await this.getVectorEmbedding(mem.text + (mem.workingMemoryContext?.relatedConcepts?.join(' ') || ''));
      mem.vector = this.interpolateVectors(mem.vector || [], newVec || [], 0.05);
      // persist snapshot for high-importance memories
      if (mem.importance > 0.7) await this.snapshotMemory(mem);
    } catch (e) {
      logger.warn('rehearseMemory failed', e);
    }
  }

  interpolateVectors(v1, v2, alpha = 0.1) {
    if (!v1 || v1.length === 0) return v2;
    if (!v2 || v2.length === 0) return v1;
    const n = Math.min(v1.length, v2.length);
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = v1[i] * (1 - alpha) + v2[i] * alpha;
    return out;
  }

  async generateContext(memory) {
    return {
      relatedConcepts: await this.extractConcepts(memory.text),
      emotionalContext: this.analyzeEmotionalContext(memory),
      temporalContext: Date.now(),
      spatialContext: 'conversational'
    };
  }

  async extractConcepts(text) {
    // Advanced concept extraction
    return this.neuralMapper.extractConcepts(text, {
      depth: 'deep',
      relations: true
    });
  }

  analyzeEmotionalContext(memory) {
    return {
      arousal: Math.abs(memory.sentiment || 0) * 10,
      valence: memory.sentiment > 0 ? 'positive' : 'negative',
      dominance: 0.5 // Placeholder
    };
  }

  generateMemoryId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async detectLanguage(text) {
    // Simple language detection (would use proper library in production)
    if (/[àâäéèêëîïôöùûüÿç]/.test(text)) return 'fr';
    if (/[áéíóúñ]/.test(text)) return 'es';
    if (/[äöüß]/.test(text)) return 'de';
    return 'en';
  }

  async calculateNovelty(text) {
    // Calculate how novel this information is compared to existing knowledge
    const similar = await this.findSimilarMemories(text, 5);
    if (similar.length === 0) return 1.0;
    
    const avgSimilarity = similar.reduce((sum, m) => sum + m.similarity, 0) / similar.length;
    return 1.0 - avgSimilarity;
  }

  /**
   * Advanced memory consolidation with quantum compression
   */
  async consolidateMemories() {
    const memoriesToProcess = this.workingMemory.splice(0, this.workingMemory.length);
    
    // Group memories by category and importance
    const memoryGroups = this.groupMemoriesForConsolidation(memoriesToProcess);
    
    for (const group of memoryGroups) {
      if (group.memories.length > 2) {
        // Consolidate similar memories
        const consolidated = await this.consolidationEngine.consolidateMemories(group.memories);
        await this.storeLongTermMemory(consolidated);
      } else {
        // Store individually
        for (const memory of group.memories) {
          if (memory.importance > 0.4) {
            await this.storeLongTermMemory(memory);
          }
        }
      }
    }
    
    logger.info('Memory consolidation completed', {
      processed: memoriesToProcess.length,
      groups: memoryGroups.length
    });
  }

  groupMemoriesForConsolidation(memories) {
    const groups = new Map();
    
    for (const memory of memories) {
      const key = `${memory.category}_${Math.round(memory.importance * 10)}`;
      if (!groups.has(key)) {
        groups.set(key, { category: memory.category, importance: memory.importance, memories: [] });
      }
      groups.get(key).memories.push(memory);
    }
    
    return Array.from(groups.values());
  }

  async storeLongTermMemory(memory) {
    // Compress memory if beneficial
    if (memory.text.length > 200) {
      memory = await this.consolidationEngine.compressMemory(memory);
    }
    
    // Add to appropriate long-term storage
    await this.episodicMemory.add(memory);
    this.indexMemory(memory);
    this.extractAndConnectEntities(memory);
    
    // Add to emotional memory if significant
    if (Math.abs(memory.emotionalValence) > 0.6) {
      this.emotionalMemory.push(memory);
    }
  }

  indexMemory(memory) {
    // Add to fast lookup index
    this.memoryIndex.set(memory.id, memory);
    
    // Index by category
    if (!this.categoryIndex) this.categoryIndex = new Map();
    if (!this.categoryIndex.has(memory.category)) {
      this.categoryIndex.set(memory.category, []);
    }
    this.categoryIndex.get(memory.category).push(memory.id);
    
    // Index by time
    if (!this.temporalIndex) this.temporalIndex = new Map();
    const timeKey = new Date(memory.timestamp).toISOString().slice(0, 13); // Hour precision
    if (!this.temporalIndex.has(timeKey)) {
      this.temporalIndex.set(timeKey, []);
    }
    this.temporalIndex.get(timeKey).push(memory.id);

    // Add to conceptual knowledge graph for faster semantic queries
    try {
      this.knowledgeGraph.addNode(memory.id, { label: memory.text.slice(0, 80), type: memory.category || 'auto', metadata: { importance: memory.importance } });
    } catch (e) {
      logger.warn('knowledgeGraph.addNode failed', e);
    }
    // Incrementally update ANN index and other secondary indexes asynchronously
    try {
      setTimeout(() => {
        try {
          // update category index
          if (!this.categoryIndex) this.categoryIndex = new Map();
          if (!this.categoryIndex.has(memory.category)) this.categoryIndex.set(memory.category, []);
          this.categoryIndex.get(memory.category).push(memory.id);

          // temporal index
          if (!this.temporalIndex) this.temporalIndex = new Map();
          const timeKey = new Date(memory.timestamp).toISOString().slice(0, 13);
          if (!this.temporalIndex.has(timeKey)) this.temporalIndex.set(timeKey, []);
          this.temporalIndex.get(timeKey).push(memory.id);

          // update normalized vector cache for ANN
          try { this._updateAnnIndexForMemory(memory); } catch (e) { /* ignore */ }
        } catch (e) { logger.warn('async indexMemory update failed', e); }
      }, 0);
    } catch (e) {}
  }

  async snapshotMemory(memory) {
    try {
      const toSave = {
        id: memory.id,
        text: memory.text.slice(0, 2000),
        timestamp: memory.timestamp,
        category: memory.category,
        importance: memory.importance
      };
      // For very important memories, persist immediately; otherwise enqueue for batched persistence
      if (memory.importance && memory.importance > 0.8) {
        await db.memories.put(toSave);
      } else {
        this._enqueuePersist(toSave);
      }
      return true;
    } catch (e) {
      logger.warn('snapshotMemory failed', e);
      return false;
    }
  }

  extractAndConnectEntities(memory) {
    // Advanced entity extraction with relationship detection
    const entities = this.neuralMapper.extractEntities(memory.text, {
      types: ['person', 'place', 'concept', 'event', 'emotion']
    });
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const relationship = this.detectRelationship(entities[i], entities[j], memory.text);
        this.knowledgeGraph.addEdge(entities[i].text, entities[j].text, relationship, 0.7);
      }
      
      // Add temporal context
      this.knowledgeGraph.addTemporalLink(
        entities[i].text, 
        memory.timestamp, 
        'mentioned_in_memory',
        memory.importance
      );
    }
    
    // Form conceptual clusters if relevant
    if (entities.length >= 3) {
      const clusterId = `cluster_${Date.now()}`;
      this.knowledgeGraph.formConceptualCluster(
        entities.map(e => e.text),
        clusterId,
        memory.category
      );
    }
  }

  detectRelationship(entity1, entity2, context) {
    // Simple relationship detection (would use NLP in production)
    const between = context.indexOf(entity1.text) < context.indexOf(entity2.text) ? 
      context.substring(context.indexOf(entity1.text), context.indexOf(entity2.text)) :
      context.substring(context.indexOf(entity2.text), context.indexOf(entity1.text));
    
    if (between.includes(' is ')) return 'is_a';
    if (between.includes(' has ')) return 'has';
    if (between.includes(' loves ')) return 'loves';
    if (between.includes(' hates ')) return 'hates';
    if (between.includes(' created ')) return 'created_by';
    
    return 'related_to';
  }

  /**
   * Holographic memory retrieval with quantum resonance
   */
  async retrieveRelevantMemories(queryText, topK = 5, options = {}) {
    this.perfMonitor.start('retrieveRelevantMemories');
    
    try {
      if (!queryText) return [];
      
      // Get memories from all systems
      const allMemories = [
        ...this.sensoryBuffer,
        ...this.workingMemory,
        ...await this.episodicMemory.toArray(),
        ...this.semanticMemory,
        ...this.emotionalMemory
      ];

      if (allMemories.length === 0) return [];

      const queryVector = await this.getVectorEmbedding(queryText);
      const now = Date.now();
      const queryConcepts = await this.extractConcepts(queryText);

      // Multi-factor scoring with quantum enhancement
      const scores = await Promise.all(allMemories.map(async mem => {
        // Quantum resonance similarity
        const quantumSimilarity = this.quantumEngine.isAvailable() ? 
          await this.quantumEngine.calculateResonance(queryVector, mem.vector) : 0;
        
        // Semantic similarity
        const semanticSimilarity = this.calculateSimilarity(queryVector, mem.vector);
        
        // Conceptual alignment
        const conceptualAlignment = await this.calculateConceptualAlignment(queryConcepts, mem);
        
        // Temporal relevance (with recency boost)
        const age = now - new Date(mem.timestamp).getTime();
        const recencyFactor = Math.exp(-age / (AION_CONFIG.memory.recencyHalfLife * 24 * 60 * 60 * 1000));
        
        // Emotional resonance
        const emotionalResonance = this.calculateEmotionalResonance(queryText, mem);
        
        // Strategic importance
        const strategicValue = this.calculateStrategicValue(mem, options);
        
        // Combined score with weights
        const score = (
          quantumSimilarity * 0.25 +
          semanticSimilarity * 0.20 +
          conceptualAlignment * 0.15 +
          recencyFactor * 0.15 +
          emotionalResonance * 0.10 +
          mem.importance * 0.10 +
          strategicValue * 0.05
        );
        
        return { ...mem, score, components: {
          quantumSimilarity, semanticSimilarity, conceptualAlignment,
          recencyFactor, emotionalResonance, strategicValue
        }};
      }));

      scores.sort((a, b) => b.score - a.score);
      
      const result = scores.slice(0, topK);
      
      // Update access patterns
      result.forEach(mem => {
        mem.accessPattern.lastAccess = Date.now();
        mem.accessPattern.accessCount++;
      });

      // Retrieve from knowledge graph with advanced reasoning
      const graphResults = this.retrieveFromKnowledgeGraph(queryText, queryConcepts);
      if (graphResults.length > 0) {
        result.push({
          text: `Knowledge Network: ${graphResults.join('; ')}`,
          source: 'Multidimensional Knowledge Graph',
          score: 0.85,
          isInference: true
        });
      }
      
      // Apply holographic projection for deeper insights
      const holographicInsights = await this.holographicProjector.generateInsights(result, queryText);
      if (holographicInsights) {
        result.push({
          text: holographicInsights,
          source: 'Holographic Memory Projection',
          score: 0.9,
          isProjection: true
        });
      }
      
      logger.debug('Advanced memory retrieval completed', {
        query: queryText.substring(0, 50),
        totalMemories: allMemories.length,
        topScore: result[0]?.score?.toFixed(3),
        components: result[0]?.components
      });
      
      return result;
    } catch (error) {
      logger.error('Error retrieving memories', error);
      return [];
    } finally {
      this.perfMonitor.end('retrieveRelevantMemories');
    }
  }

  calculateSimilarity(vec1, vec2) {
    // Cosine similarity
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2 || 1);
  }

  async calculateConceptualAlignment(queryConcepts, memory) {
    const memoryConcepts = await this.extractConcepts(memory.text);
    const commonConcepts = queryConcepts.filter(c => 
      memoryConcepts.some(mc => mc.text === c.text)
    );
    return commonConcepts.length / Math.max(queryConcepts.length, 1);
  }

  calculateEmotionalResonance(query, memory) {
    const querySentiment = this.analyzeSentiment(query);
    return 1 - Math.abs((memory.sentiment || 0) - querySentiment) / 2;
  }

  analyzeSentiment(text) {
    // Advanced sentiment analysis (would use proper NLP in production)
    const positive = (text.match(/\b(love|like|great|wonderful|excellent|good|nice|happy|joy)\b/gi) || []).length;
    const negative = (text.match(/\b(hate|dislike|bad|terrible|awful|horrible|sad|angry)\b/gi) || []).length;
    return Math.tanh((positive - negative) * 0.5);
  }

  // Find memory by id using in-memory index or DB fallback
  findMemoryById(id) {
    if (!id) return null;
    if (this.memoryIndex && this.memoryIndex.has(id)) return this.memoryIndex.get(id);
    try {
      // synchronous DB get may not be available; return null and allow async callers to fetch
      if (db && db.memories && typeof db.memories.get === 'function') {
        return db.memories.get(id);
      }
    } catch (e) {}
    return null;
  }

  calculateStrategicValue(memory, options) {
    // Calculate strategic value based on current context and goals
    let value = memory.importance;
    
    if (options.priorityCategory && memory.category === options.priorityCategory) {
      value *= 1.3;
    }
    
    if (options.recencyBoost) {
      const age = Date.now() - new Date(memory.timestamp).getTime();
      const recency = Math.exp(-age / (24 * 60 * 60 * 1000)); // Daily decay
      value *= 1 + recency * 0.5;
    }
    
    return Math.min(1, value);
  }

  retrieveFromKnowledgeGraph(query, concepts) {
    const results = [];
    
    for (const concept of concepts.slice(0, 3)) {
      const related = this.knowledgeGraph.getRelatedNodes(concept.text, 3);
      const temporal = this.knowledgeGraph.getTemporalContext(concept.text);
      
      if (related.length > 0) {
        results.push(`${concept.text} relates to: ${related.join(', ')}`);
      }
      
      if (temporal.length > 0) {
        const recent = temporal.filter(t => t.significance > 0.6);
        if (recent.length > 0) {
          results.push(`${concept.text} was recently discussed in important contexts`);
        }
      }
    }
    
    return results;
  }

  /**
   * Advanced memory maintenance operations
   */
  async performMemoryMaintenance() {
    logger.info('Starting advanced memory maintenance');
    
    // Clean up old memories
    await this.cleanupMemories();
    
    // Strengthen important connections
    this.strengthenImportantConnections();
    
    // Decay weak connections
    this.knowledgeGraph.decayConnections();
    
    // Reindex memories for faster retrieval
    await this.reindexMemories();
    
    // Perform quantum defragmentation if available
    if (this.quantumEngine.isAvailable()) {
      await this.quantumEngine.defragmentMemory(this.episodicMemory);
    }
    
    logger.info('Memory maintenance completed');
  }

  async cleanupMemories(maxMemories = AION_CONFIG.memory.maxMemories) {
    try {
      const memories = await this.episodicMemory.toArray();
      
      if (memories.length <= maxMemories) return;
      
      // Score memories for retention (importance + recency + access frequency)
      const scoredMemories = memories.map(mem => {
        const age = Date.now() - new Date(mem.timestamp).getTime();
        const recency = Math.exp(-age / (30 * 24 * 60 * 60 * 1000)); // Monthly decay
        const accessFrequency = Math.log(mem.accessPattern?.accessCount || 1) / Math.log(10);
        
        const retentionScore = (
          mem.importance * 0.5 +
          recency * 0.3 +
          accessFrequency * 0.2
        );
        
        return { ...mem, retentionScore };
      });
      
  // Remove lowest scoring memories, but respect pinned memories
  const filtered = scoredMemories.filter(m => !this._pinnedMemories.has(m.id));
  filtered.sort((a, b) => a.retentionScore - b.retentionScore);
  const toDelete = filtered.slice(0, Math.max(0, memories.length - maxMemories));
      
      for (const memory of toDelete) {
        await this.episodicMemory.delete(memory.id);
        this.memoryIndex.delete(memory.id);
      }
      
      logger.info('Advanced memory cleanup completed', {
        deleted: toDelete.length,
        remaining: memories.length - toDelete.length,
        minRetentionScore: toDelete[0]?.retentionScore?.toFixed(3)
      });
    } catch (error) {
      logger.error('Error during memory cleanup', error);
    }
  }

  strengthenImportantConnections() {
    // Strengthen connections for frequently accessed memories
    const recentAccess = Array.from(this.memoryIndex.values())
      .filter(mem => mem.accessPattern?.accessCount > 2)
      .slice(0, 20);
    
    for (const memory of recentAccess) {
      const concepts = this.neuralMapper.extractEntities(memory.text);
      for (let i = 0; i < concepts.length; i++) {
        for (let j = i + 1; j < concepts.length; j++) {
          this.knowledgeGraph.strengthenConnection(
            concepts[i].text, 
            concepts[j].text,
            0.05 * memory.importance
          );
        }
      }
    }
  }

  async reindexMemories() {
    // Rebuild indexes for optimal performance (incremental, non-blocking)
    this.memoryIndex = new Map();
    this.categoryIndex = new Map();
    this.temporalIndex = new Map();
    this._annIndex.normalized.clear();

    const memories = await this.episodicMemory.toArray();
    // Populate indexes in small batches to avoid blocking
    const batchSize = 50;
    for (let i = 0; i < memories.length; i += batchSize) {
      const batch = memories.slice(i, i + batchSize);
      for (const memory of batch) {
        this.memoryIndex.set(memory.id, memory);
        // schedule secondary index updates asynchronously
        setTimeout(() => this.indexMemory(memory), 0);
      }
      // yield to event loop
      await new Promise(res => setTimeout(res, 0));
    }
  }

  /**
   * Advanced memory visualization and analysis
   */
  async getMemoryNetwork(maxNodes = 50) {
    const nodes = [];
    const edges = [];
    
    // Get important memories
    const memories = (await this.episodicMemory.toArray())
      .sort((a, b) => b.importance - a.importance)
      .slice(0, maxNodes / 2);
    
    // Add memory nodes
    for (const memory of memories) {
      nodes.push({
        id: memory.id,
        label: memory.text.substring(0, 30) + '...',
        type: 'memory',
        category: memory.category,
        importance: memory.importance,
        size: 5 + (memory.importance * 15)
      });
    }
    
    // Add knowledge graph nodes
    const graphNodes = Array.from(this.knowledgeGraph.nodes.values())
      .sort((a, b) => b.connections - a.connections)
      .slice(0, maxNodes / 2);
    
    for (const node of graphNodes) {
      nodes.push({
        id: node.id,
        label: node.label,
        type: 'concept',
        connections: node.connections,
        size: 3 + Math.log(node.connections + 1) * 2
      });
    }
    
    // Add edges from knowledge graph
    let edgeCount = 0;
    for (const [edgeId, edge] of this.knowledgeGraph.edges) {
      if (edgeCount++ >= maxNodes * 1.5) break;
      
      edges.push({
        source: edge.source,
        target: edge.target,
        label: edge.relationship,
        strength: edge.strength,
        width: 1 + edge.strength * 3
      });
    }
    
    return { nodes, edges };
  }

  async getTemporalMemoryPatterns() {
    const patterns = {
      hourly: new Array(24).fill(0),
      daily: new Array(7).fill(0),
      monthly: new Array(12).fill(0)
    };
    
    const memories = await this.episodicMemory.toArray();
    
    for (const memory of memories) {
      const date = new Date(memory.timestamp);
      patterns.hourly[date.getHours()] += memory.importance;
      patterns.daily[date.getDay()] += memory.importance;
      patterns.monthly[date.getMonth()] += memory.importance;
    }
    
    return patterns;
  }

  async findMemoryPatterns() {
    const memories = await this.episodicMemory.toArray();
    const patterns = {
      categoryPatterns: {},
      emotionalPatterns: {},
      temporalPatterns: await this.getTemporalMemoryPatterns()
    };
    
    // Category patterns
    for (const memory of memories) {
      patterns.categoryPatterns[memory.category] = (patterns.categoryPatterns[memory.category] || 0) + 1;
    }
    
    // Emotional patterns
    const emotionalMemories = memories.filter(m => Math.abs(m.emotionalValence) > 0.3);
    for (const memory of emotionalMemories) {
      const emotionType = memory.emotionalValence > 0 ? 'positive' : 'negative';
      patterns.emotionalPatterns[emotionType] = (patterns.emotionalPatterns[emotionType] || 0) + 1;
    }
    
    return patterns;
  }

  /**
   * Memory evolution and growth
   */
  async evolveMemorySystem() {
    // Adaptive learning of importance weights
    this.adaptImportanceWeights();
    
    // Create new memory categories based on patterns
    await this.createNewCategories();
    
    // Optimize storage based on usage patterns
    await this.optimizeStorageStrategy();
    
    logger.info('Memory system evolution completed');
  }

  adaptImportanceWeights() {
    // Adaptive learning based on memory usage patterns
    const usage = this.calculateUsagePatterns();
    
    // Adjust weights based on what's being used
    this.importanceWeights.recency *= (1 + usage.recencyBias * 0.1);
    this.importanceWeights.sentiment *= (1 + usage.emotionalBias * 0.1);
    
    // Normalize weights
    const total = Object.values(this.importanceWeights).reduce((sum, w) => sum + w, 0);
    for (const key in this.importanceWeights) {
      this.importanceWeights[key] /= total;
    }
  }

  calculateUsagePatterns() {
    // Analyze how memories are being used
    return {
      recencyBias: 0.6, // Placeholder
      emotionalBias: 0.4,
      conceptualBias: 0.7
    };
  }

  async createNewCategories() {
    // Create new categories based on emerging patterns
    const memories = await this.episodicMemory.toArray();
    const newCategories = this.analyzeForNewCategories(memories);
    
    for (const category of newCategories) {
      if (!this.categories.includes(category)) {
        this.categories.push(category);
        logger.info(`New memory category created: ${category}`);
      }
    }
  }

  analyzeForNewCategories(memories) {
    // Analyze memories for potential new categories
    const potentialCategories = [];
    
    // This would use advanced clustering in production
    if (memories.some(m => m.text.includes('quantum'))) {
      potentialCategories.push('quantum_physics');
    }
    
    if (memories.some(m => m.text.includes('blockchain'))) {
      potentialCategories.push('blockchain_technology');
    }
    
    return potentialCategories;
  }

  async optimizeStorageStrategy() {
    // Optimize based on access patterns
    const memories = await this.episodicMemory.toArray();
    const accessPatterns = memories.map(m => m.accessPattern || { accessCount: 0 });
    
    const totalAccesses = accessPatterns.reduce((sum, p) => sum + p.accessCount, 0);
    if (totalAccesses > 1000) {
      // Favor faster access for frequently accessed memories
      AION_CONFIG.memory.embeddingDimensions = Math.min(2048, 
        AION_CONFIG.memory.embeddingDimensions * 1.1
      );
    }
  }
}

export const advancedAionMemory = new AdvancedAionMemory();
export { AdvancedAionMemory };

// --- SUPERHUMAN EXTENSIONS ---
AdvancedAionMemory.prototype.ingestExternalKnowledge = async function(url, options = {}) {
  try {
    // Simple fetch (production: use proper web/API client)
    const response = await fetch(url);
    const text = await response.text();
    const summary = await this.dynamicSummarize(text, options.query || '');
    this.semanticMemory.push({
      source: url,
      summary,
      timestamp: Date.now(),
      type: options.type || 'web'
    });
    this.externalKnowledgeSources.push(url);
    return summary;
  } catch (err) {
    logger.error('External knowledge ingestion failed', err);
    return null;
  }
};

AdvancedAionMemory.prototype.dynamicSummarize = async function(text, query = '') {
  // Placeholder: In production, call LLM API (e.g., OpenAI, local model)
  // Here, just return first 3 sentences and query match
  const sentences = text.split(/[.!?]+/).slice(0, 3).join('. ');
  if (query && text.toLowerCase().includes(query.toLowerCase())) {
    return `Summary (query match): ${sentences}`;
  }
  return `Summary: ${sentences}`;
};

AdvancedAionMemory.prototype.predictFuture = async function(contextText) {
  // Simple pattern-based prediction (production: ML/LLM)
  const now = Date.now();
  let prediction = 'No prediction.';
  if (contextText.toLowerCase().includes('trend')) {
    prediction = 'Future trend likely to accelerate.';
  } else if (contextText.toLowerCase().includes('risk')) {
    prediction = 'Potential risk detected in future.';
  } else if (contextText.toLowerCase().includes('opportunity')) {
    prediction = 'Opportunity may arise soon.';
  }
  const result = { context: contextText, prediction, timestamp: now };
  this.predictionHistory.push(result);
  return result;
};

AdvancedAionMemory.prototype.distributeMemory = async function(memory, nodeAddresses) {
  // Placeholder: In production, use network protocol (gRPC, REST, etc.)
  nodeAddresses.forEach(addr => {
    // Simulate sending memory
    this.distributedNodes.push(addr);
  });
  logger.info(`Distributed memory to nodes: ${nodeAddresses.join(', ')}`);
  return true;
};

/**
 * Persistence batching: enqueue snapshots and flush in batches to reduce DB I/O.
 */
AdvancedAionMemory.prototype._enqueuePersist = function(memory) {
  try {
    if (!memory || !memory.id) return;
    this._persistQueue.set(memory.id, {
      id: memory.id,
      text: memory.text?.slice(0, 2000) || '',
      timestamp: memory.timestamp || Date.now(),
      category: memory.category,
      importance: memory.importance
    });

    if (this._persistTimer) clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => this._flushPersistQueue(), this._persistDebounceMs);
  } catch (e) {
    logger.warn('enqueuePersist failed', e);
  }
};

AdvancedAionMemory.prototype._flushPersistQueue = async function() {
  if (!this._persistQueue || this._persistQueue.size === 0) return;
  const items = Array.from(this._persistQueue.values());
  this._persistQueue.clear();
  try {
    // Attempt bulk write; fall back to individual puts
    if (db && db.memories && typeof db.memories.bulkPut === 'function') {
      await db.memories.bulkPut(items);
    } else {
      await Promise.all(items.map(it => db.memories.put(it).catch(e => { logger.warn('bulk persist item failed', e); })));
    }
  } catch (e) {
    logger.error('flushPersistQueue failed', e);
  }
};

// best-effort synchronous flush (no await)
AdvancedAionMemory.prototype._flushPersistQueueSync = function() {
  try {
    if (!this._persistQueue || this._persistQueue.size === 0) return;
    const items = Array.from(this._persistQueue.values());
    this._persistQueue.clear();
    items.forEach(it => {
      try { db.memories.put(it); } catch (e) { /* swallow */ }
    });
  } catch (e) {}
};

// Pin/unpin memories to avoid cleanup
AdvancedAionMemory.prototype.pinMemory = function(memoryId) {
  if (!memoryId) return false;
  this._pinnedMemories.add(memoryId);
  return true;
};

AdvancedAionMemory.prototype.unpinMemory = function(memoryId) {
  if (!memoryId) return false;
  this._pinnedMemories.delete(memoryId);
  return true;
};

// Promote/demote memory between tiers (working, episodic, semantic)
AdvancedAionMemory.prototype.promoteMemory = async function(memoryId, target = 'episodic') {
  const mem = this.findMemoryById ? this.findMemoryById(memoryId) : this.memoryIndex.get(memoryId);
  if (!mem) return false;
  try {
    if (target === 'episodic') {
      await this.storeLongTermMemory(mem);
    } else if (target === 'semantic') {
      this.semanticMemory.push(mem);
      await this._enqueuePersist(mem);
    }
    return true;
  } catch (e) {
    logger.warn('promoteMemory failed', e);
    return false;
  }
};

AdvancedAionMemory.prototype.demoteMemory = function(memoryId, target = 'working') {
  const mem = this.memoryIndex.get(memoryId);
  if (!mem) return false;
  try {
    if (target === 'working') {
      this.workingMemory.push(mem);
    } else if (target === 'sensory') {
      this.sensoryBuffer.push(mem);
    }
    return true;
  } catch (e) {
    logger.warn('demoteMemory failed', e);
    return false;
  }
};

// Build a simple in-memory ANN-like normalized vector cache for fast similarity
AdvancedAionMemory.prototype.buildAnnIndex = async function() {
  try {
    const memories = await this.episodicMemory.toArray();
    this._annIndex.normalized.clear();
    for (const mem of memories) {
      if (mem.vector && mem.vector.length) {
        const norm = Math.sqrt(mem.vector.reduce((s, v) => s + v * v, 0)) || 1;
        this._annIndex.normalized.set(mem.id, mem.vector.map(v => v / norm));
      }
    }
  } catch (e) {
    logger.warn('buildAnnIndex failed', e);
  }
};

// Find similar memories using the in-memory normalized cache for fast cosine similarity
AdvancedAionMemory.prototype.findSimilarMemories = async function(text, topK = 5) {
  try {
    const qVec = await this.getVectorEmbedding(text);
    if (!qVec || qVec.length === 0) return [];
    const qNorm = Math.sqrt(qVec.reduce((s, v) => s + v * v, 0)) || 1;
    const qNormalized = qVec.map(v => v / qNorm);

    // Ensure ann index exists
    if (!this._annIndex || !this._annIndex.normalized || this._annIndex.normalized.size === 0) {
      await this.buildAnnIndex();
    }

    const scores = [];
    for (const [id, vec] of this._annIndex.normalized) {
      // dot product for cosine (vectors are normalized)
      let dot = 0;
      const n = Math.min(vec.length, qNormalized.length);
      for (let i = 0; i < n; i++) dot += vec[i] * qNormalized[i];
      scores.push({ id, similarity: dot });
    }

    scores.sort((a, b) => b.similarity - a.similarity);
    const top = scores.slice(0, topK);
    const result = [];
    for (const s of top) {
      const mem = this.memoryIndex.get(s.id) || (await this.episodicMemory.get(s.id));
      if (mem) result.push({ ...mem, similarity: s.similarity });
    }
    return result;
  } catch (e) {
    logger.warn('findSimilarMemories failed, falling back', e);
    // fallback: naive scan
    const all = await this.episodicMemory.toArray();
    const qVec = await this.getVectorEmbedding(text);
    const scored = all.map(m => ({ ...m, similarity: this.calculateSimilarity(qVec, m.vector || []) }));
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  }
};

// Update ANN cache for a single memory (normalized vector)
AdvancedAionMemory.prototype._updateAnnIndexForMemory = function(memory) {
  try {
    if (!memory || !memory.vector || !memory.vector.length) return;
    const norm = Math.sqrt(memory.vector.reduce((s, v) => s + v * v, 0)) || 1;
    this._annIndex.normalized.set(memory.id, memory.vector.map(v => v / norm));
  } catch (e) {
    logger.warn('_updateAnnIndexForMemory failed', e);
  }
};

AdvancedAionMemory.prototype.forcePersist = async function() {
  await this._flushPersistQueue();
};

AdvancedAionMemory.prototype.forceConsolidate = async function() {
  await this.consolidateMemories();
};

AdvancedAionMemory.prototype.tuneMaintenanceInterval = function(ms) {
  try {
    if (this._maintenanceInterval) clearInterval(this._maintenanceInterval);
    this._maintenanceInterval = setInterval(() => this.performMemoryMaintenance(), ms);
    if (typeof this._maintenanceInterval.unref === 'function') this._maintenanceInterval.unref();
  } catch (e) {
    logger.warn('tuneMaintenanceInterval failed', e);
  }
};