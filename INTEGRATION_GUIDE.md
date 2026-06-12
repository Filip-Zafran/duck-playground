# Integration Guide: Connect psd-website to Duck-Playground

## Step 1: Set Environment Variables

In `psd-website/.env`:
```
DUCK_PLAYGROUND_API=https://duck-playground.onrender.com
```

For local development:
```
DUCK_PLAYGROUND_API=http://localhost:3001
```

## Step 2: Update psd-website API Routes

Replace the local poll endpoints with Duck-Playground API calls.

### Before (Current: `src/pages/api/polls/index.ts`)
```typescript
// Uses local SQLite database
const db = getDatabase();
const polls = db.prepare(...).all();
```

### After (New: Call Duck-Playground)
```typescript
const API_URL = import.meta.env.DUCK_PLAYGROUND_API;
const response = await fetch(`${API_URL}/api/polls`);
const polls = await response.json();
```

## Step 3: Update Poll Pages

Both pages should fetch from Duck-Playground instead of local DB:

### `src/pages/poll.astro`
- Create/manage polls
- Call: `POST ${API_URL}/api/polls`

### `src/pages/poll-vote.astro`
- Display polls and vote
- Call: `GET ${API_URL}/api/vote/:pollId`
- Call: `POST ${API_URL}/api/vote/:pollId`

## Step 4: Test Integration

### Test poll creation:
```bash
curl -X POST http://localhost:3001/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Event Date",
    "date1": "2026-07-01",
    "date2": "2026-07-08",
    "date3": "2026-07-15",
    "open_access": true
  }'
```

### Test voting:
```bash
curl -X POST http://localhost:3001/api/vote/POLL_ID \
  -H "Content-Type: application/json" \
  -d '{
    "voter_name": "Alice",
    "choice": "date1",
    "voter_token": "device-token-12345"
  }'
```

### Get poll results:
```bash
curl http://localhost:3001/api/vote/POLL_ID
```

## Step 5: Remove Local Poll Database

Once migration is complete:
1. Delete `src/pages/api/polls/` from psd-website
2. Delete `src/pages/api/vote/` from psd-website
3. Delete poll tables from local SQLite if not needed

## Example: Updated Poll Page (Astro)

```astro
---
// src/pages/poll.astro
import Layout from '../layouts/Layout.astro';

const API_URL = import.meta.env.DUCK_PLAYGROUND_API;

// Get polls from Duck-Playground
const pollsResponse = await fetch(`${API_URL}/api/polls`);
const polls = await pollsResponse.json();
---

<Layout title="Polls">
  <h1>Scheduling Polls</h1>
  
  {polls.map(poll => (
    <div>
      <h2>{poll.title}</h2>
      <p>Votes: {poll.vote_count}</p>
    </div>
  ))}
</Layout>
```

## Environment Variables

### psd-website/.env
```
DUCK_PLAYGROUND_API=https://duck-playground.onrender.com
```

### Duck-Playground/.env (Render)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
CORS_ORIGIN=https://psd-website.com
```

## Common Issues

### "Poll not found"
- Check POLL_ID is correct
- Verify Duck-Playground is running
- Check CORS is configured

### "Vote already submitted"
- voter_token must be unique per voter
- Use device fingerprint or session ID as token

### API timeouts
- Check DATABASE_URL is correct
- Verify PostgreSQL connection
- Check Render logs for errors

## Next Steps

1. ✅ Duck-Playground poll routes created
2. 🔲 Update psd-website API routes to call Duck-Playground
3. 🔲 Test poll creation and voting
4. 🔲 Deploy psd-website with new API calls
5. 🔲 Decommission local poll database

---

**Status**: Duck-Playground side is ready. Next: Update psd-website routes.
