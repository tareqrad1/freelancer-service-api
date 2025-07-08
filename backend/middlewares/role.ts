import { Request, Response, NextFunction } from 'express';

export interface CustomRequest extends Request {
    user?: {
        role: string;
    }
}

export const adminRole = (req: CustomRequest, res: Response, next: NextFunction): void => {
    if(req.user && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admins only.' });
        return;
    }
    next();
};

export const clientRole = (req: CustomRequest, res: Response, next: NextFunction): void => {
    if(req.user && req.user.role !== 'client') {
            res.status(403).json({ error: 'Access denied. Clients only.' });
            return
    }
    next();
};

export const freelancerRole = (req: CustomRequest, res: Response, next: NextFunction): void => {
    if(req.user && req.user.role !== 'freelancer') {
        res.status(403).json({ error: 'Access denied. Freelancers only.' });
        return;
    }
    next();
};

export const adminOrFreelancerRole = (req: CustomRequest, res: Response, next: NextFunction): void => {
    if(req.user && req.user.role !== 'admin' && req.user.role !== 'freelancer') {
        res.status(403).json({ error: 'Access denied. Admins or Freelancers only.' });
        return;
    }
    next();
};