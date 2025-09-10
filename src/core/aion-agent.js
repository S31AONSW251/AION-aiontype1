// aion-agent.js - Enhanced agent with better task management and error handling
import { logger } from './logger.js';
import { PerformanceMonitor } from './perf.js';
import { AION_CONFIG } from './config.js';

class AionAgent {
  constructor(showNotification, speak) {
    this.tasks = new Map();
    this.showNotification = showNotification;
    this.speak = speak;
    this.perfMonitor = new PerformanceMonitor();
    this.taskTypes = ['research', 'monitoring', 'reminder', 'analysis', 'automation'];
  }

  /**
   * Validates a task object.
   * @param {object} task - The task to validate.
   * @returns {Array} Validation errors, empty if valid.
   */
  validateTask(task) {
    const errors = [];
    
    if (!task.id) errors.push('Task must have an id');
    if (!task.description) errors.push('Task must have a description');
    if (!task.type || !this.taskTypes.includes(task.type)) {
      errors.push(`Task type must be one of: ${this.taskTypes.join(', ')}`);
    }
    if (!task.condition || typeof task.condition !== 'function') {
      errors.push('Task must have a condition function');
    }
    if (!task.interval || typeof task.interval !== 'number' || task.interval <= 0) {
      errors.push('Task must have a positive numeric interval');
    }
    if (task.priority && (task.priority < 1 || task.priority > 10)) {
      errors.push('Task priority must be between 1 and 10');
    }
    
    return errors;
  }

  /**
   * Creates a detailed plan for a complex research query.
   * @param {string} query - The user's research request.
   * @returns {Promise<Array<object>>} A step-by-step plan.
   */
  async createPlan(query) {
    this.perfMonitor.start('createPlan');
    
    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Invalid query provided to createPlan');
      }

      this.showNotification(`Creating a research plan for "${query}"...`, 'info');
      
      // Simulate planning delay
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
      
      const plan = [
        { 
          action: 'search', 
          query: `${query} fundamentals overview`,
          status: 'pending',
          priority: 1,
          estimatedDuration: '2 minutes'
        },
        { 
          action: 'search', 
          query: `recent developments ${query} 2024`,
          status: 'pending',
          priority: 2,
          estimatedDuration: '3 minutes'
        },
        { 
          action: 'analyze', 
          query: `compare different perspectives on ${query}`,
          status: 'pending',
          priority: 3,
          estimatedDuration: '5 minutes'
        },
        { 
          action: 'synthesize', 
          query: 'compile comprehensive report with key insights',
          status: 'pending',
          priority: 4,
          estimatedDuration: '8 minutes'
        }
      ];

      logger.info('Research plan created', { query, planLength: plan.length });
      return plan;
    } catch (error) {
      logger.error('Error creating research plan', { query, error: error.message });
      throw error;
    } finally {
      this.perfMonitor.end('createPlan');
    }
  }

  /**
   * Adds a proactive, background task for AION to monitor.
   * @param {object} task - Task details.
   */
  addProactiveTask(task) {
    this.perfMonitor.start('addProactiveTask');
    
    try {
      // Validate task
      const errors = this.validateTask(task);
      if (errors.length > 0) {
        throw new Error(`Invalid task: ${errors.join(', ')}`);
      }

      // Check for duplicate task ID
      if (this.tasks.has(task.id)) {
        throw new Error(`Task with id "${task.id}" already exists`);
      }

      // Set default values
      const enhancedTask = {
        priority: 5,
        maxAttempts: 3,
        attempts: 0,
        createdAt: new Date(),
        lastRun: null,
        enabled: true,
        ...task
      };

      // Create interval
      const intervalId = setInterval(async () => {
        if (!enhancedTask.enabled) return;
        
        try {
          enhancedTask.attempts++;
          enhancedTask.lastRun = new Date();
          
          const conditionMet = await enhancedTask.condition();
          if (conditionMet) {
            const message = `Proactive alert: ${enhancedTask.description}`;
            this.showNotification(message, 'success');
            this.speak(message);
            
            // Execute action if provided
            if (enhancedTask.action) {
              await enhancedTask.action();
            }
            
            // Remove task if it's one-time
            if (enhancedTask.type === 'reminder') {
              this.clearProactiveTask(enhancedTask.id);
            }
            
            logger.info('Proactive task triggered', { taskId: enhancedTask.id });
          }
          
          // Check max attempts
          if (enhancedTask.attempts >= enhancedTask.maxAttempts) {
            this.clearProactiveTask(enhancedTask.id);
            logger.warn('Proactive task reached max attempts', { taskId: enhancedTask.id });
          }
        } catch (error) {
          logger.error('Error in proactive task execution', { 
            taskId: enhancedTask.id, 
            error: error.message 
          });
        }
      }, enhancedTask.interval);

      enhancedTask.intervalId = intervalId;
      this.tasks.set(enhancedTask.id, enhancedTask);
      
      this.showNotification(`New proactive task: "${enhancedTask.description}"`, 'info');
      logger.info('Proactive task added', { 
        taskId: enhancedTask.id, 
        type: enhancedTask.type,
        interval: enhancedTask.interval 
      });
      
      return enhancedTask;
    } catch (error) {
      logger.error('Error adding proactive task', { error: error.message });
      throw error;
    } finally {
      this.perfMonitor.end('addProactiveTask');
    }
  }

  /**
   * Removes a proactive task.
   * @param {string} taskId - The task ID to remove.
   */
  clearProactiveTask(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      clearInterval(task.intervalId);
      this.tasks.delete(taskId);
      logger.info('Proactive task removed', { taskId });
    }
  }

  /**
   * Pauses a proactive task.
   * @param {string} taskId - The task ID to pause.
   */
  pauseProactiveTask(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = false;
      logger.info('Proactive task paused', { taskId });
    }
  }

  /**
   * Resumes a paused proactive task.
   * @param {string} taskId - The task ID to resume.
   */
  resumeProactiveTask(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = true;
      logger.info('Proactive task resumed', { taskId });
    }
  }

  /**
   * Gets all active tasks.
   * @returns {Array} List of active tasks.
   */
  getActiveTasks() {
    return Array.from(this.tasks.values()).map(task => ({
      id: task.id,
      description: task.description,
      type: task.type,
      priority: task.priority,
      interval: task.interval,
      enabled: task.enabled,
      attempts: task.attempts,
      createdAt: task.createdAt,
      lastRun: task.lastRun
    }));
  }

  /**
   * Clears all proactive tasks.
   */
  clearAllTasks() {
    for (const [taskId, task] of this.tasks) {
      clearInterval(task.intervalId);
    }
    this.tasks.clear();
    logger.info('All proactive tasks cleared');
  }

  /**
   * Gets task statistics.
   * @returns {object} Task statistics.
   */
  getTaskStats() {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      byType: tasks.reduce((acc, task) => {
        acc[task.type] = (acc[task.type] || 0) + 1;
        return acc;
      }, {}),
      enabled: tasks.filter(t => t.enabled).length,
      disabled: tasks.filter(t => !t.enabled).length
    };
  }

  /**
   * Gets performance statistics.
   * @returns {Array} Performance metrics.
   */
  getPerformanceStats() {
    return this.perfMonitor.getMetrics();
  }

  /**
   * Example factory method for common task types.
   */
  createReminderTask(id, description, triggerTime, message) {
    return {
      id,
      description,
      type: 'reminder',
      interval: 60000, // Check every minute
      priority: 7,
      condition: () => {
        const now = new Date();
        const trigger = new Date(triggerTime);
        return now >= trigger;
      },
      action: () => {
        this.showNotification(message, 'info');
        this.speak(message);
      }
    };
  }
}

// Initialize with proper functions (to be set by the consuming application)
export const aionAgent = new AionAgent(
  (message, type) => console.log(`[${type}] ${message}`),
  (message) => console.log(`SPEAK: ${message}`)
);