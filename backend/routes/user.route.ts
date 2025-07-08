import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute";
import { adminRole } from "../middlewares/role";
import { addRoleForUsers, deleteUser, getAllUsers, getOneUserById } from "../controllers/user.controller";

const router = express.Router();

router.route('/')
                .get(protectedRoute, adminRole, getAllUsers);

router.route('/:id')
                .get(protectedRoute, getOneUserById)
                .post(protectedRoute, adminRole, addRoleForUsers)
                .delete(protectedRoute, adminRole, deleteUser);

export default router;