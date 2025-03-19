"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const config_1 = require("../config");
const uuid_1 = require("uuid");
class ChatService {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(roomName) {
        const room = {
            id: (0, uuid_1.v4)(),
            name: roomName,
            users: [],
            messages: [],
            createdAt: Date.now()
        };
        this.rooms.set(room.id, room);
        return room;
    }
    addUser(name, roomName) {
        let room = Array.from(this.rooms.values()).find(r => r.name === roomName);
        if (!room) {
            room = this.createRoom(roomName);
        }
        const user = {
            id: (0, uuid_1.v4)(),
            name,
            room: room.id,
            isTyping: false
        };
        room.users.push(user);
        this.rooms.set(room.id, room);
        return user;
    }
    removeUser(userId) {
        let removedUser;
        this.rooms.forEach((room, roomId) => {
            const userIndex = room.users.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
                removedUser = room.users[userIndex];
                room.users.splice(userIndex, 1);
                // If room is empty, remove it
                if (room.users.length === 0) {
                    this.rooms.delete(roomId);
                }
                else {
                    this.rooms.set(roomId, room);
                }
            }
        });
        return removedUser;
    }
    addMessage(userId, content, type = 'text') {
        const user = this.getUser(userId);
        if (!user)
            return undefined;
        const room = this.rooms.get(user.room);
        if (!room)
            return undefined;
        const message = {
            id: (0, uuid_1.v4)(),
            userId,
            userName: user.name,
            room: user.room,
            content,
            timestamp: Date.now(),
            type
        };
        room.messages.push(message);
        // Limit message history
        if (room.messages.length > config_1.config.messageHistory.maxMessages) {
            room.messages = room.messages.slice(-config_1.config.messageHistory.maxMessages);
        }
        this.rooms.set(room.id, room);
        return message;
    }
    getUser(userId) {
        for (const room of this.rooms.values()) {
            const user = room.users.find(u => u.id === userId);
            if (user)
                return user;
        }
        return undefined;
    }
    getRoomUsers(roomId) {
        return this.rooms.get(roomId)?.users || [];
    }
    getRoomMessages(roomId) {
        return this.rooms.get(roomId)?.messages || [];
    }
    setUserTyping(userId, isTyping) {
        const user = this.getUser(userId);
        if (!user)
            return undefined;
        const room = this.rooms.get(user.room);
        if (!room)
            return undefined;
        user.isTyping = isTyping;
        room.users = room.users.map(u => u.id === userId ? user : u);
        this.rooms.set(room.id, room);
        return user;
    }
}
exports.ChatService = ChatService;
