import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import { getPagination } from "../services/pagination";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { updateFinishedMatches } from "../services/matchService";

export const getAllMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const { page, limit, skip } = getPagination(req.query)

        await updateFinishedMatches()

        const matches = await prisma.match.findMany({
            where: {myTeam: {organizationId: req.user!.organization.id}},
            select: {
                id: true,
                matchDate: true,
                location: true,
                myTeam: true,
                myTeamId: true,
                opponentName: true,
                isHomeGame: true,
                myScore: true,
                opponentScore: true,
                matchType: true,
                season: true,
                status: true,
                createdAt: true,
                updatedAt: true

            }
        })
        // TODO:  ADD  PAGINATION
        res.json({
            data: matches
        })
    }
    catch(error: any){
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении всех матчей"
        ))
    }
}

export const getMatchById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const match = await prisma.match.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                matchDate: true,
                location: true,
                myTeam: true,
                myTeamId: true,
                opponentName: true,
                isHomeGame: true,
                myScore: true,
                opponentScore: true,
                matchType: true,
                season: true,
                status: true,
                createdAt: true,
                updatedAt: true

            },
        })
        if (!match){
            return next(
                new AppError(
                    commonErrorDict.resourceNotFound.name,
                    commonErrorDict.resourceNotFound.httpCode,
                    "Матч не найден",
                    "Ошибка при получении матча по id"
                )
            );
        }
        res.json(match)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при получении матча по id"
        ))
    }
}

export const createMatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {matchDate, location, myTeamId, opponentName, isHomeGame, matchType, season  } = req.body
        console.log(matchDate, location, myTeamId, opponentName, isHomeGame, matchType, season)
        if (!matchDate || !location || myTeamId === undefined || !opponentName || isHomeGame === undefined || !matchType || !season) {
            return next(new AppError(
                commonErrorDict.serverError.name,
                commonErrorDict.serverError.httpCode,
                'Поля matchDate, location, myTeamId, opponentName, isHomeGame, matchType, season обязательны для заполнения',
                "Ошибка при создании матча"
            ));
        }

        const newMatch = await prisma.match.create({
            data: {
                matchDate: new Date(matchDate),
                location,
                myTeamId: Number(myTeamId),
                opponentName,
                isHomeGame: Boolean(isHomeGame),
                matchType,
                season,
            }
        })
        res.status(201).json(newMatch)

    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при создании матча"
        ))
    }
}

export const updateMatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const {matchDate, location, myTeamId, opponentName, isHomeGame, matchType, season  } = req.body
        const updatedMatch = await prisma.match.update({
            where: {
                id: Number(id)
            },
            data: {
                matchDate: new Date(matchDate),
                location,
                myTeamId: Number(myTeamId),
                opponentName,
                isHomeGame: Boolean(isHomeGame),
                matchType,
                season,
            }
        })
        res.json(updatedMatch)
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при обновлении матча"
        ))
    }
}

export const completeMatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { myScore, opponentScore } = req.body;
        console.log(myScore, opponentScore);

        const completedMatch = await prisma.match.update({
            where: {
                id: Number(id)
            },
            data: {
                myScore: Number(myScore),
                opponentScore: Number(opponentScore),
            }
        });

        res.json(completedMatch);
    }
    catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при сохранении результатов матча"
        ));
    }
};

export const deleteMatch = async (req: Request, res: Response, next:  NextFunction) => {
    try {
        const { id } = req.params
        await prisma.match.delete({
            where: {
                id: Number(id)
            }
        })
        res.json({
            message: `Матч с id ${id} успешно удален`
        })
    } catch (error: any) {
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка при удалении матча"
        ))
    }
}
