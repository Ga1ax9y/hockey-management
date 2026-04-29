import type { NextFunction, Request, Response } from "express";
import { AppError, commonErrorDict } from "../types/AppError";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";
import { MedicalService } from "../services/medicalService";

export const getMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params
        const { page, limit, skip } = getPagination(req.query);
        const { records, total } = await MedicalService.findByPlayer({
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
            "Ошибка при получении медицинской истории игрока"
        ));
    }
};

export const markPlayerRecovered = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        if (!id) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "ID записи не предоставлен",
                "Ошибка при получении медицинской истории игрока"
            ));
        }

        const record = await MedicalService.recoverPlayer(id as string)

        res.json({
            success: true,
            message: "Игрок отмечен как восстановившийся",
            data: record
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

export const addMedicalRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const organizationId = req.user?.organization.id
        const currentUserTeam = req.user?.teamId
        const isAdmin = req.user?.role.code === "ADMIN"

        if (!id) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле userId обязательно",
                "Ошибка при добавлении медицинской записи игроку"
            ));
        }

        const newMedical = await MedicalService.create(Number(id), req.body,{
            organizationId,
            currentUserTeam,
            isAdmin
        })

        res.status(201).json({
            success: true,
            message: "Игроку успешно добавлена медицинская запись",
            data: newMedical
        });

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при добавлении медицинской записи игроку"
        ))
    }
}
