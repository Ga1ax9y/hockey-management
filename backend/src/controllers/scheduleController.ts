import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import type { Prisma } from "../generated/prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const buildMatchWhereClause = (query: any, organizationId: number) => {
  const where: Prisma.MatchWhereInput = {
    myTeam: { organizationId },
  };

  const { teamId, startDate, endDate, matchStatus, opponentName } = query;

  if (teamId) where.myTeamId = Number(teamId);

  if (startDate || endDate) {
    where.matchDate = {};
    if (startDate) where.matchDate.gte = new Date(startDate as string);
    if (endDate) where.matchDate.lte = new Date(endDate as string);
  }

  if (matchStatus) where.status = matchStatus as string;

  if (opponentName) {
    where.opponentName = {
      contains: opponentName as string,
      mode: "insensitive",
    };
  }

  return where;
};

export const buildTrainingWhereClause = (
  query: any,
  organizationId: number,
) => {
  const where: Prisma.TrainingWhereInput = {
    team: { organizationId },
  };

  const { teamId, startDate, endDate, trainingType } = query;

  if (teamId) where.teamId = Number(teamId);

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate as string);
    if (endDate) where.startTime.lte = new Date(endDate as string);
  }

  if (trainingType) where.trainingType = trainingType as string;

  return where;
};

export const getSchedule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = req.user?.organization.id;
    console.log(organizationId)

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
    const matchWhere = buildMatchWhereClause(req.query, organizationId);
    const trainingWhere = buildTrainingWhereClause(req.query, organizationId);

    const [matches, trainings] = await Promise.all([
      prisma.match.findMany({
        where: matchWhere,
        orderBy: { matchDate: "asc" },
      }),
      prisma.training.findMany({
        where: trainingWhere,
        orderBy: { startTime: "asc" },
      }),
    ]);
    const events = [
      ...matches.map((m) => ({
        id: `match-${m.id}`,
        title: `Матч: ${m.opponentName}`,
        start: m.matchDate,
        type: "MATCH",
        extendedProps: {
          location: m.location,
          isHome: m.isHomeGame,
          score: `${m.myScore}:${m.opponentScore}`,
          status: m.status,
        },
      })),
      ...trainings.map((t) => ({
        id: `training-${t.id}`,
        title: `Тренировка: ${t.trainingType}`,
        start: t.startTime,
        end: t.endTime,
        type: "TRAINING",
        extendedProps: {
          location: t.location,
          trainingType: t.trainingType,
        },
      })),
    ];
    res.json({
            status: "success",
            results: events.length,
            data: events
    });
  } catch (error: any) {
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
