import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../dist/',import.meta.url),read=f=>fs.readFileSync(new URL(f,root),'utf8');
const json=f=>JSON.parse(read(f));
for(const file of ['index.html','practice.html','review.html']){const html=read(file);assert(html.includes('href="./workspace.css"'));assert(html.includes('src="./workspace.mjs"'));assert(!html.includes('lecture-file'));assert(!html.includes('pdf-input'));assert(!/\b(?:src|href)=["']\/(?!\/)/.test(html),'Relative paths required below a project prefix')}
for(const file of ['index.html','practice.html','review.html','workspace.mjs','workspace.css','locale.mjs','account.mjs','identity.mjs','reader.mjs','visual-lab.mjs','progress-core.mjs','chem-core.mjs','chem-svg.mjs','exam-data.mjs']){const source=read(file);assert(!/(?:api\.openai\.com|chatgpt\.site|chatgpt\.com|platform\.openai\.com|accounts\.openai\.com)/i.test(source),file+' contains an OpenAI-hosted dependency');assert(!/<script\b[^>]*\bsrc=["']https?:\/\//i.test(source));assert(!/<link\b[^>]*\bhref=["']https?:\/\//i.test(source))}
for(const file of ['vendor/pdf.mjs','vendor/pdf.worker.mjs','vendor/PDFJS-LICENSE.txt','vendor/supabase.mjs','assets/dusk.webp','workspace-fonts.css','.nojekyll'])assert(fs.existsSync(new URL(file,root)),file+' is bundled');
const bank=json('bank.json'),chapters=json('chapters.json'),questions=json('content-locale.json'),titles=json('chapter-locale.json'),sections=json('section-locale.json');
assert.equal(Object.keys(questions).length,236);assert.equal(Object.keys(titles).length,26);
for(const q of bank)for(const lang of ['zh','fr']){const translated=questions[q.id]?.[lang];assert(translated&&translated.topic&&translated.prompt&&translated.explanation,q.id+' '+lang);assert.equal(translated.options.length,q.options.length);assert(translated.options.every(o=>typeof o==='string'&&o.length>0));assert.equal(new Set(translated.options).size,4,q.id+' translated options distinct')}
for(const c of chapters){for(const lang of ['zh','fr'])assert(titles[c.id]?.[lang]);for(const s of c.sections)for(const lang of ['zh','fr'])assert(sections[s.id]?.[lang],s.id+' '+lang)}
const config=json('account-config.json');assert(!('service_role' in config));assert(!('secretKey' in config));if(config.url)assert(/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url));assert(!String(config.publishableKey).startsWith('sb_secret_'),'Only public client credentials may ship');
assert(!fs.existsSync(new URL('../.openai',import.meta.url)),'Independent package must not contain Sites identity');
console.log('PASS: independent assets, no lecture-upload entry, all 236 question translations, 26 chapters, 259 section translations and public-only account configuration.');
