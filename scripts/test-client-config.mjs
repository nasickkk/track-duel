import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const html=readFileSync('index.html','utf8');
function extract(start,end){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 if(a<0||b<0)throw Error('Missing code section: '+start);
 return html.slice(a,b);
}
const source=extract('const MAP_TYPES=', 'function loadMap()')+
 '\n'+extract('const DEFAULT_LOBBY=', 'let lobby=normalizeLobby(DEFAULT_LOBBY);')+
 '\nglobalThis.exports={normalizeMap,normalizeLobby};';
const exports=runInNewContext(source,{});
const helpers=runInNewContext(source+'\nglobalThis.exports;',{}, {timeout:1000});
const {normalizeMap,normalizeLobby}=helpers;

const old=normalizeMap({name:'Old',objects:[],spawns:[{x:-3,z:0},{x:3,z:0}]});
assert.equal(old.spawns.length,2);
assert.equal(old.spawns[0].y,0,'legacy map spawns must be grounded');

const elevated=normalizeMap({name:'High',width:220,depth:180,objects:[],spawns:[{x:-80,z:0,y:12},{x:80,z:0,y:24}]});
assert.equal(elevated.width,220);assert.equal(elevated.depth,180);
assert.equal(elevated.spawns[0].y,12);assert.equal(elevated.spawns[1].y,24);

const clamp=normalizeMap({width:1000,depth:1000,objects:[],spawns:[{x:0,z:0,y:200},{x:0,z:0,y:-10}]});
assert.equal(clamp.width,220);assert.equal(clamp.depth,180);
assert.equal(clamp.spawns[0].y,24);assert.equal(clamp.spawns[1].y,0);

assert.equal(normalizeLobby({}).hostDelayMs,0);
assert.equal(normalizeLobby({hostDelayMs:30}).hostDelayMs,30);
assert.equal(normalizeLobby({hostDelayMs:999}).hostDelayMs,150);
assert.equal(normalizeLobby({hostDelayMs:17}).hostDelayMs,15);
for(const label of ['id="lobbyHostDelay"','id="propSpawnY"','id="diagEntries"','id="arenaWidth"','id="arenaDepth"']){
 assert.ok(html.includes(label),'missing interactive field '+label);
}
for(const token of ['function playHitSound(','function acceptDiscreteShot(','function processHostShots(','function resolveDamage(','function predictedHit(','function formatShotAck(','function showDiagnostic(']){
 assert.ok(html.includes(token),'missing gameplay function '+token);
}
console.log('PASS: legacy map compatibility, elevated spawns, arena bounds, host handicap, diagnostics UI');
