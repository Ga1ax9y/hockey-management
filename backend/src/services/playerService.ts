import type { PlayerInclude, PlayerWhereInput } from "../generated/prisma/models"
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";

const buildPlayerWhereClause = (query: any, organizationId: number) => {
    const where: PlayerWhereInput = {
        currentTeam: {
            is: {
                organizationId
            }
        }
    }

    const {
        search,
        position,
        minHeight,
        maxHeight,
        minWeight,
        maxWeight,
        contractExpiryLte,
        currentTeamId,
        hasTransfers
    } = query

    if (hasTransfers === "true") {
        where.careerHistory = { some: {} }
    }
    else if (hasTransfers === "false") {
        where.careerHistory = { none: {} }
    }

    if (search) {
        where.lastName = { contains: search as string, mode: "insensitive" }
    }

    if (position) {
        where.position = position as string
    }

    if (currentTeamId) {
        where.currentTeamId = Number(currentTeamId)
    }

    if (minHeight || maxHeight) {
        where.height = {}
        if (minHeight) where.height.gte = Number(minHeight)
        if (maxHeight) where.height.lte = Number(maxHeight)
    }

    if (minWeight || maxWeight) {
        where.weight = {}
        if (minWeight) where.weight.gte = Number(minWeight)
        if (maxWeight) where.weight.lte = Number(maxWeight)
    }

    if (contractExpiryLte) {
        where.contractExpiry = { lte: new Date(contractExpiryLte as string) }
    }

    return where

}

const buildIncludeClause = (query: any): PlayerInclude => {
    const include: PlayerInclude = {}

    if (query.includeCurrentTeam === "true") {
        include.currentTeam = {
            select: {
                id: true,
                name: true,
                league: true
            }
        }
    }
    if (query.includeStats === "true") {
        include._count = {
            select: {
                careerHistory: true,
                medicalHistory: true,
                physicalData: true,
                matchStats: true,
                trainingStats: true
            }
        }
    }

    return include
}

const buildSoloIncludeClause = (query: any, pagination: any): PlayerInclude => {
    const include: PlayerInclude = {}

    if (query.includeTransfers === "true") {
        include.careerHistory = {
            select: {
                id: true,
                transferDate: true,
                transferType: true,
                fromTeam: {
                    select: {
                        id: true,
                        name: true,
                        season: true,
                        league: true,
                        level: true
                    }
                },
                toTeam: {
                    select: {
                        id: true,
                        name: true,
                        season: true,
                        league: true,
                        level: true
                    }
                },
                createdAt: true,
                updatedAt: true
            },
            orderBy: { transferDate: 'desc' },
            take: pagination.limit,
        }
    }

    if (query.includeMedical === "true") {
        include.medicalHistory = {
            select: {
                id: true,
                injuryDate: true,
                recoveryDate: true,
                diagnosis: true,
                status: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { injuryDate: 'desc' },
            take: pagination.limit,
        }
    }

    if (query.includePhysical === "true") {
        include.physicalData = {
            select: {
                id: true,
                recordedDate: true,
                metricType: true,
                metricValue: true,
                unit: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { recordedDate: 'desc' },
            take: pagination.limit,
        }
    }

    if (query.includeMatchStats === "true") {
        include.matchStats = {
            select: {
                id: true,
                match: {
                    select: {
                        opponentName: true,
                        matchDate: true
                    }
                },
                goals: true,
                assists: true,
                shots: true,
                hits: true,
                plusMinus: true,
                penaltyMinutes: true,
                faceoffWins: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { match: { matchDate: "desc" } },
            take: pagination.limit,
        }
    }

    if (query.includeTrainingStats === "true") {
        include.trainingStats = {
            select: {
                id: true,
                training: {
                    select: {
                        startTime: true,
                        trainingType: true,
                        coach: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                coachRating: true,
                description: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { training: { startTime: 'desc' } },
            take: pagination.limit,
        }
    }

    if (query.includeReadinessIndex === "true") {
        include.readinessIndex = {
            select: {
                id: true,
                readinessValue: true,
                confidenceLevel: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' },
        }
    }

    return include
}

export const PlayerService = {
    async findAll({ organizationId, pagination, query }: any) {
        const { skip, limit } = pagination
        const where: PlayerWhereInput = buildPlayerWhereClause(query, organizationId)
        const include: PlayerInclude = buildIncludeClause(query)

        const [players, total] = await Promise.all([
            prisma.player.findMany({
                where,
                include,
                skip,
                take: limit,
                orderBy: {
                    [query.sortBy || "lastName"]: query.order || "desc"
                }
            }),
            prisma.player.count({ where })
        ])

        const transformedPlayers = players.map(player => ({
            id: player.id,
            lastName: player.lastName,
            firstName: player.firstName,
            middleName: player.middleName,
            photoUrl: player.photoUrl,
            birthDate: player.birthDate,
            position: player.position,
            height: player.height,
            weight: player.weight,
            contractType: player.contractType,
            contractExpiry: player.contractExpiry,
            currentTeamId: player.currentTeamId,
            createdAt: player.createdAt,
            updatedAt: player.updatedAt,
            ...(query.includeCurrentTeam === "true") && {
                currentTeam: player.currentTeam
            },
            ...(query.includeStats === "true" && player._count) && {
                totalMatches: player._count.matchStats,
                totalTrainings: player._count.trainingStats,
                totalTransfers: player._count.careerHistory,
                totalInjuries: player._count.medicalHistory,
                totalPhysical: player._count.physicalData
            }
        }))

        return {
            players: transformedPlayers,
            total
        }
    },

    async findById({ playerId, query, pagination }: any) {
        const include: PlayerInclude = buildSoloIncludeClause(query, pagination)

        const player = await prisma.player.findUnique({
            where: {
                id: Number(playerId)
            },
            include
        })

        if (!player) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Игрок не найден",
                "Ошибка при получении игрока по id"
            )
        }

        const result = {
            id: player.id,
            lastName: player.lastName,
            firstName: player.firstName,
            middleName: player.middleName,
            photoUrl: player.photoUrl,
            birthDate: player.birthDate,
            position: player.position,
            height: player.height,
            weight: player.weight,
            contractType: player.contractType,
            contractExpiry: player.contractExpiry,
            currentTeamId: player.currentTeamId,
            createdAt: player.createdAt,
            updatedAt: player.updatedAt,

            ...(query.includeTransfers === "true" && { transfers: player.careerHistory }),
            ...(query.includeMedical === "true" && { medicalHistory: player.medicalHistory }),
            ...(query.includePhysical === "true" && { physicalData: player.physicalData }),
            ...(query.includeMatchStats === "true" && { matchStats: player.matchStats }),
            ...(query.includeTrainingStats === "true" && { trainingStats: player.trainingStats }),
            ...(query.includeReadinessIndex === "true" && { readinessIndex: player.readinessIndex?.[0] }),
        }

        return result
    },

    async create(data: any) {
        const { firstName, lastName, middleName, birthDate, position, height, weight, contractExpiry, contractType, currentTeamId, photoUrl } = data
        if (!lastName || !firstName || !birthDate || !contractExpiry || !contractType) {
            throw new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поля lastName, firstName, birthDate обязательны",
                "Ошибка при создании нового игрока"
            )
        }
        const newPlayer = await prisma.player.create({
            data: {
                firstName,
                lastName,
                middleName,
                birthDate: new Date(birthDate),
                position,
                photoUrl: photoUrl || null,
                height: Number(height),
                weight: Number(weight),
                contractType,
                contractExpiry: new Date(contractExpiry),
                currentTeamId: Number(currentTeamId)
            }
        })

        return newPlayer
    },
    async update(playerId: number, data: any) {
        const { birthDate, height, weight, contractExpiry, currentTeamId, ...rest } = data
        const updatedPlayer = await prisma.player.update({
            where: {
                id: playerId
            },
            data: {
                ...rest,
                ...(birthDate !== undefined && { birthDate: new Date(birthDate) }),
                ...(height !== undefined && { height: Number(height) }),
                ...(weight !== undefined && { weight: Number(weight) }),
                ...(contractExpiry !== undefined && { contractExpiry: new Date(contractExpiry) }),
                ...(currentTeamId !== undefined && { currentTeamId: Number(currentTeamId) }),
            }
        })

        return updatedPlayer
    },
    async delete(playerId: number){
        await prisma.player.delete({
            where: {
                id: playerId
            }
        })
    }
}
