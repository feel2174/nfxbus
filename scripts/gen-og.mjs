import puppeteer from 'puppeteer';
import fs from 'node:fs';

const html = `<!doctype html><html><head><meta charset="utf8"><style>
  *{margin:0;box-sizing:border-box;font-family:sans-serif}
  .w{width:2400px;height:1260px;background:linear-gradient(135deg,#e50914,#7a0510);
     color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:40px;padding:120px;text-align:center}
  h1{font-size:150px;font-weight:900;line-height:1.1}
  p{font-size:72px;opacity:.95}
  .b{font-size:64px;background:#fff;color:#e50914;font-weight:900;padding:24px 56px;border-radius:999px}
</style></head><body><div class="w">
  <h1>프리미엄 구독<br/>최대 90% 저렴하게</h1>
  <p>넷플릭스 · ChatGPT · 유튜브 등 25종</p>
  <div class="b">쿠폰 HY2QCU — 10% 추가할인</div>
</div></body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 2400, height: 1260, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
fs.mkdirSync('public', { recursive: true });
await page.screenshot({ path: 'public/og.png', clip: { x: 0, y: 0, width: 2400, height: 1260 } });
await browser.close();
console.log('og.png written');
