import express from "express";
import { getHealthStatus, getUserStats } from "../controllers/systemControllers";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

router.get("/health", getHealthStatus);
router.get("/stats", verifyJWT, getUserStats);

export default router;
