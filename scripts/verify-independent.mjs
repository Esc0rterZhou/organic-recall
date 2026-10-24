import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../dist/',import.meta.url),read=f=>fs.readFileSync(new URL(f,root),'utf8');
const html=read('index.html'),app=read('app.mjs');
assert(html.includes('href="./style.css"'));assert(html.includes('src="./app.mjs"'));
const studio=read('review.html');assert(studio.includes('src="./review.mjs"'));assert(studio.includes('href="./review.css"'));
const practice=read('practice.html');assert(practice.includes('href="./style.css"'));assert(practice.includes('src="./app.mjs"'));
assert(!/\b(?:src|href)=["']\/(?!\/)/.test(html),'All local asset paths must work below a repository prefix');
for(const f of ['index.html','review.html','practice.html','app.mjs','core.mjs','style.css','review.mjs','review.css','chem-core.mjs','chem-svg.mjs','exam-data.mjs','editor-bridge.mjs']){
 const s=read(f);
 assert(!/(?:api\.openai\.com|chatgpt\.site|chatgpt\.com|platform\.openai\.com|accounts\.openai\.com)/i.test(s),f+' contains a hosted dependency');
 assert(!/<script\b[^>]*\bsrc=["']https?:\/\//i.test(s),f+' contains a remote script');
 assert(!/<link\b[^>]*\bhref=["']https?:\/\//i.test(s),f+' contains a remote stylesheet');
}
for(const f of ['vendor/pdf.mjs','vendor/pdf.worker.mjs','vendor/PDFJS-LICENSE.txt','.nojekyll'])assert(fs.existsSync(new URL(f,root)),f+' is bundled');
for(const f of ['editor/index.html','editor/RELEASE.json'])assert(fs.existsSync(new URL(f,root)),f+' is bundled');
assert(app.includes("fetch('./'+x+'.json')"));assert(app.includes("import('./vendor/pdf.mjs')"));
assert(!fs.existsSync(new URL('../.openai',import.meta.url)),'Independent package must not contain Sites identity');
console.log('PASS: independent runtime, relative asset paths, bundled PDF parser, and no OpenAI-hosted dependency.');
