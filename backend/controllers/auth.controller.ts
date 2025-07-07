import type { Request, RequestHandler, Response } from "express"
import { pool } from "../config/db.config";
import { validateSchema } from "../utils/validateSchema";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/generateTokenAndSetCookie";
import redis from "../config/redis.config";
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail, sendVerificationEmail, sendWelcomeEmail } from "../emails/emails";
import crypto from 'crypto';
import { TUser } from "../middlewares/protectedRoute";

type RegisterBody = {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
};

interface CustomRequest extends Request {
    user: TUser,
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, confirmPassword }: RegisterBody = req.body;
    const { error } = validateSchema.validate(req.body);
    if(error)  {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    try {
        const emailExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if(emailExist.rows.length > 0) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }
        const usernameExist = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if(usernameExist.rows.length > 0) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }
        // generate a random 6-digit verification code
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const code = Math.floor(100000 + Math.random() * 900000);
        const user = await pool.query(
            "INSERT INTO users(username, email, password, verification_code, verification_code_expire_at) VALUES($1, $2, $3, $4, NOW() + INTERVAL '10 minutes') RETURNING *",
            [username, email, hashedPassword, code]
        );
        await sendVerificationEmail(user.rows[0].email, user.rows[0].username, user.rows[0].verification_code);
        res.status(201).json({ message: "User registered successfully", user: user.rows[0]});
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const verifyAccount = async (req: Request, res: Response): Promise<void> => {
    const { code }: { code: string } = req.body;
    try {
        const user = await pool.query(
            "SELECT * FROM users WHERE verification_code = $1 AND verification_code_expire_at > NOW()",
            [code]
        );
        if(user.rows.length === 0) {
            res.status(400).json({ error: "Invalid or expired verification code" });
            return;
        }
        const updatedUser= await pool.query(
            "UPDATE users SET account_verification = true, verification_code = NULL, verification_code_expire_at = NULL WHERE id = $1 RETURNING *",
            [user.rows[0].id]
        );
        await sendWelcomeEmail(updatedUser.rows[0].email, updatedUser.rows[0].username);
        res.status(200).json({ message: "Account verified successfully", user: updatedUser.rows[0] });
    } catch (error) {
        console.error("Error during account verification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
export const login = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password }: RegisterBody = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if(user.rows.length === 0) {
            res.status(400).json({ error: "Invalid username or email" });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if(!isMatch) {
            res.status(400).json({ error: "Invalid password" });
            return;
        }
        if(user.rows[0].account_verification === false) {
            res.status(400).json({ error: "Account not verified. Please check your email for the verification code." });
            return;
        }
        // generate a token here
        await generateTokenAndSetCookie(user.rows[0].id, res);
        res.status(200).json({ message: "Login successful", user: user.rows[0] });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
            if(typeof decoded === 'object' && "userId" in decoded) {
                await redis.del(`refreshToken-${decoded.userId}`);
            }
        };
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email }: { email: string } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if(user.rows.length === 0) {
            res.status(400).json({ error: "Email not found" });
            return;
        };
        const resetToken = crypto.randomBytes(16).toString('hex');
        await pool.query(
            "UPDATE users SET reset_token = $1, reset_token_expire_at = NOW() + INTERVAL '10 minutes' WHERE id = $2",
            [resetToken, user.rows[0].id]
        );
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        await sendResetPasswordEmail(user.rows[0].email, resetLink);
        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("Error during forgot password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const { newPassword, confirmPassword }: { newPassword: string; confirmPassword: string } = req.body;
    try {
        const user = await pool.query(
            "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expire_at > NOW()",
            [token]
        );
        if(user.rows.length === 0) {
            res.status(400).json({ error: "Invalid or expired reset token" });
            return;
        };
        if(!newPassword || !confirmPassword) {
            res.status(400).json({ error: 'New password and confirm password are required' });
            return;
        };
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/;
        if(!regex.test(newPassword)) {
            res.status(400).json({ error: 'New password must be 6-15 characters long, contain at least one letter and one number.' });
            return;
        };
        if(newPassword !== confirmPassword) {
            res.status(400).json({ error: "Passwords do not match" });
            return;
        };
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const updatedUser = await pool.query(
            "UPDATE users SET password = $1, reset_token = NULL, reset_token_expire_at = NULL WHERE id = $2 RETURNING *",
            [hashedPassword, user.rows[0].id]
        );
        res.status(200).json({ message: "Password reset successfully", user: updatedUser.rows[0] });
    } catch (error) {
        console.error("Error during reset password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            res.status(401).json({ error: "No refresh token provided" });
            return;    
        };
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
        if(!decoded) {
            res.status(403).json({ error: "Invalid refresh token" });
            return;
        };
        const storedRefreshTokenFromRedis = await redis.get(`refreshToken-${(decoded as { userId: string }).userId}`);
        if(!storedRefreshTokenFromRedis || storedRefreshTokenFromRedis !== refreshToken) {
            res.status(403).json({ error: "Refresh token does not match" });
            return;
        };
        const accessToken = jwt.sign({ userId: (decoded as { userId: string }).userId }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.status(200).json({ message: "Token refreshed successfully", accessToken });
    } catch (error) {
        console.error("Error during refresh token:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const checkAuth: RequestHandler = async (req, res): Promise<void> => {
    const customReq = req as CustomRequest;
    try {
        const user = await pool.query(
            "SELECT id, username, email, account_verification, created_at FROM users WHERE id = $1",
            [customReq.user?.id]
        );
        if(user.rows.length === 0) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ user: user.rows[0] });
    } catch (error) {
        console.error("Error during check auth:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
