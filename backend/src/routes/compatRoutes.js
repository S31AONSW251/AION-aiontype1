const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const AionBrainCore = require('../brain/aionBrainCore');

const router = express.Router();
const brain = new AionBrainCore();

const dataDir = path.resolve(__dirname, '../../data');
const proceduresPath = path.join(dataDir, 'procedures.json');
const startedAt = Date.now();

const runtime = {
  providerMode: process.env.AION_PROVIDER_MODE || 'free',
  allowExternal: process.env.AION_ALLOW_EXTERNAL === 'true',
  agentStatus: 'running',
};

async function ensureDataFile(filePath, fallback) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

async function readJson(filePath, fallback) {
  try {
    await ensureDataFile(filePath, fallback);
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getPrompt(body = {}) {
  return String(body.prompt || body.text || body.message || body.input || body.query || '').trim();
}

function normalizeMemory(memory) {
  return {
    id: memory.id,
    title: memory.type || 'AION memory',
    text: memory.text || '',
    snippet: memory.text || '',
    source: 'aion-memory',
    createdAt: memory.createdAt,
    tags: memory.tags || [],
  };
}

async function searchLocalKnowledge(query, limit = 8) {
  const q = String(query || '').trim();
  const memories = await brain.memory.searchMemory(q);
  const procedures = await readJson(proceduresPath, []);
  const lower = q.toLowerCase();
  const procedureResults = procedures
    .filter((procedure) => {
      if (!lower) return true;
      return `${procedure.name || ''} ${(procedure.steps || []).join(' ')}`.toLowerCase().includes(lower);
    })
    .map((procedure) => ({
      id: procedure.id,
      title: procedure.name,
      snippet: Array.isArray(procedure.steps) ? procedure.steps.join(' -> ') : '',
      source: 'aion-procedure',
      type: 'procedure',
      url: '#procedures',
      score: lower ? 0.72 : 0.5,
    }));

  return [
    ...memories.map((memory) => ({
      ...normalizeMemory(memory),
      url: '#memories',
      type: 'memory',
      score: lower ? 0.8 : 0.5,
    })),
    ...procedureResults,
  ].slice(0, limit);
}

async function drainRequest(req, maxBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(bytes));
    req.on('error', reject);
  });
}

function sendNdjson(res, event) {
  res.write(`${JSON.stringify(event)}\n`);
}

async function localBrainReply(prompt, context = {}) {
  const result = await brain.think(prompt, context);
  return {
    ok: true,
    response: result.response || '',
    text: result.response || '',
    source: 'aion-brain-local',
    model: 'aion-brain-compat',
    emotion: result.emotion,
    related: result.related || [],
    suggestedQuestion: result.suggestedQuestion,
    provenance: [
      {
        source: 'backend/src/brain/aionBrainCore.js',
        label: 'AION Backend Brain',
        type: 'local',
      },
    ],
  };
}

router.get('/health', async (req, res) => {
  res.json({ ok: true, service: 'aion-backend', uptime: process.uptime(), startedAt });
});

router.get('/api/status', async (req, res) => {
  const status = await brain.getStatus();
  res.json({
    ok: true,
    version: '0.1.0-local',
    host: req.hostname || 'localhost',
    port: Number(process.env.PORT || 5000),
    uptime: process.uptime(),
    startedAt,
    redis_connected: false,
    db_file: path.join(dataDir, 'memories.json'),
    aion_allow_external: runtime.allowExternal,
    brain: status,
    routes: {
      brain: true,
      chat: true,
      streaming: true,
      retrieval: true,
      procedures: true,
      mediaProviders: 'local-image-visualization-only',
    },
  });
});

router.get('/api/status/providers', (req, res) => {
  res.json({
    ok: true,
    mode: runtime.providerMode,
    providers: {
      aionBrain: {
        online: true,
        label: 'AION Backend Brain',
        source: 'local',
        mode: runtime.providerMode,
      },
      localImageVisualization: {
        online: true,
        label: 'Local image visualization',
        source: 'local',
      },
    },
  });
});

router.get('/api/provider/mode', (req, res) => {
  res.json({ ok: true, mode: runtime.providerMode });
});

router.post('/api/provider/mode', (req, res) => {
  runtime.providerMode = String(req.body?.mode || 'free');
  res.json({ ok: true, mode: runtime.providerMode });
});

router.post('/api/provider/test', async (req, res) => {
  try {
    const prompt = getPrompt(req.body) || 'Hello from AION settings test';
    const reply = await localBrainReply(prompt, { route: '/api/provider/test' });
    res.json(reply);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post(['/api/chat', '/api/ai', '/ai'], async (req, res) => {
  try {
    const prompt = getPrompt(req.body);
    const reply = await localBrainReply(prompt, req.body?.context || {});
    res.json(reply);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/api/generate/stream', async (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const prompt = getPrompt(req.body);
    sendNdjson(res, { type: 'status', status: 'thinking', source: 'aion-brain-local' });
    const reply = await localBrainReply(prompt, req.body?.context || {});
    const text = reply.text || '';
    const chunks = text.match(/.{1,48}(\s|$)/g) || [text];
    for (const chunk of chunks) {
      sendNdjson(res, { type: 'token', text: chunk });
    }
    sendNdjson(res, { type: 'final', text: '', provenance: reply.provenance });
    res.end();
  } catch (error) {
    sendNdjson(res, { type: 'error', error: error.message });
    res.end();
  }
});

router.get('/api/agent/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const write = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);
  write({ type: 'status', status: runtime.agentStatus, source: 'aion-backend' });
  const timer = setInterval(() => {
    write({ type: 'heartbeat', status: runtime.agentStatus, uptime: process.uptime(), at: nowIso() });
  }, 15000);

  req.on('close', () => clearInterval(timer));
});

router.post('/api/agent/control', (req, res) => {
  const action = String(req.body?.action || '').toLowerCase();
  if (action === 'pause') runtime.agentStatus = 'paused';
  if (action === 'resume' || action === 'start') runtime.agentStatus = 'running';
  if (action === 'stop') runtime.agentStatus = 'stopped';
  res.json({ ok: true, status: runtime.agentStatus, action });
});

router.post('/api/retrieve', async (req, res) => {
  try {
    const query = getPrompt(req.body);
    const results = await searchLocalKnowledge(query, Number(req.body?.limit || 5));
    res.json({
      ok: true,
      query,
      contexts: results.map((item) => `${item.source}: ${item.snippet || item.text || item.title}`),
      results,
      source: 'aion-local-memory',
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message, contexts: [] });
  }
});

router.post(['/api/advanced-search', '/api/hybrid-search', '/api/search'], async (req, res) => {
  try {
    const query = getPrompt(req.body) || String(req.query?.query || '');
    const results = await searchLocalKnowledge(query, 12);
    res.json({
      ok: true,
      query,
      providers: req.body?.providers || ['aion'],
      results,
      raw_results: results,
      summary: {
        source: 'AION local search',
        text: results.length
          ? `Found ${results.length} local AION memory/procedure result(s).`
          : 'No local AION memory or procedure results found yet.',
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message, results: [] });
  }
});

router.post('/api/insight', async (req, res) => {
  const query = getPrompt(req.body);
  const results = await searchLocalKnowledge(query, 5);
  res.json({
    ok: true,
    insight: results.length
      ? `AION found ${results.length} local signal(s) connected to "${query}".`
      : `AION has no stored local insight for "${query}" yet.`,
    source: 'aion-local-memory',
    results,
  });
});

router.post(['/api/upload', '/api/index-file'], async (req, res) => {
  try {
    const bytesReceived = await drainRequest(req);
    const memory = await brain.memory.saveMemory({
      type: req.path.includes('index') ? 'indexed-file' : 'uploaded-file',
      text: `Received file payload through ${req.path}. Bytes received: ${bytesReceived}.`,
      tags: ['file', 'upload'],
      metadata: { path: req.path, bytesReceived },
      createdAt: Date.now(),
    });
    res.json({
      ok: true,
      id: memory.id,
      bytesReceived,
      analysis: {
        mime_type: req.headers['content-type'] || 'application/octet-stream',
        size_human: `${bytesReceived} B`,
        content_type: 'uploaded-file',
        content_summary: 'File received by AION backend. Deep extraction requires a parser provider.',
        ai_understanding: {
          type: 'structured',
          analysis: {
            source: 'AION backend upload compatibility route',
            status: 'stored metadata',
          },
        },
      },
    });
  } catch (error) {
    res.status(413).json({ ok: false, error: error.message });
  }
});

router.post('/api/analyze-file', async (req, res) => {
  res.json({
    ok: true,
    source: 'aion-backend-local',
    analysis: {
      status: 'metadata-only',
      message: 'AION backend is online. Add document parsers/OCR to enable deep file analysis.',
      file_url: req.body?.file_url || null,
    },
  });
});

router.get('/api/procedures', async (req, res) => {
  const procedures = await readJson(proceduresPath, []);
  res.json({ ok: true, procedures });
});

router.post('/api/procedures', async (req, res) => {
  const procedures = await readJson(proceduresPath, []);
  const procedure = {
    id: makeId('procedure'),
    name: String(req.body?.name || 'Untitled procedure'),
    steps: Array.isArray(req.body?.steps) ? req.body.steps : [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    runCount: 0,
  };
  procedures.unshift(procedure);
  await writeJson(proceduresPath, procedures);
  res.json({ ok: true, procedure });
});

router.get('/api/procedures/search', async (req, res) => {
  const q = String(req.query?.q || '').toLowerCase();
  const procedures = await readJson(proceduresPath, []);
  const results = procedures.filter((procedure) => {
    return `${procedure.name || ''} ${(procedure.steps || []).join(' ')}`.toLowerCase().includes(q);
  });
  res.json({ ok: true, results });
});

router.post('/api/procedures/:id/execute', async (req, res) => {
  const procedures = await readJson(proceduresPath, []);
  const procedure = procedures.find((item) => item.id === req.params.id);
  if (!procedure) {
    res.status(404).json({ ok: false, error: 'Procedure not found' });
    return;
  }
  procedure.runCount = Number(procedure.runCount || 0) + 1;
  procedure.lastRunAt = nowIso();
  procedure.updatedAt = nowIso();
  await writeJson(proceduresPath, procedures);
  await brain.memory.saveMemory({
    type: 'procedure-run',
    text: `Executed procedure "${procedure.name}" with ${procedure.steps.length} step(s).`,
    tags: ['procedure', 'execution'],
    metadata: { procedureId: procedure.id },
  });
  res.json({ ok: true, id: procedure.id, name: procedure.name, procedure });
});

router.post('/api/sync-conversation', async (req, res) => {
  const conversation = Array.isArray(req.body?.conversation) ? req.body.conversation : [];
  if (conversation.length) {
    await brain.memory.saveMemory({
      type: 'conversation-sync',
      text: `Synced ${conversation.length} conversation entries.`,
      tags: ['sync', 'conversation'],
      metadata: { lastEntry: conversation[conversation.length - 1] },
    });
  }
  res.json({ ok: true, synced: conversation.length });
});

router.post('/api/sync-outgoing', async (req, res) => {
  await brain.memory.saveMemory({
    type: 'offline-outbox',
    text: JSON.stringify(req.body || {}).slice(0, 2000),
    tags: ['sync', 'offline'],
  });
  res.json({ ok: true, syncedAt: nowIso() });
});

router.get('/api/check-updates', (req, res) => {
  res.json({ ok: true, updateAvailable: false, version: '0.1.0-local' });
});

router.post('/api/consciousness/process-interaction', async (req, res) => {
  await brain.memory.saveMemory({
    type: 'consciousness-interaction',
    text: String(req.body?.content || req.body?.event_type || '').slice(0, 2000),
    tags: ['consciousness', req.body?.event_type || 'interaction'].filter(Boolean),
    metadata: req.body || {},
  });
  res.json({ ok: true, status: 'recorded', source: 'aion-backend-local' });
});

router.get('/api/consciousness/status', async (req, res) => {
  const status = await brain.getStatus();
  res.json({
    ok: true,
    consciousness_level: Math.min(100, 40 + status.memCount),
    mode: 'local-symbolic',
    source: 'aion-backend-local',
    memory_count: status.memCount,
  });
});

router.post('/api/consciousness/evolve', async (req, res) => {
  const memory = await brain.memory.saveMemory({
    type: 'consciousness-evolution',
    text: 'AION local consciousness evolution checkpoint requested.',
    tags: ['consciousness', 'evolution'],
  });
  res.json({ ok: true, evolved: true, checkpoint: memory.id });
});

router.get('/api/assets', (req, res) => {
  res.json({ ok: true, assets: [] });
});

router.delete('/api/assets/:filename', (req, res) => {
  res.json({ ok: true, deleted: req.params.filename, source: 'local-empty-library' });
});

router.get('/api/memory/pending', (req, res) => {
  res.json({ ok: true, pending: [] });
});

router.post('/api/memory/pending/approve', (req, res) => {
  res.json({ ok: true, approved: req.body?.id || null });
});

router.get('/api/memory/flags', (req, res) => {
  res.json({ ok: true, flags: [] });
});

router.post('/api/memory/flag/resolve', (req, res) => {
  res.json({ ok: true, resolved: req.body?.id || null, action: req.body?.action || 'resolved' });
});

router.post('/api/contact', async (req, res) => {
  await brain.memory.saveMemory({
    type: 'contact',
    text: JSON.stringify(req.body || {}).slice(0, 2000),
    tags: ['contact'],
  });
  res.json({ ok: true, received: true });
});

router.post('/api/fetch-asset', (req, res) => {
  res.json({
    ok: true,
    url: req.body?.url || null,
    source: 'pass-through',
    note: 'Remote asset fetching is not enabled; returning the submitted URL.',
  });
});

router.get('/ollama/models', (req, res) => {
  res.json({ ok: true, models: [], source: 'provider-not-configured' });
});

router.post(['/generate-code', '/api/generate-code'], async (req, res) => {
  const prompt = getPrompt(req.body);
  const reply = await localBrainReply(`Generate code plan: ${prompt}`, req.body || {});
  res.json({ ok: true, code: reply.text, response: reply.text, source: reply.source });
});

router.post('/generate-image', (req, res) => {
  const prompt = getPrompt(req.body) || 'AION black glass visualization';
  const safePrompt = prompt.replace(/[<>&"]/g, ' ').slice(0, 160);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><radialGradient id="g" cx="50%" cy="38%" r="62%"><stop offset="0%" stop-color="#303743"/><stop offset="42%" stop-color="#080a0f"/><stop offset="100%" stop-color="#000000"/></radialGradient><linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".5" stop-color="#8fd7ff" stop-opacity=".75"/><stop offset="1" stop-color="#ffffff" stop-opacity=".9"/></linearGradient></defs><rect width="1024" height="1024" fill="#000"/><circle cx="512" cy="450" r="330" fill="url(#g)" stroke="#ffffff" stroke-opacity=".18" stroke-width="2"/><ellipse cx="512" cy="390" rx="250" ry="84" fill="#ffffff" opacity=".06"/><path d="M224 642 C360 548 664 548 800 642" fill="none" stroke="url(#s)" stroke-width="3" opacity=".7"/><text x="512" y="492" text-anchor="middle" font-family="Segoe UI, Arial" font-size="92" font-weight="800" fill="#f7fbff" letter-spacing="8">AION</text><text x="512" y="570" text-anchor="middle" font-family="Segoe UI, Arial" font-size="26" fill="#b9c7d6">${safePrompt}</text></svg>`;
  const imageUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  res.json({
    ok: true,
    imageUrl,
    source: 'local-visualization',
    note: 'Generated by local AION visualization fallback, not an external image model.',
  });
});

router.post('/generate-video', (req, res) => {
  res.status(501).json({
    ok: false,
    error: 'Video generation provider is not configured.',
    source: 'provider-not-configured',
  });
});

router.get('/admin/status', async (req, res) => {
  const status = await brain.getStatus();
  res.json({
    ok: true,
    aion_allow_external: runtime.allowExternal,
    providerMode: runtime.providerMode,
    agentStatus: runtime.agentStatus,
    brain: status,
  });
});

router.post('/admin/allow-external', (req, res) => {
  if (typeof req.body?.allow === 'boolean') {
    runtime.allowExternal = req.body.allow;
  } else {
    runtime.allowExternal = !runtime.allowExternal;
  }
  res.json({
    ok: true,
    AION_ALLOW_EXTERNAL: runtime.allowExternal,
    aion_allow_external: runtime.allowExternal,
  });
});

router.get('/webcache', (req, res) => {
  res.json({ ok: true, entries: [], source: 'local-empty-cache' });
});

router.post('/session/consent', (req, res) => {
  res.json({ ok: true, consent: Boolean(req.body?.consent), session_id: req.body?.session_id || null });
});

module.exports = router;
