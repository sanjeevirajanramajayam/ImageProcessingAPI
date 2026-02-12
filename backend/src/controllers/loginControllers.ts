import { prisma } from '../lib/prisma'
import { Request, Response } from 'express';

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
        else {
            return res.status(200).json(user);
        }

    } catch (error) {
        console.error("PRISMA ERROR:", error);
        return res.status(500).json({ message: "Prisma error" });
    }
}