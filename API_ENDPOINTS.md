# API Endpoints Reference

This document maps all API endpoints after the migration from Express to Astro.

## Base URL
- **Development**: `http://localhost:3001/api/` (proxied through Astro dev server)
- **Production**: `http://localhost:3001/api/` (served by Node adapter)

## Authentication Endpoints

### POST /api/auth/login
Creates a new session with password authentication.

**Request:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "success": true
}
```
Sets `duck_session` cookie with JWT token.

### GET /api/auth/status
Checks current authentication status.

**Response:**
```json
{
  "authenticated": true
}
```

### POST /api/auth/logout
Clears the session cookie and logs out the user.

**Response:**
```json
{
  "success": true
}
```

---

## Polls Endpoints

### GET /api/polls
Lists all polls with vote counts.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "expected": 0,
    "created_at": "ISO8601",
    "admin_token": "hex",
    "date1": "date",
    "time1": "time",
    "date2": "date",
    "time2": "time",
    "date3": "date",
    "time3": "time",
    "timer_end": "ISO8601",
    "vote_count": 0
  }
]
```

### POST /api/polls
Creates a new poll.

**Request:**
```json
{
  "title": "string",
  "description": "string",
  "duration": "string",
  "expected": 0,
  "open_access": true,
  "date1": "date",
  "time1": "time",
  "date2": "date",
  "time2": "time",
  "date3": "date",
  "time3": "time",
  "timer_minutes": 0,
  "invite_emails": ["email@example.com"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "admin_token": "hex",
  "vote_url": "/poll-vote?token=uuid",
  "admin_url": "/poll?admin=hex"
}
```

### GET /api/polls/:id
Gets poll results with vote counts and preview.

**Response:**
```json
{
  "counts": {
    "date1": 0,
    "date2": 0,
    "date3": 0,
    "none": 0
  },
  "previews": [
    {
      "initials": "JD",
      "choice": "date1"
    }
  ]
}
```

### DELETE /api/polls/:id
Deletes a poll (requires authentication).

**Response:**
```json
{
  "id": "uuid",
  "message": "Poll deleted successfully"
}
```

---

## Vote Endpoints

### GET /api/vote/:pollId
Gets poll details with vote counts and previews.

**Response:**
```json
{
  "title": "string",
  "description": "string",
  "duration": "string",
  "date1": "date",
  "time1": "time",
  "date2": "date",
  "time2": "time",
  "date3": "date",
  "time3": "time",
  "expected": 0,
  "timer_end": "ISO8601",
  "counts": {
    "date1": 0,
    "date2": 0,
    "date3": 0,
    "none": 0
  },
  "votes_preview": []
}
```

### POST /api/vote/:pollId
Submits a vote for a poll.

**Request:**
```json
{
  "voter_name": "string",
  "choice": "date1|date2|date3|none",
  "alt_date": "date",
  "voter_token": "string"
}
```

**Response:**
```json
{
  "ok": true,
  "counts": {...},
  "votes_preview": [...]
}
```

---

## Image Generation Endpoints

### GET /api/images/countdown
Generates a countdown image.

**Query Parameters:**
- `deadline` (required): ISO8601 date string
- `eventName` (optional): Event name to display

**Response:** PNG image

**Example:**
```
GET /api/images/countdown?deadline=2026-07-01&eventName=Duck%20Dating%20Apps
```

### GET /api/images/poster
Generates an event poster image.

**Query Parameters:**
- `title` (optional): Event title
- `date` (optional): Event date
- `location` (optional): Event location

**Response:** PNG image

**Example:**
```
GET /api/images/poster?title=Speed%20Dating&date=2026-07-01&location=Berlin
```

---

## Events Endpoints

### GET /api/events
Lists all events.

**Response:**
```json
{
  "events": []
}
```

### POST /api/events
Creates a new event (requires authentication).

**Request:**
```json
{
  "name": "string",
  "date": "date",
  "location": "string",
  "maxParticipants": 0
}
```

**Response:**
```json
{
  "id": 1,
  "name": "string",
  "date": "date",
  "location": "string",
  "maxParticipants": 0,
  "message": "Event created successfully"
}
```

### GET /api/events/:id
Gets event details.

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "date": "date",
  "location": "string",
  "status": "postponed"
}
```

### PUT /api/events/:id
Updates an event (requires authentication).

### DELETE /api/events/:id
Deletes an event (requires authentication).

### GET /api/events/:id/participants
Gets event participants.

**Response:**
```json
{
  "eventId": "uuid",
  "participants": []
}
```

---

## Admin Endpoints

All admin endpoints require authentication.

### GET /api/admin/applications
Lists all applications.

**Response:**
```json
{
  "applications": []
}
```

### GET /api/admin/applications/:id
Gets application details.

**Response:**
```json
{
  "id": "uuid",
  "message": "Application details endpoint"
}
```

### POST /api/admin/applications/:id/approve
Approves an application.

**Response:**
```json
{
  "id": "uuid",
  "status": "approved",
  "message": "Application approved"
}
```

### POST /api/admin/applications/:id/reject
Rejects an application.

**Request:**
```json
{
  "reason": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "rejected",
  "reason": "string",
  "message": "Application rejected"
}
```

### GET /api/admin/stats
Gets dashboard statistics.

**Response:**
```json
{
  "totalApplications": 0,
  "approved": 0,
  "rejected": 0,
  "pending": 0,
  "nextEventDate": "ISO8601"
}
```

---

## Matching Endpoints

All matching endpoints require authentication.

### GET /api/matching/user/:userId
Gets matches for a user.

**Response:**
```json
{
  "userId": "uuid",
  "matches": []
}
```

### POST /api/matching/calculate/:eventId
Calculates matches for an event.

**Response:**
```json
{
  "eventId": "uuid",
  "matchesCalculated": 0,
  "message": "Matching algorithm executed"
}
```

### GET /api/matching/:matchId
Gets match details.

**Response:**
```json
{
  "matchId": "uuid",
  "user1": {},
  "user2": {},
  "matchScore": 85,
  "sharedInterests": []
}
```

### POST /api/matching/:matchId
Updates match status.

**Request:**
```json
{
  "status": "interested|passed"
}
```

**Response:**
```json
{
  "matchId": "uuid",
  "status": "interested",
  "message": "Match status updated"
}
```

---

## Health Check

### GET /api/health
Checks server health.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "ISO8601"
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate vote)
- `500` - Server Error

---

## Authentication

Authenticated endpoints require a valid `duck_session` cookie. The session is:
- Set on successful login via `POST /api/auth/login`
- Verified on each request via middleware
- Cleared on logout via `POST /api/auth/logout`

Cookie Details:
- Name: `duck_session`
- Type: HTTPOnly (not accessible via JavaScript)
- Expires: 7 days
- Path: `/`
- SameSite: Lax
- Secure: Yes (in production only)

---

## WebSocket Chat

The WebSocket server runs separately on the same port with Socket.io.

**Connection:**
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'jwt-token'
  }
});
```

**Events:**
- `join_room` - Join a chat room
- `send_message` - Send a message
- `leave_room` - Leave a chat room
- `user_joined` - User joined notification
- `new_message` - New message notification
- `user_left` - User left notification
