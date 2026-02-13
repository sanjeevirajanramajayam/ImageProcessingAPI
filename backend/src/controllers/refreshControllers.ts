import { Request, Response } from "express"
import { prisma } from "../lib/prisma";
import jwt, { VerifyErrors } from 'jsonwebtoken';

const handleRefreshToken = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const refreshSecret = process.env.JWT_REFRESH_TOKEN!;
    const accessSecret = process.env.JWT_ACCESS_TOKEN!;

    if (!cookies.jwt) {
        return res.sendStatus(403);
    }

    const refreshToken = req.cookies.jwt;

    const foundUser = await prisma.user.findFirst({ where: { refreshToken } })

    if (!foundUser) {
        return res.sendStatus(403)
    }

    jwt.verify(refreshToken, refreshSecret, (err: VerifyErrors | null, decoded: any) => {
        if (err) return res.sendStatus(403);
        if (decoded.email == foundUser.email) {
            const accessToken = jwt.sign({ email: foundUser.email }, accessSecret, { expiresIn: '30s' })
            return res.json({ accessToken })
        }
        else {
            return res.sendStatus(403)
        }

    })

}

export default handleRefreshToken