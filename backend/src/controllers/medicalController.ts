import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";

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
