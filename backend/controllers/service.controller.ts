import type { Request, Response } from 'express';
import { pool } from '../config/db.config';
import cloudinary from '../config/cloudinary.config';
import { CustomRequest } from '../middlewares/protectedRoute';

interface BodyTypes {
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
};


export const createService = async (req: CustomRequest, res: Response): Promise<void> => {
    const { title, description, price, category, images }: BodyTypes  = req.body;
    if (!title || !description || !price || !category || !images) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    };
    let arrImages = [];
    try {
        if(images && images.length > 0)  {
            for (let i = 0; i < images.length; i++) {
                const uploadResponse = await cloudinary.uploader.upload(images[i], {
                    folder: 'services',
                });
                arrImages.push(uploadResponse.secure_url);
            };
        }
        const newService = await pool.query(
            "INSERT INTO services (user_id, title, description, price, category, images) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
            [req.user?.id, title, description, price, category, arrImages]
        );
        res.status(201).json({ service: newService.rows[0] });
    } catch (error: any) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getAllServices = async (req: Request, res: Response): Promise<void> => {
    const { category } = req.query as { category: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    try {
        let services;
        if(category) {
            services = await pool.query("SELECT * FROM services WHERE category = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;", [category, limit, skip]);
        }else {
            services = await pool.query("SELECT * FROM services ORDER BY created_at DESC LIMIT $1 OFFSET $2;", [limit, skip]);
        }
        if(services.rows.length === 0) {
            res.status(404).json({ error: 'No services found' });
            return;
        };
        res.status(200).json({ services: services.rows, totalServices: services.rowCount });
    } catch (error: any) {
        console.error('Error fetching service:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getOneServiceById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    try {
        const service = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
        if(service.rows.length === 0) {
            res.status(404).json({ error: 'Service not found' });
            return;
        };
        res.status(200).json({ service: service.rows[0] });
    } catch (error: any) {
        console.error('Error fetching service by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const deleteService = async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    if(!id) {
        res.status(400).json({ error: 'Service ID is required' });
        return;
    }
    try {
        const service = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
        if(service.rows.length === 0) {
            res.status(404).json({ error: 'Service not found' });
            return;
        };
        // Delete images from Cloudinary -- if they exist
        if(service.rows[0].images && Array.isArray(service.rows[0].images) && service.rows[0].images.length > 0) {
            for (let i = 0; i < service.rows[0].images.length; i++) {
                const publicId = service.rows[0].images[i].split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`services/${publicId}`);
            };
        };
        // Delete service from database
        if(service.rows[0].user_id !== req.user?.id && req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Access denied' });
            return;
        };
        await pool.query("DELETE FROM services WHERE id = $1 RETURNING *", [service.rows[0].id]);
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const updateService = async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { title, description, price, category, images }: BodyTypes = req.body as BodyTypes;
    try {
        const service = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
        if(service.rows.length === 0) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        if(service.rows[0].user_id !== req.user?.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        };
        let arrImages = [];
        if(images && images.length > 0) {
            for(let i = 0; i < images.length; i++) {
                if(service.rows[0].images && Array.isArray(service.rows[0].images) && service.rows[0].images.length > 0) {
                    const publicId = service.rows[0].images[i].split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`services/${publicId}`);
                }
                const uploadResponse = await cloudinary.uploader.upload(images[i], {
                    folder: 'services',
                });
                arrImages.push(uploadResponse.secure_url);
            }
        };
        const updatedService = await pool.query(
            "UPDATE services SET title = $1, description = $2, price = $3, category = $4, images = $5 WHERE id = $6 RETURNING *",
            [
                title || service.rows[0].title,
                description || service.rows[0].description,
                price || service.rows[0].price,
                category || service.rows[0].category,
                arrImages.length > 0 ? arrImages : service.rows[0].images, 
                service.rows[0].id
            ]
        );
        res.status(200).json({ message: 'Service updated successfully', service: updatedService.rows[0] });
    } catch (error: any) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};