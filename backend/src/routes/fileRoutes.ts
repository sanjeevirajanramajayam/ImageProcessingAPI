import express from "express";
import multer from "multer";
import {
  transformImage,
  uploadFiles,
  viewFile,
  viewFiles,
  deleteImage,
} from "../controllers/fileControllers";
import verifyJWT from "./../middleware/verifyJWT";
import { transformLimiter } from "../middleware/rateLimiter";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/upload", verifyJWT, upload.array("file"), uploadFiles);
router.get("/get-user-images", verifyJWT, viewFiles);
router.get("/:id/transform", transformImage);
router.get("/:id", verifyJWT, viewFile);
router.delete("/:id", verifyJWT, deleteImage);

export default router;
