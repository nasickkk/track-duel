# TRACK DUEL 5.4

A lightweight browser-based FPS tracking duel and 3D map workshop, built with Three.js and a choice of experimental PeerJS peer-to-peer networking or a separately deployed WebSocket relay server.

**Play (GitHub Pages):** https://nasickkk.github.io/track-duel/

> **Prototype:** Supports 1v1 (two people using a room code) and a local moving bot. No dedicated authoritative multiplayer server, persistent accounts, anti-cheat, match history, or reliable latency compensation yet. **3-player free-for-all and 2v2 are planned, not playable.** GitHub Pages hosts static files only.

## 5.4 — Host handicap, hit logs, spawn Y and larger maps

- **Host shot handicap:** the room creator can add **0–150 ms** of artificial delay to their own tap/sniper damage and continuous tracker damage, making matches more balanced as a first approximation. The real RTT and player movement are NOT changed. Guest RTT around 30 ms? Try 15 ms handicap and compare logs.
- **Confirmed hit feedback:** distinct hit sounds, short hit toast and brighter first-person tracker and sniper tracers (not just the opponent's tracer). M toggles all sound.
- **Shot diagnostics with F8:** log local predicted hit vs host-confirmed hit/miss/rejected, acknowledge latency for discrete shots, and periodic host tracking confirmations. Copy the log for debugging. These are **host-browser decisions**, not reports from an authoritative game server.
- **3D spawn elevation:** spawn points retain height Y (0–24), configurable in properties and using the yellow gizmo. Player spawns above ground now start in the air and fall to surfaces; old maps remain compatible.
- **Larger arenas:** sizes up to 220×180, raised object/platform top up to 24. Editor adjusts 3D orbit range and caps 2D canvas resolution for large maps.
- **Guide:** [Диагностика попаданий, искусственная задержка хоста, вертикальные карты](docs/HIT_DIAGNOSTICS_RU.md).
- **Radmin LAN:** download a new ZIP and restart `server/start-radmin.bat` on the host to enable new hit-ack messages. The old relay ignores them.
- **Limits:** no independent authoritative tick server, no proper lag compensation and no proven elimination of desync. 128 Hz refers to client simulation only.

## 5.3 — Radmin VPN LAN (no Render or Cloudflare)

- Run `server/start-radmin.bat` on the host's Windows computer and enter the **host's own Radmin VPN IPv4**.
- Open `http://RADMIN_HOST_IP:10000/play` on **both** browsers (same virtual Radmin network). The local relay serves the browser game and WebSocket on one address.
- The game automatically selects the same-origin WebSocket server; the host creates a room and the guest joins with the code.
- Host Node.js binds only to the supplied Radmin interface address; do not forward the port to the open internet.
- On HTTP the clipboard API may be unavailable, so invite copying falls back to a manual dialog.
- Full Russian guide: [Radmin VPN setup](docs/RADMIN_LAN_RU.md).
- The LAN connection is still a relay and not a dedicated 128-tick authoritative combat server.

## 5.2 — RTT, high-frequency movement and visible sniper tracers

- **Ping / RTT HUD:** shows server round-trip delay and full round-trip to your opponent (in relay mode), or opponent RTT in P2P mode.
- **128 Hz fixed local physics:** client movement and damage are stepped at a fixed simulation rate; actual frame rate and CPU may limit the number of processed steps.
- **Position updates up to 64 Hz**, host score/HP sync up to 30 Hz. The existing WebSocket relay remains a packet forwarder and is **not** a 128-tick authoritative game server.
- **Sniper tracers:** longer-lived and visually offset from the view center so the line is visible, including when scoped.
- **Windows server launcher:** `server/start-windows.bat` installs dependencies and starts a localhost relay. A public HTTPS/WSS endpoint still requires a real domain and reverse proxy/tunnel.
- **Hosting guide:** [Windows self-hosting and affordable RU/KZ VPS](docs/SELF_HOSTING_RU.md). Includes real TLS/WSS prerequisites, CG-NAT warning, and VPS deployment.
- Added client syntax verification in GitHub Actions and RTT echo support in the relay.

## 5.1 — Connection fix: optional WebSocket relay

If **rooms are only created with VPN, or joining hangs indefinitely**, PeerJS/WebRTC may be blocked by an ISP, firewall or NAT. **GitHub Pages cannot provide a WebSocket game server.**

The game now has two network modes under **Настройки сети**:
- **PeerJS / P2P (experimental)**: no backend deployment, but not universally reachable. A network timeout now explains errors instead of spinning forever. Connecting via VPN may still fail during WebRTC's ICE stage.
- **Через сервер (WebSocket)**: both browsers connect to one server; peer-to-peer connectivity is not required. The repo contains a minimal Node.js relay in `server/` and a free Render Blueprint `render.yaml`.

### Deploy the relay once on Render

1. Visit https://dashboard.render.com/ and sign in.
2. Choose **New → Blueprint**; connect GitHub and select repository `nasickkk/track-duel`.
3. Use `main` and the default Blueprint file `render.yaml`; review and click **Deploy Blueprint**.
4. Open the created web service after it becomes **Live**. Copy its public HTTPS URL ending in `.onrender.com` (your actual URL may differ from the service name).
5. Verify `https://YOUR-RENDER-URL/health` returns JSON with `"ok":true`.
6. In TRACK DUEL 5.1, select **Через сервер (WebSocket)** and enter the HTTPS Render URL.
7. Click **Создать комнату** and use **Скопировать ссылку другу**. Your friend opens that link, which fills the same server URL and room code, then clicks **Войти**.

For local development: from `server/`, run `npm install` and `npm start` (default port 10000; WebSocket endpoint `/ws`). Browser use at localhost requires NODE_ENV other than production. The Render deployment config accepts the GitHub Pages origin only.

**Limitations:** Render free web services can sleep after inactivity; the first connection may take about a minute, so the client waits up to 95 seconds. The relay is for hobby/testing only: it is not an authoritative anti-cheat server and does not persist accounts or scores. Room codes are not passwords, and the server caps message sizes and rates. With some networks even the Render domain can be inaccessible, so successful access from every country cannot be guaranteed.

## 5.0 — New features

- **Full sniper scope:** Hold **right mouse button** with the sniper selected to enter a circular optic with a reticle, darkened periphery and zoom. Sniper FOV (zoom) and an **independent scoped mouse-sensitivity multiplier** can be adjusted via **V**. The scope and gun view model automatically switch as you aim/un-aim.
- **3D scaling gizmos:** In Map Creator, select an object and drag the **red X** (width), **blue Z** (depth) or **yellow Y** (height) handle. Orbit with right mouse, zoom with mouse wheel, position objects by dragging, switch between 3D and 2D views.
- **Adjustable arena dimensions:** Change width from **32 to 100** units, depth from **24 to 90** in the editor's right panel. Floors, boundary walls, collisions, and 2D map proportions update with the changes. Import/export JSON saves the dimensions alongside objects.
- **Spawn editing:** Add or remove spawn markers up to **4**. Existing maps with two markers remain compatible. 2 markers = 1v1, 3 markers = future FFA3, 4 markers = future 2v2. The editor only prepares maps for larger formats; **online matches still allow two participants only**.
- **Host lobby rules:** Select mode (1v1 currently enabled), enable/disable wall-kick, adjust its push force, toggle jump pads, and choose allowed weapons. Room creator's rules and map are shared with the guest when connecting. Settings are stored in the creator's browser.
- **Wall-kick movement:** If allowed in the lobby, press **Space in the air close to a wall** to jump away from it; short cooldown prevents spamming. This is a movement boost, not a hit-based collision rebound.

## Controls

| Action | Controls |
| --- | --- |
| Move / sprint | WASD / Shift |
| Aim / shoot | Mouse / left mouse button |
| Jump or optional wall-kick | Space |
| Scope the sniper | Hold right mouse button while using sniper |
| Weapons | 1 tracking beam · 2 semi-auto tap gun · 3 sniper |
| View model, mouse sensitivity, sniper scope settings | V |
| Toggle sounds | M |
| Map Creator — orbit camera | Right mouse + drag |
| Map Creator — scale selected solid | Drag 3D colored handle |
| Map Creator — position | Left mouse + drag |
| Map Creator — zoom | Mouse wheel |
| Map Creator — undo / redo | Ctrl+Z / Ctrl+Y |
| Map Creator — duplicate / rotate / delete | Ctrl+D / R / Delete |

## Deploy using GitHub Pages

Open the repository's **Settings → Pages**. Set Source to **Deploy from a branch**, Branch to **main**, Folder to **/(root)**, then Save. Keep `index.html` in the repository root. The page loads Three.js and PeerJS from public CDNs, so internet is required.

Open the same website in both players' browsers. One clicks **Create Room**, shares the six-character code, and the other joins. Direct P2P connectivity is not guaranteed from all NAT/firewall combinations. If a two-player online match fails, test the bot and check browser devtools.

## Security and networking caveat

The 1v1 host is the provisional match coordinator, **not a trusted anti-cheat server**. Do not treat room codes as account passwords, and do not add credentials, API secrets, or private tokens to the static HTML or repository. A future public release with profiles, saved stats, and dependable competitive matchmaking requires a dedicated backend with strong credential storage, validation and security controls.

## Roadmap

1. Authoritative server with multiplayer rooms for 2–4 players, team assignment and state synchronization.
2. Secure accounts and database-backed performance metrics (accuracy, rounds, victories) and a leaderboard.
3. Better networking: interpolation, lag compensation, matchmaking settings and reliable lobby joining.
4. Custom terrain height editing, more flexible 3D gizmos, user map sharing and browser-safe presets.
5. Cosmetics: low-poly skins, sound effects, taunts and expressions.

Files: `index.html` is the browser client. `server/` is a basic WebSocket relay with tests, and `render.yaml` configures optional Render hosting. Gameplay is still not server-authoritative.