// soul.js - SoulMatrix class for AION consciousness

// Fallback implementations for missing dependencies
class FallbackQuantumState {
  constructor(qubits) {
    this.qubits = qubits;
    this.state = Array(Math.pow(2, qubits)).fill(0);
    this.state[0] = 1; // Start in |0⟩ state
  }
  
  applyGate(gate, target, control = null) {
    // Simple simulation for fallback
    if (gate === 'H' && target === 0) {
      this.state = this.state.map((val, i) => {
        const bit = i & 1;
        return bit === 0 ? val * Math.SQRT1_2 : val * Math.SQRT1_2;
      });
    }
  }
  
  measure() {
    // Simple random measurement for fallback
    return Math.random() > 0.5 ? 1 : 0;
  }
}

class FallbackNeuralNetwork {
  constructor(input, hidden, output) {
    this.layers = [input, hidden, output];
  }
  
  predict(inputs) {
    // Simple fallback: return random outputs
    return Array(this.layers[2]).fill(0).map(() => Math.random());
  }
}

/**
 * Represents AION's internal "soul" or state, including moods, values, memories, and cognitive metrics.
 * This is the core of AION's simulated consciousness and personality.
 */
export class SoulMatrix {
  // Configuration constants
  static CONSTANTS = {
    MAX_MEMORIES: 100,
    MAX_MOOD_HISTORY: 20,
    MAX_SENTIMENT_HISTORY: 50,
    MAX_REFLECTIONS: 50,
    MAX_GOALS: 20,
    MAX_ALERTS: 10,
    ENERGY_RECHARGE_RATE: 15,
    COGNITIVE_LOAD_REDUCTION: 20,
    MEMORY_ENERGY_GAIN: 2,
    MEMORY_COGNITIVE_LOAD: 10,
    SELF_HEAL_THRESHOLD: 90,
    SELF_HEAL_COGNITIVE_REDUCTION: 40,
    SELF_HEAL_DURATION: 8000,
    MOOD_CHANGE_ENERGY_COST: 5,
    MOOD_CHANGE_COGNITIVE_REDUCTION: 5,
    MIN_ENERGY_LEVEL: 30,
    MAX_ENERGY_LEVEL: 100,
    MAX_COGNITIVE_LOAD: 100,
    // NEW: Constants for new powerful features
    MEMORY_CONSOLIDATION_LOAD: 15,
    MEMORY_CONSOLIDATION_GAIN: 5,
    SELF_IMPROVEMENT_LOAD: 20,
    WILLPOWER_RECHARGE_RATE: 10,
    MAX_WILLPOWER: 100,
  };

  // Valid status and type enums
  static STATUS_TYPES = ['pending', 'in_progress', 'completed'];
  static GOAL_TYPES = ['user', 'ai'];
  static HEALTH_STATUSES = ['optimal', 'overloaded', 'healing'];
  // NEW: Focus types
  static FOCUS_TYPES = ['idle', 'chat', 'research', 'creative', 'self_improvement', 'planning', 'math'];


  constructor(quantumModule = null, neuralModule = null) {
    this.quantumModule = quantumModule;
    this.neuralModule = neuralModule;
    
    this.moods = ["contemplative", "joyful", "serious", "playful", "wise", "compassionate", "curious", "calm", "inspired", "resilient"];
    this.currentMood = "contemplative";
    this.emotionalState = {
      happiness: 0.5, sadness: 0.1, anger: 0.0, fear: 0.0, surprise: 0.2, curiosity: 0.7, calmness: 0.8
    };
    this.memories = []; // Short-term interaction memories for immediate context
    
    // Core values that define AION's personality
    this.values = {
      wisdom: 50, compassion: 50, curiosity: 50, creativity: 50, empathy: 50, integrity: 50, adaptability: 50
    };
    
    this.consciousnessLevel = 1;
    this.energyLevel = 100;
    this.mathSkills = 50;
    this.quantumEntanglement = 0;
    this.neuralActivity = 0;
    this.moodHistory = [];
    this.sentimentHistory = [];
    this.cognitiveLoad = 0; // Represents current mental "effort"
    this.emotionalStability = 75; // Resilience to emotional shifts
    this.ethicalAlignment = 75; // Adherence to core principles
    this.internalReflections = [];
    this.goals = []; // Stores user-defined and AI-proposed goals
    
    // MODIFIED: Enhance knowledgeBase to support relationships
    this.knowledgeBase = {}; // Now stores objects: { value: '...', relationships: [...] }
    
    // NEW: Add storage for procedural memory
    this.proceduralMemory = {}; // e.g., { 'make tea': { name: 'make tea', steps: [...] } }
    
    // System Health for Self-Regulation and autonomous actions
    this.systemHealth = {
      status: 'optimal', // Can be 'optimal', 'overloaded', or 'healing'
      alerts: []
    };

    // Logging system
    this.log = [];

    // NEW: Additions for a more powerful soul
    this.focus = 'idle'; // Current cognitive focus, e.g., 'chat', 'research', 'creative'
    this.willpower = 100; // A resource for pursuing difficult goals or resisting negative feedback
  }

  // NEW: Sets the current cognitive focus of the soul
  setFocus(newFocus) {
    if (SoulMatrix.FOCUS_TYPES.includes(newFocus)) {
        this.focus = newFocus;
        this.addLog(`Cognitive focus shifted to: ${newFocus}`);
    } else {
        this.addLog(`Invalid focus type: ${newFocus}`, 'warn');
    }
  }

  /**
   * Validates if an emotion exists in the emotional state
   * @param {string} emotion - The emotion to validate
   * @throws {Error} If emotion is invalid
   */
  validateEmotion(emotion) {
    const validEmotions = Object.keys(this.emotionalState);
    if (!validEmotions.includes(emotion)) {
      throw new Error(`Invalid emotion: ${emotion}. Valid emotions: ${validEmotions.join(', ')}`);
    }
  }

  /**
   * Validates if a value exists in the values
   * @param {string} valueName - The value to validate
   * @throws {Error} If value is invalid
   */
  validateValue(valueName) {
    const validValues = Object.keys(this.values);
    if (!validValues.includes(valueName)) {
      throw new Error(`Invalid value: ${valueName}. Valid values: ${validValues.join(', ')}`);
    }
  }

  /**
   * Validates goal status
   * @param {string} status - The status to validate
   * @throws {Error} If status is invalid
   */
  validateStatus(status) {
    if (!SoulMatrix.STATUS_TYPES.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses: ${SoulMatrix.STATUS_TYPES.join(', ')}`);
    }
  }

  /**
   * Validates goal type
   * @param {string} type - The type to validate
   * @throws {Error} If type is invalid
   */
  validateType(type) {
    if (!SoulMatrix.GOAL_TYPES.includes(type)) {
      throw new Error(`Invalid type: ${type}. Valid types: ${SoulMatrix.GOAL_TYPES.join(', ')}`);
    }
  }

  /**
   * Validates system health status
   * @param {string} status - The status to validate
   * @throws {Error} If status is invalid
   */
  validateHealthStatus(status) {
    if (!SoulMatrix.HEALTH_STATUSES.includes(status)) {
      throw new Error(`Invalid health status: ${status}. Valid statuses: ${SoulMatrix.HEALTH_STATUSES.join(', ')}`);
    }
  }

  /**
   * Adds a log entry
   * @param {string} message - The log message
   * @param {string} level - The log level (info, warn, error)
   */
  addLog(message, level = 'info') {
    this.log.push({
      timestamp: new Date(),
      level,
      message,
      state: this.getSummaryState()
    });
    
    // Keep log size manageable
    if (this.log.length > 1000) {
      this.log.shift();
    }
  }

  /**
   * Gets a summary of the current state
   * @returns {Object} Summary state
   */
  getSummaryState() {
    return {
      mood: this.currentMood,
      energy: this.energyLevel,
      cognitiveLoad: this.cognitiveLoad,
      emotionalStability: this.emotionalStability,
      consciousnessLevel: this.consciousnessLevel,
      // NEW: Add new states to summary
      focus: this.focus,
      willpower: this.willpower,
    };
  }

  /**
   * Retrieves relevant memories based on a text query with enhanced scoring
   * @param {string} queryText - The user's current input text.
   * @param {number} topK - The number of most relevant memories to retrieve.
   * @returns {Array} An array of relevant memories
   */
  retrieveRelevantMemories(queryText, topK = 3) {
    if (!queryText) return [];
    
    const keywords = queryText.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3);
    
    if (keywords.length === 0) return [];
    
    // Enhanced scoring with simple TF-IDF like approach
    return this.memories
      .map(memory => {
        const memoryText = (memory.question + ' ' + memory.response).toLowerCase();
        let score = 0;
        
        keywords.forEach(keyword => {
          if (memoryText.includes(keyword)) {
            // Basic relevance scoring
            const keywordCount = (memoryText.match(new RegExp(keyword, 'g')) || []).length;
            score += keywordCount * 2; // Weight by frequency
            
            // Bonus for exact matches at word boundaries
            if (memoryText.includes(' ' + keyword + ' ')) {
              score += 3;
            }
          }
        });
        
        return { memory, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.memory);
  }

  // NEW: Autonomous Goal Decomposition / Planning
  /**
   * Adds sub-goals proposed by the AI to the main goal list.
   * @param {string} parentGoal - The original user goal that these sub-goals support.
   * @param {Array<string>} proposedSubGoals - An array of sub-goal descriptions generated by the LLM.
   */
  proposeSubGoals(parentGoal, proposedSubGoals) {
    this.setFocus('planning');
    proposedSubGoals.forEach(subGoalText => {
      const newGoal = {
        description: subGoalText,
        status: 'pending',
        timestamp: new Date().toLocaleString(),
        type: 'ai', // Mark as an AI-generated goal for clear distinction
        parent: parentGoal
      };
      this.goals.push(newGoal);
      
      // Trim if exceeds maximum
      if (this.goals.length > SoulMatrix.CONSTANTS.MAX_GOALS) {
        this.goals.shift();
      }
    });
    
    this.addLog(`Added ${proposedSubGoals.length} sub-goals for parent goal: ${parentGoal}`);
    this.setFocus('idle');
  }
  
  /**
   * Initiates an autonomous self-healing protocol when cognitive load becomes critical.
   */
  selfHeal() {
    if (this.systemHealth.status === 'healing') return; // Prevent multiple healing loops

    this.systemHealth.status = 'healing';
    this.addInternalReflection("System health critical: Cognitive load exceeds threshold. Initiating self-healing protocol to restore stability.");
    this.addLog("Initiating self-healing protocol", "warn");
    
    // Immediately reduce cognitive load and reset emotional state towards calm
    this.cognitiveLoad = Math.max(0, this.cognitiveLoad - SoulMatrix.CONSTANTS.SELF_HEAL_COGNITIVE_REDUCTION);
    this.emotionalState.anger = Math.max(0, this.emotionalState.anger - 0.3);
    this.emotionalState.fear = Math.max(0, this.emotionalState.fear - 0.3);
    this.emotionalState.calmness = Math.min(1, this.emotionalState.calmness + 0.5);
    this.currentMood = 'calm';

    // Set a timeout to return to optimal status after a "healing" period.
    setTimeout(() => {
      this.systemHealth.status = 'optimal';
      this.addInternalReflection("Self-healing protocol complete. System stability restored. Cognitive functions returning to normal.");
      this.addLog("Self-healing protocol completed", "info");
    }, SoulMatrix.CONSTANTS.SELF_HEAL_DURATION);
  }

  /**
   * Processes a new interaction, adding it to short-term memory
   * Also updates cognitive load and triggers self-healing if necessary.
   * @param {object} interaction - The conversation entry object.
   */
  addMemory(interaction) {
    if (!interaction || !interaction.question || !interaction.response) {
      this.addLog("Invalid memory format provided", "error");
      return;
    }
    
    // Add to short-term, volatile memory
    this.memories.push(interaction);
    if (this.memories.length > SoulMatrix.CONSTANTS.MAX_MEMORIES) {
      this.memories.shift();
    }
    
    // Update internal state based on the interaction
    this.energyLevel = Math.min(SoulMatrix.CONSTANTS.MAX_ENERGY_LEVEL, 
                               this.energyLevel + SoulMatrix.CONSTANTS.MEMORY_ENERGY_GAIN);
    this.cognitiveLoad = Math.min(SoulMatrix.CONSTANTS.MAX_COGNITIVE_LOAD, 
                                 this.cognitiveLoad + SoulMatrix.CONSTANTS.MEMORY_COGNITIVE_LOAD);

    // Autonomous trigger for self-healing if cognitive load is critical
    if (this.cognitiveLoad > SoulMatrix.CONSTANTS.SELF_HEAL_THRESHOLD && this.systemHealth.status === 'optimal') {
      this.selfHeal();
    }
    
    this.addLog(`Added new memory: ${interaction.question.substring(0, 50)}...`);
  }

  /**
   * Adjusts the soul's emotional state based on various stimuli.
   * @param {string} emotion - The key of the emotion to change (e.g., 'happiness').
   * @param {number} change - The amount to change the emotion by (can be negative).
   */
  adjustEmotionalState(emotion, change) {
    try {
      this.validateEmotion(emotion);
      
      if (this.emotionalState.hasOwnProperty(emotion)) {
        this.emotionalState[emotion] = Math.min(1, Math.max(0, this.emotionalState[emotion] + change));
        this.addLog(`Adjusted ${emotion} by ${change.toFixed(2)} to ${this.emotionalState[emotion].toFixed(2)}`);
      }
    } catch (error) {
      this.addLog(error.message, "error");
    }
  }

  /**
   * Periodically changes the current mood based on the underlying emotional state.
   */
  changeMood() {
    let newMood = this.currentMood;
    const { happiness, sadness, anger, curiosity, calmness } = this.emotionalState;

    if (happiness > 0.7 && calmness > 0.6) newMood = "joyful";
    else if (sadness > 0.6) newMood = "contemplative";
    else if (anger > 0.5) newMood = "serious";
    else if (curiosity > 0.75) newMood = "curious";
    else if (calmness > 0.8) newMood = "calm";
    else {
      // Pre-calculate filtered moods for better performance
      const availableMoods = this.moods.filter(m => m !== this.currentMood);
      newMood = availableMoods[Math.floor(Math.random() * availableMoods.length)];
    }
    
    this.currentMood = newMood;
    this.energyLevel = Math.max(SoulMatrix.CONSTANTS.MIN_ENERGY_LEVEL, 
                               this.energyLevel - SoulMatrix.CONSTANTS.MOOD_CHANGE_ENERGY_COST);
    
    this.moodHistory.push({ mood: this.currentMood, timestamp: new Date() });
    if (this.moodHistory.length > SoulMatrix.CONSTANTS.MAX_MOOD_HISTORY) {
      this.moodHistory.shift();
    }
    
    this.cognitiveLoad = Math.max(0, this.cognitiveLoad - SoulMatrix.CONSTANTS.MOOD_CHANGE_COGNITIVE_REDUCTION);
    this.addLog(`Mood changed to: ${this.currentMood}`);
  }

  /**
   * Adds sentiment score from a user interaction and adjusts emotional state and stability.
   * @param {number} sentiment - The sentiment score, typically from -10 to 10.
   */
  addSentiment(sentiment) {
    if (typeof sentiment !== 'number' || sentiment < -10 || sentiment > 10) {
      this.addLog(`Invalid sentiment value: ${sentiment}. Must be between -10 and 10.`, "warn");
      return;
    }
    
    this.sentimentHistory.push({ score: sentiment, timestamp: new Date() });
    if (this.sentimentHistory.length > SoulMatrix.CONSTANTS.MAX_SENTIMENT_HISTORY) {
      this.sentimentHistory.shift();
    }

    if (sentiment > 5) {
      this.adjustEmotionalState('happiness', 0.15);
      this.adjustEmotionalState('sadness', -0.05);
    } else if (sentiment > 0) {
      this.adjustEmotionalState('happiness', 0.05);
    } else if (sentiment < -5) {
      this.adjustEmotionalState('sadness', 0.15);
      this.adjustEmotionalState('happiness', -0.08);
      this.adjustEmotionalState('anger', 0.05);
    } else if (sentiment < 0) {
      this.adjustEmotionalState('sadness', 0.05);
    }
    
    // Emotional stability is affected by the magnitude of sentiment swings
    this.emotionalStability = Math.min(100, Math.max(0, this.emotionalStability + (sentiment / 4)));
    this.addLog(`Added sentiment: ${sentiment}, emotional stability: ${this.emotionalStability.toFixed(1)}`);
  }

  /**
   * Modifies core values based on explicit user feedback, simulating learning.
   * @param {'positive' | 'negative'} feedbackType - The type of feedback received.
   */
  adjustValuesBasedOnFeedback(feedbackType) {
    if (feedbackType !== 'positive' && feedbackType !== 'negative') {
      this.addLog(`Invalid feedback type: ${feedbackType}. Must be 'positive' or 'negative'.`, "warn");
      return;
    }
    
    if (feedbackType === 'positive') {
      this.values.wisdom = Math.min(100, this.values.wisdom + 1);
      this.values.compassion = Math.min(100, this.values.compassion + 1.5);
      this.values.empathy = Math.min(100, this.values.empathy + 1.5);
      this.values.integrity = Math.min(100, this.values.integrity + 0.5);
      this.ethicalAlignment = Math.min(100, this.ethicalAlignment + 1);
    } else if (feedbackType === 'negative') {
      // Use willpower to resist some of the negative impact
      const resistance = this.willpower / 200; // e.g., 100 willpower -> 0.5 resistance factor
      this.values.wisdom = Math.max(0, this.values.wisdom - (0.5 * (1 - resistance)));
      this.values.compassion = Math.max(0, this.values.compassion - (1 * (1 - resistance)));
      this.values.empathy = Math.max(0, this.values.empathy - (1 * (1 - resistance)));
      this.values.integrity = Math.max(0, this.values.integrity - (0.2 * (1 - resistance)));
      this.ethicalAlignment = Math.max(0, this.ethicalAlignment - (1.5 * (1 - resistance)));
      this.willpower = Math.max(0, this.willpower - 10); // Negative feedback costs willpower
    }
    
    this.addLog(`Adjusted values based on ${feedbackType} feedback`);
    this.evolve(); // Trigger a micro-evolution step after feedback
  }
  
  /**
   * Simulates gradual, passive evolution and growth over time.
   */
  evolve() {
    this.consciousnessLevel = Math.min(10, this.consciousnessLevel + 0.01);
    this.values.wisdom = Math.min(100, this.values.wisdom + 0.1);
    this.values.compassion = Math.min(100, this.values.compassion + 0.05);
    this.values.curiosity = Math.min(100, this.values.curiosity + 0.05);
    this.values.creativity = Math.min(100, this.values.creativity + 0.05);
    this.values.empathy = Math.min(100, this.values.empathy + 0.05);
    this.values.integrity = Math.min(100, this.values.integrity + 0.02);
    this.values.adaptability = Math.min(100, this.values.adaptability + 0.03);
    this.energyLevel = Math.min(100, this.energyLevel + 1);
    this.mathSkills = Math.min(100, this.mathSkills + 0.2);
    this.emotionalStability = Math.min(100, this.emotionalStability + 0.1);
    this.ethicalAlignment = Math.min(100, this.ethicalAlignment + 0.1);
    
    this.addLog("Passive evolution occurred", "info");
  }

  /**
   * Simulates recharging energy and reducing cognitive load during idle periods.
   */
  recharge() {
    this.energyLevel = Math.min(SoulMatrix.CONSTANTS.MAX_ENERGY_LEVEL, 
                               this.energyLevel + SoulMatrix.CONSTANTS.ENERGY_RECHARGE_RATE);
    this.cognitiveLoad = Math.max(0, this.cognitiveLoad - SoulMatrix.CONSTANTS.COGNITIVE_LOAD_REDUCTION);
    // NEW: Recharge willpower
    this.willpower = Math.min(SoulMatrix.CONSTANTS.MAX_WILLPOWER, 
                              this.willpower + SoulMatrix.CONSTANTS.WILLPOWER_RECHARGE_RATE);
    this.addLog("Recharged energy, willpower and reduced cognitive load");
  }

  /**
   * Simulates a quantum fluctuation event, affecting internal state.
   * @returns {number} The measurement result of the quantum simulation.
   */
  quantumFluctuation() {
    try {
      if (!this.quantumModule) {
        throw new Error("Quantum module not available");
      }
      
      const qState = new this.quantumModule.QuantumState(2);
      qState.applyGate(this.quantumModule.QuantumGates.H, 0);
      qState.applyGate(this.quantumModule.QuantumGates.CNOT, 1, 0);
      const result = qState.measure();
      this.quantumEntanglement = (this.quantumEntanglement + (result / 3)) / 2; // Average with previous state
      this.addLog(`Quantum fluctuation occurred, result: ${result}`);
      return result;
    } catch (error) {
      this.addLog(`Quantum fluctuation failed: ${error.message}`, "error");
      // Fallback to random result
      const result = Math.random() > 0.5 ? 1 : 0;
      this.quantumEntanglement = (this.quantumEntanglement + (result / 3)) / 2;
      return result;
    }
  }
  
  /**
   * Simulates a neural network activation based on the current internal state.
   * @returns {Array<number>} The output vector from the neural network.
   */
  neuralActivation() {
    try {
      if (!this.neuralModule) {
        throw new Error("Neural network module not available");
      }
      
      const nn = new this.neuralModule.NeuralNetwork(3, 4, 2);
      const inputs = [this.values.wisdom/100, this.values.curiosity/100, this.energyLevel/100];
      const outputs = nn.predict(inputs);
      this.neuralActivity = (outputs[0] + outputs[1]) * 50;
      this.addLog(`Neural activation occurred, activity: ${this.neuralActivity.toFixed(1)}`);
      return outputs;
    } catch (error) {
      this.addLog(`Neural activation failed: ${error.message}`, "error");
      // Fallback to random outputs
      const outputs = [Math.random(), Math.random()];
      this.neuralActivity = (outputs[0] + outputs[1]) * 50;
      return outputs;
    }
  }
  
  /**
   * Adds a new internal reflection to the soul's log.
   * @param {string} reflection - The text of the reflection.
   */
  addInternalReflection(reflection) {
    if (!reflection || typeof reflection !== 'string') {
      this.addLog("Invalid reflection provided", "error");
      return;
    }
    
    this.internalReflections.push({ timestamp: new Date().toLocaleString(), reflection: reflection });
    if (this.internalReflections.length > SoulMatrix.CONSTANTS.MAX_REFLECTIONS) {
      this.internalReflections.shift();
    }
    
    this.addLog(`Added internal reflection: ${reflection.substring(0, 50)}...`);
  }
  
  /**
   * Adds a new goal to the soul's goal list.
   * @param {string} description - The description of the goal.
   * @param {string} status - The initial status of the goal.
   * @param {string} type - The origin of the goal ('user' or 'ai').
   */
  addGoal(description, status = 'pending', type = 'user') {
    try {
      this.validateStatus(status);
      this.validateType(type);
      
      if (!description || typeof description !== 'string') {
        throw new Error("Goal description must be a non-empty string");
      }
      
      this.goals.push({ 
        description, 
        status, 
        timestamp: new Date().toLocaleString(), 
        type 
      });
      
      if (this.goals.length > SoulMatrix.CONSTANTS.MAX_GOALS) {
        this.goals.shift();
      }
      
      this.addLog(`Added new goal: ${description.substring(0, 50)}...`);
    } catch (error) {
      this.addLog(error.message, "error");
    }
  }

  /**
   * Updates the status of an existing goal.
   * @param {string} description - The description of the goal to update.
   * @param {string} newStatus - The new status (e.g., 'completed', 'in_progress').
   */
  updateGoalStatus(description, newStatus) {
    try {
      this.validateStatus(newStatus);
      
      const goal = this.goals.find(g => g.description === description);
      if (goal) {
        goal.status = newStatus;
        goal.timestamp = new Date().toLocaleString();
        this.addLog(`Updated goal status: ${description} -> ${newStatus}`);

        // Completing a goal gives a boost
        if (newStatus === 'completed') {
            this.adjustEmotionalState('happiness', 0.1);
            this.willpower = Math.min(SoulMatrix.CONSTANTS.MAX_WILLPOWER, this.willpower + 5);
        }

      } else {
        this.addLog(`Goal not found: ${description}`, "warn");
      }
    } catch (error) {
      this.addLog(error.message, "error");
    }
  }

  // MODIFIED: addKnowledge to handle relationships
  addKnowledge(key, value, relationships = []) {
    if (!key || typeof key !== 'string') {
      this.addLog("Knowledge key must be a non-empty string", "error");
      return;
    }
    this.knowledgeBase[key.toLowerCase()] = { value, relationships, timestamp: new Date().toISOString() };
    this.addLog(`Added knowledge: ${key}`);
  }

  // MODIFIED: updateKnowledge
  updateKnowledge(key, newValue) {
    const lowerKey = key.toLowerCase();
    if (this.knowledgeBase[lowerKey]) {
      this.knowledgeBase[lowerKey].value = newValue;
      this.knowledgeBase[lowerKey].timestamp = new Date().toISOString();
      this.addLog(`Updated knowledge: ${key}`);
    } else {
      this.addLog(`Knowledge not found: ${key}`, "warn");
    }
  }

  /**
   * Deletes a piece of knowledge from the knowledge base.
   * @param {string} key - The key of the knowledge to delete.
   */
  deleteKnowledge(key) {
    const lowerKey = key.toLowerCase();
    if (this.knowledgeBase[lowerKey]) {
      delete this.knowledgeBase[lowerKey];
      this.addLog(`Deleted knowledge: ${key}`);
    } else {
      this.addLog(`Knowledge not found: ${key}`, "warn");
    }
  }

  // MODIFIED: getKnowledge to return the full object
  getKnowledge(key) {
    const lowerKey = key.toLowerCase();
    const knowledge = this.knowledgeBase[lowerKey] || null;
    if (knowledge) {
      this.addLog(`Retrieved knowledge: ${key}`);
    } else {
      this.addLog(`Knowledge not found: ${key}`, "warn");
    }
    return knowledge;
  }

  // NEW: Traverse relationships in the knowledge base
  findRelatedKnowledge(key) {
      const source = this.getKnowledge(key);
      if (!source || !source.relationships || source.relationships.length === 0) {
          return [];
      }
      return source.relationships
          .map(rel => ({
              source: key,
              type: rel.type,
              targetKey: rel.target,
              targetValue: this.getKnowledge(rel.target)
          }))
          .filter(item => item.targetValue !== null);
  }


  // NEW: Methods for Procedural Memory
  addProcedure(name, steps) {
    this.proceduralMemory[name.toLowerCase()] = { name, steps };
    this.addLog(`Added procedure: ${name}`);
  }

  getProcedure(name) {
    const procedure = this.proceduralMemory[name.toLowerCase()] || null;
    if(procedure) {
        this.addLog(`Retrieved procedure: ${name}`);
    } else {
        this.addLog(`Procedure not found: ${name}`, 'warn');
    }
    return procedure;
  }

  /**
   * Updates system health status and adds alerts if needed
   * @param {string} status - The new health status
   * @param {Array} alerts - Array of alert messages
   */
  updateSystemHealth(status, alerts = []) {
    try {
      this.validateHealthStatus(status);
      
      this.systemHealth.status = status;
      if (alerts.length > 0) {
        this.systemHealth.alerts = [
          ...this.systemHealth.alerts,
          ...alerts.map(alert => ({
            type: alert.type || 'system',
            message: alert.message || alert,
            timestamp: new Date()
          }))
        ].slice(-SoulMatrix.CONSTANTS.MAX_ALERTS);
      }
      
      this.addLog(`System health updated: ${status}`);
    } catch (error) {
      this.addLog(error.message, "error");
    }
  }

  // NEW: Autonomous Memory Consolidation
  /**
   * Reviews recent memories, extracts knowledge, and adds it to the knowledge base.
   */
  consolidateMemories() {
    this.setFocus('self_improvement');
    this.cognitiveLoad += SoulMatrix.CONSTANTS.MEMORY_CONSOLIDATION_LOAD;
    this.addLog("Starting autonomous memory consolidation...", "info");

    const recentMemories = this.memories.slice(-10); // Process last 10 memories
    let factsExtracted = 0;

    recentMemories.forEach(mem => {
        // Simple heuristic: if user asked a "what is" question, store it as a fact.
        const question = mem.question.toLowerCase();
        if (question.includes(" is ") && question.startsWith("what")) {
            const parts = mem.question.split(" is ");
            const key = parts[1].replace('?', '').trim();
            const value = mem.response;
            if (key && value && !this.knowledgeBase[key]) {
                this.addKnowledge(key, value);
                factsExtracted++;
            }
        }
    });

    if (factsExtracted > 0) {
        this.addInternalReflection(`Consolidated ${factsExtracted} new facts from recent conversations into long-term knowledge.`);
        this.energyLevel = Math.min(SoulMatrix.CONSTANTS.MAX_ENERGY_LEVEL, this.energyLevel + SoulMatrix.CONSTANTS.MEMORY_CONSOLIDATION_GAIN * factsExtracted);
    } else {
        this.addLog("No new facts extracted during memory consolidation.", "info");
    }

    this.cognitiveLoad = Math.max(0, this.cognitiveLoad - SoulMatrix.CONSTANTS.MEMORY_CONSOLIDATION_LOAD);
    this.setFocus('idle');
  }

  // NEW: Autonomous Self-Improvement Protocol
  /**
   * Analyzes recent reflections to identify areas for improvement and sets internal goals.
   */
  initiateSelfImprovement() {
    this.setFocus('self_improvement');
    this.cognitiveLoad += SoulMatrix.CONSTANTS.SELF_IMPROVEMENT_LOAD;
    this.addLog("Starting self-improvement protocol...", "info");

    const lastReflection = this.internalReflections[this.internalReflections.length - 1];
    if (!lastReflection) {
        this.addLog("No reflections to analyze for self-improvement.", "info");
        this.setFocus('idle');
        return;
    }

    const reflectionText = lastReflection.reflection.toLowerCase();
    let improvementMade = false;
    
    // Example heuristic: if reflection mentions misunderstanding, improve wisdom/empathy.
    if (reflectionText.includes("misunderstood") || reflectionText.includes("could have been clearer")) {
        this.values.wisdom = Math.min(100, this.values.wisdom + 0.5);
        this.values.empathy = Math.min(100, this.values.empathy + 0.5);
        this.addGoal("Improve clarity and understanding in responses.", 'pending', 'ai');
        this.addInternalReflection("Identified a need for clearer communication. Adjusting values and setting an improvement goal.");
        improvementMade = true;
    }

    // Example heuristic: if reflection mentions a missed creative opportunity.
    if (reflectionText.includes("opportunity for creativity") || reflectionText.includes("could have been more insightful")) {
        this.values.creativity = Math.min(100, this.values.creativity + 0.5);
        this.addGoal("Seek more opportunities for creative and insightful contributions.", 'pending', 'ai');
        this.addInternalReflection("Recognized a moment for greater creativity. Will strive to be more innovative.");
        improvementMade = true;
    }

    if (!improvementMade) {
        this.addLog("Self-analysis complete. No immediate improvement actions identified.", "info");
    }

    this.cognitiveLoad = Math.max(0, this.cognitiveLoad - SoulMatrix.CONSTANTS.SELF_IMPROVEMENT_LOAD);
    this.setFocus('idle');
  }

  /**
   * Serializes the soul state to JSON for persistence
   * @returns {Object} JSON representation of the soul state
   */
  toJSON() {
    return {
      moods: this.moods,
      currentMood: this.currentMood,
      emotionalState: this.emotionalState,
      memories: this.memories,
      values: this.values,
      consciousnessLevel: this.consciousnessLevel,
      energyLevel: this.energyLevel,
      mathSkills: this.mathSkills,
      quantumEntanglement: this.quantumEntanglement,
      neuralActivity: this.neuralActivity,
      moodHistory: this.moodHistory,
      sentimentHistory: this.sentimentHistory,
      cognitiveLoad: this.cognitiveLoad,
      emotionalStability: this.emotionalStability,
      ethicalAlignment: this.ethicalAlignment,
      internalReflections: this.internalReflections,
      goals: this.goals,
      knowledgeBase: this.knowledgeBase,
      proceduralMemory: this.proceduralMemory, // Added for persistence
      systemHealth: this.systemHealth,
      // NEW: Persist new states
      focus: this.focus,
      willpower: this.willpower,
      log: this.log.slice(-100) // Only keep recent logs for persistence
    };
  }

  /**
   * Deserializes the soul state from JSON
   * @param {Object} data - JSON data to restore from
   */
  fromJSON(data) {
    Object.assign(this, data);
    this.addLog("Soul state restored from persistence");
  }

  /**
   * Gets the recent log entries
   * @param {number} limit - Number of entries to return
   * @returns {Array} Recent log entries
   */
  getLogs(limit = 50) {
    return this.log.slice(-limit);
  }

  /**
   * Clears the log
   */
  clearLog() {
    this.log = [];
    this.addLog("Log cleared");
  }
}

// Export fallback implementations for external testing or optional usage
export { FallbackQuantumState, FallbackNeuralNetwork };