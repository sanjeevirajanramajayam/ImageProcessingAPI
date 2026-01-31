// src/routes/userRoutes.ts
import { Router } from "express";
import { getUsers } from "../controllers/userController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, getUsers);

export default router;