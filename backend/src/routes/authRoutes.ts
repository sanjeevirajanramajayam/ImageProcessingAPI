// src/routes/authRoutes.ts
import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/profile", authenticate, getProfile);

export default router;