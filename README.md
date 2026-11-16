# TRACK DUEL 5.0

A lightweight browser-based FPS tracking duel and 3D map workshop, built with Three.js and experimental PeerJS peer-to-peer networking.

**Play (GitHub Pages):** https://nasickkk.github.io/track-duel/

> **Prototype:** Supports 1v1 (two people via peer-to-peer room code) and a local moving bot. No dedicated authoritative multiplayer server, persistent accounts, anti-cheat, match history, or reliable latency compensation yet. **3-player free-for-all and 2v2 are planned, not playable.** GitHub Pages hosts static files only.

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

The 1v1 P2P host is the provisional match coordinator, **not a trusted anti-cheat server**. Do not treat room codes as account passwords, and do not add credentials, API secrets, or private tokens to the static HTML or repository. A future public release with profiles, saved stats, and dependable competitive matchmaking requires a dedicated backend with strong credential storage, validation and security controls.

## Roadmap

1. Authoritative server with multiplayer rooms for 2–4 players, team assignment and state synchronization.
2. Secure accounts and database-backed performance metrics (accuracy, rounds, victories) and a leaderboard.
3. Better networking: interpolation, lag compensation, matchmaking settings and reliable lobby joining.
4. Custom terrain height editing, more flexible 3D gizmos, user map sharing and browser-safe presets.
5. Cosmetics: low-poly skins, sound effects, taunts and expressions.

Files: `index.html` is currently the entire prototype client. Future refactors will split client, server and shared game systems.
