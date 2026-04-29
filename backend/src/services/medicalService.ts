import type { MedicalHistoryWhereInput } from "../generated/prisma/models"
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";

const buildMedicalWhereClause = (query: any, playerId: number) => {
    const where: MedicalHistoryWhereInput = {}

    const { recoveryDate } = query

    where.playerId = Number(playerId)

    if (recoveryDate) {
        where.recoveryDate = new Date(recoveryDate as string)
    }

    return where
}

export const MedicalService = {
    async findByPlayer({playerId, pagination, filters}: any){
        const {skip, limit} = pagination
        const where = buildMedicalWhereClause(filters, playerId)

        const [records, total] = await Promise.all([
            prisma.medicalHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [filters.sortBy || "recoveryDate"]: filters.order || "desc"
                }
            }),
            prisma.medicalHistory.count({ where })
        ])
        return {
            records,
            total
        }
    },
    async recoverPlayer(id: string){
        const record = await prisma.medicalHistory.update({
            where:{
                id: Number(id)
            },
            data: {
                status: "recovered",
                recoveryDate: new Date()
            }
        })

        return record
    },
    async create(playerId: number, data: any, {organizationId, currentUserTeam, isAdmin}: any){
        const { injuryDate, recoveryDate, diagnosis, status } = data
        const player = await prisma.player.findUnique({
            where: { id: playerId },
            select: { currentTeam: { select: { organizationId: true } }, currentTeamId: true }
        });

        if (!player) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Игрок не найден",
                "Ошибка при добавлении медицинской записи игроку"
            )
        }
        if (player.currentTeam?.organizationId !== organizationId) {
            throw new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Вы не можете добавлять медицинские записи игрокам чужой организации",
                "Ошибка при добавлении медицинской записи игроку"
            )
        }

        if (!isAdmin && currentUserTeam !== player.currentTeamId) {
            throw new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Вы не можете добавлять медицинские записи игрокам чужой команды",
                "Ошибка при добавлении медицинской записи игроку"
            )
        }

        const newMedical = await prisma.medicalHistory.create({
            data: {
                playerId: Number(playerId),
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

        return newMedical
    }

}
