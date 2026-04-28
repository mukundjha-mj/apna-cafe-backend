import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [
        ...(process.env.FRONTEND_URL?.split(',') || []),
        ...(process.env.ADMIN_URL?.split(',') || [])
      ],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Cafe joining its own room to receive new orders
    socket.on('join-cafe-room', (cafeId: string) => {
      socket.join(`cafe-${cafeId}`);
      console.log(`Socket ${socket.id} joined room: cafe-${cafeId}`);
    });

    // User joining their order room to get status updates
    socket.on('join-order-room', (orderId: string) => {
      socket.join(`order-${orderId}`);
      console.log(`Socket ${socket.id} joined room: order-${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
