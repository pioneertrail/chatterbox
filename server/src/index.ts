import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from './types/chat';
import { ChatService } from './services/ChatService';
import { config } from './config';

const app = express();
const httpServer = createServer(app);

// More explicit CORS configuration
const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
};

// Express CORS middleware
app.use(cors(corsConfig));
app.use(express.json());

// Socket.IO server with CORS
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: corsConfig
});

const chatService = new ChatService();

// Root route
app.get('/', (_, res) => {
  res.json({
    status: 'ok',
    message: 'Fancy Chat Room Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      websocket: 'ws://localhost:3001'
    }
  });
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('room:join', ({ name, room }, callback) => {
    try {
      const user = chatService.addUser(name, room);
      socket.data.user = user;
      
      socket.join(user.room);
      
      // Notify room about new user
      socket.to(user.room).emit('user:joined', user);
      
      // Send welcome message
      const message = chatService.addMessage(
        user.id,
        `${user.name} has joined the chat`,
        'system'
      );
      if (message) {
        io.to(user.room).emit('message:new', message);
      }

      // Send current room users to the new user
      io.to(user.room).emit('room:users', chatService.getRoomUsers(user.room));
      
      callback();
    } catch (error) {
      callback({ message: 'Could not join room' });
    }
  });

  socket.on('message:send', (messageData, callback) => {
    const user = socket.data.user;
    if (!user) {
      callback({ id: '', userId: '', userName: '', room: '', content: '', timestamp: 0, type: 'text' });
      return;
    }

    const message = chatService.addMessage(user.id, messageData.content);
    if (message) {
      io.to(user.room).emit('message:new', message);
      callback(message);
    }
  });

  socket.on('typing:start', () => {
    const user = socket.data.user;
    if (!user) return;

    const updatedUser = chatService.setUserTyping(user.id, true);
    if (updatedUser) {
      socket.to(user.room).emit('user:typing', {
        id: updatedUser.id,
        name: updatedUser.name,
        isTyping: true
      });
    }
  });

  socket.on('typing:stop', () => {
    const user = socket.data.user;
    if (!user) return;

    const updatedUser = chatService.setUserTyping(user.id, false);
    if (updatedUser) {
      socket.to(user.room).emit('user:typing', {
        id: updatedUser.id,
        name: updatedUser.name,
        isTyping: false
      });
    }
  });

  socket.on('disconnect', () => {
    const user = socket.data.user;
    if (!user) return;

    const removedUser = chatService.removeUser(user.id);
    if (removedUser) {
      // Notify room that user has left
      io.to(removedUser.room).emit('user:left', removedUser.id);
      
      // Send leave message
      const message = chatService.addMessage(
        removedUser.id,
        `${removedUser.name} has left the chat`,
        'system'
      );
      if (message) {
        io.to(removedUser.room).emit('message:new', message);
      }

      // Update room users list
      io.to(removedUser.room).emit(
        'room:users',
        chatService.getRoomUsers(removedUser.room)
      );
    }
  });
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 