const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const buildDir = path.resolve(__dirname, '../build');

function contentTypeFromExt(ext) {
  const map = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

(async () => {
  const server = http.createServer((req, res) => {
    try {
      let reqPath = decodeURIComponent(new URL(req.url, `http://localhost`).pathname);
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      // remove querystring
      reqPath = reqPath.split('?')[0];

      // sanitize
      const fullPath = path.join(buildDir, reqPath.replace(/^\//, ''));
      if (!fullPath.startsWith(buildDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }
      if (!fs.existsSync(fullPath)) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(fs.readFileSync(path.join(fullPath, 'index.html')));
      }
      const ext = path.extname(fullPath);
      res.writeHead(200, { 'Content-Type': contentTypeFromExt(ext) });
      fs.createReadStream(fullPath).pipe(res);
    } catch (e) {
      res.writeHead(500);
      res.end('Server error');
    }
  });

  server.listen(0, '127.0.0.1', async () => {
    const addr = server.address();
    const url = `http://127.0.0.1:${addr.port}/?skip_splash=1`;
    console.log('Local server running at', url);

    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();

      page.on('console', msg => console.log('PAGE-LOG', msg.type(), msg.text()));
      page.on('pageerror', err => console.log('PAGE-ERROR', err.message));
      page.on('requestfailed', req => console.log('REQUEST-FAILED', req.url(), req.failure() && req.failure().errorText));
      page.on('response', res => {
        const url = res.url();
        if (url.includes('/static/js/') && res.status() >= 400) {
          console.log('BUNDLE-ERROR', res.status(), url);
        }
      });

      console.log('Loading', url);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 }).catch(e => console.log('GOTO-ERROR', e && e.message));

      try {
        const html = await page.content();
        console.log('PAGE-CONTENT-LEN', html.length);
      } catch (e) { console.log('CONTENT-ERR', e && e.message); }

      await page.screenshot({ path: path.resolve(__dirname, '../tmp_capture.png'), fullPage: true }).catch(e => console.log('SS-ERR', e && e.message));

      await browser.close();
    } catch (e) {
      console.error('CAPTURE-ERROR', e && e.stack ? e.stack : e);
    } finally {
      server.close();
      console.log('Server closed');
    }
  });
})();