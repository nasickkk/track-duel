import http from 'node:http';
import { randomInt } from 'node:crypto';
import WebSocket, { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 10000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://nasickkk.github.io';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rooms = new Map();
const clients = new Set();
const MAX_ROOMS = 250;
const MAX_MSG_BYTES = 65536;
const MAX_MESSAGES_PER_SECOND = 220; // supports up to 64 pose updates + host HP sync + diagnostic pings
const GAME_TYPES = new Set(['start','pose','sync','shot','shotfx','rematch','net-ping','net-pong']);

const server = http.createServer((request, response) => {
  if (request.url === '/health' || request.url === '/') {
    response.writeHead(200, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
    response.end(JSON.stringify({ok:true,service:'track-duel-relay',rooms:rooms.size,players:clients.size}));
  } else {
    response.writeHead(404, {'content-type':'text/plain'});
    response.end('Not found');
  }
});
const wss = new WebSocketServer({ server, path:'/ws', maxPayload:MAX_MSG_BYTES, perMessageDeflate:false });

function send(ws,data) {
  if (ws?.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify(data)); } catch {}
  }
}
function roomCode() {
  let code;
  for (let attempt = 0; attempt < 20; attempt++) {
    code = Array.from({length:6}, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
    if (!rooms.has(code)) return code;
  }
  return null;
}
function removeFromRoom(ws) {
  const meta = ws.meta;
  const room = meta?.room ? rooms.get(meta.room) : null;
  if (!room) return;
  const other = room.host === ws ? room.guest : room.host;
  rooms.delete(meta.room);
  if (other?.meta) other.meta.room = null;
  send(other,{t:'peer-left'});
  if (meta) meta.room = null;
}
function fail(ws,reason) { send(ws,{t:'fail',reason}); }

wss.on('connection',(ws,request) => {
  const origin=request.headers.origin || '';
  if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN &&
      !(process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(?::\d+)?$/.test(origin))) {
    ws.close(1008,'Origin not allowed');
    return;
  }
  clients.add(ws);
  ws.isAlive=true;
  ws.meta={room:null,role:null,count:0,window:Date.now()};
  ws.on('pong',()=>ws.isAlive=true);
  ws.on('message',(data,isBinary)=>{
    if (isBinary || data.length > MAX_MSG_BYTES) { ws.close(1009,'Message too large'); return; }
    const meta=ws.meta;
    const now=Date.now();
    if (now-meta.window>=1000) {meta.window=now;meta.count=0;}
    if (++meta.count>MAX_MESSAGES_PER_SECOND) {ws.close(1008,'Too many messages');return;}
    let msg;
    try {msg=JSON.parse(data.toString('utf8'));} catch {fail(ws,'invalid-json');return;}
    if (!msg || typeof msg!=='object' || Array.isArray(msg)) return;
    if (msg.t==='ping') {const id=Number.isSafeInteger(msg.id)&&msg.id>=0?msg.id:null;send(ws,{t:'pong',id});return;}
    if (msg.t==='create') {
      if (meta.role || meta.room) {fail(ws,'already-in-room');return;}
      if (rooms.size>=MAX_ROOMS) {fail(ws,'server-busy');return;}
      const code=roomCode();
      if (!code) {fail(ws,'server-busy');return;}
      meta.room=code;meta.role='host';
      rooms.set(code,{host:ws,guest:null,createdAt:now});
      send(ws,{t:'created',code});
      return;
    }
    if (msg.t==='join') {
      if (meta.role || meta.room) {fail(ws,'already-in-room');return;}
      const code=String(msg.code||'').toUpperCase();
      if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {fail(ws,'invalid-code');return;}
      const room=rooms.get(code);
      if (!room) {fail(ws,'room-not-found');return;}
      if (room.guest) {fail(ws,'room-full');return;}
      if (room.host.readyState!==WebSocket.OPEN) {rooms.delete(code);fail(ws,'room-not-found');return;}
      room.guest=ws;meta.room=code;meta.role='guest';
      send(ws,{t:'joined',code});
      send(room.host,{t:'paired'});
      send(ws,{t:'paired'});
      return;
    }
    if (msg.t==='game') {
      const room=meta.room && rooms.get(meta.room);
      if (!room || !room.guest || !meta.role) return;
      const payload=msg.data;
      if (!payload || typeof payload!=='object' || Array.isArray(payload) || !GAME_TYPES.has(payload.t)) return;
      const recipient=meta.role==='host'?room.guest:room.host;
      send(recipient,{t:'game',data:payload});
    }
  });
  ws.on('close',()=>{removeFromRoom(ws);clients.delete(ws);});
  ws.on('error',()=>{});
});

const heartbeat = setInterval(()=>{
  for (const ws of clients) {
    if (!ws.isAlive) {ws.terminate();continue;}
    ws.isAlive=false;ws.ping();
  }
  for (const [code,room] of rooms) {
    if (!room.guest && Date.now()-room.createdAt>30*60*1000) {
      send(room.host,{t:'fail',reason:'room-expired'});
      room.host.close(1000,'Room expired');
      rooms.delete(code);
    }
  }
},30000);
heartbeat.unref();
server.listen(PORT,'0.0.0.0',()=>console.log('TRACK DUEL relay listening on '+PORT));
