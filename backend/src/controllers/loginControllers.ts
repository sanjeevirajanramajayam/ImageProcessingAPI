import { prisma } from '../lib/prisma'
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_TOKEN!
const refreshSecret = process.env.JWT_REFRESH_TOKEN!

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const user = await prisma.user.create({
        data: {
            name: username,
            email: email,
            password: password,
        },
    });

    return res.status(201).json(user);
}

export const viewUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();

    return res.status(200).json(users);
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findFirst({
            where: { email, password: password },
        });


        if (!user) {
            return res.status(404).json({ "message": "User not found!" });
        }

        const accessToken = jwt.sign({ email }, accessSecret, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ email }, refreshSecret, { expiresIn: '1d' })

        await prisma.user.update({ where: { email: email }, data: { refreshToken: refreshToken } })
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
        return res.status(200).json({ accessToken });


    } catch (error) {
        console.error("PRISMA ERROR:", error);
        return res.status(500).json({ message: "Prisma error" });
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const refreshSecret = process.env.JWT_REFRESH_TOKEN!;
    const accessSecret = process.env.JWT_ACCESS_TOKEN!;

    if (!cookies.jwt) {
        return res.sendStatus(204);
    }

    const refreshToken = req.cookies.jwt;

    const foundUser = await prisma.user.findFirst({ where: { refreshToken } })

    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
        return res.sendStatus(204)
    }

    await prisma.user.update({ where: { email: foundUser.email }, data: { refreshToken: null } })
    res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })

    return res.sendStatus(204)
}
