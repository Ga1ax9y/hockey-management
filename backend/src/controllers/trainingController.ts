import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { getPagination } from "../helpers/pagination";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const getAllTrainings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const { page, limit, skip } = getPagination(req.query)
        const trainings = await prisma.training.findMany({
            where: {team: {organizationId: req.user!.organization.id}},
            select: {
                id: true,
                startTime: true,
                endTime: true,
                location: true,
                trainingType: true,
                team: true,
                teamId: true,
                coach: true,
                coachId: true,
                createdAt: true,
                updatedAt: true

            }
        })
        // TODO:  ADD  PAGINATION
        res.json({
            data: trainings
        })
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

export const getTrainingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const training = await prisma.training.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                location: true,
                trainingType: true,
                team: true,
                teamId: true,
                coach: true,
                coachId: true,
                createdAt: true,
                updatedAt: true

            }
        })
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

export const createTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {startTime, endTime, location, trainingType, teamId, coachId } = req.body
         console.log('Received body:', req.body);
        if (!startTime || !endTime  || !location || !trainingType || !teamId || !coachId) {
            return next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                'Поля trainingDate, location, trainingType, teamId, coachId обязательны для заполнения',
                "Ошибка при создании тренировки"
            ))
        }

        const newTraining = await prisma.training.create({
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                location,
                trainingType,
                teamId: Number(teamId),
                coachId
            }
        })
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

export const updateTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const {  startTime, endTime, location, trainingType, teamId, coachId } = req.body
        const updatedTraining = await prisma.training.update({
            where: {
                id: Number(id)
            },
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                location,
                trainingType,
                teamId:  Number(teamId),
                coachId
            }
        })
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

export const deleteTraining = async (req: Request, res: Response, next:  NextFunction) => {
    try {
        const { id } = req.params
        await prisma.training.delete({
            where: {
                id: Number(id)
            }
        })
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
