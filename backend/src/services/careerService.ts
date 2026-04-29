import { prisma } from "../lib/prisma"
import { AppError, commonErrorDict } from "../types/AppError"

export const CareerService = {
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
