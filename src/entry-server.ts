import dotenv from 'dotenv';

dotenv.config();

import { Server as SocketServer } from 'socket.io';

let astroApp: any;

// WebSocket setup
async function setupWebSocket(server: any) {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', (data) => {
      socket.join(data.roomId);
      io.to(data.roomId).emit('user_joined', {
        userId: data.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('send_message', (data) => {
      io.to(data.roomId).emit('new_message', {
        userId: data.userId,
        message: data.message,
        timestamp: new Date().toISOString()
      });
    });

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

  return io;
}

export async function start(app: any) {
  astroApp = app;

  // Initialize database
  const { initializeDatabase } = await import('./config/database.js');
  await initializeDatabase();

  return { setupWebSocket };
}

export { setupWebSocket };
