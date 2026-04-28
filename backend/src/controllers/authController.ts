import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import type { AuthRequest } from "../middlewares/authMiddleware";
import { AppError, commonErrorDict } from "../types/AppError";
import { AuthService } from "../services/authService";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await AuthService.registerUser(req.body)

        res.status(201).json(newUser)

    } catch (error: any) {

        if (error instanceof AppError) {
            return next(error);
        }

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
        const { email, password } = req.body;

        const result = await AuthService.loginUser({ email, password })

        res.json({
            message: "Вход выполнен успешно",
            ...result
        });
    }
    catch (error: any) {

        if (error instanceof AppError) {
            return next(error);
        }

        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка сервера при входе"
        ))
    }
}

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при получении данных пользователя"
            ))
        }
        const user = await AuthService.getUserInfo(Number(userId))

        res.json(user)
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении данных пользователя"
        ))
    }
}
