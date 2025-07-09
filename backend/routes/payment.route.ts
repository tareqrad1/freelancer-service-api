import express from 'express';
import { protectedRoute } from '../middlewares/protectedRoute';
import { checkoutSuccess, createCheckoutSession } from '../controllers/payment.controller';

const router: express.Router = express.Router();

router.post('/create-checkout-session', protectedRoute, createCheckoutSession);
router.post('/checkout-success', protectedRoute, checkoutSuccess);

export default router;