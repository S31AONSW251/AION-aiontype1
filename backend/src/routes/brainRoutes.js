const express = require('express');
const AionBrainCore = require('../brain/aionBrainCore');

const router = express.Router();
const brain = new AionBrainCore();

router.get('/status', async (req, res) => {
  try {
    const s = await brain.getStatus();
    res.json({ ok: true, status: s });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post('/think', async (req, res) => {
  const { input, context } = req.body || {};
  try {
    const out = await brain.think(input, context);
    res.json(out || { response: '' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/emotion', async (req, res) => {
  const { text } = req.body || {};
  try {
    const out = await brain.detectEmotionalState(text);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/reflect', async (req, res) => {
  const { period } = req.body || {};
  try {
    const out = await brain.generateDailyReflection(period);
    res.json({ reflection: out });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/goal', async (req, res) => {
  const { action, payload } = req.body || {};
  try {
    let out;
    if (action === 'create') out = await brain.createActionPlan(payload);
    else out = { error: 'unsupported action' };
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/memory-summary', async (req, res) => {
  try {
    const out = await brain.memory.exportMemory();
    res.json({ memories: out });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/self-upgrade-plan', async (req, res) => {
  try {
    const plan = await brain.suggestSelfUpgrade();
    res.json({ plan });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
