import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { initSocket } from './lib/socket';
import { errorHandler } from './middlewares/errorHandler';

// Routes
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import cafeRoutes from './routes/cafe.routes';
import profileRoutes from './routes/profile.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cafe', cafeRoutes);
app.use('/api/profiles', profileRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
