import * as dotenv from 'dotenv';
import express from 'express';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(express.json());

async function main() {
    await prisma.$connect();
    console.log('Database connected');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});