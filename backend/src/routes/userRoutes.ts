import express from 'express'
const router = express.Router()
import { registerUser, loginUser, viewUsers } from '../controllers/loginControllers'

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/users', viewUsers)

export default router