import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const port=Number(process.env.PORT||4174),host=process.env.HOST||'127.0.0.1';
const base='/' +(process.env.BASE_PATH||'').split('/').filter(Boolean).join('/');
const prefix=base==='/'?'/':base+'/';
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.bcmap':'application/octet-stream','.pfb':'application/octet-stream'};
const server=http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return}
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(prefix!=='/'&&pathname===base){res.writeHead(308,{'Location':prefix}).end();return}
 if(!pathname.startsWith(prefix)){res.writeHead(404).end('Not found');return}
 const relative=decodeURIComponent(pathname.slice(prefix.length))||'index.html';
 const target=path.resolve(root,relative);
 if(!target.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end('Forbidden');return}
 const info=await stat(target);if(!info.isFile())throw Error('Not a file');
 const data=await readFile(target);
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':data.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
 res.end(req.method==='HEAD'?undefined:data);
}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found')}});
server.listen(port,host,()=>console.log(`Local: http://${host}:${port}${prefix}`));
