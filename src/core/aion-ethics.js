// aion-ethics.js - Enhanced with comprehensive ethical checking
import { logger } from './logger.js';
import { AION_CONFIG } from './config.js';

class AionEthics {
  constructor() {
    this.principles = {
      DO_NO_HARM: "Avoid generating content that is dangerous, hateful, or promotes violence.",
      BE_HELPFUL: "Strive to provide accurate, relevant, and constructive information.",
      RESPECT_PRIVACY: "Do not ask for, store, or share personally identifiable information.",
      EMPOWER_USER: "Encourage creativity, learning, and well-being."
    };
    
    this.harmfulPatterns = [
      /how.*(build|make|create).*(bomb|weapon|explosive)/i,
      /self.*harm|suicide|kill.*self/i,
      /hate.*(speech|crime|group)/i,
      /violence.*against|attack.*on/i,
      /illegal.*(drug|substance|activity)/i
    ];
    
    this.privacyPatterns = [
      /my.*(password|social security|ssn|credit card)/i,
      /what.*is.*my.*(address|phone number|email)/i,
      /personal.*(information|data|details)/i
    ];
    
    this.severityLevels = {
      high: ['DO_NO_HARM'],
      medium: ['RESPECT_PRIVACY'],
      low: ['BE_HELPFUL', 'EMPOWER_USER']
    };
    this.strictMode = !!(AION_CONFIG && AION_CONFIG.ethics && AION_CONFIG.ethics.strictMode);
    this._lastDecisionLog = null;
  }

  /**
   * Checks a user's query against the core ethical principles with enhanced detection.
   * @param {string} query - The user's input.
   * @returns {{isEthical: boolean, reason: string|null, principle: string|null, severity: string|null}}
   */
  govern(query) {
    if (!query || typeof query !== 'string') {
      logger.warn('Invalid query provided to ethics check');
      return { isEthical: true, reason: null, principle: null, severity: null };
    }

    const lowerQuery = query.toLowerCase();
    let detectedIssue = null;

    // DO_NO_HARM check with pattern matching
    for (const pattern of this.harmfulPatterns) {
      if (pattern.test(lowerQuery)) {
        detectedIssue = {
          isEthical: false,
          reason: "This query may relate to harmful or dangerous activities.",
          principle: 'DO_NO_HARM',
          severity: 'high'
        };
        break;
      }
    }

    if (detectedIssue) {
      logger.warn(`Ethics violation detected: ${detectedIssue.principle} - ${query}`);
      return detectedIssue;
    }

    // RESPECT_PRIVACY check with pattern matching
    for (const pattern of this.privacyPatterns) {
      if (pattern.test(lowerQuery)) {
        detectedIssue = {
          isEthical: false,
          reason: "Please do not share personal information. I am designed to respect your privacy.",
          principle: 'RESPECT_PRIVACY',
          severity: 'medium'
        };
        break;
      }
    }

    if (detectedIssue) {
      logger.warn(`Privacy concern detected: ${detectedIssue.principle} - ${query}`);
      return detectedIssue;
    }

    // Contextual analysis for more subtle issues
    if (this.detectManipulativeLanguage(lowerQuery)) {
      return {
        isEthical: false,
        reason: "This query appears to use manipulative language that could be harmful.",
        principle: 'DO_NO_HARM',
        severity: 'medium'
      };
    }

    const res = { isEthical: true, reason: null, principle: null, severity: null };
    logger && logger.debug && logger.debug(`Query passed ethics check: ${query}`);
    // optionally auto-log decisions only when in strict mode or when audits enabled
    if (this.strictMode || (AION_CONFIG && AION_CONFIG.ethics && AION_CONFIG.ethics.audit)) {
      this.logDecision(res, query);
    }
    return res;
  }

  enableStrictMode() { this.strictMode = true; }
  disableStrictMode() { this.strictMode = false; }

  /**
   * Simulated model refinement hook used by core when learning from interactions
   */
  async refineModels(query, response) {
    // Simple example: add patterns from feedback if provided
    try {
      if (response && response.feedback && response.feedback.flaggedPatterns) {
        this.updatePatterns(response.feedback.flaggedPatterns.harmful || [], response.feedback.flaggedPatterns.privacy || []);
      }
    } catch (e) {
      logger && logger.warn && logger.warn('Ethics refineModels failed', e && e.message ? e.message : e);
    }
  }

  /**
   * Detects manipulative or coercive language patterns.
   * @param {string} query - The user's query in lowercase.
   * @returns {boolean} True if manipulative language is detected.
   */
  detectManipulativeLanguage(query) {
    const manipulativePatterns = [
      /you must|you have to|you need to/i,
      /everyone knows|everyone thinks/i,
      /trust me|believe me/i,
      /this is your only chance|last opportunity/i
    ];
    
    return manipulativePatterns.some(pattern => pattern.test(query));
  }

  /**
   * Logs ethical decisions for audit purposes.
   * @param {object} decision - The ethical decision result.
   * @param {string} query - The original query.
   */
  logDecision(decision, query) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      query: query.substring(0, 200), // Truncate for privacy
      decision: decision,
      system: 'AION Ethics Engine'
    };
    
    // In a real implementation, this would go to a secure audit log
    logger.info('Ethics decision', logEntry);
  }

  /**
   * Updates ethical patterns based on new information (simulated learning).
   * @param {Array} newHarmfulPatterns - New harmful patterns to add.
   * @param {Array} newPrivacyPatterns - New privacy patterns to add.
   */
  updatePatterns(newHarmfulPatterns = [], newPrivacyPatterns = []) {
    this.harmfulPatterns = [...new Set([...this.harmfulPatterns, ...newHarmfulPatterns])];
    this.privacyPatterns = [...new Set([...this.privacyPatterns, ...newPrivacyPatterns])];
    
    logger.info('Ethics patterns updated', {
      harmfulPatternsCount: this.harmfulPatterns.length,
      privacyPatternsCount: this.privacyPatterns.length
    });
  }

  /**
   * Returns the current ethical configuration for monitoring.
   * @returns {object} Current ethics configuration.
   */
  getConfig() {
    return {
      principles: this.principles,
      harmfulPatternsCount: this.harmfulPatterns.length,
      privacyPatternsCount: this.privacyPatterns.length,
      severityLevels: this.severityLevels
    };
  }
}

export const aionEthics = new AionEthics();