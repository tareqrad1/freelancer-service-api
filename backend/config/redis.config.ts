import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();


if (!process.env.REDIS_URI) {
    throw new Error("REDIS_URI is not defined in environment variables");
}

export const redis = new Redis(process.env.REDIS_URI);


export default redis;
