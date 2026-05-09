import type { NextFunction, Request, Response } from "express";
import { AppError, commonErrorDict } from "../types/AppError";
import { ReadinessService } from "../services/analyticsService";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const getPlayerHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { playerId } = req.params;

        if (!playerId) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле playerId обязательно",
                "Ошибка при просмотре индексов готовности игрока"
            ));
        }

        const { page, limit, skip } = getPagination(req.query);

        const { readinessIndices, total } = await ReadinessService.findByPlayer({
            playerId: Number(playerId),
            pagination: { skip, limit },

        });
        return res.json(paginatedResponse(readinessIndices, total, page, limit));

    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при просмотре индексов готовности игрока"
        ))
    }
}

export const getTeamStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { teamId } = req.params;

        if (!teamId) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле teamId обязательно",
                "Ошибка при просмотре индекса готовности команды"
            ));
        }

        const { latestIndices, total } = await ReadinessService.getTeamLatestIndices({
            teamId: Number(teamId),
            pagination: { skip, limit },
        });

        return res.json(paginatedResponse(latestIndices, total, page, limit));

    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при просмотре индекса готовности команды"
        ))
    }
}
export const previewIndex = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { playerId } = req.params;

        if (!playerId) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле playerId обязательно",
                "Ошибка при просмотре индекса готовности игрока"
            ));
        }

        const result = await ReadinessService.calculatePlayerReadiness(Number(playerId));

        return res.json(result);

    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при просмотре индекса готовности игрока"
        ))
    }
}

export const createIndexRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { playerId } = req.body;

        if (!playerId) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле playerId обязательно",
                "Ошибка при добавлении индекса готовности игрока"
            ));
        }
        const newRecord = await ReadinessService.savePlayerIndex(Number(playerId));

        return res.status(201).json(newRecord);

    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при добавлении индекса готовности игрока"
        ))
    }
}

export const updateTeamAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { teamId } = req.body;
        if (!teamId) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле teamId обязательно",
                "Ошибка при добавлении индекса готовности команды"
            ));
        }

        const results = await ReadinessService.refreshTeamReadiness(Number(teamId));
        return res.status(201).json({ message: "Аналитика команды обновлена", results, total: results.length });

    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при добавлении индекса готовности команды"
        ))
    }
}
