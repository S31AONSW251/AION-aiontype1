// perf.js
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  start(name) {
    this.metrics.set(name, {
      start: performance.now(),
      end: null,
      duration: null
    });
  }
  
  end(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.end = performance.now();
      metric.duration = metric.end - metric.start;
    }
  }
  
  getMetrics() {
    return Array.from(this.metrics.entries());
  }
}