const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const buildIndex = path.resolve(__dirname, '../build/index.html');
    if (!fs.existsSync(buildIndex)) {
      console.error('Build index not found at', buildIndex);
      process.exit(2);
    }
    let html = fs.readFileSync(buildIndex, 'utf8');

    // Rewrite absolute /static/ paths to relative static/ so they load from the build folder when set via setContent
    html = html.replace(/\"\/static\//g, '"static/').replace(/\'\/static\//g, "'static/");

    // Insert base href so relative URLs resolve to the build folder
    const baseHref = `file:///${path.resolve(__dirname, '../build').replace(/\\/g, '/')}/`;
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`);

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

    console.log('Setting HTML content from', buildIndex);
    await page.setContent(html, { waitUntil: 'networkidle2', timeout: 20000 }).catch(e => console.log('SETCONTENT-ERROR', e && e.message));

    try {
      const htmlContent = await page.content();
      console.log('PAGE-CONTENT-LEN', htmlContent.length);
    } catch (e) { console.log('CONTENT-ERR', e.message); }

    await page.screenshot({ path: path.resolve(__dirname, '../tmp_capture.png'), fullPage: true }).catch(e => console.log('SS-ERR', e.message));

    await browser.close();
  } catch (e) {
    console.error('SCRIPT-ERROR', e && e.stack ? e.stack : e);
    process.exit(2);
  }
})();