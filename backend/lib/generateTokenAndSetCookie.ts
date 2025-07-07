import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redis from '../config/redis.config';
dotenv.config();

export const generateTokenAndSetCookie = async (userId: string, res: Response) => {
    try {
        if(process.env.ACCESS_TOKEN_SECRET === undefined || process.env.REFRESH_TOKEN_SECRET === undefined) {
        throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }
        const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        await redis.set(`refreshToken-${userId}`, refreshToken, 'EX', 7* 24 * 60 * 60);
        return accessToken;
    } catch (error) {
        console.log('Error generating token:', error);
    }
};