import express from "express";
import multer from "multer";
import { transformImage, uploadFile, viewFiles } from "../controllers/fileControllers";

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post('/upload', upload.single('file'), uploadFile)
router.get('/get-user-images', viewFiles)
router.post('/:id/transform', transformImage)

export default router;