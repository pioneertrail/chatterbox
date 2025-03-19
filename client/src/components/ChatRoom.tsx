import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Message, User } from '../types/chat';

export const ChatRoom: React.FC = () => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messageListRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!socket) return;

    socket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on('user:joined', (user) => {
      setUsers((prev) => [...prev, user]);
    });

    socket.on('user:left', (userId) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on('room:users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('user:typing', ({ id, name, isTyping }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) {
          next.add(name);
        } else {
          next.delete(name);
        }
        return next;
      });
    });

    return () => {
      socket.off('message:new');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('room:users');
      socket.off('user:typing');
    };
  }, [socket]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim()) return;

    socket.emit('message:send', { content: newMessage }, () => {
      setNewMessage('');
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing:start');

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop');
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* User list sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Users Online</h2>
        </div>
        <div className="p-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Message list */}
        <div
          ref={messageListRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'system' ? 'justify-center' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'system'
                    ? 'bg-gray-200 text-gray-600 text-sm'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {message.type !== 'system' && (
                  <div className="font-bold text-sm mb-1">{message.userName}</div>
                )}
                <div>{message.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">
            {Array.from(typingUsers).join(', ')} typing...
          </div>
        )}

        {/* Message input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 