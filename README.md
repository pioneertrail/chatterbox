# Fancy Chat Room

A real-time chat application that allows users on the same local network to communicate through a modern, responsive interface.

## Features

- Real-time messaging using WebSocket technology
- Modern, responsive UI using Material-UI
- Room-based chat system
- User presence indicators
- Message timestamps
- Support for multiple users on the local network

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - Material-UI (MUI)
  - Socket.IO Client
  - Emotion (for styled components)

- **Backend:**
  - Node.js with TypeScript
  - Express.js
  - Socket.IO
  - CORS for local network access

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd fancy-chat-room
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Development

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd client
   npm start
   ```

3. Access the application:
   - Open your browser and navigate to `http://localhost:3000`
   - Share the local network URL with others on your network

## Documentation

For detailed documentation and references, please check the [docs](./docs) directory:
- [Technical References](./docs/REFERENCES.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 