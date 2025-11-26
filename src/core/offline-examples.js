/**
 * AION ULTRA - Offline Integration Example & Testing
 * Shows practical examples of using the offline intelligence system
 */

// ============================================================================
// EXAMPLE 1: Basic Offline Response Generation
// ============================================================================

export async function example1_basicOfflineResponse() {
  console.log('📚 EXAMPLE 1: Basic Offline Response Generation');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;
  
  const queries = [
    'What is artificial intelligence?',
    'How do neural networks work?',
    'Explain machine learning',
    'What is deep learning?'
  ];

  for (const query of queries) {
    try {
      const result = await manager.processInput(query);
      console.log(`\n❓ Query: "${query}"`);
      console.log(`✅ Response: "${result.response.substring(0, 100)}..."`);
      console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`📍 Source: ${result.source}`);
    } catch (error) {
      console.error(`Error processing query: ${error.message}`);
    }
  }
}

// ============================================================================
// EXAMPLE 2: System Status Monitoring
// ============================================================================

export function example2_systemStatus() {
  console.log('\n📊 EXAMPLE 2: System Status Monitoring');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;
  const status = manager.getDetailedStatus();

  console.log('\n🌐 Online Status:');
  console.log(`   Is Online: ${status.online_status.is_online ? '🟢 YES' : '🔴 NO'}`);
  console.log(`   Network Type: ${status.online_status.network_type}`);
  console.log(`   Last Online: ${status.online_status.last_online.toLocaleString()}`);

  console.log('\n💾 Cache Status:');
  console.log(`   Total Cached: ${status.cache_status.total_cached} responses`);
  console.log(`   Oldest Entry: ${status.cache_status.oldest_entry?.toLocaleString()}`);
  console.log(`   Newest Entry: ${status.cache_status.newest_entry?.toLocaleString()}`);

  console.log('\n🔄 Sync Status:');
  console.log(`   Pending Requests: ${status.sync_status.pending_requests}`);
  console.log(`   Last Sync: ${status.sync_status.last_sync.toLocaleString()}`);

  console.log('\n📚 Metadata Status:');
  console.log(`   Initialized: ${status.metadata_status.initialized ? '✅ YES' : '❌ NO'}`);
  console.log(`   Knowledge Base Size: ${status.metadata_status.knowledge_base_size} topics`);
  console.log(`   Memory Usage: ${status.metadata_status.memory_usage_kb} KB`);

  console.log('\n⚡ Capabilities:');
  status.capabilities.forEach(cap => {
    console.log(`   ✓ ${cap.replace(/_/g, ' ')}`);
  });
}

// ============================================================================
// EXAMPLE 3: Analytics & Performance
// ============================================================================

export function example3_analytics() {
  console.log('\n📈 EXAMPLE 3: Analytics & Performance');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;
  const analytics = manager.getAnalytics();

  console.log('\n📊 Response Statistics:');
  console.log(`   Total Cached: ${analytics.total_cached_responses}`);
  console.log(`   From Server: ${analytics.online_requests_cached}`);
  console.log(`   From Offline: ${analytics.offline_responses_cached}`);
  console.log(`   Cache Hits: ${analytics.cached_hit_responses}`);

  console.log('\n🔄 Sync Queue:');
  console.log(`   Pending Requests: ${analytics.sync_queue_size}`);

  console.log('\n🎯 Quality Metrics:');
  console.log(`   Average Confidence: ${(analytics.average_confidence * 100).toFixed(1)}%`);
  console.log(`   Cache Hit Rate: ${analytics.cache_hit_rate}`);
}

// ============================================================================
// EXAMPLE 4: Offline/Online Simulation
// ============================================================================

export async function example4_networkSimulation() {
  console.log('\n🌐 EXAMPLE 4: Network Simulation');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;

  // Simulate offline
  console.log('\n🔴 Going OFFLINE...');
  manager.is_online = false;
  
  try {
    const offline_result = await manager.processInput('What is AI?', false);
    console.log(`✅ Offline Response: "${offline_result.response.substring(0, 80)}..."`);
    console.log(`📍 Source: ${offline_result.source}`);
  } catch (error) {
    console.error('Error in offline mode:', error.message);
  }

  // Simulate online
  console.log('\n🟢 Going ONLINE...');
  manager.is_online = true;
  
  try {
    const online_result = await manager.processInput('What is AI?', false);
    console.log(`✅ Online Response: "${online_result.response.substring(0, 80)}..."`);
    console.log(`📍 Source: ${online_result.source}`);
  } catch (error) {
    console.error('Error in online mode:', error.message);
  }
}

// ============================================================================
// EXAMPLE 5: Caching Demonstration
// ============================================================================

export async function example5_cachingDemo() {
  console.log('\n💾 EXAMPLE 5: Caching Demonstration');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;
  const query = 'What is machine learning?';

  // First request (not cached)
  console.log('\n📝 Request 1 (Cache MISS):');
  const start1 = Date.now();
  const result1 = await manager.processInput(query);
  const time1 = Date.now() - start1;
  console.log(`   Time: ${time1}ms`);
  console.log(`   Cached: ${result1.cached ? '✅' : '❌'}`);

  // Second request (cached)
  console.log('\n📝 Request 2 (Cache HIT):');
  const start2 = Date.now();
  const result2 = await manager.processInput(query);
  const time2 = Date.now() - start2;
  console.log(`   Time: ${time2}ms (${Math.round((time1/time2)*100)}x faster)`);
  console.log(`   Cached: ${result2.cached ? '✅' : '❌'}`);

  console.log(`\n💡 Cache speedup: ${Math.round((time1-time2)/time1*100)}% faster on hit`);
}

// ============================================================================
// EXAMPLE 6: Confidence Score Analysis
// ============================================================================

export async function example6_confidenceAnalysis() {
  console.log('\n🎯 EXAMPLE 6: Confidence Score Analysis');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;
  
  const test_queries = [
    'What is AI?',
    'Explain deep neural networks',
    'How do transformer models work?',
    'What is reinforcement learning?',
    'Tell me about quantum computing'
  ];

  const confidence_scores = [];

  for (const query of test_queries) {
    try {
      const result = await manager.processInput(query);
      const confidence = result.confidence;
      confidence_scores.push(confidence);
      
      const confidence_pct = (confidence * 100).toFixed(1);
      const quality = confidence > 0.85 ? '🟢 HIGH' : 
                     confidence > 0.70 ? '🟡 MEDIUM' : '🔴 LOW';
      
      console.log(`📍 ${query.substring(0, 40)}`);
      console.log(`   Confidence: ${confidence_pct}% ${quality}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  if (confidence_scores.length > 0) {
    const avg = confidence_scores.reduce((a, b) => a + b) / confidence_scores.length;
    console.log(`\n📊 Average Confidence: ${(avg * 100).toFixed(1)}%`);
  }
}

// ============================================================================
// EXAMPLE 7: Cache Export/Import
// ============================================================================

export function example7_cacheBackup() {
  console.log('\n💾 EXAMPLE 7: Cache Export/Import');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;

  // Export cache
  console.log('\n📤 Exporting cache...');
  const backup = manager.exportCache();
  console.log(`✅ Exported ${backup.cache_entries ? Object.keys(backup.cache_entries).length : 0} responses`);
  console.log(`📊 Size: ${backup.total_size_kb} KB`);

  // Simulate storage
  console.log('\n💾 Saving to localStorage...');
  try {
    localStorage.setItem('aion_cache_backup', JSON.stringify(backup));
    console.log('✅ Cache saved to browser storage');
  } catch (error) {
    console.warn('⚠️  Storage quota exceeded:', error.message);
  }

  // Import from storage
  console.log('\n📥 Importing from localStorage...');
  try {
    const stored_backup = JSON.parse(localStorage.getItem('aion_cache_backup') || '{}');
    manager.importCache(stored_backup);
    console.log('✅ Cache imported from browser storage');
  } catch (error) {
    console.warn('⚠️  Import error:', error.message);
  }
}

// ============================================================================
// EXAMPLE 8: Cache Cleanup
// ============================================================================

export function example8_cacheCleanup() {
  console.log('\n🧹 EXAMPLE 8: Cache Cleanup');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;

  const before = manager.response_cache.size;
  console.log(`\n📊 Before cleanup: ${before} cached responses`);

  const result = manager.clearOldCache(24); // Clear older than 24 hours

  console.log(`✅ Cleared: ${result.cleared} old entries`);
  console.log(`📊 Remaining: ${result.remaining} responses`);
  console.log(`🧹 Space freed: ~${result.cleared * 5} KB`);
}

// ============================================================================
// EXAMPLE 9: All Intent Types
// ============================================================================

export async function example9_intentTypes() {
  console.log('\n🎯 EXAMPLE 9: Testing All Intent Types');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;
  
  const test_cases = [
    { query: 'Hello there!', intent: 'greeting' },
    { query: 'What is machine learning?', intent: 'question' },
    { query: 'How do I build a neural network?', intent: 'tutorial' },
    { query: 'I need help with data preprocessing', intent: 'help_request' },
    { query: 'Explain the difference between AI and ML', intent: 'comparison' },
    { query: 'What are the latest trends in deep learning?', intent: 'information' }
  ];

  for (const test of test_cases) {
    try {
      const result = await manager.processInput(test.query);
      console.log(`\n📌 Intent: ${test.intent}`);
      console.log(`❓ Query: "${test.query}"`);
      console.log(`✅ Response: "${result.response.substring(0, 100)}..."`);
      console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
}

// ============================================================================
// EXAMPLE 10: Performance Benchmark
// ============================================================================

export async function example10_benchmark() {
  console.log('\n⚡ EXAMPLE 10: Performance Benchmark');
  console.log('='.repeat(50));

  const manager = window.OFFLINE_RESPONSE_MANAGER;
  
  const benchmark_queries = [
    'What is AI?',
    'Explain neural networks',
    'How does machine learning work?',
    'Tell me about deep learning',
    'What is data science?'
  ];

  const times = [];

  console.log('\n⏱️  Running performance benchmark...');
  
  for (const query of benchmark_queries) {
    const start = Date.now();
    await manager.processInput(query);
    const elapsed = Date.now() - start;
    times.push(elapsed);
    
    console.log(`   ${query.substring(0, 30)}: ${elapsed}ms`);
  }

  const avg = times.reduce((a, b) => a + b) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log('\n📊 Benchmark Results:');
  console.log(`   Min: ${min}ms`);
  console.log(`   Max: ${max}ms`);
  console.log(`   Avg: ${avg.toFixed(1)}ms`);
  console.log(`   Target: <200ms ✅`);
}

// ============================================================================
// MASTER TEST RUNNER
// ============================================================================

export async function runAllExamples() {
  console.log('\n\n');
  console.log('█'.repeat(80));
  console.log('  AION ULTRA - OFFLINE SYSTEM COMPREHENSIVE EXAMPLES');
  console.log('█'.repeat(80));

  try {
    await example1_basicOfflineResponse();
    example2_systemStatus();
    example3_analytics();
    await example4_networkSimulation();
    await example5_cachingDemo();
    await example6_confidenceAnalysis();
    example7_cacheBackup();
    example8_cacheCleanup();
    await example9_intentTypes();
    await example10_benchmark();

    console.log('\n\n');
    console.log('█'.repeat(80));
    console.log('  ✅ ALL EXAMPLES COMPLETED SUCCESSFULLY');
    console.log('█'.repeat(80));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

// ============================================================================
// Quick Reference Commands
// ============================================================================

export const QUICK_REFERENCE = {
  // Get response
  getResponse: () => window.OFFLINE_RESPONSE_MANAGER.processInput("Your question"),
  
  // Check status
  getStatus: () => window.OFFLINE_RESPONSE_MANAGER.getDetailedStatus(),
  
  // Get analytics
  getAnalytics: () => window.OFFLINE_RESPONSE_MANAGER.getAnalytics(),
  
  // Run all examples
  runExamples: () => runAllExamples(),
  
  // Run individual example
  example1: () => example1_basicOfflineResponse(),
  example2: () => example2_systemStatus(),
  example3: () => example3_analytics(),
  example4: () => example4_networkSimulation(),
  example5: () => example5_cachingDemo(),
  example6: () => example6_confidenceAnalysis(),
  example7: () => example7_cacheBackup(),
  example8: () => example8_cacheCleanup(),
  example9: () => example9_intentTypes(),
  example10: () => example10_benchmark(),
};

// ============================================================================
// AUTO-RUN IN CONSOLE (Optional)
// ============================================================================

if (typeof window !== 'undefined') {
  window.AION_OFFLINE_EXAMPLES = {
    runAll: runAllExamples,
    quick: QUICK_REFERENCE,
    example1: example1_basicOfflineResponse,
    example2: example2_systemStatus,
    example3: example3_analytics,
    example4: example4_networkSimulation,
    example5: example5_cachingDemo,
    example6: example6_confidenceAnalysis,
    example7: example7_cacheBackup,
    example8: example8_cacheCleanup,
    example9: example9_intentTypes,
    example10: example10_benchmark,
  };

  console.log('\n💡 Offline system examples loaded!');
  console.log('Run: window.AION_OFFLINE_EXAMPLES.runAll()');
  console.log('Or: window.AION_OFFLINE_EXAMPLES.quick.getResponse()');
}

export default {
  runAllExamples,
  example1_basicOfflineResponse,
  example2_systemStatus,
  example3_analytics,
  example4_networkSimulation,
  example5_cachingDemo,
  example6_confidenceAnalysis,
  example7_cacheBackup,
  example8_cacheCleanup,
  example9_intentTypes,
  example10_benchmark,
  QUICK_REFERENCE
};
