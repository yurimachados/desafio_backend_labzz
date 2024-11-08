import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';

// Carregar variáveis de ambiente com base no NODE_ENV
const envPath =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../.env.development')
    : path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(helmet());
app.use(express.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;

console.log(`Node Environment: ${process.env.NODE_ENV}`);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
