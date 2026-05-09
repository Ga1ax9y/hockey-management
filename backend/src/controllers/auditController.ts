import type { NextFunction, Response } from "express";
import { AuditService } from "../services/auditService";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";
import { AppError, commonErrorDict } from "../types/AppError";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const getAllLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { userId, entityType } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const { logs, total } = await AuditService.findAll({
            userId: userId ? Number(userId) : undefined,
            entityType: entityType as string,
            pagination: { skip, limit }
        });

        return res.json(paginatedResponse(logs, total, page, limit));

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении логов аудита"
        ));
    }
};
