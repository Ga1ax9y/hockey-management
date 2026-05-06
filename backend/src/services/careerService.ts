import type { PlayerCareerHistoryWhereInput } from "../generated/prisma/models"
import { prisma } from "../lib/prisma"
import { AppError, commonErrorDict } from "../types/AppError"

const buildTransferWhereClause = (query: any, playerId: number) => {
    const where: PlayerCareerHistoryWhereInput = {}

    const { goals } = query

    where.playerId = Number(playerId)


    return where
}

export const CareerService = {

    async findByPlayer({ playerId, pagination, filters }: any) {
        const { skip, limit } = pagination
        const where = buildTransferWhereClause(filters, playerId)

        const [transfers, total] = await Promise.all([
            prisma.playerCareerHistory.findMany({
                where,
                include: {
                    player: { select: { firstName: true, lastName: true } },
                    fromTeam: { select: { name: true } },
                    toTeam: { select: { name: true } },
                },
                skip,
                take: limit,
                orderBy: {
                     [filters.sortBy || "transferDate" ]: filters.order || "desc"
                }
            }),
            prisma.playerCareerHistory.count({ where })
        ])
        return {
            transfers,
            total
        }
    },
    async changeTeam(playerId: number, newTeamId: number, organizationId: number) {

        const player = await prisma.player.findFirst({
            where: {
                id: playerId,
                currentTeam: {
                    organizationId
                }
            }
        })

        if (!player) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Игрок не найден",
                "Ошибка смены команды"
            )
        }
        if (!["TWO_WAY", "ENTRY_LEVEL"].includes(player.contractType)) {
            throw new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Нельзя менять команду для этого типа контракта",
                "Ошибка смены команды"
            )
        }

        const newTeam = await prisma.team.findFirst({
            where: {
                id: Number(newTeamId),
                organizationId
            }
        })

        if (!newTeam) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Команда не найдена",
                "Ошибка смены команды"
            )
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

        return updatedPlayer
    }
}
