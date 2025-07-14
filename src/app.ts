import dotenv from 'dotenv';
import path from 'path';

const envPath =
  process.env.NODE_ENV === 'development'
    ? path.resolve(process.cwd(), '.env.development')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import messagesRoutes from './routes/messageRoutes';
import redisMiddleware from './middleware/redisMiddleware';
import sessionSecurityMiddleware from './middleware/sessionSecurityMiddleware';
import { generalRateLimit } from './middleware/rateLimitMiddleware';

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:8080',
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

const app = express();

app.use(redisMiddleware);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all routes
app.use(generalRateLimit);

app.use('/api/auth', authRoutes);

app.use(sessionSecurityMiddleware);
app.use('/api/users', userRoutes);
app.use('/api/messages', messagesRoutes);

export default app;
