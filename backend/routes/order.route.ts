import express from 'express';
import { protectedRoute } from '../middlewares/protectedRoute';
import { getMyOrders, getFreelancerOrders } from '../controllers/order.controller';

const router = express.Router();

router.get('/', protectedRoute, getMyOrders);
router.get('/freelancer-orders', protectedRoute, getFreelancerOrders);

export default router;