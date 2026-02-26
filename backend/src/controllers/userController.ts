import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma"
import { AppError, commonErrorDict } from "../types/AppError";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
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
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении пользователей"
        ))
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
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
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении пользователя по id"
        ))

    }

}
