import type { TeamInclude, TeamWhereInput } from "../generated/prisma/models"
import { prisma } from "../lib/prisma"
import { AppError, commonErrorDict } from "../types/AppError"

const buildTeamWhereClause = (query: any, organizationId: number) => {
    const where: TeamWhereInput = {}

    const {
        search,
        league,
        season,
        level,
        hasPlayers,
        createdAfter,
        createdBefore
    } = query

    where.organizationId = organizationId
    if (hasPlayers === "true") {
        where.players = { some: {} }
    }
    else if (hasPlayers === "false") {
        where.players = { none: {} }
    }

    if (search) {
        where.name = { contains: search as string, mode: 'insensitive' }
    }

    if (league) {
        where.league = { contains: league as string, mode: 'insensitive' }
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

const buildSoloTeamIncludeClause = (query: any) => {
    const playerLimit = 30
    const include: TeamInclude = {}
    if (query.includePlayers === "true") {
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
                { position: 'asc' },
                { lastName: 'asc' }
            ],
            take: Number(query.playerLimit) || playerLimit
        }
    }
    if (query.includeUsers === "true") {
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
    return include
}

const buildTeamIncludeClause = (query: any) => {
    const include: TeamInclude = {
        organization: true
    }
    if (query.includePlayers === "true") {
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
    if (query.includeStats === "true") {
        include._count = {
            select: {
                players: true,
                matches: true,
                trainings: true
            }
        }
    }

    return include
}

export const TeamService = {
    async findAll({ organizationId, pagination, query }: any) {
        const { skip, limit } = pagination
        const where: TeamWhereInput = buildTeamWhereClause(query, organizationId)
        const include: TeamInclude = buildTeamIncludeClause(query)

        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                where,
                include,
                skip,
                take: limit,
                orderBy: {
                    [query.sortBy || "createdAt"]: query.order || "desc"
                }
            }),
            prisma.team.count({ where })
        ])
        const transformedTeams = teams.map(team => ({
            id: team.id,
            name: team.name,
            league: team.league,
            season: team.season,
            level: team.level,
            organizationId: team.organizationId,
            organization: {
                id: team.organization.id,
                name: team.organization.name
            },
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            ...(query.includePlayers === "true") && {
                players: team.players,
                playerCount: team.players?.length
            },
            ...(query.includeStats === "true" && team._count && {
                totalPlayers: team._count.players,
                totalMatches: team._count.matches,
                totalTrainings: team._count.trainings
            })
        }))

        return {
            teams: transformedTeams,
            total
        }
    },

    async findById({ teamId, organizationId, query }: any) {
        const include: TeamInclude = buildSoloTeamIncludeClause(query)

        const team = await prisma.team.findUnique({
            where: {
                id: Number(teamId),
                organizationId
            },
            include,
        })
        if (!team) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Команда не найдена",
                "Ошибка при получении команды по id"
            )
        }

        const result = {
            id: team.id,
            name: team.name,
            league: team.league,
            level: team.level,
            season: team.season,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,

            ...(query.includePlayers === "true" && { players: team.players }),
            ...(query.includeUsers === "true" && { users: team.userTeams }),
        }

        return result
    },

    async create(data: any, organizationId: number) {
        const { name, league, level, season } = data
        if (!name || !level || !season) {
            throw new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                'Поля name, level и season обязательны для заполнения',
                "Ошибка при создании команды"
            )
        }

        const newTeam = await prisma.team.create({
            data: {
                name,
                league,
                level: Number(level),
                season,
                organizationId
            }
        })

        return newTeam
    },

    async update(teamId: number, data: any) {
        const { name, league, level, season } = data

        const updatedTeam = await prisma.team.update({
            where: {
                id: teamId
            },
            data: {
                name,
                league,
                ...(level !== undefined && { level: Number(level) }),
                season
            }
        })

        return updatedTeam
    },

    async delete(teamId: number) {
        await prisma.team.delete({
            where: {
                id: Number(teamId)
            }
        })
    },

    async addUser(teamId: number, userId: number) {
        if (!userId) {
            throw new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле userId обязательно",
                "Ошибка при добавлении пользователя в команду"
            )
        }
        const team = await prisma.team.findUnique({
            where: {
                id: teamId
            }
        })

        if (!team) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Команда не найдена",
                "Ошибка при добавлении пользователя в команду"
            )
        }
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Пользователь не найден",
                "Ошибка при добавлении пользователя в команду"
            )
        }
        const existingLink = await prisma.userTeam.findUnique({
            where: {
                userId_teamId: {
                    userId: userId,
                    teamId: teamId
                }
            }
        });

        if (existingLink) {
            throw new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                "Пользователь уже привязан к этой команде",
                "Ошибка при добавлении пользователя в команду"
            )
        }
        const userTeam = await prisma.userTeam.create({
            data: {
                userId: userId,
                teamId: teamId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select: {
                                name: true,
                                code: true
                            }
                        }
                    }
                }
            }
        });

        return userTeam
    },

    async removeUser(teamId: number, userId: number) {
        const userTeam = await prisma.userTeam.findUnique({
            where: {
                userId_teamId: {
                    userId: userId,
                    teamId: teamId
                }
            }
        });

        if (!userTeam) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Пользователь не привязан к этой команде",
                "Ошибка при удалении пользователя из команды"
            )
        }

        await prisma.userTeam.delete({
            where: {
                userId_teamId: {
                    userId: Number(userId),
                    teamId: Number(teamId)
                }
            }
        });
    }
}
