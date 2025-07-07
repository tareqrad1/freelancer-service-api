import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.config";
dotenv.config();
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
import cookieParser from 'cookie-parser';

// routes imports
import userRoutes from './routes/auth.route';

// middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//routes
app.use('/api/auth', userRoutes);


//connection
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    pool.connect()
        .then(client => {
            console.log("Connected successfully to the database");
            client.release();
        })
        .catch(err => {
            console.error("Database connection error:", err);
        });
});