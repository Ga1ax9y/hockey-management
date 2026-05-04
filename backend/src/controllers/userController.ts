import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma"
import { AppError, commonErrorDict } from "../types/AppError";
import type { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt"
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";
import { UserService } from "../services/userService";

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPagination(req.query)
        const organizationId = req.user!.organization.id

        const { users, total } = await UserService.findAll({
            pagination: { skip, limit },
            organizationId
        })

        res.json(paginatedResponse(users, total, page, limit));
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
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
        const { id } = req.params;

        const user = await UserService.findById(Number(id))

        res.json(user);

    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
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
        const organizationId = req.user?.organization?.id

        if (!organizationId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Нет организации",
                "Ошибка создания пользователя"
            ))
        }

        let avatarUrl = null;

        try {
            avatarUrl = req.file ? req.file.path : null;
        } catch (uploadError: any) {
            return next(new AppError(
                "CloudinaryError",
                commonErrorDict.serverError.httpCode,
                "Ошибка при получении файла из облачного хранилища",
                "Ошибка при создании нового игрока"
            ));
        }

        const userData = {
            ...req.body,
            avatarUrl: avatarUrl || req.body.avatarUrl
        }

        const user = await UserService.create(userData, Number(organizationId))

        res.status(201).json(user)

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
