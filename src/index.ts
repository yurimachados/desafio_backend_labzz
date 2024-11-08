import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente com base no NODE_ENV
const envPath =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../.env.development')
    : path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

console.log(`Carregando variáveis de ambiente de: ${envPath}`);

import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;

console.log(`Node Environment: ${process.env.NODE_ENV}`);
console.log(`Database URL: ${process.env.DATABASE_URL}`);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
