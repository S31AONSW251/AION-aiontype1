// aion-memory.js - Enhanced memory system with categorization and prioritization
import { db } from '../services/AionDB';
import { logger } from './logger.js';
import { AION_CONFIG } from './config.js';
import { PerformanceMonitor } from './perf.js';

// KnowledgeGraph to store and connect key entities
class KnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  addNode(id, label, type) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, label, type, connections: 0 });
    }
  }

  addEdge(source, target, relationship) {
    this.addNode(source, source, 'unknown');
    this.addNode(target, target, 'unknown');
    this.edges.push({ source, target, relationship });
    this.nodes.get(source).connections++;
    this.nodes.get(target).connections++;
  }

  getRelatedNodes(nodeId) {
    const related = new Set();
    this.edges.forEach(edge => {
      if (edge.source === nodeId) related.add(edge.target);
      if (edge.target === nodeId) related.add(edge.source);
    });
    return Array.from(related);
  }
}

class AionMemory {
  constructor() {
    this.perfMonitor = new PerformanceMonitor();
    this.categories = ['general', 'technical', 'personal', 'creative', 'educational'];
    this.importanceWeights = {
      sentiment: 0.3,
      recency: 0.4,
      interactionLength: 0.2,
      category: 0.1
    };
    // Initialize the new memory architecture
    this.workingMemory = []; // For immediate context (short-term)
    this.episodicMemory = db.memories; // For significant past interactions (long-term)
    this.knowledgeGraph = new KnowledgeGraph();
  }

  /**
   * Simulates creating a vector embedding for a piece of text with enhanced semantics.
   * @param {string} text - The text to embed.
   * @returns {Promise<Array<number>>} A simulated vector.
   */
  async getVectorEmbedding(text) {
    this.perfMonitor.start('getVectorEmbedding');
    
    try {
      const vector = Array(AION_CONFIG.memory.embeddingDimensions).fill(0);
      
      // Enhanced semantic-aware embedding simulation
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const position = i % AION_CONFIG.memory.embeddingDimensions;
        
        // Weight by character importance (vowels, consonants, punctuation)
        let weight = 1;
        if ('aeiouAEIOU'.includes(char)) weight = 1.2;
        if ('.,!?;:'.includes(char)) weight = 1.5;
        
        vector[position] += text.charCodeAt(i) * weight;
      }
      
      // Normalize
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      const result = vector.map(v => v / (magnitude || 1));
      
      this.perfMonitor.end('getVectorEmbedding');
      return result;
    } catch (error) {
      logger.error('Error in getVectorEmbedding', error);
      this.perfMonitor.end('getVectorEmbedding');
      throw error;
    }
  }

  /**
   * Categorizes a memory based on its content.
   * @param {string} text - The memory text.
   * @returns {string} The category.
   */
  categorizeMemory(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('how to') || lowerText.includes('tutorial') || lowerText.includes('code')) {
      return 'technical';
    } else if (lowerText.includes('feel') || lowerText.includes('think') || lowerText.includes('opinion')) {
      return 'personal';
    } else if (lowerText.includes('create') || lowerText.includes('design') || lowerText.includes('art')) {
      return 'creative';
    } else if (lowerText.includes('learn') || lowerText.includes('teach') || lowerText.includes('study')) {
      return 'educational';
    }
    
    return 'general';
  }

  /**
   * Calculates the importance score of a memory.
   * @param {object} interaction - The interaction data.
   * @returns {number} Importance score (0-1).
   */
  calculateImportance(interaction) {
    let score = 0;
    
    // Sentiment impact (absolute value, both positive and negative are important)
    if (interaction.sentiment) {
      score += Math.abs(interaction.sentiment) * this.importanceWeights.sentiment;
    }
    
    // Recency (newer memories are more important)
    const age = Date.now() - new Date(interaction.time).getTime();
    const recency = Math.exp(-age / (AION_CONFIG.memory.recencyHalfLife * 24 * 60 * 60 * 1000));
    score += recency * this.importanceWeights.recency;
    
    // Interaction length
    const textLength = (interaction.question + interaction.response).length;
    const lengthScore = Math.min(1, textLength / 500); // Normalize to 0-1
    score += lengthScore * this.importanceWeights.interactionLength;
    
    // Category importance (technical and educational are weighted higher)
    const category = this.categorizeMemory(interaction.question + interaction.response);
    const categoryWeights = { technical: 1, educational: 0.8, creative: 0.6, personal: 0.4, general: 0.2 };
    score += (categoryWeights[category] || 0) * this.importanceWeights.category;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Stores a new memory entry in the persistent database with enhanced metadata.
   * @param {object} interaction - The interaction object from conversation history.
   */
  async storeMemory(interaction) {
    this.perfMonitor.start('storeMemory');
    
    try {
      if (!interaction || !interaction.question || !interaction.response) {
        throw new Error('Invalid interaction data provided to storeMemory');
      }

      const memoryText = `User: "${interaction.question}"\nAION: "${interaction.response}"`;
      const vector = await this.getVectorEmbedding(memoryText);
      const category = this.categorizeMemory(memoryText);
      const importance = this.calculateImportance(interaction);
      
      const memoryRecord = {
        text: memoryText,
        vector: vector,
        timestamp: new Date(interaction.time),
        mood: interaction.mood,
        sentiment: interaction.sentiment,
        category: category,
        importance: importance,
        metadata: {
          questionLength: interaction.question.length,
          responseLength: interaction.response.length,
          language: 'en' // Could detect language here
        }
      };
      
      // Add to working memory
      this.workingMemory.push(memoryRecord);

      // Periodically consolidate memories
      if (this.workingMemory.length > 20) {
        this.consolidateMemories();
      }

      logger.debug('Memory stored in working memory', {
        category,
        importance: importance.toFixed(2),
        length: memoryText.length
      });
      
    } catch (error) {
      logger.error('Error storing memory', error);
      throw error;
    } finally {
      this.perfMonitor.end('storeMemory');
    }
  }

  // New method to consolidate memories
  async consolidateMemories() {
    const memoriesToConsolidate = this.workingMemory.splice(0, this.workingMemory.length);
    for (const mem of memoriesToConsolidate) {
      if (mem.importance > 0.5) {
        await this.episodicMemory.add(mem);
        this.extractEntities(mem.text);
      }
    }
    logger.info('Working memory consolidated');
  }

  // New method to extract entities and update knowledge graph
  extractEntities(text) {
    // Simple entity extraction (can be replaced with a more advanced NLP library)
    const words = text.split(/\s+/);
    const entities = words.filter(w => w.length > 4 && w[0] === w[0].toUpperCase()); // Example: find capitalized words
    if (entities.length > 1) {
      for (let i = 0; i < entities.length - 1; i++) {
        this.knowledgeGraph.addEdge(entities[i], entities[i+1], 'related_in_conversation');
      }
    }
  }

  /**
   * Retrieves the most relevant memories from the database with enhanced scoring.
   * @param {string} queryText - The current user query.
   * @param {number} topK - The number of memories to retrieve.
   * @returns {Promise<Array<object>>} A list of relevant memories.
   */
  async retrieveRelevantMemories(queryText, topK = 3) {
    this.perfMonitor.start('retrieveRelevantMemories');
    
    try {
      if (!queryText) return [];
      
      const allMemories = [
        ...this.workingMemory,
        ...await this.episodicMemory.toArray()
      ];

      if (allMemories.length === 0) return [];

      const queryVector = await this.getVectorEmbedding(queryText);
      const now = Date.now();

      // Enhanced scoring with multiple factors
      const scores = allMemories.map(mem => {
        // Semantic similarity (cosine)
        const semanticSimilarity = mem.vector.reduce((sum, val, i) => sum + val * queryVector[i], 0);
        
        // Recency factor
        const age = now - new Date(mem.timestamp).getTime();
        const recencyFactor = Math.exp(-age / (AION_CONFIG.memory.recencyHalfLife * 24 * 60 * 60 * 1000));
        
        // Combined score (weighted average)
        const score = (
          semanticSimilarity * 0.6 + 
          recencyFactor * 0.2 + 
          mem.importance * 0.2
        );
        
        return { ...mem, score };
      });

      scores.sort((a, b) => b.score - a.score);
      
      const result = scores.slice(0, topK);

      // Also retrieve from knowledge graph
      const queryEntities = queryText.split(/\s+/).filter(w => w.length > 4 && w[0] === w[0].toUpperCase());
      const relatedEntities = queryEntities.flatMap(e => this.knowledgeGraph.getRelatedNodes(e));
      if (relatedEntities.length > 0) {
        result.push({
          text: `Related concepts: ${relatedEntities.join(', ')}`,
          source: 'Knowledge Graph'
        });
      }
      
      logger.debug('Memories retrieved', {
        query: queryText.substring(0, 50),
        totalMemories: allMemories.length,
        topScore: result[0]?.score?.toFixed(3),
        categories: result.map(m => m.category)
      });
      
      return result;
    } catch (error) {
      logger.error('Error retrieving memories', error);
      return [];
    } finally {
      this.perfMonitor.end('retrieveRelevantMemories');
    }
  }

  /**
   * Fetches all memories for the visualization with optional filtering.
   */
  async getAllMemoriesForVisualization(filters = {}) {
    try {
      let memories = await this.episodicMemory.toArray();
      
      // Apply filters
      if (filters.category) {
        memories = memories.filter(m => m.category === filters.category);
      }
      
      if (filters.minImportance) {
        memories = memories.filter(m => m.importance >= filters.minImportance);
      }
      
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        memories = memories.filter(m => new Date(m.timestamp) >= start);
      }
      
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        memories = memories.filter(m => new Date(m.timestamp) <= end);
      }
      
      return memories;
    } catch (error) {
      logger.error('Error fetching memories for visualization', error);
      return [];
    }
  }

  /**
   * Cleans up old, low-importance memories to manage database size.
   * @param {number} maxMemories - Maximum number of memories to keep.
   */
  async cleanupMemories(maxMemories = AION_CONFIG.memory.maxMemories) {
    try {
      const memories = await this.episodicMemory.toArray();
      
      if (memories.length <= maxMemories) return;
      
      // Sort by importance (ascending) and remove the least important ones
      memories.sort((a, b) => a.importance - b.importance);
      const toDelete = memories.slice(0, memories.length - maxMemories);
      
      for (const memory of toDelete) {
        await this.episodicMemory.delete(memory.id);
      }
      
      logger.info('Memory cleanup completed', {
        deleted: toDelete.length,
        remaining: memories.length - toDelete.length
      });
    } catch (error) {
      logger.error('Error during memory cleanup', error);
    }
  }

  /**
   * Gets memory statistics for monitoring.
   * @returns {Promise<object>} Memory statistics.
   */
  async getStats() {
    try {
      const memories = await this.episodicMemory.toArray();
      
      const stats = {
        total: memories.length,
        workingMemorySize: this.workingMemory.length,
        knowledgeGraphNodes: this.knowledgeGraph.nodes.size,
        byCategory: {},
        avgImportance: 0,
        oldest: null,
        newest: null
      };
      
      if (memories.length > 0) {
        // Category distribution
        memories.forEach(mem => {
          stats.byCategory[mem.category] = (stats.byCategory[mem.category] || 0) + 1;
        });
        
        // Average importance
        stats.avgImportance = memories.reduce((sum, mem) => sum + mem.importance, 0) / memories.length;
        
        // Date range
        const timestamps = memories.map(m => new Date(m.timestamp).getTime());
        stats.oldest = new Date(Math.min(...timestamps));
        stats.newest = new Date(Math.max(...timestamps));
      }
      
      return stats;
    } catch (error) {
      logger.error('Error getting memory stats', error);
      return { error: error.message };
    }
  }
}

export const aionMemory = new AionMemory();