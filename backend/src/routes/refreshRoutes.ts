import express from "express"
import handleRefreshToken from './../controllers/refreshControllers';

const router = express.Router()

router.get('/refresh', handleRefreshToken)

export default router