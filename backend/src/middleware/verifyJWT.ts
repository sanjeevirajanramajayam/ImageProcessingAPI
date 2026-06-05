import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

declare global {
    namespace Express {
        interface Request {
            user?: { id: number; email: string }
        }
    }
}

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const accessSecret = process.env.JWT_ACCESS_TOKEN!
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({message: "You are not authenticated."})
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, accessSecret, async (err, decoded: any) => {
        if (err) return res.status(403).json({message: "Invalid or expired token"})
        
        try {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });
            
            if (!user) {
                return res.status(401).json({message: "User not found"});
            }
            
            req.user = { id: user.id, email: user.email }
            next()
        } catch (error) {
            console.error("JWT verification error:", error);
            return res.status(500).json({message: "Internal server error"});
        }
    })
}

export default verifyJWT