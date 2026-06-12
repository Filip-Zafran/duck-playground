# 🦆 Duck Playground - Project Tracker

**Status**: In Progress  
**Priority**: Get polls/scheduling system running  
**Last Updated**: 2026-06-12

---

## 🎯 Phase 1: Poll/Scheduling System (PRIORITY)

### Backend Implementation (Duck-Playground)
- [ ] **Poll Management Routes** (`src/routes/polls/index.js`)
  - [ ] GET /api/polls - List all polls
  - [ ] POST /api/polls - Create new poll
  - [ ] GET /api/polls/:id - Get poll details
  - [ ] PUT /api/polls/:id - Update poll
  - [ ] DELETE /api/polls/:id - Delete poll

- [ ] **Vote Management Routes** (`src/routes/vote/index.js`)
  - [ ] POST /api/vote/:pollId - Cast a vote
  - [ ] GET /api/vote/:pollId - Get votes for poll
  - [ ] GET /api/vote/:pollId/:userId - Get user's votes

- [ ] **Database Schema** (PostgreSQL)
  - [ ] Create `polls` table
  - [ ] Create `poll_options` table
  - [ ] Create `votes` table
  - [ ] Set up schema initialization in `src/config/database.js`

- [ ] **Database Queries**
  - [ ] Implement poll CRUD operations
  - [ ] Implement vote recording
  - [ ] Implement vote tallying/results

### Frontend Integration (psd-website)
- [ ] **Poll Component** (Svelte)
  - [ ] Create `src/components/PollWidget.svelte`
  - [ ] Display poll options
  - [ ] Handle vote submission
  - [ ] Show real-time results

- [ ] **Pages**
  - [ ] Update `src/pages/poll.astro` to use Duck-Playground API
  - [ ] Update `src/pages/poll-vote.astro` to use Duck-Playground API

- [ ] **API Integration**
  - [ ] Set DUCK_PLAYGROUND_API in `.env`
  - [ ] Fetch polls from Duck-Playground instead of local API

### Testing
- [ ] Test poll creation via API
- [ ] Test vote submission
- [ ] Test vote retrieval/results
- [ ] Test real-time updates (WebSocket)

---

## 📦 Phase 2: Admin Dashboard

### Backend
- [ ] **Admin Routes** - Database Implementation
  - [ ] GET /api/admin/applications - Query from DB
  - [ ] GET /api/admin/applications/:id - Get single application
  - [ ] POST /api/admin/applications/:id/approve - Update status
  - [ ] POST /api/admin/applications/:id/reject - Update with reason
  - [ ] GET /api/admin/stats - Calculate dashboard stats

- [ ] **Database Queries**
  - [ ] Implement applications table query
  - [ ] Implement approval/rejection logic
  - [ ] Implement stats calculation (counts, trends)

### Frontend
- [ ] Create Admin Dashboard component (Svelte)
- [ ] Display applications list
- [ ] Implement approve/reject buttons
- [ ] Show stats overview
- [ ] Add authentication/login

---

## 🎪 Phase 3: Event Management

### Backend
- [ ] **Event Routes** - Database Implementation
  - [ ] GET /api/events - Query all events
  - [ ] POST /api/events - Create event (admin)
  - [ ] GET /api/events/:id - Get event details
  - [ ] PUT /api/events/:id - Update event
  - [ ] DELETE /api/events/:id - Delete event
  - [ ] GET /api/events/:id/participants - List participants

- [ ] **Database Queries**
  - [ ] Query events from DB
  - [ ] Create/update/delete events
  - [ ] Track event participants

### Frontend
- [ ] Display events list on pages
- [ ] Show event details
- [ ] Allow registration for events

---

## 💑 Phase 4: Matching System

### Backend
- [ ] **Matching Routes** - Database Implementation
  - [ ] GET /api/matching/user/:userId - Get user matches
  - [ ] POST /api/matching/calculate/:eventId - Run matching algorithm
  - [ ] GET /api/matching/:matchId - Get match details
  - [ ] POST /api/matching/:matchId/status - Update match status

- [ ] **Matching Algorithm**
  - [ ] Query user interests from DB
  - [ ] Calculate compatibility scores
  - [ ] Generate matches based on interests
  - [ ] Store results in matches table

### Frontend
- [ ] Display match results to users
- [ ] Show match details/compatibility
- [ ] Allow accept/reject matches

---

## 🖼️ Phase 5: Image Generation

### Backend
- [ ] **Test Image Generation**
  - [ ] Test countdown image generation
  - [ ] Test poster generation
  - [ ] Verify Sharp library integration

### Frontend
- [ ] Embed countdown images in emails
- [ ] Display posters on event pages

---

## 💬 Phase 6: WebChat

### Backend
- [ ] **Chat Persistence**
  - [ ] Save messages to DB
  - [ ] Implement message history retrieval
  - [ ] Clean up old messages

### Frontend
- [ ] Create chat interface component
- [ ] Implement WebSocket connection
- [ ] Display message history
- [ ] Real-time message updates

---

## 🔐 Phase 7: Authentication & Security

### Backend
- [ ] **Authentication**
  - [ ] Implement JWT token generation
  - [ ] Add login endpoint
  - [ ] Add password hashing (bcrypt)
  - [ ] Implement admin role checking

- [ ] **Security**
  - [ ] Add input validation to all routes
  - [ ] Add rate limiting
  - [ ] Add request logging

### Frontend
- [ ] Create login page
- [ ] Store JWT token in localStorage
- [ ] Add token to API requests
- [ ] Handle authentication errors

---

## 🧪 Phase 8: Testing & Deployment

- [ ] Integration testing (all features working together)
- [ ] Load testing (performance check)
- [ ] Security audit
- [ ] Database backup strategy
- [ ] Monitoring/alerting setup
- [ ] Documentation updates

---

## 📝 Notes

### Key Files to Update
- Duck-Playground: `src/routes/polls/index.js` (create new)
- Duck-Playground: `src/routes/vote/index.js` (create new)
- psd-website: `src/components/PollWidget.svelte` (create new)
- psd-website: `src/pages/poll.astro` (update)
- psd-website: `.env` (add DUCK_PLAYGROUND_API)

### Environment Variables Needed
```
DUCK_PLAYGROUND_API=https://duck-playground.onrender.com
DATABASE_URL=postgresql://user:pass@host:5432/duck_playground
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

### Database Tables Required
```
- users (id, email, name, role, created_at)
- events (id, name, date, location, status, max_participants)
- applications (id, user_id, event_id, status, data)
- matches (id, user1_id, user2_id, event_id, match_score, shared_interests)
- polls (id, title, description, event_id, created_by, created_at, deadline)
- poll_options (id, poll_id, option_text, order)
- votes (id, poll_id, user_id, option_id, created_at)
- chat_messages (id, room_id, user_id, message, created_at)
```

---

## 🚀 Success Criteria

- [ ] Polls can be created, viewed, and voted on
- [ ] Admin can approve/reject applications
- [ ] Events are managed dynamically
- [ ] Users receive personalized matches
- [ ] Chat works in real-time
- [ ] All APIs integrated with psd-website
- [ ] No hardcoded data (all from DB)
- [ ] Full end-to-end testing complete

