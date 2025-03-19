import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

interface LoginProps {
  onJoin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');
  const { socket } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) return;

    socket.emit('room:join', { name, room }, (error) => {
      if (error) {
        setError(error.message);
      } else {
        onJoin();
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Join Chat Room
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Your Name"
              />
            </div>
            <div>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Room Name"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 