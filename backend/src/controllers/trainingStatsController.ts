import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { AppError, commonErrorDict } from "../types/AppError";
import { TrainingStatsService } from "../services/trainingStatsService";

export const createTrainingStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { trainingId, playerId, coachRating, description } = req.body
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при создании статистики тренировки"
            ));
        }

        if (!trainingId || !playerId ) {
            return next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                'Поля trainingId и playerId обязательны',
                "Ошибка при создании статистики тренировки"
            ));
        }

        const newTrainingStats = await TrainingStatsService.create(req.body, req.user!.organization.id)
        res.status(201).json(newTrainingStats)

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании статистики тренировки"
        ))
    }
}

export const updateTrainingStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { trainingId, playerId, coachRating, description } = req.body
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при обновлении статистики тренировки"
            ));
        }
        const updatedTrainingStats = await TrainingStatsService.update(Number(id), req.body, req.user!.organization.id)
        res.json(updatedTrainingStats)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении статистики тренировки"
        ))
    }
}

export const deleteTrainingStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при удалении статистики тренировки"
            ));
        }
        await TrainingStatsService.delete(Number(id), req.user?.organization.id)
        res.json({
            message: `Статистика тренировки с id ${id} успешно удален`
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении статистики тренировки"
        ))
    }
}
