# Port Sync Issue - Summary

## The Problem
- **Port 4321** (Astro dev server): Had latest code, hot reload works
- **Port 3001** (Express server): Served stale built files from `dist/` folder
- Changes made in code appeared on 4321 but NOT on 3001

## Attempts Made

### Attempt 1: Rebuild & Restart ❌
- Ran `pnpm build && pnpm dev`
- Didn't work: `pnpm dev` runs Astro in dev mode (doesn't update `dist/`)
- Express still served old files

### Attempt 2: Proxy Middleware in Express ❌
- Added code to proxy requests from 3001 to 4321
- Didn't work: Static files were served before proxy was reached
- Browser never got proxied to latest content

### Attempt 3: Remove dist/ from Static Files ❌
- Removed `express.static('dist')`
- Expected requests to proxy to 4321
- Still showed old content

### Attempt 4: Use `astro build --watch` ❌
- Changed dev script to rebuild `dist/` on file changes
- Didn't work: `astro build --watch` is not a valid command
- No rebuilding happened

## Final Solution ✅
**Clean Proxy Architecture:**
- **Port 4321**: Astro dev server (source of truth, hot reload enabled)
- **Port 3001**: Express server proxies frontend to 4321, handles `/api/*` routes
- User visits **either port** and sees the same latest content
- Changes on 4321 are instantly visible (no rebuild needed)

### How It Works
1. User visits `localhost:3001/poll`
2. Express receives request
3. If it's `/api/*` → Express handles it
4. Otherwise → Express proxies to `localhost:4321`
5. Browser sees latest Astro dev code

### No Need To
- Run `pnpm build` during development
- Switch between ports
- Wait for rebuilds
