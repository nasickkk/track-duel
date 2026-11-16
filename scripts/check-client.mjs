import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const html=readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].filter(m=>!/<script\b[^>]*\bsrc\s*=/i.test(m[0]));
if(!scripts.length)throw Error('No inline game scripts found');
for(const [i,script] of scripts.entries()){
 const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:script[1],encoding:'utf8'});
 if(result.status!==0)throw Error('Inline script '+i+' syntax error:\n'+result.stderr);
}
if(!html.includes('window.trackDuelReady=true'))throw Error('Game ready marker missing');
console.log('PASS: '+scripts.length+' inline scripts parse correctly (ES module syntax supported)');
