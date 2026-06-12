# Duck Playground - API Documentation

## Base URL
- Development: `http://localhost:3001`
- Production: `https://duck-playground.railway.app` (or your deployment)

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt-token>
```

## Admin Routes

### List Applications
```
GET /api/admin/applications
Headers: Authorization: Bearer <token>
Response: { applications: [...] }
```

### Get Single Application
```
GET /api/admin/applications/:id
Headers: Authorization: Bearer <token>
Response: { id, name, email, status, ... }
```

### Approve Application
```
POST /api/admin/applications/:id/approve
Headers: Authorization: Bearer <token>
Response: { id, status: "approved" }
```

### Reject Application
```
POST /api/admin/applications/:id/reject
Headers: Authorization: Bearer <token>
Body: { reason: "string" }
Response: { id, status: "rejected", reason }
```

### Dashboard Stats
```
GET /api/admin/stats
Headers: Authorization: Bearer <token>
Response: { totalApplications, approved, rejected, pending, nextEventDate }
```

## Events Routes

### List Events
```
GET /api/events
Response: { events: [...] }
```

### Get Event
```
GET /api/events/:id
Response: { id, name, date, location, status, maxParticipants, registered }
```

### Create Event (Admin)
```
POST /api/events
Headers: Authorization: Bearer <token>
Body: { name, date, location, maxParticipants }
Response: { id, name, date, ... }
```

### Update Event (Admin)
```
PUT /api/events/:id
Headers: Authorization: Bearer <token>
Body: { name?, date?, location?, status? }
Response: { id, ...updates }
```

### Delete Event (Admin)
```
DELETE /api/events/:id
Headers: Authorization: Bearer <token>
Response: { id, message: "Event deleted successfully" }
```

### List Event Participants
```
GET /api/events/:id/participants
Response: { eventId, participants: [...] }
```

## Matching Routes

### Get User Matches
```
GET /api/matching/user/:userId
Headers: Authorization: Bearer <token>
Response: { userId, matches: [{id, name, matchScore, sharedInterests, ...}] }
```

### Calculate Matches (Admin)
```
POST /api/matching/calculate/:eventId
Headers: Authorization: Bearer <token>
Response: { eventId, matchesCalculated, message }
```

### Get Match Details
```
GET /api/matching/:matchId
Headers: Authorization: Bearer <token>
Response: { matchId, user1, user2, matchScore, sharedInterests }
```

### Update Match Status
```
POST /api/matching/:matchId/status
Headers: Authorization: Bearer <token>
Body: { status: "interested" | "passed" | ... }
Response: { matchId, status, message }
```

## Image Generation Routes

### Countdown Image
```
GET /api/images/countdown?deadline=2026-06-03&eventName=PSD%20Berlin
Response: PNG image
```

Query parameters:
- `deadline` (required): ISO date string
- `eventName` (optional): Event name to display
- `title` (optional): Alternative title

### Event Poster
```
GET /api/images/poster?title=Poly%20Speed%20Dating&date=2026-06-03&location=Berlin
Response: PNG image
```

Query parameters:
- `title` (optional): Event title
- `date` (optional): Event date
- `location` (optional): Event location

## WebSocket Chat

### Connection
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

**Join Room**
```javascript
socket.emit('join_room', {
  roomId: 'room-123',
  userId: 'user-456'
});

socket.on('user_joined', (data) => {
  console.log(data.userId, 'joined');
});
```

**Send Message**
```javascript
socket.emit('send_message', {
  roomId: 'room-123',
  userId: 'user-456',
  message: 'Hello'
});

socket.on('new_message', (data) => {
  console.log(data.userId, ':', data.message);
});
```

**Leave Room**
```javascript
socket.emit('leave_room', {
  roomId: 'room-123',
  userId: 'user-456'
});

socket.on('user_left', (data) => {
  console.log(data.userId, 'left');
});
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "status": 400
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

## Rate Limiting

Currently no rate limiting. Consider adding:
- 100 requests/minute per IP
- 1000 requests/hour per authenticated user

## CORS

Configured to accept requests from:
```
http://localhost:3000
https://psd-website.com
```

Update in `.env` via `CORS_ORIGIN`
