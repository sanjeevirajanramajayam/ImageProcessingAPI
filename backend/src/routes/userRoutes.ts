import express from 'express'
const router = express.Router()
import { registerUser, loginUser, viewUsers, logoutUser } from '../controllers/loginControllers'
import verifyJWT from '../middleware/verifyJWT'

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.get('/users', verifyJWT, viewUsers)

export default router