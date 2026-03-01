import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectDB } from './config/database';
import { config } from './config/config';

const server = http.createServer(app);

// Socket.io for real-time experiment data
export const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌  Client connected: ${socket.id}`);

  socket.on('join-experiment', (experimentId: string) => {
    socket.join(`experiment-${experimentId}`);
    console.log(`🧪  Socket ${socket.id} joined experiment room: ${experimentId}`);
  });

  socket.on('experiment-data', (data: object) => {
    socket.broadcast.emit('receive-experiment-data', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌  Client disconnected: ${socket.id}`);
  });
});

const startServer = async (): Promise<void> => {
  await connectDB();

  server.listen(config.port, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  🔬  Smart AR Physics Lab — Backend Server');
    console.log(`  🌐  Running on   : http://localhost:${config.port}`);
    console.log(`  ⚙️   Environment  : ${config.nodeEnv}`);
    console.log(`  📡  API Base     : http://localhost:${config.port}/api/v1`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
  });
};

startServer().catch((err) => {
  console.error('❌  Server startup failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('❌  Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});
