import fs from 'node:fs';
const html = fs.readFileSync('out/index.html', 'utf8');
const AFF = 'https://www.nfxbus.com/?uc=W7JKVP58';
const ext = [...html.matchAll(/href="(https?:\/\/[^"]*nfxbus[^"]*)"/g)].map(m => m[1]);
const bad = ext.filter(u => u !== AFF);
const hasCoupon = html.includes('HY2QCU');
const hasDisc = html.includes('공식 사이트가 아니');
console.log('nfxbus links:', ext.length, '| bad:', bad.length);
console.log('coupon present:', hasCoupon, '| disclosure present:', hasDisc);
if (bad.length || !hasCoupon || !hasDisc || ext.length < 25) {
  console.error('VERIFY FAIL', { bad, hasCoupon, hasDisc, count: ext.length });
  process.exit(1);
}
console.log('VERIFY OK');
