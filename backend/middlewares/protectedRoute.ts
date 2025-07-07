import jwt from 'jsonwebtoken';
import { pool } from '../config/db.config';
import { NextFunction, Request, Response } from 'express';


export type TUser = {
    id: string;
    username: string;
    email: string;
    account_verification: boolean;
    created_at: Date;
}

export interface CustomRequest extends Request {
    user?: TUser;
};

export const protectedRoute = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    if(!accessToken) {
        res.status(401).json({ message: 'Unauthorized: No Access token provided' });
        return;
    };
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as { userId: string };
        if(!decoded) {
            res.status(403).json({ message: 'Forbidden: Invalid Access token' });
            return;
        };
        const user = await pool.query(
            "SELECT id, username, email, account_verification, created_at FROM users WHERE id = $1",
            [decoded.userId]
        )
        if(user.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        };
        req.user = user.rows[0];
        next();
    } catch (error) {
        console.error('Error in protectedRoute middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};