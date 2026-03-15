import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma"
import { AppError, commonErrorDict } from "../types/AppError";
import type { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt"

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
                        name: true,
                        code: true
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
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { email, password, fullName, roleId } = req.body

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser){
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "email уже занят",
                "Ошибка при создании пользователя"
            ))
        }
        
        if (!req.user?.organization?.id) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Нет организации",
                "Ошибка создания пользователя"
            ))
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
                data: {
                    email,
                    fullName,
                    passwordHash: hashedPassword,
                    roleId: Number(roleId),
                    organizationId: req.user.organization.id
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    roleId: true,
                    createdAt: true
                }
            })

        res.status(201).json(user)

    } catch (error: any) {
        next(error)
    }
}
