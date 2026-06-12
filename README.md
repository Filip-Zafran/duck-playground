# 🦆 Duck Playground

Backend service for Duck Dating Apps - Admin Dashboard, Real-time Chat, Event Management, Dynamic Matching, and Image Generation.

**Stack**: Node.js + Express + PostgreSQL + Socket.io
**Hosting**: 100% Free Tier Services

## Features

- ✅ **Admin Dashboard** - Review applications, approve/reject, manage users
- ✅ **Real-time Webchat** - WebSocket-based messaging with Socket.io
- ✅ **Event Management** - Create, update, and manage events dynamically
- ✅ **Matching Algorithm** - Intelligent matching based on user interests
- ✅ **Image Generation** - Dynamic countdown and poster images with Sharp

## Free Deployment Stack

### Database: Railway.app (PostgreSQL) ✅ **FREE**
- 5GB storage free tier
- Perfect for this use case
- Easy setup with GitHub integration

**Setup:**
1. Go to [Railway.app](https://railway.app)
2. Create new project → Provision PostgreSQL
3. Copy connection string to `.env`

### Backend: Railway.app Node.js ✅ **FREE**
- Deploy directly from GitHub
- Automatic deployments on push
- Free tier: 500 hours/month

**Setup:**
1. In Railway, create new service
2. Connect to this GitHub repo
3. Add environment variables
4. Deploy automatically

### Alternative Free Hosting:
- **Render.com** - Free PostgreSQL + Node.js
- **Fly.io** - Free tier with auto-scaling
- **Self-hosted** - Use any VPS with free tier (AWS EC2, Google Cloud, Azure)

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Duck-Dating-Apps/Duck-Playground.git
cd Duck-Playground
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database

For local development:
```bash
# Install PostgreSQL locally, or use Docker
docker run --name duck-postgres -e POSTGRES_PASSWORD=password -d postgres:15

# Update .env with connection string
# Then run initialization from code
```

### 4. Run Locally

```bash
pnpm dev
```

Server runs on `http://localhost:3001`
WebSocket available at `ws://localhost:3001`

## API Endpoints

### Admin Routes
- `GET /api/admin/applications` - List all applications
- `POST /api/admin/applications/:id/approve` - Approve application
- `POST /api/admin/applications/:id/reject` - Reject application
- `GET /api/admin/stats` - Dashboard statistics

### Events Routes
- `GET /api/events` - List all events
- `POST /api/events` - Create event (admin)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Matching Routes
- `GET /api/matching/user/:userId` - Get matches for user
- `POST /api/matching/calculate/:eventId` - Calculate all matches (admin)

### Image Generation Routes
- `GET /api/images/countdown?deadline=2026-06-03&eventName=PSD` - Generate countdown image
- `GET /api/images/poster?title=Event&date=2026-06-03&location=Berlin` - Generate poster

### WebSocket Events (Chat)
- `join_room` - Join a chat room
- `send_message` - Send message to room
- `leave_room` - Leave chat room

## Integration with psd-website

The psd-website Astro site calls Duck-Playground APIs for:

1. **Admin Dashboard** - View/manage applications
2. **Event Management** - Display dynamic event data
3. **Matching** - Show personalized matches
4. **Images** - Embed countdown images in emails

Example API call from Astro:
```typescript
const response = await fetch('https://duck-playground.railway.app/api/events');
const events = await response.json();
```

## Database Schema

**users** - User accounts and roles
**events** - Event information
**applications** - Application submissions
**matches** - Calculated matches between users
**chat_messages** - Historical chat messages

## Development

```bash
pnpm dev          # Start with auto-reload
pnpm test         # Run tests
npm start         # Production build
```

## Deployment (FREE)

### On Railway.app

1. Push to GitHub
2. Connect repo to Railway
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy automatically on push

### On Render.com

1. Create new Web Service
2. Connect GitHub
3. Build command: `pnpm install`
4. Start command: `pnpm start`
5. Add PostgreSQL database
6. Deploy

## Environment Variables

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://psd-website.com
FRONTEND_URL=https://psd-website.com
```

## Security

- JWT authentication for protected endpoints
- CORS configured for psd-website only
- Password hashing with bcrypt
- Input validation on all endpoints

## License

MIT - Free to use and modify

## Support

For issues and questions:
- GitHub Issues: [Duck-Playground/issues](https://github.com/Duck-Dating-Apps/Duck-Playground/issues)
- Discord: [Duck Dating Community](https://discord.gg/duckdating)

---

**Last Updated**: June 2026
**Status**: Active Development 🚀
# duck-playground
