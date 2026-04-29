import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../middlewares/authMiddleware"
import { CareerService } from "../services/careerService"
import { AppError, commonErrorDict } from "../types/AppError"

export const changePlayerTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id: playerId } = req.params
        const { newTeamId } = req.body
        const organizationId = req.user?.organization.id

        if (!organizationId) {
            throw new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "Нет организации",
                "Ошибка смены команды"
            )
        }
        const updatedPlayer = await CareerService.changeTeam(
            Number(playerId),
            Number(newTeamId),
            Number(organizationId)
        )


        res.json(updatedPlayer)
    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(
            commonErrorDict.serverError.name,
            commonErrorDict.serverError.httpCode,
            error.message,
            "Ошибка смены команды"
        ))
    }

}
