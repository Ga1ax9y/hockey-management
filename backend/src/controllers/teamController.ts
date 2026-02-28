import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";

const buildTeamWhereClause = (query: any) => {
    const where: any = {}

    const {
        search,
        league,
        season,
        level,
        hasPlayers,
        createdAfter,
        createdBefore
    } = query

    if (search) {
        where.name = { contains: search as string, mode: 'insensitive'}
    }

    if (league) {
        where.name = { contains: search as string, mode: 'insensitive'}
    }
    if (level !== undefined) {
        where.level = Number(level);
    }

    if (season) {
        where.season = season as string
    }

    if (createdAfter || createdBefore) {
        where.createdAt = {}
        if (createdAfter) where.createdAt.gte = new Date(createdAfter as string)
        if (createdBefore) where.createdAt.lte = new Date(createdBefore as string)
    }

    return where

}
export const getAllTeams = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {
            page = "1",
            limit = "20",
            sortBy = "createdAt",
            order = "desc",
            includePlayers = "false",
            includeStats = "false",
            ...filters
        } = req.query

        const pageNum = Math.max(1, Number(page))
        const limitNum = Math.min(100, Math.max(1, Number(limit)))
        const skip = (pageNum - 1) * limitNum

        const where = buildTeamWhereClause(filters)

        if (filters.hasPlayers === "true") {
            where.players = { some: {}}
        }
        else if (filters.hasPlayers === "false") {
            where.players = { none: {}}
        }

        const include: any = {}

        if (includePlayers === "true"){
            include.players = {
                select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    position: true,
                    birthDate: true
                },
                orderBy: {
                    lastName: 'asc'
                }
            }
        }
        if (includeStats === "true"){
            include._count = {
                select: {
                    players: true,
                    matches: true,
                    trainings: true
                }
            }
        }
        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                where,
                include,
                skip,
                take: limitNum,
                orderBy: {
                    [sortBy as string]: order
                }
            }),
            prisma.team.count({where})
        ])
        const transformedTeams = teams.map(team => ({
            id: team.id,
            name: team.name,
            league: team.league,
            season: team.season,
            level: team.level,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            ...(includePlayers === "true") && {
                players: team.players,
                playerCount: team.players?.length
            },
            // ...(includeStats === "true") && {
            //     totalPlayers: team._count.players,
            //     totalMatches: team._count.matches,
            //     totalTrainings: team._count.trainings

            // }
        }))
        res.json({
            data: transformedTeams,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum * limitNum < total,
                hasPrevPage: pageNum > 1
            }
        })
        // const teams = await prisma.team.findMany({
        //     select: {
        //         id: true,
        //         name: true,
        //         league: true,
        //         level: true,
        //         season: true,
        //         createdAt: true,
        //         updatedAt: true
        //     }
        // })
        // res.json(teams)
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
