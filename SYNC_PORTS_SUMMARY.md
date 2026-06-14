# Port Sync Issue - Complete Summary

## Current Situation (June 14, 2026 - End of Session)

### ✅ What Works
- **Port 4321** (Astro dev server): Shows latest code with hot reload
- **Port 3001** (Express + proxy): Shows identical content to 4321 via proxy
- Both local ports are **perfectly synced** with Express proxying to Astro dev
- **Architecture fully validated**: Proxy architecture working as designed

### ❌ What Doesn't Work
- **Live Render deployment** (https://duck-playground.onrender.com): **Still serves OLD code**
- Specific evidence: Missing login/logout button in Header component
  - Localhost: `<button class="login-btn">🔐 Login</button>` ✅
  - Render: No login button ❌
  - Also different CSS class names: `s-c1MG4BWNDc59` (new) vs `svelte-oiwvqb` (old)

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

## All Attempts Made (6/14/2026)

### Early Attempts: Port Sync
1. **Rebuild & Restart** ❌ - `pnpm dev` doesn't update `dist/`
2. **Proxy Middleware** ❌ - Static files served before proxy reached
3. **`astro build --watch`** ❌ - Command doesn't exist
4. **Production Static Serving** ❌ - Multiple path issues

### Late Attempts: Fix Render Deployment
5. **Explicit nested index.html serving** ❌
   - Added file existence checks and logging
   - Render logs showed: `POLL FOLDER EXISTS: true`, `POLL INDEX EXISTS: true`
   - But served old compiled code anyway

6. **Debug logging** ✅
   - Confirmed dist/ folder exists on Render
   - Confirmed `/poll/index.html` exists
   - Path logic appears correct
   - Yet still serving old Header component

7. **Clean rebuild** ❌
   - Changed build command: `rm -rf dist node_modules && pnpm install && pnpm build`
   - Render logs show "Build successful"
   - dist/ files confirmed built and uploaded
   - **Still serves old code after restart**

## The Unsolved Mystery

**Paradox**: Render appears to build and deploy correctly, but serves old code.

### Evidence of the Problem
```
Localhost 3001 (Latest Code):
- Header class: s-c1MG4BWNDc59
- Login button: ✅ Present (<button class="login-btn">🔐 Login</button>)
- Styles: Unminified with data-vite-dev-id (dev version)

Render Live (Old Code):
- Header class: svelte-oiwvqb
- Login button: ❌ Missing entirely
- Styles: Minified/compiled (built version)
```

### What We Know
1. ✅ Render successfully runs `pnpm build`
2. ✅ All 17 pages build correctly  
3. ✅ Build is uploaded (logs show "Uploaded in 5.7s")
4. ✅ `/poll/index.html` exists on server (`POLL FOLDER EXISTS: true`)
5. ✅ Server starts without errors
6. ❌ Yet serves 2+ versions behind current code

### Possible Root Causes (Unconfirmed)
- **Render instance caching**: Render might be caching the previous deployment
- **dist/ not being updated**: Build runs but doesn't overwrite dist/
- **Static file caching**: Render's reverse proxy/CDN caching old files
- **Wrong entry point**: Express might be serving from wrong location
- **Process not restarting**: Old process still running even after deploy

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

## Next Steps to Resolve Render Issue

1. **Verify dist/ contents on Render**
   - SSH into Render or add endpoint that lists dist/ directory contents
   - Compare file modification timestamps to deployment time
   - Verify Header.*.js file hash matches localhost

2. **Check Render process state**
   - Confirm old process actually stopped
   - Add startup logging to see which dist/ path Express is using
   - Monitor memory/PID to ensure clean restart

3. **Consider Render platform issues**
   - Check if Render caches build artifacts between deployments
   - Look for CDN/proxy caching on Render's infrastructure
   - Verify build directory is actually `/opt/render/project/src/dist`

4. **Alternative solutions if platform issue**
   - Use Render's environment variable: force cache bust
   - Trigger a full rebuild (not incremental)
   - Contact Render support about deployment caching

## Development Architecture (Final)

**Local Development** ✅ (WORKING):
```
Browser → localhost:3001 (Express proxy)
              ↓
         localhost:4321 (Astro dev)
              ↓
         Latest code with hot reload
```

**Production** ❌ (BROKEN):
```
Browser → render.com (Express server)
              ↓
         dist/ (old compiled files)
              ↓
         Stale code served
```

## Summary

- **Local ports 3001 & 4321**: FULLY SYNCED ✅ via Express proxy to Astro dev
- **Architecture**: Clean, working, validated
- **Issue**: Render deployment not syncing with latest dist/ 
- **Status**: Unsolved—appears to be Render platform-level caching or deployment issue
