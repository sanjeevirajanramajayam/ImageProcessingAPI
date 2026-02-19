import express from "express";
import multer from "multer";
import { transformImage, uploadFile, viewFiles } from "../controllers/fileControllers";
import verifyJWT from './../middleware/verifyJWT';

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post('/upload', verifyJWT, upload.single('file'), uploadFile)
router.get('/get-user-images', verifyJWT, viewFiles)
router.get('/:id/transform', transformImage)

export default router;