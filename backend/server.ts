import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.config";
dotenv.config();
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
import cookieParser from 'cookie-parser';

// routes imports
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import serviceRoues from './routes/service.route';
import paymentRoutes from './routes/payment.route';
import orderRoutes from './routes/order.route';

// middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoues);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

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