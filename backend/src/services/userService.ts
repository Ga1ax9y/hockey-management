import { prisma } from "../lib/prisma"
import { AppError, commonErrorDict } from "../types/AppError"
import bcrypt from "bcrypt"

export const UserService = {
    async findAll({ pagination, organizationId }: any) {
        const { skip, limit } = pagination

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: { organizationId },
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    avatarUrl: true,
                    role: {
                        select: {
                            name: true
                        }
                    },
                    createdAt: true

                }
            }),
            prisma.user.count({ where: { organizationId } })
        ])

        return {
            users,
            total
        }
    },

    async findById(userId: number) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                role: {
                    select: {
                        name: true,
                        code: true
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true

            }
        })

        if (!user) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Пользователь не найден",
                "Ошибка при получении пользователя по id"
            )
        }

        return user
    },

    async create(data: any, organizationId: number) {
        const { email, password, fullName, roleId, avatarUrl } = data
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            throw new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "email уже занят",
                "Ошибка при создании пользователя"
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                avatarUrl: avatarUrl || null,
                passwordHash: hashedPassword,
                roleId: Number(roleId),
                organizationId
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                roleId: true,
                avatarUrl: true,
                createdAt: true
            }
        })

        return user
    },
    async update(userId: number, data: any) {
        const { roleId, password, oldPassword, ...rest } = data;
        const updatePayload: any = { ...rest };

        if (password) {
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user)
                throw new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Пользователь не найден",
                    "Ошибка безопасности"
                );

            if (oldPassword) {
                const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

                if (!isMatch) {
                    throw new AppError(
                        commonErrorDict.badRequest.name,
                        commonErrorDict.badRequest.httpCode,
                        "Текущий пароль введен неверно",
                        "Ошибка безопасности"
                    );
                }
                updatePayload.passwordHash = await bcrypt.hash(password, 10);
            }
        }

        if (roleId !== undefined) {
            updatePayload.roleId = Number(roleId);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updatePayload,
            select: {
                id: true,
                email: true,
                fullName: true,
                roleId: true,
                role: {
                    select: {
                        name: true
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                avatarUrl: true,
                createdAt: true,
                updatedAt: true
            },

        });

        return updatedUser;
    }
}
