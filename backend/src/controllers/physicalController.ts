import type { NextFunction, Request, Response } from "express";
import { AppError, commonErrorDict } from "../types/AppError";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { PhysicalService } from "../services/physicalService";

export const getAllPhysicalData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { page, limit, skip } = getPagination(req.query);
        const {records, total} = await PhysicalService.findByPlayer({
            playerId: id,
            pagination: {skip,limit},
            filters: req.query
        })


        res.json(paginatedResponse(records, total, page, limit));
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении физических показателей игрока"
        ));
    }
};
