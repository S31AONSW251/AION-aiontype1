const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
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
      out.console.push({ type: 'requestfailed', url: req.url(), reason: req.failure().errorText });
    });

    await page.setViewport({ width: 1366, height: 768 });
    const url = 'http://localhost:3000';
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
      out.errors.push({ type: 'goto-error', message: e.message });
    });

    // Wait briefly to let runtime errors surface
    await new Promise(r => setTimeout(r, 1000));

    const screenshotPath = path.join(__dirname, '..', 'debug-front-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

    // Also capture the innerHTML of #root
    const rootHtml = await page.evaluate(() => document.getElementById('root') ? document.getElementById('root').innerHTML : '');
    out.rootHtml = rootHtml;

    // Save logs
    fs.writeFileSync(path.join(__dirname, '..', 'debug-front-log.json'), JSON.stringify(out, null, 2));
    console.log('CAPTURE_DONE');
  } catch (e) {
    console.error('CAPTURE_ERROR', e && e.message);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
