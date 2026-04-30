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
                    role: {
                        select: {
                            name: true
                        }
                    }

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
                role: {
                    select: {
                        name: true,
                        code: true
                    }
                }

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
        const { email, password, fullName, roleId } = data
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
                passwordHash: hashedPassword,
                roleId: Number(roleId),
                organizationId
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                roleId: true,
                createdAt: true
            }
        })

        return user
    }
}
