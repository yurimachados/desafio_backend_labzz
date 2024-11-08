import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import { csrfProtection, setCsrfToken } from './middleware/csrfMiddleware';
import userRoutes from './routes/userRoutes';

const envPath =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../.env.development')
    : path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Rotas públicas que não precisam de CSRF

// Aplicação de proteção CSRF
app.use(csrfProtection);
app.use(setCsrfToken);

// Rotas protegidas por CSRF
app.use('/api', userRoutes);

export default app;
