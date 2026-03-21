import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import pumpEntryRoutes from './routes/pumpEntries.js';
import paymentRoutes from './routes/payments.js';
import shiftEntryRoutes from './routes/shiftEntries.js';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/authMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/pump-entries', authMiddleware, pumpEntryRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/shift-entries', authMiddleware, shiftEntryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server with a simple fallback in development to avoid crash loops on busy ports.
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (process.env.NODE_ENV === 'development') {
        const nextPort = Number(port) + 1;
        console.warn(`Port ${port} is in use. Retrying on ${nextPort}...`);
        startServer(nextPort);
        return;
      }

      console.error(`Port ${port} is already in use.`);
      process.exit(1);
    }

    console.error('Server startup error:', error);
    process.exit(1);
  });
};

startServer(PORT);
