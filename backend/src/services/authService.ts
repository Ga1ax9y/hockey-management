import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string;

export const AuthService = {
    async registerUser(data: any) {
        const { email, password, fullName, organizationName } = data

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

        return await prisma.$transaction(async (tx) => {
            const newOrganization = await prisma.organization.create({
                data: {
                    name: organizationName
                }
            })

            const adminRole = await prisma.role.findUnique({ where: { code: "ADMIN" } });
            if (!adminRole) throw new Error("Роль ADMIN не найдена");

            return await tx.user.create({
                data: {
                    email,
                    fullName,
                    passwordHash: hashedPassword,
                    roleId: adminRole.id,
                    organizationId: newOrganization.id
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    roleId: true,
                    organization: true,
                    createdAt: true
                }
            })
        })
    },

    async loginUser({ email, password }: any) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true, organization: true }
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Неверный почтовый адрес или пароль",
                "Ошибка сервера при входе"
            )
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                roleId: user.roleId,
                organizationId: user.organizationId
            },
            JWT_SECRET,
            { expiresIn: "7d" }

        );
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role.name,
                organization: {
                    id: user.organization.id,
                    name: user.organization.name
                }
            }
        }
    },

    async getUserInfo(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                role: {
                    select: {
                        name: true,
                        code: true
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                userTeams: {
                    select: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                league: true
                            }
                        }
                    }
                }

            }
        })

        if (!user) {
            throw new AppError(
                commonErrorDict.resourceNotFound.name,
                commonErrorDict.resourceNotFound.httpCode,
                "Пользователь не найден",
                "Ошибка при получении данных пользователя"
            )
        }
        const { userTeams, ...userWithoutTeams } = user;

        return {
            ...userWithoutTeams,
            teams: userTeams.map(ut => ut.team)
        };
    }
}
