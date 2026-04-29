import type { PhysicalDataWhereInput } from "../generated/prisma/models"
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";

const buildPhysicalWhereClause = (query: any, playerId: number) => {
    const where: PhysicalDataWhereInput = {}

    const { recordedDate } = query

    where.playerId = Number(playerId)

    if (recordedDate) {
        where.recordedDate = new Date(recordedDate as string)
    }

    return where
}

export const PhysicalService = {
    async findByPlayer({playerId, pagination, filters}: any){
        const {skip, limit} = pagination
        const where = buildPhysicalWhereClause(filters, playerId)

        const [records, total] = await Promise.all([
            prisma.physicalData.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [filters.sortBy || "recordedDate"]: filters.order || "desc"
                }
            }),
            prisma.physicalData.count({ where })
        ])
        return {
            records,
            total
        }
    },
    async create(playerId: number, data: any, {organizationId, currentUserTeam, isAdmin}: any){
        const { recordedDate, metricType, metricValue, unit } = data

        const player = await prisma.player.findUnique({
            where: { id: playerId },
            select: { currentTeam: { select: { organizationId: true } }, currentTeamId: true }
        });

        if (!player) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Игрок не найден",
                "Ошибка при добавлении физического показателя игроку"
            )
        }
        if (player.currentTeam?.organizationId !== organizationId) {
            throw new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Вы не можете добавлять показатели игрокам чужой организации",
                "Ошибка при добавлении физического показателя игроку"
            )
        }

        if (!isAdmin && currentUserTeam !== player.currentTeamId) {
            throw new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Вы не можете добавлять показатели игрокам чужой команды",
                "Ошибка при добавлении физического показателя игроку"
            )
        }

        const newPhysical = await prisma.physicalData.create({
            data: {
                playerId: Number(playerId),
                recordedDate: new Date(recordedDate),
                metricType,
                metricValue: Number(metricValue),
                unit
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

        return newPhysical
    }
}
