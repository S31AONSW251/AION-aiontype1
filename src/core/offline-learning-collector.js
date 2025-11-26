/**
 * AION ULTRA - Offline Interactive Learning Collector
 * Collects user data, learns about user, asks probing questions
 * Similar to how a child learns from asking questions
 */

export class OfflineInteractiveLearner {
  constructor() {
    this.user_profile = {
      name: null,
      interests: [],
      knowledge_level: 'beginner', // beginner, intermediate, advanced
      expertise_areas: [],
      knowledge_gaps: [],
      learning_preferences: [],
      chat_history: [],
      learned_facts: [],
      conversation_count: 0,
      last_session: null
    };

    this.collection_phase = 'initial'; // initial, interest_gathering, profiling, deep_learning
    this.current_topic = null;
    this.question_depth = 0;
    this.data_collected = [];

    // Curiosity-based questions (like a child learning)
    this.curiosity_questions = [
      "What's the most interesting thing you've learned recently?",
      "Tell me about something you're curious about but don't fully understand.",
      "What topics make you say 'I wish I knew more about that'?",
      "What problem are you trying to solve?",
      "What would you like to be an expert in?",
      "Is there something you find confusing about {topic}?",
      "How would you explain {topic} to a 5-year-old?",
      "What's the hardest part about understanding {topic}?",
      "Why is {topic} important to you?",
      "What questions do you have about {topic} that you've never asked anyone?"
    ];

    // Probing questions to understand knowledge
    this.probing_questions = [
      "Can you give me an example of {topic}?",
      "What's the difference between {topic_a} and {topic_b}?",
      "How would you apply {topic} in real life?",
      "What do you already know about {topic}?",
      "What's your biggest misconception about {topic}?",
      "If you had to teach {topic} to someone else, what would you say?",
      "What would happen if {scenario}?",
      "How does {topic} connect to things you already know?",
      "What would you do if you encountered {situation}?",
      "Can you think of where {topic} is used in everyday life?"
    ];

    // Data collection templates
    this.data_templates = {
      interest: "I've learned that you're interested in: {topic}",
      knowledge_gap: "You want to learn more about: {topic}",
      expertise: "You have expertise in: {topic}",
      preference: "You prefer to learn by: {method}",
      goal: "Your goal is: {goal}"
    };
  }

  /**
   * Start interactive learning collection
   */
  async startLearningCollection(userName = null) {
    console.log('🧠 Starting Interactive Learning Collector...');
    
    this.user_profile.conversation_count += 1;
    this.user_profile.last_session = new Date();

    if (userName) {
      this.user_profile.name = userName;
    }

    // Initial greeting and data collection
    const greeting = this.generateGreeting();
    
    return {
      message: greeting,
      phase: this.collection_phase,
      action: 'ask_user',
      expects_response: true,
      data_collected: this.data_collected.length
    };
  }

  /**
   * Generate personalized greeting
   */
  generateGreeting() {
    const greetings = [
      "Hey there! I'm curious to learn about you. What brings you here today?",
      "Hi! I'd love to know more about what you're interested in. What topics fascinate you?",
      "Welcome! Since I can't connect to my server right now, let's have a real conversation. What would you like to talk about?",
      "Hello! I'm always eager to learn from people. What's on your mind?",
      "Hi there! Tell me - what's something you've always wanted to understand better?"
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Process user response and collect data
   */
  async processUserResponse(userResponse, currentPhase = 'initial') {
    console.log('📊 Processing response for data collection...');

    // Analyze the response
    const analysis = this.analyzeResponse(userResponse);
    const extracted_data = this.extractData(userResponse, analysis);
    
    // Store in profile
    this.storeExtractedData(extracted_data);
    
    // Generate follow-up question
    const followup = this.generateFollowupQuestion(analysis, extracted_data);

    return {
      analysis,
      extracted_data,
      followup_question: followup.question,
      follow_up_type: followup.type,
      user_profile_updated: this.user_profile,
      data_collected_count: this.data_collected.length
    };
  }

  /**
   * Analyze user response for insights
   */
  analyzeResponse(userResponse) {
    const lower = userResponse.toLowerCase();
    
    return {
      length: userResponse.length,
      has_questions: lower.includes('?') || lower.includes('how') || lower.includes('what') || lower.includes('why'),
      has_uncertainty: /not sure|don't know|unclear|confused|don't understand|lost|help/i.test(lower),
      emotional_tone: this.detectEmotionalTone(userResponse),
      topics_mentioned: this.extractTopics(userResponse),
      expertise_level: this.estimateExpertise(userResponse),
      learning_style: this.detectLearningStyle(userResponse),
      confidence_level: this.assessConfidence(userResponse)
    };
  }

  /**
   * Detect emotional tone
   */
  detectEmotionalTone(text) {
    const lower = text.toLowerCase();
    
    if (/excited|love|passion|amazing|wonderful|great|awesome/i.test(lower)) {
      return 'enthusiastic';
    } else if (/confused|frustrat|difficult|hard|struggle|don't understand/i.test(lower)) {
      return 'struggling';
    } else if (/interested|curious|want|learn|understand/i.test(lower)) {
      return 'curious';
    } else if (/not sure|maybe|probably|possibly/i.test(lower)) {
      return 'uncertain';
    }
    
    return 'neutral';
  }

  /**
   * Extract topics mentioned
   */
  extractTopics(text) {
    const topics = [];
    const common_topics = [
      'ai', 'machine learning', 'deep learning', 'neural networks', 'data science',
      'programming', 'python', 'javascript', 'web development', 'databases',
      'math', 'physics', 'quantum', 'business', 'marketing', 'design',
      'art', 'music', 'writing', 'communication', 'leadership'
    ];

    const lower = text.toLowerCase();
    
    for (const topic of common_topics) {
      if (lower.includes(topic)) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Estimate user's expertise level
   */
  estimateExpertise(text) {
    const lower = text.toLowerCase();
    
    // Advanced indicators
    if (/advanced|expert|master|proficient|specialize/i.test(lower)) {
      return 'advanced';
    }
    
    // Intermediate indicators
    if (/understand|know|familiar|experience|worked|implemented/i.test(lower)) {
      return 'intermediate';
    }
    
    // Beginner indicators
    if (/learn|new|beginning|start|beginner|novice|confused|don't know/i.test(lower)) {
      return 'beginner';
    }
    
    return 'unknown';
  }

  /**
   * Detect learning style preference
   */
  detectLearningStyle(text) {
    const lower = text.toLowerCase();
    
    const styles = {
      visual: /pictures|diagrams|visual|graphs|charts|see|watch|color/i,
      auditory: /listen|hear|sound|talk|discuss|explain/i,
      reading: /read|articles|books|write|text|documentation/i,
      kinesthetic: /try|practice|hands-on|build|create|do|experiment/i
    };

    for (const [style, pattern] of Object.entries(styles)) {
      if (pattern.test(lower)) {
        return style;
      }
    }

    return 'mixed';
  }

  /**
   * Assess user's confidence
   */
  assessConfidence(text) {
    const lower = text.toLowerCase();
    
    const confidence_words = {
      high: /definitely|absolutely|certain|sure|know|expert|professional/i,
      medium: /probably|likely|think|believe|suppose|usually/i,
      low: /maybe|not sure|uncertain|confused|struggling|help|don't know/i
    };

    for (const [level, pattern] of Object.entries(confidence_words)) {
      if (pattern.test(lower)) {
        return level;
      }
    }

    return 'neutral';
  }

  /**
   * Extract and structure data from response
   */
  extractData(userResponse, analysis) {
    const extracted = {
      raw_response: userResponse,
      analysis: analysis,
      data_points: []
    };

    // Extract interests
    if (analysis.topics_mentioned.length > 0) {
      for (const topic of analysis.topics_mentioned) {
        extracted.data_points.push({
          type: 'interest',
          value: topic,
          confidence: 0.8
        });
        
        if (!this.user_profile.interests.includes(topic)) {
          this.user_profile.interests.push(topic);
        }
      }
    }

    // Extract knowledge gaps
    if (analysis.has_uncertainty) {
      for (const topic of analysis.topics_mentioned) {
        extracted.data_points.push({
          type: 'knowledge_gap',
          value: topic,
          confidence: 0.7
        });

        if (!this.user_profile.knowledge_gaps.includes(topic)) {
          this.user_profile.knowledge_gaps.push(topic);
        }
      }
    }

    // Extract expertise
    if (analysis.expertise_level !== 'unknown') {
      extracted.data_points.push({
        type: 'expertise',
        value: analysis.expertise_level,
        confidence: 0.75
      });
      
      this.user_profile.knowledge_level = analysis.expertise_level;
    }

    // Extract learning preference
    if (analysis.learning_style !== 'mixed') {
      extracted.data_points.push({
        type: 'learning_preference',
        value: analysis.learning_style,
        confidence: 0.7
      });

      if (!this.user_profile.learning_preferences.includes(analysis.learning_style)) {
        this.user_profile.learning_preferences.push(analysis.learning_style);
      }
    }

    return extracted;
  }

  /**
   * Store extracted data permanently
   */
  storeExtractedData(extracted_data) {
    for (const point of extracted_data.data_points) {
      this.data_collected.push({
        ...point,
        collected_at: new Date(),
        session: this.user_profile.conversation_count
      });
    }

    // Update learned facts
    if (extracted_data.analysis.topics_mentioned.length > 0) {
      for (const topic of extracted_data.analysis.topics_mentioned) {
        this.user_profile.learned_facts.push({
          fact: `User is interested in ${topic}`,
          topic: topic,
          confidence: 0.8,
          timestamp: new Date()
        });
      }
    }

    // Add to chat history
    this.user_profile.chat_history.push({
      user_message: extracted_data.raw_response,
      analysis: extracted_data.analysis,
      timestamp: new Date()
    });
  }

  /**
   * Generate smart follow-up questions (like a curious child)
   */
  generateFollowupQuestion(analysis, extracted_data) {
    let question = '';
    let type = 'curiosity';

    // If we learned about interests, ask deeper questions
    if (analysis.topics_mentioned.length > 0) {
      const topic = analysis.topics_mentioned[0];
      
      if (analysis.has_uncertainty) {
        // They want to learn more
        type = 'probing_knowledge';
        const probing = this.probing_questions[
          Math.floor(Math.random() * this.probing_questions.length)
        ].replace('{topic}', topic).replace('{topic_a}', topic).replace('{topic_b}', 'related concept');
        question = probing;
      } else {
        // They know about it, dig deeper
        type = 'deep_exploration';
        question = `That's interesting about ${topic}! Can you tell me more about what you find most fascinating about it? And what part do you find challenging?`;
      }
    } else {
      // No clear topic, ask more general curiosity questions
      type = 'curiosity';
      question = this.curiosity_questions[
        Math.floor(Math.random() * this.curiosity_questions.length)
      ];
    }

    // Personalize based on analysis
    if (analysis.learning_style === 'visual') {
      question += " Can you describe it visually?";
    } else if (analysis.learning_style === 'kinesthetic') {
      question += " How would you try this out?";
    }

    return { question, type };
  }

  /**
   * Generate personalized response based on collected data
   */
  generatePersonalizedResponse(userInput) {
    console.log('✨ Generating personalized response...');

    const profile = this.user_profile;
    let response = '';

    // If we have a name, use it
    if (profile.name) {
      response += `Great, ${profile.name}! `;
    }

    // Reference their interests
    if (profile.interests.length > 0) {
      response += `Since you're interested in ${profile.interests.join(', ')}, `;
    }

    // Acknowledge their learning style
    if (profile.learning_preferences.length > 0) {
      response += `and you prefer to learn by ${profile.learning_preferences[0]}, `;
    }

    // Address knowledge gaps
    if (profile.knowledge_gaps.length > 0) {
      response += `I can help you understand ${profile.knowledge_gaps[0]} better. `;
    }

    // Adapt to expertise level
    if (profile.knowledge_level === 'beginner') {
      response += `Let me explain this in simple terms...`;
    } else if (profile.knowledge_level === 'intermediate') {
      response += `Let me go into more detail...`;
    } else if (profile.knowledge_level === 'advanced') {
      response += `Let me discuss the advanced aspects...`;
    }

    return response;
  }

  /**
   * Get user profile summary
   */
  getUserProfileSummary() {
    return {
      name: this.user_profile.name,
      interests: this.user_profile.interests,
      knowledge_level: this.user_profile.knowledge_level,
      expertise_areas: this.user_profile.expertise_areas,
      knowledge_gaps: this.user_profile.knowledge_gaps,
      learning_preferences: this.user_profile.learning_preferences,
      conversations: this.user_profile.conversation_count,
      data_points_collected: this.data_collected.length,
      learned_facts: this.user_profile.learned_facts.slice(-10), // Last 10
      last_session: this.user_profile.last_session
    };
  }

  /**
   * Get all collected data
   */
  getCollectedData() {
    return {
      user_profile: this.user_profile,
      data_points: this.data_collected,
      data_summary: {
        interests_discovered: this.user_profile.interests.length,
        knowledge_gaps_identified: this.user_profile.knowledge_gaps.length,
        expertise_areas: this.user_profile.expertise_areas.length,
        learning_style_diversity: this.user_profile.learning_preferences.length,
        conversation_count: this.user_profile.conversation_count,
        facts_learned: this.user_profile.learned_facts.length
      }
    };
  }

  /**
   * Export user data for persistence
   */
  exportUserData() {
    return {
      exported_at: new Date(),
      user_profile: this.user_profile,
      collected_data: this.data_collected
    };
  }

  /**
   * Import user data from previous session
   */
  importUserData(data) {
    if (data.user_profile) {
      this.user_profile = { ...this.user_profile, ...data.user_profile };
    }
    if (data.collected_data) {
      this.data_collected = [...this.data_collected, ...data.collected_data];
    }
    console.log('✅ User data imported from previous session');
    return this.user_profile;
  }

  /**
   * Generate questions based on gaps to continue learning
   */
  generateGapFillingQuestions() {
    const questions = [];

    // Ask about knowledge gaps
    for (const gap of this.user_profile.knowledge_gaps.slice(0, 3)) {
      questions.push({
        topic: gap,
        question: `You mentioned wanting to learn about ${gap}. What specifically would you like to know?`,
        type: 'gap_filling',
        priority: 'high'
      });
    }

    // Ask about related topics
    for (const interest of this.user_profile.interests.slice(0, 2)) {
      questions.push({
        topic: interest,
        question: `Since you're interested in ${interest}, have you explored related fields?`,
        type: 'expansion',
        priority: 'medium'
      });
    }

    // Ask for feedback on learning experience
    questions.push({
      topic: 'learning_experience',
      question: `How are you enjoying this conversation so far? What could make it better?`,
      type: 'feedback',
      priority: 'medium'
    });

    return questions;
  }

  /**
   * Adapt responses based on learning progress
   */
  adaptToUserProgress() {
    const profile = this.user_profile;
    const progress = {
      current_level: profile.knowledge_level,
      ready_for_upgrade: false,
      recommended_topics: [],
      learning_path: []
    };

    // If they're intermediate, suggest advanced topics
    if (profile.knowledge_level === 'intermediate' && profile.chat_history.length > 5) {
      progress.ready_for_upgrade = true;
      progress.recommended_topics = this.recommendAdvancedTopics(profile.interests);
    }

    // Build learning path
    progress.learning_path = this.buildLearningPath(profile);

    return progress;
  }

  /**
   * Recommend advanced topics
   */
  recommendAdvancedTopics(interests) {
    const recommendations = {
      'machine learning': ['deep learning', 'neural networks', 'nlp'],
      'deep learning': ['transformers', 'reinforcement learning', 'computer vision'],
      'python': ['django', 'machine learning libraries', 'data science'],
      'web development': ['backend optimization', 'microservices', 'devops']
    };

    const recommended = [];
    for (const interest of interests) {
      if (recommendations[interest]) {
        recommended.push(...recommendations[interest]);
      }
    }

    return [...new Set(recommended)].slice(0, 5); // Return unique topics
  }

  /**
   * Build personalized learning path
   */
  buildLearningPath(profile) {
    return {
      foundation: profile.knowledge_gaps.slice(0, 2),
      intermediate: profile.interests.slice(0, 2),
      advanced: this.recommendAdvancedTopics(profile.interests).slice(0, 2),
      total_steps: 6,
      current_progress: profile.chat_history.length,
      estimated_completion: profile.chat_history.length < 3 ? 'In progress' : 'Next session'
    };
  }

  /**
   * Generate motivational feedback
   */
  generateMotivationalFeedback() {
    const profile = this.user_profile;
    const feedbacks = [
      `Great curiosity! You've shown interest in ${profile.interests.length} areas.`,
      `Your questions show real engagement. Keep up the learning spirit!`,
      `You've made excellent progress identifying what you want to learn.`,
      `Your diverse interests span ${profile.interests.length} different fields - impressive!`,
      `You're doing great! Let's keep exploring together.`
    ];

    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  }
}

export default OfflineInteractiveLearner;
