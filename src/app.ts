import dotenv from 'dotenv';
import path from 'path';

const envPath =
  process.env.NODE_ENV === 'development'
    ? path.resolve(process.cwd(), '.env.development')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import redisMiddleware from './middleware/redisMiddleware';
import csrfMiddleware from './middleware/csrfMiddleware';

if (process.env.NODE_ENV === 'development') {
  console.log('path', envPath);
  console.log('db', process.env.DATABASE_URL);
}

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(redisMiddleware);

app.use('/api/auth', authRoutes);

app.use(csrfMiddleware);

app.use('/api', userRoutes);

export default app;
