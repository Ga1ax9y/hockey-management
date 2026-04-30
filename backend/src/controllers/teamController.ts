import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { Prisma } from "../generated/prisma/client";
import { getPagination } from "../helpers/pagination";
import { paginatedResponse } from "../helpers/paginatedResponse";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { TeamService } from "../services/teamService";

export const getAllTeams = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const { page, limit, skip } = getPagination(req.query)

        const organizationId = req.user?.organization.id

        if (!organizationId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не привязан к организации",
                "Ошибка при получении команд"
            ));
        }

        const { teams, total } = await TeamService.findAll({
            organizationId,
            pagination: { skip, limit },
            query: req.query

        })
        res.json(
            paginatedResponse(teams, total, page, limit)
        )
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении всех команд"
        ))
    }
}

export const getTeamById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const isStaff = ['ADMIN', 'MANAGER'].includes(req.user!.role.code);
        const organizationId = req.user?.organization.id

        if (!isStaff && req.user?.teamId !== Number(id)) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не принадлежит к этой команде",
                "Ошибка при получении команд"
            ));
        }

        if (!organizationId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не привязан к организации",
                "Ошибка при получении команд"
            ));
        }


        const team = await TeamService.findById({
            teamId: Number(id),
            organizationId,
            query: req.query
        })

        res.json(team)
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении команды по id"
        ))
    }
}

export const createTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.user?.organization.id

        if (!organizationId) {
            return next(new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Пользователь не привязан к организации",
                "Ошибка при получении команд"
            ));
        }

        const newTeam = await TeamService.create(req.body, Number(organizationId))

        res.status(201).json(newTeam)

    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании команды"
        ))
    }
}

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const updatedTeam = await TeamService.update(Number(id), req.body)

        res.json(updatedTeam)
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении команды"
        ))
    }
}

export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        await TeamService.delete(Number(id))
        res.json({
            message: `Команда с id ${id} успешно удален`
        })
    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении команды"
        ))
    }
}

export const addUserToTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: teamId } = req.params
        const { userId } = req.body

        const userTeam = await TeamService.addUser(Number(teamId), Number(userId))

        res.status(201).json({
            success: true,
            message: "Пользователь успешно добавлен в команду",
            data: userTeam
        });
    }
    catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при добавлении пользователя в команды"
        ));
    }
}

export const removeUserFromTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: teamId, userId } = req.params;

        await TeamService.removeUser(Number(teamId), Number(userId))

        res.json({
            success: true,
            message: "Пользователь успешно удалён из команды",
            deleted: {
                userId: Number(userId),
                teamId: Number(teamId)
            }
        });

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении пользователя из команды"
        ));
    }
};
