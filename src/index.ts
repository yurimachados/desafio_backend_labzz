import express from 'express';
import userRoutes from './routes/userRoutes';

import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
