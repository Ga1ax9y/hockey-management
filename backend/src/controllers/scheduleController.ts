import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";
import type { Prisma } from "../generated/prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { updateFinishedMatches } from "../services/matchService";

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
    const teamIdFromParams = Number(req.params.teamId);
    const user = req.user;
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

    let targetTeamId: number;

    const isStaff = ["ADMIN", "MANAGER"].includes(user!.role.code);

    if (!isStaff && teamIdFromParams !== user?.teamId) {
      return next(
        new AppError(
          commonErrorDict.unauthorized.name,
          commonErrorDict.unauthorized.httpCode,
          "У вас нет прав на просмотр расписания этой команды",
          "Доступ запрещен",
        ),
      );
    }
    if (isStaff) {
      targetTeamId = teamIdFromParams;
    } else {
      targetTeamId = user!.teamId;
    }

    if (!targetTeamId) {
      return next(
        new AppError(
          commonErrorDict.badRequest.name,
          commonErrorDict.badRequest.httpCode,
          "Не указан ID команды",
          "Ошибка при получении расписания",
        ),
      );
    }
    const effectiveQuery = {
      ...req.query,
      teamId: targetTeamId,
    };
    const matchWhere = buildMatchWhereClause(effectiveQuery, organizationId);
    const trainingWhere = buildTrainingWhereClause(
      effectiveQuery,
      organizationId,
    );

    await updateFinishedMatches();

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
        id: m.id,
        title: `Матч: ${m.opponentName}`,
        opponentName: m.opponentName,
        start: m.matchDate,
        type: "MATCH",
        status: m.status,
        extendedProps: {
          location: m.location,
          isHomeGame: m.isHomeGame,
          score: `${m.myScore}:${m.opponentScore}`,
          myScore: m.myScore,
          opponentScore: m.opponentScore,
        },
      })),
      ...trainings.map((t) => ({
        id: t.id,
        title: `Тренировка: ${t.trainingType}`,
        start: t.startTime,
        end: t.endTime,
        type: "TRAINING",
        extendedProps: {
          location: t.location,
          trainingType: t.trainingType,
          coachId: t.coachId,
        },
      })),
    ];
    res.json({
      status: "success",
      results: events.length,
      data: events,
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
