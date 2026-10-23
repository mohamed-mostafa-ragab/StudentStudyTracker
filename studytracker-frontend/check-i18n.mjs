import fs from 'node:fs';
import path from 'node:path';
const load = (f) => {
  const src = fs.readFileSync(f, 'utf8');
  const body = src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1);
  return Function(`return (${body})`)();
};
const EN = load('src/app/i18n/en.ts'), AR = load('src/app/i18n/ar.ts');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk('src/app').filter((f) => f.endsWith('.ts') && !f.includes('/i18n/'));
const used = new Set();
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/'([a-z]+\.[A-Za-z.]*[A-Za-z])'/g)) used.add(m[1]);
const dyn = {
  'status.': ['NotStarted', 'InProgress', 'Completed'],
  'plan.type.': ['NewLesson', 'Review'],
  'admin.new.': ['year', 'subject', 'chapter', 'lesson'],
  'admin.edit.': ['year', 'subject', 'chapter', 'lesson'],
  'admin.empty.': ['year', 'subject', 'chapter', 'lesson'],
  'admin.open.': ['year', 'subject', 'chapter'],
  'admin.level.': ['year', 'subject', 'chapter', 'lesson'],
};
for (const [p, s] of Object.entries(dyn)) s.forEach((x) => used.add(p + x));
const ignore = (k) => k.startsWith('sst.') || k.startsWith('environment') || k.includes('/');
const keys = [...used].filter((k) => !ignore(k) && /^(app|nav|common|auth|dash|curriculum|task|status|plan|settings|admin|err)\./.test(k));
const en = Object.keys(EN), ar = Object.keys(AR);
const miss = (d, n) => keys.filter((k) => !(k in d)).map((k) => `${n} missing: ${k}`);
const parity = [...en.filter((k) => !(k in AR)).map((k) => `AR lacks ${k}`), ...ar.filter((k) => !(k in EN)).map((k) => `EN lacks ${k}`)];
const unused = en.filter((k) => !used.has(k));
// placeholders must match between languages
const ph = en.filter((k) => k in AR).filter((k) => (EN[k].match(/\{\w+\}/g) || []).sort().join() !== (AR[k].match(/\{\w+\}/g) || []).sort().join());
console.log('keys used:', keys.length, '| EN:', en.length, '| AR:', ar.length);
const problems = [...miss(EN, 'EN'), ...miss(AR, 'AR'), ...parity, ...ph.map((k) => `placeholder mismatch ${k}`)];
console.log(problems.length ? problems.join('\n') : 'OK: all used keys exist in both languages, placeholders match');
console.log('unused keys:', unused.length ? unused.join(', ') : 'none');
