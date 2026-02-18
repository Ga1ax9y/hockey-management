import type { Request, Response } from "express";
import { prisma } from "../lib/prisma"

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: {
                    select: {
                        name: true
                    }
                }

            }
        });
        res.json(users);
    }
    catch (error: any) {
        res.status(500).json({
            error: error.message,
            description: "Ошибка при получении пользователей"
        });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: {
                    select: {
                        name: true
                    }
                }

            }
        })
        res.json(user);

    } catch (error: any) {
        res.status(500).json({
            error: error.message,
            description: "Ошибка при получении пользователей по id"
        });
    }

}
