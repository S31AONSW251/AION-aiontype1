import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { SoulMatrix } from '../core/soul';

// Create the context
export const AionContext = createContext();

// Initialize the soul outside the provider to maintain a single instance
const aionSoul = new SoulMatrix();

// Create the Provider component
export const AionProvider = ({ children }) => {
  // --- Existing State ---
  const [log, setLog] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [reply, setReply] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [soulState, setSoulState] = useState({ ...aionSoul });
  const [activeTab, setActiveTab] = useState("chat");
  const [notification, setNotification] = useState(null);
  const [settings] = useState(() => ({
    theme: 'dark',
    enableMemoryIntegration: true,
    autoSpeakReplies: false,
  }));
  const [showSettings, setShowSettings] = useState(false);
  const [showSoulPanel, setShowSoulPanel] = useState(false);
  const chatContainerRef = useRef(null);

  // Lightweight semantic memory fallback. This file is not part of the main
  // runtime, so avoid optional model dependencies here.
  const [isModelLoading] = useState(false);
  const [vectorStore, setVectorStore] = useState([]);


  // --- New Core Memory Functions ---

  const tokenize = useCallback((text) => {
    return String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  }, []);

  /**
   * Adds a piece of text to the semantic memory.
   * @param {string} text - The text to remember.
   */
  const addMemory = useCallback(async (text) => {
    if (!text) return;
    setVectorStore(prevStore => [
      ...prevStore,
      { text, tokens: tokenize(text), timestamp: new Date() }
    ]);
    showNotification("New memory stored.", "info");
  }, [showNotification, tokenize]);

  /**
   * Searches the memory for the most relevant entries to a query.
   * @param {string} query - The search query.
   * @param {number} topK - The number of results to return.
   * @returns {Promise<object[]>} - An array of the most similar memories.
   */
  const searchMemories = useCallback(async (query, topK = 3) => {
    if (isModelLoading || vectorStore.length === 0) return [];
    const queryTokens = tokenize(query);
    if (!queryTokens.length) return [];

    const scoredMemories = vectorStore.map(memory => {
      const memoryTokens = new Set(memory.tokens || tokenize(memory.text));
      const hits = queryTokens.filter(token => memoryTokens.has(token)).length;
      const similarity = hits / Math.max(queryTokens.length, 1);
      return { ...memory, similarity };
    }).filter(memory => memory.similarity > 0);

    scoredMemories.sort((a, b) => b.similarity - a.similarity);
    return scoredMemories.slice(0, topK);
  }, [isModelLoading, vectorStore, tokenize]);


  // --- Existing Functions ---
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // --- Modified askAion function ---
  const askAion = useCallback(async (inputText = null) => {
      const question = inputText || userInput;
      if (!question.trim()) {
        showNotification("Please enter a question", "warning");
        return;
      }
      setIsThinking(true);
      showNotification("AION is thinking...");

      // 1. Search for relevant memories
      const relevantMemories = await searchMemories(question);
      let memoryContext = "No relevant memories found.";
      if (relevantMemories.length > 0) {
        memoryContext = "I recall the following, which might be relevant:\n" + 
                        relevantMemories.map(mem => `- "${mem.text}"`).join("\n");
      }
      console.log("Retrieved Context:", memoryContext); // For debugging

      // 2. Construct a prompt with the retrieved context
      const prompt = `
        Based on the following memories and your core identity, answer the user's question.
        
        [Relevant Memories]
        ${memoryContext}
        
        [User Question]
        ${question}
        
        [Your Answer]
      `;
      
      // (This section would contain your LLM API call)
      // For now, we'll simulate the response.
      setTimeout(() => {
        const simulatedResponse = `Based on your question about "${question}", and recalling my memories, here is my thoughtful response.`;
        setReply(simulatedResponse);
        
        const newEntry = { time: new Date().toLocaleString(), question, response: simulatedResponse, mood: soulState.currentMood, emotion: soulState.emotionalState, sentiment: 0 };
        setConversationHistory(prev => [...prev, newEntry]);
        
        // 3. Add both the question and answer as new memories
        addMemory(`The user asked: ${question}`);
        addMemory(`I responded: ${simulatedResponse}`);

        setUserInput("");
        setIsThinking(false);
      }, 2000);

  }, [userInput, soulState, searchMemories, addMemory]);


  // The value provided to consuming components
  const contextValue = {
    // ... all your existing state, setters, and functions
    soulState, setShowSettings, showSettings, setShowSoulPanel, showSoulPanel,
    userInput, setUserInput, isThinking, askAion, activeTab, setActiveTab,
    chatContainerRef, conversationHistory, reply, notification, settings,
    // --- New values for memory ---
    vectorStore,
    isModelLoading,
    searchMemories,
  };

  return (
    <AionContext.Provider value={contextValue}>
      {children}
    </AionContext.Provider>
  );
};
