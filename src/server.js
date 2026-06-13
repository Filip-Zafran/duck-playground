import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import adminRoutes from './routes/admin/index.js';
import authRoutes from './routes/auth/index.js';
import eventRoutes from './routes/events/index.js';
import matchingRoutes from './routes/matching/index.js';
import imageRoutes from './routes/images/index.js';
import pollRoutes from './routes/polls/index.js';
import voteRoutes from './routes/vote/index.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { siteAuth } from './middleware/siteAuth.js';

// Import database initialization
import { initializeDatabase } from './config/database.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
}));

// Site-wide authentication middleware (before static files)
app.use(siteAuth);

// Serve static files (Astro build output)
app.use(express.static('public'));
app.use(express.static('dist'));

// Root route - serve Poly Speed Dating frontend
app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: '.' });
});

// Login route - no auth required
app.get('/login', (req, res) => {
  res.sendFile('public/login.html', { root: '.' });
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/vote', voteRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket Chat (protected by auth)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // Verify token here
  next();
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room
  socket.on('join_room', (data) => {
    socket.join(data.roomId);
    io.to(data.roomId).emit('user_joined', {
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Send message
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('new_message', {
      userId: data.userId,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Leave room
  socket.on('leave_room', (data) => {
    socket.leave(data.roomId);
    io.to(data.roomId).emit('user_left', {
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// SPA catch-all - serve index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile('public/index.html', { root: '.' });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, async () => {
  console.log(`Duck Playground server running at http://${HOST}:${PORT}`);
  console.log(`WebSocket chat available at ws://${HOST}:${PORT}`);
  await initializeDatabase();
});

export { app, io };
