import { Request, Response } from 'express';
import { pool } from '../config/db.config';
import { CustomRequest } from '../middlewares/protectedRoute';

export const getAllUsers = async (req: CustomRequest, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = parseInt(req.query.offset as string) || 1;
    const page = (skip - 1) * limit;
    try {
        const users = await pool.query('SELECT * FROM users WHERE id <> $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user?.id, limit, page]);
        if(users.rows.length === 0) {
            res.status(404).json({ error: 'No users found' });
            return;
        };
        res.status(200).json({ users: users.rows, totalUsers: users.rowCount });
    } catch (error: any) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getOneUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if(user.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        };
        res.status(200).json({ user: user.rows[0] });
    } catch (error: any) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const addRoleForUsers = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: string };
    if(role !== 'admin' && role !== 'freelancer' && role !== 'client') {
        res.status(400).json({ error: 'Invalid role' });
        return;
    }
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if(user.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        };
        await pool.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING *", 
            [role, user.rows[0].id]
        );
        res.status(200).json({ message: `Role-${role} added successfully` });
    } catch (error: any) {
        console.error('Error adding role for user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if(user.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        };
        await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [user.rows[0].id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}