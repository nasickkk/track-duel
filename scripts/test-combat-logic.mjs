import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const html=readFileSync('index.html','utf8');
const a=html.indexOf('function facing(q){'),b=html.indexOf('function groundAt(x,z,oldY,vy){',a);
if(a<0||b<0)throw Error('Combat logic not found');
const source=html.slice(a,b);

const state={
 THREE:{Vector3:class Vector3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}}},
 EYE_HEIGHT:2.22,obstacles:[],WEAPONS:{track:{dps:34},tap:{damage:12,cooldown:230},sniper:{damage:70,cooldown:1550}},
 performance:{now:()=>state.clock},
 clock:1000,started:true,ended:false,transition:0,roundLock:0,
 role:'host',bot:false,me:0,op:1,round:1,
 p:[{x:0,z:0,y:0,yaw:0,pitch:0,fire:false},{x:0,z:-6,y:0,yaw:0,pitch:0,fire:false}],
 hp:[100,100],myScore:0,oppScore:0,lobby:{hostDelayMs:20,weapons:{track:true,tap:true,sniper:true}},
 nextAcceptedShot:[0,0],acceptedShots:[-1,-1],
 hostShots:[],hostTrackHistory:[],trackLastConfirm:[0,0],SIM_HZ:128,lastHitFx:0,
 formatShotAck:(...args)=>state.acks.push(args),acks:[],
 predictedHit:()=>({hit:false,head:false}),hitTotals:{shots:0,verified:0},
 diagnosticLine:()=>{},playHitSound:()=>{},safeSend:()=>{},hitText:(hit,head)=>hit?(head?'HEAD':'HIT'):'MISS',
 center:{textContent:''},refreshHud:()=>{},
};
runInNewContext(source+ '\nglobalThis.__combat={shotHit,acceptDiscreteShot,processHostShots,resolveDamage};',state,{timeout:1000});
const {shotHit,acceptDiscreteShot,processHostShots,resolveDamage}=state.__combat;

assert.equal(shotHit(state.p[0],state.p[1]).head,true);
let result=acceptDiscreteShot(0,'tap');
assert.equal(result.accepted,true);assert.equal(result.hit,true);assert.equal(result.head,true);
assert.equal(result.damage,18);assert.equal(state.hp[1],82);
result=acceptDiscreteShot(0,'tap');
assert.equal(result.accepted,false,'shot cooldown must be enforced');

state.clock=1300;
state.p[0].yaw=Math.PI;
result=acceptDiscreteShot(0,'tap');
assert.equal(result.accepted,true);assert.equal(result.hit,false);

state.p[0].yaw=0;
state.hp[1]=100;
state.nextAcceptedShot[0]=0;state.clock=1500;
state.hostShots.push({at:1520,created:1500,id:42,round:1,weapon:'tap',pose:{...state.p[0]},predicted:{hit:true,head:true}});
processHostShots(1510);
assert.equal(state.hp[1],100,'delayed host shot must not apply prematurely');
processHostShots(1522);
assert.equal(state.hp[1],82,'delayed host shot must apply after configured delay');
assert.equal(state.acks.length,1,'host player must receive a hit log confirmation');

state.clock=2000;state.hp[1]=100;state.p[0].fire=true;
resolveDamage(1/128);
assert.equal(state.hp[1],100,'host tracker must not inflict damage before handicap delay');
state.clock=2025;
resolveDamage(1/128);
assert.ok(state.hp[1]<100,'host tracker should inflict damage after handicap delay');

console.log('PASS: hit testing, cooldown, miss, host delayed shot, host delayed tracker');
