const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PORT = 3000;

function contentTypeFor(ext) {
  switch (ext) {
    case '.html': return 'text/html';
    case '.js': return 'application/javascript';
    case '.css': return 'text/css';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(BUILD_DIR, reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': contentTypeFor(ext) });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    // Fallback: serve index.html for SPA
    const indexFile = path.join(BUILD_DIR, 'index.html');
    if (fs.existsSync(indexFile)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexFile).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end('Not found');
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

(async () => {
  server.listen(PORT, '127.0.0.1');
  console.log(`Static server started at http://localhost:${PORT}`);

  const out = { console: [], errors: [] };
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      out.console.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', err => {
      out.errors.push({ type: 'pageerror', message: err.message, stack: err.stack });
    });
    page.on('requestfailed', req => {
      out.console.push({ type: 'requestfailed', url: req.url(), reason: req.failure() ? req.failure().errorText : 'failed' });
    });

    await page.setViewport({ width: 1366, height: 768 });
    const url = `http://localhost:${PORT}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
      out.errors.push({ type: 'goto-error', message: e.message });
    });

    await new Promise(r => setTimeout(r, 1000));

    const screenshotPath = path.join(__dirname, '..', 'debug-front-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

    const rootHtml = await page.evaluate(() => document.getElementById('root') ? document.getElementById('root').innerHTML : '');
    out.rootHtml = rootHtml;

    fs.writeFileSync(path.join(__dirname, '..', 'debug-front-log.json'), JSON.stringify(out, null, 2));
    console.log('CAPTURE_DONE');
  } catch (e) {
    console.error('CAPTURE_ERROR', e && e.message);
    process.exitCode = 2;
  } finally {
    await browser.close();
    server.close();
  }
})();
