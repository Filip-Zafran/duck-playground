import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import adminRoutes from './routes/admin/index.js';
import eventRoutes from './routes/events/index.js';
import matchingRoutes from './routes/matching/index.js';
import imageRoutes from './routes/images/index.js';
import pollRoutes from './routes/polls/index.js';
import voteRoutes from './routes/vote/index.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';

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

// Serve static files (Astro build output)
app.use(express.static('dist'));
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🦆 Duck Playground</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        h1 {
          font-size: 2.5em;
          color: #333;
          margin-bottom: 10px;
        }
        .service-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .info-badge {
          background: #f0f0f0;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 0.9em;
          color: #666;
        }
        .status-badge {
          background: #10b981;
          color: white;
          font-weight: bold;
        }
        .endpoints {
          margin-top: 40px;
        }
        .endpoints h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.3em;
        }
        .endpoint-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .endpoint-card {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .endpoint-card:hover {
          border-color: #667eea;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }
        .endpoint-name {
          font-family: 'Monaco', 'Courier New', monospace;
          color: #667eea;
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 0.95em;
        }
        .endpoint-desc {
          color: #666;
          font-size: 0.85em;
          line-height: 1.4;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #999;
          font-size: 0.85em;
        }
        .links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
          flex-wrap: wrap;
        }
        .links a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        .links a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🦆 Duck Playground</h1>
          <p style="color: #666; margin-top: 10px;">Backend service for Duck Dating Apps</p>
        </div>

        <div class="service-info">
          <div class="info-badge">v1.0.0</div>
          <div class="info-badge status-badge">✓ Running</div>
          <div class="info-badge">Node.js + Express</div>
        </div>

        <div class="endpoints">
          <h2>📡 Available Endpoints</h2>
          <div class="endpoint-grid">
            <div class="endpoint-card">
              <div class="endpoint-name">GET /api/admin</div>
              <div class="endpoint-desc">Manage applications, approvals, and dashboard statistics</div>
            </div>
            <div class="endpoint-card">
              <div class="endpoint-name">GET /api/events</div>
              <div class="endpoint-desc">List, create, and manage dating events</div>
            </div>
            <div class="endpoint-card">
              <div class="endpoint-name">GET /api/matching</div>
              <div class="endpoint-desc">User matching algorithm and match details</div>
            </div>
            <div class="endpoint-card">
              <div class="endpoint-name">GET /api/images</div>
              <div class="endpoint-desc">Dynamic countdown and poster image generation</div>
            </div>
            <div class="endpoint-card">
              <div class="endpoint-name">GET /api/polls</div>
              <div class="endpoint-desc">Doodle-style polls for event scheduling</div>
            </div>
            <div class="endpoint-card">
              <div class="endpoint-name">POST /api/vote/:pollId</div>
              <div class="endpoint-desc">Submit votes and view poll results</div>
            </div>
            <div class="endpoint-card">
              <div class="endpoint-name">WS /socket.io</div>
              <div class="endpoint-desc">Real-time WebSocket chat for users</div>
            </div>
            <div class="endpoint-card">
              <div class="endpoint-name">GET /health</div>
              <div class="endpoint-desc">Service health check endpoint</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>🚀 Powering Duck Dating Apps</p>
          <div class="links">
            <a href="https://github.com/Filip-Zafran/duck-playground" target="_blank">GitHub</a>
            <a href="/health" target="_blank">Health Check</a>
            <a href="https://github.com/Filip-Zafran/duck-playground#readme" target="_blank">Documentation</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Routes
app.use('/api/admin', adminRoutes);
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
