import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { error } from "node:console";

export const getAllPlayers = async (req: Request, res: Response) => {
    try{
        const players = await prisma.player.findMany({
            select: {
                id: true,
                lastName: true,
                firstName: true,
                middleName: true,
                birthDate: true,
                position: true,
                height: true,
                weight: true,
                contractExpiry: true,
                currentTeam: {
                    select: {
                        name: true
                    }
                },
                createdAt: true,
                updatedAt: true


            }
        })
        res.json(players)
    }
    catch(error: any){
        res.status(500).json({
            error: error.message,
            description: "Ошибка при получении игроков"
         });
    }
}

export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const player = await prisma.player.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                lastName: true,
                firstName: true,
                middleName: true,
                birthDate: true,
                position: true,
                height: true,
                weight: true,
                contractExpiry: true,
                currentTeam: {
                    select: {
                        name: true
                    }
                },
                createdAt: true,
                updatedAt: true


            }
        })
        if (!player){
            return next(
                new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Игрок не найден"
                )
            );
        }
        res.json(player)
    }
    catch (error: any) {
        next(error)
    }
}

export const createPlayer = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, middleName, birthDate, position, height, weight, contractExpiry, currentTeamId } = req.body

        if (!lastName || !firstName || !birthDate) {
            return res.status(400).json({
                error: "Поля lastName, firstName, birthDate обязательны"
            });
        }

        //TODO: перевод даты
        const newPlayer = await prisma.player.create({
            data: {
                firstName,
                lastName,
                middleName,
                birthDate: new Date(birthDate),
                position,
                height,
                weight,
                contractExpiry: new Date(contractExpiry),
                currentTeamId
            }
        })
        res.status(201).json(newPlayer)

    } catch (error: any) {
        res.status(500).json({
            error: error.message,
            description: "Ошибка при создании нового игрока"
         });
    }
}

export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { firstName, lastName, middleName, birthDate, position, height, weight, contractExpiry, currentTeamId } = req.body
        const updatedPlayer = await prisma.player.update({
            where: {
                id: Number(id)
            },
            data: {
                firstName,
                lastName,
                middleName,
                birthDate: new Date(birthDate),
                position,
                height,
                weight,
                contractExpiry: new Date(contractExpiry),
                currentTeamId
            }
        })
        res.json(updatedPlayer)
    }
    catch (error: any) {
        next(error)
    }
}

export const deletePlayer = async (req: Request, res: Response, next:  NextFunction) => {
    try {
        const { id } = req.params
        await prisma.player.delete({
            where: {
                id: Number(id)
            }
        })
        res.json({
            message: `Игрок с id ${id} успешно удален`
        })
    } catch (error: any) {
        if (error.code === 'P2003') {
            return res.status(400).json({
                error: error.message,
                description: "Нельзя удалить игрока, так как он  имеет связи с другими таблицами" });
        }
        else if (error.code === 'P2025') {
            return next(
                new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Игрок для удаления не найден"
                )
            );
        }
        res.status(500).json({
            error: error.message,
            description: "Ошибка при удалении игрока"
        })
    }
}
