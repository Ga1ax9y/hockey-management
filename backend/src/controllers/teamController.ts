import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { Prisma } from "../generated/prisma/client";
import { getPagination } from "../services/pagination";
import { paginatedResponse } from "../services/paginatedResponse";

const buildTeamWhereClause = (query: any) => {
    const where: Prisma.TeamWhereInput = {}

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
        where.league = { contains: league as string, mode: 'insensitive'}
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
            sortBy = "createdAt",
            order = "desc",
            includePlayers = "false",
            includeStats = "false",
            ...filters
        } = req.query
        const { page, limit, skip } = getPagination(req.query)

        const where = buildTeamWhereClause(filters)

        if (filters.hasPlayers === "true") {
            where.players = { some: {}}
        }
        else if (filters.hasPlayers === "false") {
            where.players = { none: {}}
        }

        const include: Prisma.TeamInclude = {}

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
                take: limit,
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
            ...(includeStats === "true" && team._count && {
                totalPlayers: team._count.players,
                totalMatches: team._count.matches,
                totalTrainings: team._count.trainings
            })
        }))
        res.json(
            paginatedResponse(transformedTeams, total, page, limit)
        )
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
        const {
            includePlayers = "false",
            includeUsers = 'false',
            playerLimit = "50"
         } = req.query

        const include: Prisma.TeamInclude = {}

        if (includePlayers === "true"){
            include.players = {
                select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    position: true,
                    birthDate: true,
                    height: true,
                    weight: true,
                    contractExpiry: true
                },
                orderBy: [
                    { position: 'asc'},
                    { lastName: 'asc'}
                ],
                take: Number(playerLimit)
            }
        }
        if (includeUsers === "true") {
        include.userTeams = {
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        isActive: true,
                        role: {
                            select: {
                                name: true,
                                code: true
                            }
                        }
                    }
                }
            },
            where: {
            user: {
                isActive: true
            }
            }
        };
        }

        const team = await prisma.team.findUnique({
            where: {
                id: Number(id),
            },
            include,
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

        const response =  {
            id: team.id,
            name:  team.name,
            league: team.league,
            level: team.level,
            season: team.season,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,

            ...(includePlayers === "true" && { players: team.players }),
            ...(includeUsers === "true" && { users: team.userTeams }),
        }

        res.json(response)
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
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении команды"
        ))
    }
}

export const addUserToTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: teamId } = req.params
        const { userId } = req.body

        if (!userId) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле userId обязательно",
                "Ошибка при добавлении пользователя в команду"
            ));
        }
            const team = await prisma.team.findUnique({
                where: {
                    id: Number(teamId)
                }
            })

        if (!team) {
            return next(new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Команда не найдена",
                "Ошибка при добавлении пользователя в команду"
            ));
         }
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        })

        if (!user) {
            return next(new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Пользователь не найден",
                "Ошибка при добавлении пользователя в команду"
            ));
        }
        const existingLink = await prisma.userTeam.findUnique({
            where: {
                userId_teamId: {
                userId: Number(userId),
                teamId: Number(teamId)
                }
            }
        });

        if (existingLink) {
            return next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                "Пользователь уже привязан к этой команде",
                "Ошибка при добавлении пользователя в команду"
            ));
        }
        const userTeam = await prisma.userTeam.create({
            data: {
                userId: Number(userId),
                teamId: Number(teamId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select:{
                                name: true,
                                code: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: "Пользователь успешно добавлен в команду",
            data: userTeam
        });
    }
    catch (error: any) {
        next(new AppError(
        commonErrorDict.serverError.name,
        commonErrorDict.serverError.httpCode,
        error.message,
        "Ошибка при удалении пользователя из команды"
        ));
    }
}

export const removeUserFromTeam = async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: teamId, userId } = req.params;

        const userTeam = await prisma.userTeam.findUnique({
            where: {
                userId_teamId: {
                    userId: Number(userId),
                    teamId: Number(teamId)
                }
            }
        });

        if (!userTeam) {
            return next(new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Пользователь не привязан к этой команде",
                "Ошибка при удалении пользователя из команды"
            ));
        }

        await prisma.userTeam.delete({
            where: {
                userId_teamId: {
                    userId: Number(userId),
                    teamId: Number(teamId)
                }
            }
        });

        res.json({
            success: true,
            message: "Пользователь успешно удалён из команды",
            deleted: {
                userId: Number(userId),
                teamId: Number(teamId)
            }
        });

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении пользователя из команды"
        ));
    }
};
