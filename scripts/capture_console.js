const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE-LOG', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE-ERROR', err.message));
    page.on('requestfailed', req => console.log('REQUEST-FAILED', req.url(), req.failure().errorText));
    page.on('response', res => {
      const url = res.url();
      if (url.includes('/static/js/') && res.status() >= 400) {
        console.log('BUNDLE-ERROR', res.status(), url);
      }
    });

    const url = process.argv[2] || 'http://localhost:5000/?skip_splash=1';
    console.log('Loading', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 }).catch(e => console.log('GOTO-ERROR', e.message));

    try {
      const html = await page.content();
      console.log('PAGE-CONTENT-LEN', html.length);
    } catch (e) { console.log('CONTENT-ERR', e.message); }

    await page.screenshot({ path: 'tmp_capture.png', fullPage: true }).catch(e => console.log('SS-ERR', e.message));

    await browser.close();
  } catch (e) {
    console.error('SCRIPT-ERROR', e);
    process.exit(2);
  }
})();