import type { RoleWhereInput } from "../generated/prisma/models";
import { prisma } from "../lib/prisma";

export const RoleService = {
    async findAll(pagination: any) {
        const { skip, limit } = pagination
        const where: RoleWhereInput = {}

        const [roles, total] = await Promise.all([
            prisma.role.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    name: 'asc'
                }
            }),
            prisma.role.count({ where })
        ])

        return {
            roles,
            total
        }
    },
    async findById(id: string){
        const role = await prisma.role.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                createdAt: true,
                updatedAt: true

            }
        })
        if (!role) return null

        return role
    }
}
