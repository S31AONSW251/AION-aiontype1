/**
 * AION ULTRA - Offline Response Manager
 * Seamlessly handles offline/online transitions with intelligent caching
 */

export class OfflineResponseManager {
  constructor() {
    this.is_online = navigator.onLine;
    this.response_cache = new Map();
    this.pending_requests = [];
    this.offline_metadata = null;
    this.sync_queue = [];
    this.last_sync = new Date();
  }

  /**
   * Initialize offline response system
   */
  async initialize(metadata_system) {
    console.log('🔧 Initializing Offline Response Manager...');
    
    this.offline_metadata = metadata_system;
    
    // Download metadata for offline use
    await this.offline_metadata.initializeOfflineMetadata();
    
    // Setup event listeners for online/offline
    this.setupNetworkListeners();
    
    // Initialize cache
    await this.preloadCache();
    
    console.log('✅ Offline Response Manager Ready');
    
    return {
      status: 'INITIALIZED',
      online: this.is_online,
      cache_size: this.response_cache.size,
      metadata_initialized: true
    };
  }

  /**
   * Setup network connectivity listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.is_online = true;
      console.log('🟢 ONLINE - Syncing offline requests...');
      this.syncOfflineRequests();
    });

    window.addEventListener('offline', () => {
      this.is_online = false;
      console.log('🔴 OFFLINE - Using local metadata for responses...');
    });
  }

  /**
   * Preload common queries and responses into cache
   */
  async preloadCache() {
    const common_queries = [
      'Hello',
      'What is artificial intelligence?',
      'How do neural networks work?',
      'Explain machine learning',
      'What is deep learning?',
      'How can I learn AI?',
      'What are the applications of AI?',
      'Tell me about quantum computing',
      'How does natural language processing work?',
      'What is the future of AI?'
    ];

    console.log('💾 Preloading response cache...');
    
    for (const query of common_queries) {
      try {
        const response = await this.offline_metadata.generateOfflineResponse(query);
        this.response_cache.set(query.toLowerCase(), response);
      } catch (error) {
        console.warn('Cache preload error:', error);
      }
    }

    console.log(`✅ Cached ${this.response_cache.size} common responses`);
  }

  /**
   * Process user input - handles both online and offline
   */
  async processInput(userInput, serverAvailable = true) {
    const input_lower = userInput.toLowerCase();
    
    // Check cache first
    if (this.response_cache.has(input_lower)) {
      console.log('💾 Cache HIT - Using cached response');
      return this.response_cache.get(input_lower);
    }

    // If online and server available, try server first
    if (this.is_online && serverAvailable) {
      try {
        console.log('🌐 Attempting server request...');
        const server_response = await this.fetchFromServer(userInput);
        
        // Cache the response
        this.response_cache.set(input_lower, server_response);
        
        return server_response;
      } catch (error) {
        console.warn('Server request failed, falling back to offline mode:', error);
        return await this.generateOfflineResponse(userInput);
      }
    }

    // Use offline metadata
    console.log('📚 Using offline metadata...');
    return await this.generateOfflineResponse(userInput);
  }

  /**
   * Generate response using offline metadata
   */
  async generateOfflineResponse(userInput) {
    try {
      const response = await this.offline_metadata.generateOfflineResponse(userInput);
      
      return {
        ...response,
        source: 'offline_metadata',
        cached: false,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Offline response generation failed:', error);
      return this.generateFallbackResponse(userInput);
    }
  }

  /**
   * Fetch response from server
   */
  async fetchFromServer(userInput) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server request timeout'));
      }, 5000); // 5 second timeout

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      })
        .then(res => {
          clearTimeout(timeout);
          if (!res.ok) throw new Error('Server error');
          return res.json();
        })
        .then(data => {
          resolve({
            response: data.response || data.message,
            source: 'server',
            cached: false,
            confidence: 0.95,
            timestamp: new Date()
          });
        })
        .catch(err => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  }

  /**
   * Generate fallback response for critical failures
   */
  generateFallbackResponse(userInput) {
    const fallback_responses = [
      'I understand you\'re asking about: ' + userInput + '. While I\'m currently having trouble accessing my full knowledge base, I can tell you that this is an interesting topic worth exploring further.',
      
      'Your question about ' + userInput + ' is valuable. In offline mode, I recommend checking related topics or trying again when connectivity is restored.',
      
      'I appreciate your question: ' + userInput + '. To give you the most accurate answer, I\'ll need to connect to my knowledge system.'
    ];

    return {
      response: fallback_responses[Math.floor(Math.random() * fallback_responses.length)],
      source: 'fallback',
      confidence: 0.6,
      offline_mode: true,
      timestamp: new Date()
    };
  }

  /**
   * Queue request for sync when online
   */
  queueOfflineRequest(userInput, callback) {
    this.sync_queue.push({
      input: userInput,
      callback: callback,
      timestamp: new Date(),
      id: Math.random().toString(36)
    });

    console.log(`📋 Request queued. Queue size: ${this.sync_queue.length}`);
  }

  /**
   * Sync offline requests when back online
   */
  async syncOfflineRequests() {
    if (this.sync_queue.length === 0) {
      console.log('✅ No requests to sync');
      return;
    }

    console.log(`🔄 Syncing ${this.sync_queue.length} offline requests...`);
    
    const queue_copy = [...this.sync_queue];
    this.sync_queue = []; // Clear queue

    for (const request of queue_copy) {
      try {
        const response = await this.processInput(request.input, true);
        request.callback(response);
        console.log(`✅ Synced: ${request.input}`);
      } catch (error) {
        console.error(`❌ Sync failed for: ${request.input}`, error);
        // Re-queue on failure
        this.sync_queue.push(request);
      }
    }

    this.last_sync = new Date();
    console.log(`✅ Sync complete. ${this.sync_queue.length} requests remaining`);
  }

  /**
   * Cache management - clear old entries
   */
  clearOldCache(max_age_hours = 24) {
    const max_age_ms = max_age_hours * 60 * 60 * 1000;
    const now = new Date();
    
    let cleared = 0;
    for (const [key, value] of this.response_cache.entries()) {
      if (now - value.timestamp > max_age_ms) {
        this.response_cache.delete(key);
        cleared++;
      }
    }

    console.log(`🧹 Cleared ${cleared} old cache entries`);
    return { cleared, remaining: this.response_cache.size };
  }

  /**
   * Get detailed offline status
   */
  getDetailedStatus() {
    return {
      online_status: {
        is_online: this.is_online,
        last_online: this.last_sync,
        network_type: this.getNetworkType()
      },
      cache_status: {
        total_cached: this.response_cache.size,
        oldest_entry: this.getOldestCacheEntry(),
        newest_entry: this.getNewestCacheEntry()
      },
      sync_status: {
        pending_requests: this.sync_queue.length,
        last_sync: this.last_sync,
        sync_in_progress: false
      },
      metadata_status: {
        initialized: this.offline_metadata?.initialized,
        knowledge_base_size: this.offline_metadata?.metadata?.knowledge_base ? 
          Object.keys(this.offline_metadata.metadata.knowledge_base).length : 0,
        memory_usage_kb: Math.round(JSON.stringify(this.offline_metadata?.metadata).length / 1024)
      },
      capabilities: [
        'offline_response_generation',
        'intelligent_caching',
        'request_queueing',
        'automatic_sync',
        'fallback_responses',
        'network_detection'
      ]
    };
  }

  /**
   * Get network type
   */
  getNetworkType() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Get oldest cache entry timestamp
   */
  getOldestCacheEntry() {
    let oldest = null;
    for (const value of this.response_cache.values()) {
      if (!oldest || value.timestamp < oldest) {
        oldest = value.timestamp;
      }
    }
    return oldest;
  }

  /**
   * Get newest cache entry timestamp
   */
  getNewestCacheEntry() {
    let newest = null;
    for (const value of this.response_cache.values()) {
      if (!newest || value.timestamp > newest) {
        newest = value.timestamp;
      }
    }
    return newest;
  }

  /**
   * Export cache for backup
   */
  exportCache() {
    const cache_data = {};
    for (const [key, value] of this.response_cache.entries()) {
      cache_data[key] = value;
    }
    return {
      exported_at: new Date(),
      cache_entries: cache_data,
      total_size_kb: Math.round(JSON.stringify(cache_data).length / 1024)
    };
  }

  /**
   * Import cache from backup
   */
  importCache(cache_data) {
    for (const [key, value] of Object.entries(cache_data.cache_entries || {})) {
      this.response_cache.set(key, value);
    }
    console.log(`✅ Imported ${Object.keys(cache_data.cache_entries || {}).length} cache entries`);
  }

  /**
   * Get comprehensive analytics
   */
  getAnalytics() {
    let online_requests = 0;
    let offline_responses = 0;
    let cached_responses = 0;

    for (const value of this.response_cache.values()) {
      if (value.source === 'server') online_requests++;
      if (value.source === 'offline_metadata') offline_responses++;
      if (value.cached) cached_responses++;
    }

    return {
      total_cached_responses: this.response_cache.size,
      online_requests_cached: online_requests,
      offline_responses_cached: offline_responses,
      cached_hit_responses: cached_responses,
      sync_queue_size: this.sync_queue.length,
      average_confidence: this.calculateAverageConfidence(),
      cache_hit_rate: this.calculateCacheHitRate()
    };
  }

  /**
   * Calculate average confidence of cached responses
   */
  calculateAverageConfidence() {
    if (this.response_cache.size === 0) return 0;
    
    let total = 0;
    for (const value of this.response_cache.values()) {
      total += value.confidence || 0.8;
    }
    
    return (total / this.response_cache.size).toFixed(2);
  }

  /**
   * Calculate cache hit rate (would need tracking)
   */
  calculateCacheHitRate() {
    // This would need actual hit/miss tracking
    // Placeholder implementation
    return '70%';
  }
}

export default OfflineResponseManager;
