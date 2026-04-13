import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { getPagination } from "../helpers/pagination";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { TrainingService } from "../services/trainingService";
import { paginatedResponse } from "../helpers/paginatedResponse";

export const getAllTrainings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
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
        const { trainings, total } = await TrainingService.findAll({
            pagination,
            organizationId: orgId
        })

        res.json(paginatedResponse(trainings, total, pagination.page, pagination.limit))
    }
    catch(error: any){
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении всех тренировок"
        ))
    }
}

export const getTrainingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        const training = await TrainingService.findById(Number(id), includeStats)
        if (!training){
            return next(
                new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Тренировка не найдена",
                    "Ошибка при получении тренировки по id"
                )
            );
        }
        res.json(training)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении тренировки по id"
        ))
    }
}

export const createTraining = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {startTime, endTime, location, trainingType, teamId, coachId } = req.body
        if (!startTime || !endTime  || !location || !trainingType || !teamId || !coachId) {
            return next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                'Поля trainingDate, location, trainingType, teamId, coachId обязательны для заполнения',
                "Ошибка при создании тренировки"
            ))
        }
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при создании матча"
            ));
        }

        const newTraining = await TrainingService.create(req.body, orgId)
        res.status(201).json(newTraining)

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании тренировки"
        ))
    }
}

export const updateTraining = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const {  startTime, endTime, location, trainingType, teamId, coachId } = req.body
        const orgId = req.user?.organization.id;

        if (!orgId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не авторизован",
                "Ошибка при обновлении матча"
            ));
        }
        const updatedTraining = await TrainingService.update(Number(id), req.body, orgId)
        res.json(updatedTraining)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении тренировки"
        ))
    }
}

export const deleteTraining = async (req: AuthRequest, res: Response, next:  NextFunction) => {
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
        await TrainingService.delete(Number(id), orgId)
        res.json({
            message: `Тренировка с id ${id} успешно удален`
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении тренировки"
        ))
    }
}
