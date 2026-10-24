import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const version='3.18.0',hash='484e7f10a0e74808ae5f43f0e6448db6f4d884bdd2189aa271108474167a3e7e';
const cache=path.join(root,'cache'),archive=path.join(cache,`ketcher-standalone-${version}.zip`),out=path.join(root,'dist/editor');
fs.mkdirSync(cache,{recursive:true});
if(!fs.existsSync(archive)){
 const res=await fetch(`https://github.com/epam/ketcher/releases/download/v${version}/ketcher-standalone-${version}.zip`);
 if(!res.ok)throw Error(`Ketcher download failed: ${res.status}`);
 fs.writeFileSync(archive,new Uint8Array(await res.arrayBuffer()));
}
const actual=crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
if(actual!==hash)throw Error('Ketcher archive checksum differs from the verified release.');
const windows=process.platform==='win32';
const entries=execFileSync(windows?'tar':'unzip',windows?['-tf',archive]:['-Z','-1',archive],{encoding:'utf8',maxBuffer:8*1024*1024}).trim().split(/\r?\n/);
for(const item of entries)if(path.isAbsolute(item)||item.split(/[\\/]/).includes('..'))throw Error('Archive path is outside the extraction folder.');
const staging=fs.mkdtempSync(path.join(cache,'ketcher-extract-'));
execFileSync(windows?'tar':'unzip',windows?['-xf',archive,'-C',staging]:['-q',archive,'-d',staging]);
const source=fs.existsSync(path.join(staging,'index.html'))?staging:path.join(staging,fs.readdirSync(staging).find(d=>fs.existsSync(path.join(staging,d,'index.html')))??'');
if(!fs.existsSync(path.join(source,'index.html')))throw Error('Standalone entry file missing from archive.');
fs.mkdirSync(out,{recursive:true});
fs.copyFileSync(path.join(root,'licenses/KETCHER-LICENSE.txt'),path.join(out,'LICENSE.txt'));
for(const f of ['index.html','manifest.json','favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png','logo.svg'])if(fs.existsSync(path.join(source,f)))fs.copyFileSync(path.join(source,f),path.join(out,f));
for(const folder of ['js','css','media']){
 const dir=path.join(source,'static',folder);if(!fs.existsSync(dir))continue;
 for(const file of fs.readdirSync(dir)){
  if(folder!=='media'&&!/^(main\.|\d+\.)/.test(file))continue;
  const target=path.join(out,'static',folder,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.cpSync(path.join(dir,file),target,{recursive:true});
 }
}
fs.writeFileSync(path.join(out,'RELEASE.json'),JSON.stringify({project:'EPAM Ketcher',version,source:`https://github.com/epam/ketcher/releases/tag/v${version}`,sha256:hash,license:'Apache-2.0'},null,2));
console.log(`Ketcher ${version} standalone app bundled; no remote chemistry service is used.`);
