import type { PhysicalDataWhereInput } from "../generated/prisma/models"
import { prisma } from "../lib/prisma";

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
    }
}
