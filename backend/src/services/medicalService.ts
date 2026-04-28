import type { MedicalHistoryWhereInput } from "../generated/prisma/models"
import { prisma } from "../lib/prisma";

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
    }

}
