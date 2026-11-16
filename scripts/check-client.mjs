import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
const html=readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].filter(m=>!/<script\b[^>]*\bsrc\s*=/i.test(m[0]));
if(scripts.length<1)throw Error('No inline game script found');
for(const [i,script] of scripts.entries())new Script(script[1],{filename:'inline-game-'+i+'.js'});
if(!html.includes('window.trackDuelReady=true'))throw Error('Game ready marker is missing');
console.log('PASS: '+scripts.length+' inline JavaScript script(s) parse correctly.');
