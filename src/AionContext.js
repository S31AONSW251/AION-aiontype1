import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { SoulMatrix } from '../core/soul';
import FileSaver from "file-saver";

// Create the context
const AionContext = createContext();

// Create the provider component
export const AionProvider = ({ children }) => {
    // AION's Core State
    const [aionSoul] = useState(() => new SoulMatrix());
    const [soulState, setSoulState] = useState({ ...aionSoul });

    // UI and Application State
    const [activeTab, setActiveTab] = useState("chat");
    const [notification, setNotification] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Conversation & Interaction State
    const [conversationHistory, setConversationHistory] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [reply, setReply] = useState("");
    const [streamingResponse, setStreamingResponse] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    // Agent & Tool-Specific State
    const [agentStatus, setAgentStatus] = useState("idle");
    const [searchPlan, setSearchPlan] = useState([]);
    const [thoughtProcessLog, setThoughtProcessLog] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchSummary, setSearchSummary] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestedQueries, setSuggestedQueries] = useState([]);
    const [mathSolution, setMathSolution] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isImageGenerating, setIsImageGenerating] = useState(false);
    const [creativeOutput, setCreativeOutput] = useState(null);

    // Memory State
    const [longTermMemory, setLongTermMemory] = useState([]);
    const [internalReflections, setInternalReflections] = useState([]);

    // Settings State
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem("aion_settings");
        const defaultSettings = {
            pitch: 1, rate: 1, volume: 0.7, theme: "dark", voiceGender: "female", language: "en-US",
            voiceName: "", spiritualMode: true, affirmationLoop: true, autoSpeakReplies: true,
            autoListen: false, personalityIntensity: 75, welcomeMessage: "Hello, I am AION. How can we connect today?",
            soulVisibility: true, animationEnabled: true, soundEffects: true, energySaver: false,
            enableWebSearch: true, searchProvider: "google", searchDepth: 3, enableMathSolving: true,
            showMathSteps: true, mathEngine: 'mathjs', enableQuantum: true, quantumDepth: 2,
            enableNeural: true, neuralLayers: 3, realSearchApiEndpoint: "https://927e8f8ac9a2.ngrok-free.app",
            enableSentimentAnalysis: true, enableCreativeGeneration: true, enableSelfCorrection: true,
            enableLongTermMemory: true, enableSelfReflection: true, reflectionFrequency: 300000,
            enableImageGeneration: true, goalTracking: true, knowledgeBase: true,
            enableContextAwareness: true,
            enableMemoryIntegration: true,
            maxResponseTokens: 4096,
            responseTemperature: 0.7,
            enableRealTimeStreaming: true,
            enableAdvancedReasoning: true,
            enableFactChecking: true,
            enableCrossReferencing: true,
            enableEmotionalIntelligence: true,
            enablePredictiveAnalysis: true,
            enableMultiModalProcessing: true
        };
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    });

    // Refs
    const abortControllerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Centralized Notification Function
    const showNotification = useCallback((message, type = "info") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Function to update the soul state externally
    const updateSoulState = useCallback(() => {
        setSoulState({ ...aionSoul });
    }, [aionSoul]);

    // Function to add a new memory and update soul
    const addMemory = useCallback((memoryEntry) => {
        aionSoul.addMemory(memoryEntry);
        setConversationHistory(prev => [...prev.slice(-9), memoryEntry]);
        updateSoulState();
    }, [aionSoul, updateSoulState]);
    
    // Function to export conversation
    const exportConversation = useCallback(() => {
        const data = { 
          timestamp: new Date().toISOString(), 
          conversation: conversationHistory, 
          soulState: soulState,
          longTermMemory,
          internalReflections
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        FileSaver.saveAs(blob, `aion-conversation-${new Date().toISOString().slice(0, 10)}.json`);
        showNotification("Conversation exported", "success");
    }, [conversationHistory, soulState, longTermMemory, internalReflections, showNotification]);

    const value = {
        // State
        aionSoul, soulState, activeTab, notification, showSettings,
        conversationHistory, userInput, isThinking, isSpeaking, isListening,
        reply, streamingResponse, isStreaming, agentStatus, searchPlan,
        thoughtProcessLog, searchResults, searchSummary, searchQuery, searchError,
        isSearching, suggestedQueries, mathSolution, generatedImage, isImageGenerating,
        creativeOutput, longTermMemory, internalReflections, settings,

        // Setters
        setSoulState, setActiveTab, setNotification, setShowSettings,
        setConversationHistory, setUserInput, setIsThinking, setIsSpeaking, setIsListening,
        setReply, setStreamingResponse, setIsStreaming, setAgentStatus, setSearchPlan,
        setThoughtProcessLog, setSearchResults, setSearchSummary, setSearchQuery, setSearchError,
        setIsSearching, setSuggestedQueries, setMathSolution, setGeneratedImage, setIsImageGenerating,
        setCreativeOutput, setLongTermMemory, setInternalReflections, setSettings,

        // Functions
        showNotification,
        updateSoulState,
        addMemory,
        exportConversation,
        
        // Refs
        abortControllerRef,
        recognitionRef
    };

    return (
        <AionContext.Provider value={value}>
            {children}
        </AionContext.Provider>
    );
};

// Custom hook to use the context
export const useAion = () => {
    const context = useContext(AionContext);
    if (context === undefined) {
        throw new Error('useAion must be used within an AionProvider');
    }
    return context;
};
