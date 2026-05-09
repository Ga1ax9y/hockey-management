import { prisma } from "../lib/prisma";

export const AuditService = {
    async findAll({ userId, entityType, pagination }: any) {
        const { skip, limit } = pagination;

        const where: any = {};
        if (userId) where.userId = userId;
        if (entityType) where.entityType = entityType;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.auditLog.count({ where })
        ]);

        return {
            logs,
            total
        };
    },
    async logAction({
        userId,
        action,
        entityType,
        entityId,
        oldValues = {},
        newValues = {}
    }: {
        userId: number | null;
        action: string;
        entityType: string;
        entityId: number;
        oldValues?: any;
        newValues?: any;
    }) {
        try {
            return await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entityType,
                    entityId,
                    oldValues,
                    newValues,
                    timestamp: new Date()
                }
            });
        } catch (error) {
            console.error("Ошибка: не удалось создать лог", error);
        }
    }
};
