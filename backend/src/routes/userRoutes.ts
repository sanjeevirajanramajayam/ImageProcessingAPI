import express from 'express'
const router = express.Router()
import { registerUser, loginUser, viewUsers, logoutUser } from '../controllers/loginControllers'

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.get('/users', viewUsers)

export default router