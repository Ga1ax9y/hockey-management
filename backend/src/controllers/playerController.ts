import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import type { Prisma } from "../generated/prisma/client";
import { getPagination } from "../services/pagination";
import type { PlayerInclude, PlayerWhereInput } from "../generated/prisma/models";
import { paginatedResponse } from "../services/paginatedResponse";
import type { AuthRequest } from "../middlewares/authMiddleware";

const buildPlayerWhereClause = (query: any) => {
    const where: Prisma.PlayerWhereInput = {}

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

    if (search){
        where.lastName = { contains: search as string, mode: "insensitive"}
    }

    if (position){
        where.position = position as string
    }

    if (currentTeamId){
        where.currentTeamId = Number(currentTeamId)
    }

    if (minHeight || maxHeight){
        where.height = {}
        if (minHeight) where.height.gte = Number(minHeight)
        if (maxHeight) where.height.lte = Number(maxHeight)
    }

    if (minWeight || maxWeight){
        where.weight = {}
        if (minWeight) where.weight.gte = Number(minWeight)
        if (maxWeight) where.weight.lte = Number(maxWeight)
    }

    if (contractExpiryLte){
        where.contractExpiry = { lte: new Date(contractExpiryLte as string)}
    }

    return where

}
export const getAllPlayers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            sortBy = "lastName",
            order = "desc",
            includeCurrentTeam,
            includeStats,
            ...filters
        } = req.query
        const { page, limit, skip } = getPagination(req.query)

        const where: PlayerWhereInput = buildPlayerWhereClause(filters)

        if (!req.user?.organization.id) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не привязан к организации",
                "Ошибка при получении команд"
            ));
        }
        where.currentTeam = {
            is: {
                organizationId: req.user.organization.id
            }
        }

        if (filters.hasTransfers === "true"){
            where.careerHistory = { some: {}}
        }
        else if (filters.hasTransfers === "false"){
            where.careerHistory = { none: {}}
        }

        const include: PlayerInclude = {}

        if (includeCurrentTeam === "true"){
            include.currentTeam = {
                select: {
                    id: true,
                    name: true,
                    league: true
                }
            }
        }
        if (includeStats === "true"){
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

        const [players, total] = await Promise.all([
            prisma.player.findMany({
                where,
                include,
                skip,
                take: limit,
                orderBy: {
                    [sortBy as string]: order
                }
            }),
            prisma.player.count({where})
        ])
        const transformedPlayers = players.map(player => ({
            id: player.id,
            lastName: player.lastName,
            firstName: player.firstName,
            middleName: player.middleName,
            birthDate: player.birthDate,
            position: player.position,
            height: player.height,
            weight: player.weight,
            contractType: player.contractType,
            contractExpiry: player.contractExpiry,
            currentTeamId: player.currentTeamId,
            createdAt: player.createdAt,
            updatedAt: player.updatedAt,
            ...(includeCurrentTeam === "true") && {
                currentTeam: player.currentTeam
            },
            ...(includeStats === "true" && player._count) && {
                totalMatches: player._count.matchStats,
                totalTrainings: player._count.trainingStats,
                totalTransfers: player._count.careerHistory,
                totalInjuries: player._count.medicalHistory,
                totalPhysical: player._count.physicalData
            }
        }))

        res.json(paginatedResponse(transformedPlayers, total, page, limit))

    }
    catch(error: any){
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении игроков"
        ))
    }
}

export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const {
            includeMedical = "false",
            includeTransfers = "false",
            includePhysical = "false",
            includeMatchStats = "false",
            includeTrainingStats = "false",
            includeReadinessIndex = "false",
            limit = "10"
        } = req.query
        const limitNum = Math.min(25, Math.max(1, Number(limit)))
        const include: Prisma.PlayerInclude = {}

        if (includeTransfers === "true"){
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
                    toTeam:{
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
                orderBy: { transferDate: 'desc'},
                take: limitNum
            }
        }

        if (includeMedical === "true"){
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
                orderBy: {injuryDate: 'desc'},
                take: Number(limitNum)
            }
        }

        if (includePhysical === "true"){
            include.physicalData = {
                select: {
                    id:true,
                    recordedDate: true,
                    metricType: true,
                    metricValue: true,
                    unit: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {recordedDate: 'desc'},
                take: limitNum
            }
        }

        if (includeMatchStats === "true"){
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
                orderBy: { match: {matchDate: "desc"} },
                take: limitNum
            }
        }

        if (includeTrainingStats === "true"){
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
                orderBy: {training: {startTime: 'desc'}},
                take: limitNum
            }
        }

        if (includeReadinessIndex === "true"){
            include.readinessIndex =  {
                select: {
                    id: true,
                    readinessValue: true,
                    confidenceLevel: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc'}
            }
        }

        const player = await prisma.player.findUnique({
            where: {
                id: Number(id)
            },
            include
        })

        if (!player){
            return next(
                new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Игрок не найден",
                    "Ошибка при получении игрока по id"
                )
            );
        }
        const response = {
            id: player.id,
            lastName: player.lastName,
            firstName: player.firstName,
            middleName: player.middleName,
            birthDate: player.birthDate,
            position: player.position,
            height: player.height,
            weight: player.weight,
            contractType: player.contractType,
            contractExpiry: player.contractExpiry,
            currentTeamId: player.currentTeamId,
            createdAt: player.createdAt,
            updatedAt: player.updatedAt,

            ...(includeTransfers === "true" && { transfers: player.careerHistory }),
            ...(includeMedical === "true" && { medicalHistory: player.medicalHistory }),
            ...(includePhysical === "true" && { physicalData: player.physicalData }),
            ...(includeMatchStats === "true" && { matchStats: player.matchStats }),
            ...(includeTrainingStats === "true" && { trainingStats: player.trainingStats }),
            ...(includeReadinessIndex === "true" && { readinessIndex: player.readinessIndex?.[0] }),
        }

        res.json(response)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении игрока по id"
        ))
    }
}

export const createPlayer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, middleName, birthDate, position, height, weight, contractExpiry, contractType, currentTeamId } = req.body

        if (!lastName || !firstName || !birthDate) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поля lastName, firstName, birthDate обязательны",
                "Ошибка при создании нового игрока"
            ))
        }


        const newPlayer = await prisma.player.create({
            data: {
                firstName,
                lastName,
                middleName,
                birthDate: new Date(birthDate),
                position,
                height,
                weight,
                contractType,
                contractExpiry: new Date(contractExpiry),
                currentTeamId
            }
        })
        res.status(201).json(newPlayer)

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании нового игрока"
        ))
    }
}

export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { firstName, lastName, middleName, birthDate, position, height, weight, contractType, contractExpiry, currentTeamId } = req.body
        const updatedPlayer = await prisma.player.update({
            where: {
                id: Number(id)
            },
            data: {
                firstName,
                lastName,
                middleName,
                birthDate: new Date(birthDate),
                position,
                height,
                weight,
                contractType,
                contractExpiry: new Date(contractExpiry),
                currentTeamId
            }
        })
        res.json(updatedPlayer)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении игрока"
        ))
    }
}

export const deletePlayer = async (req: Request, res: Response, next:  NextFunction) => {
    try {
        const { id } = req.params
        await prisma.player.delete({
            where: {
                id: Number(id)
            }
        })
        res.json({
            message: `Игрок с id ${id} успешно удален`
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении игрока"
        ))
    }
}

export const addMedicalRecord = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        if (!id) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Поле userId обязательно",
                "Ошибка при добавлении пользователя в команду"
            ));
        }
        const { injuryDate, recoveryDate, diagnosis, status } = req.body

        const newMedical = await prisma.medicalHistory.create({
            data: {
                playerId: Number(id),
                injuryDate: new Date(injuryDate),
                recoveryDate: recoveryDate ? new Date(recoveryDate) : null,
                diagnosis: diagnosis,
                status: status
            },
            include: {
                player: {
                    select: {
                        lastName: true,
                        firstName: true,
                        position: true,
                        currentTeam: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
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
            "Ошибка при удалении игрока"
        ))
    }
}

export const changePlayerTeam  = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id: playerId} = req.params
        const { newTeamId } = req.body

        if (!req.user?.organization?.id) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Нет организации",
                "Ошибка смены команды"
            ))
        }
        const player = await prisma.player.findFirst({
            where: {
                id: Number(playerId),
                currentTeam: {
                    organizationId: req.user.organization.id
                }
            }
        })

        if (!player) {
            return next(new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Игрок не найден",
                "Ошибка смены команды"
            ))
        }
        if (!["TWO_WAY", "ENTRY_LEVEL"].includes(player.contractType)) {
            return next(new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Нельзя менять команду для этого типа контракта",
                "Ошибка смены команды"
            ))
        }

        const newTeam = await prisma.team.findFirst({
            where: {
                id: Number(newTeamId),
                organizationId: req.user.organization.id
            }
        })

        if (!newTeam) {
            return next(new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Команда не найдена",
                "Ошибка смены команды"
            ))
        }
        const updatedPlayer = await prisma.player.update({
            where: { id: Number(playerId) },
            data: {
                currentTeamId: Number(newTeamId)
            }
        })

        await prisma.playerCareerHistory.create({
            data: {
                playerId: Number(playerId),
                transferDate: new Date(),
                transferType: "internal",
                fromTeamId: player.currentTeamId,
                toTeamId: Number(newTeamId)
            }
        })

        res.json(updatedPlayer)
    } catch (error: any){
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка смены команды"
        ))
    }

}
