import { User, Message, Room } from '../types/chat';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export class ChatService {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomName: string): Room {
    const room: Room = {
      id: uuidv4(),
      name: roomName,
      users: [],
      messages: [],
      createdAt: Date.now()
    };
    this.rooms.set(room.id, room);
    return room;
  }

  addUser(name: string, roomName: string): User {
    let room = Array.from(this.rooms.values()).find(r => r.name === roomName);
    
    if (!room) {
      room = this.createRoom(roomName);
    }

    const user: User = {
      id: uuidv4(),
      name,
      room: room.id,
      isTyping: false
    };

    room.users.push(user);
    this.rooms.set(room.id, room);

    return user;
  }

  removeUser(userId: string): User | undefined {
    let removedUser: User | undefined;

    this.rooms.forEach((room, roomId) => {
      const userIndex = room.users.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        removedUser = room.users[userIndex];
        room.users.splice(userIndex, 1);

        // If room is empty, remove it
        if (room.users.length === 0) {
          this.rooms.delete(roomId);
        } else {
          this.rooms.set(roomId, room);
        }
      }
    });

    return removedUser;
  }

  addMessage(userId: string, content: string, type: 'text' | 'system' = 'text'): Message | undefined {
    const user = this.getUser(userId);
    if (!user) return undefined;

    const room = this.rooms.get(user.room);
    if (!room) return undefined;

    const message: Message = {
      id: uuidv4(),
      userId,
      userName: user.name,
      room: user.room,
      content,
      timestamp: Date.now(),
      type
    };

    room.messages.push(message);
    
    // Limit message history
    if (room.messages.length > config.messageHistory.maxMessages) {
      room.messages = room.messages.slice(-config.messageHistory.maxMessages);
    }

    this.rooms.set(room.id, room);
    return message;
  }

  getUser(userId: string): User | undefined {
    for (const room of this.rooms.values()) {
      const user = room.users.find(u => u.id === userId);
      if (user) return user;
    }
    return undefined;
  }

  getRoomUsers(roomId: string): User[] {
    return this.rooms.get(roomId)?.users || [];
  }

  getRoomMessages(roomId: string): Message[] {
    return this.rooms.get(roomId)?.messages || [];
  }

  setUserTyping(userId: string, isTyping: boolean): User | undefined {
    const user = this.getUser(userId);
    if (!user) return undefined;

    const room = this.rooms.get(user.room);
    if (!room) return undefined;

    user.isTyping = isTyping;
    room.users = room.users.map(u => u.id === userId ? user : u);
    this.rooms.set(room.id, room);

    return user;
  }
} 