import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TYPES,selectQuestions,matches,grade,detectChapters,safeLoad} from '../dist/core.mjs';
const read=f=>JSON.parse(fs.readFileSync(new URL('../dist/'+f,import.meta.url),'utf8'));
const bank=read('bank.json'),chapters=read('chapters.json'),examples=read('examples.json');
assert.equal(bank.length,236);assert.equal(new Set(bank.map(q=>q.id)).size,236);assert.equal(chapters.length,26);
for(const q of bank){assert(TYPES.includes(q.type),q.id+' type');assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.pages.every(p=>Number.isInteger(p)&&p>=35&&p<=1304));for(const field of ['topic','prompt','explanation',...q.options.map((_,i)=>i)]){const s=typeof field==='number'?q.options[field]:q[field];assert(!/[\u4e00-\u9fff]/.test(s),q.id+' English display');}assert(q.section.startsWith(q.chapter+'-'));}
for(const c of chapters){assert.equal(bank.filter(q=>q.chapter===c.id).length,c.id===19?36:8);assert(c.start<c.end);assert(c.sections.length>0);const pool=selectQuestions(bank,{chapter:c.id,count:8});assert.equal(pool.length,8);assert.equal(new Set(pool.map(q=>q.id)).size,8);for(const q of pool){assert.equal(q.options[q.answer],bank.find(x=>x.id===q.id).options[bank.find(x=>x.id===q.id).answer]);}}
const topic={...bank.find(q=>q.chapter===19),keywords:['CO2']};assert.equal(matches(topic,[{page:1,text:'cobalt co20'}]).length,0);assert.equal(matches(topic,[{page:2,text:'Grignard + CO2'}])[0].page,2);
assert.equal(selectQuestions(bank,{chapter:19,types:[]}).length,0);assert.equal(selectQuestions(bank,{chapter:19,pages:[{page:1,text:'unrelated gardening schedule'}]}).length,0);
const q=selectQuestions(bank,{chapter:19,count:5});assert.equal(grade(q,q.map(x=>x.answer)).filter(x=>x.correct).length,5);assert.equal(grade(q,[]).filter(x=>x.correct).length,0);assert.deepEqual(safeLoad({getItem:()=>'{broken'},'x',[]),[]);
for(const ex of examples){const pages=[{page:1,text:ex.text}],pool=selectQuestions(bank,{chapter:19,count:100,pages});assert(pool.length>=8);console.log(`Example ${ex.id}: ${pool.length} matched questions`)}
for(const i of [1,2]){const path=new URL(`../source${i}.json`,import.meta.url);if(fs.existsSync(path)){const pages=JSON.parse(fs.readFileSync(path,'utf8'));assert.equal(detectChapters(pages,chapters,bank)[0].id,19);const pool=selectQuestions(bank,{chapter:19,count:100,pages});assert(pool.length>=12);assert(pool.every(q=>q.evidence.length>0));console.log(`Actual lecture ${i}: Chapter 19; ${pool.length} matching questions`);}}
assert.equal(chapters[5].end,284);assert.equal(chapters[6].start,285);assert.equal(chapters[18].problems,947);
console.log('PASS: English coverage, sources, chapter detection, topic matching, option shuffling, grading, and scope limits.');
