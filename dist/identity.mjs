export const normalizeUsername=value=>typeof value==='string'?value.normalize('NFKC').trim().toLowerCase():'';
export const validUsername=value=>typeof value==='string'&&/^[a-z0-9_]{3,24}$/.test(normalizeUsername(value));
export const normalizeRecovery=value=>typeof value==='string'?value.replace(/[\s-]/g,'').toUpperCase():'';
export const validPassword=value=>typeof value==='string'&&value.length>=10&&value.length<=64&&new TextEncoder().encode(value).length<=72;
export async function usernameEmail(value){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('organic-recall:'+normalizeUsername(value))));return 'u.'+[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,48)+'@accounts.organic-recall.invalid'}
