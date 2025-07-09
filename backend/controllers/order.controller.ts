import { Request, Response } from "express";
import { pool } from "../config/db.config";
import { CustomRequest } from "../middlewares/protectedRoute";

export const getMyOrders = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const orders = await pool.query(`
            SELECT 
                orders.id,
                orders.amount,
                orders.status,
                orders.created_at,
                services.title as service_title,
                services.description as service_description,
                services.price as service_price,
                services.images as service_images
            FROM orders
            JOIN services ON orders.service_id = services.id
            WHERE orders.client_id = $1
            ORDER BY orders.created_at DESC;
        `, [req.user?.id]);
        if(orders.rows.length === 0) {
            res.status(404).json({ error: 'No orders found' });
            return;
        };
        res.status(200).json({ orders: orders.rows });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getFreelancerOrders = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const orders = await pool.query(`
            SELECT 
                orders.id,
                orders.amount,
                orders.status,
                orders.created_at,
                services.title as service_title,
                services.description as service_description,
                services.price as service_price,
                services.images as service_images
            FROM orders
            JOIN services ON orders.service_id = services.id
            WHERE orders.freelancer_id = $1
            ORDER BY orders.created_at DESC;
        `, [req.user?.id]);
        if(orders.rows.length === 0) {
            res.status(404).json({ error: 'No orders found' });
            return;
        };
        res.status(200).json({ orders: orders.rows });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};