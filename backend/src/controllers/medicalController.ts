import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import type { MedicalHistoryWhereInput } from "../generated/prisma/models";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";

const buildMedicalWhereClause = (query: any, playerId: number) => {
    const where: MedicalHistoryWhereInput = {}

    const { recoveryDate } = query

    where.playerId = Number(playerId)

    if (recoveryDate) {
        where.recoveryDate = new Date(recoveryDate as string)
    }

    return where
}

export const getMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            sortBy = "recoveryDate",
            order = "desc",
            ...filters
        } = req.query
        const { id } = req.params
        const { page, limit, skip } = getPagination(req.query);
        const where: MedicalHistoryWhereInput = buildMedicalWhereClause(filters, Number(id))
        const [medicalRecords, total] = await Promise.all([
            prisma.medicalHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy as string]: order
                }
            }),
            prisma.medicalHistory.count({ where })
        ])
        const transformedMedicalRecords = medicalRecords.map(medical => ({
            id: medical.id,
            playerId: medical.playerId,
            injuryDate: medical.injuryDate,
            recoveryDate: medical.recoveryDate,
            diagnosis: medical.diagnosis,
            status: medical.status,
            createdAt: medical.createdAt,
            updatedAt: medical.updatedAt

        }));

        res.json(paginatedResponse(transformedMedicalRecords, total, page, limit));
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении медицинской истории игрока"
        ));
    }
};

export const markPlayerRecovered = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const medicalRecord = await prisma.medicalHistory.update({
            where:{
                id: Number(id)
            },
            data: {
                status: "recovered",
                recoveryDate: new Date()
            }
        })

        res.json({
            success: true,
            message: "Игрок отмечен как восстановившийся",
            data: medicalRecord
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении медицинской записи"
        ))
  }

}
