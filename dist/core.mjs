export const TYPES=['Products','Reagents','Mechanisms','Synthesis','Concepts'];
export function normalize(t){return String(t).normalize('NFKC').toLowerCase().replace(/[‐‑–—−]/g,'-').replace(/\s+/g,' ')}
export function hasKeyword(text,word){const t=normalize(text),w=normalize(word);if(!w.trim())return false;if(/^[a-z0-9]+$/.test(w))return new RegExp('(^|[^a-z0-9])'+w+'([^a-z0-9]|$)').test(t);return t.includes(w)}
export function matches(q,pages){const hits=[];for(const p of pages){const anchors=q.anchors?.filter(k=>hasKeyword(p.text,k));if(q.anchors&&!anchors.length)continue;const keys=[...new Set([...(anchors||[]),...q.keywords.filter(k=>hasKeyword(p.text,k))])];if(keys.length)hits.push({page:p.page,keys})}return hits.sort((a,b)=>b.keys.length-a.keys.length)}
export function detectChapters(pages,chapters,bank,filename=''){
 const scores=new Map(chapters.map(c=>[c.id,0]));
 for(const p of pages){
  for(const m of p.text.matchAll(/(?:chapter\s*|第\s*)(\d{1,2})(?:\s*章)?/gi)){const n=+m[1];if(scores.has(n))scores.set(n,scores.get(n)+8)}
  for(const c of chapters)if(p.text.includes(c.title))scores.set(c.id,scores.get(c.id)+3);
 }
 // Only specific topic evidence counts; generic words do not identify a chapter.
 const general=new Set(['酸性','oxidation','reduction','氧化','还原','亲核','加成','消除','nmr','ir','hydrolysis','水解','共振','resonance','α']);
 for(const c of chapters){const keys=[...new Set(bank.filter(q=>q.chapter===c.id).flatMap(q=>q.keywords))].filter(k=>!general.has(k)&&k.length>=3);let n=0;for(const k of keys)if(pages.some(p=>hasKeyword(p.text,k)))n++;scores.set(c.id,scores.get(c.id)+Math.min(n,12))}
 const f=filename.match(/(?:ch(?:apter)?[\s_-]*|第\s*)(\d{1,2})/i);if(f&&scores.has(+f[1]))scores.set(+f[1],scores.get(+f[1])+2);
 return [...scores].map(([id,score])=>({id,score})).filter(x=>x.score>=3).sort((a,b)=>b.score-a.score);
}
export function shuffle(a,rng=Math.random){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
export function selectQuestions(bank,{chapter,count=8,types=TYPES,pages=[],topic=null,ids=null},rng=Math.random){
 let pool=bank.filter(q=>q.chapter===chapter&&types.includes(q.type)&&(!topic||q.topic===topic)&&(!ids||ids.includes(q.id)));
 const useEvidence=pages.length>0;let evidence=new Map();if(useEvidence){for(const q of pool)evidence.set(q.id,matches(q,pages));pool=pool.filter(q=>evidence.get(q.id).length)}
 // Round robin across question types, limiting repeated topics when possible.
 const result=[],buckets=types.map(t=>shuffle(pool.filter(q=>q.type===t),rng)),seenTopics=new Map();
 while(result.length<count&&buckets.some(b=>b.length)){
  for(const b of buckets){if(!b.length||result.length>=count)continue;let i=b.findIndex(q=>(seenTopics.get(q.topic)||0)<2);if(i<0)i=0;const [q]=b.splice(i,1);result.push(q);seenTopics.set(q.topic,(seenTopics.get(q.topic)||0)+1)}
 }
 return shuffle(result,rng).map(q=>{const order=shuffle(q.options.map((_,i)=>i),rng);return {...q,options:order.map(i=>q.options[i]),answer:order.indexOf(q.answer),evidence:useEvidence?evidence.get(q.id).slice(0,3):[]}})
}
export function grade(questions,answers){return questions.map((q,i)=>({id:q.id,correct:answers[i]===q.answer,answered:Number.isInteger(answers[i]),choice:answers[i]??null}))}
export function safeLoad(storage,key,fallback){try{return JSON.parse(storage.getItem(key))??fallback}catch{return fallback}}
