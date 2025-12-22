const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const root = path.join(__dirname, '..', 'build');

app.use(express.static(root));
app.get('/__health', (req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('*', (req, res) => res.sendFile(path.join(root, 'index.html')));

app.listen(port, () => {
  console.log(`Static server running on http://127.0.0.1:${port}`);
});
