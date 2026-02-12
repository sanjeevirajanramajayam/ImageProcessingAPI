import express from "express";
import multer from "multer";
import uploadFile from "../controllers/fileControllers";

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post('/upload', upload.single('file'), uploadFile)

export default router;