// src/routes/uploadRoutes.ts
import { Router } from "express";
import { upload, uploadFile } from "../controllers/uploadController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticate, upload.array("files", 5), uploadFile);

export default router;