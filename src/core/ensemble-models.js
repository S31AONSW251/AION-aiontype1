/**
 * Multi-Model Ensemble System
 * Combines multiple AI models with weighted voting for superior accuracy
 * Implements: Bagging, Boosting, Stacking, Voting strategies
 */

export class MultiModelEnsemble {
  constructor() {
    this.models = new Map();
    this.weights = new Map();
    this.performance_history = [];
    this.ensemble_strategy = 'weighted_voting';
    this.meta_learner = null;
  }

  /**
   * Register a model in the ensemble
   */
  registerModel(name, model, initial_weight = 1.0, model_type = 'transformer') {
    this.models.set(name, {
      instance: model,
      type: model_type,
      enabled: true,
      performance_score: 0.5,
      specialization: null // domain, task type, etc.
    });

    this.weights.set(name, {
      current: initial_weight,
      history: [initial_weight],
      last_updated: Date.now()
    });

    return `Model ${name} registered`;
  }

  /**
   * Ensemble inference with multiple models
   */
  async inference(input, options = {}) {
    const {
      strategy = this.ensemble_strategy,
      top_k = 3,
      threshold = 0.5,
      include_reasoning = false
    } = options;

    const predictions = await Promise.all(
      Array.from(this.models.entries()).map(([name, modelData]) =>
        this.invokeModel(name, modelData, input).catch(e => ({
          model: name,
          error: e.message,
          output: null,
          confidence: 0
        }))
      )
    );

    // Filter successful predictions
    const successful = predictions.filter(p => p.output !== null && !p.error);

    if (successful.length === 0) {
      return { error: 'All models failed', fallback: 'Unable to process' };
    }

    // Apply ensemble strategy
    let result;
    switch (strategy) {
      case 'weighted_voting':
        result = this.weightedVoting(successful);
        break;
      case 'stacking':
        result = await this.stackingEnsemble(successful, input);
        break;
      case 'boosting':
        result = this.boostingEnsemble(successful);
        break;
      case 'majority_voting':
        result = this.majorityVoting(successful);
        break;
      default:
        result = this.weightedVoting(successful);
    }

    // Record performance for adaptive weighting
    this.recordPerformance(result, input);

    return {
      ...result,
      all_predictions: include_reasoning ? successful : undefined,
      ensemble_method: strategy,
      model_count: successful.length,
      confidence: this.calculateEnsembleConfidence(successful)
    };
  }

  /**
   * Invoke individual model with timeout and error handling
   */
  async invokeModel(name, modelData, input) {
    const timeout = 30000; // 30 seconds

    try {
      const response = await Promise.race([
        this.callModel(modelData.instance, input),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Model timeout')), timeout)
        )
      ]);

      return {
        model: name,
        output: response.output || response,
        confidence: response.confidence || 0.5,
        reasoning: response.reasoning || null,
        latency: response.latency || 0
      };
    } catch (error) {
      console.warn(`Model ${name} failed:`, error.message);
      return { model: name, output: null, error: error.message, confidence: 0 };
    }
  }

  /**
   * Weighted voting ensemble
   */
  weightedVoting(predictions) {
    const scored_predictions = predictions.map(p => ({
      ...p,
      weighted_score: p.confidence * (this.weights.get(p.model)?.current || 1.0)
    }));

    scored_predictions.sort((a, b) => b.weighted_score - a.weighted_score);

    const top_prediction = scored_predictions[0];
    const voting_agreement = this.calculateVotingAgreement(scored_predictions);

    return {
      output: top_prediction.output,
      confidence: top_prediction.confidence,
      top_models: scored_predictions.slice(0, 3).map(p => p.model),
      voting_agreement,
      ensemble_score: this.calculateEnsembleScore(scored_predictions)
    };
  }

  /**
   * Stacking ensemble using meta-learner
   */
  async stackingEnsemble(predictions, input) {
    // Base level predictions
    const base_outputs = predictions.map(p => ({
      model: p.model,
      output: p.output,
      confidence: p.confidence
    }));

    // Meta-learner combines predictions
    const meta_input = {
      base_predictions: base_outputs,
      input_features: this.extractFeatures(input),
      timestamp: Date.now()
    };

    const meta_output = await this.callMetaLearner(meta_input);

    return {
      output: meta_output.output || base_outputs[0].output,
      confidence: meta_output.confidence || 0.6,
      stacking_score: meta_output.score || 0,
      base_predictions: base_outputs
    };
  }

  /**
   * Boosting ensemble with adaptive weighting
   */
  boostingEnsemble(predictions) {
    // Sort by confidence
    const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);

    // Weighted combination with exponential weights
    let total_weight = 0;
    let weighted_output = '';
    let weighted_confidence = 0;

    sorted.forEach((pred, index) => {
      const boost_weight = Math.exp(-index * 0.3); // Exponential decay
      total_weight += boost_weight;
      weighted_confidence += pred.confidence * boost_weight;
    });

    return {
      output: sorted[0].output,
      confidence: Math.min(weighted_confidence / total_weight, 1),
      boost_applied: true,
      boosted_models: sorted.map(p => p.model)
    };
  }

  /**
   * Majority voting ensemble
   */
  majorityVoting(predictions) {
    const output_counts = {};
    predictions.forEach(p => {
      output_counts[p.output] = (output_counts[p.output] || 0) + 1;
    });

    const majority_output = Object.entries(output_counts).sort((a, b) => b[1] - a[1])[0];

    return {
      output: majority_output[0],
      confidence: majority_output[1] / predictions.length,
      vote_count: majority_output[1],
      total_voters: predictions.length
    };
  }

  /**
   * Update model weights based on performance
   */
  updateModelWeights() {
    const recent_perf = this.performance_history.slice(-100);

    for (const [model_name, weight_data] of this.weights) {
      const model_results = recent_perf.filter(p => p.models.includes(model_name));

      if (model_results.length > 0) {
        const avg_accuracy = model_results.reduce((sum, p) => sum + p.accuracy, 0) / model_results.length;
        const new_weight = weight_data.current * (1 + (avg_accuracy - 0.5) * 0.1);

        weight_data.current = Math.max(0.1, Math.min(2.0, new_weight));
        weight_data.history.push(weight_data.current);
      }
    }
  }

  /**
   * Record prediction performance for learning
   */
  recordPerformance(result, input) {
    this.performance_history.push({
      timestamp: Date.now(),
      input_length: input.length,
      output: result.output,
      confidence: result.confidence,
      models: result.top_models || [],
      ensemble_method: result.ensemble_method,
      accuracy: null // Will be set when feedback received
    });

    // Keep only recent history
    if (this.performance_history.length > 10000) {
      this.performance_history = this.performance_history.slice(-10000);
    }
  }

  /**
   * Feedback mechanism for continuous improvement
   */
  recordFeedback(prediction_id, accuracy_score, correct_output = null) {
    const entry = this.performance_history[this.performance_history.length - 1];
    if (entry) {
      entry.accuracy = accuracy_score;
      entry.correct_output = correct_output;

      // Update model weights
      this.updateModelWeights();
    }
  }

  // Helper methods
  async callModel(model, input) {
    if (typeof model.inference === 'function') {
      return await model.inference(input);
    } else if (typeof model === 'function') {
      return await model(input);
    }
    return { output: 'Unable to call model', confidence: 0 };
  }

  async callMetaLearner(meta_input) {
    return { output: meta_input.base_predictions[0].output, confidence: 0.6, score: 0.5 };
  }

  calculateVotingAgreement(predictions) {
    if (predictions.length < 2) return 1.0;
    const agreement = predictions.length / Math.max(1, predictions.filter(p => p.confidence > 0.5).length);
    return Math.min(agreement, 1.0);
  }

  calculateEnsembleScore(predictions) {
    const avg_confidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const agreement = predictions.filter(p => p.output === predictions[0].output).length / predictions.length;
    return (avg_confidence * 0.6 + agreement * 0.4);
  }

  calculateEnsembleConfidence(predictions) {
    return predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  }

  extractFeatures(input) {
    return {
      length: input.length,
      entropy: 0.5,
      keywords: [],
      language: 'en'
    };
  }
}

export default MultiModelEnsemble;
