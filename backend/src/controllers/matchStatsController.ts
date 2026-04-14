import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { AppError, commonErrorDict } from "../types/AppError";
import { MatchStatsService } from "../services/matchStatsService";

export const createMatchStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { matchId, playerId, goals, assists, shots, hits, penaltyMinutes, plusMinus, faceoffWins, timeOnIce } = req.body
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при создании статистики матча"
            ));
        }

        if (!matchId || !playerId ) {
            return next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                'Поля matchId и playerId обязательны',
                "Ошибка при создании статистики матча"
            ));
        }

        const newMatchStats = await MatchStatsService.create(req.body, req.user!.organization.id)
        res.status(201).json(newMatchStats)

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании статистики матча"
        ))
    }
}

export const updateMatchStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { matchId, playerId, goals, assists, shots, hits, penaltyMinutes, plusMinus, faceoffWins, timeOnIce } = req.body
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при обновлении статистики матча"
            ));
        }
        const updatedMatchStats = await MatchStatsService.update(Number(id), req.body, req.user!.organization.id)
        res.json(updatedMatchStats)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении статистики матча"
        ))
    }
}

export const deleteMatchStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при удалении статистики матча"
            ));
        }
        await MatchStatsService.delete(Number(id), req.user?.organization.id)
        res.json({
            message: `Статистика матча с id ${id} успешно удален`
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении статистики матча"
        ))
    }
}
