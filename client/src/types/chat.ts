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

export interface ChatContextType {
  messages: Message[];
  users: User[];
  currentUser: User | null;
  isConnected: boolean;
  isTyping: { [key: string]: boolean };
  joinRoom: (name: string, room: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
}

export interface ServerToClientEvents {
  'user:joined': (user: User) => void;
  'user:left': (userId: string) => void;
  'user:typing': (user: Pick<User, 'id' | 'name' | 'isTyping'>) => void;
  'message:new': (message: Message) => void;
  'room:users': (users: User[]) => void;
}

export interface ClientToServerEvents {
  'room:join': (data: { name: string; room: string }, callback: (error?: { message: string }) => void) => void;
  'message:send': (message: Pick<Message, 'content'>, callback: (message: Message) => void) => void;
  'typing:start': () => void;
  'typing:stop': () => void;
} 