import { protectedRoute } from './../middlewares/protectedRoute';
import express from 'express';
import { createService, deleteService, getAllServices, getOneServiceById, updateService } from '../controllers/service.controller';
import { adminOrFreelancerRole } from '../middlewares/role';

const router = express.Router();

router.route('/')
                .get(protectedRoute, adminOrFreelancerRole, getAllServices)
                .post(protectedRoute, adminOrFreelancerRole, createService);

router.route('/:id')
                .get(protectedRoute, getOneServiceById)
                .delete(protectedRoute, deleteService)
                .patch(protectedRoute, updateService);

export default router;