import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const accessSecret = process.env.JWT_ACCESS_TOKEN!
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({message: "You are not authorized."})
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, accessSecret, (err, decoded) => {
        if (err) return res.status(403).json({message: err})
        req.user = decoded
        next()
    })
}

export default verifyJWT