# Testing Guide for Refactored APIs

This guide helps you verify that all API endpoints are working correctly after the refactoring.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Make sure your `.env` file contains:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/duck_playground
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duck_playground

# Auth
JWT_SECRET=your-secret-key
SITE_PASSWORD=duck
ADMIN_PASSWORD=duck

# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

This will start:
- Astro dev server on `http://localhost:4321`
- WebSocket server on `http://localhost:3001`

## Testing Public Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-06-15T10:30:00.000Z"
}
```

### List Polls
```bash
curl http://localhost:3001/api/polls
```

Expected response:
```json
[
  // Array of poll objects or empty array
]
```

### Vote on Poll
First, create a poll, then submit a vote:
```bash
curl -X POST http://localhost:3001/api/vote/POLL_ID \
  -H "Content-Type: application/json" \
  -d '{
    "voter_name": "John Doe",
    "choice": "date1",
    "voter_token": "device-token"
  }'
```

## Testing Authentication

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "duck"}' \
  -c cookies.txt
```

Expected response:
```json
{
  "success": true
}
```

The response sets a `duck_session` cookie.

### Check Auth Status
```bash
curl http://localhost:3001/api/auth/status \
  -b cookies.txt
```

Expected response:
```json
{
  "authenticated": true
}
```

### Access Protected Endpoint
```bash
curl http://localhost:3001/api/admin/stats \
  -b cookies.txt
```

Expected response:
```json
{
  "totalApplications": 0,
  "approved": 0,
  "rejected": 0,
  "pending": 0,
  "nextEventDate": "2026-06-15T10:30:00.000Z"
}
```

### Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

Expected response:
```json
{
  "success": true
}
```

## Testing Image Generation

### Generate Countdown Image
```bash
curl "http://localhost:3001/api/images/countdown?deadline=2026-07-15&eventName=Duck%20Dating%20Apps" \
  -o countdown.png
```

This should generate a PNG image.

### Generate Event Poster
```bash
curl "http://localhost:3001/api/images/poster?title=Speed%20Dating&date=2026-07-01&location=Berlin" \
  -o poster.png
```

This should generate a PNG image.

## Testing Events Endpoints

### List Events (Public)
```bash
curl http://localhost:3001/api/events
```

Expected response:
```json
{
  "events": []
}
```

### Create Event (Authenticated)
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Speed Dating Event",
    "date": "2026-07-01",
    "location": "Berlin",
    "maxParticipants": 50
  }'
```

Expected response:
```json
{
  "id": 1,
  "name": "Speed Dating Event",
  "date": "2026-07-01",
  "location": "Berlin",
  "maxParticipants": 50,
  "message": "Event created successfully"
}
```

## Testing Admin Endpoints

All admin endpoints require authentication.

### Get Applications
```bash
curl http://localhost:3001/api/admin/applications \
  -b cookies.txt
```

Expected response:
```json
{
  "applications": []
}
```

### Get Dashboard Stats
```bash
curl http://localhost:3001/api/admin/stats \
  -b cookies.txt
```

Expected response:
```json
{
  "totalApplications": 0,
  "approved": 0,
  "rejected": 0,
  "pending": 0,
  "nextEventDate": "2026-06-15T10:30:00.000Z"
}
```

## Testing Matching Endpoints

### Get User Matches (Authenticated)
```bash
curl http://localhost:3001/api/matching/user/USER_ID \
  -b cookies.txt
```

Expected response:
```json
{
  "userId": "USER_ID",
  "matches": []
}
```

## Frontend Client Testing

### Example: Login and Fetch User Matches

```javascript
// 1. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Send cookies
  body: JSON.stringify({ password: 'duck' })
});

if (loginRes.ok) {
  console.log('Login successful');
  
  // 2. Fetch user matches (now authenticated)
  const matchesRes = await fetch('/api/matching/user/user-123', {
    credentials: 'include'
  });
  
  const matches = await matchesRes.json();
  console.log('User matches:', matches);
}
```

## Troubleshooting

### 401 Unauthorized on Protected Endpoints
- Make sure you're sending the `duck_session` cookie
- Verify the cookie was set correctly during login
- Check that `JWT_SECRET` env var matches what was used during login

### API Endpoints Not Found (404)
- Verify you're using the correct path (e.g., `/api/...`)
- Make sure both servers are running (Astro + WebSocket)
- Check the browser console for network errors

### CORS Errors
- If frontend is on a different port, ensure `CORS_ORIGIN` env var includes it
- Default allowed origins: `http://localhost:3000`, `http://localhost:4321`

### Database Connection Errors
- Verify `DATABASE_URL` or individual DB credentials are correct
- Ensure PostgreSQL is running
- Check database name exists

### WebSocket Connection Issues
- WebSocket server runs on same port as HTTP server
- Make sure port 3001 is not in use
- Check WebSocket proxy settings if behind reverse proxy

## Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run tests
npm test

# Check git status
git status

# View recent commits
git log --oneline -10
```

## Next Steps

1. Verify all endpoints work as expected
2. Update frontend client code if needed
3. Run full test suite
4. Deploy to staging environment
5. Run integration tests
6. Deploy to production

For more details on endpoints, see [API_ENDPOINTS.md](./API_ENDPOINTS.md).
For refactoring notes, see [REFACTORING_NOTES.md](./REFACTORING_NOTES.md).
