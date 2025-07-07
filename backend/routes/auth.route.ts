import express from "express";
import { forgotPassword, login, logout, register, resetPassword, verifyAccount, refreshToken, checkAuth } from "../controllers/auth.controller";
import { protectedRoute } from "../middlewares/protectedRoute";

const router = express.Router();

router.post("/register", register);
router.post('/verify', verifyAccount);
router.post("/login", login);
router.post("/logout", logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/refresh-token', refreshToken);

router.get('/check-auth', protectedRoute, checkAuth);

export default router;