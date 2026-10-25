import {build} from 'esbuild';
import fs from 'node:fs';
await build({stdin:{contents:"export {createClient} from '@supabase/supabase-js';",resolveDir:process.cwd(),sourcefile:'account-vendor-entry.js'},bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outfile:'dist/vendor/supabase.mjs',legalComments:'eof'});
fs.copyFileSync(new URL('../node_modules/@supabase/supabase-js/LICENSE',import.meta.url),new URL('../dist/vendor/SUPABASE-LICENSE.txt',import.meta.url));
console.log('Bundled Supabase client and license locally.');
