import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import type { Prisma } from "../generated/prisma/client";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { PlayerService } from "../services/playerService";

export const getAllPlayers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const { page, limit, skip } = getPagination(req.query)

        if (!req.user?.organization.id) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не привязан к организации",
                "Ошибка при получении команд"
            ));
        }

        const { players, total } = await PlayerService.findAll({
            organizationId: req.user.organization.id,
            pagination: { skip, limit },
            query: req.query
        })

        res.json(paginatedResponse(players, total, page, limit))

    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении игроков"
        ))
    }
}

export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const pagination = getPagination(req.query)

        const player = await PlayerService.findById({
            playerId: id,
            pagination,
            query: req.query
        })

        res.json(player)
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении игрока по id"
        ))
    }
}

export const createPlayer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const newPlayer = await PlayerService.create(req.body)
        res.status(201).json(newPlayer)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании нового игрока"
        ))
    }
}

export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const updatedPlayer = await PlayerService.update(Number(id), req.body )
        res.json(updatedPlayer)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении игрока"
        ))
    }
}

export const deletePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        await PlayerService.delete(Number(id))
        res.json({
            message: `Игрок с id ${id} успешно удален`
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении игрока"
        ))
    }
}
