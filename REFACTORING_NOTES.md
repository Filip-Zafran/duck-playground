# API Refactoring: Express to Astro

## Summary
Successfully refactored all HTTP API endpoints from Express (in `src/routes/`) to Astro native API routes (in `src/pages/api/`).

## Changes Made

### 1. **Astro Configuration** (`astro.config.mjs`)
- Changed `output` from `static` to `hybrid` to enable server-side rendering
- Added Node adapter (`@astrojs/node`) for production server support
- Removed Vite proxy config (no longer needed since APIs are now Astro routes)

### 2. **Authentication Middleware** (`src/middleware.ts`)
- Created Astro middleware to replace Express `siteAuth` middleware
- Handles JWT verification from `duck_session` cookie
- Protects authenticated routes with automatic redirects to login
- Allows public paths and API endpoints to pass through

### 3. **API Authentication Utilities** (`src/lib/apiAuth.ts`)
- Created helper functions for API route protection
- `getTokenFromRequest()` - extracts JWT from request cookies
- `requireAuth()` - validates token and returns appropriate response

### 4. **API Routes** (`src/pages/api/`)
Created all endpoints as Astro route handlers:

#### Auth Endpoints
- `POST /api/auth/login` - authenticate with password
- `GET /api/auth/status` - check authentication status
- `POST /api/auth/logout` - clear session cookie

#### Polls Endpoints
- `GET /api/polls` - list all polls with vote counts
- `POST /api/polls` - create new poll
- `GET /api/polls/[id]` - get poll results
- `DELETE /api/polls/[id]` - delete poll (auth required)

#### Vote Endpoints
- `GET /api/vote/[pollId]` - get poll details with vote counts
- `POST /api/vote/[pollId]` - submit a vote

#### Image Generation Endpoints
- `GET /api/images/countdown` - generate countdown image
- `GET /api/images/poster` - generate event poster image

#### Events Endpoints
- `GET /api/events` - list all events
- `POST /api/events` - create event (auth required)
- `GET /api/events/[id]` - get event details
- `PUT /api/events/[id]` - update event (auth required)
- `DELETE /api/events/[id]` - delete event (auth required)
- `GET /api/events/[id]/participants` - get event participants

#### Admin Endpoints
- `GET /api/admin/applications` - list applications (auth required)
- `GET /api/admin/applications/[id]` - get application details (auth required)
- `POST /api/admin/applications/[id]/approve` - approve application (auth required)
- `POST /api/admin/applications/[id]/reject` - reject application (auth required)
- `GET /api/admin/stats` - get dashboard stats (auth required)

#### Matching Endpoints
- `GET /api/matching/user/[userId]` - get user matches (auth required)
- `POST /api/matching/calculate/[eventId]` - calculate matches (auth required)
- `GET /api/matching/[matchId]` - get match details (auth required)
- `POST /api/matching/[matchId]` - update match status (auth required)

#### Health Check
- `GET /api/health` - server health status

### 5. **Server Simplification** (`src/server.js`)
- Removed all Express HTTP API route setup
- Kept WebSocket server for real-time chat functionality
- Now focused solely on Socket.io connection handling
- Still initializes database on startup

### 6. **Package.json Updates**
- Added `@astrojs/node` dev dependency for production server
- Updated dev/build scripts:
  - `dev`: Runs `astro dev` + `node src/server.js` concurrently
  - `build`: Builds with `astro build`
  - `start`: Runs the built app with `node dist/server.mjs`
  - `preview`: Runs `astro preview` + WebSocket server concurrently

## Development Workflow

### Local Development
```bash
npm run dev
```
This starts:
- Astro dev server on port 4321 (with hot reload)
- WebSocket server on port 3001

### Production Build
```bash
npm run build
npm start
```

This:
1. Builds Astro app with Node adapter (generates `dist/server.mjs`)
2. Starts production server that handles both HTTP APIs and static files
3. WebSocket server listens for connections

## Migration Benefits

✅ **Unified Framework**: All routes now use Astro's native API route system  
✅ **Type Safety**: Using TypeScript for API routes  
✅ **Better Integration**: Middleware is Astro-native  
✅ **Cleaner Codebase**: Removed Express boilerplate  
✅ **Server Rendering Ready**: Can now use Astro's SSR features  

## Important Notes

### WebSocket Server
The WebSocket server still runs separately on port 3001 (or `PORT` env var) for real-time chat. In a production setup, you might want to:
- Integrate it into the main Astro server using a custom integration
- Use a different approach for real-time communication (e.g., polling)
- Run WebSocket on a different port with reverse proxy configuration

### Database
Database initialization happens when the WebSocket server starts. If only the Astro app is needed, you may want to initialize the database elsewhere or update the startup sequence.

### Old Routes Folder
The original `src/routes/` folder is now unused and can be deleted once verified that all functionality has been migrated.

### Middleware
The old `src/middleware/` folder is also largely unused now, except for reference. The core authentication is handled in:
- `src/middleware.ts` (Astro middleware for page protection)
- `src/lib/apiAuth.ts` (API route protection helpers)

## Next Steps

1. **Test the Application**
   - Verify all API endpoints work correctly
   - Test authentication flow
   - Test file uploads (images endpoint)
   - Test polling functionality

2. **Optional Optimizations**
   - Remove Express and related dependencies if no longer used
   - Clean up `src/routes/` and old `src/middleware/` folders
   - Integrate WebSocket into main Astro server using custom integration
   - Add error handling middleware at the Astro level

3. **Update Client Code**
   - Ensure frontend correctly calls new API endpoints
   - Verify API response formats match expectations
   - Test CORS handling if needed

## File Structure Reference

```
src/
├── pages/
│   └── api/                    # New Astro API routes
│       ├── auth/
│       ├── polls/
│       ├── vote/
│       ├── images/
│       ├── events/
│       ├── admin/
│       ├── matching/
│       └── health.ts
├── lib/
│   └── apiAuth.ts             # API auth utilities
├── middleware.ts              # Astro auth middleware
├── server.js                  # WebSocket server
├── routes/                    # OLD: can be deleted
└── middleware/                # OLD: can be deleted
```
