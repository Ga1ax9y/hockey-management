import type { NextFunction, Request, Response } from "express";
import { AppError, commonErrorDict } from "../types/AppError";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { ScheduleService } from "../services/scheduleService";
import { MatchService } from "../services/matchService";

export const getSchedule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teamIdFromParams = Number(req.params.teamId);
    const organizationId = req.user?.organization.id;

    if (!organizationId) {
      return next(
        new AppError(
          commonErrorDict.unauthorized.name,
          commonErrorDict.unauthorized.httpCode,
          "Пользователь не привязан к организации",
          "Ошибка доступа",
        ),
      );
    }
    //  todo cron
    await MatchService.autoCloseOldMatches()

    const events = await ScheduleService.findAll({
      query: req.query,
      user: req.user,
      organizationId,
      teamIdFromParams: Number(teamIdFromParams)
    })
    res.json({
      status: "success",
      results: events.length,
      data: events,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(
      new AppError(
        commonErrorDict.serverError.name,
        commonErrorDict.serverError.httpCode,
        error.message,
        "Ошибка при получении расписания",
      ),
    );
  }
};
