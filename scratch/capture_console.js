const puppeteer = require('puppeteer-core');
const fs = require('fs');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

let executablePath = edgePaths.find(p => fs.existsSync(p));

(async () => {
  console.log('Launching Edge with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('[BROWSER PAGE ERROR]', err.message);
    console.error(err.stack);
  });

  page.on('requestfailed', req => {
    console.error('[BROWSER REQUEST FAILED]', req.url(), req.failure()?.errorText);
  });

  try {
    console.log('Navigating to http://localhost:8080/...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 10000 });
    const content = await page.content();
    console.log('Page loaded. Content length:', content.length);
    console.log('Root element HTML:', await page.$eval('#root', el => el.innerHTML));
  } catch (e) {
    console.error('Navigation error:', e.message);
  } finally {
    await browser.close();
  }
})();
