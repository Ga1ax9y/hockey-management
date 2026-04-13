import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { getPagination } from "../helpers/pagination";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { MatchService } from "../services/matchService";
import { paginatedResponse } from "../helpers/paginatedResponse";


export const getAllMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.user?.organization.id;
        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при получении всех матчей"
            ));
        }
        const pagination = getPagination(req.query)

        const { matches, total } = await MatchService.findAll({
            pagination,
            organizationId: req.user!.organization.id
        })

        // TODO: CHANGE TO CRON
        await MatchService.autoCloseOldMatches()

        res.json(paginatedResponse(matches, total, pagination.page, pagination.limit))
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении всех матчей"
        ))
    }
}

export const getMatchById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const includeStats = req.query.includeStats === "true";
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при получении матча по id"
            ));
        }

        const match = await MatchService.findById(Number(id), includeStats)
        if (!match) {
            return next(
                new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Матч не найден",
                    "Ошибка при получении матча по id"
                )
            );
        }
        res.json(match)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении матча по id"
        ))
    }
}

export const createMatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { matchDate, location, myTeamId, opponentName, isHomeGame, matchType, season } = req.body
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при создании матча"
            ));
        }

        if (!matchDate || !location || myTeamId === undefined || !opponentName || isHomeGame === undefined || !matchType || !season) {
            return next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                'Поля matchDate, location, myTeamId, opponentName, isHomeGame, matchType, season обязательны для заполнения',
                "Ошибка при создании матча"
            ));
        }

        const newMatch = await MatchService.create(req.body, req.user!.organization.id)
        res.status(201).json(newMatch)

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании матча"
        ))
    }
}

export const updateMatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { matchDate, location, myTeamId, opponentName, isHomeGame, matchType, season } = req.body
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при обновлении матча"
            ));
        }
        const updatedMatch = await MatchService.update(Number(id), req.body, req.user!.organization.id)
        res.json(updatedMatch)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении матча"
        ))
    }
}

export const completeMatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { myScore, opponentScore } = req.body;
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при обновлении матча"
            ));
        }
        const completedMatch = await MatchService.complete(Number(id), { myScore, opponentScore });

        res.json(completedMatch);
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при сохранении результатов матча"
        ));
    }
};

export const deleteMatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при обновлении матча"
            ));
        }
        await MatchService.delete(Number(id), req.user?.organization.id)
        res.json({
            message: `Матч с id ${id} успешно удален`
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении матча"
        ))
    }
}
