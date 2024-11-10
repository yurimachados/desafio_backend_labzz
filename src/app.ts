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

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:8080',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

const app = express();

app.use(redisMiddleware);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(sessionSecurityMiddleware);
app.use('/api/users', userRoutes);
app.use('/api/messages', messagesRoutes);

export default app;
