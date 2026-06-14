import dotenv from 'dotenv';

// Load environment variables FIRST (before any other imports)
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
}));

// Site-wide authentication middleware (before static files)
app.use(siteAuth);

// Routes (MUST come before static files and catch-all handler)
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/vote', voteRoutes);

// Poll vote page - serve with token injection
app.get('/poll-vote/', (req, res, next) => {
  const filePath = path.join(process.cwd(), 'dist', 'poll-vote', 'index.html');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return next(); // Fall through to static middleware if file not found
    }

    // Inject token extraction script before </body>
    const injection = `<script>
const params = new URLSearchParams(window.location.search);
const token = params.get('token') || '';
if (token) {
  window.__POLL_TOKEN__ = token;
}
</script>`;

    const modified = data.replace('</body>', injection + '</body>');
    res.set('Content-Type', 'text/html');
    res.send(modified);
  });
});

// Serve static files by default (production), only proxy in development
const isDev = process.env.NODE_ENV === 'development';
if (!isDev) {
  app.use(express.static('public'));
  app.use(express.static('dist'));
}

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

// Development: Proxy all non-API requests to Astro dev server (4321)
if (isDev) {
  app.use((req, res) => {
    const options = {
      hostname: 'localhost',
      port: 4321,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        'X-Forwarded-For': req.ip,
        'X-Forwarded-Proto': req.protocol,
        'X-Forwarded-Host': req.hostname
      }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy to Astro failed:', err.message);
      res.status(503).send('Astro dev server (4321) not responding');
    });

    if (['GET', 'HEAD'].includes(req.method)) {
      proxyReq.end();
    } else {
      req.pipe(proxyReq);
    }
  });
}

// SPA fallback: serve index.html for unmatched routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/index.html'));
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
