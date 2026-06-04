const express = require('express');
// use built-in express body parsing
const brainRoutes = require('./src/routes/brainRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount brain routes under /api/brain
app.use('/api/brain', brainRoutes);

// Lightweight placeholder for existing /api/messages so the frontend won't break
app.post('/api/messages', (req, res) => {
  const text = (req.body && req.body.text) || (req.query && req.query.text) || '';
  res.json({ id: `srv-${Date.now()}`, response: `Echo (backend placeholder): ${text}` });
});

// Generic API fallback
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No API route matched: ${req.originalUrl}` });
});

app.listen(port, () => console.log(`AION backend (brain) listening on ${port}`));
