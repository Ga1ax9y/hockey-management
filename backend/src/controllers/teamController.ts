import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";

export const getAllTeams = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                league: true,
                level: true,
                season: true,
                createdAt: true,
                updatedAt: true
            }
        })
        res.json(teams)
    }
    catch(error: any){
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении всех команд"
        ))
    }
}

export const getTeamById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const team = await prisma.team.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                league: true,
                level: true,
                season: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!team){
            return next(
                new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Команда не найдена",
                    "Ошибка при получении команды по id"
                )
            );
        }
        res.json(team)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении команды по id"
        ))
    }
}

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, league, level, season } = req.body

        if (!name || !level || !season) {
            next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                'Поля name, level и season обязательны для заполнения',
                "Ошибка при создании команды"
            ))
        }

        const newTeam = await prisma.team.create({
            data: {
                name,
                league,
                level,
                season
            }
        })
        res.status(201).json(newTeam)

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании команды"
        ))
    }
}

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { name, league, level, season } = req.body
        const updatedTeam = await prisma.team.update({
            where: {
                id: Number(id)
            },
            data: {
                name,
                league,
                level,
                season
            }
        })
        res.json(updatedTeam)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении команды"
        ))
    }
}

export const deleteTeam = async (req: Request, res: Response, next:  NextFunction) => {
    try {
        const { id } = req.params
        await prisma.team.delete({
            where: {
                id: Number(id)
            }
        })
        res.json({
            message: `Команда с id ${id} успешно удален`
        })
    } catch (error: any) {
        // if (error.code === 'P2003') {
        //     next(new AppError(
        //         commonErrorDict.serverError.name,
        //         commonErrorDict.serverError.httpCode,
        //         error.message,
        //         "Нельзя удалить команду, так как она имеет связи с другими таблицами"
        //     ))
        // }
        // else if (error.code === 'P2025') {
        //     return next(
        //         new AppError(
        //             commonErrorDict.resourceNotFound.name,
        //             commonErrorDict.resourceNotFound.httpCode,
        //             "Команда для удаления не найдена"
        //         )
        //     );
        // }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении команды"
        ))
    }
}
