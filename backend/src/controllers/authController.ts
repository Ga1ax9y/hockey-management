import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import type { AuthRequest } from "../middlewares/authMiddleware";
import { AppError, commonErrorDict } from "../types/AppError";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register  = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password, fullName, roleId, organizationName, organizationId} = req.body
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

        const hashedPassword = await bcrypt.hash(password, 10)
        let newUser;

        if (!organizationId) {
            const newOrganization = await prisma.organization.create({
                data: {
                    name: organizationName
                }
            })
            const adminRole = await prisma.role.findUnique({ where: { code: "ADMIN" } });
            if (!adminRole) throw new Error("Роль ADMIN не найдена");
            newUser = await prisma.user.create({
                data: {
                    email,
                    fullName,
                    passwordHash: hashedPassword,
                    roleId: adminRole.id,
                    organizationId: newOrganization.id
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    roleId: true,
                    organization: true,
                    createdAt: true
                }
            })
        } else {
            newUser = await prisma.user.create({
                data: {
                    email,
                    fullName,
                    passwordHash: hashedPassword,
                    roleId: Number(roleId),
                    organizationId: Number(organizationId)
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    roleId: true,
                    createdAt: true
                }
            })
        }

        res.status(201).json(newUser)
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании пользователя"
        ))
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        const user = await prisma.user.findUnique({
            where: {email},
            include: {role: true, organization: true}
        });

        if (!user) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Неверный почтовый адрес или пароль",
                "Ошибка сервера при входе"
        ))
        }

        const isPasswordValid = bcrypt.compare(password, user.passwordHash)

        if (!isPasswordValid) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Неверный почтовый адрес или пароль",
                "Ошибка сервера при входе"
        ))
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                roleId: user.roleId,
                organizationId: user.organizationId
            },
            JWT_SECRET,
            {expiresIn: "7d"}

        );

        res.json({
            message: "Вход выполнен успешно",
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role.name,
                organization: {
                    id: user.organization.id,
                    name: user.organization.name
                }
            }
        })
    }
    catch (error: any){
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка сервера при входе"
        ))
    }
}

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const userId = req.user?.id

        if (!userId){
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при получении данных пользователя"
        ))
        }
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                role: {
                    select: {
                        name: true,
                        code: true
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name:true,
                    }
                },
                userTeams: {
                    select: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                league: true
                            }
                        }
                    }
                }

            }
        })

        if (!user){
            return next(new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Пользователь не найден",
                "Ошибка при получении данных пользователя"
        ))
        }
        console.log(user)
        res.json(user)
    }
    catch(error: any){
            next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                error.message,
                "Ошибка при получении данных пользователя"
        ))
    }
}
