import React, { useEffect, useRef, useState } from 'react';
import './SettingsModal.css';

const SettingsModal = ({
  showSettings,
  setShowSettings,
  settings = {},
  setSettings = () => {},
  voices = [],
  speak = () => {},
  soulState = {},
  isSpeechSupported = false
  , showNotification = () => {}
}) => {
  // Keep hooks at the top so they run consistently even when the modal is hidden.
  const modalRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState('consciousness');

  useEffect(() => {
    if (!showSettings) return;
    try { modalRef.current && modalRef.current.focus(); } catch (e) { /* ignore */ }

    const onKey = (e) => {
      if (e.key === 'Escape') setShowSettings(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showSettings, setShowSettings]);

  // Persist settings whenever they change while the modal is open (or when user toggles).
  useEffect(() => {
    try {
      if (settings && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('aion_settings', JSON.stringify(settings));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [settings]);

  // Provider mode local UI state for test button
  const [providerMode, setProviderMode] = useState(() => settings.providerMode || 'free');
  const [providerTestResult, setProviderTestResult] = useState(null);

  // Fetch runtime provider mode from backend when modal opens
  useEffect(() => {
    if (!showSettings) return;
    try {
      fetch('/api/provider/mode').then(r => r.json()).then(j => { if (j && j.ok && j.mode) setProviderMode(j.mode); }).catch(() => {});
    } catch (e) {}
  }, [showSettings]);

  if (!showSettings) return null;

  // Safely extract numeric values with defaults to avoid calling toFixed on undefined
  const pitch = Number(settings.pitch ?? 1);
  const rate = Number(settings.rate ?? 1);
  const volume = Number(settings.volume ?? 0.7);
  const reflectionFrequency = Number(settings.reflectionFrequency ?? 300000);
  const neuralLayers = Number(settings.neuralLayers ?? 3);
  const quantumDepth = Number(settings.quantumDepth ?? 2);
  const videoDuration = Number(settings.videoDuration ?? 10);

  const tabs = [
    { id: 'consciousness', name: 'Consciousness', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
    )},
    { id: 'voice', name: 'Voice & Speech', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
    )},
    { id: 'appearance', name: 'Appearance', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/><circle cx="10.5" cy="16.5" r="1.5"/></svg>
    )},
    { id: 'search', name: 'Search & Web', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    )},
    { id: 'memory', name: 'Memory & Sync', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
    )},
    { id: 'creative', name: 'Creative AI', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.32 11.32l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
    )},
    { id: 'system', name: 'System Settings', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
    )}
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'consciousness':
        return (
          <div className="settings-section">
            <div className="settings-section-title">Consciousness Circuitry</div>
            <div className="settings-section-description">Tune the quantum, neural, and sentiment parameters driving AION's mind.</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Enable Quantum Features</div>
                <div className="settings-item-label-desc">Unlock quantum cognition, enabling thought superposition and biometric entanglement metrics.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableQuantum)}
                    onChange={(e) => setSettings({ ...settings, enableQuantum: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Quantum Depth: {quantumDepth} qubits</div>
                <div className="settings-item-label-desc">Determines the number of active simulated qubits inside the quantum consciousness engine.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="1"
                  max="5"
                  step="1"
                  value={quantumDepth}
                  onChange={(e) => setSettings({ ...settings, quantumDepth: parseInt(e.target.value, 10) })}
                  disabled={!settings.enableQuantum}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Enable Neural Features</div>
                <div className="settings-item-label-desc">Activate neural network structures, allowing signal propagation and synapse visualization.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableNeural)}
                    onChange={(e) => setSettings({ ...settings, enableNeural: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Hidden Layers: {neuralLayers}</div>
                <div className="settings-item-label-desc">Control the size of AION's neural layers. Higher layers support deeper cognition paths.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="1"
                  max="5"
                  step="1"
                  value={neuralLayers}
                  onChange={(e) => setSettings({ ...settings, neuralLayers: parseInt(e.target.value, 10) })}
                  disabled={!settings.enableNeural}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Sentiment Analysis</div>
                <div className="settings-item-label-desc">Analyze emotional undertones in messages to dynamically adjust AION's mood and reactions.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableSentimentAnalysis)}
                    onChange={(e) => setSettings({ ...settings, enableSentimentAnalysis: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Cognitive Self-Correction</div>
                <div className="settings-item-label-desc">Enable cognitive checks where AION reviews its answers internally for logical flaws before replying.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableSelfCorrection)}
                    onChange={(e) => setSettings({ ...settings, enableSelfCorrection: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="settings-section">
            <div className="settings-section-title">Voice & Speech Synthesis</div>
            <div className="settings-section-description">Customize AION's spoken voice, language selection, and speech rates.</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Voice Selector</div>
                <div className="settings-item-label-desc">Choose from the text-to-speech voices supported by your operating system.</div>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  id="voice-select"
                  value={settings.voiceName ?? ''}
                  onChange={(e) => setSettings({ ...settings, voiceName: e.target.value })}
                >
                  {Array.isArray(voices) && voices.length > 0 ? (
                    voices.map((voice, idx) => (
                      <option key={voice.name ?? idx} value={voice.name ?? ''}>
                        {voice.name ?? `Voice ${idx + 1}`} ({voice.lang ?? 'unknown'})
                      </option>
                    ))
                  ) : (
                    <option value="">Default</option>
                  )}
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Synthesis Language</div>
                <div className="settings-item-label-desc">Target language locale for synthesis and responses.</div>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={settings.language ?? 'en-US'}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Pitch: {pitch.toFixed(1)}</div>
                <div className="settings-item-label-desc">Set voice pitch. Higher values create a more high-pitched tone.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setSettings({ ...settings, pitch: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Speech Rate: {rate.toFixed(1)}</div>
                <div className="settings-item-label-desc">Adjust the speed at which AION speaks.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setSettings({ ...settings, rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Volume: {(volume * 100).toFixed(0)}%</div>
                <div className="settings-item-label-desc">Master sound volume level for speech.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Auto Speak Replies</div>
                <div className="settings-item-label-desc">Automatically read AION's text responses aloud using speech synthesis.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.autoSpeakReplies)}
                    onChange={(e) => setSettings({ ...settings, autoSpeakReplies: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Auto Listen</div>
                <div className="settings-item-label-desc">Keep the microphone active after speaking to listen for follow-ups automatically.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.autoListen)}
                    onChange={(e) => setSettings({ ...settings, autoListen: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="settings-section">
            <div className="settings-section-title">Appearance & Theme</div>
            <div className="settings-section-description">Customize the visual styling, palette, and performance features of AION.</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Display Theme</div>
                <div className="settings-item-label-desc">Switch between clean light styling and dark sci-fi styles.</div>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={settings.theme ?? 'dark'}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Accent Palette</div>
                <div className="settings-item-label-desc">Adjust the global color highlight overlay applied across buttons, grids, and nodes.</div>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={settings.palette ?? 'cyan'}
                  onChange={(e) => setSettings({ ...settings, palette: e.target.value })}
                >
                  <option value="black">Black Glass (Default)</option>
                  <option value="cyan">Cyan Neon</option>
                  <option value="magenta">Cyber Magenta</option>
                  <option value="lime">Lime Grid</option>
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">UI Animations</div>
                <div className="settings-item-label-desc">Enable transitions, hover bounces, and drifting animations across panels.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.animationEnabled)}
                    onChange={(e) => setSettings({ ...settings, animationEnabled: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Ambient Background Glow</div>
                <div className="settings-item-label-desc">Renders elegant drifting colorful backing auroras for visual depth.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.ambientBackgroundEnabled)}
                    onChange={(e) => setSettings({ ...settings, ambientBackgroundEnabled: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Drifting Particles</div>
                <div className="settings-item-label-desc">Renders space particle streams flowing across the panels.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.particlesEnabled)}
                    onChange={(e) => setSettings({ ...settings, particlesEnabled: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Sound Effects</div>
                <div className="settings-item-label-desc">Toggle sound cues for notifications, messages, and simulation updates.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.soundEffects)}
                    onChange={(e) => setSettings({ ...settings, soundEffects: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Energy Saver</div>
                <div className="settings-item-label-desc">Reduce frame rates and blur resolution on battery/slower systems to save power.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.energySaver)}
                    onChange={(e) => setSettings({ ...settings, energySaver: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="settings-section">
            <div className="settings-section-title">Search & Web Integration</div>
            <div className="settings-section-description">Manage AION's ability to fetch live information from the web.</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Enable Web Search</div>
                <div className="settings-item-label-desc">Let AION query external search indexes when requested queries exceed its offline memory.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableWebSearch)}
                    onChange={(e) => setSettings({ ...settings, enableWebSearch: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Search Engine Provider</div>
                <div className="settings-item-label-desc">Select index provider to query.</div>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={settings.searchProvider ?? 'google'}
                  onChange={(e) => setSettings({ ...settings, searchProvider: e.target.value })}
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                  <option value="wolfram">Wolfram Alpha</option>
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Search Depth: {settings.searchDepth ?? 3}</div>
                <div className="settings-item-label-desc">Control number of top-ranking web pages AION reads to formulate answers.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.searchDepth ?? 3}
                  onChange={(e) => setSettings({ ...settings, searchDepth: parseInt(e.target.value, 10) })}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Custom API Endpoint</div>
                <div className="settings-item-label-desc">Point to a custom indexing or scraping endpoint to route queries.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="text"
                  className="settings-input"
                  value={settings.realSearchApiEndpoint ?? ''}
                  onChange={(e) => setSettings({ ...settings, realSearchApiEndpoint: e.target.value })}
                  placeholder="e.g., https://your-backend.com/api/search"
                />
              </div>
            </div>
          </div>
        );
      case 'memory':
        const reflectionMinutes = (reflectionFrequency / 60000).toFixed(1);
        return (
          <div className="settings-section">
            <div className="settings-section-title">Memory & Synchronization</div>
            <div className="settings-section-description">Configure AION's databases, memory retention, and backup settings.</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Long-Term Memory</div>
                <div className="settings-item-label-desc">Persist details across conversations in a local vector database.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableLongTermMemory)}
                    onChange={(e) => setSettings({ ...settings, enableLongTermMemory: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Cognitive Self-Reflection</div>
                <div className="settings-item-label-desc">Let AION run background reflection tasks to clean and consolidate stored knowledge keys.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableSelfReflection)}
                    onChange={(e) => setSettings({ ...settings, enableSelfReflection: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Reflection Frequency: {reflectionMinutes} min</div>
                <div className="settings-item-label-desc">Determines how often reflection tasks tick in the background.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="60000"
                  max="600000"
                  step="30000"
                  value={reflectionFrequency}
                  onChange={(e) => setSettings({ ...settings, reflectionFrequency: parseInt(e.target.value, 10) })}
                  disabled={!settings.enableSelfReflection}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Enable Auto-Sync</div>
                <div className="settings-item-label-desc">Automatically upload cached offline conversation logs when internet returns.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableAutoSync)}
                    onChange={(e) => setSettings({ ...settings, enableAutoSync: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Manage Database</div>
                <div className="settings-item-label-desc">Export current conversation logs as JSON or wipe the browser cache clean.</div>
              </div>
              <div className="settings-item-control">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="settings-button settings-button-secondary"
                    onClick={() => {
                      try {
                        const data = localStorage.getItem('aion_conversation');
                        const blob = new Blob([data || '[]'], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `aion-conversation-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (e) { console.error(e); }
                    }}
                    type="button"
                  >
                    Export
                  </button>
                  <button
                    className={`settings-button ${confirmClear ? 'settings-button-danger' : 'settings-button-secondary'}`}
                    onClick={() => {
                      if (!confirmClear) {
                        setConfirmClear(true);
                        showNotification('Click Clear again to confirm clearing local cache', 'warning');
                        setTimeout(() => setConfirmClear(false), 6000);
                        return;
                      }
                      try { localStorage.removeItem('aion_conversation'); } catch (e) { /* ignore */ }
                      setConfirmClear(false);
                      showNotification('Local conversation cleared', 'success');
                    }}
                    type="button"
                  >
                    {confirmClear ? 'Confirm Clear' : 'Clear Database'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="settings-section">
            <div className="settings-section-title">Creative AI & Generation</div>
            <div className="settings-section-description">Enable image generation, video rendering, and goal tracking capabilities.</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Creative Generation</div>
                <div className="settings-item-label-desc">Permits AION to write creative prose, scripts, and poems when requested.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableCreativeGeneration)}
                    onChange={(e) => setSettings({ ...settings, enableCreativeGeneration: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Image Generation</div>
                <div className="settings-item-label-desc">Unlock integration with image diffusion nodes to render visual concepts.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableImageGeneration)}
                    onChange={(e) => setSettings({ ...settings, enableImageGeneration: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Video Generation</div>
                <div className="settings-item-label-desc">Unlock video generation pipelines for animating concept files.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enableVideoGeneration)}
                    onChange={(e) => setSettings({ ...settings, enableVideoGeneration: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Video Resolution</div>
                <div className="settings-item-label-desc">Target aspect resolution of compiled clips.</div>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={settings.videoResolution ?? '512x512'}
                  onChange={(e) => setSettings({ ...settings, videoResolution: e.target.value })}
                  disabled={!settings.enableVideoGeneration}
                >
                  <option value="256x256">256x256 (Fast)</option>
                  <option value="512x512">512x512 (Standard)</option>
                  <option value="1024x576">1024x576 (Widescreen 16:9)</option>
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Video Clip Duration: {videoDuration}s</div>
                <div className="settings-item-label-desc">Adjust max clip length for generated sequences.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="range"
                  className="settings-slider"
                  min="5"
                  max="30"
                  step="1"
                  value={videoDuration}
                  onChange={(e) => setSettings({ ...settings, videoDuration: parseInt(e.target.value, 10) })}
                  disabled={!settings.enableVideoGeneration}
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Enable Goal Tracking</div>
                <div className="settings-item-label-desc">Allows AION to log, check off, and track user task objectives dynamically.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.goalTracking)}
                    onChange={(e) => setSettings({ ...settings, goalTracking: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Knowledge Base Indexing</div>
                <div className="settings-item-label-desc">Permit AION to store and retrieve specific local text indexes.</div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.knowledgeBase)}
                    onChange={(e) => setSettings({ ...settings, knowledgeBase: e.target.checked })}
                  />
                  <span className="toggle-switch-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Welcome Greeting</div>
                <div className="settings-item-label-desc">Customize message displayed when opening AION.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="text"
                  className="settings-input"
                  value={settings.welcomeMessage ?? ''}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="settings-section">
            <div className="settings-section-title">System & Provider Configuration</div>
            <div className="settings-section-description">Manage API keys, admin levels, LLM provider routing, and diagnostic tests.</div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">LLM Provider Mode</div>
                <div className="settings-item-label-desc">Choose between offline free simulation, local model node (Ollama), or OpenAI cloud.</div>
              </div>
              <div className="settings-item-control">
                <select
                  className="settings-select"
                  value={providerMode}
                  onChange={(e) => { setProviderMode(e.target.value); setSettings({ ...settings, providerMode: e.target.value }); }}
                >
                  <option value="free">Free (Stub Simulator)</option>
                  <option value="local-first">Local-First (Ollama Prefer)</option>
                  <option value="openai">OpenAI (Requires API Key)</option>
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Admin Key Passcode</div>
                <div className="settings-item-label-desc">Enter admin key for protected shell API requests. Stored locally.</div>
              </div>
              <div className="settings-item-control">
                <input
                  type="password"
                  className="settings-input"
                  value={settings.adminKey ?? ''}
                  onChange={(e) => setSettings({ ...settings, adminKey: e.target.value })}
                  placeholder="Admin key"
                />
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">
                <div className="settings-item-label-title">Diagnostics & Server Actions</div>
                <div className="settings-item-label-desc">Run connection tests to verify provider availability, toggle network shares, or test speech.</div>
              </div>
              <div className="settings-item-control">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="settings-button settings-button-secondary"
                    onClick={async () => {
                      try {
                        await fetch('/api/provider/mode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: providerMode }) });
                        setProviderTestResult('Testing...');
                        const res = await fetch('/api/provider/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Hello from AION settings test' }) });
                        const j = await res.json();
                        if (j && j.ok) {
                          setProviderTestResult('Test successful!');
                          setSettings(prev => ({ ...prev, providerMode }));
                        } else {
                          setProviderTestResult('Failed: ' + (j?.error ?? 'unknown'));
                        }
                      } catch (err) {
                        setProviderTestResult('Error: ' + String(err));
                      }
                      setTimeout(() => setProviderTestResult(null), 6000);
                    }}
                    type="button"
                  >
                    Test Provider
                  </button>
                  <button
                    className="settings-button settings-button-secondary"
                    onClick={() => {
                      if (typeof speak === 'function') {
                        speak("This is a voice test. My current mood is " + (soulState?.currentMood ?? 'calm'));
                      }
                    }}
                    disabled={!isSpeechSupported}
                    type="button"
                  >
                    Test Voice
                  </button>
                  <button
                    className="settings-button settings-button-secondary"
                    onClick={async () => {
                      try {
                        const key = settings.adminKey || '';
                        const res = await fetch('/admin/allow-external', { method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                        const j = await res.json();
                        if (j && j.ok) {
                          showNotification('Toggled external access: ' + (j.AION_ALLOW_EXTERNAL ? 'ENABLED' : 'DISABLED'), 'success');
                        } else {
                          showNotification('Toggle failed', 'error');
                        }
                      } catch (e) { showNotification('Toggle failed: ' + e.message, 'error'); }
                    }}
                    type="button"
                  >
                    Toggle External Access
                  </button>
                </div>
              </div>
            </div>
            {providerTestResult && (
              <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
                {providerTestResult}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-content" ref={modalRef} tabIndex={-1}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button
            className="settings-close"
            onClick={() => setShowSettings(false)}
            aria-label="Close settings"
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="settings-container">
          <div className="settings-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="settings-pane">
            {renderTabContent()}
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="settings-button"
            onClick={() => setShowSettings(false)}
            type="button"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
