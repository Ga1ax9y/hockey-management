import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { getPagination } from "../services/pagination";
import { paginatedResponse } from "../services/paginatedResponse";
import type { AuthRequest } from "../middlewares/authMiddleware";
import type { PhysicalDataWhereInput } from "../generated/prisma/models";

const buildPhysicalWhereClause = (query: any, playerId: number) => {
    const where: PhysicalDataWhereInput = {}

    const { recordedDate } = query

    where.playerId = Number(playerId)

    if (recordedDate) {
        where.recordedDate = new Date(recordedDate as string)
    }

    return where
}

export const getAllPhysicalData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            sortBy = "recordedDate",
            order = "desc",
            ...filters
        } = req.query
        const { id } = req.params
        const { page, limit, skip } = getPagination(req.query);
        const where: PhysicalDataWhereInput = buildPhysicalWhereClause(filters, Number(id))
        const [physicalData, total] = await Promise.all([
            prisma.physicalData.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy as string]: order
                }
            }),
            prisma.physicalData.count({ where })
        ])
        const transformedPhysicalData = physicalData.map(physical => ({
            id: physical.id,
            playerId: physical.playerId,
            recordedDate: physical.recordedDate,
            metricType: physical.metricType,
            metricValue: physical.metricValue,
            unit: physical.unit,
        }));

        res.json(paginatedResponse(transformedPhysicalData, total, page, limit));
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении физических показателей игрока"
        ));
    }
};
