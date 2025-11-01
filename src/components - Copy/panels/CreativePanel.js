import React, { useState, useEffect, useRef } from 'react';
import './CreativePanel.css';
// Syntax highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CreativePanel = ({ 
    setActiveTab, 
    generateCreativeContent, 
    generateImage,
    generateVideo, // NEW
    isThinking, 
    isImageGenerating,
    isVideoGenerating, // NEW
    creativeOutput,
    settings,
    userInput,
    generatedImage,
    generatedVideo // NEW
}) => {
  const [selectedType, setSelectedType] = useState('poem');
  const [customPrompt, setCustomPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [creativity, setCreativity] = useState(0.7);
  const [length, setLength] = useState('medium');
  const [stylePreset, setStylePreset] = useState('any');
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { type: 'image'|'video', src }
  const [palette, setPalette] = useState('cyan');
  const promptRef = useRef(null);
  // Model selector support
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  
  const creativeTypes = [
    { id: 'poem', name: 'Poem', icon: 'fa-feather-alt' },
    { id: 'story', name: 'Short Story', icon: 'fa-book-open' },
    { id: 'code', name: 'Code Snippet', icon: 'fa-code' },
    { id: 'essay', name: 'Essay', icon: 'fa-file-alt' },
    { id: 'joke', name: 'Joke', icon: 'fa-smile-beam' },
    { id: 'quote', name: 'Inspirational Quote', icon: 'fa-quote-left' }
  ];

  const quickPrompts = [
    { id: 'fantasy-scene', label: 'Vivid fantasy landscape' },
    { id: 'tech-explainer', label: 'Explain quantum computing simply' },
    { id: 'haiku', label: 'Write a haiku about autumn' },
    { id: 'product-copy', label: 'Short product description for a smartwatch' }
  ];

  const handleGenerateWithCustomPrompt = () => {
    const promptToUse = customPrompt.trim() || userInput || '';
    try {
      // Preferred: generateCreativeContent(type, prompt, options)
      generateCreativeContent(selectedType, promptToUse, { model: selectedModel, creativity, length, style: stylePreset });
    } catch (e) {
      // Backwards compatible fallback
      generateCreativeContent(selectedType, promptToUse, { creativity, length, style: stylePreset });
    }
  };

  const handleGenerateVideoWithCustomPrompt = () => {
    const promptForVideo = customPrompt.trim() || userInput;
    if (promptForVideo) {
      generateVideo(promptForVideo, { creativity, length });
    } else {
        alert("Please provide a prompt for video generation.");
    }
  };

  const changePalette = (p) => {
    setPalette(p);
    try {
      const container = document.querySelector('.app-container');
      if (!container) return;
      container.classList.remove('palette-cyan','palette-magenta','palette-lime');
      container.classList.add(`palette-${p}`);
    } catch (e) { console.warn('Failed to set palette', e); }
  };

  const outputText = typeof creativeOutput === 'string' ? creativeOutput : '';
  const isCodeSnippet = outputText.includes('```');
  const isTextOutput = Boolean(outputText) && !isCodeSnippet;

  const parseFencedCode = (text) => {
    // Match ```lang\ncode\n```
    const m = text.match(/```(\w+)?\n([\s\S]*)```/);
    if (m) return { lang: m[1] || null, code: m[2] };
    // fallback: remove backticks
    if (text.includes('```')) return { lang: null, code: text.replace(/```/g, '') };
    return null;
  };

  useEffect(() => {
    // Add to history when creativeOutput changes
    if (creativeOutput) {
      const entry = { id: Date.now(), type: selectedType, prompt: customPrompt || userInput, output: creativeOutput };
      setHistory(prev => [entry, ...prev].slice(0, 20));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creativeOutput]);

  useEffect(() => {
    // keyboard shortcut: Ctrl/Cmd + Enter to generate
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleGenerateWithCustomPrompt();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customPrompt, selectedType, userInput]);

  useEffect(() => {
    // Fetch available Ollama models to let user choose
    let mounted = true;
    fetch('/ollama/models').then(r => r.json()).then(j => {
      if (!mounted) return;
      if (j && j.ok && Array.isArray(j.models)) {
        const models = j.models.filter(Boolean);
        setAvailableModels(models);
        if (models.length > 0 && !selectedModel) setSelectedModel(models[0]);
      }
    }).catch((err) => { console.warn('Failed to fetch ollama models', err); });
    return () => { mounted = false; };
  }, [selectedModel]);

  useEffect(() => {
    // typing indicator for prompt textarea
    const el = promptRef.current;
    if (!el) return;
    const onInput = () => {
      setIsTyping(true);
      if (el._typingTimeout) clearTimeout(el._typingTimeout);
      el._typingTimeout = setTimeout(() => setIsTyping(false), 1200);
    };
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  // typing effect listens to promptRef only; stable handler -- disable exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lightbox close on Escape
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.key === 'Escape' && lightbox) setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <div className="creative-panel">
      <div className="creative-header">
        <h3>Creative Generation</h3>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div className="palette-switch">
            <button className={`preset ${palette==='cyan'?'active':''}`} onClick={()=>changePalette('cyan')}>Cyan</button>
            <button className={`preset ${palette==='magenta'?'active':''}`} onClick={()=>changePalette('magenta')}>Magenta</button>
            <button className={`preset ${palette==='lime'?'active':''}`} onClick={()=>changePalette('lime')}>Lime</button>
          </div>
          <button className="back-button" onClick={() => setActiveTab("chat")}>
            <i className="icon-arrow-left"></i> Back to Chat
          </button>
        </div>
      </div>

      <div className="creative-description">
        <p>Explore AION's creative capabilities. Generate text, images, and videos based on your prompts.</p>
      </div>

  <div className="creative-controls">
        <div className="type-selector">
          <label>Select creative type for text generation:</label>
          {availableModels.length > 0 && (
            <div className="model-selector" style={{ marginTop: 8 }}>
              <label style={{ marginRight: 8 }}>Model:</label>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
          <div className="type-buttons">
            {creativeTypes.map(type => (
              <button
                key={type.id}
                className={`type-button ${selectedType === type.id ? 'active' : ''}`}
                onClick={() => setSelectedType(type.id)}
              >
                <i className={`fas ${type.icon}`}></i>
                {type.name}
              </button>
            ))}
          </div>
          <div className="presets-row">
            <label>Style preset:</label>
            <div className="preset-buttons">
              <button className={`preset ${stylePreset==='any'?'active':''}`} onClick={() => setStylePreset('any')}>Any</button>
              <button className={`preset ${stylePreset==='poetic'?'active':''}`} onClick={() => setStylePreset('poetic')}>Poetic</button>
              <button className={`preset ${stylePreset==='technical'?'active':''}`} onClick={() => setStylePreset('technical')}>Technical</button>
              <button className={`preset ${stylePreset==='humorous'?'active':''}`} onClick={() => setStylePreset('humorous')}>Humorous</button>
            </div>
          </div>
        </div>

        <div className="custom-prompt">
          <label>Prompt for all generation types:</label>
          <textarea
            value={customPrompt || userInput}
            ref={promptRef}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter a prompt here for text, image, or video generation..."
            rows="3"
          />
          <div className="controls-row">
            <div className="slider-group">
              <label>Creativity: <strong>{Math.round(creativity*100)}%</strong></label>
              <input type="range" min="0" max="1" step="0.01" value={creativity} onChange={(e)=>setCreativity(parseFloat(e.target.value))} />
            </div>
            <div className="length-group">
              <label>Length:</label>
              <select value={length} onChange={e=>setLength(e.target.value)}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>
          <div className="quick-prompts">
            {quickPrompts.map(q => (
              <button key={q.id} className="quick-prompt-btn" onClick={() => setCustomPrompt(q.label)}>{q.label}</button>
            ))}
          </div>
        </div>

        <div className="generation-actions">
          <button
            className="generate-button primary"
            onClick={handleGenerateWithCustomPrompt}
            disabled={isThinking || isImageGenerating || isVideoGenerating}
          >
            {isThinking ? <span className="btn-spinner"/> : 'Generate Content'}
          </button>
          
          <button
            className="generate-button"
            onClick={() => generateImage(customPrompt || userInput)}
            disabled={isThinking || isImageGenerating || isVideoGenerating || !settings.enableImageGeneration}
          >
            {isImageGenerating ? <span className="btn-spinner"/> : 'Generate Image'}
          </button>

          <button
            className="generate-button"
            onClick={handleGenerateVideoWithCustomPrompt}
            disabled={isThinking || isImageGenerating || isVideoGenerating || !settings.enableVideoGeneration}
          >
            {isVideoGenerating ? <span className="btn-spinner"/> : 'Generate Video'}
          </button>
        </div>
        <div className="status-row">
          {isTyping && <span className="typing-indicator">Typing…</span>}
          {(isThinking || isImageGenerating || isVideoGenerating) && <span className="busy-indicator">Working…</span>}
        </div>
      </div>

      {creativeOutput && (
        <div className="creative-output-section">
          <div className="output-header">
            <h4>Generated Content</h4>
            <div className="output-actions">
              <button className="action-button" onClick={() => navigator.clipboard.writeText(creativeOutput)} aria-label="Copy output">
                Copy
              </button>
              <button className="action-button" onClick={() => window.print()} aria-label="Print output">
                Print
              </button>
              <button className="action-button" onClick={() => handleGenerateWithCustomPrompt()} aria-label="Regenerate">
                Regenerate
              </button>
            </div>
          </div>
          
          <div className={`output-content ${isCodeSnippet ? 'code-output' : ''}`}>
            {isCodeSnippet ? (() => {
              const parsed = parseFencedCode(creativeOutput);
              const code = parsed ? parsed.code : creativeOutput.replace(/```/g, '');
              const lang = parsed ? parsed.lang : null;
              const themeStyle = (typeof document !== 'undefined' && document.body && document.body.classList && document.body.classList.contains('light-theme')) ? oneLight : oneDark;
              return (
                <SyntaxHighlighter language={lang || null} style={themeStyle} className="code-block">
                  {code}
                </SyntaxHighlighter>
              );
            })() : isTextOutput ? (
              <div className="formatted-output markdown-output">
                {creativeOutput.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="image-output-section">
          <h4>Generated Image</h4>
          <div className="image-container">
            <img src={`http://127.0.0.1:5000${generatedImage}`} alt="AI generated visual" onClick={()=>setLightbox({type:'image', src:`http://127.0.0.1:5000${generatedImage}`})} />
            <div className="image-actions">
              <a href={`http://127.0.0.1:5000${generatedImage}`} download="aion-creation.png" className="download-button">
                Download
              </a>
              <button className="view-button" onClick={()=>setLightbox({type:'image', src:`http://127.0.0.1:5000${generatedImage}`})}>View</button>
            </div>
          </div>
        </div>
      )}

      {generatedVideo && (
        <div className="video-output-section">
          <h4>Generated Video</h4>
          <div className="video-container">
            <video controls src={generatedVideo} style={{ maxWidth: '100%', borderRadius: '8px' }} onClick={()=>setLightbox({type:'video', src:generatedVideo})} />
            <div className="video-actions">
              <a href={generatedVideo} download="aion-generated-video.mp4" className="download-button">
                  Download Video
              </a>
              <button className="view-button" onClick={()=>setLightbox({type:'video', src:generatedVideo})}>View</button>
            </div>
          </div>
        </div>
      )}


      {history.length > 0 && (
        <div className="generation-history">
          <div className="history-header">
            <h4>Recent Generations</h4>
            <button className="collapse-btn" onClick={()=>setHistoryCollapsed(h=>!h)}>{historyCollapsed? 'Expand' : 'Collapse'}</button>
          </div>
          {!historyCollapsed && (
            <ul>
              {history.map(h => (
                <li key={h.id} className="history-item">
                  <div className="history-meta">
                    <strong>{h.type}</strong> — <span className="prompt-snippet">{(h.prompt || '').slice(0,80)}</span>
                  </div>
                  <div className="history-actions">
                    <button onClick={() => { setCustomPrompt(h.prompt); setSelectedType(h.type); }} className="action-button">Use Prompt</button>
                    <button onClick={() => navigator.clipboard.writeText(h.output)} className="action-button">Copy Output</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="creative-tips">
        <h4>Tips for better results:</h4>
        <ul>
          <li>Be specific about style, tone, and length in your prompt.</li>
          <li>For code, specify the programming language and purpose.</li>
          <li>For images & videos, include details about style, composition, and mood.</li>
        </ul>
      </div>
      {lightbox && (
        <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e)=>e.stopPropagation()}>
            {lightbox.type === 'image' ? (
              <img src={lightbox.src} alt="preview" />
            ) : (
              <video controls src={lightbox.src} style={{maxWidth:'100%'}} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativePanel;