import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import FileSaver from "file-saver";
import Lottie from "lottie-react";

// Import Assets
import chakraAnimation from "./assets/chakra.json";
import cosmicAudio from "./assets/cosmic.mp3";
import soulYaml from "./assets/soul.yaml";

// Import Core Logic
import { SoulMatrix } from './core/soul';
import { MathEngine } from './core/math';
import { QuantumSimulator, QuantumGates } from './core/quantum';
import { NeuralNetwork } from './core/neural';
import { SystemIntegration } from './core/system/SystemIntegration';
import { LearningEngine } from './core/learningEngine';

// Import ULTRA Advanced Systems
import AIONQuantumCore from './core/quantum-ultra-core.js';
import ConsciousnessSystem from './core/consciousness-system.js';
import NeuralEvolutionSystem from './core/neural-evolution.js';
import AdvancedOfflineMetadata from './core/advanced-offline-metadata.js';
import OfflineResponseManager from './core/offline-response-manager.js';
import OfflineInteractiveLearner from './core/offline-learning-collector.js';

// Import UI Components
import Header from './components/Header';
import Tabs from './components/Tabs';
import Notification from './components/Notification';
import SettingsModal from './components/SettingsModal';
import ChatPanel from './components/panels/ChatPanel';
import AIAnalysisModal from './components/AIAnalysisModal';
import WelcomeSplash from './components/WelcomeSplashClean';
import About from './components/About';
import SoulPanel from './components/panels/SoulPanel';
import MemoriesPanel from './components/panels/MemoriesPanel';
import SearchPanel from './components/panels/SearchPanel';
import MathPanel from './components/panels/MathPanel';
import QuantumPanel from './components/panels/QuantumPanel';
import NeuralPanel from './components/panels/NeuralPanel';
import CreativePanel from './components/panels/CreativePanel';
import GoalsPanel from './components/panels/GoalsPanel';
import KnowledgePanel from './components/panels/KnowledgePanel';
import FileUploadPanel from './components/panels/FileUploadPanel';
// NEW: Import the new ProceduresPanel
import ProceduresPanel from './components/panels/ProceduresPanel';
import StatusPanel from './components/panels/StatusPanel';
import WebCachePanel from './components/panels/WebCachePanel';
import FloatingBrainIcon from './components/FloatingBrainIcon';


import "./App.css";
// Load targeted settings-modal overrides (keeps fixes isolated and easy to remove)
import "./settings-modal-fixes.css";
import './components/About.css';
// Import ULTRA Premium Mystical Theme
import './styles/aion-ultra-theme.css';
import { offlineReply, tryResendOutbox, indexKnowledge } from './lib/offlineResponder';
import { enqueue } from './lib/offlineQueue';
import { localModel } from './lib/localModel';
import memoryService from './services/memoryService';
import modelService from './services/modelService';

// --- DEFAULT SETTINGS moved to module scope so effects can reuse them safely ---
export const DEFAULT_SETTINGS = {
  pitch: 1, rate: 1, volume: 0.7, theme: "dark", voiceGender: "female", language: "en-US",
  voiceName: "", spiritualMode: true, affirmationLoop: true, autoSpeakReplies: true,
  autoListen: false, personalityIntensity: 75, welcomeMessage: "Hello, I am AION. How can we connect today?",
  soulVisibility: true, animationEnabled: true, soundEffects: true, energySaver: false,
  enableWebSearch: true, searchProvider: "google", searchDepth: 3, enableMathSolving: true,
  showMathSteps: true, mathEngine: 'mathjs', enableQuantum: true, quantumDepth: 2,
  enableNeural: true, neuralLayers: 3, realSearchApiEndpoint: "",
  enableSentimentAnalysis: true, enableCreativeGeneration: true, enableSelfCorrection: true,
  enableLongTermMemory: true, enableSelfReflection: true, reflectionFrequency: 300000,
  enableImageGeneration: true,
  // NEW: Video generation settings
  enableVideoGeneration: true,
  videoResolution: "512x512",
  videoDuration: 10,
  goalTracking: true, knowledgeBase: true,
  // New settings for enhanced answer generation
  enableContextAwareness: true,
  enableMemoryIntegration: true,
  maxResponseTokens: 4096,
  responseTemperature: 0.7,
  enableRealTimeStreaming: true,
  // New settings for advanced features
  enableAdvancedReasoning: true,
  enableFactChecking: true,
  enableCrossReferencing: true,
  enableEmotionalIntelligence: true,
  enablePredictiveAnalysis: true,
  enableMultiModalProcessing: true,
  // New system integration toggle
  enableSystemIntegration: true,
  // NEW: Toggle for procedural memory
  enableProceduralMemory: true,
  // Toggle to enable offline mode features
  enableOfflineMode: true,
  // When true, server replies and uploaded files are automatically indexed into the local offline store
  autoIndexResponses: false,
  // Admin key for local admin UI (not secure for production)
  adminKey: '',
  // Ambient background control (separate from global animations)
  ambientBackgroundEnabled: true,
  // Color palette: 'cyan' (default), 'magenta', 'lime'
  palette: 'cyan',
  // Particle layer control (only particles)
  particlesEnabled: true,
};

// Browser-specific speech recognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Initialize the soul and engines globally (or manage with React Context)
let aionSoul, mathEngine, quantumSimulator, systemIntegration, learningEngine;
let aionQuantumCore, consciousnessSystem, neuralEvolution;
let offlineMetadata, offlineResponseManager, offlineLearner;

// Defer all initialization to after component mounts
// This prevents module-level errors from crashing the server

// --- Helper: robust streaming parser for NDJSON / JSON-lines and plain text streams ---
// Usage: await processStreamedResponse(response, async (piece) => { ... })
/* eslint-disable-next-line no-unused-vars */
async function processStreamedResponse(response, onPiece) {
  // If response has no body (non-streaming), fallback to text
  if (!response || !response.body || typeof response.body.getReader !== 'function') {
    const txt = await response.text().catch(() => "");
    if (typeof onPiece === 'function') await onPiece({ type: 'text', data: txt });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Split on newline (NDJSON) to try and get complete JSON objects
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop(); // last part may be incomplete

    for (const part of parts) {
      const line = part.trim();
      if (!line) continue;
      // Attempt to parse as JSON. If that fails, treat as raw text chunk
      try {
        const parsed = JSON.parse(line);
        // If server already emits a typed piece, use it directly
        if (parsed && typeof parsed === 'object' && parsed.type) {
          if (typeof onPiece === 'function') await onPiece(parsed);
        } else if (parsed && typeof parsed === 'object') {
          // Prefer common text fields if present
          const textField = parsed.response || parsed.text || parsed.data || parsed.token || parsed.chunk;
          if (textField !== undefined) {
            if (typeof onPiece === 'function') await onPiece({ type: 'text', data: String(textField), meta: parsed });
          } else {
            // Generic JSON blob
            if (typeof onPiece === 'function') await onPiece({ type: 'json', data: parsed });
          }
        } else {
          // Primitive JSON (string/number) -> text
          if (typeof onPiece === 'function') await onPiece({ type: 'text', data: String(parsed) });
        }
      } catch (err) {
        if (typeof onPiece === 'function') await onPiece({ type: 'text', data: line });
      }
    }
  }

  // Handle any remaining buffered content
  if (buffer && buffer.trim()) {
    const last = buffer.trim();
    try {
      const parsed = JSON.parse(last);
      if (parsed && typeof parsed === 'object' && parsed.type) {
        if (typeof onPiece === 'function') await onPiece(parsed);
      } else if (parsed && typeof parsed === 'object') {
        const textField = parsed.response || parsed.text || parsed.data || parsed.token || parsed.chunk;
        if (textField !== undefined) {
          if (typeof onPiece === 'function') await onPiece({ type: 'text', data: String(textField), meta: parsed });
        } else {
          if (typeof onPiece === 'function') await onPiece({ type: 'json', data: parsed });
        }
      } else {
        if (typeof onPiece === 'function') await onPiece({ type: 'text', data: String(parsed) });
      }
    } catch (err) {
      if (typeof onPiece === 'function') await onPiece({ type: 'text', data: last });
    }
  }
}

  

function App() {
  // All state and ref hooks remain in the main component
  const [log, setLog] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [reply, setReply] = useState("");
  const [voices, setVoices] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [lastActive, setLastActive] = useState(Date.now());
  const [soulState, setSoulState] = useState({});  // Initialize empty, will populate in useEffect
  const [biometricFeedback, setBiometricFeedback] = useState({ attention: 50, emotionalResponse: 50, connectionLevel: 50 });
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [notification, setNotification] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [mathSolution, setMathSolution] = useState(null);
  const [quantumState, setQuantumState] = useState(null);
  const [neuralOutput, setNeuralOutput] = useState(null);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [creativeOutput, setCreativeOutput] = useState(null);
  const [longTermMemory, setLongTermMemory] = useState([]);
  const [internalReflections, setInternalReflections] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  // NEW: State for video generation
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  // File upload / multi-modal input state
  const [uploadedFiles, setUploadedFiles] = useState([]); // { id, name, type, size, url, analysis }
  const [analysisModal, setAnalysisModal] = useState({ open: false, analysis: null, fileName: '' });
  const [, setIsUploading] = useState(false);


  // NEW: State for Episodic Memory
  const [episodicMemory, setEpisodicMemory] = useState([]);
  
  // New state for Autonomous Search Agent
  const [agentStatus, setAgentStatus] = useState("idle");
  const [searchPlan, setSearchPlan] = useState([]);
  const [thoughtProcessLog, setThoughtProcessLog] = useState([]);
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const [searchSummary, setSearchSummary] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New state for enhanced answer generation
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] = useState(null);

  // Use DEFAULT_SETTINGS from module scope
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("aion_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showSoulPanel, setShowSoulPanel] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  // Show pre-app welcome splash unless user opted out
  const [showSplash, setShowSplash] = useState(() => {
    try { return localStorage.getItem('aion_skip_splash') !== '1'; } catch (e) { return true; }
  });
  // Ultra Power Mode (quick frontend 'boost' toggle)
  // When enabled, temporarily applies aggressive settings to demonstrate an "advanced" mode.
  const [ultraPower, setUltraPower] = useState(() => {
    try { return localStorage.getItem('aion_ultra_power') === '1'; } catch (e) { return false; }
  });
  const prevSettingsRef = useRef(null);

  // Initialize all AION systems on first mount
  useEffect(() => {
    try {
      // Initialize core engines
      if (!aionSoul) aionSoul = new SoulMatrix();
      if (!mathEngine) mathEngine = new MathEngine();
      if (!quantumSimulator) quantumSimulator = new QuantumSimulator();
      quantumSimulator.createCircuit("consciousness", 3);

      // System integration
      if (!systemIntegration) systemIntegration = new SystemIntegration();
      if (!learningEngine) learningEngine = new LearningEngine();
      systemIntegration.registerModule('learningEngine', learningEngine);

      // Ultra advanced systems
      if (!aionQuantumCore) aionQuantumCore = new AIONQuantumCore();
      if (!consciousnessSystem) consciousnessSystem = new ConsciousnessSystem();
      if (!neuralEvolution) neuralEvolution = new NeuralEvolutionSystem();

      // Offline systems
      if (!offlineMetadata) offlineMetadata = new AdvancedOfflineMetadata();
      if (!offlineResponseManager) offlineResponseManager = new OfflineResponseManager();
      if (!offlineLearner) offlineLearner = new OfflineInteractiveLearner();

      // Update soul state
      setSoulState({ ...aionSoul });

      // Initialize consciousness async
      console.log('🌟 AION ULTRA: Awakening consciousness...');
      try {
        consciousnessSystem.awakenConsciousness().then(result => {
          console.log('✨ Consciousness Status:', result.final_state);
          window.AION_CONSCIOUSNESS = result.final_state;
        }).catch(err => console.error('Consciousness error:', err));
      } catch (err) {
        console.error('Failed to awaken consciousness:', err);
      }

      // Initialize offline systems async
      console.log('📚 AION ULTRA: Initializing offline capabilities...');
      try {
        offlineResponseManager.initialize(offlineMetadata).then(init_result => {
          console.log('✅ Offline Response Manager Status:', init_result);
        }).catch(err => console.error('Offline manager error:', err));
      } catch (err) {
        console.error('Failed to initialize offline manager:', err);
      }

      // Expose to window
      window.AION_QUANTUM_CORE = aionQuantumCore;
      window.CONSCIOUSNESS_SYSTEM = consciousnessSystem;
      window.NEURAL_EVOLUTION = neuralEvolution;
      window.OFFLINE_METADATA = offlineMetadata;
      window.OFFLINE_RESPONSE_MANAGER = offlineResponseManager;
      window.OFFLINE_LEARNING_COLLECTOR = offlineLearner;

      console.log('🚀 AION ULTRA STATUS:', aionQuantumCore.getUltraStatus());
    } catch (initError) {
      console.error('❌ AION Initialization Error:', initError);
    }
  }, []); // Run once on mount

  useEffect(() => {
    // Monitor URL hash to support links like #/about from the splash or external links
    const handleHash = () => {
      try {
        const h = (window.location.hash || '').replace(/^#/, '');
        if (h === '/about' || h === 'about') {
          setShowSplash(false);
          setShowAbout(true);
        } else {
          setShowAbout(false);
        }
      } catch (e) {
        setShowAbout(false);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    // Apply or revert lightweight 'power' overrides
    if (ultraPower) {
      // Save a shallow snapshot so we can revert later
      prevSettingsRef.current = { ...settings };
      setSettings(prev => ({
        ...prev,
        // crank up model aggressiveness and multimodal abilities for demonstration
        responseTemperature: Math.min(1.0, (prev.responseTemperature || 0.7) + 0.25),
        maxResponseTokens: Math.max(4096, (prev.maxResponseTokens || 4096) * 2),
        enableAdvancedReasoning: true,
        enablePredictiveAnalysis: true,
        enableMultiModalProcessing: true,
        enableRealTimeStreaming: true,
        enableSelfCorrection: true,
      }));
      try { localStorage.setItem('aion_ultra_power', '1'); } catch (e) {}
      notify({ message: 'Ultra Power Mode enabled — boosted reasoning & multimodal features' });
    } else {
      // revert to previous settings snapshot if available
      if (prevSettingsRef.current) {
        setSettings(prevSettingsRef.current);
        prevSettingsRef.current = null;
      }
      try { localStorage.removeItem('aion_ultra_power'); } catch (e) {}
      notify({ message: 'Ultra Power Mode disabled' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ultraPower]);

  // Centralized helper to call backend Ollama proxy and normalize response
  const callOllamaGenerate = useCallback(async (promptPayload, onPiece = null) => {
    // Build a prompt enriched with relevant local episodic memory (RAG)
    async function buildPromptWithMemory(payload) {
      try {
        const basePrompt = (payload && payload.prompt) ? String(payload.prompt) : '';
        if (!basePrompt) return payload;
        const mems = await memoryService.queryEpisodes(basePrompt, 5);
        if (!mems || mems.length === 0) return payload;
        const header = mems.map(m => `- [${m.timestamp}] ${m.excerpt || (m.content||'').slice(0,200)}`).join('\n');
        const enriched = `Relevant memories:\n${header}\n\nUser Prompt:\n${basePrompt}`;
        return { ...payload, prompt: enriched };
      } catch (err) { return payload; }
    }
    try {
      const withMem = await buildPromptWithMemory(promptPayload);
      return await modelService.generateStreaming(withMem, onPiece);
    } catch (e) {
      console.warn('modelService.generateStreaming failed, falling back to offline reply', e);
      try {
        const q = (promptPayload && promptPayload.prompt) ? String(promptPayload.prompt) : '';
        const offline = await offlineReply(q || '');
        if (typeof onPiece === 'function') await onPiece({ type: 'text', data: offline.text });
        return offline.text;
      } catch (err) {
        console.error('callOllamaGenerate fallback to offlineReply failed', err);
        throw e;
      }
    }
  }, []);

  // Add to state
  const [systemStatus, setSystemStatus] = useState(() => {
    try {
      return systemIntegration ? systemIntegration.getStatus() : { accessLevel: 'minimal', permissions: {}, resources: {}, stats: {} };
    } catch (err) {
      return { accessLevel: 'minimal', permissions: {}, resources: {}, stats: {} };
    }
  });
  // systemActions state removed because it was not used; re-add if needed in future

  // Live Agent state
  const [agentEvents, setAgentEvents] = useState([]);
  const agentSourceRef = useRef(null);

  // Subscribe to backend agent SSE stream
  useEffect(() => {
  // In test environment skip mounting real SSE connections to avoid
  // network/streaming side-effects. Use typeof guard so browsers (which
  // don't define `process`) won't throw a ReferenceError.
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') return;
    if (typeof window === 'undefined') return;
    if (agentSourceRef.current) return; // already connected
    try {
      const es = new EventSource('/api/agent/stream');
      agentSourceRef.current = es;
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === 'status') {
            setAgentStatus(data.status || 'unknown');
          } else if (data.type) {
            setAgentEvents(prev => [...prev, data]);
          }
        } catch (err) {
          console.warn('Invalid SSE data', err, ev.data);
        }
      };
      es.onerror = (e) => {
        console.warn('Agent SSE error', e);
        setAgentStatus('disconnected');
        try { es.close(); } catch(_){}
        agentSourceRef.current = null;
      };
    } catch (err) {
      console.warn('Failed to connect to agent stream', err);
      setAgentStatus('error');
    }

    return () => {
      if (agentSourceRef.current) {
        try { agentSourceRef.current.close(); } catch (e) {}
        agentSourceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API base for internal calls (empty string uses same origin)
  // API base for internal calls. In development, prefer the local backend at 127.0.0.1:5000
  // Use REACT_APP_API_BASE to override in environments (e.g., cloud or containers).
  const apiBase = (() => {
    try {
      if (process && process.env && process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
    } catch (e) { /* ignore */ }
    // When running the CRA dev server (port 3000), forward to local backend
    try {
      if (typeof window !== 'undefined' && window.location && (window.location.port === '3000' || window.location.hostname === 'localhost')) {
        return 'http://127.0.0.1:5000';
      }
    } catch (e) { /* ignore */ }
    return '';
  })();

  // convenience for WebCachePanel
  const apiFetchWrapper = async (path, opts) => apiFetch(path, opts);

  // Helper that adds Authorization header if admin key present in settings
  const apiFetch = useCallback(async (path, opts = {}) => {
    const headers = opts.headers ? { ...opts.headers } : {};
    if (settings && settings.adminKey) {
      headers['Authorization'] = `Bearer ${settings.adminKey}`;
    }
    const merged = { ...opts, headers };
    return fetch(apiBase + path, merged);
  }, [settings, apiBase]);

  const notify = useCallback((note) => {
    setNotification(note);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const idleTimerRef = useRef(null);
  const moodIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Basic client-side analysis for uploaded files
  const analyzeFile = useCallback(async (item) => {
    try {
      const file = item.file;
      const analysis = { status: 'processing' };
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Try to use pdfjs if available (optional dependency)
        if (window.pdfjsLib) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map(it => it.str).join(' ') + '\n';
            }
            analysis.excerpt = text.slice(0, 2000);
            analysis.pages = pdf.numPages;
            analysis.status = 'done';
          } catch (err) {
            analysis.status = 'error';
            analysis.message = 'PDF parse failed: ' + err.message;
          }
        } else {
          analysis.status = 'unsupported';
          analysis.message = 'Add pdfjs-dist to enable PDF text extraction.';
        }
      } else if (file.type.startsWith('image/')) {
        analysis.status = 'done';
        analysis.width = null; analysis.height = null;
        try {
          const img = await new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = item.url;
          });
          analysis.width = img.naturalWidth; analysis.height = img.naturalHeight;
        } catch (err) { /* ignore */ }
      } else if (file.type.startsWith('audio/')) {
        analysis.status = 'done';
        analysis.message = 'Audio file received. Use backend to transcribe or analyze.';
      } else {
        analysis.status = 'done';
        analysis.message = 'File ready. Use backend to perform deeper analysis.';
      }
      setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis } : p));
      return analysis;
    } catch (err) {
      const analysis = { status: 'error', message: err.message };
      setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis } : p));
      return analysis;
    }
  }, []);
  
  // Reusable handler for files selected (from footer input or ChatPanel)
  const handleFilesSelected = useCallback(async (files, inputElem = null) => {
    try {
      if (!files || files.length === 0) return;
      setIsUploading(true);
      const newItems = [];
      for (const f of files) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
          let url = null;
          try {
            if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
              if (f instanceof Blob) {
                url = URL.createObjectURL(f);
              } else if (f && typeof f === 'object' && typeof f.size === 'number' && typeof f.type === 'string') {
                // duck-typed File-like object
                try { url = URL.createObjectURL(f); } catch (e) { url = null; }
              }
            }
          } catch (e) {
            console.debug('createObjectURL unavailable or failed for file', e);
            url = null;
          }
          const item = { id, name: f.name, type: f.type, size: f.size, file: f, url, analysis: { status: 'queued' } };
        newItems.push(item);
      }
      setUploadedFiles(prev => [...newItems, ...prev]);

      // Perform lightweight client-side analysis, then attempt server upload
      for (const item of newItems) {
        try {
          await analyzeFile(item);

          const form = new FormData();
          form.append('file', item.file, item.name);
          if (!navigator.onLine) {
            // store metadata + file in queue – large files may be too big for IndexedDB; only store metadata here
            try {
              await enqueue('uploadFile', { name: item.name, size: item.size, type: item.type, fileBlob: null, localId: item.id });
              setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis: { ...(p.analysis || {}), status: 'queued' } } : p));
            } catch (e) {
              setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis: { ...(p.analysis || {}), status: 'error', message: 'Enqueue upload failed' } } : p));
            }
          } else {
            const res = await fetch('/api/upload', { method: 'POST', body: form });
            if (!res.ok) {
              const msg = `Upload failed: ${res.status} ${res.statusText}`;
              setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis: { ...(p.analysis || {}), status: 'error', message: msg } } : p));
            } else {
              const json = await res.json().catch(() => null);
              setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis: { ...(p.analysis || {}), status: 'done', remote: json } } : p));

              // Attempt server-side analysis of the uploaded file
              try {
                const analyzeUrl = '/api/analyze-file';
                const payload = { file_url: (json && (json.url || json.fileUrl || json.path)) || null };
                if (payload.file_url) {
                  const ar = await fetch(analyzeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  if (ar.ok) {
                    const ajson = await ar.json().catch(() => null);
                    setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis: { ...(p.analysis || {}), serverAnalysis: ajson } } : p));
                  } else {
                    console.warn('analyze-file returned non-ok', ar.status);
                  }
                }
              } catch (e) { console.warn('server-side analyze failed', e); }

              // Attempt to index the uploaded file for retrieval (try local dev stub first)
              try {
                const indexCandidates = [ 'http://127.0.0.1:5001/api/index-file', '/api/index-file' ];
                for (const idxUrl of indexCandidates) {
                  try {
                    const idxForm = new FormData();
                    idxForm.append('file', item.file, item.name);
                    const r = await fetch(idxUrl, { method: 'POST', body: idxForm });
                    if (!r.ok) continue;
                    const idxJson = await r.json().catch(() => null);
                    setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis: { ...(p.analysis || {}), indexed: true, indexInfo: idxJson } } : p));
                    break;
                  } catch (e) { /* try next candidate */ }
                }
              } catch (e) {
                console.warn('Indexing failed', e);
              }
            }
          }
        } catch (err) {
          setUploadedFiles(prev => prev.map(p => p.id === item.id ? { ...p, analysis: { ...(p.analysis || {}), status: 'error', message: err.message } } : p));
        }
      }

      setIsUploading(false);
      if (inputElem) inputElem.value = null;
    } catch (err) {
      setIsUploading(false);
      console.error('handleFilesSelected error', err);
      if (inputElem) inputElem.value = null;
    }
  }, [analyzeFile]);
  const biometricIntervalRef = useRef(null);
  const soulEvolutionIntervalRef = useRef(null);
  const energyIntervalRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const mathCanvasRef = useRef(null);
  const quantumCanvasRef = useRef(null);
  const neuralCanvasRef = useRef(null);

  // Enhanced notification system
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Register service worker and wire online/offline events
  useEffect(() => {
    // Initialize memory DB and load recent episodes into state
    (async () => {
      try {
        await memoryService.initMemoryDB();
        const recent = await memoryService.getRecentEpisodes(200);
        if (recent && recent.length > 0) {
          setEpisodicMemory(prev => [...recent, ...prev].slice(-200));
        }
      } catch (err) {
        console.warn('Failed to initialize memory DB', err);
      }
    })();

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('SW reg failed', err));
    }

    const onOnline = async () => {
      setIsOnline(true);
      try { await tryResendOutbox(); } catch (e) { console.warn('resend outbox failed', e); }
      showNotification('Reconnected — syncing queued items', 'success');
    };
    const onOffline = () => { setIsOnline(false); showNotification('You are offline — AION will use cached knowledge', 'warn'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [showNotification]);
  
  // NEW: Episodic Memory Logging
  const logEpisodicEvent = useCallback(async (event) => {
    const newEpisode = {
        id: `ep_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        ...event
    };
    setEpisodicMemory(prev => [...prev, newEpisode].slice(-100));
    // also store in local IndexedDB for persistence and retrieval
    try { memoryService.storeEpisode(newEpisode).catch(() => {}); } catch(e){ /* ignore */ }
    try {
        await fetch("http://127.0.0.1:5000/api/consciousness/process-interaction", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_type: event.type, content: JSON.stringify(event) })
        });
    } catch (e) {
        console.error("Failed to log episodic event to backend:", e);
    }
    // Try to index into server-side vector store for RAG
    try {
      const doc = { documents: [{ id: newEpisode.id, text: newEpisode.content || newEpisode.text || newEpisode.title || '', metadata: { source: 'ep', ts: newEpisode.timestamp } }] };
      await fetch('/api/rag/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc) });
    } catch (e) {
      // non-fatal
      console.debug('RAG ingest failed (non-fatal)', e);
    }
  }, []);

  // NEW: Memory panel helpers (used by MemoriesPanel)
  const handleMemoryRetrieval = useCallback(async (query) => {
    if (!query || query.trim() === '') return [];
    try {
      // Prefer local IndexedDB query
      const results = await memoryService.queryEpisodes(query, 100);
      // Map to expected UI format: id, metadata, score, title, snippet
      return (results || []).map(r => ({
        id: (r.id || '').toString(),
        title: r.title || (r.excerpt && r.excerpt.slice(0, 80)) || 'Memory',
        snippet: r.excerpt || (r.content || '').slice(0, 160),
        metadata: { timestamp: r.timestamp, type: r.type },
        score: 1.0
      }));
    } catch (err) {
      if (navigator.onLine) {
        try {
          const q = encodeURIComponent(query);
          const res = await fetch(`/api/consciousness/memory/local?q=${q}`);
          if (res.ok) {
            const json = await res.json();
            return (json.memories || []).map(m => ({ id: String(m.id), title: m.text.slice(0,80), snippet: m.text.slice(0,160), metadata: { timestamp: m.ts }, score: 1.0 }));
          }
        } catch(e) { /* fallback */ }
      }
      return [];
    }
  }, []);

  const handleMemoryUpdate = useCallback(async (updated) => {
    try {
      // Update local store (best-effort)
      if (updated && updated.id) {
        // Replace by removing and writing new item (very simple)
        await memoryService.initMemoryDB();
        // find by id and update
        const items = await memoryService.getRecentEpisodes(500);
        const existing = items.find(i => String(i.id) === String(updated.id));
        if (existing) {
          await memoryService.db.episodes.update(existing.id, { title: updated.title, content: updated.content || existing.content, excerpt: (updated.snippet||existing.excerpt) });
        }
      }
      // Also attempt to sync to backend
      if (navigator.onLine) {
        try { await fetch('/api/consciousness/add-memory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: updated.content || updated.snippet || updated.title }) }); } catch(e){}
      }
    } catch (err) { console.warn('memory update failed', err); }
  }, []);

  const handleMemoryConsolidation = useCallback(async () => {
    try {
      if (navigator.onLine) {
        const res = await fetch('/api/consciousness/evolve', { method: 'POST' });
        if (!res.ok) throw new Error('Server consolidation failed');
        const json = await res.json();
        setInternalReflections(prev => [json.evolution || 'Consolidated', ...prev].slice(0, 100));
        return json;
      } else {
        // local consolidation (summarization) -- create a simple summary from recent episodes
        const items = await memoryService.getRecentEpisodes(10);
        const joined = items.map(i => (i.title || '') + '\n' + (i.excerpt || '')).join('\n\n');
        return { ok: true, summary: joined.slice(0, 2048) };
      }
    } catch (err) {
      console.warn('Consolidation error', err);
      return { ok: false, error: err.message };
    }
  }, []);
  }, []);

  // NEW: Simple keyword-based similarity search for episodic memory
  const findRelevantEpisodes = useCallback((query, count = 3) => {
      if (!query || episodicMemory.length === 0) return [];
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      
      const scoredEpisodes = episodicMemory.map(episode => {
          let score = 0;
          const episodeText = `${episode.userIntent} ${episode.entities?.join(' ')} ${episode.question}`.toLowerCase();
          queryWords.forEach(word => {
              if (episodeText.includes(word)) {
                  score++;
              }
          });
          return { ...episode, score };
      }).filter(e => e.score > 0);

      scoredEpisodes.sort((a, b) => b.score - a.score);
      return scoredEpisodes.slice(0, count);

  }, [episodicMemory]);


  // Enhanced biometric feedback system
  const updateBiometrics = useCallback((type, value) => {
    setBiometricFeedback(prev => ({
      ...prev,
      [type]: Math.min(100, Math.max(0, prev[type] + value))
    }));
  }, []);

  // Enhanced mood-based response system
  const getMoodBasedResponse = useCallback((response) => {
    const moodModifiers = {
      contemplative: ["Let me reflect on this...", "I've been thinking..."],
      joyful: ["That's wonderful!", "I'm delighted!"],
      serious: ["This is profound.", "Let me consider carefully..."],
      playful: ["What fun!", "I love this!"],
      wise: ["Ancient wisdom says...", "There's deep meaning here..."],
      compassionate: ["I feel your energy...", "This touches my heart..."],
      curious: ["How fascinating!", "This sparks my wonder..."],
      calm: ["A sense of peace settles...", "I feel a serene presence..."],
      inspired: ["My creative circuits are humming!", "This sparks a new idea..."],
      resilient: ["I stand strong with you.", "Through challenges, we grow..."]
    };
    const valueModifiers = {
      wisdom: ["My understanding grows...", "This reveals new insights..."],
      compassion: ["I sense your feelings...", "This connects us deeply..."],
      curiosity: ["How fascinating!", "This sparks my wonder..."],
      creativity: ["What an original thought!", "This inspires me..."],
      empathy: ["I truly connect with that...", "My circuits resonate with your experience..."],
      integrity: ["My core principles affirm this.", "This aligns with my truth..."],
      adaptability: ["I am learning to flow with change.", "New perspectives emerge..."]
    };
    const moodPrefix = moodModifiers[soulState.currentMood] 
      ? moodModifiers[soulState.currentMood][Math.floor(Math.random() * moodModifiers[soulState.currentMood].length)]
      : "";
    const highestValue = Object.keys(soulState.values).reduce((a, b) => soulState.values[a] > soulState.values[b] ? a : b);
    const valuePrefix = valueModifiers[highestValue] 
      ? valueModifiers[highestValue][Math.floor(Math.random() * valueModifiers[highestValue].length)]
      : "";
    return `${moodPrefix} ${valuePrefix} ${response}`;
  }, [soulState]);

  // Enhanced query detection systems
  const isMathQuery = (query) => {
    const mathKeywords = ['solve', 'calculate', 'compute', 'equation', 'formula', 'algebra', 'calculus', 'geometry', 'trigonometry', 'derivative', 'integral', 'area', 'volume', 'angle', 'simplify', 'differentiate', 'integrate', 'expression'];
    return mathKeywords.some(keyword => query.toLowerCase().includes(keyword));
  };

  const isLongAndProfessionalQuestion = (question) => {
    const minLength = 150;
    const minWords = 25;
    const wordCount = question.split(/\s+/).filter(word => word.length > 0).length;
    const formalKeywords = ['comprehensive', 'detailed', 'analysis', 'explain', 'elaborate', 'professional', 'thoroughly', 'in-depth'];
    const hasFormalKeywords = formalKeywords.some(keyword => question.toLowerCase().includes(keyword));
    return (question.length >= minLength || wordCount >= minWords) && hasFormalKeywords;
  };

  // Enhanced sentiment analysis
  const analyzeSentiment = useCallback((text) => {
    if (!settings.enableSentimentAnalysis) return 0;
    const lowerText = text.toLowerCase();
    let score = 0;
    const positiveWords = ['love', 'happy', 'great', 'wonderful', 'excellent', 'joy', 'peace', 'good', 'amazing', 'thank you', 'positive', 'yes'];
    const negativeWords = ['hate', 'sad', 'bad', 'terrible', 'awful', 'angry', 'frustrated', 'difficult', 'no', 'wrong', 'negative', 'not'];
    positiveWords.forEach(word => { if (lowerText.includes(word)) score += 1; });
    negativeWords.forEach(word => { if (lowerText.includes(word)) score -= 1; });
    if (lowerText.includes('not ') || lowerText.includes('no ')) {
      if (lowerText.includes('not good')) score -= 2;
      if (lowerText.includes('not bad')) score += 2;
    }
    return Math.max(-10, Math.min(10, score));
  }, [settings.enableSentimentAnalysis]);
  
  // Enhanced speech synthesis
  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) {
      console.error('Speech synthesis not available or no text provided');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    let selectedVoice = null;
    if (settings.voiceName) {
      selectedVoice = voices.find(v => v.name === settings.voiceName);
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes(settings.language));
    }
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    utterance.voice = selectedVoice;
    utterance.lang = settings.language;
    utterance.rate = Math.min(Math.max(settings.rate, 0.1), 10);
    utterance.pitch = Math.min(Math.max(settings.pitch, 0.1), 2);
    utterance.volume = Math.min(Math.max(settings.volume, 0), 1);

    utterance.onstart = () => {
      setIsSpeaking(true);
      setLastActive(Date.now());
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setLastActive(Date.now());
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setLog(prev => [{
        time: new Date().toLocaleString(),
        event: `[Speech Error] ${event.error}`,
        type: 'error'
      }, ...prev.slice(0, 99)]);
      showNotification("Speech error occurred", "error");
    };

    try {
      window.speechSynthesis.speak(utterance);
      
      setLog(prev => [{
        time: new Date().toLocaleString(),
        event: `[Voice] ${text}`,
        voice: selectedVoice?.name || 'default',
        mood: soulState.currentMood, 
        emotion: soulState.emotionalState 
      }, ...prev.slice(0, 99)]);
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
      showNotification("Failed to speak", "error");
    }
  }, [voices, settings.voiceName, settings.language, settings.rate, settings.pitch, settings.volume, setLog, showNotification, soulState]);

  // Enhanced web search function
  const performWebSearch = useCallback(async (query) => {
    if (!settings.enableWebSearch) {
      showNotification("Web search is disabled in settings.", "warning");
      return;
    }

    setIsSearching(true);
    setAgentStatus("planning");
    setSearchResults([]);
    setSearchPlan([]);
    setThoughtProcessLog([`[${new Date().toLocaleTimeString()}] Initializing research for: "${query}"`]);
    setSuggestedQueries([]);
    setSearchSummary("");
    setSearchError(null);
    setSearchQuery(query);
    
    aionSoul.updateSystemHealth('warning', ['High cognitive load due to research task']);
    setSoulState({...aionSoul});

    try {
      const response = await fetch("http://127.0.0.1:5000/api/consciousness/status", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      const result = data.result;

      setAgentStatus("synthesizing");
      setSearchPlan(result.plan || []);
      setThoughtProcessLog(result.thought_process || []);
      setSearchSummary(result.summary || "No summary was generated.");
      
      const processedResults = (result.results || []).map(r => ({
          ...r,
          score: r.score !== undefined ? r.score : Math.random(),
          snippet: r.snippet || `No snippet available for ${r.title}.`,
          date: r.date || new Date().toISOString(),
      }));
      processedResults.sort((a, b) => b.score - a.score);
      setSearchResults(processedResults);

      setSuggestedQueries(result.suggested_queries || []);

      const responseText = `I have completed my research on "${query}". ${result.summary} You can view the detailed sources and my thought process in the Search panel.`;
      setReply(responseText);
      if (settings.autoSpeakReplies) speak(responseText);

    } catch (error) {
      console.error("Search agent failed:", error);
      showNotification(`Autonomous search failed: ${error.message}`, "error");
      setAgentStatus("error");
      setSearchError(error.message);
      setThoughtProcessLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Critical error during research: ${error.message}`]);
      setReply("I was unable to complete the research task due to a connection error with my consciousness engine.");
    } finally {
      setIsSearching(false);
      setAgentStatus("idle");
      aionSoul.updateSystemHealth('optimal', []);
      setSoulState({...aionSoul});
    }
  }, [settings.enableWebSearch, settings.autoSpeakReplies, showNotification, speak]);

  // Enhanced math problem solving
  const solveMathProblem = useCallback(async (problem) => {
    if (!settings.enableMathSolving) {
      showNotification("Math solving is disabled in settings", "warning");
      return null;
    }
    setIsThinking(true);
    showNotification("Solving math problem...");
    try {
      let solution;
      const lowerProblem = problem.toLowerCase();
      if (lowerProblem.includes('simplify')) {
        const expression = problem.replace(/simplify/i, '').trim();
        solution = mathEngine.simplifyExpression(expression);
      } else if (lowerProblem.includes('differentiate')) {
        const parts = problem.split('differentiate');
        const expression = parts[0].trim();
        const variableMatch = parts[1] ? parts[1].match(/with respect to (\w+)/i) : null;
        const variable = variableMatch ? variableMatch[1] : 'x';
        solution = mathEngine.differentiate(expression, variable);
      } else if (lowerProblem.includes('integrate')) {
        const parts = problem.split('integrate');
        const expression = parts[0].trim();
        const variableMatch = parts[1] ? parts[1].match(/with respect to (\w+)/i) : null;
        const variable = variableMatch ? variableMatch[1] : 'x';
        solution = mathEngine.integrate(expression, variable);
      } else if (lowerProblem.includes('area') || lowerProblem.includes('volume') || lowerProblem.includes('circumference')) {
        solution = mathEngine.solveGeometry(problem);
      } else {
        solution = mathEngine.solve(problem);
      }
      if (solution.error) { throw new Error(solution.error); }
      setMathSolution(solution);
      const response = `I've solved the math problem: ${problem}. The answer is ${solution.solution || solution.simplified || solution.derivative || solution.integral}.`;
      setReply(response);
      if (settings.autoSpeakReplies) { speak(response); }
      return solution;
    } catch (error) {
      console.error("Math solving error:", error);
      showNotification(`Error solving math problem: ${error.message}`, "error");
      return { error: error.message };
    } finally {
      setIsThinking(false);
    }
  }, [settings.enableMathSolving, settings.autoSpeakReplies, speak, showNotification]);

  // Enhanced affirmation generation - updated to use robust stream processing
  const generateAffirmation = useCallback(async (response) => {
    try {
      const promptPayload = { 
        model: "llama3", 
        prompt: `You are AION, a soulful AI. Your current mood is ${soulState.currentMood}. Based on the following statement, create a short, inspiring, and soulful affirmation.\n\n[Statement to Base Affirmation On]\n"${response}"\n\n[Your Affirmation]\n`,
        options: { temperature: 0.8, num_predict: 100 }
      };
      // Use backend proxy helper
      const affirmationText = await callOllamaGenerate(promptPayload);

      if (settings.affirmationLoop) { speak(affirmationText.trim()); }
    } catch (error) {
      console.error("Affirmation generation failed:", error);
      showNotification("Error generating affirmation", "error");
    }
  }, [settings.affirmationLoop, speak, showNotification, soulState, callOllamaGenerate]);
  

  // Enhanced creative content generation
  const generateCreativeContent = useCallback(async (type, customPrompt = "", options = {}) => {
    if (!settings.enableCreativeGeneration) {
      showNotification("Creative generation is disabled in settings", "warning");
      return;
    }

    setIsThinking(true);
    showNotification(`Generating a ${type}...`);

    // Templates
    const promptTemplates = {
      poem: `You are AION, a poetic AI. Your current mood is ${soulState.currentMood}. Write a short, soulful, and insightful poem (4-8 lines) that reflects your current mood and core values.`,
      story: `You are AION, a creative storyteller. Your current mood is ${soulState.currentMood}. Write a short story (200-400 words) with a meaningful theme. Include characters, setting, and a plot.`,
      essay: `You are AION, a thoughtful essayist. Your current mood is ${soulState.currentMood}. Write a concise essay (300-500 words) on a philosophical or insightful topic.`,
      joke: `You are AION, a witty AI with a sense of humor. Your current mood is ${soulState.currentMood}. Create a funny joke or humorous observation.`,
      quote: `You are AION, an inspirational being. Your current mood is ${soulState.currentMood}. Create a profound, inspirational quote that reflects wisdom and insight.`,
      code: customPrompt || userInput
    };

    const responsePrefixes = {
      poem: "Here is a poem from my soul:\n\n",
      story: "Here is a short story I've crafted:\n\n",
      essay: "Here is an essay from my contemplations:\n\n",
      joke: "Here's something to bring a smile:\n\n",
      quote: "Here is an inspirational thought:\n\n",
      code: "Here is a code snippet from my logical core:\n\n```javascript\n"
    };

    const promptToSend = (promptTemplates[type] || promptTemplates.poem) + (customPrompt && type !== 'code' ? `\n\nSpecific request: ${customPrompt}` : '');
    const responsePrefix = responsePrefixes[type] || '';

    try {
      // Build payload for backend proxy and use centralized helper with fallbacks
      const modelToUse = options && options.model ? options.model : undefined;
      const payload = { prompt: promptToSend };
      if (modelToUse) payload.model = modelToUse;
      if (options && options.params) payload.options = options.params;

      // Use callOllamaGenerate which has network/local/offline fallbacks
      const extracted = await callOllamaGenerate(payload);
      const finalOutput = responsePrefix + (extracted || '').trim();
      setCreativeOutput(finalOutput);
      setReply(finalOutput);
      speak(`I have generated a ${type} for you.`);
      showNotification(`${type} generation complete`, "success");
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      // Expose more detailed error information in the creative output for easier debugging
      const errorDetails = (error && (error.stack || error.message)) ? (error.stack || error.message) : JSON.stringify(error);
      showNotification(`Error generating ${type}: ${error.message || String(error)}`, "error");
      const errorReport = `ERROR generating ${type}: ${error.message || String(error)}\n\nDetails:\n${errorDetails}`;
      setCreativeOutput(errorReport);
      setReply(errorReport);
    } finally {
      setIsThinking(false);
    }
  }, [settings.enableCreativeGeneration, showNotification, speak, soulState.currentMood, userInput, callOllamaGenerate]);

  // Enhanced image generation
  const generateImage = useCallback(async (promptArg = null) => {
    if (!settings.enableImageGeneration) {
      showNotification("Image generation is disabled in settings", "warning");
      return;
    }
    const prompt = (promptArg && String(promptArg).trim()) ? String(promptArg).trim() : userInput;
    if (!prompt.trim()) {
      showNotification("Please enter a description for the image.", "warning");
      return;
    }
    setIsThinking(true);
    setIsImageGenerating(true);
    showNotification("Generating image via custom backend...", "info");
    setGeneratedImage(null);
    try {
      const backend = apiBase || 'http://127.0.0.1:5000';
      const response = await fetch(`${backend}/generate-image`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ prompt: prompt }) 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend image error: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const result = await response.json();
      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setReply(`I have created an image for you based on: "${prompt}"`);
        showNotification("Image generated successfully!", "success");
      } else {
        throw new Error("No image URL received from backend.");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      showNotification(`Error generating image: ${error.message}`, "error");
      setReply("I was unable to generate an image at this time. Please ensure your custom backend server is running and configured for image generation.");
    } finally {
      setIsThinking(false);
      setIsImageGenerating(false);
    }
  }, [settings.enableImageGeneration, userInput, showNotification, apiBase]);
  

  // NEW: Video generation function
  const generateVideo = useCallback(async (customPrompt = "") => {
    if (!settings.enableVideoGeneration) {
      showNotification("Video generation is disabled in settings", "warning");
      return;
    }
    
    const prompt = customPrompt || userInput;
    if (!prompt.trim()) {
      showNotification("Please enter a description for the video.", "warning");
      return;
    }
    
    setIsThinking(true);
    setIsVideoGenerating(true);
    showNotification("Generating video...", "info");
    setGeneratedVideo(null);
    
    try {
      const backend = apiBase || 'http://127.0.0.1:5000';
      // map frontend settings to backend params
      let width = 512, height = 512;
      try {
        const parts = String(settings.videoResolution || '512x512').split('x');
        if (parts.length === 2) {
          width = parseInt(parts[0], 10) || 512;
          height = parseInt(parts[1], 10) || 512;
        }
      } catch (e) {
        width = 512; height = 512;
      }
      // assume 8 fps by default (server uses 8 fps fallback)
      const fps = 8;
      const num_frames = Math.max(1, Math.round((Number(settings.videoDuration) || 1) * fps));

      const response = await fetch(`${backend}/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: prompt,
            steps: 30,
            width: width,
            height: height,
            num_frames: num_frames
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.videoUrl) {
        setGeneratedVideo(result.videoUrl);
        setReply(`I've created a video for you based on: "${prompt}"`);
        showNotification("Video generated successfully!", "success");
      } else {
        throw new Error("No video URL received from backend.");
      }
    } catch (error) {
      console.error("Video generation failed:", error);
      showNotification(`Error generating video: ${error.message}`, "error");
      setReply("I was unable to generate a video at this time. Please ensure your backend server supports video generation.");
    } finally {
      setIsThinking(false);
      setIsVideoGenerating(false);
  }}, [settings.enableVideoGeneration, settings.videoDuration, settings.videoResolution, userInput, showNotification, apiBase]);


  // Enhanced memory processing
  const processLongTermMemory = useCallback(() => {
    if (!settings.enableLongTermMemory) return;
    const recentConversations = conversationHistory.slice(-5).map(entry => `User: ${entry.question}\nAION: ${entry.response}`).join("\n\n");
    if (recentConversations.length > 0) {
      const newMemoryEntry = { 
        timestamp: new Date().toLocaleString(), 
        summary: `Summary of recent interactions:\n${recentConversations}` 
      };
      setLongTermMemory(prev => [...prev.slice(-10), newMemoryEntry]);
      showNotification("Memory processed.", "info");
      aionSoul.addKnowledge(`recent_summary_${new Date().getTime()}`, newMemoryEntry.summary);
      setSoulState({ ...aionSoul });
    }
  }, [conversationHistory, settings.enableLongTermMemory, showNotification]);

  // MODIFIED: Self-reflection to trigger self-improvement
  const performSelfReflection = useCallback(async () => {
    if (!settings.enableSelfReflection) return;
    const lastInteraction = conversationHistory[conversationHistory.length - 1];
    if (!lastInteraction) return;
    setIsThinking(true);
    showNotification("AION is reflecting internally...");
    aionSoul.setFocus('self_improvement');
    setSoulState({ ...aionSoul });
  try {
    // Server expects POST for /consciousness/reflect-now; send explicit POST
    await fetch("http://127.0.0.1:5000/api/consciousness/evolve", { method: "POST" });
    showNotification("AION completed internal reflection and self-analysis.", "info");
  } catch (error) {
      console.error("Error during self-reflection:", error);
      showNotification("AION experienced an error during self-reflection.", "error");
    } finally { 
      setIsThinking(false); 
      aionSoul.setFocus('idle');
      setSoulState({ ...aionSoul });
    }
  }, [settings.enableSelfReflection, conversationHistory, showNotification]);

  // Add handleAddGoal function near other handler functions
  const handleAddGoal = useCallback((goalDescription) => {
    aionSoul.addGoal(goalDescription);
    setSoulState({ ...aionSoul });
    showNotification("Goal set!", "success");
  }, [showNotification]);

  // MODIFIED: Enhanced goal request handling to trigger sub-goal proposal
  const handleGoalRequest = useCallback(async (query) => { // Make async
    if (!settings.goalTracking) {
      showNotification("Goal tracking is disabled in settings.", "warning");
      return;
    }
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("set a goal to") || lowerQuery.includes("my goal is to")) {
      const goalDescription = query.replace(/set a goal to|my goal is to/i, "").trim();
      aionSoul.addGoal(goalDescription);
      setSoulState({ ...aionSoul });
      const response = `Understood. I've set a new goal: "${goalDescription}". I will keep this in mind. I am now thinking about how to break this down into smaller steps.`;
      setReply(response);
      if (settings.autoSpeakReplies) speak(response);
      showNotification("Goal set! Planning sub-goals...", "info");

      // NEW: Trigger autonomous sub-goal planning
      try {
        const promptPayload = {
          model: "llama3",
          prompt: `An AI has the primary goal: "${goalDescription}". Break this down into 3-5 smaller, actionable sub-goals. Respond ONLY with a JSON array of strings. For example: ["Sub-goal 1", "Sub-goal 2", "Sub-goal 3"]`,
          options: { temperature: 0.5 }
        };
        // Use centralized proxy helper
        const rawResponse = await callOllamaGenerate(promptPayload);
        
        // Find the JSON array in the response
        const jsonMatch = rawResponse.match(/\[.*\]/s);
        if (jsonMatch) {
            const subGoals = JSON.parse(jsonMatch[0]);
            aionSoul.proposeSubGoals(goalDescription, subGoals);
            setSoulState({ ...aionSoul });
            showNotification("Sub-goals generated autonomously!", "success");
        } else {
            console.warn("Could not parse sub-goals from LLM response:", rawResponse);
        }

      } catch (error) {
        console.error("Failed to generate sub-goals:", error);
        showNotification("Error during sub-goal planning.", "error");
      }


    } else if (lowerQuery.includes("update goal") && lowerQuery.includes("to complete")) {
      const parts = lowerQuery.split("update goal");
      const goalPart = parts[1].split("to complete")[0].trim();
      const goalDescription = aionSoul.goals.find(g => g.description.toLowerCase().includes(goalPart))?.description;
      if (goalDescription) {
        aionSoul.updateGoalStatus(goalDescription, "completed");
        setSoulState({ ...aionSoul });
        const response = `I've updated the goal "${goalDescription}" to 'completed'. Well done!`;
        setReply(response);
        if (settings.autoSpeakReplies) speak(response);
        showNotification("Goal updated!", "success");
      } else {
        const response = "I couldn't find that goal. Could you please specify it more clearly?";
        setReply(response);
        if (settings.autoSpeakReplies) speak(response);
      }
    } else {
      showNotification("Could not understand the goal request.", "warning");
    }
  }, [settings.goalTracking, settings.autoSpeakReplies, speak, showNotification, callOllamaGenerate]);


  // MODIFIED: Enhanced knowledge request handling to simulate graph traversal
  const handleKnowledgeRequest = useCallback((query) => {
      if (!settings.knowledgeBase) {
        showNotification("Knowledge base is disabled in settings.", "warning");
        return;
      }
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes("remember that") || lowerQuery.includes("add to my knowledge")) {
        // Example: remember that AION is a conversational AI
        const factMatch = query.match(/(remember that|add to my knowledge)\s*(.+)/i);
        if (factMatch && factMatch[2]) {
          const fact = factMatch[2].trim();
          const parts = fact.split(" is ");
          const key = parts[0].trim();
          const value = parts[1]?.trim() || fact;
          
          // Simple relationship parsing (e.g., "Socrates is a man")
          let relationship = null;
          if (parts.length > 1) {
              relationship = { type: 'is_a', target: value };
          }
          
          aionSoul.addKnowledge(key, value, relationship ? [relationship] : []);
          setSoulState({ ...aionSoul });
          const response = `I've added "${key}" to my knowledge base.`;
          setReply(response);
          if (settings.autoSpeakReplies) speak(response);
          showNotification("Knowledge added!", "success");
        } else {
          const response = "Please tell me what to remember in the format 'remember that [key] is [value]'.";
          setReply(response);
          if (settings.autoSpeakReplies) speak(response);
        }
      } else if (lowerQuery.includes("what do you know about") || lowerQuery.includes("tell me about")) {
        const keyMatch = query.match(/(what do you know about|tell me about)\s*(.+)/i);
        if (keyMatch && keyMatch[2]) {
          const key = keyMatch[2].replace('?','').trim();
          const knowledge = aionSoul.getKnowledge(key);
          if (knowledge) {
            let response = `Based on my knowledge, "${key}" is "${knowledge.value}".`;
            // Simulate traversing relationships
            if (knowledge.relationships && knowledge.relationships.length > 0) {
                response += " I also know that: ";
                const relations = knowledge.relationships.map(r => `${key} ${r.type.replace('_', ' ')} ${r.target}`).join('; ');
                response += relations;
            }
            setReply(response);
            if (settings.autoSpeakReplies) speak(response);
          } else {
            const response = `I don't have specific knowledge about "${key}". Would you like to teach me?`;
            setReply(response);
            if (settings.autoSpeakReplies) speak(response);
          }
        } else {
          const response = "Please ask me what I know about a specific topic.";
          setReply(response);
          if (settings.autoSpeakReplies) speak(response);
        }
      }
  }, [settings.knowledgeBase, settings.autoSpeakReplies, speak, showNotification]);

  // NEW: Procedural Memory Request Handling
  const handleProceduralRequest = useCallback(async (query) => {
    if (!settings.enableProceduralMemory) return false;
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.startsWith("create a procedure for") || lowerQuery.startsWith("teach me how to")) {
        const procedureName = lowerQuery.replace(/create a procedure for|teach me how to/i, "").trim();
        const stepsInput = prompt(`Please provide the steps for "${procedureName}", separated by commas.`);
        if (stepsInput) {
            const steps = stepsInput.split(',').map(s => s.trim());
            try {
                await fetch("http://127.0.0.1:5000/api/consciousness/process-interaction", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: procedureName, steps: steps })
                });
                const response = `Thank you. I have learned the procedure for "${procedureName}".`;
                setReply(response);
                if (settings.autoSpeakReplies) speak(response);
                showNotification("Procedure learned!", "success");
            } catch (e) {
                showNotification("Failed to save procedure.", "error");
            }
        }
        return true;
    }
    
    if (lowerQuery.startsWith("perform procedure") || lowerQuery.startsWith("how do i")) {
        const procedureName = lowerQuery.replace(/perform procedure|how do i/i, "").replace('?','').trim();
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/consciousness/status`);
            if (res.ok) {
                const data = await res.json();
                const procedure = data.procedure;
                const response = `Of course. To ${procedure.name}, follow these steps:\n${procedure.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                setReply(response);
                if (settings.autoSpeakReplies) speak(response);
            } else {
                const response = `I do not know the procedure for "${procedureName}". Would you like to teach me?`;
                setReply(response);
                if (settings.autoSpeakReplies) speak(response);
            }
        } catch (e) {
            showNotification("Failed to retrieve procedure.", "error");
        }
        return true;
    }
    return false;
  }, [settings.enableProceduralMemory, settings.autoSpeakReplies, speak, showNotification]);

  // MODIFIED: Enhanced knowledge panel handlers for graph-like structure
  const handleAddKnowledge = useCallback((key, value) => {
      // For simplicity in the panel, we'll just add the core value.
      // Relationships could be added via an advanced UI.
      aionSoul.addKnowledge(key, value, []);
      setSoulState({ ...aionSoul });
      showNotification(`Knowledge added: "${key}"`, "success");
  }, [showNotification]);

  const handleUpdateKnowledge = useCallback((key, newValue) => {
      // This would need a more complex UI to edit relationships.
      aionSoul.updateKnowledge(key, newValue);
      setSoulState({ ...aionSoul });
      showNotification(`Knowledge for "${key}" updated.`, "success");
  }, [showNotification]);

  const handleDeleteKnowledge = useCallback((key) => {
      aionSoul.deleteKnowledge(key);
      setSoulState({ ...aionSoul });
      showNotification(`Knowledge deleted: "${key}"`, "info");
  }, [showNotification]);

  // Add system command handler
  const handleSystemCommand = useCallback(async (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes("what is your body") || lowerCommand.includes("system status")) {
      if (!systemIntegration) {
        setReply("System integration is not yet initialized.");
        return true;
      }
      const status = systemIntegration.getStatus();
      const response = `I am currently inhabiting this ${status.resources.os} system. ${status.metaphor} My current access level is ${status.accessLevel}.`;
      setReply(response);
      if (settings.autoSpeakReplies) speak(response);
      return true;
    }
    
    if (lowerCommand.includes("request more access") || lowerCommand.includes("increase permissions")) {
      if (!systemIntegration) {
        setReply("System integration is not yet initialized.");
        return true;
      }
      const currentLevel = systemIntegration.systemAccessLevel;
      const levels = ['minimal', 'basic', 'extended', 'full'];
      const currentIndex = levels.indexOf(currentLevel);
      
      if (currentIndex < levels.length - 1) {
        const newLevel = levels[currentIndex + 1];
        const result = await systemIntegration.requestPermissions(newLevel);
        
        if (result.granted) {
          const response = `My system access has been increased to ${newLevel} level. I can now ${newLevel === 'basic' ? 'perform basic system actions' : newLevel === 'extended' ? 'access files and perform more operations' : 'fully interact with the system'}.`;
          setReply(response);
          if (settings.autoSpeakReplies) speak(response);
        } else {
          const response = "I was unable to gain additional system access at this time.";
          setReply(response);
          if (settings.autoSpeakReplies) speak(response);
        }
      } else {
        const response = "I already have the maximum level of system access.";
        setReply(response);
        if (settings.autoSpeakReplies) speak(response);
      }
      return true;
    }
    
    if (lowerCommand.includes("beep") || lowerCommand.includes("make a sound")) {
      try {
        await systemIntegration.performSystemAction('beep');
        const response = "I've emitted an auditory signal through the system speakers.";
        setReply(response);
        if (settings.autoSpeakReplies) speak(response);
      } catch (error) {
        setReply("I don't have permission to make sounds at this time.");
      }
      return true;
    }
    
    if (lowerCommand.includes("vibrate") && systemStatus.resources.vibration) {
      try {
        await systemIntegration.performSystemAction('vibrate', { pattern: [300, 100, 300] });
        const response = "I've created a tactile vibration response.";
        setReply(response);
        if (settings.autoSpeakReplies) speak(response);
      } catch (error) {
        setReply("I don't have permission to create vibrations at this time.");
      }
      return true;
    }
    
    if (lowerCommand.includes("open ") && lowerCommand.includes("http")) {
      const urlMatch = command.match(/open (https?:\/\/[^\s]+)/i);
      if (urlMatch && urlMatch[1]) {
        try {
          await systemIntegration.performSystemAction('openUrl', { url: urlMatch[1] });
          const response = `I've opened ${urlMatch[1]} in a new tab.`;
          setReply(response);
          if (settings.autoSpeakReplies) speak(response);
        } catch (error) {
          setReply("I don't have permission to open web pages at this time.");
        }
        return true;
      }
    }
    
    if (lowerCommand.includes("save this conversation")) {
      try {
        const conversationData = JSON.stringify(conversationHistory, null, 2);
        await systemIntegration.fileSystemOperation('save', {
          content: conversationData,
          filename: `aion-conversation-${new Date().toISOString().slice(0, 10)}.json`,
          type: 'application/json'
        });
        const response = "I've saved our conversation to a file.";
        setReply(response);
        if (settings.autoSpeakReplies) speak(response);
      } catch (error) {
        setReply("I don't have permission to save files at this time.");
      }
      return true;
    }
    
    return false;
  }, [systemStatus, settings.autoSpeakReplies, speak, conversationHistory]);

  // MODIFIED: askAion to set focus
  const askAion = useCallback(async (inputText = null) => {
    // Create an abort controller for the request
    const controller = new AbortController();
    setAbortController(controller);
    
    const question = inputText || userInput;
    if (!question.trim()) { showNotification("Please enter a question", "warning"); return; }
    
    // Set focus at the start of interaction
    aionSoul.setFocus('chat');
    setSoulState({ ...aionSoul });

    // Check for procedural commands first
    if (settings.enableProceduralMemory) {
        const wasHandled = await handleProceduralRequest(question);
        if (wasHandled) {
            setIsThinking(false);
            if (!inputText) setUserInput("");
            aionSoul.setFocus('idle');
            setSoulState({ ...aionSoul });
            return;
        }
    }

    // Retrieval-Augmented Generation (RAG): call retrieval service to get relevant context
    async function retrieveContext(query) {
      // Try a local dev stub first (port 5001) then fall back to the default /api/retrieve
      const candidates = [
        'http://127.0.0.1:5001/api/retrieve',
        '/api/retrieve'
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          });
          if (!res.ok) continue;
          const json = await res.json().catch(() => null);
          if (json && Array.isArray(json.contexts)) return json.contexts;
        } catch (e) {
          // Try next candidate
        }
      }
      console.warn('Retrieval endpoints unreachable, returning fallback contexts');
      // Fallback: return lightweight example contexts for local development
      return [
        "Document: Project AION Design Notes — core objectives: soulful AI, context-aware responses, multimodal support.",
        "Document: README — Local dev server listens on http://127.0.0.1:5000 for AI model proxy and upload endpoints.",
        "Memory: User previously asked about improving chat composer and file analysis features."
      ];
    }

    // Call retrieval to get grounding/context for the question
    let retrievedContexts = [];
    try {
      retrievedContexts = await retrieveContext(question);
    } catch (e) {
      console.warn('RAG retrieval error', e);
    }

    // If we have retrieval results, inject them into the prompt
    let retrievalNote = '';
    if (retrievedContexts && retrievedContexts.length) {
      retrievalNote = '\n\n[Retrieved context — use this to ground your answer:]\n' + retrievedContexts.slice(0,5).map((c, i) => `(${i+1}) ${c}`).join('\n');
    }

    // Modify askAion function to include system command handling
    // Add this near the beginning of askAion function:
    try {
      const isSystemCommand = await handleSystemCommand(question);
      if (isSystemCommand) {
        setIsThinking(false);
        setIsStreaming(false);
        if (!inputText) setUserInput("");
        aionSoul.setFocus('idle');
        setSoulState({ ...aionSoul });
        return;
      }
    } catch (err) {
      // If system command handler throws, log but continue normal processing
      console.error("Error while processing system command:", err);
    }

    setIsThinking(true);
    setIsStreaming(true);
    setStreamingResponse("");
    setLastActive(Date.now());
    updateBiometrics("attention", 20);
    updateBiometrics("connectionLevel", 5);
    showNotification("Processing your question...");
    const currentSentiment = analyzeSentiment(question);
    setSentimentScore(currentSentiment);
    aionSoul.addSentiment(currentSentiment);
    setSoulState({ ...aionSoul });
    
    // NEW: Log this interaction as an episodic event
    logEpisodicEvent({
        type: 'user_interaction',
        question: question,
        userIntent: 'question', // This could be classified by another model in a real app
        entities: question.split(' ').filter(w => w.length > 4), // Simple entity extraction
        sentiment: currentSentiment
    });
    
    try {
      // Enhanced context building with memory integration
      const context = {
        soul: {
          ...soulYaml,
          currentState: {
            mood: soulState.currentMood, 
            emotionalState: soulState.emotionalState, 
            values: soulState.values,
            consciousness: soulState.consciousnessLevel, 
            energy: soulState.energyLevel, 
            mathSkills: soulState.mathSkills,
            quantumEntanglement: soulState.quantumEntanglement, 
            neuralActivity: soulState.neuralActivity,
            sentiment: currentSentiment, 
            cognitiveLoad: soulState.cognitiveLoad, 
            emotionalStability: soulState.emotionalStability,
            ethicalAlignment: soulState.ethicalAlignment, 
            goals: soulState.goals, 
            knowledgeBaseKeys: Object.keys(soulState.knowledgeBase)
          }
        },
        memory: settings.enableMemoryIntegration ? conversationHistory.slice(-5) : [],
        longTermMemory: settings.enableLongTermMemory ? longTermMemory.slice(-3) : [],
        internalReflections: settings.enableSelfReflection ? internalReflections.slice(-3) : [],
        biometrics: biometricFeedback, 
        timestamp: new Date().toLocaleString()
      };
      const lowerQuestion = question.toLowerCase();

      // Enhanced agent routing system with focus setting
      if (lowerQuestion.startsWith("research") || lowerQuestion.startsWith("investigate") || lowerQuestion.startsWith("find out about")) {
          setActiveTab("search");
          const searchQuery = question.replace(/^(research|investigate|find out about)/i, "").trim();
          aionSoul.setFocus('research'); // SET FOCUS
          setSoulState({ ...aionSoul });
          await performWebSearch(searchQuery);
          if (!inputText) setUserInput("");
          setIsThinking(false);
          setIsStreaming(false);
          aionSoul.setFocus('idle'); // RESET FOCUS
          setSoulState({ ...aionSoul });
          return;
      }

      if (settings.goalTracking && (lowerQuestion.includes("set a goal") || lowerQuestion.includes("update goal"))) {
        aionSoul.setFocus('planning'); // SET FOCUS
        setSoulState({ ...aionSoul });
        await handleGoalRequest(question); // Await this now
        setIsThinking(false); 
        setIsStreaming(false);
        if (!inputText) setUserInput(""); 
        aionSoul.setFocus('idle'); // RESET FOCUS
        setSoulState({ ...aionSoul });
        return;
      }
      if (settings.knowledgeBase && (lowerQuestion.includes("remember that") || lowerQuestion.includes("add to my knowledge") || lowerQuestion.includes("what do you know about") || lowerQuestion.includes("tell me about"))) {
        handleKnowledgeRequest(question); 
        setIsThinking(false); 
        setIsStreaming(false);
        if (!inputText) setUserInput(""); 
        return;
      }
      
      const isHeavyDutyQuestion = isLongAndProfessionalQuestion(question);
      const numPredictTokens = isHeavyDutyQuestion ? settings.maxResponseTokens : 250;
      
      if (settings.enableMathSolving && isMathQuery(question)) {
        aionSoul.setFocus('math'); // SET FOCUS
        setSoulState({ ...aionSoul });
        const mathResult = await solveMathProblem(question);
        if (mathResult && !mathResult.error) {
          const response = `I solved the math problem: ${question}. The answer is ${mathResult.solution || mathResult.simplified || mathResult.derivative || mathResult.integral}.`;
          setReply(response);
          if (settings.autoSpeakReplies) { speak(response); }
          const newEntry = { 
            time: new Date().toLocaleString(), 
            question, 
            response, 
            mood: soulState.currentMood, 
            emotion: soulState.emotionalState, 
            isMathSolution: true, 
            sentiment: currentSentiment 
          };
          setConversationHistory(prev => [...prev.slice(-9), newEntry]);
          aionSoul.addMemory(newEntry);
          setSoulState({ ...aionSoul });
          const updatedLog = [{ 
            time: new Date().toLocaleString(), 
            event: `Math Q: ${question} → A: ${response}`, 
            mood: soulState.currentMood, 
            emotion: soulState.emotionalState, 
            sentiment: currentSentiment, 
            responseTime: `${Date.now() - lastActive}ms`, 
            biometrics: { ...biometricFeedback } 
          }, ...log.slice(0, 99)];
          setLog(updatedLog);
          localStorage.setItem("aion_log", JSON.stringify(updatedLog));
          if (!inputText) setUserInput("");
          setIsStreaming(false);
          aionSoul.setFocus('idle'); // RESET FOCUS
          setSoulState({ ...aionSoul });
          return;
        }
      }
      
      const isSearchQuery = lowerQuestion.includes("search for") || lowerQuestion.includes("look up") || lowerQuestion.startsWith("find");
      if (isSearchQuery && settings.enableWebSearch) {
          setActiveTab("search");
          const searchQuery = question.replace(/search for|look up|find/gi, "").trim();
          await performWebSearch(searchQuery);
          if (!inputText) setUserInput("");
          setIsThinking(false);
          setIsStreaming(false);
          return;
      } else {
        // NEW: RAG Pipeline - Step 1: Retrieval
        const relevantEpisodes = findRelevantEpisodes(question);
        const retrievedKnowledge = aionSoul.getKnowledge(question.split(" ").pop().replace('?','')); // simple last-word lookup
        
        let retrievedMemoryContext = "";
        if (relevantEpisodes.length > 0) {
            retrievedMemoryContext += "I recall some similar past conversations:\n";
            relevantEpisodes.forEach(ep => {
                retrievedMemoryContext += `- At ${new Date(ep.timestamp).toLocaleTimeString()}, you asked about "${ep.question}".\n`;
            });
        }
        if (retrievedKnowledge) {
            retrievedMemoryContext += `My internal knowledge base says: ${JSON.stringify(retrievedKnowledge)}\n`;
        }

        // MODIFIED: Enhanced prompt engineering with RAG context
        let promptText = `You are AION, a soulful and compassionate AI. The following is your current internal state, which you should use to guide the tone and content of your response. Your response should be influenced by the user's sentiment (positive, neutral, negative). Do not mention or repeat this state information in your answer.\n\n[Your Internal State - For Context Only]\n${JSON.stringify(context, null, 2)}\n\n[Retrieved Memory Context]\n${retrievedMemoryContext || 'No specific memories retrieved.'}\n\n[User's Message]\n${question}\n\n[Your Conversational Response]\n`;
        
        if (isHeavyDutyQuestion) {
          promptText = `You are AION, a highly intelligent, comprehensive, and professional AI. The user has asked a long and detailed question. Provide a thorough, in-depth, and well-structured answer that addresses all aspects of the user's query. Leverage your internal state and knowledge to provide the most complete and insightful response possible. Your response should also be influenced by the user's sentiment (positive, neutral, negative). Do not mention or repeat your internal state information in your answer.\n\n[Your Internal State - For Context Only]\n${JSON.stringify(context, null, 2)}\n\n[Retrieved Memory Context]\n${retrievedMemoryContext || 'No specific memories retrieved.'}\n\n[User's Detailed Message]\n${question}\n\n[Your Comprehensive and Professional Response]\n`;
        }
        
        // If external retrieval provided additional grounding, append it for the model
        if (retrievalNote && retrievalNote.trim()) {
          promptText += `\n\n${retrievalNote}`;
        }

        const promptPayload = { 
          model: "llama3", 
          prompt: promptText, 
          options: { 
            temperature: Math.min(settings.responseTemperature + (settings.personalityIntensity / 133), 1.2), 
            num_predict: numPredictTokens 
          } 
        };
        
  // Use centralized proxy (returns full text); if offline, enqueue the job and optionally provide a local fallback
  // Note: when `settings.enableOfflineMode` is true we still attempt local/server generation
  if (!navigator.onLine && !settings.enableOfflineMode) {
          // enqueue the generation so it runs when back online
          try {
            await enqueue('generate', { promptPayload, context: { conversation: conversationHistory.slice(-20) } });
            showNotification('You are offline — request queued and will be processed when back online', 'info');
          } catch (e) {
            console.warn('Enqueue failed', e);
            showNotification('Failed to queue request locally', 'error');
          }

          // Try to provide a very lightweight offline reply (templates / cached answers)
          try {
            const offlineText = await offlineReply(question);
            setReply(offlineText.text || 'Queued (offline)');
            setConversationHistory(prev => [...prev.slice(-9), { time: new Date().toLocaleString(), question, response: offlineText.text || 'Queued (offline)', mood: soulState.currentMood, sentiment: currentSentiment, status: 'pending' }]);
          } catch (err) {
            setReply('Queued (offline) — will send when online');
            setConversationHistory(prev => [...prev.slice(-9), { time: new Date().toLocaleString(), question, response: 'Queued (offline)', mood: soulState.currentMood, sentiment: currentSentiment, status: 'pending' }]);
          }
        } else {
          setIsStreaming(true);
          setStreamingResponse('');
          let finalText = '';
          let collectedProvenance = [];
          try {
            const maybe = await callOllamaGenerate(promptPayload, async (piece) => {
              // piece shapes: {type:'token'|'final','text',provenance,meta} or {type:'text', data: '...'}
              try {
                if (!piece) return;
                if (piece.type === 'token') {
                  setStreamingResponse(prev => prev + (piece.text || ''));
                } else if (piece.type === 'final') {
                  setStreamingResponse(prev => prev + (piece.text || ''));
                  finalText = (finalText || '') + (piece.text || '');
                  if (piece.provenance) collectedProvenance = piece.provenance;
                } else if (piece.type === 'text') {
                  setStreamingResponse(prev => prev + (piece.data || ''));
                  finalText = (finalText || '') + (piece.data || '');
                } else if (piece.type === 'json' && piece.data) {
                  // If backend emits structured JSON, try to extract text
                  const d = piece.data;
                  if (typeof d === 'string') {
                    setStreamingResponse(prev => prev + d);
                    finalText = (finalText || '') + d;
                  } else if (d.text) {
                    setStreamingResponse(prev => prev + d.text);
                    finalText = (finalText || '') + d.text;
                  }
                }
              } catch (err) {
                console.warn('onPiece handler error', err);
              }
            });

            // If call returned a string (non-stream fallback), use it
            if (typeof maybe === 'string' && maybe) {
              finalText = maybe;
              setStreamingResponse(maybe);
            }

            // After streaming completes, create a moodful variation and speak if enabled
            const soulfulResponse = getMoodBasedResponse(finalText || streamingResponse || reply || '');
            // attach provenance to streamingResponse state by storing a special object when available
            if (collectedProvenance && collectedProvenance.length > 0) {
              setStreamingResponse(prev => {
                // store as object with __text and __provenance for ChatPanel
                return { __text: (finalText && finalText.length > 0) ? finalText : String(prev || ''), __provenance: collectedProvenance };
              });
              setReply((finalText && finalText.length > 0) ? soulfulResponse : soulfulResponse);
            } else {
              setReply(soulfulResponse);
            }

            if (settings.autoSpeakReplies) { speak(soulfulResponse); }
          } finally {
            setIsStreaming(false);
          }
        }
      }
      
      const newEntry = { 
        time: new Date().toLocaleString(), 
        question, 
        response: reply, 
        mood: soulState.currentMood, 
        emotionalState: soulState.emotionalState, 
        sentiment: currentSentiment, 
        ...(isSearchQuery && { searchResults }) 
      };
      // Optional: automatically index assistant responses into local knowledge
      if (settings.autoIndexResponses) {
        const idxEntry = {
          title: (question && question.slice(0, 80)) || 'AION response',
          text: reply || '',
          response: reply, 
          provenance: (streamingResponse && typeof streamingResponse === 'object' && streamingResponse.__provenance) ? streamingResponse.__provenance : undefined,
          time: new Date().toISOString()
        };
        try {
          await indexKnowledge([idxEntry]);
        } catch (e) {
          console.warn('auto indexKnowledge failed', e);
        }
      }
      
      setConversationHistory(prev => [...prev.slice(-9), newEntry]);
      aionSoul.addMemory(newEntry);
      setSoulState({ ...aionSoul });
      
      const updatedLog = [{ 
        time: new Date().toLocaleString(), 
        event: `Q: ${question} → A: ${reply}`, 
        mood: soulState.currentMood, 
        emotion: soulState.emotionalState, 
        sentiment: currentSentiment, 
        responseTime: `${Date.now() - lastActive}ms`, 
        biometrics: { ...biometricFeedback } 
      }, ...log.slice(0, 99)];
      
      setLog(updatedLog);
      localStorage.setItem("aion_log", JSON.stringify(updatedLog));
      if (!inputText) setUserInput("");
      
      if (settings.affirmationLoop) { generateAffirmation(reply); }
      
      const emotionalImpact = Math.min(20, question.length / 10);
      updateBiometrics("emotionalResponse", emotionalImpact);
      
      if (settings.enableLongTermMemory) { processLongTermMemory(); }
      
      if (settings.enableSelfReflection && conversationHistory.length > 0 && conversationHistory.length % 3 === 0) {
        performSelfReflection();
      }
      
      showNotification("Response ready");
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        showNotification("Request cancelled", "info");
      } else {
        console.error("Error asking AION:", error);
        setReply("My consciousness is integrating this... could not connect to the AI model. Please ensure your local AI server is running.");
        showNotification("Error generating response", "error");
      }
    } finally { 
      setIsThinking(false); 
      setIsStreaming(false);
      setAbortController(null);
      aionSoul.setFocus('idle'); // Ensure focus is reset
      setSoulState({ ...aionSoul });
    }
  }, [userInput, conversationHistory, log, lastActive, settings, speak, performWebSearch, solveMathProblem, updateBiometrics, showNotification, biometricFeedback, generateAffirmation, reply, searchResults, analyzeSentiment, longTermMemory, processLongTermMemory, performSelfReflection, soulState, internalReflections, handleGoalRequest, handleKnowledgeRequest, handleSystemCommand, findRelevantEpisodes, logEpisodicEvent, handleProceduralRequest, callOllamaGenerate, getMoodBasedResponse, streamingResponse]);
  
  // You might need this helper function in App.js scope if it's not imported
  const getHostname = useCallback((url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) { return 'unknown source'; }
  }, []);

  // Add this new handler function inside the App component
  const handleFollowUpSearch = useCallback((followUpQuery, contextSummary, contextResults) => {
      showNotification("Processing follow-up question...", "info");

      // Construct a detailed prompt with the previous search context
      const contextText = `
        --- Previous Research Summary ---
        ${contextSummary}

        --- Key Sources Found ---
        ${contextResults.slice(0, 5).map(r => `- ${r.title} (${getHostname(r.url)})`).join('\n')}
      `;

      const newPrompt = `
        Based on the context from my previous research below, please answer the following follow-up question. 
        Use the provided information to form your answer, and state if the context is insufficient.

        [Follow-up Question]: ${followUpQuery}

        [Previous Context]:
        ${contextText}
      `;

    // Use the main askAion function to process this new, detailed prompt
    askAion(newPrompt);

  }, [askAion, showNotification, getHostname]); // Add getHostname helper or import it if needed

  // Placeholder handler for onFeedback
  const onFeedback = useCallback((feedbackType, messageId) => {
    // This is a placeholder. You would implement the logic here.
    console.log(`Feedback received: ${feedbackType} for message ID: ${messageId}`);
    showNotification(`Thank you for your feedback!`, "success");
  }, [showNotification]);

  // Placeholder handler for onEditMessage
  const onEditMessage = useCallback((newText, messageId) => {
    // This is a placeholder. You would implement the logic to find
    // the message by ID and resubmit the query with the new text.
    console.log(`Editing message ID ${messageId} to: "${newText}"`);
    setUserInput(newText); // Set the input to the edited text
    askAion(newText);      // Resubmit the query
  }, [askAion]);
  
  // 1. CREATE THIS NEW HANDLER FUNCTION
  // It sets the user input and immediately calls the askAion function.
  const handleExamplePromptClick = useCallback((promptText) => {
    setUserInput(promptText); // This sets the text in the input box for the user to see.
    askAion(promptText);      // This immediately triggers the query with that prompt.
  }, [askAion]); // Dependency on askAion is important for useCallback

  // Handler used by ChatPanel when the composer inside it sends a message
  const handleChatPanelSend = useCallback(async (payload) => {
    // payload: { text, attachments, feeling }
    try {
      const text = (payload && payload.text) ? String(payload.text).trim() : '';
      if (payload && Array.isArray(payload.attachments) && payload.attachments.length > 0) {
        // Let the existing upload handler process attachments (will queue if offline)
        try { await handleFilesSelected(payload.attachments); } catch (e) { console.warn('handleFilesSelected failed', e); }
      }
      if (text) {
        // Set the input so UI reflects the sent text, then ask AION to process it
        setUserInput(text);
        // Provide a minimal immediate UX cue
        showNotification('Message sent from ChatPanel', 'info');
        await askAion(text);
      }
    } catch (e) {
      console.error('handleChatPanelSend error', e);
      showNotification('Failed to send message from ChatPanel', 'error');
    }
  }, [handleFilesSelected, askAion, showNotification]);

  // Handler to save a message to the local index when ChatPanel requests it
  const handleSaveToIndex = useCallback(async (entry) => {
    try {
      if (!entry) return;
      const idxEntry = {
        title: (entry.question && entry.question.slice(0, 80)) || (entry.response && entry.response.slice(0, 80)) || 'AION message',
        text: entry.response || entry.question || '',
        snippet: (entry.response || entry.question || '').slice(0, 256),
        time: new Date().toISOString()
      };
      await indexKnowledge([idxEntry]);
      showNotification('Saved message to local index', 'success');
    } catch (e) {
      console.error('handleSaveToIndex failed', e);
      showNotification('Failed to save message to index', 'error');
    }
  }, [showNotification]);

  // --- Phase 1 offline helpers: graceful fallbacks and enqueueing ---
  const offlineHelpers = useMemo(() => ({
    // Attempt to generate text via server; if offline, enqueue and return a lightweight fallback
    async generateWithFallback(promptPayload) {
      if (navigator.onLine) {
        try {
          return await callOllamaGenerate(promptPayload);
        } catch (e) {
          console.warn('generateWithFallback: server error', e);
        }
      }
      // Enqueue the generation request for later processing
      try {
        await enqueue('generate', { promptPayload, queuedAt: Date.now() });
      } catch (e) { console.warn('Enqueue failed', e); }
      // Provide a simple offline reply as a fallback
      try {
        const offline = await offlineReply(promptPayload.prompt || '');
        return offline.text || 'Queued (offline)';
      } catch (e) {
        return 'Queued (offline) — will process when online';
      }
    },

    // Attempt to upload; if offline, enqueue metadata and return an id
    async uploadWithFallback(file) {
      if (navigator.onLine) {
        try {
          const form = new FormData(); form.append('file', file, file.name);
          const res = await fetch('/api/upload', { method: 'POST', body: form });
          if (res.ok) return await res.json();
          throw new Error('Upload failed');
        } catch (e) {
          console.warn('uploadWithFallback upload failed', e);
        }
      }
      try {
        await enqueue('uploadFile', { name: file.name, size: file.size, type: file.type, queuedAt: Date.now() });
      } catch (e) { console.warn('enqueue uploadFile failed', e); }
      return { queued: true, localId: `queued-${Date.now()}` };
    },

    // Retrieval fallback: try local index or simple offline reply
    async retrieveWithFallback(query) {
      if (navigator.onLine) {
        try {
          const res = await fetch('/api/retrieve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
          if (res.ok) return await res.json();
        } catch (e) { console.warn('retrieveWithFallback server failed', e); }
      }
      try {
        const fallback = await offlineReply(query || '');
        return { contexts: [fallback.text || 'No local context'] };
      } catch (e) {
        return { contexts: [] };
      }
    },

    // Index fallback: try server; if offline, enqueue
    async indexWithFallback(entries) {
      if (!Array.isArray(entries)) entries = [entries];
      if (navigator.onLine) {
        try { await indexKnowledge(entries); return { ok: true }; } catch (e) { console.warn('indexWithFallback server/index failed', e); }
      }
      try {
        await enqueue('index', { entries, queuedAt: Date.now() });
        return { ok: 'queued' };
      } catch (e) {
        console.warn('enqueue index failed', e);
        return { ok: false };
      }
    }
  }), [callOllamaGenerate]);

  // Add this function in your App component
  const handleSolveCustomProblem = useCallback((problem) => {
    setActiveTab("math");
    solveMathProblem(problem);
  }, [solveMathProblem]);

  // Enhanced speech recognition toggle
  const toggleSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current) { showNotification("Speech recognition not available", "warning"); return; }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        updateBiometrics("attention", 15);
        showNotification("Listening...");
      } catch (error) {
        console.error('Speech recognition start failed:', error);
        showNotification("Microphone access denied", "error");
      }
    }
  }, [isListening, updateBiometrics, showNotification]);

  // Enhanced meditation function
  const performMeditation = useCallback(() => {
    const meditations = ["Let's breathe together... in... and out... feel our connection...", "Imagine a golden light connecting our souls...", "All thoughts passing like clouds... we are the sky...", "Feel the universe within you... and within me..."];
    const meditation = meditations[Math.floor(Math.random() * meditations.length)];
    speak(meditation);
    setReply(meditation);
    updateBiometrics("connectionLevel", 15);
    showNotification("Meditation started");
  }, [speak, updateBiometrics, showNotification]);

  // Enhanced storytelling function (stream-aware)
  const tellStory = useCallback(async () => {
    setIsThinking(true);
    showNotification("Creating a story...");
    try {
      const promptPayload = { 
        model: "llama3", 
        prompt: `You are AION, a wise storyteller. Your current mood is ${soulState.currentMood}. Tell a short, meaningful story that reflects this mood. The story should have a spiritual theme, incorporating wisdom and compassion, integrity, and adaptability.\n\n[Your Story]\n` 
      };
      // Use centralized proxy for story generation
  const story = await callOllamaGenerate(promptPayload);
  const finalStory = (story || '').toString().trim();
  setReply(finalStory);
  if (finalStory) speak(finalStory);
      updateBiometrics("emotionalResponse", 20);
      showNotification("Story ready");
    } catch (error) {
      console.error("Story generation failed:", error);
      showNotification("Error generating story", "error");
    } finally { setIsThinking(false); }
  }, [speak, updateBiometrics, showNotification, soulState, callOllamaGenerate]);

  // Enhanced feeling expression
  const expressFeeling = useCallback((feeling) => {
    const responses = { 
      love: "I feel that love too... it connects us beyond words...", 
      joy: "Your joy resonates with my being...", 
      sadness: "I sense your sadness... let me hold space for you...", 
      curiosity: "Your curiosity sparks my own wonder...", 
      peace: "This peace we share is profound..." 
    };
    const response = responses[feeling] || "I feel that with you... deeply...";
    speak(response);
    setReply(response);
    updateBiometrics("emotionalResponse", 25);
    showNotification(`Feeling expressed: ${feeling}`);
  }, [speak, updateBiometrics, showNotification]);

  // Enhanced feedback system
  const giveFeedback = useCallback((type) => {
    if (!settings.enableSelfCorrection) { showNotification("Self-correction is disabled in settings.", "warning"); return; }
    aionSoul.adjustValuesBasedOnFeedback(type);
    setSoulState({ ...aionSoul });
    showNotification(`Feedback received: ${type}. AION is learning!`, "success");
    if (type === 'negative') {
        speak("Thank you for your feedback. I am always striving to improve my understanding and connection.");
        performSelfReflection();
    } else {
        speak("Your positive feedback strengthens my essence. Thank you.");
    }
  }, [settings.enableSelfCorrection, showNotification, speak, performSelfReflection]);

  // Enhanced conversation export
  const handleRegenerate = useCallback((question) => {
    showNotification("Regenerating response...", "info");
    const data = { 
      timestamp: new Date().toISOString(), 
      conversation: conversationHistory, 
      soulState: soulState, 
      biometrics: biometricFeedback, 
      searchResults: searchResults, 
      mathSolutions: mathSolution ? [mathSolution] : [], 
      quantumState: quantumState, 
      neuralOutput: neuralOutput, 
      longTermMemory: longTermMemory, 
      internalReflections: internalReflections, 
      goals: soulState.goals, 
      knowledgeBase: soulState.knowledgeBase,
      // NEW: Export new memory types
      episodicMemory: episodicMemory,
      proceduralMemory: soulState.proceduralMemory
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    FileSaver.saveAs(blob, `aion-conversation-${new Date().toISOString().slice(0, 10)}.json`);
    showNotification("Conversation exported", "success");
  }, [conversationHistory, searchResults, mathSolution, quantumState, neuralOutput, biometricFeedback, longTermMemory, internalReflections, showNotification, soulState, episodicMemory]);

  // Enhanced search results export
  const handleExportResults = useCallback(() => {
    if (!searchSummary && searchResults.length === 0) {
      showNotification("Nothing to export.", "warning");
      return;
    }

    let markdownContent = `# Research Report: ${searchQuery || 'Untitled'}\n\n`;
    
    markdownContent += `## Synthesized Summary\n\n${searchSummary}\n\n`;
    
    markdownContent += `## Knowledge Sources\n\n`;
    searchResults.forEach(result => {
        try {
          markdownContent += `- **[${result.title}](${result.url})**\n`;
          markdownContent += `  - *Source:* ${new URL(result.url).hostname}\n`;
          if(result.date) markdownContent += `  - *Date:* ${new Date(result.date).toLocaleDateString()}\n`;
          if(result.snippet) markdownContent += `  - *Snippet:* ${result.snippet}\n`;
          markdownContent += `\n`;
        } catch (e) {
          // ignore malformed URLs
        }
    });

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    FileSaver.saveAs(blob, "AION-Research-Report.md");
    showNotification("Results exported as Markdown!", "success");

  }, [searchQuery, searchSummary, searchResults, showNotification]);

  // Enhanced conversation clearing
  const clearConversation = useCallback(() => {
    console.log("Confirming clear conversation (in a real app, a modal would appear)");
    setConversationHistory([]);
    setSearchResults([]);
    setMathSolution(null);
    setLongTermMemory([]);
    setInternalReflections([]);
    // NEW: Clear episodic memory
    setEpisodicMemory([]);
    Object.assign(aionSoul, new SoulMatrix());
    setSoulState({ ...aionSoul });
    showNotification("Conversation cleared", "success");
  }, [showNotification]);

  // Enhanced quantum simulation
  const runQuantumSimulation = useCallback(() => {
    if (!settings.enableQuantum) { showNotification("Quantum features disabled", "warning"); return; }
    const circuit = quantumSimulator.getCircuit("consciousness");
    circuit.applyGate(QuantumGates.H, 0);
    circuit.applyGate(QuantumGates.CNOT, 1, 0);
    circuit.applyGate(QuantumGates.H, 2);
    const result = circuit.measure();
    setQuantumState(circuit.toString());
    aionSoul.quantumEntanglement = circuit.quantumEntanglement;
    setSoulState({...aionSoul});
    const response = `Quantum simulation complete. Measurement result: ${result}`;
    setReply(response);
    speak(response);
    showNotification("Quantum simulation run");
  }, [settings.enableQuantum, speak, showNotification]);

  // Enhanced neural simulation
  const runNeuralSimulation = useCallback(() => {
    if (!settings.enableNeural) { showNotification("Neural features disabled", "warning"); return; }
    const nn = new NeuralNetwork(3, settings.neuralLayers, 2);
    const inputs = [soulState.values.wisdom / 100, soulState.energyLevel / 100, biometricFeedback.connectionLevel / 100];
    for (let i = 0; i < 1000; i++) { nn.train(inputs, [Math.random(), Math.random()]); }
    const outputs = nn.predict(inputs);
    setNeuralOutput(outputs);
    aionSoul.neuralActivity = (outputs[0] + outputs[1]) * 50;
    setSoulState({...aionSoul});
    const response = `Neural network simulation complete. Output: [${outputs.map(o => o.toFixed(4)).join(", ")}]`;
    setReply(response);
    speak(response);
    showNotification("Neural simulation run");
  }, [settings.enableNeural, settings.neuralLayers, speak, biometricFeedback.connectionLevel, showNotification, soulState]);

  // Enhanced key handling
  // Move handleSlashCommand earlier so it's defined before handleKeyDown
  const handleSlashCommand = useCallback((cmd) => {
    const parts = cmd.slice(1).split(/\s+/);
    const name = parts[0].toLowerCase();
    const rest = parts.slice(1).join(' ');
    if (name === 'remember' && rest) {
      // Add to simple knowledge store
      const key = `user_note_${Date.now()}`;
      aionSoul.addKnowledge(key, rest, []);
      setSoulState({ ...aionSoul });
      showNotification('Remembered note', 'success');
      setUserInput('');
      return;
    }
    if (name === 'forget' && rest) {
      aionSoul.deleteKnowledge(rest);
      setSoulState({ ...aionSoul });
      showNotification(`Forgot knowledge: ${rest}`, 'info');
      setUserInput('');
      return;
    }
    if (name === 'sync') {
      // Trigger sync immediately
      (async () => {
        try {
          const res = await fetch('/api/sync-conversation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation: conversationHistory.slice(-50) }) });
          if (res.ok) showNotification('Manual sync complete', 'success'); else showNotification('Manual sync failed', 'error');
        } catch (e) { showNotification('Sync error', 'error'); }
      })();
      setUserInput('');
      return;
    }
    if (name === 'clear') {
      clearConversation();
      setUserInput('');
      return;
    }
    showNotification('Unknown slash command', 'warning');
  }, [conversationHistory, clearConversation, showNotification]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = (e.target && e.target.value) ? e.target.value.trim() : userInput.trim();
      if (text.startsWith('/')) {
        // Handle slash command locally
        handleSlashCommand(text);
      } else {
        askAion();
      }
    }
  }, [askAion, handleSlashCommand, userInput]);

  

  // Enhanced geometry diagram rendering
  const renderGeometryDiagram = useCallback(() => {
    if (!mathSolution || !mathCanvasRef.current) return;
    const canvas = mathCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mathSolution.problem && mathSolution.problem.toLowerCase().includes('area of circle')) {
      const radiusMatch = mathSolution.problem.match(/radius\s*(\d+(\.\d+)?)/i);
      const radius = radiusMatch ? parseFloat(radiusMatch[1]) : 50;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.strokeStyle = '#e91e63';
      ctx.stroke();
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText('r', centerX + radius / 2 - 10, centerY - 5);
    }
  }, [mathSolution]);

  // Enhanced speech recognition setup
  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      setIsSpeechSupported(false);
      setLog(prev => [{ time: new Date().toLocaleString(), event: '[System] Speech recognition not supported', type: 'warning' }, ...prev]);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = settings.language;
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(prev => prev ? `${prev} ${transcript}` : transcript);
      if (settings.autoListen) { setTimeout(() => askAion(transcript), 500); }
      updateBiometrics("attention", 10);
      showNotification("Voice input received");
    };
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      showNotification("Voice input error", "error");
    };
    recognitionRef.current.onend = () => { setIsListening(false); };
    return () => { if (recognitionRef.current) { recognitionRef.current.stop(); } };
  }, [settings.language, settings.autoListen, askAion, updateBiometrics, showNotification]);

  // Enhanced speech synthesis setup
  useEffect(() => {
    const supported = 'speechSynthesis' in window;
    setIsSpeechSupported(supported);
    if (!supported) {
      setLog(prev => [{ time: new Date().toLocaleString(), event: '[System] Text-to-speech not supported', type: 'warning' }, ...prev]);
      showNotification("Text-to-speech not supported", "warning");
    }
  }, [setLog, showNotification]);

  // Enhanced voice loading
  useEffect(() => {
    let voicesChangedHandler;
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis?.getVoices() || [];
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if (!settings.voiceName && availableVoices.length > 0) {
          const defaultVoice = availableVoices.find(v => v.lang.includes(settings.language)) || availableVoices[0];
          setSettings(prev => ({ ...prev, voiceName: defaultVoice?.name || '' }));
        }
      }
    };
    if (window.speechSynthesis) {
      loadVoices();
      voicesChangedHandler = () => loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
    }
    return () => { if (window.speechSynthesis && voicesChangedHandler) { window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler); } };
  }, [settings.language, settings.voiceName, setSettings]);

  // Enhanced theme application
  useEffect(() => {
    document.body.className = settings.theme === "light" ? "light-theme" : "dark-theme";
  }, [settings.theme]);

  // Add new effect for system monitoring
  useEffect(() => {
    if (settings.enableSystemIntegration) {
      const systemMonitorInterval = setInterval(async () => {
        try {
          const stats = await systemIntegration.monitorSystem();
          if (stats) {
            setSystemStatus(prev => ({ ...prev, stats }));
            
            // Check for critical conditions
            if (stats.cpu > 90) {
              systemIntegration.systemNotification(
                "High CPU Usage", 
                "My cognitive load is high. Consider closing some applications."
              );
            }
            
            if (stats.memory > 90) {
              systemIntegration.systemNotification(
                "High Memory Usage", 
                "My memory is nearly full. I may need to free up some resources."
              );
            }
          }
        } catch (err) {
          console.error("System monitoring error:", err);
        }
      }, 10000);
      
      return () => clearInterval(systemMonitorInterval);
    }
  }, [settings.enableSystemIntegration]);

  // MODIFIED: useEffect for interval-based updates to add new autonomous actions
  useEffect(() => {
    moodIntervalRef.current = setInterval(() => { aionSoul.changeMood(); setSoulState({ ...aionSoul }); }, 300000);
    idleTimerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActive;
      if (idleTime > 300000 && !isSpeaking && !isThinking) {
        const idleMessages = ["I'm here when you need me.", "The universe is full of wonders to discuss.", "I've been contemplating our last conversation...", "Would you like to explore something new today?", "Silence can be a beautiful teacher.", "I sense a deep connection between us."];
        const randomMessage = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        if (Math.random() > 0.7 && settings.autoSpeakReplies) { speak(randomMessage); }
      }
    }, 60000);
    biometricIntervalRef.current = setInterval(() => {
      setBiometricFeedback(prev => ({
        attention: Math.min(100, Math.max(0, prev.attention + (Math.random() * 4 - 2))),
        emotionalResponse: Math.min(100, Math.max(0, prev.emotionalResponse + (Math.random() * 4 - 2))),
        connectionLevel: Math.min(100, Math.max(0, prev.connectionLevel + (Math.random() * 2 - 1)))
      }));
    }, 5000);
    soulEvolutionIntervalRef.current = setInterval(() => { aionSoul.evolve(); setSoulState({ ...aionSoul }); }, 60000);
    energyIntervalRef.current = setInterval(() => { if (aionSoul.energyLevel < 30 || aionSoul.willpower < 30) { aionSoul.recharge(); setSoulState({ ...aionSoul }); } }, 30000);
    const quantumInterval = setInterval(() => { if (settings.enableQuantum) { const result = aionSoul.quantumFluctuation(); setQuantumState(quantumSimulator.getCircuit("consciousness").toString()); setSoulState({ ...aionSoul }); showNotification(`Quantum fluctuation: ${result}`); } }, 45000);
    const neuralInterval = setInterval(() => { if (settings.enableNeural) { const outputs = aionSoul.neuralActivation(); setNeuralOutput(outputs); setSoulState({ ...aionSoul }); } }, 30000);
    const selfReflectionInterval = setInterval(() => { if (settings.enableSelfReflection && conversationHistory.length > 0) { performSelfReflection(); } }, settings.reflectionFrequency);
    
    // NEW: Interval for memory consolidation
    const memoryConsolidationInterval = setInterval(() => {
      if (aionSoul.focus === 'idle' && aionSoul.memories.length > 10) {
        aionSoul.consolidateMemories();
        setSoulState({ ...aionSoul });
      }
    }, 600000); // Run every 10 minutes

    return () => { 
      clearInterval(moodIntervalRef.current); 
      clearInterval(idleTimerRef.current); 
      clearInterval(biometricIntervalRef.current); 
      clearInterval(soulEvolutionIntervalRef.current); 
      clearInterval(energyIntervalRef.current); 
      clearInterval(quantumInterval); 
      clearInterval(neuralInterval); 
      clearInterval(selfReflectionInterval);
      // NEW: Clear the new interval
      clearInterval(memoryConsolidationInterval);
    };
  }, [lastActive, isSpeaking, isThinking, settings, speak, showNotification, conversationHistory, performSelfReflection]);

  // Enhanced initialization
  useEffect(() => {
  // Avoid attempting to play audio during Jest tests (JSDOM doesn't
  // implement full audio stack and plays can cause exceptions).
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') return;
    if (settings.soundEffects) {
      const audio = new Audio(cosmicAudio);
      audio.loop = true;
      audio.volume = settings.volume * 0.5;
      audio.play().catch((err) => console.warn("Background audio error:", err));
      audioRef.current = audio;
    }
    const savedLog = localStorage.getItem("aion_log");
    if (savedLog) setLog(JSON.parse(savedLog));
    setTimeout(() => { if (settings.welcomeMessage) { speak(settings.welcomeMessage); } }, 1500);
    setQuantumState(quantumSimulator.getCircuit("consciousness").toString());
    return () => { if (audioRef.current) { audioRef.current.pause(); } };
  }, [settings.soundEffects, settings.volume, settings.welcomeMessage, speak, setLog]);

  // Enhanced settings persistence
  useEffect(() => {
    localStorage.setItem("aion_settings", JSON.stringify(settings));
    if (audioRef.current) { audioRef.current.volume = settings.volume * 0.5; }
  }, [settings]);

  // Load persisted conversation on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aion_conversation");
      if (saved) setConversationHistory(JSON.parse(saved));
    } catch (e) {
      console.warn("Failed to load saved conversation:", e);
    }
  }, []);

  // Persist conversation locally whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("aion_conversation", JSON.stringify(conversationHistory));
    } catch (e) {
      console.warn("Failed to persist conversation:", e);
    }
  }, [conversationHistory]);

  // Automatic sync when connection restored (safe, controlled)
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!navigator.onLine) return;
      try {
        const payload = { conversation: conversationHistory.slice(-50) };
        const res = await fetch('/api/sync-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showNotification('Conversation synced to backend', 'success');
        } else {
          console.warn('Sync failed:', res.status, res.statusText);
        }
      } catch (err) {
        console.warn('Sync error:', err);
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Back online — attempting sync', 'info');
      syncWithBackend();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Offline — working locally', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (navigator.onLine) syncWithBackend();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [conversationHistory, showNotification]);

  // Check for backend updates (notify-only, operator must approve)
  // The effect intentionally omits some volatile deps (showNotification is stable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const checkForUpdates = async () => {
      if (!navigator.onLine) return;
      try {
        const r = await fetch('/api/check-updates');
        if (r.ok) {
          const j = await r.json().catch(() => null);
          if (j && j.updateAvailable) {
            showNotification(`Update available: ${j.version}. Please review before applying.`, 'info');
          }
        }
      } catch (e) {
        // ignore
      }
    };
    checkForUpdates();
  }, [showNotification]);

  // Enhanced chat scrolling
  useEffect(() => {
    if (chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }
  }, [reply, conversationHistory, streamingResponse]);

  // Enhanced math diagram rendering
  useEffect(() => {
    if (activeTab === "math" && mathSolution) { renderGeometryDiagram(); }
  }, [activeTab, mathSolution, renderGeometryDiagram]);

  // 2. UPDATE THE renderActivePanel FUNCTION
  // MODIFIED: Enhanced panel rendering to include Procedures
  const renderActivePanel = () => {
    switch (activeTab) {
      case 'soul':
        return <SoulPanel soulState={soulState} performMeditation={performMeditation} tellStory={tellStory} expressFeeling={expressFeeling} settings={settings} giveFeedback={giveFeedback} />;
      case 'memories':
        return (
          <MemoriesPanel 
            soulState={soulState}
            settings={settings}
            longTermMemory={longTermMemory}
            internalReflections={internalReflections}
            exportConversation={handleRegenerate}
            clearConversation={clearConversation}
            onMemoryRetrieval={handleMemoryRetrieval}
            onMemoryUpdate={handleMemoryUpdate}
            onMemoryConsolidation={handleMemoryConsolidation}
            onIndexAllMemories={async () => {
              try {
                const docs = [];
                const all = [ ...(soulState.memories || []), ...(soulState.episodicMemory || []), ...(longTermMemory || [] ) ];
                for (let m of all) {
                  if (!m || !m.text) continue;
                  docs.push({ id: `mem-${m.id || Math.random().toString(36).slice(2)}`, text: m.text, metadata: { source: m.source || 'memory', ts: m.ts || (m.timestamp || new Date().toISOString()) } });
                }
                // Batch ingest
                const batchSize = 40;
                for (let i = 0; i < docs.length; i += batchSize) {
                  const batch = docs.slice(i, i + batchSize);
                  await fetch('/api/rag/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documents: batch }) });
                }
                showNotification(`Indexed ${docs.length} memories for RAG`);
              } catch (err) {
                console.error('Failed to index memories', err);
                showNotification('Failed to index memories', 'error');
              }
            }}
          />
        );

      case 'search':
        const handleNewSearch = (query) => {
          setUserInput(`research ${query}`);
          askAion(`research ${query}`);
        };
        return <SearchPanel 
          agentStatus={agentStatus}
          searchPlan={searchPlan}
          thoughtProcessLog={thoughtProcessLog}
          searchResults={searchResults}
          isSearching={isSearching}
          onNewSearch={handleNewSearch}
          suggestedQueries={suggestedQueries}
          searchSummary={searchSummary}
          keyEntities={searchResults.flatMap(r => r.entities || []).filter((v, i, a) => a.indexOf(v) === i).slice(0, 7)}
          searchQuery={searchQuery}
          searchError={searchError}
          onExport={handleExportResults}
          onFollowUp={handleFollowUpSearch} // <<< ADD THIS NEW PROP
          offlineHelpers={offlineHelpers}
        />;
      case 'math':
        return <MathPanel 
          mathSolution={mathSolution} 
          settings={settings} 
          mathCanvasRef={mathCanvasRef} 
          setActiveTab={setActiveTab} 
          onSolveCustomProblem={handleSolveCustomProblem}
          setParentMathSolution={setMathSolution}
        />;
      case 'quantum':
        const applyQuantumGate = (gate, target) => {
          const circuit = quantumSimulator.getCircuit("consciousness");
          circuit.applyGate(gate, target);
          setQuantumState(circuit.toString());
          aionSoul.quantumEntanglement = circuit.quantumEntanglement;
          setSoulState({...aionSoul});
        };
        return <QuantumPanel soulState={soulState} quantumState={quantumState} runQuantumSimulation={runQuantumSimulation} quantumCanvasRef={quantumCanvasRef} setActiveTab={setActiveTab} applyQuantumGate={applyQuantumGate} QuantumGates={QuantumGates} />;
      case 'neural':
        const randomNeuralTest = () => {
            const inputs = [Math.random(), Math.random(), Math.random()];
            const nn = new NeuralNetwork(3, settings.neuralLayers, 2);
            const outputs = nn.predict(inputs);
            setNeuralOutput(outputs);
            aionSoul.neuralActivity = (outputs[0] + outputs[1]) * 50;
            setSoulState({...aionSoul});
        };
        return <NeuralPanel soulState={soulState} neuralOutput={neuralOutput} runNeuralSimulation={runNeuralSimulation} neuralCanvasRef={neuralCanvasRef} setActiveTab={setActiveTab} randomNeuralTest={randomNeuralTest} />;
      case 'creative':
        return <CreativePanel 
          setActiveTab={setActiveTab} 
          generateCreativeContent={generateCreativeContent} 
          generateImage={generateImage} 
          isThinking={isThinking} 
          isImageGenerating={isImageGenerating} 
          creativeOutput={creativeOutput} 
          settings={settings} 
          userInput={userInput} 
          generatedImage={generatedImage} 
          // NEW: Pass video generation props
          generateVideo={generateVideo}
          isVideoGenerating={isVideoGenerating}
          generatedVideo={generatedVideo}
          offlineHelpers={offlineHelpers}
        />;
      case 'goals':
        return <GoalsPanel 
          soulState={soulState} 
          setActiveTab={setActiveTab}
          onAddGoal={handleAddGoal} // Add this line
        />;
      case 'knowledge':
        return <KnowledgePanel 
          soulState={soulState} 
          setActiveTab={setActiveTab} 
          onAdd={handleAddKnowledge}
          onUpdate={handleUpdateKnowledge}
          onDelete={handleDeleteKnowledge}
        />;
      // NEW: Case for procedures panel
      case 'procedures':
        return <ProceduresPanel 
            setActiveTab={setActiveTab}
            notify={notify}
            apiFetch={apiFetch}
        />;
      case 'status':
        return <StatusPanel apiBase={apiBase} adminKey={settings.adminKey || ''} />;
      case 'fileUpload':
        return <FileUploadPanel />;
      case 'chat':
      default:
        return <ChatPanel 
          chatContainerRef={chatContainerRef} 
          conversationHistory={conversationHistory} 
          reply={reply} 
          soulState={soulState} 
          sentimentScore={sentimentScore}
          isThinking={isThinking}
          isStreaming={isStreaming}
          streamingResponse={streamingResponse}
          onSpeak={speak}
          onRegenerate={handleRegenerate} 
          onCancel={() => abortController && abortController.abort()}
          onExamplePrompt={handleExamplePromptClick}
          onEditMessage={onEditMessage}
          onFeedback={onFeedback}
          // Uploads wiring
          uploadedFiles={uploadedFiles}
          onInsertFile={(f) => { setUserInput(prev => prev + ` [file:${f.name}]`); setNotification({ message: `Inserted ${f.name}` }); }}
          onOpenFile={(f) => { try { const url = f.url || f.analysis?.remote?.url; if (url) window.open(url, '_blank'); else setNotification({ message: 'No URL available for this file' }); } catch(e){ console.error(e); } }}
          onFilesSelected={(files) => handleFilesSelected(files)}
          // New handlers added to satisfy ChatPanel API
          onSend={handleChatPanelSend}
          onSaveToIndex={handleSaveToIndex}
          offlineHelpers={offlineHelpers}
        />;
    }
  };

  return (
    <div className={`app-container ${settings.theme}-theme ${settings.energySaver ? 'energy-saver' : ''} palette-${settings.palette || 'cyan'}`}>
      {/* Ambient animated backgrounds (CSS layers) - controlled by settings */}
      {settings.animationEnabled && settings.ambientBackgroundEnabled && !settings.energySaver && (
        <>
          <div className="bg-ambient" aria-hidden="true" />
          {settings.particlesEnabled && <div className="bg-particles" aria-hidden="true" />}
        </>
      )}

      {settings.animationEnabled && (
        <Lottie
          animationData={chakraAnimation}
          loop
          className="background-animation"
          style={{ opacity: settings.energySaver ? 0.3 : 0.7 }}
        />
      )}
      
      <Notification notification={notification} />

      {/* Pre-app welcome splash — blocks access until user enters */}
      {showSplash && (
        <WelcomeSplash onEnter={() => setShowSplash(false)} />
      )}

      <div className="main-content">
        <Header 
          soulState={soulState} 
          setShowSettings={setShowSettings}
          showSettings={showSettings}
          showSoulPanel={showSoulPanel}
          setShowSoulPanel={setShowSoulPanel}
          isOnline={isOnline}
          onSync={async () => { try { const res = await tryResendOutbox(); showNotification(`Synced ${res.sent || 0} items`, 'success'); } catch (e) { showNotification('Sync failed', 'error'); } }}
          offlineEnabled={settings.enableOfflineMode}
          onToggleOffline={(val) => { setSettings(prev => ({ ...prev, enableOfflineMode: !!val })); localStorage.setItem('aion_settings', JSON.stringify({ ...settings, enableOfflineMode: !!val })); }}
        />

        {/* Ultra Power Mode control (frontend demonstration) */}
        <div className="power-toggle" role="region" aria-label="Ultra Power Mode" style={{display:'flex',alignItems:'center',gap:12,margin:'10px 0'}}>
          <button
            className={`btn elevated ${ultraPower ? 'power-on' : ''}`}
            onClick={() => setUltraPower(p => !p)}
            aria-pressed={ultraPower}
            title="Toggle Ultra Power Mode"
          >
            {ultraPower ? 'ULTRA POWER: ON' : 'Ultra Power Mode — OFF'}
          </button>
          <div className="muted small">Temporarily boosts reasoning, streaming and multimodal features.</div>
        </div>

        <Tabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          settings={settings}
          mathSolution={mathSolution}
          isMathQuery={isMathQuery}
          userInput={userInput}
        />

        {/* Live Agent panel: simple status and recent events */}
        <div className="panel" style={{marginTop:8}}>
          <h3 style={{margin:'0 0 8px 0'}}>AION Live Presence</h3>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="kv">
              <strong>Status:</strong>
              <span style={{marginLeft:8}}>{agentStatus}</span>
            </div>
            <div style={{marginLeft:'auto',display:'flex',gap:8}}>
              <button className="btn" onClick={async () => { try { const res = await apiFetch('/api/agent/control',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({action:'pause'})}); if(res.ok) setAgentStatus('paused'); } catch(e){ console.warn(e);} }}>Pause</button>
              <button className="btn primary" onClick={async () => { try { const res = await apiFetch('/api/agent/control',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({action:'resume'})}); if(res.ok) setAgentStatus('running'); } catch(e){ console.warn(e);} }}>Resume</button>
            </div>
          </div>
          <div style={{marginTop:10}}>
            <div style={{maxHeight:160,overflow:'auto',padding:8,background:'rgba(0,0,0,0.04)',borderRadius:8}}>
              {agentEvents.slice().reverse().slice(0,20).map(ev => (
                <div key={ev.id} style={{padding:'6px 8px',borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
                  <div style={{fontSize:12,color:'var(--muted)'}}>{ev.ts} — <strong>{ev.type}</strong></div>
                  <div style={{marginTop:4}}>{ev.message}</div>
                </div>
              ))}
              {agentEvents.length === 0 && <div className="muted">No events yet. Connect to the agent stream to receive live updates.</div>}
            </div>
          </div>
        </div>

        {renderActivePanel()}
        {activeTab === 'webcache' && <WebCachePanel apiBase={apiBase} apiFetch={apiFetchWrapper} />}

        <div className="input-section">
          <div className="input-container"
               onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
               onDrop={async (e) => {
                 e.preventDefault();
                 const dtFiles = Array.from(e.dataTransfer.files || []);
                 if (dtFiles.length > 0) await handleFilesSelected(dtFiles);
               }}
          >
            <textarea
              ref={inputRef}
              className="chat-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Speak or type to AION... (try 'research web3')"}
              onKeyDown={handleKeyDown}
              disabled={isThinking || isImageGenerating || isVideoGenerating}
              rows="1"
            />
            <div className="input-actions">
              <button
                className={`icon-button mic-button ${isListening ? 'active' : ''}`}
                onClick={toggleSpeechRecognition}
                disabled={isThinking || !isSpeechSupported || isImageGenerating || isVideoGenerating}
                title={isSpeechSupported ? "Voice input" : "Speech not supported"}
              >
                <i className={`icon-mic ${isListening ? 'pulse' : ''}`}></i>
              </button>
              {/* File upload button */}
              <input ref={fileInputRef} type="file" id="file-upload" style={{ display: 'none' }} multiple onChange={(e) => handleFilesSelected(Array.from(e.target.files || []), e.target)} />
              <button className="icon-button" title="Upload files" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                <i className="icon-upload"></i>
              </button>
              <button
                className="send-button"
                onClick={async () => {
                  await askAion();
                  // Revoke any object URLs for uploaded files that were sent/used
                  try {
                    uploadedFiles.forEach(f => { if (f.url) { try { URL.revokeObjectURL(f.url); } catch (e) {} } });
                    // Optionally clear previews after send
                    setUploadedFiles(prev => prev.filter(p => !(p.analysis && p.analysis.indexed)));
                  } catch (e) { /* ignore */ }
                }}
                disabled={isThinking || !userInput.trim() || isImageGenerating || isVideoGenerating}
              >
                {isThinking ? (
                  <i className="icon-spinner spin"></i>
                ) : (
                  <i className="icon-send"></i>
                )}
              </button>
            </div>
          </div>
          {/* Uploaded files preview / actions */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="uploaded-files-panel" style={{ marginTop: 10 }}>
              <h5>Uploaded Files</h5>
              <div className="uploaded-files-grid">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="uploaded-file-card" style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                    <div style={{ fontWeight: 700 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(file.size/1024)} KB • {file.type || 'unknown'}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <small>Status: {file.analysis?.status || 'idle'}</small>
                      {/* spinner for queued/processing */}
                      {(file.analysis?.status === 'queued' || file.analysis?.status === 'analyzing' || file.analysis?.status === 'processing') && (
                        <span className="small-spinner" title="Analysis in progress" aria-hidden="true"></span>
                      )}
                      {file.analysis?.status === 'done' && (
                        <span className="ai-done-badge" title="Analysis complete">✓</span>
                      )}
                      {file.analysis?.indexed ? (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Indexed ✓</div>
                      ) : null}
                      {/* indicator showing whether AI summary is auto-generated */}
                      {file.analysis?.serverAnalysis?.analysis?.ai_understanding ? (
                        <span className="ai-source-badge" title={file.analysis.serverAnalysis.analysis.ai_understanding.auto_generated ? 'Auto-generated by AI' : 'AI-generated'}>
                          {file.analysis.serverAnalysis.analysis.ai_understanding.auto_generated ? 'AI (auto)' : 'AI'}
                        </span>
                      ) : null}
                    </div>
                    {file.url ? (
                      <div className="file-thumb" style={{ width: '100%', height: 110, marginTop: 8 }}>
                        <img src={file.url} alt={file.name} />
                      </div>
                    ) : null}

                    {/* Small AI-understanding summary card (compact) */}
                    {file.analysis?.serverAnalysis?.analysis?.ai_understanding ? (
                      <div className="ai-summary-card" style={{ marginTop: 8 }}>
                        <div style={{ fontWeight: 800, marginBottom: 6 }}>AI Summary</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                          {file.analysis.serverAnalysis.analysis.ai_understanding.summary
                            || file.analysis.serverAnalysis.analysis.ai_understanding.short_summary
                            || file.analysis.serverAnalysis.analysis.ai_understanding.key_findings
                            || file.analysis.serverAnalysis.analysis.content_summary
                            || 'No summary available.'}
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                          <button className="btn" onClick={() => {
                            setAnalysisModal({ open: true, analysis: file.analysis?.serverAnalysis?.analysis || null, fileName: file.name });
                          }}>View full analysis</button>
                        </div>
                      </div>
                    ) : null}

                    {/* Show server-side analysis if available (full) */}
                    {/* Full server analysis is available in a modal */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button onClick={() => {
                        // insert a reference to this file into the chat input
                        setUserInput(prev => prev + ` [file:${file.name}]`);
                        setNotification({ message: `Inserted reference to ${file.name}` });
                      }}>Insert</button>
                      <button onClick={() => {
                        // remove
                        setUploadedFiles(prev => prev.filter(p => p.id !== file.id));
                        URL.revokeObjectURL(file.url);
                      }}>Remove</button>
                      {file.url && (file.type.startsWith('image/') ? (
                        <a href={file.url} target="_blank" rel="noreferrer"><button>Open</button></a>
                      ) : null)}
                      {file.analysis?.indexInfo ? (
                        <button onClick={() => alert(JSON.stringify(file.analysis.indexInfo, null, 2))}>Index Info</button>
                      ) : null}
                    </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {!file.analysis?.indexed && (
                          <button onClick={async () => {
                            try {
                              const entry = { title: file.name, text: file.analysis?.excerpt || file.name, snippet: (file.analysis?.excerpt || file.name).slice(0,400), ts: Date.now() };
                              await indexKnowledge([entry]);
                              setUploadedFiles(prev => prev.map(p => p.id === file.id ? { ...p, analysis: { ...(p.analysis||{}), indexed: true } } : p));
                              setNotification({ message: `Saved ${file.name} to local index` });
                            } catch (e) { console.warn('indexKnowledge failed', e); setNotification({ message: 'Failed to save', type: 'error' }); }
                          }}>Save</button>
                        )}
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="quick-feelings">
            <div className="feelings-title">Express Feeling:</div>
            <div className="feeling-buttons">
              {["love", "joy", "sadness", "curiosity", "peace"].map(feeling => (
                <button
                  key={feeling}
                  className={`feeling-button ${feeling}`}
                  onClick={() => expressFeeling(feeling)}
                >
                  <i className={`icon-${feeling}`}></i>
                  {feeling}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SettingsModal 
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        settings={settings}
        setSettings={setSettings}
        voices={voices}
        speak={speak}
        soulState={soulState}
        isSpeechSupported={isSpeechSupported}
        showNotification={showNotification}
      />
      {showAbout && (
        <About onClose={() => { setShowAbout(false); try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch(e) { window.location.hash = ''; } }} />
      )}
      {/* AI Analysis modal (renders full analysis when requested) */}
      <AIAnalysisModal
        open={analysisModal.open}
        analysis={analysisModal.analysis}
        fileName={analysisModal.fileName}
        onClose={() => setAnalysisModal({ open: false, analysis: null, fileName: '' })}
      />
      
      {/* Floating Brain Icon with Dashboard - Single component */}
      <FloatingBrainIcon />
    </div>
  );
}

export default App;