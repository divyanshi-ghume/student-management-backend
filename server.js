import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import studentRoutes from './routes/students.js';
import bookRoutes from './routes/bookRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// CORS – allow the configured frontend origins (falls back to '*')
const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// --------------- Routes ---------------
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Student Management API' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/students', studentRoutes);
app.use('/api/books', bookRoutes);

// --------------- MongoDB Connection ---------------
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
      return;
    } catch (error) {
      console.error(
        `❌ MongoDB connection attempt ${i + 1}/${retries} failed:`,
        error.message
      );
      if (i < retries - 1) {
        const delay = Math.min(1000 * 2 ** i, 10000); // exponential backoff, max 10s
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error('❌ Could not connect to MongoDB after all retries. Exiting.');
  process.exit(1);
};

// --------------- Start Server ---------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export default app;
