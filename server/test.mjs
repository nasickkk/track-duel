import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import WebSocket from 'ws';

const port = 19876;
const origin = 'http://localhost:3000';
const base = 'ws://127.0.0.1:' + port + '/ws';

function inbox(ws) {
  const messages=[];
  const waiters=[];
  ws.on('message',data=>{
    const message=JSON.parse(data.toString());
    if(waiters.length)waiters.shift()(message);
    else messages.push(message);
  });
  return {
    send(payload){ws.send(JSON.stringify(payload))},
    async next(){
      if(messages.length)return messages.shift();
      return Promise.race([
        new Promise(resolve=>waiters.push(resolve)),
        delay(5000).then(()=>{throw Error('timed out waiting for message')})
      ]);
    }
  };
}
function connect() {
  return new Promise((resolve,reject)=>{
    const ws=new WebSocket(base,{origin});
    ws.once('open',()=>resolve(ws));
    ws.once('error',reject);
  });
}

test('WebSocket relay: create, join, forward, disconnect',async t=>{
  const server=spawn(process.execPath,['index.mjs'],{
    cwd:process.cwd(),env:{...process.env,PORT:String(port),NODE_ENV:'development',ALLOWED_ORIGIN:'https://nasickkk.github.io'},stdio:'pipe'
  });
  let output='';
  server.stderr.on('data',b=>output+=b.toString());
  t.after(()=>server.kill());
  for(let attempt=0;attempt<60;attempt++){
    try {const res=await fetch('http://127.0.0.1:'+port+'/health');if(res.ok)break}
    catch {}
    await delay(100);
  }
  const health=await fetch('http://127.0.0.1:'+port+'/health');
  assert.equal(health.status,200,output);
  const host=await connect(),guest=await connect();
  t.after(()=>{host.close();guest.close()});
  const h=inbox(host),g=inbox(guest);
  h.send({t:'create'});
  const created=await h.next();
  assert.equal(created.t,'created');
  assert.match(created.code,/^[A-HJ-NP-Z2-9]{6}$/);
  g.send({t:'join',code:created.code});
  assert.equal((await g.next()).t,'joined');
  assert.equal((await h.next()).t,'paired');
  assert.equal((await g.next()).t,'paired');
  h.send({t:'ping',id:4321});
  assert.deepEqual(await h.next(),{t:'pong',id:4321});
  const payload={t:'pose',x:2,y:0,z:3,yaw:0,weapon:'tap'};
  h.send({t:'game',data:payload});
  assert.deepEqual(await g.next(),{t:'game',data:payload});
  guest.close();
  assert.equal((await h.next()).t,'peer-left');
});

test('Radmin LAN: serves browser client and accepts same-origin WebSocket',async t=>{
 const lanPort=19877;
 const ip='127.0.0.1';
 const lanOrigin='http://'+ip+':'+lanPort;
 const server=spawn(process.execPath,['index.mjs'],{
  cwd:process.cwd(),
  env:{...process.env,PORT:String(lanPort),LAN_MODE:'1',BIND_HOST:ip,ALLOWED_ORIGIN:lanOrigin,NODE_ENV:'production'},
  stdio:'pipe'
 });
 let logs='';server.stderr.on('data',b=>logs+=b.toString());
 t.after(()=>server.kill());
 for(let i=0;i<60;i++){
  try{const r=await fetch(lanOrigin+'/health');if(r.ok)break}catch{}
  await delay(100);
 }
 const page=await fetch(lanOrigin+'/play');
 assert.equal(page.status,200,logs);
 assert.match(page.headers.get('content-type'),/text\/html/);
 const html=await page.text();
 assert.match(html,/TRACK DUEL 5\.3/);
 assert.match(html,/window\.trackDuelReady=true/);
 const ws=await new Promise((resolve,reject)=>{
  const conn=new WebSocket('ws://'+ip+':'+lanPort+'/ws',{origin:lanOrigin});
  conn.once('open',()=>resolve(conn));conn.once('error',reject);
 });
 t.after(()=>ws.close());
 const i=inbox(ws);
 i.send({t:'create'});
 const reply=await i.next();
 assert.equal(reply.t,'created');
 assert.match(reply.code,/^[A-HJ-NP-Z2-9]{6}$/);
});
