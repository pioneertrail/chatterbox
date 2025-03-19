export interface User {
  id: string;
  name: string;
  room: string;
  isTyping: boolean;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  room: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system';
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
  createdAt: number;
}

export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'user:joined': (user: User) => void;
  'user:left': (userId: string) => void;
  'user:typing': (user: Pick<User, 'id' | 'name' | 'isTyping'>) => void;
  'room:users': (users: User[]) => void;
  'error': (error: { message: string }) => void;
}

export interface ClientToServerEvents {
  'message:send': (message: Omit<Message, 'id' | 'timestamp'>, callback: (message: Message) => void) => void;
  'room:join': (data: { name: string; room: string }, callback: (error?: { message: string }) => void) => void;
  'room:leave': (callback: (error?: { message: string }) => void) => void;
  'typing:start': () => void;
  'typing:stop': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user?: User;
} 