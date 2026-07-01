import express from 'express';
import subjectRoutes from './routes/subjectRoutes'; 
import studySessionRoutes from './routes/studySessionRoutes';
import authRoutes from './routes/authRoutes';
import { connectDB } from './db';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

connectDB();
app.get('/', (req, res) => {
    res.status(200).send("🚀 StudyTracker API is officially live and kicking in the cloud!");
});
app.use('/subjects', subjectRoutes);
app.use('/studysessions', studySessionRoutes);
app.use('/register', authRoutes);



app.listen(PORT, () => {
    console.log(`Server runnning on path http://localhost:${PORT}`);
});