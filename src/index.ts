import express from 'express';
import subjectRoutes from './routes/subjectRoutes'; 
import studySessionRoutes from './routes/studySessionRoutes';
import authRoutes from './routes/authRoutes';
import { connectDB } from './db';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.static(path.join(__dirname, '../public')));

app.use('/subjects', subjectRoutes);
app.use('/studysessions', studySessionRoutes);
app.use('/register', authRoutes);

app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on path http://localhost:${PORT}`);
});