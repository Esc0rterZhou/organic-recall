import {createClient} from 'npm:@supabase/supabase-js@2.118.0';

const url=Deno.env.get('SUPABASE_URL')!;
const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const allowed=new Set(['https://esc0rterzhou.github.io']);
const normalize=(s:unknown)=>typeof s==='string'?s.normalize('NFKC').trim().toLowerCase():'';
const validUsername=(s:string)=>/^[a-z0-9_]{3,24}$/.test(s);
const validPassword=(s:unknown)=>typeof s==='string'&&s.length>=10&&s.length<=64&&new TextEncoder().encode(s).length<=72;
const hex=(bytes:Uint8Array)=>[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
const hash=async(s:string)=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))));
const recovery=()=>hex(crypto.getRandomValues(new Uint8Array(24))).toUpperCase().match(/.{1,8}/g)!.join('-');
const codeText=(s:unknown)=>typeof s==='string'?s.replace(/[\s-]/g,'').toUpperCase():'';
const internalEmail=async(name:string)=>'u.'+(await hash('organic-recall:'+name)).slice(0,48)+'@accounts.organic-recall.invalid';

Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const originAllowed=!origin||allowed.has(origin)||/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin);
 const cors={'Access-Control-Allow-Origin':originAllowed?(origin||'https://esc0rterzhou.github.io'):'https://esc0rterzhou.github.io','Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
 const respond=(status:number,body:object)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
 if(!originAllowed)return respond(403,{error:'originDenied'});
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return respond(405,{error:'methodNotAllowed'});
 if(Number(req.headers.get('content-length'))>4096)return respond(413,{error:'invalidRequest'});
 try{
  const raw=await req.text();if(raw.length>4096)return respond(413,{error:'invalidRequest'});
  const body=JSON.parse(raw),username=normalize(body.username);
  if(!validUsername(username))return respond(400,{error:'usernameInvalid'});
  if(!validPassword(body.password))return respond(400,{error:'passwordInvalid'});
  const action=body.action;if(!['register','recover'].includes(action))return respond(400,{error:'invalidRequest'});
  const forwarded=req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown';
  const ip=forwarded.split(',').at(-1)!.trim();
  const bucket=await hash(secret+new Date().toISOString().slice(0,10)+ip);
  for(const [id,max,seconds]of [[action+':ip:'+bucket,action==='register'?50:15,3600],[action+':name:'+username,10,900],['global:'+action,300,3600]] as [string,number,number][]){
   const {data,error}=await admin.rpc('take_auth_attempt',{bucket_id:id,max_attempts:max,window_seconds:seconds});
   if(error)return respond(503,{error:'accountUnavailable'});if(!data)return respond(429,{error:'tooManyAttempts'});
  }
  if(action==='register'){
   const code=recovery(),digest=await hash(codeText(code));
   const {data:created,error}=await admin.auth.admin.createUser({email:await internalEmail(username),password:body.password,email_confirm:true,app_metadata:{organic_recall:true},user_metadata:{username}});
   if(error)return respond(error.code==='email_exists'||error.code==='user_already_exists'?409:400,{error:error.code==='email_exists'||error.code==='user_already_exists'?'usernameTaken':'registrationFailed'});
   const id=created.user.id;
   const {error:profileError}=await admin.from('profiles').insert({user_id:id,username,recovery_hash:digest});
   if(profileError){await admin.auth.admin.deleteUser(id);return respond(503,{error:'registrationFailed'})}
   return respond(201,{username,recoveryCode:code});
  }
  const supplied=codeText(body.recoveryCode);
  if(!/^[0-9A-F]{48}$/.test(supplied))return respond(400,{error:'recoveryInvalid'});
  const nonce=crypto.randomUUID(),{data:id,error:claimError}=await admin.rpc('claim_recovery',{account_username:username,code_hash:await hash(supplied),nonce});
  if(claimError)return respond(503,{error:'accountUnavailable'});
  if(!id)return respond(400,{error:'recoveryInvalid'});
  try{
   const next=recovery(),nextHash=await hash(codeText(next));
   const {error}=await admin.auth.admin.updateUserById(id,{password:body.password});
   if(error)throw error;
   const {data:finished,error:finishError}=await admin.rpc('finish_recovery',{account_id:id,nonce,new_hash:nextHash});
   if(finishError||!finished)throw Error('finish');
   return respond(200,{username,recoveryCode:next});
  }catch{
   await admin.rpc('release_recovery',{account_id:id,nonce});
   return respond(503,{error:'recoveryFailed'});
  }
 }catch{return respond(400,{error:'invalidRequest'})}
});
