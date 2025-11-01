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
  // Local confirmation state for destructive actions (avoids global confirm())
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    if (!showSettings) return;
    // move focus into the modal for accessibility
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
  const personalityIntensity = Number(settings.personalityIntensity ?? 75);
  const reflectionFrequency = Number(settings.reflectionFrequency ?? 300000);
  const neuralLayers = Number(settings.neuralLayers ?? 3);
  const quantumDepth = Number(settings.quantumDepth ?? 2);
  const videoDuration = Number(settings.videoDuration ?? 10);

  return (
    <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-content" ref={modalRef} tabIndex={-1}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button
            className="close-button"
            onClick={() => setShowSettings(false)}
            aria-label="Close settings"
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="settings-grid">
          {/* Voice Settings */}
          <div className="settings-group">
            <h3>Voice Settings</h3>

            <div className="setting-item">
              <label htmlFor="voice-select">Voice</label>
              <select
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

            <div className="setting-item">
              <label>Language: {settings.language}</label>
              <select
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

            <div className="setting-item">
              <label>Pitch: {pitch.toFixed(1)}</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setSettings({ ...settings, pitch: parseFloat(e.target.value) })}
              />
            </div>

            <div className="setting-item">
              <label>Rate: {rate.toFixed(1)}</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={rate}
                onChange={(e) => setSettings({ ...settings, rate: parseFloat(e.target.value) })}
              />
            </div>

            <div className="setting-item">
              <label>Volume: {volume.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="settings-group">
            <h3>Appearance</h3>
            <div className="setting-item">
              <label>Theme</label>
              <select
                value={settings.theme ?? 'dark'}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="setting-item toggle">
              <label>Animations</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.animationEnabled)}
                  onChange={(e) => setSettings({ ...settings, animationEnabled: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Ambient Background</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.ambientBackgroundEnabled)}
                  onChange={(e) => setSettings({ ...settings, ambientBackgroundEnabled: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Particles</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.particlesEnabled)}
                  onChange={(e) => setSettings({ ...settings, particlesEnabled: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Palette</label>
              <select
                value={settings.palette ?? 'cyan'}
                onChange={(e) => setSettings({ ...settings, palette: e.target.value })}
              >
                <option value="cyan">Cyan (default)</option>
                <option value="magenta">Magenta</option>
                <option value="lime">Lime</option>
              </select>
            </div>

            <div className="setting-item toggle">
              <label>Sound Effects</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.soundEffects)}
                  onChange={(e) => setSettings({ ...settings, soundEffects: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Energy Saver</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.energySaver)}
                  onChange={(e) => setSettings({ ...settings, energySaver: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="settings-group">
            <h3>Behavior</h3>

            <div className="setting-item">
              <label>Welcome Message</label>
              <input
                type="text"
                value={settings.welcomeMessage ?? ''}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              />
            </div>

            <div className="setting-item toggle">
              <label>Auto Speak Replies</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.autoSpeakReplies)}
                  onChange={(e) => setSettings({ ...settings, autoSpeakReplies: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Auto Index Responses (Local)</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.autoIndexResponses)}
                  onChange={(e) => setSettings({ ...settings, autoIndexResponses: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Auto Listen</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.autoListen)}
                  onChange={(e) => setSettings({ ...settings, autoListen: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Affirmation Loop</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.affirmationLoop)}
                  onChange={(e) => setSettings({ ...settings, affirmationLoop: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Personality Intensity: {personalityIntensity}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={personalityIntensity}
                onChange={(e) => setSettings({ ...settings, personalityIntensity: parseInt(e.target.value, 10) })}
              />
            </div>

            <div className="setting-item toggle">
              <label>Enable Sentiment Analysis</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableSentimentAnalysis)}
                  onChange={(e) => setSettings({ ...settings, enableSentimentAnalysis: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Enable Self-Correction</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableSelfCorrection)}
                  onChange={(e) => setSettings({ ...settings, enableSelfCorrection: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Search Settings */}
          <div className="settings-group">
            <h3>Search Settings</h3>
            <div className="setting-item toggle">
              <label>Enable Web Search</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableWebSearch)}
                  onChange={(e) => setSettings({ ...settings, enableWebSearch: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Search Provider</label>
              <select
                value={settings.searchProvider ?? 'google'}
                onChange={(e) => setSettings({ ...settings, searchProvider: e.target.value })}
              >
                <option value="google">Google</option>
                <option value="bing">Bing</option>
                <option value="wolfram">Wolfram Alpha</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Search Depth: {settings.searchDepth ?? 3}</label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.searchDepth ?? 3}
                onChange={(e) => setSettings({ ...settings, searchDepth: parseInt(e.target.value, 10) })}
              />
            </div>

            <div className="setting-item">
              <label>Real Search API Endpoint (Optional)</label>
              <input
                type="text"
                value={settings.realSearchApiEndpoint ?? ''}
                onChange={(e) => setSettings({ ...settings, realSearchApiEndpoint: e.target.value })}
                placeholder="e.g., [https://your-backend.com/api/search](https://your-backend.com/api/search)"
              />
            </div>
          </div>

          {/* Security Settings */}
          <div className="settings-group">
            <h3>Security & Admin</h3>
            <div className="setting-item">
              <label>Admin Key (local)</label>
              <input
                type="password"
                value={settings.adminKey ?? ''}
                onChange={(e) => setSettings({ ...settings, adminKey: e.target.value })}
                placeholder="Optional admin key for protected actions"
              />
              <div className="muted small">Used locally to authorize admin actions (pause/resume agent). Stored in browser localStorage.</div>
            </div>
          </div>

          {/* Math Settings */}
          <div className="settings-group">
            <h3>Math Settings</h3>
            <div className="setting-item toggle">
              <label>Enable Math Solving</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableMathSolving)}
                  onChange={(e) => setSettings({ ...settings, enableMathSolving: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Show Math Steps</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.showMathSteps)}
                  onChange={(e) => setSettings({ ...settings, showMathSteps: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Math Engine</label>
              <select
                value={settings.mathEngine ?? 'mathjs'}
                onChange={(e) => setSettings({ ...settings, mathEngine: e.target.value })}
              >
                <option value="mathjs">Math.js</option>
                <option value="native">Native</option>
              </select>
            </div>
          </div>

          {/* Quantum Settings */}
          <div className="settings-group">
            <h3>Quantum Settings</h3>
            <div className="setting-item toggle">
              <label>Enable Quantum Features</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableQuantum)}
                  onChange={(e) => setSettings({ ...settings, enableQuantum: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Quantum Depth: {quantumDepth} qubits</label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={quantumDepth}
                onChange={(e) => setSettings({ ...settings, quantumDepth: parseInt(e.target.value, 10) })}
                disabled={!settings.enableQuantum}
              />
            </div>
          </div>

          {/* Neural Settings */}
          <div className="settings-group">
            <h3>Neural Settings</h3>
            <div className="setting-item toggle">
              <label>Enable Neural Features</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableNeural)}
                  onChange={(e) => setSettings({ ...settings, enableNeural: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Hidden Layers: {neuralLayers}</label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={neuralLayers}
                onChange={(e) => setSettings({ ...settings, neuralLayers: parseInt(e.target.value, 10) })}
                disabled={!settings.enableNeural}
              />
            </div>
          </div>

          {/* Admin / Developer Settings */}
          <div className="settings-group">
            <h3>Admin</h3>
            <div className="setting-item">
              <label>Admin Key (used for admin endpoints)</label>
              <input
                type="text"
                value={settings.adminKey ?? ''}
                onChange={(e) => setSettings({ ...settings, adminKey: e.target.value })}
                placeholder="Enter admin key"
              />
            </div>
            <div className="setting-item">
              <button type="button" onClick={async () => {
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
              }}>Toggle External Access</button>
            </div>
          </div>

          {/* Memory & Sync Settings */}
          <div className="settings-group">
            <h3>Memory & Sync</h3>

            <div className="setting-item toggle">
              <label>Enable Auto Sync</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableAutoSync)}
                  onChange={(e) => setSettings({ ...settings, enableAutoSync: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Enable Long Term Memory</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableLongTermMemory)}
                  onChange={(e) => setSettings({ ...settings, enableLongTermMemory: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Stored Conversation</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => {
                  try {
                    const data = localStorage.getItem('aion_conversation');
                    const blob = new Blob([data || '[]'], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `aion-conversation-${new Date().toISOString().slice(0,10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (e) { console.error(e); }
                }}>Export</button>
                <button onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true);
                    showNotification('Click Clear again within 6s to confirm clearing local conversation', 'warning');
                    setTimeout(() => setConfirmClear(false), 6000);
                    return;
                  }
                  // confirmed
                  try { localStorage.removeItem('aion_conversation'); } catch (e) { /* ignore */ }
                  setConfirmClear(false);
                  showNotification('Local conversation cleared', 'success');
                }}>{confirmClear ? 'Confirm Clear' : 'Clear'}</button>
              </div>
            </div>
          </div>

          {/* Creative Settings */}
          <div className="settings-group">
            <h3>Creative Settings</h3>
            <div className="setting-item toggle">
              <label>Enable Creative Generation</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableCreativeGeneration)}
                  onChange={(e) => setSettings({ ...settings, enableCreativeGeneration: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Enable Image Generation</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableImageGeneration)}
                  onChange={(e) => setSettings({ ...settings, enableImageGeneration: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item toggle">
              <label>Enable Video Generation</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableVideoGeneration)}
                  onChange={(e) => setSettings({ ...settings, enableVideoGeneration: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
                <label>Video Resolution</label>
                <select
                    value={settings.videoResolution ?? '512x512'}
                    onChange={(e) => setSettings({ ...settings, videoResolution: e.target.value })}
                    disabled={!settings.enableVideoGeneration}
                >
                    <option value="256x256">256x256</option>
                    <option value="512x512">512x512</option>
                    <option value="1024x576">1024x576 (16:9)</option>
                </select>
            </div>

            <div className="setting-item">
              <label>Video Duration (s): {videoDuration}</label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={videoDuration}
                onChange={(e) => setSettings({ ...settings, videoDuration: parseInt(e.target.value, 10) })}
                disabled={!settings.enableVideoGeneration}
              />
            </div>

          </div>

          {/* Memory Settings */}
          <div className="settings-group">
            <h3>Memory Settings</h3>
            <div className="setting-item toggle">
              <label>Enable Long-Term Memory</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableLongTermMemory)}
                  onChange={(e) => setSettings({ ...settings, enableLongTermMemory: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item toggle">
              <label>Enable Self-Reflection</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableSelfReflection)}
                  onChange={(e) => setSettings({ ...settings, enableSelfReflection: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <label>Reflection Frequency (ms): {reflectionFrequency}</label>
              <input
                type="range"
                min="60000"
                max="600000"
                step="30000"
                value={reflectionFrequency}
                onChange={(e) => setSettings({ ...settings, reflectionFrequency: parseInt(e.target.value, 10) })}
                disabled={!settings.enableSelfReflection}
              />
            </div>
          </div>

          {/* Goal Tracking */}
          <div className="settings-group">
            <h3>Goal Tracking</h3>
            <div className="setting-item toggle">
              <label>Enable Goal Tracking</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.goalTracking)}
                  onChange={(e) => setSettings({ ...settings, goalTracking: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="settings-group">
            <h3>Knowledge Base</h3>
            <div className="setting-item toggle">
              <label>Enable Knowledge Base</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.knowledgeBase)}
                  onChange={(e) => setSettings({ ...settings, knowledgeBase: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <div style={{display:'flex', gap: '8px', alignItems: 'center', marginRight: '8px'}}>
            <label style={{fontSize: '12px', marginRight: '6px'}}>Provider Mode</label>
            <select value={providerMode} onChange={(e) => { setProviderMode(e.target.value); setSettings({...settings, providerMode: e.target.value}); }}>
              <option value="free">Free (stub)</option>
              <option value="local-first">Local-first (prefer Ollama)</option>
              <option value="openai">OpenAI (require API key)</option>
            </select>
            <button
              className="test-button"
              onClick={async () => {
                try {
                  // Persist mode to backend runtime
                  await fetch('/api/provider/mode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: providerMode }) });
                  setProviderTestResult('Mode updated — testing provider...');
                  const res = await fetch('/api/provider/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Hello from AION settings test' }) });
                  const j = await res.json();
                  if (j && j.ok) {
                    setProviderTestResult((j.response || '').slice(0, 400));
                    setSettings(prev => ({ ...prev, providerMode }));
                  } else {
                    setProviderTestResult('Test failed: ' + (j && j.error ? j.error : 'unknown'));
                  }
                } catch (err) {
                  setProviderTestResult('Provider test error: ' + String(err));
                }
                // clear after a while
                setTimeout(() => setProviderTestResult(null), 8000);
              }}
              type="button"
            >
              Test Provider
            </button>
            {providerTestResult ? <span style={{marginLeft:8, fontSize:12}}>{providerTestResult}</span> : null}
          </div>
          <button
            className="test-button"
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
            className="save-button"
            onClick={() => setShowSettings(false)}
            type="button"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;