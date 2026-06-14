# Port Sync Issue - Complete Summary

## Current Situation (June 14, 2026)

### ✅ What Works
- **Port 4321** (Astro dev server): Shows latest code with hot reload
- **Port 3001** (Express + proxy): Shows identical content to 4321 via proxy
- Both local ports are **perfectly synced**

### ❌ What Doesn't Work
- **Live Render deployment** (https://duck-playground.onrender.com): Still shows old code
- Render builds dist/ correctly, but serves wrong files at runtime

## Technologies Stack

### Frontend
- **Astro 5.18.2** - Static site generator
- **Svelte 5.56.3** - Component framework
- **Vite** - Build tool

### Backend
- **Express 4.18.2** - Node.js server
- **Node.js** (with `--watch` for auto-reload)
- **PostgreSQL** - Database via `pg` package

### DevOps
- **pnpm** - Package manager
- **Render** - Hosting platform
- **Concurrently** - Run multiple processes

### Build Output
- **Astro output**: Static HTML files in `dist/`
- Each page generates: `dist/<pagename>/index.html`
- Example: `/poll` → `dist/poll/index.html`

## Development Architecture

```
Development Mode:
┌─────────────────────────────────────────┐
│ Browser                                 │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
 localhost:3001  localhost:4321
      │             │
   Express       Astro Dev
   (proxy)       (source)
      │             │
      └─────────────┘
   API routes → /api/*
   Everything else → proxies to 4321
```

## Attempts Made

### Attempt 1: Rebuild & Restart ❌
- Ran `pnpm build && pnpm dev`
- Didn't work: `pnpm dev` runs Astro in dev mode (doesn't update `dist/`)
- Express still served old files

### Attempt 2: Proxy Middleware ❌
- Added code to proxy requests from 3001 to 4321
- Didn't work: Static files were served before proxy was reached

### Attempt 3: `astro build --watch` ❌
- Changed dev script to rebuild `dist/` on file changes
- Didn't work: Command doesn't exist

### Attempt 4: Production Static File Serving ❌
- Modified Express to serve `dist/` in production
- Render builds dist/ correctly, but:
  - First fix: Served home page for all routes
  - Second fix: Path doubling error (`/opt/render/project/src/opt/render/project/src/dist/...`)
  - Third fix: Removed `{ root: '.' }` option

## Current Problem (Unresolved)

**Issue**: Live site shows old code even though:
- Render successfully runs `pnpm build`
- All 17 pages build correctly
- Build is uploaded to Render
- Server starts without errors

**Evidence**:
- Local: `dist/poll/index.html` has title `"Manage Polls - PSD"`
- Local ports 3001 & 4321: Both show correct Poll Management page
- Live: Still shows home page (dev hub) for `/poll` route

**Suspect Cause**: Express file serving logic still incorrect, OR dist/ files not being found at runtime

## File Structure

```
dist/
├── index.html (home page)
├── poll/
│   └── index.html (Poll Management)
├── poll-vote/
│   └── index.html (Poll Voting)
├── interests/
│   └── index.html
└── ... (other pages)
```

## Next Steps Needed

1. Debug why `dist/poll/index.html` isn't being served on Render
2. Check file permissions on Render
3. Verify Express path logic is correct
4. Consider alternative: rebuild dist/ on each Render deployment
