const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const base = 'http://localhost:4174';
  const routes = ['/', '/about', '/faculty', '/faculty/aamera', '/faculty/abdullah', '/faculty/tayyaba', '/results', '/programs', '/contact', '/student-success', '/testimonials', '/privacy-policy', '/terms-of-service', '/current-students', '/login', '/admin-portal', '/teacher-portal', '/student-portal', '/non-existent'];
  const outDir = path.resolve('artifacts','qa-screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const findings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') findings.push({type:'console', text: msg.text(), url: page.url()});
  });
  page.on('requestfailed', req => {
    findings.push({type:'requestfailed', url: req.url(), failure: req.failure()?.errorText || 'unknown', page: page.url()});
  });
  for (const route of routes) {
    const url = base + route;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => findings.push({type:'goto', url, error: e.message}));
    await page.waitForTimeout(500);
    const safe = route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'');
    await page.screenshot({ path: path.join(outDir, `${safe}.png`), fullPage: true });
  }
  fs.writeFileSync(path.join(outDir,'findings.json'), JSON.stringify(findings, null, 2));
  await browser.close();
  console.log(`Saved ${routes.length} screenshots and ${findings.length} findings to ${outDir}`);
})();
