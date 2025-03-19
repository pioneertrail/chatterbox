import { useState } from 'react'
import { SocketProvider } from './contexts/SocketContext'
import { Login } from './components/Login'
import { ChatRoom } from './components/ChatRoom'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <SocketProvider>
      {!isLoggedIn ? (
        <Login onJoin={() => setIsLoggedIn(true)} />
      ) : (
        <ChatRoom />
      )}
    </SocketProvider>
  )
}

export default App
